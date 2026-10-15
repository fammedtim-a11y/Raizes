const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const { parseDocument, DomUtils } = require('htmlparser2');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'gerenciamento.html'), 'utf8');
const source = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const doc = parseDocument(html);
const byId = id => DomUtils.findOne(node => node.attribs?.id === id, doc.children, true);
const descendants = (node, predicate) => DomUtils.findAll(predicate, node.children || []);

test('lesson editor retains all original fields and actions', () => {
  const form = byId('lessonForm');
  for (const id of ['lessonId', 'titleInput', 'categoryInput', 'ageInput', 'verseInput', 'cardImageInput', 'activityImageInput', 'sectionFields', 'clearFormBtn', 'duplicateLessonBtn', 'deleteLessonBtn', 'savePrevLessonBtn', 'saveNextLessonBtn']) {
    assert.ok(descendants(form, node => node.attribs?.id === id).length, id);
  }
  assert.equal((source.slice(source.indexOf('const SECTIONS ='), source.indexOf('];', source.indexOf('const SECTIONS ='))).match(/\["/g) || []).length, 11);
});

test('tab controls reference unique, accessible panels', () => {
  const ids = descendants(doc, node => Boolean(node.attribs?.id)).map(node => node.attribs.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const tab of descendants(byId('lessonManagePanel'), node => node.attribs?.role === 'tab')) {
    const panel = byId(tab.attribs['aria-controls']);
    assert.equal(panel?.attribs.role, 'tabpanel');
    assert.equal(panel.attribs['aria-labelledby'], tab.attribs.id);
  }
});

test('communication and automation are in their own navigation group, never inside lessons', () => {
  const lesson = byId('lessonManagePanel');
  assert.equal(descendants(lesson, node => ['communicationManagePanel', 'automationManagePanel'].includes(node.attribs?.id)).length, 0);
  const nav = descendants(doc, node => node.name === 'nav' && node.attribs?.['aria-label'] === 'Seções administrativas')[0];
  for (const name of ['communication', 'automation']) {
    const button = descendants(nav, node => node.attribs?.['data-manage-tab'] === name)[0];
    let group = button.parent;
    while (group && group.name !== 'details') group = group.parent;
    assert.match(DomUtils.textContent(group), /Relacionamento/);
    assert.doesNotMatch(DomUtils.textContent(group), /Pessoas/);
  }
  const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
  assert.match(css, /#manageView > \.manage-panel\[hidden\]\s*\{\s*display:\s*none !important/);
});

test('workspace switching hides other panels without resetting editor values', () => {
  const state = {manageTab:'lessons'};
  const panels = Object.fromEntries(['library','editor','export'].map(key => [key, {hidden:false}]));
  const tabs = Object.keys(panels).map(key => ({dataset:{lessonWorkspace:key},setAttribute(name,value){this[name]=value;},getAttribute(){return key;}}));
  const title = {value:'Draft that must not be lost'};
  const context = vm.createContext({state, document:{querySelectorAll:()=>tabs,getElementById:id=>panels[id]},isAdminPage:true,els:{title,filterToolbar:{classList:{toggle(){}}}},updateLessonEditorMeta(){}});
  vm.runInContext(source.slice(source.indexOf('function setLessonWorkspace('),source.indexOf('function setLessonEditorStep(')),context);
  context.setLessonWorkspace('editor');
  assert.equal(panels.editor.hidden,false);
  assert.equal(panels.library.hidden,true);
  context.setLessonWorkspace('export');
  assert.equal(panels.editor.hidden,true);
  assert.equal(panels.export.hidden,false);
  assert.equal(title.value,'Draft that must not be lost');
});

test('dashboard uses the existing video and notification helpers', () => {
  const code = source.slice(source.indexOf('async function renderAdminDashboard('),source.indexOf('window.renderAdminDashboard'));
  assert.match(code,/allVideos\(\)/);
  assert.match(code,/activeNotifications\(\)/);
  assert.doesNotMatch(code,/getTrailVideos|getVisibleNotifications/);
});
