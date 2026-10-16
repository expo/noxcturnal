import { expect, test } from 'vitest';
import {
  composeNativePipeline,
  defineNativePipeline,
  defineNativePlugin,
  definePipelinePhase,
  defineVisitor,
  NativeTransformError,
  transform,
} from '../../index';

for (const filename of ['input.js', 'input.txt']) {
  for (const thrown of [undefined, null, false, 0, 'cleanup']) {
    test(`cleanup preserves ${String(thrown)} and all peers for ${filename}`, () => {
      const calls: unknown[] = [];
      const plugins = [0, 1, 2].map(id =>
        defineNativePlugin({
          name: 'same-name',
          createState: () => id,
          cleanup(reason, state) {
            calls.push([reason, state]);
            if (id === 0) throw thrown;
            if (id === 1) throw new Error('later');
          },
        }),
      );
      let caught: unknown;
      try {
        transform('1;', filename, defineNativePipeline({ phases: [{ name: 'scan', plugins }] }));
      } catch (error) {
        caught = error;
      }
      expect(caught).toBeInstanceOf(NativeTransformError);
      expect((caught as NativeTransformError).cause).toBe(thrown);
      expect(calls).toEqual(
        [0, 1, 2].map(id => [filename.endsWith('.js') ? 'complete' : 'bailout', id]),
      );
    });
  }
  test(`duplicate definitions reject before preparation in any phase for ${filename}`, () => {
    const calls: string[] = [];
    const plugin = defineNativePlugin({
      name: 'duplicate',
      createState() {
        calls.push('create');
      },
      pre() {
        calls.push('pre');
      },
      cleanup() {
        calls.push('cleanup');
      },
    });
    // Exercise the public structural pipeline type too, without normalization.
    expect(() =>
      transform('1;', filename, {
        phases: [
          { name: 'first', plugins: [plugin] },
          { name: 'later', plugins: [plugin, plugin] },
        ],
      }),
    ).toThrow(/plugin duplicate occurs more than once/);
    expect(calls).toEqual([]);
  });
}

test('a fatal plugin failure remains primary when every cleanup also fails', () => {
  const primary = new Error('primary');
  const cleaned: number[] = [];
  const plugins = [0, 1].map(id =>
    defineNativePlugin({
      name: 'peer',
      createState: () => id,
      post() {
        throw primary;
      },
      cleanup(reason, state) {
        expect(reason).toBe('error');
        cleaned.push(state);
        throw null;
      },
    }),
  );
  expect(() =>
    transform('1;', 'input.js', defineNativePipeline({ phases: [{ name: 'visit', plugins }] })),
  ).toThrow(expect.objectContaining({ cause: primary }));
  expect(cleaned).toEqual([0, 1]);
});

test('cleanup failures make a visitor bailout fatal while all peers clean once', () => {
  const cleaned: string[] = [];
  const plugin = defineNativePlugin({
    name: 'bailout',
    post(ctx) {
      ctx.unsupported('boundary');
    },
    cleanup(reason) {
      cleaned.push(reason);
      throw undefined;
    },
  });
  const peer = defineNativePlugin({
    name: 'peer',
    cleanup(reason) {
      cleaned.push(reason);
    },
  });
  expect(() =>
    transform(
      '1;',
      'input.js',
      defineNativePipeline({ phases: [{ name: 'visit', plugins: [plugin, peer] }] }),
    ),
  ).toThrow(expect.objectContaining({ code: 'NOXCTURNAL_TRANSFORM_ERROR', cause: undefined }));
  expect(cleaned).toEqual(['bailout', 'bailout']);
});

