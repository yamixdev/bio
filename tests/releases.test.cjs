const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const REPO = 'yamixdev/Etonify';
const payload = (tag = '0.3.9') => ({ tag_name: tag, name: `Release ${tag}`, body: `Changes ${tag}`, published_at: '2026-10-20T08:02:38Z', html_url: `https://github.com/${REPO}/releases/tag/${tag}`, draft: false, prerelease: false });

function boot({ fetcher, stored = {}, blocked = false, buttons = [] } = {}) {
  const storage = new Map(Object.entries(stored));
  const calls = [];
  const timers = new Map();
  let timerId = 0;
  let now = Date.parse('2026-10-22T19:00:00Z');
  class Clock extends Date { static now() { return now; } }
  const context = {
    Date: Clock, URL, AbortController,
    setTimeout: (callback, delay) => { const id = ++timerId; timers.set(id, { callback, at: now + delay }); return id; },
    clearTimeout: id => timers.delete(id),
    document: { documentElement: { lang: 'en' }, querySelectorAll: selector => selector === '[data-release-retry]' ? buttons : [], addEventListener() {} },
    localStorage: { getItem(k) { if (blocked) throw Error(); return storage.get(k) ?? null; }, setItem(k, v) { if (blocked) throw Error(); storage.set(k, v); } },
    fetch: async (...args) => { calls.push(args); return fetcher ? fetcher(...args) : { ok: true, json: async () => payload() }; },
    addEventListener() {},
  };
  context.window = context;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../releases.js'), 'utf8'), context);
  return { api: context.SiteReleases, calls, storage, now: () => now, advance: ms => {
    now += ms;
    for (const [id, timer] of [...timers]) if (timer.at <= now) { timers.delete(id); timer.callback(); }
  } };
}

const failureResponse = (status, headers = {}) => ({ ok: false, status, headers: { get: key => headers[key] ?? null } });
const refreshButton = () => ({ dataset: { releaseRetry: REPO }, disabled: false, attributes: {}, setAttribute(key, value) { this.attributes[key] = value; } });

test('one stable release response supplies version, date, URL and changelog together', async () => {
  const app = boot();
  const result = await app.api.load(REPO);
  assert.equal(result.status, 'fetched');
  assert.equal(result.release.tagName, '0.3.9');
  assert.equal(result.release.body, 'Changes 0.3.9');
  assert.equal(result.release.publishedAt, payload().published_at);
  assert.equal(result.release.url, payload().html_url);
  assert.equal(app.calls[0][0], `https://api.github.com/repos/${REPO}/releases/latest`);
  assert.equal(app.calls[0][1].headers.Authorization, undefined);
});

test('fresh persistent cache avoids network; expiration refetches and offline shows stale data', async () => {
  const first = boot();
  await first.api.load(REPO);
  const app = boot({ stored: Object.fromEntries(first.storage), fetcher: async () => { throw Error('offline'); } });
  assert.equal((await app.api.load(REPO)).status, 'cached');
  assert.equal(app.calls.length, 0);
  app.advance(app.api.CACHE_TTL + 1);
  const stale = await app.api.load(REPO);
  assert.equal(stale.status, 'stale');
  assert.equal(stale.release.tagName, '0.3.9');
  assert.equal(stale.error, 'network');
  assert.equal(app.calls.length, 1);
});

test('requests are deduplicated and force refresh replaces the complete cached record', async () => {
  let count = 0;
  const app = boot({ fetcher: async () => ({ ok: true, json: async () => payload(++count === 1 ? '0.3.9' : '0.4.0') }) });
  await Promise.all([app.api.load(REPO), app.api.load(REPO)]);
  assert.equal(app.calls.length, 1);
  const result = await app.api.load(REPO, { force: true });
  assert.equal(result.release.tagName, '0.4.0');
  assert.equal(result.release.body, 'Changes 0.4.0');
  assert.equal(result.release.url, payload('0.4.0').html_url);
});

