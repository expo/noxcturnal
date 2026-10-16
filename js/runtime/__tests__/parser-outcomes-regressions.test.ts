import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { buildSync } from 'esbuild';
import { expect, test } from 'vitest';
import {
  classify,
  defineNativePipeline,
  defineNativePlugin,
  defineVisitor,
  registerParserAdapter,
  transform,
  TransformSyntaxError,
} from '../../index';
import { codeFactory } from '../fragments';
import { classifyForTransform } from '../../adapters/classification';

const invalid = [
  'let x; let x;',
  'function f(a,a){"use strict";}',
  'break;',
  'continue;',
  'class C { #x; #x; }',
  'class C { method(){ return this.#missing; } }',
  'export { missing };',
  'const =;',
];
for (const mode of [
  'empty',
  'empty phase',
  'routed',
  'indexed',
  'scope',
  'identity native',
  'conditional JSX',
  'optimize',
  'parameters',
] as const) {
  test.each(invalid)(`${mode} rejects %s before observers run`, source => {
    let visits = 0;
    const plugin = defineNativePlugin({
      name: 'validation',
      visitors: [
        defineVisitor(
          'Program',
          {
            scope: mode === 'scope',
            children: mode === 'indexed' ? { body: { route: 'Statement' } } : undefined,
          },
          () => {
            visits++;
          },
        ),
      ],
    });
    const phases =
      mode === 'empty'
        ? []
        : mode === 'empty phase'
          ? [{ name: mode, plugins: [] }]
          : mode === 'identity native'
            ? [{ name: mode, native: { transforms: {} } }]
            : mode === 'conditional JSX'
              ? [{ name: mode, native: { jsx: 'automatic-if-present' as const } }]
              : mode === 'optimize'
                ? [{ name: mode, native: { optimize: { constantFolding: true } } }]
                : mode === 'parameters'
                  ? [{ name: mode, native: { transforms: { parameters: true } } }]
                  : [{ name: mode, plugins: [plugin] }];
    expect(() => transform(source, 'input.js', defineNativePipeline({ phases }))).toThrow(
      TransformSyntaxError,
    );
    expect(visits).toBe(0);
  });
}

test.each([
  '0); extra(); (0',
  '0) + (0',
  '0),(0',
  '0); /* hiding */ (0',
  '3;',
  '3 4',
  '',
  'class { #x; #x; }',
  'function(a,a){"use strict";}',
])('expression fragment rejects escaped wrappers or early errors: %s', source =>
  expect(() => codeFactory.parseExpression(source)).toThrow(/invalid expression fragment/),
);
test.each([
  '3 // trailing',
  '3 /* trailing */',
  '(3,4)',
  '({value:3})',
  'function(a){return a;}',
  'external',
  'object.#external',
])('expression fragment accepts one contextual expression: %s', source =>
  expect(() => codeFactory.parseExpression(source)).not.toThrow(),
);
test.each([
  'export { external };',
  'consume(external);',
  'class Inner { method(){ return this.#outer; } }',
])('statement fragment permits enclosing bindings: %s', source =>
  expect(() => codeFactory.parseStatements(source)).not.toThrow(),
);

test.each([
  ['\ufeff /* license */\n// @flow\nconst x = 1;', 'flow'],
  ['#!/usr/bin/env node\n/* @flow strict */\nconst x = 1;', 'flow'],
  ['// @flowing\nconst x = 1;', 'js'],
  ['\u0085// @flow\nconst x=1;', 'js'],
  ['// not@flow\nconst x = 1;', 'js'],
  ['const text = "/* @flow */";', 'js'],
  ['const text = `// @flow`;', 'js'],
  ['const text = /\\/\\* @flow \\*\\//;', 'js'],
  ['const text = 1; // @flow', 'js'],
])('Flow routing inspects only leading comment pragmas: %s', (source, syntax) => {
  expect(classify('input.JS', source).syntax).toBe(syntax);
  expect(classifyForTransform('input.JS', source).syntax).toBe(syntax);
});

test.each(['d.Ts', 'D.MTS', 'd.CtS'])('mixed case declaration extension %s', extension => {
  const filename = `input.${extension}`;
  expect(classify(filename, 'declare const x: number;').syntax).toBe('dts');
  expect(classifyForTransform(filename, '').syntax).toBe('dts');
  expect(
    transform('declare const x: number;', filename, defineNativePipeline({ phases: [] })).status,
  ).toBe('complete');
});