test('metadata reads exclude inherited properties and writes remain own data', () => {
  const plugin = defineNativePlugin({
    name: 'metadata',
    contract: { metadata: { writes: ['__proto__', 'toString', 'constructor'] } },
    pre(ctx) {
      for (const key of ['__proto__', 'toString', 'constructor'] as const) {
        expect(ctx.metadata.get(key)).toBeUndefined();
        ctx.metadata.set(key, undefined);
        expect(ctx.metadata.get(key)).toBeUndefined();
        ctx.metadata.set(key, null);
        expect(ctx.metadata.get(key)).toBeNull();
      }
    },
  });
  const result = transform(
    '1;',
    'input.js',
    defineNativePipeline({ phases: [{ name: 'metadata', plugins: [plugin] }] }),
  );
  expect(result.status).toBe('complete');
  if (result.status !== 'complete') throw Error(result.reason);
  expect(Object.keys(result.metadata)).toEqual(['__proto__', 'toString', 'constructor']);
  expect(Object.getPrototypeOf(result.metadata)).toBe(Object.prototype);
});

test('reusing the exact phase object still creates a later intent occurrence', () => {
  let occurrence = 0;
  const plugin = defineNativePlugin({
    name: 'claim',
    pre(ctx) {
      const start = occurrence++ === 0 ? 0 : 5;
      ctx.ensureReplace('shared', start, start + 3, 'xxx');
    },
  });
  const phase = definePipelinePhase({ name: 'same', plugins: [plugin] });
  const result = transform('aaa; bbb;', 'input.js', composeNativePipeline([phase, phase]));
  expect(result.status).toBe('complete');
  if (result.status === 'complete') expect(result.code).toBe('xxx; bbb;');
  expect(occurrence).toBe(2);
});

for (const kind of ['helper', 'replace'] as const) {
  test(`${kind} compares composite fragments against the original source snapshot`, () => {
    const first = defineNativePlugin({
      name: 'first',
      pre(ctx) {
        const fragment = ctx.code.template`${ctx.sourceSlice(0, 1)}${ctx.sourceSlice(1, 3)};`;
        if (kind === 'helper') ctx.ensureHelper('shared', fragment);
        else ctx.ensureReplace('shared', 5, 8, fragment);
      },
    });
    const last = defineNativePlugin({
      name: 'last',
      pre(ctx) {
        if (kind === 'helper') ctx.ensureHelper('shared', 'aaa;');
        else ctx.ensureReplace('shared', 0, 3, 'aaa;');
      },
    });
    expect(
      transform(
        'aaa; bbb;',
        'input.js',
        defineNativePipeline({
          phases: [
            { name: 'same', plugins: [first] },
            { name: 'same', plugins: [last] },
          ],
        }),
      ),
    ).toMatchObject({ status: 'complete' });
  });
  test(`${kind} keeps copies deferred through contained edits in the registering phase`, () => {
    const plugin = defineNativePlugin({
      name: 'copy',
      pre(ctx) {
        const content = ctx.sourceSlice(0, 3);
        for (let i = 0; i < 2; i++) {
          if (kind === 'helper') ctx.ensureHelper('shared', content);
          else ctx.ensureReplace('shared', 5, 8, content);
        }
        ctx.editor.update(1, 2, 'x');
      },
    });
    const result = transform(
      'aaa; bbb;',
      'input.js',
      defineNativePipeline({ phases: [{ name: 'copy', plugins: [plugin] }] }),
    );
    expect(result.status).toBe('complete');
    // Program insertions terminate deferred copies with a statement separator.
    if (result.status === 'complete')
      expect(result.code).toBe(kind === 'helper' ? 'axa\n;\naxa; bbb;' : 'axa; axa;');
  });
}

