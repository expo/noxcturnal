import { copyFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { nativePackages } from './native-packages.mjs';

const root = resolve(import.meta.dirname, '..');
const artifacts = resolve(root, process.argv[2] ?? 'artifacts');

for (const [binary, packageName] of nativePackages) {
  const packageDirectory = resolve(root, 'npm', packageName);
  mkdirSync(packageDirectory, { recursive: true });
  copyFileSync(resolve(artifacts, binary), resolve(packageDirectory, binary));
}
