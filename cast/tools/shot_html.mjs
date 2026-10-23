import {chromium} from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'path';
const [outDir, ...files] = process.argv.slice(2);
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});
const page = await browser.newPage({viewport: {width: 2600, height: 400}});
for (const f of files) {
  await page.goto('file://' + path.resolve(f));
  await page.screenshot({path: path.join(outDir, path.basename(f).replace(/\.html$/, '.png')), fullPage: true});
}
await browser.close();
