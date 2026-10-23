const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
let chromium;
try { ({chromium} = require('playwright')); } catch (_) {}
const root = path.resolve(__dirname, '..');

test('custom language menu supports whole-button clicks, keyboard, outside dismissal and saved choice on desktop and mobile', {skip: !chromium}, async () => {
  const browser = await chromium.launch({channel:'chrome', headless:true});
  try {
    for (const scenario of [{width:1280,motion:'no-preference'},{width:390,motion:'no-preference'},{width:320,motion:'no-preference'},{width:320,motion:'reduce'}]) {
      const {width,motion} = scenario;
      const page = await browser.newPage({locale:'ru-RU', viewport:{width,height:844},reducedMotion:motion});
      const errors=[];
      page.on('pageerror', error=>errors.push(error.message));
      await page.route('**/*', async route=> {
        const url=new URL(route.request().url());
        if(url.hostname!=='site.test') return route.abort();
        const resource=path.resolve(root, `.${url.pathname}`);
        if(!resource.startsWith(root+path.sep)||!fs.existsSync(resource)) return route.abort();
        const type=resource.endsWith('.html')?'text/html':resource.endsWith('.js')?'application/javascript':resource.endsWith('.css')?'text/css':undefined;
        return route.fulfill({path:resource,contentType:type});
      });
      await page.goto('http://site.test/index.html');
      const trigger=page.locator('[data-language-trigger]');
      const menu=page.getByRole('menu',{name:'Язык сайта'});
      assert.equal(await page.locator('[data-language-select]').count(),0);
      await trigger.click({position:{x:12,y:20}});
      assert.equal(await trigger.getAttribute('aria-expanded'),'true');
      await menu.waitFor({state:'visible'});
      assert.equal(await page.getByRole('menuitemradio',{name:'Автоматически',exact:true}).evaluate(el=>document.activeElement===el),true,JSON.stringify(scenario));
      assert.equal(await page.getByRole('menuitemradio',{name:'Автоматически',exact:true}).getAttribute('aria-checked'),'true');
      await page.getByRole('menuitemradio',{name:'English',exact:true}).click();
      assert.equal(await page.locator('html').getAttribute('lang'),'en');
      assert.equal(await trigger.getAttribute('aria-expanded'),'false');
      assert.equal(await trigger.evaluate(el=>document.activeElement===el),true);
      await page.reload();
      assert.equal(await page.locator('html').getAttribute('lang'),'en');
      await trigger.press('ArrowUp');
      assert.equal(await page.getByRole('menuitemradio',{name:'English',exact:true}).evaluate(el=>document.activeElement===el),true);
      await page.keyboard.press('Home');
      await page.keyboard.press('Enter');
      assert.equal(await page.locator('html').getAttribute('lang'),'ru');
      await trigger.press('ArrowDown');
      await page.keyboard.press('End');
      await page.keyboard.press('Escape');
      assert.equal(await trigger.getAttribute('aria-expanded'),'false');
      assert.equal(await trigger.evaluate(el=>document.activeElement===el),true);
      await trigger.press('Space');
      await page.keyboard.press('Tab');
      assert.equal(await trigger.getAttribute('aria-expanded'),'false');
      assert.equal(await page.locator('[data-language-picker]').evaluate(el=>el.contains(document.activeElement)),false);
      await trigger.click();
      await page.mouse.click(8,500);
      assert.equal(await trigger.getAttribute('aria-expanded'),'false');
      const bounds=await trigger.boundingBox();
      assert.ok(bounds.x>=0 && bounds.x+bounds.width<=width);
      assert.deepEqual(errors,[]);
      await page.close();
    }
  } finally { await browser.close(); }
});