test.each(['js', 'jsx'] as const)('adapter output %s retains its exact grammar', syntax => {
  const unregister = registerParserAdapter({
    name: 'exact-grammar',
    version: '1',
    supports: () => true,
    compile: () => ({
      status: 'complete',
      syntax,
      code: '// @flow\nconst view = <View />;',
      map: { mappings: '', names: [] },
    }),
  });
  try {
    const run = () =>
      transform('input', 'input.custom', defineNativePipeline({ phases: [] }), {
        parserAdapter: 'exact-grammar',
      });
    if (syntax === 'js') expect(run).toThrow(TransformSyntaxError);
    else expect(run().status).toBe('complete');
  } finally {
    unregister();
  }
});

test.each(['export var value = 1;', 'export namespace Inner { export let value = 1; }'])(
  'mutable namespace remains a pristine compatibility boundary: %s',
  body => {
    const source = `namespace N { ${body} }`;
    const result = transform(
      source,
      'input.ts',
      defineNativePipeline({ phases: [{ name: 'ts', native: { typescript: 'strip' } }] }),
    );
    expect(result).toMatchObject({
      status: 'bailout',
      source,
      reason: 'ts:mutable-namespace-export',
    });
  },
);

test.each(['inline', 'runtime'] as const)(
  'lowers equivalent regexp names while rejecting invalid input (%s)',
  mode => {
    const source = String.raw`globalThis.result=/^(?<\uD835\uDC9C>a)\k<𝒜>$/u.test('aa');`;
    const pipeline = defineNativePipeline({
      phases: [
        {
          name: 'regexp',
          native: {
            helpers: { mode, moduleName: '@babel/runtime', version: '7.29.7' },
            transforms: { regexpNamedCaptureGroups: true },
          },
        },
      ],
    });
    expect(new Function(source + 'return globalThis.result;')()).toBe(true);
    const result = transform(source, 'input.js', pipeline);
    expect(result.status).toBe('complete');
    if (result.status === 'complete') {
      expect(result.code).not.toContain('(?<');
      const context = { require: createRequire(import.meta.url), result: undefined };
      runInNewContext(result.code, context);
      expect(context.result).toBe(true);
    }
    for (const bad of [
      String.raw`/(?<name>a)\k<missing>/u;`,
      source + ' let x; let x;',
      source + ' const =;',
    ]) {
      expect(() => transform(bad, 'input.js', pipeline)).toThrow(TransformSyntaxError);
    }
  },
);

test('an unused explicit adapter selector does not override native supported JS', () => {
  expect(
    transform('const value = 1;', 'input.js', defineNativePipeline({ phases: [] }), {
      parserAdapter: 'not-registered',
    }).status,
  ).toBe('complete');
});
test('built-in Flow erasure removes inferred predicates before handing off to Oxc', () => {
  const source = '// @flow\nvar f = (x): %checks => typeof x === "string";';
  const result = transform(
    source,
    'input.js',
    defineNativePipeline({
      phases: [{ name: 'native', native: { transforms: { parameters: true } } }],
    }),
  );
  expect(result.status).toBe('complete');
  if (result.status === 'complete') expect(result.code).not.toContain('%checks');
});
test('declared JS adapter output with residual Flow is invalid input', () => {
  const unregister = registerParserAdapter({
    name: 'residual-flow',
    version: '1',
    supports: () => true,
    compile: () => ({
      status: 'complete',
      syntax: 'js',
      code: '// @flow\nvar f = (x): %checks => typeof x === "string";',
      map: { mappings: '', names: [] },
    }),
  });
  try {
    expect(() =>
      transform('input', 'input.custom', defineNativePipeline({ phases: [] }), {
        parserAdapter: 'residual-flow',
      }),
    ).toThrow(TransformSyntaxError);
  } finally {
    unregister();
  }
});

test.each(['visitor', 'native'] as const)(
  'Flow input does not hide invalid %s input introduced by a later plugin',
  next => {
    const cleaned: string[] = [];
    const plugin = defineNativePlugin({
      name: 'introduce-invalid-flow',
      visitors: [
        defineVisitor('Program', {}, path => {
          path.replaceWith('var f = (x): %checks => typeof x === "string";');
        }),
      ],
      cleanup(status) {
        cleaned.push(status);
      },
    });
    const observer = defineNativePlugin({
      name: 'observe',
      visitors: [defineVisitor('Program', {}, () => {})],
    });
    const pipeline = defineNativePipeline({
      phases: [
        { name: 'edit', plugins: [plugin] },
        next === 'native'
          ? { name: 'parse', native: { transforms: { parameters: true } } }
          : { name: 'parse', plugins: [observer] },
      ],
    });
    expect(() => transform('// @flow\nconst value: number = 1;', 'input.js', pipeline)).toThrow(
      TransformSyntaxError,
    );
    expect(cleaned).toEqual(['error']);
  },
);

