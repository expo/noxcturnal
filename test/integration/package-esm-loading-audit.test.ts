import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { transformSync } from '@babel/core';
import objectRest from '@babel/plugin-transform-object-rest-spread';
import { beforeAll, describe, expect, test } from 'vitest';

const root = fileURLToPath(new URL('../../', import.meta.url));
const observations = new Map<string, unknown>();

beforeAll(() => {
  // Exercise fresh published entry points, outside Vitest's module rewriting.
  execFileSync('pnpm', ['build:js'], { cwd: root, stdio: 'pipe' });
  for (const mode of ['require', 'import']) {
    const load =
      mode === 'require'
        ? `createRequire(import.meta.url)('noxcturnal')`
        : `await import('noxcturnal')`;
    const script = `
      import { createRequire } from 'node:module';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
      import { runInNewContext } from 'node:vm';
      let observation;
      try {
        const api = ${load};
        const pipeline = api.defineNativePipeline({ phases: [{
          name: 'parameters',
          native: { transforms: { parameters: true }, helpers: { mode: 'inline' } },
        }] });
        const result = api.transform(
          'function read(value = 3) { return value; } globalThis.result = read();',
          'fixture.js', pipeline,
        );
        const context = {};
        runInNewContext(result.code, context);
        observation = { status: result.status, value: context.result };
      } catch (error) {
        observation = { name: error.name, message: error.message };
      }
      console.log(JSON.stringify(observation));
    `;
    observations.set(
      mode,
      JSON.parse(
        execFileSync(process.execPath, ['--input-type=module', '--eval', script], {
          cwd: root,
          encoding: 'utf8',
        }),
      ),
    );
  }
  assert.deepEqual(observations.get('require'), { status: 'complete', value: 3 });
  assert.deepEqual(observations.get('import'), {
    name: 'ReferenceError',
    message: '__dirname is not defined in ES module scope',
  });
}, 120_000);

test('built CommonJS package entry loads and executes a native transform', () => {
  assert.deepEqual(observations.get('require'), { status: 'complete', value: 3 });
});

test('built package supports native/visitor composition and diagnostics on the selected Node runtime', () => {
  const executable = process.env.NOXCTURNAL_AUDIT_NODE ?? process.execPath;
  const script = `
    const assert = require('node:assert/strict');
    const api = require('noxcturnal');
    let visits = 0;
    let diagnostic;
    const plugin = api.defineNativePlugin({
      name: 'runtime-smoke',
      visitors: [api.defineVisitor('NumericLiteral', { fields: ['value'] }, path => {
        if (path.node.value === 3) {
          visits++;
          diagnostic = path.buildCodeFrameError('runtime diagnostic');
          path.replaceWith('4');
        }
      })],
    });
    const pipeline = api.defineNativePipeline({ phases: [
      { name: 'parameters', native: { transforms: { parameters: true } } },
      { name: 'visitor', plugins: [plugin] },
    ] });
    const result = api.transform('function read(value=3){return value}globalThis.result=read();', 'fixture.js', pipeline);
    assert.equal(result.status, 'complete');
    assert.equal(visits, 1);
    const context = {};
    new Function('globalThis', result.code)(context);
    assert.equal(context.result, 4);
    assert.ok(diagnostic instanceof api.NativeTransformError);
    assert.match(diagnostic.message, /runtime diagnostic/);
    assert.ok(diagnostic.diagnostics.length > 0);
    const parsing = api.defineNativePipeline({ phases: [{ name: 'parse', plugins: [plugin] }] });
    assert.throws(() => api.transform('const =;', 'invalid.js', parsing), error => {
      assert.ok(error instanceof api.TransformSyntaxError);
      assert.match(error.codeFrame, /const =;/);
      return true;
    });
    assert.equal(api.classify('fixture.ts', 'const value: number = 1').syntax, 'ts');
    console.log(JSON.stringify({ node: process.version, value: context.result }));
  `;
  const observation = JSON.parse(
    execFileSync(executable, ['--eval', script], {
      cwd: root,
      encoding: 'utf8',
      timeout: 30_000,
    }),
  );
  expect(observation.value).toBe(4);
  expect(observation.node).toBe(
    execFileSync(executable, ['--version'], { encoding: 'utf8' }).trim(),
  );
});

