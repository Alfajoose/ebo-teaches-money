// Bundles and runs export-plan.tsx (the plan imports JSX and JSON).
import {build} from 'esbuild';
import {execFileSync} from 'child_process';
await build({entryPoints: ['scripts/storyboard/export-plan.tsx'], bundle: true, platform: 'node', format: 'cjs', jsx: 'automatic', outfile: 'out/storyboard/export-plan.cjs', loader: {'.json': 'json'}, logLevel: 'warning'});
execFileSync('node', ['out/storyboard/export-plan.cjs'], {stdio: 'inherit'});
