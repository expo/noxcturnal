import { afterEach, expect, test, vi } from 'vitest';
import {
  defineNativePipeline,
  defineNativePlugin,
  defineVisitor,
  pipelineCacheKey,
  transform,
  TransformSyntaxError,
  type SyntaxFeature,
} from '../../index';
import { native } from '../../native/binding';
import { NativeTransformSession } from '../session';

afterEach(() => vi.restoreAllMocks());

test.each<[SyntaxFeature, string, boolean]>([
  ['AsyncFunction', '// async class super\nconst text="async function f(){}";', false],
  ['AsyncFunction', 'const obj={async: 1}; function ordinary(){}', false],
  ['AsyncFunction', 'async function actual(){}', true],
  ['AsyncFunction', 'const actual=async ()=>1;', true],
  ['AsyncFunction', 'const obj={async actual(){}};', true],
  ['GeneratorFunction', 'function ordinary(){}; const text="function* generator(){}";', false],
  ['GeneratorFunction', 'function* actual(){yield 1}', true],
  ['GeneratorFunction', 'const obj={*actual(){yield 1}};', true],
  ['Class', 'const text="class Fake{}"; const obj={class: 1};', false],
  ['Class', 'const Actual=class {};', true],
  ['Super', 'class Base{}; class Actual extends Base{}', false],
  ['Super', 'class Base{}; class Actual extends Base{method(){return super.method()}}', true],
  ['ImportDeclaration', 'const text="import value from pkg";', false],
  ['ImportDeclaration', 'import value from "pkg";', true],
])('selects %s from parsed syntax in %s', (feature, source, applicable) => {
  let visits = 0;
  const result = transform(
    source,
    'input.js',
    defineNativePipeline({
      phases: [
        {
          name: 'syntax',
          plugins: [
            defineNativePlugin({
              name: 'guarded',
              contract: { syntax: { anyOf: [feature] } },
              visitors: [
                defineVisitor('Program', {}, () => {
                  visits++;
                }),
              ],
            }),
          ],
        },
      ],
    }),
  );
  expect(result.status).toBe('complete');
  expect(visits).toBe(Number(applicable));
});

test('rejects every hook and all retention and hydration before opening an indexed session', () => {
  const hook = vi.fn();
  const materialize = vi.spyOn(native.NativeParsedSource.prototype, 'materialize');
  const route = vi.spyOn(NativeTransformSession.prototype, 'nextRoutedPacked');
  const children = vi.spyOn(NativeTransformSession.prototype, 'prefetchChildren');
  const plugin = defineNativePlugin({
    name: 'irrelevant-repair',
    contract: { syntax: { anyOf: ['AsyncFunction', 'Super'] } },
    createState: hook,
    pre: hook,
    analyze: hook,
    apply: hook,
    post: hook,
    cleanup: hook,
    visitors: [
      defineVisitor(
        'Program',
        {
          scope: true,
          children: { body: { route: 'Statement' } },
        },
        hook,
      ),
    ],
  });
  const source = '/* async super */ const value = "async function fake(){}";';
  const baseline = transform(source, 'input.js', defineNativePipeline({ phases: [] }), {
    functionMap: true,
  });
  const result = transform(
    source,
    'input.js',
    defineNativePipeline({
      phases: [{ name: 'repair', plugins: [plugin] }],
    }),
    { functionMap: true },
  );
  expect(result).toEqual(baseline);
  expect(hook).not.toHaveBeenCalled();
  expect(materialize).not.toHaveBeenCalled();
  expect(route).not.toHaveBeenCalled();
  expect(children).not.toHaveBeenCalled();
});

test('omits rejected later-phase capabilities from speculative retention and consumes the input parse', () => {
  const facts = vi.spyOn(native.NativeParsedSource.prototype, 'syntaxFacts');
  const materialize = vi.spyOn(native.NativeParsedSource.prototype, 'materialize');
  const summaries: ReturnType<NativeTransformSession['retentionDebugSummary']>[] = [];
  const originalRoute = NativeTransformSession.prototype.nextRoutedPacked;
  const routed = vi
    .spyOn(NativeTransformSession.prototype, 'nextRoutedPacked')
    .mockImplementation(function (this: NativeTransformSession, manifest, root) {
      const result = originalRoute.call(this, manifest, root);
      summaries.push(this.retentionDebugSummary());
      return result;
    });
  const active = defineNativePlugin({
    name: 'active',
    visitors: [defineVisitor('Program', {}, () => {})],
  });
  const rejected = defineNativePlugin({
    name: 'rejected',
    contract: { syntax: { anyOf: ['Class'] } },
    visitors: [
      defineVisitor('Identifier', { scope: true, fields: ['name', 'global'] }, () => {}),
      defineVisitor('Program', { children: { body: { route: 'Statement' } } }, () => {}),
    ],
  });
  const result = transform(
    'const value = external;',
    'input.js',
    defineNativePipeline({
      phases: [
        { name: 'active', plugins: [active] },
        { name: 'rejected', plugins: [rejected] },
        { name: 'active-again', plugins: [active] },
      ],
    }),
  );
  expect(result.status).toBe('complete');
  expect(facts).toHaveBeenCalledTimes(1);
  expect(materialize).toHaveBeenCalledTimes(1);
  const session = materialize.mock.results[0].value;
  expect(summaries).toHaveLength(1);
  expect(summaries[0]).toMatchObject({ retainedEdgeCount: 0, scalarFieldWordCount: 0 });
  expect(routed.mock.contexts.length).toBe(1);
  expect(() =>
    (materialize.mock.contexts[0] as InstanceType<typeof native.NativeParsedSource>).syntaxFacts(),
  ).toThrow('parsed-source-consumed');
  expect(() => session.retentionDebugSummary()).toThrow('session-closed');
});

