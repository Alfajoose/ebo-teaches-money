import {build} from 'esbuild';
import {execFileSync} from 'child_process';
await build({entryPoints: ['scripts/hand-props/gen.tsx'], bundle: true, platform: 'node', format: 'cjs', jsx: 'automatic', outfile: 'out/hand-props/gen.cjs', loader: {'.json': 'json'}, logLevel: 'warning'});
execFileSync('node', ['out/hand-props/gen.cjs', ...process.argv.slice(2)], {stdio: 'inherit'});
