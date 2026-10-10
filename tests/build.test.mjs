import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

const output = resolve('dist');
function htmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((item) => {
    const path = join(directory, item.name);
    return item.isDirectory()
      ? htmlFiles(path)
      : item.name.endsWith('.html')
        ? [path]
        : [];
  });
}
test('All seven page types are generated with Turkish document metadata', () => {
  for (const path of [
    'index.html',
    'topluluk/index.html',
    'etkinlikler/index.html',
    'etkinlikler/birlikte-uret/index.html',
    'yazilar/index.html',
    'ekip/index.html',
    'katil/index.html',
  ]) {
    const html = readFileSync(join(output, path), 'utf8');
    assert.match(html, /lang="tr"/);
    assert.match(html, /name="description"/);
    assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1, path);
  }
});
test('Every generated internal page link and fragment resolves', () => {
  for (const file of htmlFiles(output)) {
    const html = readFileSync(file, 'utf8');
    for (const match of html.matchAll(/href="([^"?]+)"/g)) {
      const href = match[1];
      if (
        !(href.startsWith('/') || href.startsWith('#')) ||
        href.startsWith('//')
      )
        continue;
      const [pathname, fragment] = href.split('#');
      const target = pathname
        ? join(output, pathname, pathname.endsWith('/') ? 'index.html' : '')
        : file;
      assert.ok(existsSync(target), `${file}: ${href}`);
      if (fragment && target.endsWith('.html'))
        assert.ok(
          readFileSync(target, 'utf8').includes(`id="${fragment}"`),
          href,
        );
    }
  }
});
