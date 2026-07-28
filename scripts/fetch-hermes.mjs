// Fetches the pinned Hermes release into `crates/hermes-parser-sys/hermes`,
// which is what `--features flow_parser` builds against.
//
// A blobless shallow clone of one tag rather than a submodule: the checkout is
// needed only by a feature that is off by default, and `--filter=blob:none
// --depth 1` fetches a fraction of what a submodule update pulls on every one
// of the eight release runners. The pin still lives in the repository — in
// `hermes-pin.txt`, which `build.rs` reads too, so there is one copy of it.
//
//   node scripts/fetch-hermes.mjs           fetch, or verify an existing checkout
//   node scripts/fetch-hermes.mjs --check   verify only, non-zero on mismatch

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const crate = path.join(root, 'crates/hermes-parser-sys');
const checkout = path.join(crate, 'hermes');
const remote = 'https://github.com/facebook/hermes.git';
const tag = fs.readFileSync(path.join(crate, 'hermes-pin.txt'), 'utf8').trim();
const checkOnly = process.argv.includes('--check');

const git = (args, options = {}) =>
  execFileSync('git', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
    ...options,
  }).trim();

/** The tag a checkout is sitting on, or null when there is no usable checkout. */
function currentTag() {
  if (!fs.existsSync(path.join(checkout, 'include/hermes/AST/ESTree.def'))) return null;
  try {
    return git(['-C', checkout, 'describe', '--tags', '--exact-match'], { stdio: 'pipe' });
  } catch {
    return null;
  }
}

const present = currentTag();
if (present === tag) {
  process.stdout.write(`hermes ${tag} already checked out\n`);
  process.exit(0);
}

if (checkOnly) {
  process.stderr.write(
    present == null
      ? `hermes checkout missing at ${path.relative(root, checkout)}; run \`pnpm hermes:fetch\`\n`
      : `hermes checkout is at ${present}, pinned to ${tag}; run \`pnpm hermes:fetch\`\n`,
  );
  process.exit(1);
}

if (present != null) {
  process.stdout.write(`hermes checkout is at ${present}; replacing with ${tag}\n`);
  fs.rmSync(checkout, { recursive: true, force: true });
}

process.stdout.write(`cloning hermes ${tag}\n`);
execFileSync(
  'git',
  ['clone', '--filter=blob:none', '--depth', '1', '--branch', tag, remote, checkout],
  { stdio: 'inherit' },
);
