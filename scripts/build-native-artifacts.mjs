import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

import { nativePackages } from './native-packages.mjs';

const root = resolve(import.meta.dirname, '..');
const artifacts = resolve(root, process.argv[2] ?? 'artifacts');
const buildRoot = resolve(root, 'target/native-artifacts');

if (process.platform !== 'darwin' || process.arch !== 'arm64') {
  throw new Error('building the complete native matrix locally requires an Apple Silicon Mac');
}

for (const command of ['cargo', 'cmake', 'ninja', 'zig']) requireCommand(command);

execFileSync(
  'git',
  ['submodule', 'update', '--init', '--depth', '1', 'crates/hermes-parser-sys/hermes'],
  { cwd: root, stdio: 'inherit' },
);

const targets = [
  ['aarch64-apple-darwin', 'noxcturnal.darwin-arm64.node', false],
  ['x86_64-apple-darwin', 'noxcturnal.darwin-x64.node', false],
  ['aarch64-unknown-linux-gnu', 'noxcturnal.linux-arm64-gnu.node', true],
  ['x86_64-unknown-linux-gnu', 'noxcturnal.linux-x64-gnu.node', true],
  ['aarch64-unknown-linux-musl', 'noxcturnal.linux-arm64-musl.node', true],
  ['x86_64-unknown-linux-musl', 'noxcturnal.linux-x64-musl.node', true],
  ['aarch64-pc-windows-msvc', 'noxcturnal.win32-arm64-msvc.node', true],
  ['x86_64-pc-windows-msvc', 'noxcturnal.win32-x64-msvc.node', true],
];

const packageFilenames = new Set(nativePackages.map(([filename]) => filename));
for (const [, filename] of targets) {
  if (!packageFilenames.has(filename)) throw new Error(`no native package owns ${filename}`);
}

const rustSysroot = execFileSync('rustc', ['--print', 'sysroot'], { encoding: 'utf8' }).trim();
for (const [target] of targets) {
  const targetLib = resolve(rustSysroot, 'lib/rustlib', target, 'lib');
  let installed = false;
  try {
    installed = readdirSync(targetLib).some(filename => filename.startsWith('libcore-'));
  } catch {}
  if (!installed) {
    throw new Error(
      `${target} is missing from the active Rust sysroot (${rustSysroot}); exit and re-enter nix develop`,
    );
  }
}

mkdirSync(artifacts, { recursive: true });
rmSync(buildRoot, { recursive: true, force: true });

for (const [target, filename, crossCompile] of targets) {
  const args = [
    'exec',
    'napi',
    'build',
    '--platform',
    '--release',
    '--target',
    target,
    '--target-dir',
    resolve(buildRoot, target),
  ];
  if (crossCompile) args.push('--cross-compile');

  console.log(`\nBuilding ${target}`);
  execFileSync('pnpm', args, { cwd: root, stdio: 'inherit' });
  copyFileSync(resolve(root, filename), resolve(artifacts, filename));
}

console.log(`\nBuilt ${targets.length} native artifacts in ${artifacts}`);

function requireCommand(command) {
  const result = spawnSync(command, ['--version'], { stdio: 'ignore' });
  if (result.error?.code === 'ENOENT')
    throw new Error(`required command is not installed: ${command}`);
}
