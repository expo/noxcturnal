import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformSync } from 'esbuild';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const babelHelpers = require('@babel/helpers');
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
    'objectWithoutPropertiesLoose',
    'toPropertyKey',
  ],
  INLINE_OXC_CLASS_FEATURE_HELPERS: [
    'classPrivateFieldInitSpec',
    'classPrivateMethodInitSpec',
    'classPrivateFieldGet2',
    'classPrivateFieldSet2',
    'assertClassBrand',
    'toSetter',
    'classPrivateFieldLooseKey',
    'classPrivateFieldLooseBase',
    'superPropGet',
    'superPropSet',
    'readOnlyError',
    'writeOnlyError',
    'checkInRHS',
    'taggedTemplateLiteral',
  ],
};

const dependencyPattern = /require\(["']\.\/([^"']+?)(?:\.js)?["']\)/g;
const relativeRequirePattern = /require\s*\(\s*["']\.[^"']*["']\s*\)/g;
const moduleSources = new Map();
const moduleDependencies = new Map();

async function loadClosure(name, ordered, completed, visiting = new Set()) {
  if (completed.has(name)) return;
  assert(!visiting.has(name), `cyclic Babel runtime helper dependency at ${name}`);
  visiting.add(name);
  if (!moduleSources.has(name)) {
    const source = await readFile(join(runtimeRoot, 'helpers', `${name}.js`), 'utf8');
    require.resolve(`@babel/runtime/helpers/${name}`);
    assert.doesNotMatch(source, /\b(?:import|export)\s/, `${name} uses an unsupported ESM form`);
    const relativeRequires = [...source.matchAll(relativeRequirePattern)].map(match => match[0]);
    const recognizedRequires = [...source.matchAll(dependencyPattern)].map(match => match[0]);
    assert.deepEqual(
      relativeRequires,
      recognizedRequires,
      `${name} contains an unsupported relative CommonJS dependency`,
    );
    assert.match(source, /module\.exports\s*=/, `${name} has an unsupported export shape`);
    moduleSources.set(name, source);
    moduleDependencies.set(
      name,
      [...source.matchAll(dependencyPattern)].map(match => match[1]),
    );
  }
  for (const dependency of moduleDependencies.get(name)) {
    await loadClosure(dependency, ordered, completed, visiting);
  }
  visiting.delete(name);
  completed.add(name);
  ordered.push(name);
}

async function buildBundle(roots) {
  const ordered = [];
  const completed = new Set();
  for (const name of roots) await loadClosure(name, ordered, completed);
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
  };
}

const generated = {};
for (const [name, roots] of Object.entries(bundles)) generated[name] = await buildBundle(roots);

const compatibilityRoots = new Set([...Object.values(bundles).flat(), 'toArray']);

