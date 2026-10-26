const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const crypto=require('node:crypto');
const {parseDocument,DomUtils}=require('htmlparser2');
const root=path.join(__dirname,'..');
const find=(node,predicate)=>DomUtils.findAll(predicate,node.children||[]);
test('desktop navigation offers content in order and only administration has a submenu',()=>{
 for(const file of ['index.html','gerenciamento.html']){
  const doc=parseDocument(fs.readFileSync(path.join(root,file),'utf8'));
  const nav=find(doc,node=>node.name==='nav'&&node.attribs?.class?.includes('nav-direct'))[0];
  const children=nav.children.filter(node=>node.type==='tag');
  assert.deepEqual(children.map(node=>DomUtils.textContent(node).trim().split(/\s+/).join(' ')),[
   'Culto em Família','Lições Bíblicas','Trilhas','EBF Premium','Treinamentos Premium','Contato',
   'Administração Perfil Quem Somos Contato Gerenciamento'
  ]);
  const menus=children.filter(node=>node.name==='details');
  assert.equal(menus.length,1);
  assert.ok(menus[0].attribs.class.includes('admin-only'));
 }
});
test('mobile bottom navigation and More menu are byte-for-byte unchanged',()=>{
 const current=fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/\r/g,'');
 const mobile=html=>html.slice(html.indexOf('<aside id="mobileMoreSheet"'),html.indexOf('</nav>',html.indexOf('<nav class="mobile-bottom-nav"'))+6);
 assert.equal(crypto.createHash('sha256').update(mobile(current)).digest('hex'),'8e5f3382898638fcfc41288c4b36e5b6e20dca7ed0c67c66e359b7a089afd18f');
});
test('Premium desktop shortcuts retain the existing access check',()=>{
 const source=fs.readFileSync(path.join(root,'app.js'),'utf8');
 assert.match(source,/\["training", "ebf"\]\.includes\(target\) && !canAccessLevel\("prime"\)/);
 const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');
 assert.match(css,/@media \(min-width: 721px\)\s*\{\s*\.topbar:has\(\.nav-direct\)/);
 assert.match(css,/\.topbar \.desktop-account-link \{ display: none !important;/);
});

test('desktop Premium labels sit below aligned menu names without a badge background',()=>{
 const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');
 assert.match(css,/\.nav-direct > \.tab, \.nav-direct > \.nav-menu > summary \{[^}]*flex-direction: column;[^}]*justify-content: flex-start;/);
 assert.match(css,/\.nav-direct small \{[^}]*display: block;[^}]*background: transparent;[^}]*padding: 0;/);
});
