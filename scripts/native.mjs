import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

import {
  assertBuildInputs,
  assertNativeSourceRoots,
  currentBuildInputs,
  currentTarget,
  nativeInputHash,
  nativeTargets,
  readBuild,
  sha256File,
  targetBy,
} from './native-lib.mjs';

const root = path.resolve(import.meta.dirname, '..');
const command = process.argv[2];

if (command === 'build') buildDevelopment();
else if (command === 'build-target') buildTarget();
else if (command === 'materialize') materialize();
else if (command === 'check') {
  assertNativeSourceRoots();
  checkDevelopment();
} else if (command === 'smoke') smoke();
else
  throw new Error(
    'use native.mjs build [--release] | build-target | materialize --artifact-root <directory> | check | smoke <artifact> <target>',
  );

function buildDevelopment() {
  const release = process.argv.includes('--release');
  const target = currentTarget();
  const profile = release ? 'release' : 'debug';
  const targetDirectory = path.resolve(process.env.CARGO_TARGET_DIR ?? 'target/dev');
  const args = [
    'exec',
    'napi',
    'build',
    '--platform',
    '--target',
    target.rustTarget,
    '--target-dir',
    targetDirectory,
  ];
  if (release) args.push('--release');
  execFileSync('pnpm', args, { cwd: root, stdio: 'inherit' });
  if (!fs.existsSync(path.join(root, target.binary)))
    throw new Error(`native build did not produce ${target.binary}`);
  const manifestDirectory = path.join(root, 'target', 'dev');
  fs.mkdirSync(manifestDirectory, { recursive: true });
  fs.writeFileSync(
    path.join(manifestDirectory, 'build-manifest.json'),
    `${JSON.stringify(
      {
        schema: 1,
        target: target.rustTarget,
        binary: target.binary,
        profile,
        nativeInputHash: nativeInputHash(),
        node: process.version,
        host: `${process.platform}-${process.arch}`,
      },
      null,
      2,
    )}\n`,
  );
}

