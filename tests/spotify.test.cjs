const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function element() {
  const classes = new Set();
  return {
    textContent: '',
    style: { setProperty(key, value) { this[key] = value; }, removeProperty(key) { delete this[key]; } },
    classList: { add: (value) => classes.add(value), remove: (value) => classes.delete(value), contains: (value) => classes.has(value) },
    setAttribute(key, value) { this[key] = value; },
    removeAttribute(key) { delete this[key]; }
  };
}

function boot() {
  const source = fs.readFileSync(path.join(__dirname, '../script.js'), 'utf8');
  const code = source.slice(source.indexOf('  function formatTime('), source.indexOf('  async function loadInitialLanyardState('));
  let now = 10000;
  let tick;
  let changeLanguage;
  const context = {
    Date: { now: () => now },
    currentSpotify: null, spotifyInterval: 0,
    spotifyWidget: element(), spotifyStatus: element(), spotifySong: element(), spotifyArtist: element(),
    spotifyCover: element(), spotifyProgress: element(), spotifyCurrent: element(), spotifyEnd: element(),
    t: (message, params = {}) => message.replace(/\{(\w+)\}/g, (_, key) => params[key]),
    moveIndicator() {}, document: { querySelector: () => null },
    window: {
      clearInterval() {}, setInterval(fn) { tick = fn; return 1; },
      addEventListener(_, fn) { changeLanguage = fn; }
    }
  };
  vm.runInNewContext(code + '\nthis.update = updateSpotifyUI;', context);
  return { context, tick: () => tick(), changeLanguage: () => changeLanguage(), setTime: (value) => { now = value; } };
}

const track = {
  track_id: '3kdlVcMVsSkbsUy8eQcBjI', song: 'Let Go', artist: 'Ark Patrol; Veronika Redd',
  album_art_url: 'https://i.scdn.co/image/cover', timestamps: { start: 0, end: 180000 }
};

test('the whole playing card has a native track link, artwork, metadata, and duration', () => {
  const { context: app } = boot();
  app.update({ ...track, timestamps: { start: 1000, end: 181000 } });
  assert.equal(app.spotifyWidget.href, 'https://open.spotify.com/track/3kdlVcMVsSkbsUy8eQcBjI');
  assert.equal(app.spotifyWidget.classList.contains('playing'), true);
  assert.equal(app.spotifySong.textContent, 'Let Go');
  assert.equal(app.spotifyArtist.textContent, 'Ark Patrol, Veronika Redd');
  assert.equal(app.spotifyEnd.textContent, '3:00');
  assert.equal(app.spotifyCurrent.textContent, '0:09');
  assert.ok(app.spotifyCover.style.backgroundImage.includes(track.album_art_url));
});

test('progress clamps at the end and switching to idle removes the previous track link', () => {
  const { context: app, setTime, tick } = boot();
  app.update({ ...track, timestamps: { start: 1000, end: 181000 } });
  setTime(500000); tick();
  assert.equal(app.spotifyProgress.style.width, '100%');
  assert.equal(app.spotifyCurrent.textContent, '3:00');
  app.update(null);
  assert.equal(app.spotifyWidget.href, undefined);
  assert.equal(app.spotifyWidget['aria-label'], undefined);
  assert.equal(app.spotifyWidget.classList.contains('idle'), true);
  assert.equal(app.spotifyProgress.style.width, '0%');
});

test('changing interface language preserves the current track and the link', () => {
  const { context: app, changeLanguage } = boot();
  app.update(track);
  app.t = (message) => message === 'Сейчас играет' ? 'Now playing' : message;
  changeLanguage();
  assert.equal(app.spotifyStatus.textContent, 'Now playing');
  assert.equal(app.spotifySong.textContent, 'Let Go');
  assert.equal(app.spotifyWidget.href, 'https://open.spotify.com/track/3kdlVcMVsSkbsUy8eQcBjI');
});
