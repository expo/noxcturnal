import { bench as vitestBench } from 'vitest';
import { defineNativePipeline, transform } from '../index';
import type { PreflightTransforms } from '../index';

function regexpPipeline(transforms: PreflightTransforms) {
  return defineNativePipeline({
    phases: [
      {
        name: 'regexp-benchmark',
        native: { helpers: { mode: 'inline' }, transforms },
      },
    ],
  });
}

function verifiedBench(name: string, source: string, transforms: PreflightTransforms) {
  const pipeline = regexpPipeline(transforms);
  const run = () => {
    const result = transform(source, 'regexp-benchmark.js', pipeline);
    if (result.status !== 'complete') {
      throw new Error(`benchmark transform bailed out: ${result.reason}`);
    }
    return result.code.length;
  };
  run();
  vitestBench(name, run);
}

const repeated = (count: number, pattern: string) =>
  Array.from({ length: count }, (_, index) => `export const r${index}=${pattern};`).join('\n');

verifiedBench('regexp no-op: 1,000 small literals', repeated(1_000, '/[a-z]+/g'), {
  regexpDotAll: true,
  regexpNamedCaptureGroups: true,
  regexpUnicode: true,
  regexpUnicodePropertyEscapes: true,
  regexpUnicodeSets: true,
});

verifiedBench('regexp dot-all: 1,000 literals', repeated(1_000, '/a.b/s'), {
  regexpDotAll: true,
});

verifiedBench(
  'regexp named groups: 250 nested literals',
  repeated(250, String.raw`/(?<outer>a(?<middle>b(?<inner>c+)))\k<inner>\k<outer>/`),
  { regexpNamedCaptureGroups: true },
);

verifiedBench(
  'regexp Unicode properties: 100 large classes',
  repeated(100, String.raw`/[\p{Letter}\p{Number}\p{Script=Greek}\p{Script=Cyrillic}\P{ASCII}]+/u`),
  { regexpUnicodePropertyEscapes: true },
);

verifiedBench(
  'regexp Unicode sets: 250 nested operations',
  repeated(250, String.raw`/[[\p{ASCII}&&\p{Letter}]--[A-Z]]+/v`),
  { regexpUnicodeSets: true },
);

verifiedBench(
  'regexp combined transforms: 200 literals',
  repeated(200, String.raw`/(?<token>[[\p{ASCII}&&\p{Letter}]--[A-Z]]+).\k<token>/sv`),
  {
    regexpDotAll: true,
    regexpNamedCaptureGroups: true,
    regexpUnicode: true,
    regexpUnicodePropertyEscapes: true,
    regexpUnicodeSets: true,
  },
);

for (const count of [10, 100, 1_000]) {
  verifiedBench(
    `regexp literal-count scaling: ${count}`,
    repeated(count, String.raw`/(?<word>\p{Letter}+).\k<word>/su`),
    {
      regexpDotAll: true,
      regexpNamedCaptureGroups: true,
      regexpUnicode: true,
      regexpUnicodePropertyEscapes: true,
    },
  );
}

for (const size of [16, 256, 4_096]) {
  verifiedBench(
    `regexp pattern-size scaling: ${size} atoms`,
    `export const matcher=/(?<body>${'a.'.repeat(size)})\\k<body>/s;`,
    { regexpDotAll: true, regexpNamedCaptureGroups: true },
  );
}

for (const width of [0xffff, 0x10ffff]) {
  verifiedBench(
    `regexp Unicode ignore-case range width: U+0..${width.toString(16)}`,
    String.raw`export const matcher=/[\u{0}-\u{${width.toString(16)}}]/ui;`,
    { regexpUnicode: true },
  );
}

for (const start of [0x10000, 0x80000]) {
  verifiedBench(
    `regexp sparse Unicode ignore-case range: U+${start.toString(16)}..U+10ffff`,
    String.raw`export const matcher=/[\u{${start.toString(16)}}-\u{10ffff}]/ui;`,
    { regexpUnicode: true },
  );
}

for (const count of [32, 256, 1_024]) {
  const groups = Array.from({ length: count }, (_, index) => `(?<g${index}>a)`).join('');
  const references = Array.from({ length: count }, (_, index) => `\\k<g${index}>`).join('');
  verifiedBench(
    `regexp structural-edit scaling: ${count}`,
    `const matcher=/${groups}${references}/;`,
    {
      regexpNamedCaptureGroups: true,
    },
  );

  const operations = Array.from({ length: count }, () => '--[b]').join('');
  verifiedBench(
    `regexp flat Unicode-set operation scaling: ${count}`,
    `const matcher=/[[a-z]${operations}]/v;`,
    { regexpUnicodeSets: true },
  );
}

for (const count of [32, 256, 1_024]) {
  const collisions = Array.from({ length: count }, (_, index) => `let _wrapRegExp${index + 2};`)
    .concat('let _wrapRegExp;')
    .join('');
  verifiedBench(
    `regexp helper-name collision scaling: ${count}`,
    `${collisions}const matcher=/(?<value>a)/;`,
    { regexpNamedCaptureGroups: true },
  );
}
