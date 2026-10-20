import { transformSync } from '@babel/core';
import jsx from '@babel/plugin-transform-react-jsx';
import development from '@babel/plugin-transform-react-jsx-development';
import { expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, transform } from '../../js';
import { compile } from '../compliance/runtime';

function observe(code: string): unknown {
  const globalThis: { result?: unknown } = {};
  const factory = (_tag: unknown, props: Record<string, unknown>, ...children: unknown[]) => [
    props,
    children,
  ];
  new Function('globalThis', 'React', 'factory', 'other', 'require', code)(
    globalThis,
    { createElement: factory },
    factory,
    () => 'other',
    () => ({ jsx: factory, jsxs: factory, jsxDEV: factory }),
  );
  return globalThis.result;
}

test.each([
  '\t',
  '   ',
  '\t\t',
  '\n',
  '\r',
  '\r\n',
  '\n \n',
  'a\rb',
  'a\r\nb',
  ' a\t ',
  '&#9;',
  '&#32;&#9;',
  '&#10; a &#10;',
  'a&#13;&#10;b',
  'a\u2028\tb\u2029c',
  '\u00a0\n\u00a0',
  '&amp;lt; &unknown; &#x1f600;',
])('normalizes child text using Babel: %j', text => {
  const source = `globalThis.result=<div>${text}</div>`;
  const reference = transformSync(source, {
    configFile: false,
    babelrc: false,
    plugins: [[jsx, { runtime: 'classic' }]],
  })!.code!;
  const code = compile(source, { jsx: 'classic' }, 'input.jsx');
  expect(code).not.toContain('<div');
  expect(observe(code)).toEqual(observe(reference));
});

test.each([
  '/** @jsx first\n * @jsx other */',
  '/** @jsx factory\n * @jsx other */',
  '/** @jsx\n factory */',
  '/** @jsx \n * @jsx factory */',
  '/** @jsx factory\u2028 * @jsx other */',
  '/**\ufeff@jsx factory\ufeff*/',
  '/** @jsx\u0085factory */',
  '/** some @jsx factory */',
  '/** @jsx factory @jsx other */',
])('matches first-per-comment directive grammar: %j', comment => {
  const source = `const first=other; ${comment} globalThis.result=<div/>;`;
  const reference = transformSync(source, {
    configFile: false,
    babelrc: false,
    plugins: [[jsx, { runtime: 'classic' }]],
  })!.code!;
  expect(observe(compile(source, { jsx: 'classic' }, 'input.jsx'))).toEqual(observe(reference));
});

test.each([String.raw`\u{03c0}.create`, String.raw`π.\u0063reate`, 'π.create', 'π.default'])(
  'decodes identifier pragma %s',
  pragma => {
    const source = `const π={create(){return 7},default(){return 7}};globalThis.result=<div/>;`;
    const code = compile(source, { jsx: 'classic', jsxPragma: pragma }, 'input.jsx');
    expect(observe(code)).toBe(7);
  },
);

test.each([
  '',
  'a..b',
  'a[b]',
  'a()',
  'a.1',
  String.raw`a\u002eb`,
  String.raw`\u{110000}`,
  String.raw`\uD800`,
  String.raw`\u{}`,
])('rejects invalid pragma %j', pragma => {
  expect(() =>
    compile('const view=<div/>;', { jsx: 'classic', jsxPragma: pragma }, 'input.jsx'),
  ).toThrow(/transform-error/);
});

test.each(['classic', 'automatic'] as const)(
  'runtime directives override selected %s mode with correct props semantics',
  selected => {
    const runtime = selected === 'classic' ? 'automatic' : 'classic';
    const source = `/** @jsxRuntime ${runtime} */ const props={x:1}; globalThis.result=<div {...props} tail={2}/>;`;
    const reference = transformSync(source, {
      configFile: false,
      babelrc: false,
      sourceType: 'script',
      plugins: [[jsx, { runtime: selected }]],
    })!.code!;
    const code = compile(source, { jsx: selected }, 'input.cjs', { parser: 'jsx' });
    expect(observe(code)).toEqual(observe(reference));
    if (runtime === 'classic') expect(code).not.toContain('...props');
    else expect(code).toContain('...props');
  },
);