for (const mechanism of ['path', 'insert', 'mixed', 'program', 'intent', 'nested'] as const) {
  test(`${mechanism} edits retain owning identity for reset and hasChanged`, () => {
    const nested = defineVisitor('NumericLiteral', {}, path => {
      if (mechanism === 'insert') path.insertBefore({ code: '4;', mapping: 'anchor-start' });
      else if (mechanism === 'mixed')
        path.replaceWithMultiple([
          { code: '4;', mapping: 'sourceless' },
          { code: '5', mapping: 'anchor-start' },
        ]);
      else path.replaceWith('4');
    });
    const first = defineNativePlugin({
      name: 'same',
      visitors:
        mechanism === 'path' || mechanism === 'insert' || mechanism === 'mixed'
          ? [nested]
          : mechanism === 'nested'
            ? [
                defineVisitor(
                  'Program',
                  { nested: [nested], controlFlow: ['nested-traverse'] },
                  path => path.traverse([nested]),
                ),
              ]
            : [],
      pre(ctx) {
        if (mechanism === 'program') ctx.prependToProgram('4;');
        if (mechanism === 'intent') ctx.ensureReplace('shared', 0, 1, '4');
      },
      post(ctx) {
        expect(ctx.editor.hasChanged()).toBe(true);
        ctx.editor.reset(0, 2);
        expect(ctx.editor.hasChanged()).toBe(false);
      },
    });
    const result = transform(
      '3;',
      'input.js',
      defineNativePipeline({ phases: [{ name: 'edit', plugins: [first] }] }),
    );
    expect(result).toMatchObject({ status: 'complete', code: '3;' });
  });
}

for (const mechanism of ['scope-push', 'scope-rename', 'replay'] as const) {
  test(`${mechanism} edits belong to the calling context, not its same-name peer`, () => {
    const source = 'let value = 1; use(value);';
    const nested = defineVisitor('NumericLiteral', {}, path => path.replaceWith('2'));
    const owner = defineNativePlugin({
      name: 'same',
      visitors:
        mechanism === 'replay'
          ? [
              defineVisitor(
                'Program',
                { controlFlow: ['dynamic-subscriptions'], nested: [nested] },
                () => {},
              ),
            ]
          : [
              defineVisitor('Program', { scope: true }, path => {
                if (mechanism === 'scope-push') path.scope.push('var injected = 0;');
                else path.scope.rename('value', 'renamed');
              }),
            ],
      pre(ctx) {
        if (mechanism === 'replay') ctx.revisitProgram([nested]);
      },
      post(ctx) {
        expect(ctx.editor.hasChanged()).toBe(true);
      },
    });
    const peer = defineNativePlugin({
      name: 'same',
      post(ctx) {
        expect(ctx.editor.hasChanged()).toBe(false);
        ctx.editor.reset(0, source.length);
        expect(ctx.editor.hasChanged()).toBe(false);
      },
    });
    const result = transform(
      source,
      'input.js',
      defineNativePipeline({ phases: [{ name: 'edit', plugins: [owner, peer] }] }),
    );
    expect(result.status).toBe('complete');
    if (result.status === 'complete')
      expect(result.code).toContain(
        mechanism === 'scope-push' ? 'injected' : mechanism === 'scope-rename' ? 'renamed' : '2',
      );
  });
}

test('same-name peer reset preserves appended program statements and EOF newline boundary', () => {
  const source = '3; // trailing';
  const writer = defineNativePlugin({
    name: 'same',
    pre(ctx) {
      ctx.appendToProgram('4;');
    },
  });
  const peer = defineNativePlugin({
    name: 'same',
    pre(ctx) {
      expect(ctx.editor.hasChanged()).toBe(false);
      ctx.editor.reset(0, source.length);
      ctx.appendToProgram('5;');
      ctx.editor.append('6;');
    },
  });
  const result = transform(
    source,
    'input.js',
    defineNativePipeline({ phases: [{ name: 'append', plugins: [writer, peer] }] }),
  );
  expect(result.status).toBe('complete');
  if (result.status === 'complete') {
    expect(result.code).toContain('4;\n5;\n');
    expect(result.code).toContain('// trailing\n6;');
  }
});

test('unsupported preparation failures preserve the primary error and clean every prior state', () => {
  const primary = new Error('prepare');
  const cleaned: number[] = [];
  const plugins = [0, 1, 2].map(id =>
    defineNativePlugin({
      name: 'prepare',
      createState() {
        if (id === 2) throw primary;
        return id;
      },
      cleanup(reason, state) {
        expect(reason).toBe('error');
        cleaned.push(state);
        throw undefined;
      },
    }),
  );
  expect(() => transform('1;', 'input.txt', { phases: [{ name: 'prepare', plugins }] })).toThrow(
    primary,
  );
  expect(cleaned).toEqual([0, 1]);
});