const adapterBundles = {
  INLINE_FOR_OF_HELPER: {
    roots: ['createForOfIteratorHelper'],
    async directInline() {
      // Use callable runtime functions directly instead of a module-loader adapter.
      await loadClosure('createForOfIteratorHelper', [], new Set());
      const dependencies = ['arrayLikeToArray', 'unsupportedIterableToArray'];
      assert.deepEqual(moduleDependencies.get('createForOfIteratorHelper'), [
        'unsupportedIterableToArray',
      ]);
      assert.deepEqual(moduleDependencies.get('unsupportedIterableToArray'), ['arrayLikeToArray']);
      assert.deepEqual(moduleDependencies.get('arrayLikeToArray'), []);
      const declarations = dependencies
        .map(name => `var ${name}=${require(`@babel/runtime/helpers/${name}`).toString()};`)
        .join('');
      return generatedDirectFragment(
        `var _createForOfIteratorHelper=(function(){${declarations}return ${require('@babel/runtime/helpers/createForOfIteratorHelper').toString()};})();`,
        [...dependencies, 'createForOfIteratorHelper'],
      );
    },
    directRuntime:
      'var _createForOfIteratorHelper=require("@babel/runtime/helpers/createForOfIteratorHelper");',
  },
  INLINE_EXTENDS_HELPER: {
    roots: ['extends'],
    directInline() {
      // Remove CommonJS self-export bookkeeping from the callable declaration.
      const source = require('@babel/runtime/helpers/extends')
        .toString()
        .replace('return module.exports = _extends =', 'return _extends =')
        .replace(
          ', module.exports.__esModule = true, module.exports["default"] = module.exports, _extends.apply',
          ', _extends.apply',
        );
      return generatedDirectFragment(source, ['extends']);
    },
    directRuntime: 'var _extends=require("@babel/runtime/helpers/extends");',
  },
  INLINE_READ_ONLY_ERROR_HELPER: {
    roots: ['readOnlyError'],
    directInline: () =>
      generatedDirectFragment(require('@babel/runtime/helpers/readOnlyError').toString(), [
        'readOnlyError',
      ]),
    directRuntime: 'var _readOnlyError=require("@babel/runtime/helpers/readOnlyError");',
  },
  INLINE_TO_PROPERTY_KEY_HELPER: {
    roots: ['toPropertyKey'],
    binding: '_toPropertyKey2',
    adapter: 'function _toPropertyKey(value){return _toPropertyKey2.toPropertyKey(value)}',
    directRuntime:
      'var _toPropertyKey2=require("@babel/runtime/helpers/toPropertyKey");function _toPropertyKey(value){return _toPropertyKey2(value)}',
  },
  INLINE_DESTRUCTURING_ITER_HELPER: {
    roots: ['slicedToArray', 'toConsumableArray'],
    binding: '_toArray2',
    adapter:
      'function _toArray(value,count,all){return all?_toArray2.toConsumableArray(value):_toArray2.slicedToArray(value,count)}',
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
  INLINE_CLASS_CONSTRUCT_ASSERT_HELPER: {
    roots: ['construct', 'assertThisInitialized'],
    binding: '_construct2',
    adapter:
      'function _construct(S,args,D){return _construct2.construct(S,args,D)}_construct.assert=_construct2.assertThisInitialized;',
  },
  INLINE_CLASS_SUPER_GET_HELPER: {
    roots: ['get'],
    binding: '_get2',
    adapter: 'function _get(base,key,receiver){return _get2.get(base,key,receiver)}',
  },
  // Preserve a super reference across assignment patterns and suspension. Babel
  // owns get/set semantics; the accessor adapter exposes an assignable target.
  INLINE_CLASS_SUPER_REFERENCE_HELPER: {
    roots: ['get', 'set'],
    binding: '_superReference2',
    adapter:
      'function _get(base,key,receiver){return _superReference2.get(base,key,receiver)}function _superReference(base,key,receiver){return {get value(){return _superReference2.get(base,key,receiver)},set value(value){_superReference2.set(base,key,value,receiver,true)}}}_superReference.set=function(base,key,receiver,value){return _superReference2.set(base,key,value,receiver,true)};',
  },
  INLINE_CLASS_SUPER_GET_SET_HELPER: {
    roots: ['get', 'set'],
    binding: '_superReference2',
    adapter:
      'function _get(base,key,receiver){return _superReference2.get(base,key,receiver)}var _superReference={set:function(base,key,receiver,value){return _superReference2.set(base,key,value,receiver,true)}};',
  },
  INLINE_CLASS_SUPER_SET_HELPER: {
    roots: ['set'],
    binding: '_superReference2',
    adapter:
      'var _superReference={set:function(base,key,receiver,value){return _superReference2.set(base,key,value,receiver,true)}};',
  },
  INLINE_CLASS_KEY_HELPER: {
    roots: ['toPropertyKey'],
    binding: '_classKey2',
    adapter: 'var _classKey=_classKey2.toPropertyKey;',
  },
  INLINE_CLASS_PRIVATE_HELPERS: {
    roots: ['classPrivateFieldLooseBase', 'classPrivateFieldLooseKey'],
    binding: '_classPrivateFieldLooseBase2',
    adapter:
      'function _classPrivateFieldLooseBase(receiver,key,optional){if(optional&&(receiver===null||receiver===void 0))return receiver;return _classPrivateFieldLooseBase2.classPrivateFieldLooseBase(receiver,key)}',
  },
  INLINE_CLASS_PRIVATE_IN_HELPER: {
    roots: ['checkInRHS'],
    binding: '_checkInRHS2',
    adapter: 'var _checkInRHS=_checkInRHS2.checkInRHS;',
  },
  INLINE_REGEXP_NAMED_CAPTURE_HELPER: {
    roots: ['wrapRegExp'],
    binding: '_wrapRegExp2',
    adapter: 'var _wrapRegExp=_wrapRegExp2.wrapRegExp;',
  },
};
for (const [name, { roots, binding, adapter, directInline, directRuntime }] of Object.entries(
  adapterBundles,
)) {
  for (const root of roots) compatibilityRoots.add(root);
  if (directInline) {
    generated[name] = await directInline();
  } else {
    const bundle = await buildBundle(roots);
    const code = transformSync(`var ${binding}=${bundle.code};${adapter}`, {
      charset: 'ascii',
      legalComments: 'inline',
      minify: true,
      target: 'es2018',
    }).code.trim();
    generated[name] = { code, helpers: bundle.helpers };
  }
  if (directRuntime) {
    generated[`${name}_RUNTIME`] = generatedDirectFragment(directRuntime, roots);
  } else {
    const runtimeObject = roots
      .map(
        helper =>
          `${JSON.stringify(helper)}:require(${JSON.stringify(`@babel/runtime/helpers/${helper}`)})`,
      )
      .join(',');
    const code = transformSync(`var ${binding}={${runtimeObject}};${adapter}`, {
      charset: 'ascii',
      legalComments: 'inline',
      minify: true,
      target: 'es2018',
    }).code.trim();
    generated[`${name}_RUNTIME`] = { code, helpers: roots };
  }
}

const compatibility = [...compatibilityRoots].sort().map(name => {
  assert(babelHelpers.list.includes(name), `${name} is not a public Babel helper`);
  assert(!babelHelpers.isInternal(name), `${name} is an internal Babel helper`);
  const minVersion = babelHelpers.minVersion(name);
  assert.match(minVersion, /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/);
  require.resolve(`@babel/runtime/helpers/${name}`);
  return { name, minVersion };
});
const inlineRoots = [];
for (const { name } of compatibility) {
  const bundle = await buildBundle([name]);
  inlineRoots.push({ name, code: bundle.code });
}

function generatedDirectFragment(source, helpers) {
  const code = transformSync(source, {
    charset: 'ascii',
    legalComments: 'inline',
    minifyWhitespace: true,
    minifySyntax: true,
    minifyIdentifiers: false,
    target: 'es2018',
  }).code.trim();
  return {
    code,
    helpers,
  };
}

function materializeGeneratedFunction(name, binding) {
  return Function(`"use strict";${generated[name].code};return ${binding}`)();
}

{
  const inlineExtends = materializeGeneratedFunction('INLINE_EXTENDS_HELPER', '_extends');
  const runtimeExtends = require('@babel/runtime/helpers/extends');
  for (const implementation of [inlineExtends, runtimeExtends]) {
    const symbol = Symbol('key');
    const target = {};
    assert.equal(implementation(target, { value: 1, [symbol]: 2 }), target);
    assert.deepEqual(target, { value: 1, [symbol]: 2 });
  }

  const inlineReadOnly = materializeGeneratedFunction(
    'INLINE_READ_ONLY_ERROR_HELPER',
    '_readOnlyError',
  );
  const runtimeReadOnly = require('@babel/runtime/helpers/readOnlyError');
  for (const implementation of [inlineReadOnly, runtimeReadOnly]) {
    assert.throws(() => implementation('value'), {
      name: 'TypeError',
      message: '"value" is read-only',
    });
  }

  const inlinePropertyKey = materializeGeneratedFunction(
    'INLINE_TO_PROPERTY_KEY_HELPER',
    '_toPropertyKey',
  );
  const runtimePropertyKey = require('@babel/runtime/helpers/toPropertyKey');
  const symbol = Symbol('property');
  for (const implementation of [inlinePropertyKey, runtimePropertyKey]) {
    assert.equal(implementation({ [Symbol.toPrimitive]: () => symbol }), symbol);
    assert.equal(implementation({ [Symbol.toPrimitive]: () => 7 }), '7');
    assert.match(
      implementation({ [Symbol.toPrimitive]: () => function callable() {} }),
      /function callable/,
    );
    assert.throws(
      () => implementation({ [Symbol.toPrimitive]: () => ({}) }),
      /@@toPrimitive must return a primitive value/,
    );
  }
}

// Parse each fragment once and return all metadata in one Cargo invocation.
const fragments = [...Object.values(generated), ...inlineRoots];
const metadata = JSON.parse(
  execFileSync('cargo', ['run', '--quiet', '--bin', 'format_inline_helper'], {
    cwd: root,
    encoding: 'utf8',
    input: JSON.stringify(fragments.map(value => value.code)),
  }),
);
assert.equal(metadata.length, fragments.length, 'helper metadata must cover every fragment');
const adaptedFragments = new Set(
  Object.keys(adapterBundles).flatMap(name => [generated[name], generated[`${name}_RUNTIME`]]),
);
for (const [index, value] of fragments.entries()) {
  const { prettyCode, bindings, globals } = metadata[index];
  value.globals = globals;
  if (adaptedFragments.has(value)) {
    value.prettyCode = prettyCode;
    value.bindings = bindings;
  }
}
const rustNames = names => `&[${names.map(name => JSON.stringify(name)).join(',')}]`;

const rustUnformatted = [
  '// @generated by scripts/generate-inline-helpers.mjs from @babel/runtime.',
  '// Do not edit by hand.',
  'use crate::preflight::helpers::GeneratedHelperFragment;',
  'use crate::preflight::helpers::GeneratedHelperCompatibility;',
  'use crate::preflight::helpers::GeneratedInlineRoot;',
  `pub static BABEL_HELPER_COMPATIBILITY: &[GeneratedHelperCompatibility] = &[${compatibility
    .map(
      ({ name, minVersion }, ordinal) =>
        `GeneratedHelperCompatibility { ordinal: ${ordinal}, name: ${JSON.stringify(name)}, runtime_path: ${JSON.stringify(name)}, min_version: ${JSON.stringify(minVersion)}, export_shape: "default" }`,
    )
    .join(',')}];`,
  `pub static BABEL_INLINE_ROOTS: &[GeneratedInlineRoot] = &[${inlineRoots
    .map(
      ({ name, code, globals }) =>
        `GeneratedInlineRoot { name: ${JSON.stringify(name)}, compact: r#"${code}"#, globals: ${rustNames(globals)} }`,
    )
    .join(',')}];`,
  ...Object.entries(generated).flatMap(([name, value]) => [
    `pub const ${name}: &str = r#"${value.code}"#;`,
    `pub const ${name}_GLOBALS: &[&str] = ${rustNames(value.globals)};`,
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
    ...(value.bindings == null || !name.endsWith('_RUNTIME')
      ? []
      : [
          `pub const ${name}_DEPENDENCIES: &[&str] = &[${value.helpers
            .map(helper => JSON.stringify(helper))
            .join(',')}];`,
        ]),
  ]),
  ...Object.keys(adapterBundles).map(
    name =>
      `pub static ${name}_DESCRIPTOR: GeneratedHelperFragment = GeneratedHelperFragment { inline_compact: ${name}, inline_pretty: ${name}_PRETTY, runtime_compact: ${name}_RUNTIME, runtime_pretty: ${name}_RUNTIME_PRETTY, inline_bindings: ${name}_BINDINGS, runtime_bindings: ${name}_RUNTIME_BINDINGS, babel_dependencies: ${name}_RUNTIME_DEPENDENCIES, inline_globals: ${name}_GLOBALS, runtime_globals: ${name}_RUNTIME_GLOBALS };`,
  ),
  '',
].join('\n');
const rust = execFileSync('rustfmt', ['--edition', '2024', '--emit', 'stdout'], {
  cwd: root,
  encoding: 'utf8',
  input: rustUnformatted,
});
const destination = join(root, 'src/generated/inline_helpers.rs');
if (check) {
  assert.equal(
    await readFile(destination, 'utf8'),
    rust,
    `${destination} is stale; run pnpm codegen`,
  );
} else {
  await writeFile(destination, rust);
}
