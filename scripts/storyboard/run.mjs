// Bundles and runs an episode's plan exporter (the plans import JSX and JSON).
//   node scripts/storyboard/run.mjs [ep03|ep04]
import {build} from 'esbuild';
import {execFileSync} from 'child_process';
const ep = process.argv[2] || 'ep03';
const entry = ep === 'ep03' ? 'scripts/storyboard/export-plan.tsx' : `scripts/storyboard/export-plan${ep.slice(-1)}.tsx`;
await build({entryPoints: [entry], bundle: true, platform: 'node', format: 'cjs', jsx: 'automatic', outfile: `out/storyboard/export-${ep}.cjs`, loader: {'.json': 'json'}, logLevel: 'warning'});
execFileSync('node', [`out/storyboard/export-${ep}.cjs`], {stdio: 'inherit'});
