// Build the exact embedded revision's WASM parser and JavaScript transforms.
// Run inside nix develop with the pinned nixpkgs Emscripten on PATH; see the matrix README.
import babel from '@babel/core';
import flowStripTypes from '@babel/plugin-transform-flow-strip-types';
import syntaxHermesParser from 'babel-plugin-syntax-hermes-parser';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { transformSync } from 'esbuild';

const root = path.resolve(import.meta.dirname, '..');
const source = path.join(root, 'crates/hermes-parser-sys/hermes');
const revision = '17b37301da5da4a2cd55d78f9697c46c0fd96123';
const git = (...args) => execFileSync('git', ['-C', source, ...args], { encoding: 'utf8' }).trim();
if (git('rev-parse', 'HEAD') !== revision || git('status', '--porcelain') !== '')
  throw new Error('Reference build requires the clean pinned Hermes submodule');
const build = path.join(root, 'target/hermes-update-wasm');
const host = path.join(root, 'target/hermes-host');
const output = path.join(root, 'target/hermes-update-reference');
const run = (cmd, args) => execFileSync(cmd, args, { cwd: root, stdio: 'inherit' });
run('cmake', [
  '-S',
  source,
  '-B',
  host,
  '-G',
  'Ninja',
  '-DCMAKE_BUILD_TYPE=Release',
  '-DHERMES_ENABLE_NAPI=OFF',
  '-DHERMES_UNICODE_LITE=ON',
  '-DHERMES_ENABLE_INTL=OFF',
]);
run('cmake', ['--build', host, '--target', 'hermesc', '-j', '8']);
run('emcmake', [
  'cmake',
  '-S',
  source,
  '-B',
  build,
  '-G',
  'Ninja',
  '-DCMAKE_BUILD_TYPE=Release',
  '-DHERMES_ENABLE_NAPI=OFF',
  '-DHERMES_UNICODE_LITE=ON',
  '-DHERMES_ENABLE_INTL=OFF',
  '-DHERMES_ENABLE_TEST_SUITE=OFF',
  `-DIMPORT_HOST_COMPILERS=${path.join(host, 'ImportHostCompilers.cmake')}`,
]);
run('cmake', ['--build', build, '--target', 'hermes-parser-wasm', '-j', '8']);

// Transpile the pinned source, including its checked-in generated visitor keys.
// Babel's parser override understands Flow; esbuild only converts the stripped
// module syntax to CommonJS. No upstream checkout or generated source is edited.
const js = path.join(source, 'tools/hermes-parser/js');
for (const name of ['hermes-estree', 'hermes-parser']) {
  const destination = path.join(output, 'node_modules', name);
  fs.mkdirSync(destination, { recursive: true });
  fs.writeFileSync(
    path.join(destination, 'package.json'),
    JSON.stringify({ name, main: 'index.js' }),
  );
  for (const filename of fs.readdirSync(path.join(js, name, 'src'), { recursive: true })) {
    if (!filename.endsWith('.js')) continue;
    const input = path.join(js, name, 'src', filename);
    const stripped = babel.transformFileSync(input, {
      babelrc: false,
      configFile: false,
      plugins: [[syntaxHermesParser, { parseLangTypes: 'flow' }], flowStripTypes],
    });
    const target = path.join(destination, filename);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(
      target,
      transformSync(stripped.code, { format: 'cjs', target: 'node22' }).code,
    );
  }
}
// Regenerate the ABI-sensitive deserializer using the same template and C
// preprocessor as upstream's genNodeDeserializers.js/build.sh.
const deserializers = execFileSync(
  'c++',
  [
    '-E',
    '-P',
    `-I${path.join(source, 'include')}`,
    '-x',
    'c',
    path.join(js, 'scripts/templates/HermesParserNodeDeserializers.template'),
  ],
  { encoding: 'utf8' },
);
const parser = path.join(output, 'node_modules/hermes-parser');
fs.writeFileSync(path.join(parser, 'HermesParserNodeDeserializers.js'), deserializers);
fs.copyFileSync(
  path.join(build, 'bin/hermes-parser-wasm.js'),
  path.join(parser, 'HermesParserWASM.js'),
);
// This Emscripten build exposes an async factory despite the synchronous flag.
// Initialize it once before loading Hermes' synchronous JS API. The parser and
// transforms still execute the unmodified pinned sources.
fs.writeFileSync(
  path.join(output, 'initialize.cjs'),
  `module.exports = async () => {
  const wasm = require.resolve('./node_modules/hermes-parser/HermesParserWASM.js');
  const instance = await require(wasm)({quit(_status, error) { throw error; }});
  require.cache[wasm].exports = () => instance;
  return require('./node_modules/hermes-parser');
};\n`,
);
fs.writeFileSync(
  path.join(output, 'identity.json'),
  JSON.stringify(
    {
      revision,
      wasmSha256: createHash('sha256')
        .update(fs.readFileSync(path.join(parser, 'HermesParserWASM.js')))
        .digest('hex'),
      emscripten: execFileSync('emcc', ['--version'], { encoding: 'utf8' }).split('\n')[0],
      node: process.version,
    },
    null,
    2,
  ) + '\n',
);
console.log(`Exact reference: ${parser}`);
