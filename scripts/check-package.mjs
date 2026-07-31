import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

import { nativePackages } from './native-packages.mjs';

const root = path.resolve(import.meta.dirname, '..');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'noxcturnal-package-'));
const release = process.argv.includes('--release');
const rootPackage = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

for (const [, packageDirectory, packageName] of nativePackages) {
  const packagePath = path.join(root, 'npm', packageDirectory, 'package.json');
  const platformPackage = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  if (platformPackage.name !== packageName)
    throw new Error(`${path.relative(root, packagePath)} must be named ${packageName}`);
  if (rootPackage.optionalDependencies?.[packageName] == null)
    throw new Error(`root optionalDependencies is missing ${packageName}`);
}

try {
  execFileSync('npm', ['pack', '--ignore-scripts', '--pack-destination', temporary], {
    cwd: root,
    stdio: ['ignore', 'ignore', 'inherit'],
  });
  const archive = fs.readdirSync(temporary).find(filename => filename.endsWith('.tgz'));
  if (!archive) throw new Error('npm pack did not produce an archive');
  execFileSync('tar', ['-xzf', path.join(temporary, archive), '-C', temporary]);

  const packagedRoot = path.join(temporary, 'package');
  for (const filename of ['package.json', 'dist/noxcturnal.js', 'dist/noxcturnal.d.ts']) {
    if (!fs.existsSync(path.join(packagedRoot, filename)))
      throw new Error(`package archive is missing ${filename}`);
  }

  let binary = fs
    .readdirSync(packagedRoot)
    .find(filename => filename.startsWith('noxcturnal.') && filename.endsWith('.node'));
  if (release) {
    for (const [filename, packageDirectory, packageName] of nativePackages) {
      const stagedBinary = path.join(root, 'npm', packageDirectory, filename);
      if (!fs.existsSync(stagedBinary))
        throw new Error(
          `release is missing ${packageName} binary npm/${packageDirectory}/${filename}`,
        );
    }

    const suffix = platformSuffix();
    const current = nativePackages.find(([, packageDirectory]) => packageDirectory === suffix);
    if (!current) throw new Error(`release package check does not support ${suffix}`);
    binary = current[0];
    fs.copyFileSync(path.join(root, 'npm', current[1], binary), path.join(packagedRoot, binary));
  } else if (!binary) {
    throw new Error('package archive is missing the native binary');
  }

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

function platformSuffix() {
  if (process.platform === 'darwin') return `darwin-${process.arch}`;
  if (process.platform === 'win32') return `win32-${process.arch}-msvc`;
  if (process.platform === 'linux') {
    const glibc = process.report?.getReport?.().header?.glibcVersionRuntime;
    return `linux-${process.arch}-${glibc ? 'gnu' : 'musl'}`;
  }
  return `${process.platform}-${process.arch}`;
}