test('untrusted repositories, cross-repo URLs, prereleases, drafts and invalid dates fail closed', async () => {
  const app = boot();
  await assert.rejects(app.api.load('../other/repo'));
  await assert.rejects(app.api.load('attacker/repo'));
  assert.equal(app.calls.length, 0);
  for (const override of [{ html_url: 'javascript:alert(1)' }, { html_url: 'https://github.com/attacker/repo/releases/tag/x' }, { prerelease: true }, { draft: true }, { published_at: 'bad' }]) {
    const invalid = boot({ fetcher: async () => ({ ok: true, json: async () => ({ ...payload(), ...override }) }) });
    assert.equal((await invalid.api.load(REPO)).status, 'error');
  }
});

test('403/404/429, malformed response and blocked storage preserve an official fallback', async () => {
  for (const status of [403, 404, 429]) {
    const app = boot({ fetcher: async () => ({ ok: false, status }) });
    const result = await app.api.load(REPO);
    assert.equal(result.status, 'error');
    assert.equal(result.release, null);
    assert.equal(result.error, String(status));
    assert.equal(result.fallbackUrl, `https://github.com/${REPO}/releases/latest`);
  }
  assert.equal((await boot({ blocked: true }).api.load(REPO)).status, 'fetched');
  assert.equal((await boot({ fetcher: async () => ({ ok: true, json: async () => { throw Error(); } }) }).api.load(REPO)).status, 'error');
});

test('429 cooldown honors Retry-After, cannot be forced, spans repositories and survives reload', async () => {
  const app = boot({ fetcher: async () => failureResponse(429, { 'retry-after': '90' }) });
  const result = await app.api.load(REPO);
  assert.equal(result.retryAt, app.now() + 90000);
  await app.api.load(REPO, { force: true });
  await app.api.load('yamixdev/vk-desktop', { force: true });
  assert.equal(app.calls.length, 1);
  const reload = boot({ stored: Object.fromEntries(app.storage) });
  assert.equal((await reload.api.load(REPO, { force: true })).error, '429');
  assert.equal(reload.calls.length, 0);
  reload.advance(90001);
  assert.equal((await reload.api.load(REPO, { force: true })).status, 'fetched');
  assert.equal(reload.calls.length, 1);
});

