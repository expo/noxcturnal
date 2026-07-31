import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformSync } from 'esbuild';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const runtimePackagePath = require.resolve('@babel/runtime/package.json');
const runtimeRoot = dirname(runtimePackagePath);
const runtimePackage = JSON.parse(await readFile(runtimePackagePath, 'utf8'));
const check = process.argv.includes('--check');

const bundles = {
  INLINE_ASYNC_HELPERS: [
    'awaitAsyncGenerator',
    'asyncGeneratorDelegate',
    'asyncIterator',
    'wrapAsyncGenerator',
    'asyncToGenerator',
  ],
  INLINE_ASYNC_TO_GENERATOR: ['asyncToGenerator'],
  INLINE_USING_CTX: ['usingCtx'],
  INLINE_OBJECT_HELPERS: [
    'defineProperty',
    'extends',
    'objectDestructuringEmpty',
    'objectSpread2',
    'objectWithoutProperties',
    'toPropertyKey',
  ],
};

const dependencyPattern = /require\(["']\.\/([^"']+?)(?:\.js)?["']\)/g;
const moduleSources = new Map();

async function loadClosure(name, ordered, visiting = new Set()) {
  if (ordered.includes(name)) return;
  assert(!visiting.has(name), `cyclic Babel runtime helper dependency at ${name}`);
  visiting.add(name);
  const source = await readFile(join(runtimeRoot, 'helpers', `${name}.js`), 'utf8');
  moduleSources.set(name, source);
  const dependencies = [...source.matchAll(dependencyPattern)].map(match => match[1]);
  for (const dependency of dependencies) await loadClosure(dependency, ordered, visiting);
  visiting.delete(name);
  ordered.push(name);
}

