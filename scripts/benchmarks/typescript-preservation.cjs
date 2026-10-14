const { performance } = require('node:perf_hooks');
// Pass unchanged and fixed native addon paths; both must use the same build profile.
const before = require(require('node:path').resolve(process.argv[2]));
const after = require(require('node:path').resolve(process.argv[3]));
const alias = n =>
  `import * as N from 'dependency';\n${Array.from({ length: n }, (_, i) => `import A${i} = ${i === n - 1 ? 'N' : `A${i + 1}`};`).join('\n')}\nexport const result=1;`;
const cases = [
  [
    'plain typed functions',
    Array.from(
      { length: 100 },
      (_, i) => `export function f${i}(x:number):number{return x+1}`,
    ).join('\n'),
    {},
  ],
  [
    'constant enums',
    Array.from({ length: 100 }, (_, i) => `enum E${i} { A=1, B=A+2, C=B*4 }`).join('\n'),
    {},
  ],
  [
    'getter enums',
    `const obj={get value(){return 1}};\n` +
      Array.from({ length: 100 }, (_, i) => `enum E${i} { A=obj.value }`).join('\n'),
    {},
  ],
  ['forward aliases 100', alias(100), {}],
  ['forward aliases 1000', alias(1000), {}],
  [
    'JSX prepass',
    `import {h,Fragment} from 'factory';\n` +
      Array.from(
        { length: 60 },
        (_, i) => `export function f${i}(x:number=1){return <><div>{x}</div></>}`,
      ).join('\n'),
    { jsx: 'classic', jsxPragma: 'h', jsxPragmaFrag: 'Fragment', parameters: true },
  ],
];
const results = [];
for (const [name, source, extra] of cases) {
  const opts = { typescript: 'strip', helpersMode: 'inline', ...extra };
  const run = a => {
    const r = a.nativePreflightTransform(source, 'bench.tsx', opts);
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