test.fails('built ESM package entry loads and executes a native transform', () => {
  assert.deepEqual(observations.get('import'), { status: 'complete', value: 3 });
});

// Share the fresh package build above with isolated native crash regressions.
const require = createRequire(import.meta.url);
const packageEntry = fileURLToPath(new URL('../../dist/noxcturnal.js', import.meta.url));
const configs = [
  { loose: false, useBuiltIns: false },
  { loose: false, useBuiltIns: true },
  { loose: true, useBuiltIns: false },
  { loose: true, useBuiltIns: true },
];
function observe(code: string): unknown {
  const context: { result?: unknown } = {};
  new Function('globalThis', code)(context);
  return context.result;
}
describe.each(configs)('array tail rest loose=$loose builtins=$useBuiltIns', config => {
  describe.each(['inline', 'runtime'] as const)('%s helpers', mode => {
    describe.each(['declaration', 'assignment', 'catch', 'loop', 'parameter'])(
      '%s array tail',
      form => {
        let actual: unknown;
        const strict = !config.loose && !config.useBuiltIns;
        const fails = strict && (form === 'declaration' || form === 'assignment');
        const expected = {
          status: 'complete',
          remainingRest: false,
          value: [2, { '0': 1, '1': 2 }],
        };
        beforeAll(() => {
          expect(require('@babel/runtime/package.json').version).toBe('7.29.7');
          const source = {
            declaration: 'const [...{length,...rest}]=[1,2];globalThis.result=[length,rest];',
            assignment:
              'let length,rest;([...{length,...rest}]=[1,2]);globalThis.result=[length,rest];',
            catch: 'try{throw [1,2]}catch([...{length,...rest}]){globalThis.result=[length,rest]}',
            loop: 'for(const [...{length,...rest}] of [[1,2]]){globalThis.result=[length,rest]}',
            parameter:
              'function f([...{length,...rest}]){return [length,rest]}globalThis.result=f([1,2]);',
          }[form]!;
          expect(observe(source)).toEqual(expected.value);
          const reference = () =>
            transformSync(source, {
              configFile: false,
              babelrc: false,
              plugins: [[objectRest, config]],
            })!.code!;
          if (form === 'catch' || form === 'parameter') {
            expect(reference).toThrow(
              `Unexpected pattern parent type: ${form === 'catch' ? 'CatchClause' : 'FunctionDeclaration'}`,
            );
          } else {
            const code = reference();
            expect(code).not.toMatch(/\.\.\.rest/);
            expect(observe(code)).toEqual(expected.value);
          }
          const plan = {
            phases: [
              {
                name: 'audit',
                native: {
                  helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
                  transforms: { objectRestSpread: config },
                },
              },
            ],
          };
          // A missing recursive tail branch crashes native traversal. Bound and
          // isolate compilation so it cannot terminate Vitest or hang the suite.
          const child = spawnSync(
            process.execPath,
            [
              '-e',
              `
          const {transform,defineNativePipeline}=require(${JSON.stringify(packageEntry)});
          const result=transform(${JSON.stringify(source)},'input.js',defineNativePipeline(${JSON.stringify(plan)}));
          if(result.status!=='complete')throw new Error(JSON.stringify(result));
          const context={};
          new Function('require','globalThis',result.code)(require,context);
          console.log(JSON.stringify({status:result.status,remainingRest:/\\.\\.\\.rest/.test(result.code),value:context.result}));
        `,
            ],
            { encoding: 'utf8', timeout: 10_000 },
          );
          expect(child.error).toBeUndefined();
          if (strict && form === 'assignment') {
            expect(child.status).toBeNull();
            expect(['SIGSEGV', 'SIGABRT']).toContain(child.signal);
            actual = { nativeCrash: child.signal };
          } else {
            expect(child.signal).toBeNull();
            expect(child.status, child.stderr).toBe(0);
            actual = JSON.parse(child.stdout);
            expect(actual).toEqual({ ...expected, remainingRest: fails });
          }
        });
        (fails ? test.fails : test)('completes and removes selected object-rest syntax', () => {
          expect(actual).toEqual(expected);
        });
      },
    );
  });
});