async function buildBundle(roots) {
  const ordered = [];
  for (const name of roots) await loadClosure(name, ordered);
  const factories = ordered
    .map(name => {
      const source = moduleSources
        .get(name)
        .replace(dependencyPattern, (_, dependency) => `load("${dependency}")`);
      return `${JSON.stringify(name)}:function(module,load){${source}}`;
    })
    .join(',');
  const exports = roots
    .map(name => `${JSON.stringify(name)}:load(${JSON.stringify(name)})`)
    .join(',');
  const source = `(()=>{var factories={${factories}},cache={};function load(name){if(cache[name])return cache[name].exports;var module=cache[name]={exports:{}};factories[name](module,load);return module.exports}return{${exports}}})()`;
  const code = transformSync(source, {
    charset: 'ascii',
    legalComments: 'inline',
    minify: true,
    target: 'es2018',
  })
    .code.trim()
    .replace(/;$/, '');
  assert(!/\brequire\s*\(/.test(code), 'inline helper bundle retained a CommonJS require');
  const materialized = Function(`"use strict";return ${code}`)();
  for (const name of roots) {
    assert.equal(
      typeof materialized[name],
      'function',
      `${name} did not materialize as a function`,
    );
  }
  return {
    code,
    helpers: ordered,
    hash: `sha256-${createHash('sha256').update(code).digest('hex')}`,
  };
}

const generated = {};
for (const [name, roots] of Object.entries(bundles)) generated[name] = await buildBundle(roots);

const adapterBundles = {
  INLINE_DESTRUCTURING_ITER_HELPER: {
    roots: ['slicedToArray', 'toArray'],
    binding: '_toArray2',
    adapter:
      'function _toArray(value,count,all){return all?_toArray2.toArray(value):_toArray2.slicedToArray(value,count)}',
  },
  INLINE_DESTRUCTURING_OBJECT_HELPER: {
    roots: ['objectDestructuringEmpty'],
    binding: '_objectDestructuringEmpty2',
    adapter:
      'function _objectDestructuringEmpty(value){_objectDestructuringEmpty2.objectDestructuringEmpty(value);return value}',
  },
  INLINE_DESTRUCTURING_REST_HELPER: {
    roots: ['objectDestructuringEmpty', 'objectWithoutProperties'],
    binding: '_objectWithoutProperties2',
    adapter:
      'function _objectWithoutProperties(value,excluded){_objectWithoutProperties2.objectDestructuringEmpty(value);return _objectWithoutProperties2.objectWithoutProperties(value,excluded)}',
  },
  INLINE_DESTRUCTURING_LOOSE_REST_HELPER: {
    roots: ['objectDestructuringEmpty', 'objectWithoutPropertiesLoose'],
    binding: '_objectWithoutProperties2',
    adapter:
      'function _objectWithoutProperties(value,excluded){_objectWithoutProperties2.objectDestructuringEmpty(value);return _objectWithoutProperties2.objectWithoutPropertiesLoose(value,excluded)}',
  },
  INLINE_CLASS_CONSTRUCT_HELPER: {
    roots: ['construct'],
    binding: '_construct2',
    adapter: 'function _construct(S,args,D){return _construct2.construct(S,args,D)}',
  },
  INLINE_CLASS_SUPER_GET_HELPER: {
    roots: ['get'],
    binding: '_get2',
    adapter: 'function _get(base,key,receiver){return _get2.get(base,key,receiver)}',
  },
  INLINE_CLASS_PRIVATE_HELPERS: {
    roots: ['classPrivateFieldLooseBase'],
    binding: '_classPrivateFieldLooseBase2',
    adapter:
      'function _classPrivateFieldLooseBase(receiver,key){return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(receiver,key)}function _classPrivateMethodCall(receiver,key,args){return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(receiver,key)[key].apply(receiver,args)}',
  },
  INLINE_REGEXP_NAMED_CAPTURE_HELPER: {
    roots: ['wrapRegExp'],
    binding: '_wrapRegExp2',
    adapter: 'var _wrapRegExp=_wrapRegExp2.wrapRegExp;',
  },
};
for (const [name, { roots, binding, adapter }] of Object.entries(adapterBundles)) {
  const bundle = await buildBundle(roots);
  const code = transformSync(`var ${binding}=${bundle.code};${adapter}`, {
    charset: 'ascii',
    legalComments: 'inline',
    minify: true,
    target: 'es2018',
  }).code.trim();
  generated[name] = {
    code,
    helpers: bundle.helpers,
    hash: `sha256-${createHash('sha256').update(code).digest('hex')}`,
  };
  const runtimeObject = roots
    .map(
      helper =>
        `${JSON.stringify(helper)}:require(${JSON.stringify(`@babel/runtime/helpers/${helper}`)})`,
    )
    .join(',');
  const runtimeCode = transformSync(`var ${binding}={${runtimeObject}};${adapter}`, {
    charset: 'ascii',
    legalComments: 'inline',
    minify: true,
    target: 'es2018',
  }).code.trim();
  generated[`${name}_RUNTIME`] = {
    code: runtimeCode,
    helpers: roots,
    hash: `sha256-${createHash('sha256').update(runtimeCode).digest('hex')}`,
  };
}

for (const [name, value] of Object.entries(generated)) {
  if (
    !name.startsWith('INLINE_DESTRUCTURING_') &&
    !name.startsWith('INLINE_CLASS_') &&
    !name.startsWith('INLINE_REGEXP_')
  )
    continue;
  value.prettyCode = execFileSync('cargo', ['run', '--quiet', '--bin', 'format_inline_helper'], {
    cwd: root,
    encoding: 'utf8',
    input: value.code,
  });
  value.prettyHash = `sha256-${createHash('sha256').update(value.prettyCode).digest('hex')}`;
  value.bindings = execFileSync(
    'cargo',
    ['run', '--quiet', '--bin', 'format_inline_helper', '--', '--bindings'],
    {
      cwd: root,
      encoding: 'utf8',
      input: value.code,
    },
  )
    .split('\n')
    .filter(Boolean);
}

const rustUnformatted = [
  '// @generated by scripts/generate-inline-helpers.mjs from @babel/runtime.',
  '// Do not edit by hand.',
  ...Object.entries(generated).flatMap(([name, value]) => [
    `pub const ${name}: &str = r#"${value.code}"#;`,
    ...(value.prettyCode == null
      ? []
      : [`pub const ${name}_PRETTY: &str = r#"${value.prettyCode}"#;`]),
    ...(value.bindings == null
      ? []
      : [
          `pub const ${name}_BINDINGS: &[&str] = &[${value.bindings
            .map(binding => JSON.stringify(binding))
            .join(',')}];`,
        ]),
  ]),
  '',
].join('\n');
const rust = execFileSync('rustfmt', ['--edition', '2024', '--emit', 'stdout'], {
  cwd: root,
  encoding: 'utf8',
  input: rustUnformatted,
});
const outputs = new Map([['src/generated/inline_helpers.rs', rust]]);
for (const [path, content] of outputs) {
  const target = join(root, path);
  if (check) {
    assert.equal(await readFile(target, 'utf8'), content, `${path} is stale; run pnpm codegen`);
  } else {
    await writeFile(target, content);
  }
}
