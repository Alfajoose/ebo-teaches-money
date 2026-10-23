// usage: node shot.mjs out_dir file1.svg file2.svg ... (renders each SVG to PNG)
import {chromium} from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
import path from 'path';
const [outDir, ...files] = process.argv.slice(2);
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});
const page = await browser.newPage();
for (const f of files) {
  const svg = fs.readFileSync(f, 'utf8');
  const m = svg.match(/width="(\d+)" height="(\d+)"/);
  await page.setViewportSize({width: +m[1], height: +m[2]});
  await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
  await page.screenshot({path: path.join(outDir, path.basename(f).replace(/\.svg$/, '.png'))});
}
await browser.close();
