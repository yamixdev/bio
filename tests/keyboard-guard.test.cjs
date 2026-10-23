const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('only F12 is intercepted; normal navigation and keyboard shortcuts are preserved', () => {
  const listeners = [];
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../keyboard-guard.js'), 'utf8'), {
    document: { addEventListener: (...args) => listeners.push(args) }
  });
  assert.equal(listeners.length, 1);
  assert.equal(listeners[0][0], 'keydown');
  const handler = listeners[0][1];
  for (const key of ['Enter', 'Tab', 'Escape', 'F5', 'c', 'i']) {
    let prevented = false;
    handler({ key, cancelable: true, ctrlKey: true, preventDefault() { prevented = true; } });
    assert.equal(prevented, false, key);
  }
  let prevented = false;
  handler({ key: 'F12', cancelable: true, preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
});
