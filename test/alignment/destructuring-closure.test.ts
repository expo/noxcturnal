import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { transformSync } from '@babel/core';
import destructuring from '@babel/plugin-transform-destructuring';
import typescript from '@babel/plugin-transform-typescript';
import runtime from '@babel/plugin-transform-runtime';
import { beforeAll, describe, expect, test } from 'vitest';
import { compile, importCode } from '../compliance/runtime';
const require = createRequire(import.meta.url);
function observe(code: string): unknown {
  const context: { result?: unknown } = {};
  new Function('require', 'globalThis', code)(require, context);
  return context.result;
}
type Fixture = {
  name: string;
  source: string;
  nativeSource?: string;
  expected: unknown;
  baseline?: unknown;
  absent: RegExp;
};
const fixtures: Fixture[] = [
  {
    name: 'initializer versus failing close',
    source: `const events=[];const iterable={[Symbol.iterator](){return {next(){return {done:false,value:undefined}},return(){events.push('return');throw new Error('close')}}}};function initialize(){events.push('init');throw new Error('init')}try{const [value=initialize()]=iterable}catch(error){events.push(error.message)}globalThis.result=events;`,
    expected: ['init', 'return', 'init'],
    baseline: ['return', 'close'],
    absent: /const\s*\[value/,
  },
  {
    name: 'primitive iterator acquisition',
    source: `const events=[];const iterable={[Symbol.iterator](){events.push('iterator');return 1}};try{const [value]=iterable;events.push('accepted')}catch(error){events.push(error.name)}globalThis.result=events;`,
    expected: ['iterator', 'TypeError'],
    absent: /const\s*\[value/,
  },
  {
    name: 'multiple declarators retain order',
    source: `const events=[];const [a]=(events.push('first'),[1]),{b=a}=(events.push('second'),{}),c=(events.push('third'),a+b);globalThis.result=[events,a,b,c];`,
    expected: [['first', 'second', 'third'], 1, 1, 2],
    absent: /const\s*\[a/,
  },
  ...(['var', 'let'] as const).map(kind => ({
    name: `classic ${kind} initializer`,
    source: `const events=[],callbacks=[];for(${kind} [value=(events.push('default'),1)]=[];value<3;value++){callbacks.push(()=>value)}globalThis.result=[events,callbacks.map(f=>f())];`,
    expected: [['default'], kind === 'var' ? [3, 3] : [1, 2]],
    absent: /for\s*\((?:var|let)\s*\[/,
  })),
  {
    name: 'bounded iterator adapter',
    source: `function* values(){yield 1;yield 2}const [value]=values();globalThis.result=value;`,
    expected: 1,
    absent: /const\s*\[value/,
  },
  {
    name: 'full iterator adapter',
    source: `function* values(){yield 1;yield 2}const [value,...rest]=values();globalThis.result=[value,rest];`,
    expected: [1, [2]],
    absent: /\.\.\.rest/,
  },
  ...(['array', 'object'] as const).flatMap(shape =>
    (['as', 'non-null'] as const).map(wrapper => {
      const target = wrapper === 'as' ? '(box.value as number)' : 'box.value!';
      const build = (lhs: string) =>
        `const box={value:0};const source=${shape === 'array' ? '[3]' : '{a:3}'};const result=(${shape === 'array' ? `[${lhs}]` : `{a:${lhs}}`}=source);globalThis.result=[box.value,result===source];`;
      return {
        name: `${shape} ${wrapper} target`,
        source: build(target),
        nativeSource: build('box.value'),
        expected: [3, true],
        absent: shape === 'array' ? /\[\s*box\.value\s*\]\s*=/ : /\{\s*a:\s*box\.value/,
      };
    }),
  ),
];
describe.each(['inline', 'runtime', 'fallback'] as const)(
  'destructuring closure %s helpers',
  profile => {
    test.each(fixtures)('$name', fixture => {
      expect(require('@babel/runtime/package.json').version).toBe('7.29.7');
      expect(observe(fixture.nativeSource ?? fixture.source)).toEqual(fixture.expected);
      const reference = transformSync(fixture.source, {
        filename: fixture.nativeSource ? 'input.ts' : 'input.js',
        babelrc: false,
        configFile: false,
        sourceType: 'script',
        plugins: [
          ...(fixture.nativeSource ? [typescript] : []),
          destructuring,
          ...(profile === 'runtime' ? [[runtime, { version: '7.29.7', useESModules: false }]] : []),
        ],
      })!.code!;
      const baseline = fixture.baseline ?? fixture.expected;
      expect(observe(reference)).toEqual(baseline);
      const code = compile(
        fixture.source,
        {
          ...(fixture.nativeSource ? { typescript: 'strip' as const } : {}),
          transforms: { destructuring: true },
          helpers: {
            mode: profile === 'inline' ? 'inline' : 'runtime',
            moduleName: '@babel/runtime',
            version: profile === 'fallback' ? '8.0.0' : '7.29.7',
          },
        },
        fixture.nativeSource ? 'input.ts' : 'input.js',
      );
      expect(code).not.toMatch(fixture.absent);
      if (profile === 'runtime') expect(code).toContain('@babel/runtime/helpers/');
      else expect(code).not.toContain('@babel/runtime');
      expect(observe(code)).toEqual(baseline);
    });
  },
);

describe.each(['inline', 'runtime', 'fallback'] as const)(
  'exported destructuring %s helpers',
  profile => {
    let actual: unknown;
    beforeAll(async () => {
      const source = 'export let [value]=[1];export function update(){value++}';
      const original = await importCode(source);
      expect(original.value).toBe(1);
      expect(original.update).toBeTypeOf('function');
      (original.update as () => void)();
      expect(original.value).toBe(2);
      let code = compile(
        source,
        {
          transforms: { destructuring: true },
          helpers: {
            mode: profile === 'inline' ? 'inline' : 'runtime',
            moduleName: '@babel/runtime',
            version: profile === 'fallback' ? '8.0.0' : '7.29.7',
          },
        },
        'input.mjs',
      );
      expect(code).not.toMatch(/export\s+let\s*\[/);
      if (profile === 'runtime') {
        expect(code).toContain('@babel/runtime/helpers/');
        // Data URLs have no package-resolution base; resolve genuine ESM imports
        // without injecting require into the module being tested.
        code = code.replace(
          /from\s+(["'])(@babel\/runtime\/[^"']+)\1/g,
          (_match, _quote, specifier) =>
            'from ' + JSON.stringify(pathToFileURL(require.resolve(specifier)).href),
        );
      } else {
        expect(code).not.toContain('@babel/runtime');
      }
      const module = await importCode(code);
      const initial = module.value;
      expect(module.update).toBeTypeOf('function');
      (module.update as () => void)();
      actual = [initial, module.value];
    });
    test('preserves the exported live binding', () => {
      expect(actual).toEqual([1, 2]);
    });
  },
);