test('rechecks syntax after edits while keeping same-phase observation immutable', () => {
  let executions = 0;
  const guarded = defineNativePlugin({
    name: 'async-repair',
    contract: { syntax: { anyOf: ['AsyncFunction'] }, metadata: { writes: ['repaired'] } },
    visitors: [
      defineVisitor('Program', {}, path => {
        executions++;
        path.context.metadata.set('repaired', true);
        path.context.appendToProgram('observed();');
      }),
    ],
  });
  const add = defineNativePlugin({
    name: 'introduce-async',
    pre(context) {
      context.appendToProgram('async function added(){}');
    },
  });
  const result = transform(
    'const value = 1;',
    'input.js',
    defineNativePipeline({
      phases: [
        { name: 'introduce', plugins: [add, guarded] },
        { name: 'observe', plugins: [guarded] },
      ],
    }),
  );
  expect(result.status).toBe('complete');
  expect(executions).toBe(1);
  if (result.status !== 'complete') throw new Error('Unexpected bailout');
  expect(result.metadata.repaired).toBe(true);
  expect(result.code).toContain('async function added(){}');
  expect(result.code).toContain('observed();');
  expect(result.map.mappings.length).toBeGreaterThan(0);
});

test('expires retained capabilities after skipped phases exhaust the lookahead window', () => {
  const active = defineNativePlugin({
    name: 'initial-observer',
    visitors: [defineVisitor('Program', {}, () => {})],
  });
  const rejected = defineNativePlugin({
    name: 'class-only',
    contract: { syntax: { anyOf: ['Class'] } },
  });
  let statements = 0;
  const later = defineNativePlugin({
    name: 'later-children',
    visitors: [
      defineVisitor('Program', { children: { body: { route: 'Statement' } } }, path => {
        const body = path.get('body');
        statements = Array.isArray(body) ? body.length : 0;
      }),
    ],
  });
  const result = transform(
    'const retained = 1; retained;',
    'input.js',
    defineNativePipeline({
      phases: [
        { name: 'initial', plugins: [active] },
        ...Array.from({ length: 8 }, (_, index) => ({
          name: `skipped-${index}`,
          plugins: [rejected],
        })),
        { name: 'later', plugins: [later] },
      ],
    }),
  );
  expect(result.status).toBe('complete');
  expect(statements).toBe(2);
});

test.each(['break;', 'let duplicate; let duplicate;', 'const = ;'])(
  'still throws for invalid input when every plugin is rejected: %s',
  source => {
    const plugin = defineNativePlugin({
      name: 'async-only',
      contract: { syntax: { anyOf: ['AsyncFunction'] } },
    });
    expect(() =>
      transform(
        source,
        'input.js',
        defineNativePipeline({
          phases: [{ name: 'syntax', plugins: [plugin] }],
        }),
      ),
    ).toThrow(TransformSyntaxError);
  },
);

test('analysis rejection avoids child hydration while preserving lifecycle behavior', () => {
  const children = vi.spyOn(NativeTransformSession.prototype, 'prefetchChildren');
  const post = vi.fn();
  const cleanup = vi.fn();
  const visit = vi.fn();
  const plugin = defineNativePlugin({
    name: 'analyzed-irrelevant',
    analyze: () => ({ status: 'irrelevant' }),
    visitors: [defineVisitor('Program', { children: { body: { route: 'Statement' } } }, visit)],
    post,
    cleanup,
  });
  const result = transform(
    'const value = 1;',
    'input.js',
    defineNativePipeline({
      phases: [{ name: 'analysis', plugins: [plugin] }],
    }),
  );
  expect(result.status).toBe('complete');
  expect(children).not.toHaveBeenCalled();
  expect(visit).not.toHaveBeenCalled();
  expect(post).toHaveBeenCalledTimes(1);
  expect(cleanup).toHaveBeenCalledWith('complete', undefined);
});

