import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = path.resolve(import.meta.dirname, '..');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'noxcturnal-package-'));

try {
  execFileSync('npm', ['pack', '--ignore-scripts', '--pack-destination', temporary], {
    cwd: root,
    stdio: ['ignore', 'ignore', 'inherit'],
  });
  const archive = fs.readdirSync(temporary).find(filename => filename.endsWith('.tgz'));
  if (!archive) throw new Error('npm pack did not produce an archive');
  execFileSync('tar', ['-xzf', path.join(temporary, archive), '-C', temporary]);

  const packagedRoot = path.join(temporary, 'package');
  for (const filename of ['package.json', 'dist/index.js', 'dist/index.d.ts']) {
    if (!fs.existsSync(path.join(packagedRoot, filename)))
      throw new Error(`package archive is missing ${filename}`);
  }

  const binary = fs
    .readdirSync(packagedRoot)
    .find(filename => filename.startsWith('noxcturnal.') && filename.endsWith('.node'));
  if (!binary) throw new Error('package archive is missing the native binary');

  const require = createRequire(import.meta.url);
  const api = require(packagedRoot);
  for (const exportName of ['classify', 'defineNativePipeline', 'transform']) {
    if (typeof api[exportName] !== 'function')
      throw new Error(`packaged entry point is missing ${exportName}`);
  }
  if (api.classify('fixture.js', 'const value = 1').syntax !== 'js')
    throw new Error('packaged native binding failed its classification smoke test');
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
