'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const entry = path.join(root, 'index.html');
const html = fs.readFileSync(entry, 'utf8');
const updated = html.replace(/(<(?:link|script)\b[^>]*\b(?:href|src)=")([^\"]+)(")/g, (match, before, url, after) => {
  if (/^(?:[a-z]+:|\/\/)/i.test(url)) return match;
  const filename = url.split(/[?#]/)[0];
  if (!/\.(css|js)$/.test(filename)) return match;
  const file = path.resolve(root, filename);
  if (!file.startsWith(root + path.sep)) throw new Error('Asset outside project: ' + filename);
  const source = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const version = createHash('sha256').update(source).digest('hex').slice(0, 12);
  return `${before}${filename}?v=${version}${after}`;
});
if (updated !== html) fs.writeFileSync(entry, updated);
