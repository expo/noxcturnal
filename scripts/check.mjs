import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { currentTarget, nativeTargets } from './native-lib.mjs';

const root = path.resolve(import.meta.dirname, '..');
const environment = {
  ...process.env,
  CARGO_TARGET_DIR: process.env.CARGO_TARGET_DIR ?? path.join(root, 'target', 'dev'),
  // napi builds with an explicit host target. Use that target for Clippy and
  // tests too, so Cargo can reuse Oxc and Hermes artifacts between the checks.
  CARGO_BUILD_TARGET: currentTarget().rustTarget,
};
const before = gitStatus();
checkRepositoryShape();
checkTextFiles();
const commands = [
  ['pnpm', ['codegen:check']],
  ['pnpm', ['format:check']],
  ['pnpm', ['check:types']],
  ['pnpm', ['lint']],
  ['pnpm', ['build']],
  ['pnpm', ['test']],
  ['cargo', ['test', '--workspace']],
  ['pnpm', ['package:check']],
];
for (const [command, args] of commands) {
  console.log(`\n> ${command} ${args.join(' ')}`);
  execFileSync(command, args, {
    cwd: root,
    stdio: 'inherit',
    env: environment,
  });
}

function checkRepositoryShape() {
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const workspace = fs.readFileSync(path.join(root, 'pnpm-workspace.yaml'), 'utf8');
  if ('packageManager' in packageJson)
    throw new Error('packageManager is intentionally omitted; flake.nix owns the pnpm version');
  for (const script of [
    'build:native:all',
    'package:tarballs',
    'changeset:version',
    'changeset:publish',
  ]) {
    if (script in packageJson.scripts)
      throw new Error(`obsolete npm script must remain absent: ${script}`);
  }
  if (!workspace.includes('- npm/*'))
    throw new Error('pnpm workspace must include platform packages');
  const hermes =
    process.env.HERMES_SOURCE_DIR ?? path.join(root, 'crates/hermes-parser-sys/hermes');
  if (!fs.existsSync(path.join(hermes, 'CMakeLists.txt')))
    throw new Error('Hermes submodule is missing; run git submodule update --init --recursive');
  for (const target of nativeTargets) {
    if (!packageJson.napi.targets.includes(target.rustTarget))
      throw new Error(`package.json napi.targets is missing ${target.rustTarget}`);
  }
}

function checkTextFiles() {
  const extensions = new Set([
    '.c',
    '.cc',
    '.cpp',
    '.h',
    '.hpp',
    '.js',
    '.json',
    '.md',
    '.mjs',
    '.nix',
    '.rs',
    '.toml',
    '.ts',
    '.tsx',
    '.yml',
    '.yaml',
  ]);
  const conflicts = /^(<{7}|={7}|>{7})(?: |$)/m;
  for (const filename of walk(root)) {
    if (!extensions.has(path.extname(filename))) continue;
    const text = fs.readFileSync(filename, 'utf8');
    if (conflicts.test(text))
      throw new Error(`${path.relative(root, filename)} contains conflict markers`);
    text.split('\n').forEach((line, index) => {
      if (/[ \t]+$/.test(line))
        throw new Error(`${path.relative(root, filename)}:${index + 1} has trailing whitespace`);
    });
  }
}

function* walk(directory) {
  const ignored = new Set(['.git', 'node_modules', 'target', 'dist', 'coverage']);
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const filename = path.join(directory, entry.name);
    if (path.relative(root, filename) === 'crates/hermes-parser-sys/hermes') continue;
    if (entry.isDirectory()) yield* walk(filename);
    else if (entry.isFile()) yield filename;
  }
}
const after = gitStatus();
if (before !== null && after !== before)
  throw new Error(`pnpm check changed the repository:\nBefore:\n${before}\nAfter:\n${after}`);

function gitStatus() {
  try {
    return execFileSync('git', ['status', '--porcelain=v1', '--untracked-files=all'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return null;
  }
}
