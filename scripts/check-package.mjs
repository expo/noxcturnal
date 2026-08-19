import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

import {
  currentTarget,
  nativeInputHash,
  nativeTargets,
  sha256File,
  targetBy,
} from './native-lib.mjs';

const root = path.resolve(import.meta.dirname, '..');
if (process.argv.includes('--integrity')) {
  const index = process.argv.indexOf('--package');
  checkIntegrity(index >= 0 ? process.argv[index + 1] : null);
  process.exit(0);
}
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'noxcturnal-package-'));
const release = process.argv.includes('--release');
const rootPackage = readJson(path.join(root, 'package.json'));

try {
  checkIntegrity();
  const rootArchive = pack(root);
  const packagedRoot = extract(rootArchive, 'root');
  for (const filename of ['package.json', 'dist/noxcturnal.js', 'dist/noxcturnal.d.ts']) {
    if (!fs.existsSync(path.join(packagedRoot, filename)))
      throw new Error(`root package archive is missing ${filename}`);
  }
  const packagedBinaries = fs
    .readdirSync(packagedRoot)
    .filter(filename => filename.startsWith('noxcturnal.') && filename.endsWith('.node'));
  if (packagedBinaries.length)
    throw new Error(
      `root package archive contains native binaries: ${packagedBinaries.join(', ')}`,
    );

  const hostTarget = currentTarget();
  let hostBinary = path.join(root, hostTarget.binary);
  if (release) hostBinary = path.join(root, hostTarget.workspace, hostTarget.binary);
  if (!fs.existsSync(hostBinary))
    throw new Error(`package smoke test is missing ${path.relative(root, hostBinary)}`);
  fs.copyFileSync(hostBinary, path.join(packagedRoot, hostTarget.binary));
  const api = createRequire(import.meta.url)(packagedRoot);
  for (const exportName of ['classify', 'defineNativePipeline', 'transform']) {
    if (typeof api[exportName] !== 'function')
      throw new Error(`packaged entry point is missing ${exportName}`);
  }
  if (api.classify('fixture.js', 'const value = 1').syntax !== 'js')
    throw new Error('packaged native binding failed its classification smoke test');

  if (release) {
    for (const target of nativeTargets) {
      const directory = path.join(root, target.workspace);
      const archive = pack(directory);
      const packaged = extract(archive, target.workspace.slice(4));
      const files = listFiles(packaged).filter(
        filename => filename !== 'package.json' && filename !== 'README.md',
      );
      if (files.length !== 1 || files[0] !== target.binary)
        throw new Error(
          `${target.packageName} tarball contains unexpected files: ${files.join(', ')}`,
        );
      const packageJson = readJson(path.join(packaged, 'package.json'));
      if (packageJson.version !== rootPackage.version)
        throw new Error(`${target.packageName} version differs from root`);
    }
  }
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}

