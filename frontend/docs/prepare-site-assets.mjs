import sharp from 'sharp';
import { readFile, mkdir } from 'node:fs/promises';
await mkdir('public/photos', { recursive: true });
for (const [source, name] of [['1759734234717.jpg', 'community'], ['1759734234958.jpg', 'gathering']]) {
  for (const width of [480, 960, 1280]) await sharp('public/' + source).resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toFile(`public/photos/${name}-${width}.webp`);
}
const logo = await readFile('public/hsd-logo.svg');
const canvas = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="630" fill="#eeefed"/><path d="M64 552H1136" stroke="#d1d3d0"/><rect x="64" y="66" width="56" height="5" fill="#7d1736"/><text x="64" y="350" fill="#202125" font-family="Arial,sans-serif" font-size="74" font-weight="600">Merakla başlar.</text><text x="64" y="444" fill="#7d1736" font-family="Arial,sans-serif" font-size="74" font-weight="600">Birlikte gelişir.</text><text x="64" y="592" fill="#67696e" font-family="Arial,sans-serif" font-size="24">HSD İnönü · İnönü Üniversitesi</text></svg>`);
await sharp(canvas).composite([{ input: await sharp(logo).resize(280).png().toBuffer(), left: 64, top: 100 }]).png().toFile('public/social-card.png');
console.log('Responsive photos and sharing image generated.');
