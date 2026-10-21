import { readFileSync } from 'node:fs';
import { isBuiltin } from 'node:module';

import * as prettier from 'prettier';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import cjsCheck from 'rollup-plugin-cjs-check';
import dts from 'rollup-plugin-dts';

const metadata = JSON.parse(readFileSync('package.json', 'utf8'));
const entry = metadata.exports['.'];
const dependencies = Object.keys({ ...metadata.dependencies, ...metadata.peerDependencies });
const commonConfig = {
  input: { [metadata.name]: entry.source },
  external: id =>
    isBuiltin(id) || dependencies.some(name => id === name || id.startsWith(`${name}/`)),
  treeshake: {
    unknownGlobalSideEffects: false,
    tryCatchDeoptimization: false,
    moduleSideEffects: false,
  },
};

const commonPlugins = [
  resolve({
    extensions: ['.mjs', '.js', '.ts'],
    mainFields: ['module', 'jsnext', 'main'],
    preferBuiltins: false,
    browser: true,
  }),

  commonjs({
    ignoreGlobal: true,
    include: /\/node_modules\//,
  }),
];

const commonOutput = {
  dir: './',
  exports: 'auto',
  sourcemap: true,
  sourcemapExcludeSources: true,
  hoistTransitiveImports: false,
  indent: false,
  freeze: false,
  strict: false,
  generatedCode: {
    preset: 'es5',
    reservedNamesAsProps: false,
    objectShorthand: false,
    constBindings: false,
  },
};

// Provide CommonJS bindings for the native addon and code-frame loaders in ESM.
const esmNativeLoaderBanner = [
  'import { createRequire as __noxCreateRequire } from "node:module";',
  'import { dirname as __noxDirname } from "node:path";',
  'import { fileURLToPath as __noxFileURLToPath } from "node:url";',
  'const require = __noxCreateRequire(import.meta.url);',
  'const __dirname = __noxDirname(__noxFileURLToPath(import.meta.url));',
].join('\n');

const outputPlugins = [
  cjsCheck(),
  terser({
    warnings: true,
    ecma: 2015,
    keep_fnames: true,
    ie8: false,
    compress: {
      passes: 2,
      pure_getters: true,
      toplevel: true,
      booleans_as_integers: false,
      keep_fnames: true,
      keep_fargs: true,
      if_return: false,
      ie8: false,
      sequences: false,
      loops: false,
      conditionals: false,
      join_vars: false,
      reduce_vars: true,
    },
    mangle: {
      module: true,
      keep_fnames: true,
    },
    output: {
      beautify: true,
      braces: true,
      indent_level: 2,
    },
  }),
];

export default [
  {
    ...commonConfig,
    plugins: [
      ...commonPlugins,
      babel({
        babelrc: false,
        babelHelpers: 'bundled',
        extensions: ['mjs', 'js', 'jsx', 'ts', 'tsx'],
        exclude: 'node_modules/**',
        presets: [],
        plugins: [['@babel/plugin-transform-typescript', { optimizeConstEnums: true }]],
      }),
    ],
    output: [
      {
        ...commonOutput,
        format: 'esm',
        banner: esmNativeLoaderBanner,
        entryFileNames: entry.import.replace(/^\.\//, ''),
        plugins: outputPlugins,
      },
      {
        ...commonOutput,
        format: 'cjs',
        esModule: true,
        externalLiveBindings: true,
        entryFileNames: entry.require.replace(/^\.\//, ''),
        plugins: outputPlugins,
      },
    ],
  },
  {
    ...commonConfig,
    plugins: [...commonPlugins, dts()],
    output: {
      ...commonOutput,
      sourcemap: false,
      format: 'dts',
      entryFileNames: entry.types.replace(/^\.\//, ''),
      plugins: [
        {
          renderChunk(code, chunk) {
            return prettier.format(code, {
              filepath: chunk.fileName,
              parser: 'typescript',
              singleQuote: true,
              tabWidth: 2,
              printWidth: 100,
              trailingComma: 'es5',
            });
          },
        },
      ],
    },
  },
];