function pack(directory) {
  const output = execFileSync('npm', ['pack', '--silent', '--pack-destination', temporary], {
    cwd: directory,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  const filename = output
    .trim()
    .split(/\r?\n/)
    .findLast(line => line.endsWith('.tgz'));
  if (!filename) throw new Error(`pack failed in ${directory}`);
  return path.join(temporary, filename);
}

function extract(archive, name) {
  const destination = path.join(temporary, `extract-${name}`);
  fs.mkdirSync(destination, { recursive: true });
  execFileSync('tar', ['-xzf', archive, '-C', destination]);
  return path.join(destination, 'package');
}

function listFiles(directory, prefix = '') {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap(entry => {
      const relative = path.join(prefix, entry.name);
      return entry.isDirectory()
        ? listFiles(path.join(directory, entry.name), relative)
        : [relative];
    })
    .sort();
}

function readJson(filename) {
  return JSON.parse(fs.readFileSync(filename, 'utf8'));
}

function checkIntegrity(selector) {
  const rootPackage = readJson(path.join(root, 'package.json'));
  const repositoryUrl = 'https://github.com/expo/noxcturnal.git';
  if (rootPackage.repository?.url !== repositoryUrl)
    throw new Error(`root package repository must be ${repositoryUrl}`);
  for (const target of nativeTargets) {
    const packageJson = readJson(path.join(root, target.workspace, 'package.json'));
    const expected = {
      name: target.packageName,
      version: rootPackage.version,
      main: target.binary,
    };
    for (const [field, value] of Object.entries(expected)) {
      if (packageJson[field] !== value)
        throw new Error(`${target.workspace}/package.json has invalid ${field}`);
    }
    if (packageJson.files?.length !== 1 || packageJson.files[0] !== target.binary)
      throw new Error(`${target.workspace}/package.json must contain only ${target.binary}`);
    if (packageJson.os?.[0] !== target.os || packageJson.cpu?.[0] !== target.cpu)
      throw new Error(`${target.workspace}/package.json has invalid platform metadata`);
    if ((packageJson.libc?.[0] ?? null) !== target.libc)
      throw new Error(`${target.workspace}/package.json has invalid libc metadata`);
    if (packageJson.repository?.url !== repositoryUrl)
      throw new Error(`${target.workspace}/package.json repository must be ${repositoryUrl}`);
    if (rootPackage.optionalDependencies?.[target.packageName] !== 'workspace:*')
      throw new Error(`root optionalDependencies must link ${target.packageName} with workspace:*`);
  }
  if (!selector) return;

  const target = targetBy(selector);
  const manifestPath = path.join(root, 'target/native-staging-manifest.json');
  if (!fs.existsSync(manifestPath)) throw new Error('native staging manifest is missing');
  const staging = readJson(manifestPath);
  if (staging.schema !== 1) throw new Error('native staging manifest has an unknown schema');
  if (staging.version !== rootPackage.version) throw new Error('native staging version is stale');
  if (staging.artifacts?.length !== nativeTargets.length)
    throw new Error('native staging manifest does not contain exactly eight artifacts');
  if (new Set(staging.artifacts.map(entry => entry.target)).size !== nativeTargets.length)
    throw new Error('native staging manifest contains duplicate targets');
  const artifact = staging.artifacts.find(entry => entry.target === target.rustTarget);
  if (!artifact) throw new Error(`native staging manifest is missing ${target.rustTarget}`);
  const expected = {
    target: target.rustTarget,
    packageName: target.packageName,
    workspace: target.workspace,
    binary: target.binary,
  };
  for (const [field, value] of Object.entries(expected)) {
    if (artifact[field] !== value || artifact.buildManifest?.[field] !== value)
      throw new Error(`native staging manifest has invalid ${field} for ${target.rustTarget}`);
  }
  if (artifact.buildManifest.profile !== 'release')
    throw new Error(`${target.rustTarget} is not a release artifact`);
  if (artifact.buildManifest.sourceHash !== staging.sourceHash)
    throw new Error(`${target.rustTarget} has inconsistent source metadata`);
  if (artifact.buildManifest.nativeInputSha256 !== nativeInputHash())
    throw new Error(`${target.rustTarget} was built from stale native inputs`);
  if (artifact.buildManifest.flakeLockHash !== sha256File(path.join(root, 'flake.lock')))
    throw new Error(`${target.rustTarget} was built with another flake.lock`);
  if (
    artifact.buildManifest.dependencies?.cargoLockSha256 !==
    sha256File(path.join(root, 'Cargo.lock'))
  )
    throw new Error(`${target.rustTarget} was built with another Cargo.lock`);
  if (
    artifact.buildManifest.dependencies?.pnpmLockSha256 !==
    sha256File(path.join(root, 'pnpm-lock.yaml'))
  )
    throw new Error(`${target.rustTarget} was built with another pnpm-lock.yaml`);
  const binary = path.join(root, target.workspace, target.binary);
  if (!fs.existsSync(binary)) throw new Error(`${target.workspace}/${target.binary} is missing`);
  const payloadHash = sha256File(binary);
  if (
    payloadHash !== artifact.payloadSha256 ||
    payloadHash !== artifact.buildManifest.payloadSha256
  )
    throw new Error(`${target.workspace}/${target.binary} does not match its staging manifest`);
}
