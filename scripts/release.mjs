import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { nativeTargets, targetBy } from './native-lib.mjs';

const root = path.resolve(import.meta.dirname, '..');
const command = process.argv[2];

if (command === 'plan') plan();
else if (command === 'version') version();
else if (command === 'publish') publish();
else if (command === 'prepublish') prepublish();
else throw new Error('use release.mjs plan|version|publish|prepublish');

function plan() {
  const changesets = fs
    .readdirSync(path.join(root, '.changeset'))
    .filter(filename => filename.endsWith('.md') && filename !== 'README.md');
  const rootPackage = readJson('package.json');
  const sha = process.env.NOXCTURNAL_RELEASE_SHA ?? git('rev-parse', 'HEAD');
  if (!/^[0-9a-f]{40}$/.test(sha)) throw new Error(`invalid release SHA: ${sha}`);

  let mode = 'version';
  if (changesets.length === 0) {
    const names = [rootPackage.name, ...nativeTargets.map(target => target.packageName)];
    const published = names.map(name => npmHasVersion(name, rootPackage.version));
    if (published.every(Boolean)) mode = 'noop';
    else if (published.every(value => !value)) mode = 'publish';
    else {
      const state = names.map((name, index) => `${name}: ${published[index]}`).join('\n');
      throw new Error(`registry contains a partial ${rootPackage.version} release:\n${state}`);
    }
  }

  const output = {
    mode,
    version: rootPackage.version,
    sha,
    smokeMatrix: matrix(target => target.libc !== 'musl'),
    muslSmokeMatrix: matrix(target => target.libc === 'musl'),
  };
  console.log(JSON.stringify(output));
  if (process.env.GITHUB_OUTPUT)
    fs.appendFileSync(
      process.env.GITHUB_OUTPUT,
      `${Object.entries(output)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n')}\n`,
    );
}

function version() {
  verifyWorkflow();
  run('pnpm', 'exec', 'changeset', 'version');
  run('pnpm', 'install', '--lockfile-only', '--offline', '--frozen-lockfile=false');
}

function publish() {
  const workflow = process.env.GITHUB_ACTIONS === 'true';
  if (workflow) authorizeWorkflowPublish();
  run('node', 'scripts/check-package.mjs', '--release');
  execFileSync('pnpm', ['exec', 'changeset', 'publish'], {
    cwd: root,
    stdio: 'inherit',
    env: {
      ...process.env,
      NOXCTURNAL_RELEASE: '1',
      ...(workflow ? {} : { NOXCTURNAL_LOCAL_RELEASE: '1' }),
    },
  });
}

function prepublish() {
  const packageName = process.env.npm_package_name;
  const integrity = ['scripts/check-package.mjs', '--integrity'];
  if (packageName !== 'noxcturnal') integrity.push('--package', packageName);
  run('node', ...integrity);
  if (
    process.env.NOXCTURNAL_RELEASE === '1' &&
    process.env.NOXCTURNAL_LOCAL_RELEASE === '1' &&
    process.env.GITHUB_ACTIONS !== 'true'
  )
    return;
  authorizeWorkflowPublish();
}

function authorizeWorkflowPublish() {
  const fail = message => {
    throw new Error(`publication refused: ${message}`);
  };
  if (process.env.NOXCTURNAL_RELEASE !== '1') fail('NOXCTURNAL_RELEASE is not enabled');
  if (process.env.GITHUB_ACTIONS !== 'true') fail('not running in GitHub Actions');
  if (!process.env.ACTIONS_ID_TOKEN_REQUEST_URL || !process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN)
    fail('npm OIDC is unavailable');
  if (process.env.NOXCTURNAL_RELEASE_ENVIRONMENT !== 'npm')
    fail('protected npm environment is missing');
  if (process.env.NPM_CONFIG_PROVENANCE !== 'false')
    fail('provenance must remain disabled while the source repository is private');
  verifyWorkflow();
  const packageName = process.env.npm_package_name;
  if (!packageName) return;
  const packageDirectory =
    packageName === 'noxcturnal' ? root : path.join(root, targetBy(packageName).workspace);
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(packageDirectory, 'package.json'), 'utf8'),
  );
  if (packageJson.name !== packageName) fail(`unexpected package identity ${packageName}`);
  if (process.env.npm_package_version !== packageJson.version)
    fail(`unexpected package version for ${packageName}`);
  if (npmHasVersion(packageJson.name, packageJson.version, packageDirectory))
    fail(`${packageJson.name}@${packageJson.version} exists`);
}

function verifyWorkflow() {
  if (process.env.GITHUB_ACTIONS !== 'true') throw new Error('release command is workflow-only');
  if (!process.env.GITHUB_WORKFLOW_REF?.includes('/.github/workflows/release.yml@'))
    throw new Error('unexpected workflow identity');
  const expected = process.env.NOXCTURNAL_RELEASE_SHA;
  if (!/^[0-9a-f]{40}$/.test(expected ?? '')) throw new Error('release SHA is missing');
  const actual = git('rev-parse', 'HEAD');
  if (actual !== expected) throw new Error(`HEAD ${actual} is not the release SHA ${expected}`);
}

function npmHasVersion(name, version_, cwd = root) {
  try {
    const published = execFileSync('npm', ['view', `${name}@${version_}`, 'version', '--json'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
      .trim()
      .replaceAll('"', '');
    return published === version_;
  } catch (error) {
    const output = `${error.stdout ?? ''}\n${error.stderr ?? ''}`;
    if (error.status === 1 && /(?:E404|404 Not Found)/i.test(output)) return false;
    throw error;
  }
}

function matrix(predicate) {
  return JSON.stringify({
    include: nativeTargets.filter(predicate).map(target => ({
      target: target.rustTarget,
      runner: target.smokeRunner,
    })),
  });
}

function run(command_, ...args) {
  execFileSync(command_, args, { cwd: root, stdio: 'inherit' });
}

function git(...args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

function readJson(filename) {
  return JSON.parse(fs.readFileSync(path.join(root, filename), 'utf8'));
}
