// Process-isolated native comparison. Never check out or edit the embedded tree.
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const fixture = path.join(root, 'test/fixtures/flow-parser-update');
const source = path.join(root, 'crates/hermes-parser-sys/hermes');
const baseline = '73855a1475e016cec814d67578f860112ef711e1';
const candidate = '17b37301da5da4a2cd55d78f9697c46c0fd96123';
assert.equal(
  execFileSync('git', ['-C', source, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  candidate,
);
assert.equal(
  execFileSync('git', ['-C', source, 'status', '--porcelain'], { encoding: 'utf8' }).trim(),
  '',
);
const extracted = path.join(root, 'target/hermes-update-baseline-source');
// Re-extract so a previous experiment cannot silently become the baseline.
fs.rmSync(extracted, { recursive: true, force: true });
{
  fs.mkdirSync(extracted, { recursive: true });
  const archive = path.join(root, 'target/hermes-update-baseline.tar');
  const fd = fs.openSync(archive, 'w');
  try {
    execFileSync('git', ['-C', source, 'archive', baseline], { stdio: ['ignore', fd, 'inherit'] });
  } finally {
    fs.closeSync(fd);
  }
  execFileSync('tar', ['-xf', archive, '-C', extracted]);
}
const cases = JSON.parse(fs.readFileSync(path.join(fixture, 'cases.json'), 'utf8'));
const report = { baseline, candidate, cases: [] };
for (const [name, tree] of [
  ['baseline', extracted],
  ['candidate', source],
]) {
  const target = path.join(root, `target/hermes-update-${name}-probe`);
  execFileSync(
    'cargo',
    ['build', '-p', 'hermes-flow', '--features', 'parser', '--example', 'parser_update_probe'],
    {
      cwd: root,
      stdio: 'inherit',
      env: { ...process.env, HERMES_SOURCE_DIR: tree, CARGO_TARGET_DIR: target },
    },
  );
  for (const [index, row] of cases.entries()) {
    const result = spawnSync(path.join(target, 'debug/examples/parser_update_probe'), [], {
      cwd: root,
      input: row.source,
      encoding: 'utf8',
      timeout: 10_000,
    });
    assert.ifError(result.error);
    let observation;
    if (result.signal) observation = { outcome: `signal:${result.signal}` };
    else {
      assert.equal(result.status, 0, `${name}/${row.id}: ${result.stderr}`);
      const parsed = JSON.parse(result.stdout);
      observation =
        parsed.outcome === 'erased'
          ? { outcome: parsed.outcome, code: parsed.code }
          : { outcome: parsed.outcome };
    }
    report.cases[index] ??= {
      id: row.id,
      sha256: createHash('sha256').update(row.source).digest('hex'),
    };
    report.cases[index][name] = observation;
    if (name === 'candidate') {
      assert.equal(observation.outcome, row.outcome, row.id);
      if (row.outcome === 'erased') assert.equal(observation.code, row.output, row.id);
    }
  }
}
const filename = path.join(fixture, 'native-observations.json');
if (process.argv.includes('--record'))
  fs.writeFileSync(filename, JSON.stringify(report, null, 2) + '\n');
else assert.deepEqual(report, JSON.parse(fs.readFileSync(filename, 'utf8')));
console.log(`Verified ${cases.length} cases against baseline and candidate in isolated processes.`);