test('rate limits support HTTP-date Retry-After and exhausted primary reset headers', async () => {
  for (const [status, headers, wait] of [
    [429, { 'retry-after': 'Thu, 22 Oct 2026 19:02:00 GMT' }, 120000],
    [403, { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': String(Date.parse('2026-10-22T19:03:00Z') / 1000) }, 180000],
    [429, { 'retry-after': '10', 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': String(Date.parse('2026-10-22T19:03:00Z') / 1000) }, 180000],
    [429, {}, 60000],
  ]) {
    const app = boot({ fetcher: async () => failureResponse(status, headers) });
    assert.equal((await app.api.load(REPO)).retryAt, app.now() + wait);
  }
});

test('repeated rate limits back off; cooldown countdown re-enables header controls without a request', async () => {
  const button = refreshButton();
  const app = boot({ buttons: [button], fetcher: async () => failureResponse(429) });
  await app.api.refresh(REPO, { force: true });
  assert.equal(button.disabled, true);
  assert.equal(button.attributes['aria-busy'], 'false');
  assert.match(button.title, /60s/);
  app.advance(30000);
  assert.match(button.title, /30s/);
  app.advance(30001);
  assert.equal(button.disabled, false);
  assert.equal(app.calls.length, 1);
  assert.equal((await app.api.load(REPO, { force: true })).retryAt, app.now() + 120000);
});

test('concurrent refreshes share a request and keep every header spinner busy until settlement', async () => {
  const buttons = [refreshButton(), refreshButton()];
  let resolve;
  const app = boot({ buttons, fetcher: () => new Promise(done => { resolve = done; }) });
  const first = app.api.refresh(REPO, { force: true });
  const second = app.api.refresh(REPO, { force: true });
  assert.equal(app.calls.length, 1);
  for (const button of buttons) {
    assert.equal(button.disabled, true);
    assert.equal(button.attributes['aria-busy'], 'true');
    assert.match(button.title, /Checking/);
  }
  resolve({ ok: true, json: async () => payload() });
  await Promise.all([first, second]);
  for (const button of buttons) {
    assert.equal(button.disabled, false);
    assert.equal(button.attributes['aria-busy'], 'false');
  }
});

test('empty release body remains a valid release with an explicit empty-notes UI', async () => {
  const app = boot({ fetcher: async () => ({ ok: true, json: async () => ({ ...payload(), body: null }) }) });
  const result = await app.api.load(REPO);
  assert.equal(result.status, 'fetched');
  assert.equal(result.release.body, '');
});

let chromium;
try { ({ chromium } = require('playwright')); } catch (_) {}
test('real browser Markdown supports GFM and strips executable markup, unsafe links and remote images', { skip: !chromium && 'Set NODE_PATH to the bundled Playwright directory to run browser security coverage' }, async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage();
    for (const file of ['vendor/marked.min.js', 'vendor/purify.min.js', 'releases.js']) {
      await page.addScriptTag({ path: path.join(__dirname, '..', file) });
    }
    const output = await page.evaluate(() => {
      const markdown = '# Heading\n\n- One\n- Two\n\n> Quote\n\n```js\nconst x = 1;\n```\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n[Good](https://example.com) [Bad](javascript:alert(1))\n\n![remote](https://attacker.invalid/track)\n\n<script>alert(1)</script><img src="x" onerror="alert(1)"><a href="java&#x73;cript:alert(1)" onclick="alert(1)">x</a><iframe src="https://attacker.invalid"></iframe><svg onload="alert(1)"></svg>';
      const node = document.createElement('div');
      node.innerHTML = window.SiteReleases.renderMarkdown(markdown);
      return { html: node.innerHTML, tags: ['h1', 'li', 'blockquote', 'pre code', 'table'].map(s => Boolean(node.querySelector(s))), bad: node.querySelectorAll('script,img,iframe,svg,[onclick],[onerror],[onload]').length, links: [...node.querySelectorAll('a[href]')].map(a => a.getAttribute('href')) };
    });
    assert.deepEqual(output.tags, [true, true, true, true, true]);
    assert.equal(output.bad, 0);
    assert.deepEqual(output.links, ['https://example.com']);
    await page.evaluate(() => { document.body.innerHTML = '<button data-tab="software">Software</button><header><button data-release-retry="yamixdev/Etonify"><svg class="release-refresh-icon"></svg></button><a data-release-link="yamixdev/Etonify">Open release</a></header><span data-release-version="yamixdev/Etonify"></span><time data-release-date="yamixdev/Etonify"></time><section data-release-panel="yamixdev/Etonify"></section>'; });
    await page.evaluate(() => {
      window.fetchCount = 0;
      window.fetch = async () => { window.fetchCount++; return { ok: true, json: async () => ({ tag_name: '0.4.0', name: 'Release 0.4.0', body: null, published_at: '2026-10-22T08:00:00Z', html_url: 'https://github.com/yamixdev/Etonify/releases/tag/0.4.0', draft: false, prerelease: false }) }; };
    });
    assert.equal(await page.evaluate(() => window.fetchCount), 0);
    await page.locator('[data-tab="software"]').click();
    await page.waitForFunction(() => document.querySelector('[data-release-version]').textContent === '0.4.0', null, { timeout: 3000 });
    assert.equal(await page.evaluate(() => window.fetchCount), 1);
    assert.match(await page.locator('[data-release-panel]').textContent(), /did not provide release notes/);
    assert.equal(await page.locator('[data-release-link]').getAttribute('href'), 'https://github.com/yamixdev/Etonify/releases/tag/0.4.0');
    assert.equal(await page.locator('[data-release-panel] .release-version').textContent(), '0.4.0');
    assert.equal(await page.locator('[data-release-panel] .release-actions').count(), 0);
    assert.equal(await page.getByRole('link', { name: 'Open release', exact: true }).count(), 1);
    await page.evaluate(async () => { window.fetch = async () => ({ ok: false, status: 429 }); await window.SiteReleases.refresh('yamixdev/Etonify', { force: true }); });
    assert.match(await page.locator('[data-release-panel]').textContent(), /Stale cache.*Current data is unavailable/);
    assert.match(await page.locator('[data-release-panel]').textContent(), /GitHub has limited requests/);
    assert.equal(await page.locator('[data-release-version]').textContent(), '0.4.0');
    await page.evaluate(() => { document.documentElement.lang = 'ru'; window.dispatchEvent(new CustomEvent('site-language-change', { detail: { language: 'ru' } })); });
    assert.match(await page.locator('[data-release-panel]').textContent(), /Устаревший кеш/);
  } finally { await browser.close(); }
});

test('Etonify opens a responsive software modal with one release link and keyboard-safe refresh', {skip: !chromium}, async () => {
  const browser = await chromium.launch({channel:'chrome',headless:true});
  try {
    for (const width of [1280,390,320]) {
      const page = await browser.newPage({viewport:{width,height:844},locale:'en-US',reducedMotion:'reduce'});
      const errors=[];
      let calls=0;
      page.on('pageerror',error=>errors.push(error.message));
      await page.route('**/*',async route=>{
        const url=new URL(route.request().url());
        if(url.hostname==='api.github.com') {
          const repo=url.pathname.match(/^\/repos\/(.+)\/releases\/latest$/)?.[1];
          if(repo===REPO) calls++;
          return route.fulfill({json:{...payload(),html_url:`https://github.com/${repo}/releases/tag/0.3.9`}});
        }
        if(url.hostname!=='site.test') return route.abort();
        const root=path.resolve(__dirname,'..')+path.sep;
        const file=path.resolve(root,`.${url.pathname}`);
        if(!file.startsWith(root)||!fs.existsSync(file)) return route.fulfill({status:404});
        const type=({'.js':'text/javascript','.html':'text/html','.css':'text/css','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream';
        return route.fulfill({path:file,contentType:type});
      });
      await page.goto('http://site.test/index.html');
      assert.equal(calls,0);
      await page.getByRole('tab',{name:'Apps',exact:true}).click();
      const card=page.locator('[data-modal="modal-etonify"]');
      await card.click();
      const modal=page.locator('#modal-etonify');
      await page.waitForFunction(()=>document.querySelector('#modal-etonify .release-version')?.textContent==='0.3.9',null,{timeout:5000});
      assert.equal(calls,1);
      assert.equal(new URL(page.url()).pathname,'/index.html');
      assert.equal(await modal.getAttribute('aria-hidden'),'false');
      assert.equal(await modal.locator('.release-version').textContent(),'0.3.9');
      assert.equal(await modal.locator('[data-release-link]').count(),1);
      assert.equal(await modal.locator('[data-release-link]').getAttribute('href'),payload().html_url);
      assert.match(await modal.innerText(),/Android 8.0\+/);
      const bounds=await modal.boundingBox();
      assert.ok(bounds.x>=0&&bounds.x+bounds.width<=width+1);
      const retry=modal.locator('[data-release-retry]');
      await page.evaluate(()=>{window.fetch=()=>new Promise(resolve=>{window.finishRelease=()=>resolve({ok:true,json:async()=>({tag_name:'0.3.9',body:'Updated changes',published_at:'2026-10-20T08:02:38Z',html_url:'https://github.com/yamixdev/Etonify/releases/tag/0.3.9',draft:false,prerelease:false})});});});
      await retry.focus();
      await page.keyboard.press('Enter');
      await page.waitForFunction(()=>typeof window.finishRelease==='function');
      assert.equal(await retry.getAttribute('aria-busy'),'true');
      assert.equal(await retry.isDisabled(),true);
      assert.equal(await retry.locator('.material-symbols-rounded').textContent(),'refresh');
      await modal.locator('.modal-close').focus();
      await page.evaluate(()=>window.finishRelease());
      await page.waitForFunction(()=>document.querySelector('#modal-etonify [data-release-panel]').getAttribute('aria-busy')==='false');
      assert.equal(await retry.isEnabled(),true);
      assert.equal(await modal.locator('.modal-close').evaluate(el=>el===document.activeElement),true);
      await page.keyboard.press('Escape');
      await page.waitForFunction(()=>document.querySelector('[data-modal="modal-etonify"]')===document.activeElement);
      assert.deepEqual(errors,[]);
      await page.close();
    }
  } finally {await browser.close();}
});