test('includes syntax requirements in the pipeline cache key and freezes their values', () => {
  const features: SyntaxFeature[] = ['AsyncFunction'];
  const plugin = defineNativePlugin({ name: 'guarded', contract: { syntax: { anyOf: features } } });
  const pipeline = defineNativePipeline({ phases: [{ name: 'guarded', plugins: [plugin] }] });
  const key = pipelineCacheKey(pipeline, 'input.js');
  features.push('Class');
  expect(plugin.contract?.syntax?.anyOf).toEqual(['AsyncFunction']);
  expect(pipelineCacheKey(pipeline, 'input.js')).toBe(key);
  const changed = defineNativePipeline({
    phases: [
      {
        name: 'guarded',
        plugins: [
          defineNativePlugin({ name: 'guarded', contract: { syntax: { anyOf: ['Class'] } } }),
        ],
      },
    ],
  });
  expect(pipelineCacheKey(changed, 'input.js')).not.toBe(key);
});

test.each([{ anyOf: [] }, { anyOf: ['unknown-syntax'] }])(
  'rejects invalid syntax requirements: %j',
  ({ anyOf }) => {
    expect(() =>
      defineNativePipeline({
        phases: [
          {
            name: 'invalid',
            plugins: [
              defineNativePlugin({
                name: 'invalid',
                contract: { syntax: { anyOf: anyOf as SyntaxFeature[] } },
              }),
            ],
          },
        ],
      }),
    ).toThrow('syntax.anyOf requires a nonempty list of syntax features');
  },
);

test('rejects invalid syntax requirements in a pipeline passed directly to transform', () => {
  expect(() =>
    transform('const value = 1;', 'input.js', {
      phases: [
        {
          name: 'invalid',
          plugins: [defineNativePlugin({ name: 'invalid', contract: { syntax: { anyOf: [] } } })],
        },
      ],
    }),
  ).toThrow('syntax.anyOf requires a nonempty list of syntax features');
});

test('rechecks applicability after a native phase removes async syntax', () => {
  let visits = 0;
  const guarded = defineNativePlugin({
    name: 'observe-async',
    contract: { syntax: { anyOf: ['AsyncFunction'] } },
    visitors: [
      defineVisitor('Program', {}, () => {
        visits++;
      }),
    ],
  });
  const result = transform(
    'async function load(){return 1}',
    'input.js',
    defineNativePipeline({
      phases: [
        { name: 'before', plugins: [guarded] },
        { name: 'lower-async', native: { transforms: { asyncFunctions: true } } },
        { name: 'after', plugins: [guarded] },
      ],
    }),
  );
  expect(result.status).toBe('complete');
  expect(visits).toBe(1);
  if (result.status !== 'complete') throw new Error('Unexpected bailout');
  expect(result.code).not.toContain('async function');
  expect(result.map.mappings.length).toBeGreaterThan(0);
});

test('preserves diagnostics, pristine bailouts and cleanup for applicable plugins', () => {
  const cleanup = vi.fn();
  const source = 'async function load(){}';
  const plugin = defineNativePlugin({
    name: 'unsupported-async',
    contract: { syntax: { anyOf: ['AsyncFunction'] } },
    pre(context) {
      context.diagnostic({ code: 'repair', message: 'Needs compatibility handling' });
      context.appendToProgram('pendingEdit();');
    },
    analyze: () => ({ status: 'unsupported', reason: 'compatibility-boundary' }),
    cleanup,
  });
  const result = transform(
    source,
    'input.js',
    defineNativePipeline({
      phases: [{ name: 'repair', plugins: [plugin] }],
    }),
  );
  expect(result).toMatchObject({
    status: 'bailout',
    source,
    reason: 'unsupported-async:compatibility-boundary',
    diagnostics: [
      {
        code: 'repair',
        message: 'Needs compatibility handling',
        plugin: 'unsupported-async',
        phase: 'repair',
      },
    ],
  });
  expect(cleanup).toHaveBeenCalledWith('bailout', undefined);
});

test('hydrates a supported sibling sharing a route with an analysis-rejected plugin', () => {
  const rejected = defineNativePlugin({
    name: 'rejected',
    analyze: () => ({ status: 'irrelevant' }),
    visitors: [
      defineVisitor('Program', { children: { body: { route: 'Statement' } } }, () => {
        throw new Error('Rejected visitor ran');
      }),
    ],
  });
  let statements = 0;
  const supported = defineNativePlugin({
    name: 'supported',
    visitors: [
      defineVisitor('Program', { children: { body: { route: 'Statement' } } }, path => {
        const body = path.get('body');
        statements = Array.isArray(body) ? body.length : 0;
      }),
    ],
  });
  const result = transform(
    'const value=1; value;',
    'input.js',
    defineNativePipeline({
      phases: [{ name: 'shared', plugins: [rejected, supported] }],
    }),
  );
  expect(result.status).toBe('complete');
  expect(statements).toBe(2);
});
