const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function boot({ languages = ['ru-RU'], stored = {}, blocked = false } = {}) {
  const storage = new Map(Object.entries(stored));
  const events = new EventTarget();
  class CustomEvent extends Event {
    constructor(type, { detail }) { super(type); this.detail = detail; }
  }
  const context = {
    document: { documentElement: { lang: 'ru', dataset: {} }, addEventListener() {} },
    navigator: { languages, language: languages[0] },
    localStorage: {
      getItem(key) { if (blocked) throw new Error('Storage blocked'); return storage.get(key) ?? null; },
      setItem(key, value) { if (blocked) throw new Error('Storage blocked'); storage.set(key, value); }
    },
    Event, CustomEvent,
    addEventListener: events.addEventListener.bind(events),
    dispatchEvent: events.dispatchEvent.bind(events)
  };
  context.window = context;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../i18n.js'), 'utf8'), context);
  return { ...context, api: context.SiteI18n, storage };
}

test('auto chooses the first supported browser language and defaults to English', () => {
  assert.equal(boot({ languages: ['de-DE', 'RU-ru', 'en'] }).api.language, 'ru');
  assert.equal(boot({ languages: ['en-GB', 'ru-RU'] }).api.language, 'en');
  assert.equal(boot({ languages: ['fr-FR'] }).api.language, 'en');
  assert.equal(boot({ stored: { 'site-language-mode': 'invalid' } }).api.mode, 'auto');
});

test('manual choice persists even when it matches the currently detected language', () => {
  const app = boot();
  app.api.setMode('ru');
  assert.equal(app.storage.get('site-language-mode'), 'ru');
  app.navigator.languages = ['en-US'];
  app.dispatchEvent(new Event('languagechange'));
  assert.equal(app.api.language, 'ru');
  app.api.setMode('auto');
  assert.equal(app.api.language, 'en');
  assert.equal(app.storage.get('site-language-mode'), 'auto');
});

test('language selection still works when storage is unavailable', () => {
  const app = boot({ blocked: true });
  app.api.setMode('en');
  assert.equal(app.api.language, 'en');
  assert.equal(app.document.documentElement.lang, 'en');
  app.api.setMode('auto');
  assert.equal(app.api.language, 'ru');
});

test('legacy settings migrate and changes from other tabs are applied', () => {
  assert.equal(boot({ stored: { 'etonify-docs-language': 'en' } }).api.language, 'en');
  assert.equal(boot({ stored: { 'site-language-mode': 'auto', 'etonify-docs-language': 'en' } }).api.language, 'ru');
  const app = boot();
  const event = new Event('storage');
  Object.assign(event, { key: 'site-language-mode', newValue: 'en' });
  app.dispatchEvent(event);
  assert.equal(app.api.language, 'en');
});

test('dynamic messages switch language and interpolate text without HTML', () => {
  const app = boot();
  const element = { textContent: '', isConnected: true };
  app.api.bind(element, 'Загружено через {source}.', { source: '<Cataas>' });
  assert.equal(element.textContent, 'Загружено через <Cataas>.');
  app.api.setMode('en');
  assert.equal(element.textContent, 'Loaded from <Cataas>.');
  app.api.setMode('ru');
  assert.equal(element.textContent, 'Загружено через <Cataas>.');
});

test('all Russian text and accessibility labels on the main page have English translations', () => {
  const app = boot({ languages: ['en'] });
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const text = [...html.matchAll(/>([^<>]*[А-Яа-яЁё][^<>]*)</g)].map((match) => match[1].trim());
  const attributes = [...html.matchAll(/(?:aria-label|title|placeholder|alt|content)="([^"]*[А-Яа-яЁё][^"]*)"/g)].map((match) => match[1]);
  const untranslated = [...new Set([...text, ...attributes])]
    .filter((value) => value !== 'Язык' && value !== 'Авто' && /[А-Яа-яЁё]/.test(app.api.t(value)));
  assert.deepEqual(untranslated, []);
});
