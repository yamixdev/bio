const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function boot({ savedMode = 'auto', tags = ['black', 'white', 'cute', 'sleep', 'kitten', 'orange', 'sleeping cat'], translate = 'sleeping cat', fetchOverride } = {}) {
  const elements = new Map();
  function element() {
    return { value: '', style: {}, dataset: {}, hidden: false, disabled: false, listeners: {}, children: [],
      classList: { toggle() {} }, setAttribute(key, value) { this[key] = value; }, removeAttribute(key) { delete this[key]; },
      addEventListener(name, callback) { this.listeners[name] = callback; }, replaceChildren(...items) { this.children = items; } };
  }
  const radios = ['auto', 'cataas', 'nekos'].map((value) => Object.assign(element(), { value, checked: value === 'auto' }));
  const storage = new Map([['cat-api-mode', savedMode], ['last-cat-source', 'TheCatAPI']]);
  const requests = [];
  const document = {
    getElementById(id) { if (!elements.has(id)) elements.set(id, element()); return elements.get(id); },
    querySelectorAll(selector) { return selector.includes('cat-api') ? radios : []; },
    querySelector() { return radios.find((radio) => radio.checked); },
    createElement: element
  };
  const context = {
    document, AbortController, DOMException, URL, console,
    window: { setTimeout, clearTimeout, localStorage: { removeItem: (key) => storage.delete(key) } },
    safeStorage: { get: (key) => storage.get(key), set: (key, value) => storage.set(key, value) },
    bind(el, message, params = {}, attr) { if (el) el[attr || 'textContent'] = message.replace(/\{(\w+)\}/g, (_, key) => params[key]); },
    t: (message, params = {}) => message.replace(/\{(\w+)\}/g, (_, key) => params[key]),
    fetch: async (url, options) => {
      requests.push(url);
      if (fetchOverride) return fetchOverride(url, options);
      return { ok: true, json: async () => url.includes('/api/tags') ? tags : { responseData: { translatedText: translate } } };
    }
  };
  const source = fs.readFileSync(path.join(__dirname, '../script.js'), 'utf8');
  const code = source.slice(source.indexOf("  const catTerminal ="), source.indexOf('  const lightbox ='));
  vm.runInNewContext(code + '\nthis.api = { normalizeTag, getCatSources, updateCatMode, processCat };', context);
  return { ...context.api, elements, radios, storage, requests, context, select(value) { radios.forEach((radio) => { radio.checked = radio.value === value; }); context.api.updateCatMode(value); } };
}

test('manual whitespace and comma queries retain distinct known tags', async () => {
  const app = boot();
  assert.equal(await app.normalizeTag('black white, cute'), 'black,white,cute');
});

test('full translated known tags are preserved instead of taking only the first word', async () => {
  const app = boot();
  assert.equal(await app.normalizeTag('спящий кот'), 'sleeping cat');
});

test('failed Russian translation rejects without turning the query into random search', async () => {
  const app = boot({ translate: '' });
  await assert.rejects(app.normalizeTag('неизвестный кот'), /перевести|не найден/);
});

test('unknown English phrases reject instead of concatenating words', async () => {
  const app = boot();
  await assert.rejects(app.normalizeTag('space unicorn'), /не найден/);
});

test('tagged searches use only Cataas; random auto falls back to the Nekos photo endpoint', () => {
  const app = boot();
  assert.deepEqual(Array.from(app.getCatSources('auto', 'black'), (source) => source.key), ['cataas']);
  assert.deepEqual(Array.from(app.getCatSources('nekos', 'black'), (source) => source.key), []);
  assert.deepEqual(Array.from(app.getCatSources('auto', ''), (source) => source.key), ['cataas', 'nekos']);
  assert.equal(app.getCatSources('nekos', '')[0].url, 'https://nekos.life/api/v2/img/meow');
});

test('obsolete saved providers migrate to auto and the query survives random-only mode', () => {
  const app = boot({ savedMode: 'wikimedia' });
  assert.equal(app.storage.get('cat-api-mode'), 'auto');
  app.elements.get('cat-search').value = 'black, white';
  app.select('nekos');
  assert.equal(app.elements.get('cat-search').disabled, true);
  assert.equal(app.elements.get('cat-search').value, 'black, white');
  app.select('auto');
  assert.equal(app.elements.get('cat-search').value, 'black, white');
});

test('an empty Cataas result never requests a random fallback', async () => {
  const app = boot({ fetchOverride: async (url) => ({ ok: true, json: async () => url.includes('/api/tags') ? ['black'] : [] }) });
  app.elements.get('cat-search').value = 'black';
  await app.processCat();
  assert.equal(app.requests.filter((url) => !url.includes('/api/tags')).length, 1);
  assert.match(app.elements.get('cat-err-desc').textContent, /ничего не найдено/);
});

test('changing the provider cancels pending work and stale responses cannot update the UI', async () => {
  let release;
  let calls = 0;
  const app = boot({ fetchOverride: () => ++calls === 1
    ? new Promise((resolve) => { release = resolve; })
    : Promise.resolve({ ok: true, json: async () => [] }) });
  const pending = app.processCat();
  await Promise.resolve();
  app.select('nekos');
  release({ ok: true, json: async () => ({ id: 'stale' }) });
  await pending;
  assert.equal(app.elements.get('cat-preview-button').hidden, true);
  assert.equal(app.elements.get('cat-error').style.display, 'none');
  assert.equal(app.elements.get('cat-skeleton').style.display, 'none');
  assert.equal(app.elements.get('btn-cat-next').disabled, false);
  assert.doesNotMatch(app.elements.get('cat-terminal').textContent, /Загружено/);
});

test('late network failures after a mode switch cannot overwrite the cancellation status', async () => {
  let rejectRequest;
  let calls = 0;
  const app = boot({ fetchOverride: () => ++calls === 1
    ? new Promise((_, reject) => { rejectRequest = reject; })
    : Promise.reject(new Error('Network failed')) });
  const pending = app.processCat();
  await Promise.resolve();
  app.select('nekos');
  rejectRequest(new Error('Network failed'));
  await pending;
  assert.match(app.elements.get('cat-terminal').textContent, /Источник изменён/);
});