test.each(['\v', '\f', '\u0085', '\u2028', '\u2029', '\r', '\n', '\r\n'])(
  'indexes JSX locations across %j and long Unicode lines',
  separator => {
    const source = `/*${'😀'.repeat(180)}${separator}*/globalThis.result=<div/>;`;
    const reference = transformSync(source, {
      filename: '/audit/component.jsx',
      configFile: false,
      babelrc: false,
      plugins: [[development, { runtime: 'classic' }]],
    })!.code!;
    // __self is the same outer execution receiver; compare metadata separately.
    const actual = observe(
      compile(source, { jsx: 'classic-development' }, '/audit/component.jsx'),
    ) as [{ __source: unknown }];
    const expected = observe(reference) as [{ __source: unknown }];
    expect(actual[0].__source).toEqual(expected[0].__source);
  },
);

// A visitor boundary exercises the resident native session in addition to the
// native-only filename regressions in jsx-parser-filename-audit.test.ts.
test('retains original filename through a visitor/native boundary', () => {
  const observer = defineNativePlugin({ name: 'observe', visitors: [] });
  const result = transform(
    'globalThis.result=<div/>;',
    '/project.dir/Component',
    {
      phases: [
        { name: 'observe', plugins: [observer] },
        { name: 'jsx', native: { jsx: 'classic-development' } },
      ],
    },
    { parser: 'jsx' },
  );
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw new Error('Unexpected bailout');
  const observed = observe(result.code) as [{ __source: { fileName: string } }];
  expect(observed[0].__source.fileName).toBe('/project.dir/Component');
});

test('option conflicts are checked after a valid directive overrides the runtime', () => {
  const pipeline = defineNativePipeline({
    phases: [{ name: 'jsx', native: { jsx: 'automatic', jsxPragma: 'factory' } }],
  });
  expect(
    transform('/** @jsxRuntime classic */ const view=<div/>;', 'input.jsx', pipeline).status,
  ).toBe('complete');
  expect(() =>
    compile('const view=<div/>;', { jsx: 'classic', jsxImportSource: 'custom' }, 'input.jsx'),
  ).toThrow(/transform-error/);
});

test.each([
  { typescript: 'strip' as const },
  { jsx: 'preserve' as const, typescript: 'strip' as const },
  { typescript: 'strip' as const, transforms: { blockScoping: true } },
])('does not validate an unselected JSX runtime: %j', options => {
  const source = '/** @jsxRuntime invalid */ const value: number = 1;';
  const code = compile(source, options, 'input.tsx');
  expect(code).not.toContain(': number');
  expect(code).toContain('value');
});

test.each([false, true])(
  'validates only the final runtime comment, invalid last=%s',
  invalidLast => {
    const comment = invalidLast
      ? '/** @jsxRuntime classic */ /** @jsxRuntime typo */'
      : '/** @jsxRuntime typo */ /** @jsxRuntime classic */';
    const source = comment + 'globalThis.result=<div/>;';
    const reference = () =>
      transformSync(source, {
        configFile: false,
        babelrc: false,
        plugins: [[jsx, { runtime: 'classic' }]],
      });
    const local = () => compile(source, { jsx: 'classic' }, 'input.jsx');
    if (invalidLast) {
      expect(reference).toThrow();
      expect(local).toThrow(/transform-error/);
    } else {
      expect(observe(local())).toEqual(observe(reference()!.code!));
    }
  },
);

test.each(['classic', 'automatic'] as const)(
  'retains JSX directives inside compiler-rebuilt components from selected %s runtime',
  selected => {
    const source = `function View() {
      /** @jsxRuntime classic */
      /** @jsx factory */
      return <div/>;
    } globalThis.result=View();`;
    const code = compile(
      source,
      {
        jsx: selected,
        reactCompiler: {
          compilationMode: 'infer',
          panicThreshold: 'none',
          target: '19',
          enableResetCacheOnSourceFileChanges: false,
        },
      },
      'input.jsx',
    );
    expect(code).not.toContain('<div');
    expect(code).toContain('react/compiler-runtime');
    const result: { result?: unknown } = {};
    new Function('globalThis', 'React', 'factory', 'require', code)(
      result,
      { createElement: () => 'fallback' },
      () => 'configured',
      (path: string) => {
        expect(path).toBe('react/compiler-runtime');
        return { c: (size: number) => Array(size).fill(Symbol.for('react.memo_cache_sentinel')) };
      },
    );
    expect(result.result).toBe('configured');
  },
);

test('rejects invalid JSX directives inside compiler-rebuilt components', () => {
  expect(() =>
    compile(
      'function View(){/** @jsxRuntime typo */ return <div/>;}',
      {
        jsx: 'classic',
        reactCompiler: {
          compilationMode: 'infer',
          panicThreshold: 'none',
          target: '19',
          enableResetCacheOnSourceFileChanges: false,
        },
      },
      'input.jsx',
    ),
  ).toThrow(/transform-error/);
});