test.each(['const =;', 'let x; let x;'])(
  'native errors retain the edited source for typed frames: %s',
  invalidSource => {
    const plugin = defineNativePlugin({
      name: 'invalid-edit',
      visitors: [defineVisitor('Program', {}, path => path.replaceWith(invalidSource))],
    });
    try {
      transform(
        'const original = 1;',
        'edited.js',
        defineNativePipeline({
          phases: [
            { name: 'edit', plugins: [plugin] },
            { name: 'parse', native: { transforms: { parameters: true } } },
          ],
        }),
      );
      throw new Error('invalid output unexpectedly completed');
    } catch (error) {
      expect(error).toBeInstanceOf(TransformSyntaxError);
      expect((error as TransformSyntaxError).message).toContain('edited.js');
      expect((error as TransformSyntaxError).codeFrame).toContain(invalidSource);
    }
  },
);

test.each([
  {
    source: 'using value = acquire();',
    native: { transforms: { explicitResourceManagement: true } },
  },
  {
    source: 'using resource = make();',
    native: { transforms: { explicitResourceManagement: true } },
  },
  {
    source:
      "function read(value = 2) {\n  'use strict'\n  return value\n}\nglobalThis.answer = read()",
    native: { transforms: { parameters: true } },
  },
  {
    source:
      "function inspect(eval) { const hidden = () => 42; return eval('hidden()'); } export { inspect };",
    native: { optimize: { deadCodeElimination: true } },
  },
])('rejects invalid former positive fixture: $source', ({ source, native }) => {
  expect(() =>
    transform(source, 'input.js', defineNativePipeline({ phases: [{ name: 'validate', native }] })),
  ).toThrow(TransformSyntaxError);
});

test.each([false, true])(
  'batched native syntax frames use the failed intermediate source; resident=%s',
  resident => {
    const source = String.raw`// original header
const result = /(?<x>a)\k<missing>/u;`;
    const first = { name: 'print', native: { compact: true, comments: false } };
    const printed = transform(source, 'batch.js', defineNativePipeline({ phases: [first] }));
    expect(printed.status).toBe('complete');
    if (printed.status !== 'complete') throw new Error('print phase failed');
    expect(printed.code).not.toBe(source);
    const observer = defineNativePlugin({
      name: 'observe-input',
      visitors: [defineVisitor('Program', {}, () => {})],
    });
    try {
      transform(
        source,
        'batch.js',
        defineNativePipeline({
          phases: [
            ...(resident ? [{ name: 'visit', plugins: [observer] }] : []),
            first,
            { name: 'regexp', native: { transforms: { regexpNamedCaptureGroups: true } } },
          ],
        }),
      );
      throw new Error('invalid regexp unexpectedly completed');
    } catch (error) {
      expect(error).toBeInstanceOf(TransformSyntaxError);
      expect((error as TransformSyntaxError).loc.line).toBe(1);
      expect((error as TransformSyntaxError).codeFrame).toContain(printed.code);
      expect((error as TransformSyntaxError).codeFrame).not.toContain('original header');
    }
  },
);

// Bundle current sources so this regression does not depend on a prebuilt dist.
test.each(['ordinary Node', 'separate realm'] as const)(
  'native parse failures retain public syntax error details in %s',
  realm => {
    const api = (() => {
      if (realm === 'ordinary Node')
        return { transform, defineNativePipeline, TransformSyntaxError };
      const entry = fileURLToPath(new URL('../../index.ts', import.meta.url));
      const bundled = buildSync({
        entryPoints: [entry],
        bundle: true,
        platform: 'node',
        format: 'cjs',
        packages: 'external',
        write: false,
      }).outputFiles[0]!.text;
      const module = { exports: {} };
      runInNewContext(bundled, {
        module,
        exports: module.exports,
        require: createRequire(entry),
        __dirname: fileURLToPath(new URL('../../native/', import.meta.url)),
        process,
        structuredClone,
      });
      return module.exports as typeof import('../../index');
    })();
    const source = 'module.exports = <View />;';
    const pipeline = api.defineNativePipeline({
      phases: [{ name: 'parse', native: { optimize: { constantFolding: true } } }],
    });
    let caught: unknown;
    try {
      api.transform(source, 'input.ts', pipeline);
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(api.TransformSyntaxError);
    expect(caught).toMatchObject({
      code: 'TRANSFORM_SYNTAX_ERROR',
      filename: 'input.ts',
      loc: { line: 1, column: 23 },
      codeFrame: expect.stringContaining(source),
      message: expect.stringContaining('input.ts'),
    });
    expect((caught as TransformSyntaxError).codeFrame).toContain('^');
    expect((caught as TransformSyntaxError).message).not.toContain('__NOXCTURNAL_PARSE_FAILURE__');
  },
);
