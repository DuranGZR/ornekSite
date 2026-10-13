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
    'etkinlikler/teknoloji-ve-yenilik-zirvesi/index.html',
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
test('Community archive contains real content and valid local image assets', () => {
  for (const file of htmlFiles(output)) {
    const html = readFileSync(file, 'utf8');
    assert.doesNotMatch(
      html,
      /DEMO ETKİNLİK|ÖRNEK EKİP|Deniz Yılmaz|Ece Demir|Temsili topluluk etkinliği/,
    );
    for (const match of html.matchAll(/src="(\/[^"?]+)"/g)) {
      assert.ok(existsSync(join(output, match[1])), `${file}: ${match[1]}`);
    }
  }
  const archive = readFileSync(join(output, 'etkinlikler/index.html'), 'utf8');
  assert.equal((archive.match(/data-status="completed"/g) ?? []).length, 5);
  const datedEvent = readFileSync(
    join(output, 'etkinlikler/yurt-disi-kariyer-yolculugu/index.html'),
    'utf8',
  );
  assert.match(datedEvent, /22 Ocak 2026/);
  assert.match(datedEvent, /18:30/);
  const trip = readFileSync(
    join(output, 'etkinlikler/cumhuriyetin-kalbinde-inovasyon/index.html'),
    'utf8',
  );
  assert.match(trip, /Tamamlandı/);
  assert.doesNotMatch(trip, /11 Aralık 2025/);
});

test('Share metadata and discovery endpoints describe generated pages', () => {
  const sitemap = readFileSync(join(output, 'sitemap.xml'), 'utf8');
  const robots = readFileSync(join(output, 'robots.txt'), 'utf8');
  assert.ok(robots.includes('Sitemap: https://'));
  assert.doesNotMatch(sitemap, /404/);
  for (const file of htmlFiles(output).filter(
    (file) => !file.endsWith('404.html'),
  )) {
    const html = readFileSync(file, 'utf8');
    const canonical = html.match(/rel="canonical" href="([^"]+)"/)[1];
    assert.ok(sitemap.includes(`<loc>${canonical}</loc>`), canonical);
    assert.match(html, /property="og:image" content="https:/);
    assert.match(html, /name="twitter:card" content="summary_large_image"/);
    assert.ok(html.includes(`property="og:url" content="${canonical}"`));
  }
  assert.ok(existsSync(join(output, 'social-card.png')));
});

test('Registration and editorial metadata remain usable without a link directory', () => {
  const joinPage = readFileSync(join(output, 'katil/index.html'), 'utf8');
  assert.ok(
    joinPage.includes(
      'href="https://ogrencitopluluklari.inonu.edu.tr/Student/Community/Detail/',
    ),
  );
  assert.ok(joinPage.includes('href="https://forms.gle/f1YBfjYZiBcAFVtZ8"'));
  const writing = readFileSync(join(output, 'yazilar/index.html'), 'utf8');
  assert.equal((writing.match(/<time datetime="2026-/g) ?? []).length, 5);
  assert.match(writing, /960:636/);
  assert.equal((writing.match(/\d+ dk okuma/g) ?? []).length, 5);
  const home = readFileSync(join(output, 'index.html'), 'utf8');
  assert.equal((home.match(/\d+ dk okuma/g) ?? []).length, 3);
  assert.match(writing, /Garbage Collection/);
  assert.match(writing, /SonarQube/);
  const recording = readFileSync(
    join(output, 'etkinlikler/yurt-disi-kariyer-yolculugu/index.html'),
    'utf8',
  );
  assert.match(recording, /Yayın kaydını izle/);
  assert.match(recording, /Keşfetmeye devam et/);
});
