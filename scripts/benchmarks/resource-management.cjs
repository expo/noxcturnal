const { performance } = require('node:perf_hooks');
// Pass unchanged and fixed native addon paths; both must use the same build profile.
const before = require(require('node:path').resolve(process.argv[2]));
const after = require(require('node:path').resolve(process.argv[3]));
const functions = body =>
  Array.from({ length: 100 }, (_, i) => `function f${i}(){${body}}`).join('\n');
const cases = [
  ['ordinary functions', functions('using r=null;return 1;'), {}],
  ['resource closures', functions('using r=null;function read(){return r}return read;'), {}],
  [
    'colliding functions',
    functions('using r=null;var read;function read(){return r}return read;'),
    {},
  ],
  [
    'exported enums',
    'using r=null;' +
      Array.from({ length: 100 }, (_, i) => `export enum E${i}{A=1,B=2}`).join('\n'),
    {},
  ],
];
const results = [];
for (const [name, source, extra] of cases) {
  const opts = {
    ...(name === 'exported enums' ? { typescript: 'strip' } : {}),
    helpersMode: 'inline',
    explicitResourceManagement: true,
    ...extra,
  };
  const run = a => {
    const r = a.nativePreflightTransform(
      source,
      name === 'exported enums' ? 'bench.ts' : 'bench.js',
      opts,
    );
    if (r.status !== 'complete') throw Error(r.reason);
    return r.code.length;
  };
  for (let i = 0; i < 20; i++) {
    run(before);
    run(after);
  }
  const times = [[], []];
  let sizes = [];
  for (let sample = 0; sample < 21; sample++)
    for (const index of sample % 2 ? [1, 0] : [0, 1]) {
      const a = [before, after][index];
      const start = performance.now();
      for (let i = 0; i < 10; i++) sizes[index] = run(a);
      times[index].push((performance.now() - start) / 10);
    }
  results.push({ name, ms: times.map(xs => xs.sort((a, b) => a - b)[10]), bytes: sizes });
}
console.log(
  JSON.stringify(
    { node: process.version, profile: 'debug', samples: 21, batch: 10, results },
    null,
    2,
  ),
);
