const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const sharp = require('sharp');
const {isPaymentImageSource} = require('../export-policy');
const {exportContent} = require('../content-export');

test('payment images are identified without rejecting ordinary educational images',()=>{
  for(const source of ['/uploads/payment-qr-abc.png','/uploads/pix-qr.png','/uploads/qr-pagamento.png','/uploads/qr_pix.jpg']) assert.equal(isPaymentImageSource(source),true);
  assert.equal(isPaymentImageSource('https://raizeskids.com/uploads/custom.png?v=3','/uploads/custom.png'),true);
  assert.equal(isPaymentImageSource('/uploads/card.png'),false);
  assert.equal(isPaymentImageSource('/uploads/bible-qr-activity.png'),false);
  assert.equal(isPaymentImageSource(''),false);
});

function mediaCount(buffer,format){
  if(format==='pdf')return (buffer.toString('latin1').match(/\/Subtype\s*\/Image\b/g)||[]).length;
  let count=0;
  for(let i=0;i<buffer.length-46;i++){
    if(buffer.readUInt32LE(i)!==0x02014b50)continue;
    const name=buffer.subarray(i+46,i+46+buffer.readUInt16LE(i+28)).toString();
    if(name.startsWith('word/media/')&&!name.endsWith('/'))count++;
  }
  return count;
}

test('PDF and DOCX exclude payment images from cover and activities individually and in batches',async()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'raizes-export-policy-'));
  try{
    const uploadDir=path.join(dir,'uploads');fs.mkdirSync(uploadDir);
    const image=await sharp({create:{width:40,height:40,channels:3,background:'#ff3366'}}).png().toBuffer();
    fs.writeFileSync(path.join(uploadDir,'custom.png'),image);
    fs.writeFileSync(path.join(uploadDir,'copy.png'),image);
    const options={root:path.join(__dirname,'..'),uploadDir,info:{paymentQrImage:'/uploads/custom.png'}};
    for(const type of ['lesson','devotional'])for(const format of ['pdf','docx']){
      const items=[{title:'Conteúdo preservado',cardImage:'/uploads/custom.png',activityImage:'/uploads/copy.png',sections:{bibleLesson:'Texto da lição',devotional:'Texto do culto'}}];
      const before=JSON.stringify(items);
      for(const selected of [items,[...items,{...items[0],title:'Segundo conteúdo'}]]){
        const output=await exportContent(type,selected,format,options);
        assert.equal(mediaCount(output,format),1,`${type} ${format} batch ${selected.length}: only the logo may remain`);
      }
      assert.equal(JSON.stringify(items),before);
    }
    const normal=await exportContent('lesson',[{title:'Imagem educativa',activityImage:'/uploads/custom.png',sections:{activity:'Colorir'}}],'pdf',{...options,info:{}});
    assert.equal(mediaCount(normal,'pdf'),2,'educational images are preserved');
    const missing=await exportContent('devotional',[{title:'Sem QR',activityImage:'/uploads/payment-qr-missing.png'}],'pdf',{...options,info:{}});
    assert.equal(mediaCount(missing,'pdf'),1,'known payment files are skipped before reading');
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
});

test('browser print isolates the document and protects payment previews',()=>{
  const root=path.join(__dirname,'..');
  const css=fs.readFileSync(path.join(root,'print.css'),'utf8');
  assert.match(css,/body\.print-v2 > :not\(#ebookPrintArea\)/);
  for(const selector of ['#paymentQrPreview','#salesPaymentQr','.upgrade-payment-dialog'])assert.ok(css.includes(selector));
  for(const page of ['index.html','gerenciamento.html']){
    const html=fs.readFileSync(path.join(root,page),'utf8');
    assert.ok(html.indexOf('src="export-policy.js')<html.indexOf('src="app.js'));
  }
});
