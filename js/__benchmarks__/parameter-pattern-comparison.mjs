// node js/__benchmarks__/parameter-pattern-comparison.mjs BASE_RELEASE_ADDON BRANCH_RELEASE_ADDON
// Compares the native transform boundary; JS orchestration is unchanged on this branch.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { performance } from 'node:perf_hooks';

const require = createRequire(import.meta.url);
const paths = process.argv.slice(2);
assert.equal(paths.length, 2, 'Provide base and branch release addon paths');
const addons = paths.map(path => require(resolve(path)));
const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
let sink;
function measure(functions) {
  for (const fn of functions) for (let i = 0; i < 200; i++) sink = fn();
  const before = performance.now();
  for (let i = 0; i < 100; i++) sink = functions[1]();
  const iterations = Math.min(
    1000000,
    Math.max(10, Math.ceil(20 / ((performance.now() - before) / 100))),
  );
  const samples = [[], []];
  for (let round = 0; round < 15; round++) {
    for (const index of round % 2 ? [1, 0] : [0, 1]) {
      const fn = functions[index];
      const start = performance.now();
      for (let i = 0; i < iterations; i++) sink = fn();
      samples[index].push((performance.now() - start) / iterations);
    }
  }
  const medians = samples.map(median);
  return { iterations, medians, changePercent: (medians[1] / medians[0] - 1) * 100, samples };
}
const cases = [];
for (const size of [1, 100]) {
  const repeat = text => Array.from({ length: size }, (_, i) => text(i)).join('\n');
  for (const mode of ['inline', 'runtime']) {
    const helpers = { helpersMode: mode, helpersVersion: '7.29.7' };
    const strictRest = {
      objectRestSpread: true,
      objectRestSpreadLoose: false,
      objectRestSpreadUseBuiltIns: false,
    };
    const looseRest = {
      objectRestSpread: true,
      objectRestSpreadLoose: true,
      objectRestSpreadUseBuiltIns: false,
    };
    for (const [name, source, options, lowered] of [
      ['absent parameters', repeat(i => `const value${i}=input.value+${i};`), { parameters: true }],
      ['absent object rest', repeat(i => `const value${i}=input.value+${i};`), strictRest],
      [
        'default parameters',
        repeat(i => `function f${i}(a=${i}){return a}`),
        { parameters: true },
        /function f\d+\(a\s*=/,
      ],
      [
        'parameter body scope',
        repeat(i => `function f${i}(a=outer){var outer=1;return a+outer}`),
        { parameters: true },
        /function f\d+\(a\s*=/,
      ],
      [
        'generator defaults',
        repeat(i => `function* f${i}(a=${i}){yield a}`),
        { parameters: true },
        /f\d+\(a\s*=/,
      ],
      [
        'lexical arrow parameters',
        repeat(i => `function f${i}(){return(a=input)=>[this,a,arguments.length]}`),
        { parameters: true },
        /a\s*=\s*input/,
      ],
      [
        'destructured rest parameters',
        repeat(i => `function f${i}(...[a,b]){return a+b}`),
        { parameters: true },
        /\.\.\./,
      ],
      [
        'array rest',
        repeat(i => `const [a${i},...rest${i}]=input;`),
        { destructuring: true },
        /\.\.\./,
      ],
      [
        'strict rest excluded key',
        repeat(i => `const {a:a${i},...rest${i}}=input;`),
        strictRest,
        /\.\.\./,
      ],
      [
        'strict rest empty exclusions',
        repeat(i => `const {...rest${i}}=input;`),
        strictRest,
        /\.\.\./,
      ],
      [
        'loose rest excluded key',
        repeat(i => `const {a:a${i},...rest${i}}=input;`),
        looseRest,
        /\.\.\./,
      ],
      [
        'object rest parameters',
        repeat(i => `function f${i}({a,...rest}){return rest}`),
        strictRest,
        /\.\.\./,
      ],
      [
        'destructured for-of head',
        repeat(() => 'for(const {a,...rest} of input){consume(rest)}'),
        { destructuring: true },
        /\.\.\./,
      ],
      [
        'static block assignment',
        repeat(i => `class C${i}{static{let a,r;({a,...r}=input)}}`),
        strictRest,
        /\.\.\./,
      ],
      [
        'default derived class',
        repeat(i => `class C${i} extends Base{}`),
        { classes: true },
        /\bclass\s+C\d+/,
      ],
      [
        'deferred class receiver',
        repeat(
          i =>
            `class C${i} extends Base{constructor(){const read=()=>this;super();this.ok=read()===this}}`,
        ),
        { classes: true },
        /\bclass\s+C\d+/,
      ],
    ])
      cases.push({
        name: `${name}, ${mode}, ${size}`,
        source,
        options: { ...helpers, ...options },
        lowered,
      });
  }
}
// The production TSX workload mirrors transforms-end-to-end.bench.ts.
const tsx = Array.from(
  { length: 100 },
  (_, i) => `
  type Props${i} = { user?: { name?: string }, defaults: object };
  export class Card${i} extends React.Component<Props${i}> {
    visits = 0;
    render() {
      this.visits ||= 1;
      const { defaults, ...rest } = this.props;
      const name = this.props.user?.name ?? "Guest";
      return <View {...defaults} title={name} visits={this.visits} data={rest} />;
    }
  }
`,
).join('\n');
for (const mode of ['inline', 'runtime'])
  for (const loose of [false, true]) {
    cases.push({
      name: `production TSX, ${mode}, loose=${loose}`,
      source: tsx,
      filename: 'App.tsx',
      lowered: /\.\.\.rest|<View|\|\|=/,
      options: {
        helpersMode: mode,
        helpersVersion: '7.29.7',
        typescript: 'strip',
        jsx: 'automatic',
        jsxImportSource: 'react',
        comments: false,
        classProperties: true,
        classPropertiesLoose: true,
        logicalAssignmentOperators: true,
        optionalChaining: true,
        optionalChainingLoose: false,
        nullishCoalescingOperator: true,
        nullishCoalescingOperatorLoose: false,
        objectRestSpread: true,
        objectRestSpreadLoose: loose,
        objectRestSpreadUseBuiltIns: true,
      },
    });
  }
const filter = process.env.NOXCTURNAL_BENCH_FILTER;
console.log(
  JSON.stringify({
    node: process.version,
    platform: process.platform,
    arch: process.arch,
    addons: paths,
    samples: 15,
    filter,
    units: 'milliseconds per operation',
  }),
);
for (const entry of cases.filter(entry => !filter || entry.name.includes(filter))) {
  const functions = addons.map(
    addon => () =>
      addon.nativePreflightTransform(entry.source, entry.filename ?? 'bench.js', entry.options),
  );
  const outputs = functions.map(fn => fn());
  if (outputs.some(output => output.status !== 'complete')) {
    console.log(
      JSON.stringify({
        name: entry.name,
        skipped: true,
        outcomes: outputs.map(({ status, reason }) => ({ status, reason })),
      }),
    );
    continue;
  }
  for (const output of outputs) assert.equal(typeof output.code, 'string');
  if (entry.lowered && outputs.some(output => entry.lowered.test(output.code))) {
    console.log(
      JSON.stringify({
        name: entry.name,
        skipped: true,
        reason: 'selected syntax survives',
        lowered: outputs.map(output => !entry.lowered.test(output.code)),
      }),
    );
    continue;
  }
  console.log(
    JSON.stringify({
      kind: 'transform',
      name: entry.name,
      sourceBytes: Buffer.byteLength(entry.source),
      outputBytes: outputs.map(r => Buffer.byteLength(r.code)),
      ...measure(functions),
    }),
  );
}
const runtimeCases = [
  ['default parameters', 'function run(a=3,b=4){return a+b}', { parameters: true }, () => [], 7],
  [
    'array rest',
    'function run(input){const [a,...rest]=input;return a+rest.length}',
    { destructuring: true },
    () => [[1, 2, 3, 4]],
    4,
  ],
  [
    'whole array rest',
    'function run(input){const [...rest]=input;return rest.length}',
    { destructuring: true },
    () => [[1, 2, 3, 4]],
    4,
  ],
  [
    'object rest parameters',
    'function run({a,...rest}){return rest.b+rest.c}',
    { objectRestSpread: true, objectRestSpreadLoose: false },
    () => [{ a: 0, b: 1, c: 2 }],
    3,
  ],
  [
    'strict rest excluded key',
    'function run(input){const {a,...rest}=input;return rest.b+rest.c}',
    { objectRestSpread: true, objectRestSpreadLoose: false },
    () => [{ a: 0, b: 1, c: 2 }],
    3,
  ],
  [
    'strict rest empty exclusions',
    'function run(input){const {...rest}=input;return rest.b+rest.c}',
    { objectRestSpread: true, objectRestSpreadLoose: false },
    () => [{ a: 0, b: 1, c: 2 }],
    3,
  ],
  [
    'loose rest excluded key',
    'function run(input){const {a,...rest}=input;return rest.b+rest.c}',
    { objectRestSpread: true, objectRestSpreadLoose: true },
    () => [{ a: 0, b: 1, c: 2 }],
    3,
  ],
  [
    'default derived class',
    'class Base{}class Value extends Base{}function run(){return new Value() instanceof Base}',
    { classes: true },
    () => [],
    true,
  ],
];
for (const mode of ['inline', 'runtime'])
  for (const [name, source, options, argumentsForRun, expected] of runtimeCases) {
    if (filter && !`${name}, ${mode}`.includes(filter)) continue;
    const outputs = addons.map(addon =>
      addon.nativePreflightTransform(source, 'bench.js', {
        ...options,
        helpersMode: mode,
        helpersVersion: '7.29.7',
      }),
    );
    const functions = outputs.map(output => {
      assert.equal(output.status, 'complete', JSON.stringify(output));
      const run = new Function('require', output.code + ';return run')(require);
      const args = argumentsForRun();
      assert.deepEqual(run(...args), expected);
      return () => run(...args);
    });
    console.log(
      JSON.stringify({ kind: 'execution', name: `${name}, ${mode}`, ...measure(functions) }),
    );
  }
if (!filter) assert.notEqual(sink, undefined);
