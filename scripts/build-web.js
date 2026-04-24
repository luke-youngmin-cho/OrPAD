// Builds the FormatPad web app into docs/ (GitHub Pages target).
//
// Inputs:
//   src/web/entry.js              — installs the browser adapter then imports the renderer
//   src/renderer/index.html       — desktop HTML shell (rewritten for web)
//   src/renderer/styles/*.css     — style assets
//   src/renderer/formatpad-mark.png — welcome-screen icon
//
// Output tree in docs/:
//   docs/index.html
//   docs/renderer.js        (bundled JS)
//   docs/styles/base.css
//   docs/styles/katex.min.css
//   docs/formatpad-mark.png
//   docs/.nojekyll

const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'docs');

function emptyDir(dir) {
  if (!fs.existsSync(dir)) { fs.mkdirSync(dir, { recursive: true }); return; }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) fs.rmSync(p, { recursive: true, force: true });
    else fs.unlinkSync(p);
  }
}

function copyFile(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

function buildIndexHtml(srcHtml) {
  let html = fs.readFileSync(srcHtml, 'utf-8');

  // Mirror the renderer CSP for the web build. connect-src allows https://* to
  // support the planned P1-7 URL-open feature (formatpad.io/edit?src=<url>).
  html = html.replace(
    /<meta http-equiv="Content-Security-Policy" content="[^"]+">/,
    '<meta http-equiv="Content-Security-Policy" content="' +
      "default-src 'self'; " +
      "script-src 'self'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: blob:; " +
      "font-src 'self' data:; " +
      "connect-src 'self' https://*; " +
      "worker-src 'self' blob:; " +
      "frame-src 'none'; " +
      "object-src 'none'; " +
      "base-uri 'none'; " +
      "form-action 'none';" +
    '">'
  );

  // Desktop build loads dist/renderer.js from two levels up; web build colocates.
  html = html.replace(
    /<script src="\.\.\/\.\.\/dist\/renderer\.js"><\/script>/,
    '<script src="renderer.js"></script>'
  );

  return html;
}

function main() {
  const minify = process.argv.includes('--minify');

  console.log('FormatPad web build → ' + path.relative(ROOT, OUT));
  emptyDir(OUT);

  // Bundle the renderer + adapter.
  esbuild.buildSync({
    entryPoints: [path.join(ROOT, 'src/web/entry.js')],
    bundle: true,
    outfile: path.join(OUT, 'renderer.js'),
    platform: 'browser',
    format: 'iife',
    minify,
    sourcemap: false,
    target: ['chrome120', 'firefox115', 'safari17', 'edge120'],
    loader: { '.css': 'text', '.png': 'dataurl' },
    define: {
      'process.env.NODE_ENV': minify ? '"production"' : '"development"',
      'process.env.PLAUSIBLE_DOMAIN': JSON.stringify(process.env.PLAUSIBLE_DOMAIN || ''),
      'process.env.APP_VERSION': JSON.stringify(require('../package.json').version),
    },
  });

  // HTML shell
  fs.writeFileSync(
    path.join(OUT, 'index.html'),
    buildIndexHtml(path.join(ROOT, 'src/renderer/index.html')),
    'utf-8'
  );

  // Styles
  const stylesDir = path.join(ROOT, 'src/renderer/styles');
  for (const name of fs.readdirSync(stylesDir)) {
    if (name.endsWith('.css')) {
      copyFile(path.join(stylesDir, name), path.join(OUT, 'styles', name));
    }
  }

  // Welcome icon
  copyFile(
    path.join(ROOT, 'src/renderer/formatpad-mark.png'),
    path.join(OUT, 'formatpad-mark.png')
  );

  // GitHub Pages: don't run through Jekyll
  fs.writeFileSync(path.join(OUT, '.nojekyll'), '', 'utf-8');

  const sizeKb = (fs.statSync(path.join(OUT, 'renderer.js')).size / 1024).toFixed(0);
  console.log(`  renderer.js  ${sizeKb} KB${minify ? ' (minified)' : ''}`);
  console.log('FormatPad web build complete.');
}

main();
