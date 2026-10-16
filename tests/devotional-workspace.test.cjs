const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const {parseDocument, DomUtils} = require('htmlparser2');
const root = path.join(__dirname,'..');
const doc = parseDocument(fs.readFileSync(path.join(root,'gerenciamento.html'),'utf8'));
const source = fs.readFileSync(path.join(root,'app.js'),'utf8');
const nodes = predicate => DomUtils.findAll(predicate,doc.children);
const byId = id => nodes(node=>node.attribs?.id===id)[0];

test('all original devotional fields remain within the same form',()=>{
  const fields = DomUtils.findAll(node=>Boolean(node.attribs?.name),byId('devotionalForm').children).map(node=>node.attribs.name);
  const expected = ['id','title','category','season','familyFeatured','createdMonth','principle','bibleText','verse','cardImageFile','removeCardImage','activityImageFile','removeActivityImage','devotional','prayer','activity','conversation','weeklyPractice','parentNotes'];
  assert.deepEqual(fields.sort(),expected.sort());
});

test('devotional tabs point to accessible panels and batch export is outside the editor',()=>{
  for (const tab of nodes(node=>node.attribs?.['data-devotional-workspace'] || node.attribs?.['data-devotional-step'])) {
    const panel = byId(tab.attribs['aria-controls']);
    assert.equal(panel.attribs.role,'tabpanel');
    assert.equal(panel.attribs['aria-labelledby'],tab.attribs.id);
  }
  const form = byId('devotionalForm');
  assert.equal(DomUtils.findAll(node=>node.attribs?.id==='downloadDevotionalSelection',form.children).length,0);
  assert.ok(byId('downloadDevotionalSelection'));
});

test('switching devotional workspaces does not reset or save the draft',()=>{
  const panels = Object.fromEntries(['library','editor','export'].map(key=>[key,{hidden:false}]));
  const tabs = Object.keys(panels).map(key=>({dataset:{devotionalWorkspace:key},setAttribute(name,value){this[name]=value;},getAttribute(){return key;}}));
  const context = vm.createContext({state:{},document:{querySelectorAll:()=>tabs,getElementById:id=>panels[id]},updateDevotionalEditorMeta(){}});
  vm.runInContext(source.slice(source.indexOf('function setDevotionalWorkspace('),source.indexOf('function setDevotionalEditorStep(')),context);
  context.setDevotionalWorkspace('editor');
  assert.equal(panels.editor.hidden,false);
  context.setDevotionalWorkspace('export');
  assert.equal(panels.editor.hidden,true);
  assert.equal(panels.export.hidden,false);
  assert.equal(tabs.filter(tab=>tab['aria-selected']==='true').length,1);
});

test('PDF footer uses the requested copyright notice',()=>{
  const exporter = fs.readFileSync(path.join(root,'content-export.js'),'utf8');
  assert.ok(exporter.includes('Raízes Kids · Direitos autorais protegidos pela CF art. 5º, XXVII e pela Lei nº 9.610/1998 (LDA)'));
  assert.ok(!exporter.includes('Uso autorizado'));
});
