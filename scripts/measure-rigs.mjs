// Measures each exported rig in a headless browser: overall bounds (to find the feet),
// and every layer's pivot + visual centre in rig space (to learn rest limb directions).
// usage: node scripts/measure-rigs.mjs  -> writes src/cast/data/measure.json
import fs from 'fs';
import path from 'path';
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');

const dir = path.resolve('src/cast/data');
const names = ['ebo', 'mica', 'obuor', 'ama', 'christy'];
const mul = (m1, m2) => {
  const [a1, b1, c1, d1, x1, y1] = m1, [a2, b2, c2, d2, x2, y2] = m2;
  return [a1 * a2 + c1 * b2, b1 * a2 + d1 * b2, a1 * c2 + c1 * d2, b1 * c2 + d1 * d2, a1 * x2 + c1 * y2 + x1, b1 * x2 + d1 * y2 + y1];
};
const ap = (m, p) => [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];

const browser = await chromium.launch({executablePath: process.env.CHROME_BIN});
const page = await browser.newPage({viewport: {width: 4000, height: 4000}});
const out = {};
for (const n of names) {
  const rig = JSON.parse(fs.readFileSync(path.join(dir, n + '.json'), 'utf8'));
  const byRig = Object.fromEntries(rig.layers.filter((l) => l.rig != null).map((l) => [l.rig, l]));
  const world = (l) => (l.parent != null && byRig[l.parent] ? mul(world(byRig[l.parent]), l.m) : l.m);
  const body = rig.layers
    .map((l) => `<g id="L_${l.name}" transform="matrix(${world(l).join(',')})">${l.frames[l.first] || ''}</g>`)
    .join('');
  await page.setContent(`<svg xmlns="http://www.w3.org/2000/svg" width="4000" height="4000" viewBox="-2000 -2000 4000 4000">${body}</svg>`);
  const rects = await page.evaluate(() => {
    const r = {};
    for (const g of document.querySelectorAll('g[id^=L_]')) {
      const b = g.getBoundingClientRect();
      r[g.id.slice(2)] = [b.left - 2000, b.top - 2000, b.right - 2000, b.bottom - 2000];
    }
    const s = document.querySelector('svg').getBBox();
    r.__all = [s.x, s.y, s.x + s.width, s.y + s.height];
    return r;
  });
  const layers = {};
  for (const l of rig.layers) {
    const w = world(l);
    const b = rects[l.name];
    layers[l.name] = {pivot: ap(w, l.tp), center: b ? [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2] : null, box: b};
  }
  out[n] = {bounds: rects.__all, layers};
  console.log(n, rects.__all.map((v) => Math.round(v)).join(' '));
}
await browser.close();
fs.writeFileSync(path.join(dir, 'measure.json'), JSON.stringify(out, null, 1));
