import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { transformSync } from '@babel/core';
import objectRest from '@babel/plugin-transform-object-rest-spread';
import { afterAll, beforeAll, expect, test } from 'vitest';

const root = fileURLToPath(new URL('../../', import.meta.url));
const observations = new Map<string, unknown>();

function hostSuffix(): string {
  if (process.platform === 'darwin') return `darwin-${process.arch}`;
  if (process.platform === 'win32') return `win32-${process.arch}-msvc`;
  if (process.platform === 'linux') {
    const glibc = (
      process.report?.getReport?.() as { header?: { glibcVersionRuntime?: string } } | undefined
    )?.header?.glibcVersionRuntime;
    return `linux-${process.arch}-${glibc ? 'gnu' : 'musl'}`;
  }
  return `${process.platform}-${process.arch}`;
}

const hostBinaryName = `noxcturnal.${hostSuffix()}.node`;
const hostBinary = realpathSync(join(root, hostBinaryName));

beforeAll(() => {
  // prepack writes dist. Loading below uses that build, outside Vitest's module rewriting.
  packedArchive();
  for (const mode of ['require', 'import']) {
    const load =
      mode === 'require'
        ? `createRequire(import.meta.url)('noxcturnal')`
        : `await import('noxcturnal')`;
    const script = `
      import { createRequire } from 'node:module';
      import { realpathSync } from 'node:fs';
      import { runInNewContext } from 'node:vm';
      const require = createRequire(import.meta.url);
      let observation;
      try {
        const api = ${load};
        const pipeline = api.defineNativePipeline({ phases: [{
          name: 'parameters',
          native: { transforms: { parameters: true }, helpers: { mode: 'inline' } },
        }] });
        const result = api.transform(
          'function read(value = 3) { return value; } globalThis.result = read();',
          'fixture.js',
          pipeline,
        );
        const context = {};
        runInNewContext(result.code, context);
        const loaded = Object.keys(require.cache)
          .filter(file => file.endsWith('.node'))
          .map(file => realpathSync(file))
          .sort();
        observation = { status: result.status, value: context.result, loaded };
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
  const loaded = { status: 'complete', value: 3, loaded: [hostBinary] };
  assert.deepEqual(observations.get('require'), loaded);
  assert.deepEqual(observations.get('import'), loaded);
}, 120_000);

test('built CommonJS package entry loads and executes a native transform', () => {
  assert.deepEqual(observations.get('require'), {
    status: 'complete',
    value: 3,
    loaded: [hostBinary],
  });
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

test('built ESM package entry loads and executes a native transform', () => {
  assert.deepEqual(observations.get('import'), {
    status: 'complete',
    value: 3,
    loaded: [hostBinary],
  });
  const esm = readFileSync(join(root, 'dist/noxcturnal.mjs'), 'utf8');
  const cjs = readFileSync(join(root, 'dist/noxcturnal.js'), 'utf8');
  expect(esm).toContain('from "node:module"');
  expect(esm).toContain('import.meta.url');
  expect(cjs).not.toContain('__noxCreateRequire');
});

test('built ESM package entry formats native syntax errors', () => {
  const script = `
    const api = await import('noxcturnal');
    const plugin = api.defineNativePlugin({
      name: 'runtime-smoke',
      visitors: [api.defineVisitor('NumericLiteral', { fields: ['value'] }, () => {})],
    });
    const parsing = api.defineNativePipeline({ phases: [{ name: 'parse', plugins: [plugin] }] });
    try {
      api.transform('const =;', 'invalid.js', parsing);
      console.log(JSON.stringify({ threw: false }));
    } catch (error) {
      console.log(JSON.stringify({
        name: error.name,
        syntax: error instanceof api.TransformSyntaxError,
        frame: String(error.codeFrame ?? ''),
      }));
    }
  `;
  const observation = JSON.parse(
    execFileSync(process.execPath, ['--input-type=module', '--eval', script], {
      cwd: root,
      encoding: 'utf8',
      timeout: 30_000,
    }),
  );
  expect(observation).toMatchObject({ name: 'SyntaxError', syntax: true });
  expect(observation.frame).toContain('const =;');
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
const arrayTailForms = [
  {
    name: 'declaration',
    source: 'const [...{length,...rest}]=[1,2];globalThis.result=[length,rest];',
  },
  {
    name: 'assignment',
    source: 'let length,rest;([...{length,...rest}]=[1,2]);globalThis.result=[length,rest];',
  },
  {
    name: 'catch',
    source: 'try{throw [1,2]}catch([...{length,...rest}]){globalThis.result=[length,rest]}',
  },
  {
    name: 'loop',
    source: 'for(const [...{length,...rest}] of [[1,2]]){globalThis.result=[length,rest]}',
  },
  {
    name: 'parameter',
    source: 'function f([...{length,...rest}]){return [length,rest]}globalThis.result=f([1,2]);',
  },
];

test.each(arrayTailForms)(
  'array tail rest in $name preserves length and indexed properties',
  ({ name, source }) => {
    const value = [2, { '0': 1, '1': 2 }];
    expect(require('@babel/runtime/package.json').version).toBe('7.29.7');
    expect(observe(source)).toEqual(value);
    for (const config of configs) {
      const reference = () =>
        transformSync(source, {
          configFile: false,
          babelrc: false,
          plugins: [[objectRest, config]],
        })!.code!;
      if (name === 'catch' || name === 'parameter') {
        expect(reference).toThrow(
          `Unexpected pattern parent type: ${name === 'catch' ? 'CatchClause' : 'FunctionDeclaration'}`,
        );
      } else {
        const code = reference();
        expect(code).not.toMatch(/\.\.\.rest/);
        expect(observe(code)).toEqual(value);
      }
    }
    const cases = configs.flatMap(config =>
      ['inline', 'runtime'].map(mode => ({
        label: `${name}: loose=${config.loose}, builtins=${config.useBuiltIns}, helpers=${mode}`,
        pipeline: {
          phases: [
            {
              name: 'audit',
              native: {
                helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
                transforms: { objectRestSpread: config },
              },
            },
          ],
        },
      })),
    );
    // Keep crash isolation while sharing process startup across option modes. Print
    // the active case before entering native code so a crash identifies its mode.
    const child = spawnSync(
      process.execPath,
      [
        '-e',
        `
    const assert = require('node:assert/strict');
    const {transform,defineNativePipeline}=require(${JSON.stringify(packageEntry)});
    const observations = [];
    for (const entry of ${JSON.stringify(cases)}) {
      console.error(entry.label);
      const result=transform(${JSON.stringify(source)},'input.js',defineNativePipeline(entry.pipeline));
      assert.equal(result.status, 'complete', entry.label);
      const context={};
      new Function('require','globalThis',result.code)(require,context);
      observations.push({label:entry.label,status:result.status,remainingRest:/\\.\\.\\.rest/.test(result.code),value:context.result});
    }
    console.log(JSON.stringify(observations));
  `,
      ],
      { encoding: 'utf8', timeout: 10_000 },
    );
    expect(child.error, child.stderr).toBeUndefined();
    expect(child.signal, child.stderr).toBeNull();
    expect(child.status, child.stderr).toBe(0);
    expect(JSON.parse(child.stdout)).toEqual(
      cases.map(({ label }) => ({
        label,
        status: 'complete',
        remainingRest: false,
        value,
      })),
    );
  },
);

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

let packDirectory: string | undefined;
function packedArchive(): string {
  if (packDirectory == null) {
    packDirectory = mkdtempSync(join(tmpdir(), 'noxcturnal-pack-audit-'));
    execFileSync('pnpm', ['pack', '--pack-destination', packDirectory], {
      cwd: root,
      stdio: 'pipe',
      timeout: 60_000,
    });
  }
  const archives = readdirSync(packDirectory).filter(name => name.endsWith('.tgz'));
  expect(archives).toHaveLength(1);
  return join(packDirectory, archives[0]!);
}
afterAll(() => {
  if (packDirectory != null) rmSync(packDirectory, { recursive: true, force: true });
});

test('pnpm packs exact native dependency versions and published entry files', () => {
  const source = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  const archive = packedArchive();
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
}, 90_000);

function runInstalledPackage(cwd: string, mode: 'import' | 'require') {
  const load =
    mode === 'import'
      ? `await import('noxcturnal')`
      : `createRequire(import.meta.url)('noxcturnal')`;
  const script = `
    import { createRequire } from 'node:module';
    import { realpathSync } from 'node:fs';
    import { runInNewContext } from 'node:vm';
    const require = createRequire(import.meta.url);
    try {
      const api = ${load};
      const pipeline = api.defineNativePipeline({ phases: [{
        name: 'parameters',
        native: { transforms: { parameters: true }, helpers: { mode: 'inline' } },
      }] });
      const result = api.transform(
        'function read(value = 3) { return value; } globalThis.result = read();',
        'fixture.js',
        pipeline,
      );
      const context = {};
      runInNewContext(result.code, context);
      const loaded = Object.keys(require.cache)
        .filter(file => file.endsWith('.node'))
        .map(file => realpathSync(file))
        .sort();
      console.log(JSON.stringify({ status: result.status, value: context.result, loaded }));
    } catch (error) {
      console.log(JSON.stringify({
        name: error.name,
        code: error.code,
        message: error.message,
      }));
    }
  `;
  const env = { ...process.env };
  delete env.NODE_PATH;
  return JSON.parse(
    execFileSync(process.execPath, ['--input-type=module', '--eval', script], {
      cwd,
      encoding: 'utf8',
      timeout: 30_000,
      env,
    }),
  ) as { status?: string; value?: number; loaded?: string[]; code?: string; message?: string };
}

test('installed tarball prefers a colocated addon and falls back to the optional package', () => {
  const directory = mkdtempSync(join(tmpdir(), 'noxcturnal-installed-loader-'));
  try {
    const archive = packedArchive();
    const consumer = join(directory, 'consumer');
    mkdirSync(join(consumer, 'node_modules'), { recursive: true });
    execFileSync('tar', ['-xzf', archive, '-C', consumer]);
    const packageRoot = join(consumer, 'node_modules', 'noxcturnal');
    renameSync(join(consumer, 'package'), packageRoot);
    const localBinary = join(packageRoot, hostBinaryName);
    copyFileSync(hostBinary, localBinary);
    const optionalDir = join(consumer, 'node_modules', '@noxcturnal', `noxcturnal-${hostSuffix()}`);
    mkdirSync(optionalDir, { recursive: true });
    const optionalBinary = join(optionalDir, hostBinaryName);
    copyFileSync(hostBinary, optionalBinary);
    writeFileSync(
      join(optionalDir, 'package.json'),
      JSON.stringify({
        name: `@noxcturnal/noxcturnal-${hostSuffix()}`,
        version: '0.1.1',
        main: hostBinaryName,
      }),
    );
    const optionalPackage = `@noxcturnal/noxcturnal-${hostSuffix()}`;
    for (const mode of ['require', 'import'] as const) {
      expect(runInstalledPackage(consumer, mode)).toEqual({
        status: 'complete',
        value: 3,
        loaded: [realpathSync(localBinary)],
      });
    }
    rmSync(localBinary);
    for (const mode of ['require', 'import'] as const) {
      expect(runInstalledPackage(consumer, mode)).toEqual({
        status: 'complete',
        value: 3,
        loaded: [realpathSync(optionalBinary)],
      });
    }
    rmSync(optionalDir, { recursive: true, force: true });
    for (const mode of ['require', 'import'] as const) {
      const failure = runInstalledPackage(consumer, mode);
      expect(failure.code).toBe('MODULE_NOT_FOUND');
      expect(failure.message).toContain(optionalPackage);
      expect(failure.status).toBeUndefined();
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}, 120_000);