test('runtime phase interning remains correct after its 1024-entry budget is exhausted', () => {
  const script = `
    const assert = require('node:assert/strict');
    const api = require('noxcturnal');
    const build = name => api.defineNativePipeline({ phases: [{ name, plugins: [] }] });
    const configured = build('configured-before-transform');
    api.transform('0', 'input.js', api.defineNativePipeline({ phases: [] }));
    const first = build('runtime-0');
    for (let i = 1; i < 1024; i++) {
      const name = 'runtime-' + i;
      assert.equal(build(name), build(name));
    }
    assert.equal(build('configured-before-transform'), configured);
    assert.equal(build('runtime-0'), first);
    const uncached = build('runtime-overflow');
    const rebuilt = build('runtime-overflow');
    assert.notEqual(uncached.phases[0], rebuilt.phases[0]);
    assert.equal(api.pipelineCacheKey(uncached, 'input.js'), api.pipelineCacheKey(rebuilt, 'input.js'));
    const plugin = api.defineNativePlugin({
      name: 'after-cap-edit',
      pre(context) { context.editor.update(0, context.source.length, '42'); },
    });
    for (let i = 0; i < 2; i++) {
      const pipeline = api.defineNativePipeline({ phases: [{ name: 'after-cap-edit', plugins: [plugin] }] });
      const result = api.transform('0', 'input.js', pipeline);
      assert.equal(result.status, 'complete');
      assert.equal(result.code, '42');
    }
    console.log('ok');
  `;
  expect(
    execFileSync(process.execPath, ['--eval', script], { cwd: root, encoding: 'utf8' }).trim(),
  ).toBe('ok');
});

test('pnpm packs exact native dependency versions and published entry files', () => {
  const source = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  const directory = mkdtempSync(join(tmpdir(), 'noxcturnal-pack-manifest-audit-'));
  try {
    execFileSync('pnpm', ['pack', '--pack-destination', directory], {
      cwd: root,
      stdio: 'pipe',
      timeout: 60_000,
    });
    const archives = readdirSync(directory).filter(name => name.endsWith('.tgz'));
    expect(archives).toHaveLength(1);
    const archive = join(directory, archives[0]);
    const packed = JSON.parse(
      execFileSync('tar', ['-xOf', archive, 'package/package.json'], { encoding: 'utf8' }),
    );
    const files = new Set(
      execFileSync('tar', ['-tf', archive], { encoding: 'utf8' }).trim().split('\n'),
    );
    expect(packed.version).toBe(source.version);
    expect(Object.keys(packed.optionalDependencies).sort()).toEqual(
      Object.keys(source.optionalDependencies).sort(),
    );
    expect(Object.keys(packed.optionalDependencies)).toHaveLength(8);
    for (const version of Object.values(packed.optionalDependencies))
      expect(version).toBe(source.version);
    const entry = packed.exports['.'];
    for (const condition of ['types', 'import', 'require']) {
      expect(files.has(`package/${entry[condition].replace(/^\.\//, '')}`)).toBe(true);
    }
    expect(files.has('package/package.json')).toBe(true);
    // The source condition is a repository build input, not shipped TypeScript.
    expect(files.has('package/js/index.ts')).toBe(false);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}, 90_000);
