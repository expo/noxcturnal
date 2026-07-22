import { execFileSync } from 'node:child_process';
import { chmodSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

let hookPath;
try {
  hookPath = execFileSync('git', ['rev-parse', '--git-path', 'hooks/pre-commit'], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
} catch {
  // Package archives and dependency installations do not necessarily have Git metadata.
  process.exit(0);
}

if (!hookPath) process.exit(0);
if (!hookPath.startsWith('/')) hookPath = resolve(root, hookPath);

const hook = `#!/bin/sh
pnpm exec lint-staged --quiet --relative
`;

mkdirSync(dirname(hookPath), { recursive: true });
writeFileSync(hookPath, hook);
chmodSync(hookPath, 0o755);