function buildTarget() {
  const target = targetBy(process.env.NOXCTURNAL_TARGET ?? process.argv[3]);
  const output = path.resolve(process.env.NOXCTURNAL_OUTPUT ?? process.argv[4] ?? 'result');
  const targetDirectory = path.resolve(process.env.NOXCTURNAL_TARGET_DIR ?? 'target/nix-native');
  const buildDirectory = path.join(targetDirectory, 'output');
  fs.mkdirSync(buildDirectory, { recursive: true });
  const args = [
    'exec',
    'napi',
    'build',
    '--platform',
    '--release',
    '--target',
    target.rustTarget,
    '--target-dir',
    targetDirectory,
    '--output-dir',
    buildDirectory,
  ];
  if (process.platform !== 'darwin' || !target.rustTarget.endsWith('apple-darwin'))
    args.push('--cross-compile');
  execFileSync('pnpm', args, { cwd: root, stdio: 'inherit' });

  const built = path.join(buildDirectory, target.binary);
  if (!fs.existsSync(built)) throw new Error(`build did not produce ${target.binary}`);
  fs.mkdirSync(output, { recursive: true });
  const destination = path.join(output, target.binary);
  fs.copyFileSync(built, destination);
  const payloadSha256 = sha256File(destination);
  const napiPackage = JSON.parse(
    fs.readFileSync(path.join(root, 'node_modules/@napi-rs/cli/package.json'), 'utf8'),
  );
  const manifest = {
    schema: 1,
    target: target.rustTarget,
    packageName: target.packageName,
    workspace: target.workspace,
    binary: target.binary,
    profile: 'release',
    os: target.os,
    cpu: target.cpu,
    libc: target.libc,
    payloadSha256,
    nativeInputSha256: requiredEnvironment('NOXCTURNAL_NATIVE_INPUT_HASH'),
    sourceHash: process.env.NOXCTURNAL_SOURCE_HASH ?? 'unavailable',
    flakeLockHash: sha256File(path.join(root, 'flake.lock')),
    toolchain: {
      rust: toolVersion('rustc'),
      node: process.version,
      pnpm: toolVersion('pnpm'),
      napiCli: napiPackage.version,
      cross: target.toolchain,
    },
    dependencies: {
      cargoLockSha256: sha256File(path.join(root, 'Cargo.lock')),
      pnpmLockSha256: sha256File(path.join(root, 'pnpm-lock.yaml')),
      cargoVendorHash: requiredEnvironment('NOXCTURNAL_CARGO_VENDOR_HASH'),
      pnpmStoreHash: requiredEnvironment('NOXCTURNAL_PNPM_STORE_HASH'),
    },
  };
  fs.writeFileSync(
    path.join(output, 'build-manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  fs.writeFileSync(path.join(output, 'SHA256SUMS'), `${payloadSha256}  ${target.binary}\n`);
}

function checkDevelopment() {
  const target = currentTarget();
  const manifestPath = path.join(root, 'target/dev/build-manifest.json');
  const fail = reason => {
    throw new Error(`${reason}; run pnpm build`);
  };
  if (!fs.existsSync(manifestPath)) fail('development native build manifest is missing');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (!fs.existsSync(path.join(root, target.binary)))
    fail(`development addon ${target.binary} is missing`);
  if (
    manifest.target !== target.rustTarget ||
    manifest.host !== `${process.platform}-${process.arch}`
  )
    fail('development addon was built for another host');
  if (manifest.nativeInputHash !== nativeInputHash()) fail('development addon is stale');
}

function materialize() {
  const arguments_ = process.argv.slice(3);
  const workspaceIndex = arguments_.indexOf('--workspace-root');
  const workspace = path.resolve(workspaceIndex >= 0 ? arguments_[workspaceIndex + 1] : root);
  const artifactRootIndex = arguments_.indexOf('--artifact-root');
  if (artifactRootIndex < 0) throw new Error('materialize requires --artifact-root <directory>');
  const artifactRoot = path.resolve(arguments_[artifactRootIndex + 1]);
  const directories = nativeTargets.map(target => path.join(artifactRoot, target.rustTarget));

  const expected = currentBuildInputs(workspace);
  const validated = nativeTargets.map((target, index) => ({
    target,
    directory: directories[index],
    ...readBuild(target, directories[index]),
  }));
  if (new Set(validated.map(entry => entry.manifest.sourceHash)).size !== 1)
    throw new Error('native outputs do not share one source hash');
  for (const { target, manifest } of validated) assertBuildInputs(target, manifest, expected);

  const manifest = {
    schema: 1,
    version: JSON.parse(fs.readFileSync(path.join(workspace, 'package.json'), 'utf8')).version,
    sourceHash: validated[0].manifest.sourceHash,
    flakeLockHash: expected.flake,
    artifacts: validated.map(({ target, manifest: buildManifest, payloadHash }) => ({
      target: target.rustTarget,
      packageName: target.packageName,
      workspace: target.workspace,
      binary: target.binary,
      payloadSha256: payloadHash,
      buildManifest,
    })),
  };
  installNativePackages(workspace, validated, manifest);
  console.log(`Materialized ${validated.length} validated native packages`);
}

function installNativePackages(workspace, validated, manifest) {
  const transactionRoot = path.join(workspace, 'target/native-materialize');
  const pending = path.join(transactionRoot, `pending-${process.pid}`);
  const backup = path.join(transactionRoot, `backup-${process.pid}`);
  const manifestPath = path.join(workspace, 'target/native-staging-manifest.json');
  const previous = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    : null;
  const entries = validated.map(({ target, binaryPath }) => {
    const packageDirectory = path.resolve(workspace, target.workspace);
    const destination = path.resolve(packageDirectory, target.binary);
    if (!destination.startsWith(`${packageDirectory}${path.sep}`))
      throw new Error(`refusing unsafe native destination ${destination}`);
    if (fs.existsSync(destination)) {
      const prior = previous?.artifacts?.find(artifact => artifact.target === target.rustTarget);
      if (!prior || sha256File(destination) !== prior.payloadSha256)
        throw new Error(
          `${path.relative(workspace, destination)} is unmanaged; remove it explicitly before materializing`,
        );
    }
    return { destination, binaryPath, name: target.binary };
  });
  fs.rmSync(transactionRoot, { recursive: true, force: true });
  fs.mkdirSync(pending, { recursive: true });
  fs.mkdirSync(backup, { recursive: true });
  for (const entry of entries) {
    entry.staged = path.join(pending, entry.name);
    fs.copyFileSync(entry.binaryPath, entry.staged);
  }
  const stagedManifest = path.join(pending, 'native-staging-manifest.json');
  fs.writeFileSync(stagedManifest, `${JSON.stringify(manifest, null, 2)}\n`);
  entries.push({
    destination: manifestPath,
    staged: stagedManifest,
    name: 'manifest.json',
  });

  const replaced = [];
  try {
    for (const entry of entries) {
      fs.mkdirSync(path.dirname(entry.destination), { recursive: true });
      const saved = path.join(backup, entry.name);
      if (fs.existsSync(entry.destination)) fs.renameSync(entry.destination, saved);
      replaced.push({ ...entry, saved });
      fs.renameSync(entry.staged, entry.destination);
    }
  } catch (error) {
    for (const entry of replaced.reverse()) {
      fs.rmSync(entry.destination, { force: true });
      if (fs.existsSync(entry.saved)) fs.renameSync(entry.saved, entry.destination);
    }
    throw error;
  } finally {
    fs.rmSync(transactionRoot, { recursive: true, force: true });
  }
}

function smoke() {
  const artifact = path.resolve(process.argv[3]);
  const target = targetBy(process.argv[4]);
  const { binaryPath } = readBuild(target, artifact);
  const binding = createRequire(import.meta.url)(binaryPath);
  if (binding.classify('fixture.js', 'const value = 1').syntax !== 'js')
    throw new Error(`${target.rustTarget} classify smoke test failed`);
  if (typeof binding.nativePreflightTransform !== 'function')
    throw new Error(`${target.rustTarget} transform entry point is missing`);
  const transformed = binding.nativePreflightTransform(
    'const value = { ...input };',
    'fixture.js',
    { objectRestSpread: true },
  );
  if (transformed.status !== 'complete' || !transformed.code?.includes('value'))
    throw new Error(`${target.rustTarget} transform smoke test failed`);
  console.log(`${target.rustTarget} loaded and passed native smoke tests`);
}

function toolVersion(command_) {
  return execFileSync(command_, ['--version'], { encoding: 'utf8' }).trim();
}

function requiredEnvironment(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}
