import {build} from 'esbuild';
import {execFileSync} from 'child_process';
await build({
  entryPoints: ['scripts/export-fla/capture.tsx'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  jsx: 'automatic',
  outfile: 'out/fla-export/capture.cjs',
  loader: {'.json': 'json'},
  logLevel: 'warning',
});
execFileSync('node', ['out/fla-export/capture.cjs', ...process.argv.slice(2)], {stdio: 'inherit'});
