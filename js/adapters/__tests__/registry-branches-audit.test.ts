import { expect, test } from 'vitest';
import {
  defineNativePipeline,
  registerParserAdapter,
  transform,
  transformClassificationCacheKey,
  type ParserAdapter,
} from '../../index';

const pipeline = defineNativePipeline({ phases: [] });
const source = 'original;';
const filename = 'input.custom';
function adapter(name: string, code = '1;'): ParserAdapter {
  return {
    name,
    version: '1',
    supports: route => route.syntax === 'unknown',
    compile: () => ({ status: 'complete', syntax: 'js', code, map: { mappings: '', names: [] } }),
  };
}

test('automatic selection skips declines and uses the first supporting adapter', () => {
  const events: string[] = [];
  const unregister = [false, true, true].map((supported, id) =>
    registerParserAdapter({
      ...adapter(`ordered-${id}`),
      supports() {
        events.push(`supports:${id}`);
        return supported;
      },
      compile() {
        events.push(`compile:${id}`);
        return { status: 'unsupported', reason: `selected-${id}` };
      },
    }),
  );
  try {
    expect(transform(source, filename, pipeline)).toEqual({
      status: 'bailout',
      reason: 'selected-1',
      source,
      diagnostics: [],
    });
    expect(events).toEqual(['supports:0', 'supports:1', 'compile:1']);
  } finally {
    unregister.forEach(remove => remove());
  }
});

test('duplicate registration is rejected without replacing the current adapter', () => {
  const unregister = registerParserAdapter(adapter('duplicate-audit', '1;'));
  try {
    expect(() => registerParserAdapter(adapter('duplicate-audit', '2;'))).toThrow(
      'Parser adapter already registered',
    );
    const result = transform(source, filename, pipeline, { parserAdapter: 'duplicate-audit' });
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error('Unexpected bailout');
    expect(result.code).toBe('1;');
  } finally {
    unregister();
  }
});

test('stale unregister handles do not remove a replacement and automatic keys follow its descriptor', () => {
  const first = registerParserAdapter(adapter('replacement-audit', '1;'));
  const before = transformClassificationCacheKey(pipeline, filename, source);
  first();
  const second = registerParserAdapter({ ...adapter('replacement-audit', '2;'), version: '2' });
  try {
    first();
    expect(transformClassificationCacheKey(pipeline, filename, source)).not.toBe(before);
    const result = transform(source, filename, pipeline);
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error('Unexpected bailout');
    expect(result.code).toBe('2;');
  } finally {
    second();
    second();
  }
  expect(transform(source, filename, pipeline).status).toBe('bailout');
});

for (const sentinel of [new Error('adapter sentinel'), null, undefined]) {
  test.each(['supports', 'compile'] as const)(
    `%s propagates ${String(sentinel)} as a thrown failure`,
    stage => {
      const registered = adapter(`throws-${stage}`);
      if (stage === 'supports')
        registered.supports = () => {
          throw sentinel;
        };
      else
        registered.compile = () => {
          throw sentinel;
        };
      const unregister = registerParserAdapter(registered);
      let caught: unknown;
      let didThrow = false;
      try {
        transform(source, filename, pipeline);
      } catch (error) {
        caught = error;
        didThrow = true;
      } finally {
        unregister();
      }
      expect(didThrow).toBe(true);
      expect(caught).toBe(sentinel);
    },
  );
}
