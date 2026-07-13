// Copies the two pdf.js files the app needs from node_modules into www/vendor,
// so the packaged app loads pdf.js locally instead of from a CDN (required for offline use).
const fs = require('fs');
const path = require('path');

const pairs = [
  ['node_modules/pdfjs-dist/build/pdf.min.js', 'www/vendor/pdf.min.js'],
  ['node_modules/pdfjs-dist/build/pdf.worker.min.js', 'www/vendor/pdf.worker.min.js']
];

let ok = true;
for (const [src, dest] of pairs) {
  const srcPath = path.join(__dirname, '..', src);
  const destPath = path.join(__dirname, '..', dest);
  if (!fs.existsSync(srcPath)) {
    console.error('Missing:', src, '— did `npm install` finish successfully?');
    ok = false;
    continue;
  }
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.copyFileSync(srcPath, destPath);
  console.log('Copied', src, '->', dest);
}
if (!ok) process.exit(1);
console.log('pdf.js is now bundled locally — the app will work fully offline.');
