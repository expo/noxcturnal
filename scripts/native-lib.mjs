import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const manifestPath = path.join(import.meta.dirname, 'native-targets.json');

export const nativeTargets = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
if (nativeTargets.length !== 8) throw new Error('native-targets.json must declare eight targets');
for (const field of ['rustTarget', 'packageName', 'workspace', 'binary']) {
  const values = nativeTargets.map(target => target[field]);
  if (new Set(values).size !== values.length)
    throw new Error(`native-targets.json contains duplicate ${field}`);
}
for (const target of nativeTargets) {
  if (!target.workspace.startsWith('npm/') || path.resolve(root, target.workspace) === root)
    throw new Error(`${target.rustTarget} has unsafe workspace ${target.workspace}`);
  if (target.binary !== `noxcturnal.${target.workspace.slice(4)}.node`)
    throw new Error(`${target.rustTarget} binary does not match its workspace`);
}

export function targetBy(selector) {
  const target = nativeTargets.find(
    candidate =>
      candidate.rustTarget === selector ||
      candidate.workspace === selector ||
      candidate.workspace.slice(4) === selector ||
      candidate.packageName === selector,
  );
  if (!target) throw new Error(`unknown native target: ${selector}`);
  return target;
}

export function currentTarget() {
  let suffix;
  if (process.platform === 'darwin') suffix = `darwin-${process.arch}`;
  else if (process.platform === 'win32') suffix = `win32-${process.arch}-msvc`;
  else if (process.platform === 'linux') {
    const glibc = process.report?.getReport?.().header?.glibcVersionRuntime;
    suffix = `linux-${process.arch}-${glibc ? 'gnu' : 'musl'}`;
  } else suffix = `${process.platform}-${process.arch}`;
  return targetBy(suffix);
}

export const sha256File = filename =>
  createHash('sha256').update(fs.readFileSync(filename)).digest('hex');

export function readBuild(target, directory) {
  const manifestPath_ = path.join(directory, 'build-manifest.json');
  const checksumPath = path.join(directory, 'SHA256SUMS');
  if (!fs.existsSync(manifestPath_) || !fs.existsSync(checksumPath))
    throw new Error(`${directory} is not a complete native output`);
  const manifest = JSON.parse(fs.readFileSync(manifestPath_, 'utf8'));
  const binaryPath = path.join(directory, target.binary);
  if (!fs.existsSync(binaryPath)) throw new Error(`${directory} is missing ${target.binary}`);
  const payloadHash = sha256File(binaryPath);
  if (fs.readFileSync(checksumPath, 'utf8') !== `${payloadHash}  ${target.binary}\n`)
    throw new Error(`${directory}/SHA256SUMS does not match its payload`);
  const expected = {
    schema: 1,
    target: target.rustTarget,
    packageName: target.packageName,
    workspace: target.workspace,
    binary: target.binary,
    profile: 'release',
    os: target.os,
    cpu: target.cpu,
    libc: target.libc,
    payloadSha256: payloadHash,
  };
  for (const [field, value] of Object.entries(expected)) {
    if (manifest[field] !== value)
      throw new Error(`${directory}/build-manifest.json has invalid ${field}`);
  }
  for (const field of ['nativeInputSha256', 'sourceHash', 'flakeLockHash']) {
    if (typeof manifest[field] !== 'string' || !/^[0-9a-f]{64}$/.test(manifest[field]))
      throw new Error(`${directory}/build-manifest.json is missing ${field}`);
  }
  for (const field of ['rust', 'node', 'pnpm', 'napiCli', 'cross']) {
    if (typeof manifest.toolchain?.[field] !== 'string' || !manifest.toolchain[field])
      throw new Error(`${directory}/build-manifest.json is missing toolchain.${field}`);
  }
  for (const field of ['cargoLockSha256', 'pnpmLockSha256', 'cargoVendorHash', 'pnpmStoreHash']) {
    if (typeof manifest.dependencies?.[field] !== 'string' || !manifest.dependencies[field])
      throw new Error(`${directory}/build-manifest.json is missing dependencies.${field}`);
  }
  return { manifest, binaryPath, payloadHash };
}

const nativeInputRoots = [
  'Cargo.toml',
  'Cargo.lock',
  'build.rs',
  'src',
  'crates',
  'flake.lock',
  'flake.nix',
  'package.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  ...nativeTargets.map(target => `${target.workspace}/package.json`),
  'scripts/native-lib.mjs',
  'scripts/native.mjs',
  'scripts/native-targets.json',
];

export function nativeInputHash() {
  const hash = createHash('sha256');
  for (const relative of walkInputs()) {
    hash.update(relative);
    hash.update('\0');
    hash.update(fs.readFileSync(path.join(root, relative)));
    hash.update('\0');
  }
  return hash.digest('hex');
}

function walkInputs() {
  const files = [];
  const visit = relative => {
    if (relative === 'crates/hermes-parser-sys/hermes') return;
    const absolute = path.join(root, relative);
    if (!fs.existsSync(absolute)) return;
    const stat = fs.lstatSync(absolute);
    if (stat.isSymbolicLink() || stat.isFile()) {
      files.push(relative);
      return;
    }
    if (!stat.isDirectory()) return;
    for (const entry of fs.readdirSync(absolute).sort()) {
      if (entry === '.git' || entry === 'target') continue;
      visit(path.join(relative, entry));
    }
  };
  for (const entry of nativeInputRoots) visit(entry);
  return files.sort();
}
