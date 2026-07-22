import { copyFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const artifacts = resolve(root, process.argv[2] ?? 'artifacts');

const packages = [
  ['noxcturnal.darwin-arm64.node', 'darwin-arm64'],
  ['noxcturnal.darwin-x64.node', 'darwin-x64'],
  ['noxcturnal.linux-arm64-gnu.node', 'linux-arm64-gnu'],
  ['noxcturnal.linux-arm64-musl.node', 'linux-arm64-musl'],
  ['noxcturnal.linux-x64-gnu.node', 'linux-x64-gnu'],
  ['noxcturnal.linux-x64-musl.node', 'linux-x64-musl'],
  ['noxcturnal.win32-arm64-msvc.node', 'win32-arm64-msvc'],
  ['noxcturnal.win32-x64-msvc.node', 'win32-x64-msvc'],
];

for (const [binary, packageName] of packages) {
  const packageDirectory = resolve(root, 'npm', packageName);
  mkdirSync(packageDirectory, { recursive: true });
  copyFileSync(resolve(artifacts, binary), resolve(packageDirectory, binary));
}
