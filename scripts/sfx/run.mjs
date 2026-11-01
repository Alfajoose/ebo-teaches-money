import {build} from 'esbuild';
import {execFileSync} from 'child_process';
await build({entryPoints: ['scripts/sfx/gen.tsx'], bundle: true, platform: 'node', format: 'cjs', jsx: 'automatic', outfile: 'out/sfx/gen.cjs', loader: {'.json': 'json'}, logLevel: 'warning'});
execFileSync('node', ['out/sfx/gen.cjs', ...process.argv.slice(2)], {stdio: 'inherit'});
