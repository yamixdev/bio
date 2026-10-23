const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {once}=require('node:events');
let chromium;
try {({chromium}=require('playwright'));} catch (_) {}

test('local CSS and JS URLs match their content versions',()=>{
  const root=path.resolve(__dirname,'..');
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  for(const [,url] of html.matchAll(/<(?:link|script)\b[^>]*\b(?:href|src)="([^"]+)"/g)){
    if(/^(?:[a-z]+:|\/\/)/i.test(url)) continue;
    const [filename,query]=url.split('?');
    if(!/\.(css|js)$/.test(filename)) continue;
    const source=fs.readFileSync(path.join(root,filename),'utf8').replace(/\r\n/g,'\n');
    const expected=require('node:crypto').createHash('sha256').update(source).digest('hex').slice(0,12);
    assert.equal(new URLSearchParams(query).get('v'),expected,`Run node scripts/version-assets.cjs after editing ${filename}`);
  }
});

test('a returning visitor gets current CSS and JS despite a fresh cached previous version', {skip:!chromium},async()=>{
  const root=path.resolve(__dirname,'..');
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const css=html.match(/href="(style\.css[^\"]*)"/)[1];
  const js=html.match(/src="(keyboard-guard\.js[^\"]*)"/)[1];
  let updated=false;
  const requests=[];
  const server=http.createServer((request,response)=>{
    const url=new URL(request.url,'http://fixture.test');
    if(url.pathname==='/bio/'){
      response.setHeader('Cache-Control','no-store');
      response.setHeader('Content-Type','text/html');
      response.end(`<link rel="stylesheet" href="${updated?css:'style.css'}"><script src="${updated?js:'keyboard-guard.js'}"></script><span class="archive-badge">Archive</span><span class="soft-release-state">Checked</span><p class="cat-search-hint">Search hint</p><span class="icon-fallback">VK</span>`);
      return;
    }
    requests.push(request.url);
    response.setHeader('Cache-Control','public, max-age=31536000');
    if(url.pathname==='/bio/style.css'){
      response.setHeader('Content-Type','text/css');
      response.end(updated?fs.readFileSync(path.join(root,'style.css')):'body {font-size: 16px}');
    } else if(url.pathname==='/bio/keyboard-guard.js'){
      response.setHeader('Content-Type','text/javascript');
      response.end(updated?fs.readFileSync(path.join(root,'keyboard-guard.js')):'/* Previous cached script. */');
    } else {response.statusCode=404;response.end();}
  });
  server.listen(0,'127.0.0.1');
  await once(server,'listening');
  let browser;
  try {
    browser=await chromium.launch({channel:'chrome',headless:true});
    const page=await browser.newPage();
    const url=`http://127.0.0.1:${server.address().port}/bio/`;
    await page.goto(url);
    assert.equal(await page.locator('.archive-badge').evaluate(el=>getComputedStyle(el).fontSize),'16px');
    updated=true;
    await page.goto(url);
    const styles=await page.evaluate(()=>({
      badge:getComputedStyle(document.querySelector('.archive-badge')).fontSize,
      state:getComputedStyle(document.querySelector('.soft-release-state')).fontSize,
      hint:getComputedStyle(document.querySelector('.cat-search-hint')).fontSize,
      fallback:getComputedStyle(document.querySelector('.icon-fallback')).position,
      f12Blocked:!document.dispatchEvent(new KeyboardEvent('keydown',{key:'F12',cancelable:true}))
    }));
    assert.deepEqual(styles,{badge:'9.28px',state:'9.76px',hint:'12px',fallback:'absolute',f12Blocked:true});
    assert.ok(requests.includes(`/bio/${css}`));
    assert.ok(requests.includes(`/bio/${js}`));
    assert.equal(requests.filter(url=>url==='/bio/style.css').length,1);
    assert.equal(requests.filter(url=>url==='/bio/keyboard-guard.js').length,1);
  } finally {
    await browser?.close();
    await new Promise(resolve=>server.close(resolve));
  }
});
