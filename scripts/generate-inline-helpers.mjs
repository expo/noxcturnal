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
    hash: `sha256-${createHash('sha256').update(code).digest('hex')}`,
  };
}

const generated = {};
for (const [name, roots] of Object.entries(bundles)) generated[name] = await buildBundle(roots);

const compatibilityRoots = new Set(Object.values(bundles).flat());

const adapterBundles = {
  INLINE_FOR_OF_HELPER: {
    roots: ['createForOfIteratorHelper'],
    binding: '_createForOfIteratorHelper2',
    adapter:
      'var _createForOfIteratorHelper=_createForOfIteratorHelper2.createForOfIteratorHelper;',
  },
  INLINE_EXTENDS_HELPER: {
    roots: ['extends'],
    binding: '_extends2',
    adapter: 'var _extends=_extends2.extends;',
  },
  INLINE_READ_ONLY_ERROR_HELPER: {
    roots: ['readOnlyError'],
    binding: '_readOnlyError2',
    adapter: 'var _readOnlyError=_readOnlyError2.readOnlyError;',
  },
  INLINE_TO_PROPERTY_KEY_HELPER: {
    roots: ['toPropertyKey'],
    binding: '_toPropertyKey2',
    adapter: 'function _toPropertyKey(value){return _toPropertyKey2.toPropertyKey(value)}',
  },
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
for (const [name, { roots, binding, adapter }] of Object.entries(adapterBundles)) {
  for (const root of roots) compatibilityRoots.add(root);
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
    hash: `sha256-${createHash('sha256').update(code).digest('hex')}`,
  };
}

// Keep the for-of inline closure small: use the runtime functions directly,
// with their dependency bindings local to the initializer (no module loader).
const forOfDependencies = ['arrayLikeToArray', 'unsupportedIterableToArray'];
assert.deepEqual(moduleDependencies.get('createForOfIteratorHelper'), [
  'unsupportedIterableToArray',
]);
assert.deepEqual(moduleDependencies.get('unsupportedIterableToArray'), ['arrayLikeToArray']);
assert.deepEqual(moduleDependencies.get('arrayLikeToArray'), []);
const forOfDeclarations = forOfDependencies
  .map(name => `var ${name}=${require(`@babel/runtime/helpers/${name}`).toString()};`)
  .join('');
generated.INLINE_FOR_OF_HELPER = generatedDirectFragment(
  `var _createForOfIteratorHelper=(function(){${forOfDeclarations}return ${require('@babel/runtime/helpers/createForOfIteratorHelper').toString()};})();`,
  [...forOfDependencies, 'createForOfIteratorHelper'],
);
generated.INLINE_FOR_OF_HELPER_RUNTIME = generatedDirectFragment(
  'var _createForOfIteratorHelper=require("@babel/runtime/helpers/createForOfIteratorHelper");',
  ['createForOfIteratorHelper'],
);

// Direct callable roots do not need an object adapter. These implementations
// are still read from the installed runtime; only Babel's CommonJS self-export
// bookkeeping is removed from the inline declaration.
const extendsFunction = require('@babel/runtime/helpers/extends')
  .toString()
  .replace('return module.exports = _extends =', 'return _extends =')
  .replace(
    ', module.exports.__esModule = true, module.exports["default"] = module.exports, _extends.apply',
    ', _extends.apply',
  );
generated.INLINE_EXTENDS_HELPER = generatedDirectFragment(extendsFunction, ['extends']);
generated.INLINE_EXTENDS_HELPER_RUNTIME = generatedDirectFragment(
  'var _extends=require("@babel/runtime/helpers/extends");',
  ['extends'],
);
generated.INLINE_READ_ONLY_ERROR_HELPER = generatedDirectFragment(
  require('@babel/runtime/helpers/readOnlyError').toString(),
  ['readOnlyError'],
);
generated.INLINE_READ_ONLY_ERROR_HELPER_RUNTIME = generatedDirectFragment(
  'var _readOnlyError=require("@babel/runtime/helpers/readOnlyError");',
  ['readOnlyError'],
);
generated.INLINE_TO_PROPERTY_KEY_HELPER_RUNTIME = generatedDirectFragment(
  'var _toPropertyKey2=require("@babel/runtime/helpers/toPropertyKey");function _toPropertyKey(value){return _toPropertyKey2(value)}',
  ['toPropertyKey'],
);

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

for (const [name, value] of Object.entries(generated)) {
  if (
    !name.startsWith('INLINE_FOR_OF_') &&
    !name.startsWith('INLINE_EXTENDS_') &&
    !name.startsWith('INLINE_READ_ONLY_ERROR_') &&
    !name.startsWith('INLINE_TO_PROPERTY_KEY_') &&
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

// Resolve free globals at generation time with the same semantics used by the
// transform. Metadata describes the emitted fragment, including its dependencies.
for (const value of [...Object.values(generated), ...inlineRoots]) {
  value.globals = execFileSync(
    'cargo',
    ['run', '--quiet', '--bin', 'format_inline_helper', '--', '--globals'],
    { cwd: root, encoding: 'utf8', input: value.code },
  )
    .split('\n')
    .filter(Boolean);
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
const outputs = new Map([['src/generated/inline_helpers.rs', rust]]);
for (const [path, content] of outputs) {
  const target = join(root, path);
  if (check) {
    assert.equal(await readFile(target, 'utf8'), content, `${path} is stale; run pnpm codegen`);
  } else {
    await writeFile(target, content);
  }
}
