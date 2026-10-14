import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, registerParserAdapter, transform } from '../../index';

const cases = [
  {
    name: 'missing adapter for unknown extension',
    filename: 'input.txt',
    source: '3;',
    selector: 'missing',
    fails: true,
  },
  {
    name: 'missing adapter for Flow',
    filename: 'input.js',
    source: '// @flow\nconst value: number=3;',
    selector: 'missing',
    fails: true,
  },
  {
    name: 'registered adapter declines unknown extension',
    filename: 'input.txt',
    source: '3;',
    selector: 'registered',
    fails: false,
  },
  {
    name: 'registered adapter declines Flow',
    filename: 'input.js',
    source: '// @flow\nconst value: number=3;',
    selector: 'registered',
    fails: false,
  },
  {
    name: 'no selected adapter for unknown extension',
    filename: 'input.txt',
    source: '3;',
    selector: 'none',
    fails: false,
  },
];
describe.each(cases)('$name', entry => {
  let outcome: string;
  beforeAll(() => {
    let compilations = 0;
    const unregister = registerParserAdapter({
      name: 'registered-adapter-audit',
      version: '1.0.0',
      supports: () => false,
      compile() {
        compilations++;
        return { status: 'unsupported', reason: 'adapter-declined' };
      },
    });
    try {
      try {
        const result = transform(
          entry.source,
          entry.filename,
          defineNativePipeline({ phases: [] }),
          {
            parserAdapter:
              entry.selector === 'none'
                ? undefined
                : entry.selector === 'registered'
                  ? 'registered-adapter-audit'
                  : 'missing-adapter-audit',
          },
        );
        expect(result.status).toBe('bailout');
        if (result.status !== 'bailout') throw new Error('Unexpected completion');
        expect(result.source).toBe(entry.source);
        expect(result.reason).toBe(
          entry.selector === 'registered'
            ? 'adapter-declined'
            : entry.filename.endsWith('.txt')
              ? 'unknown-extension'
              : 'flow-requires-parser-adapter',
        );
        outcome = 'bailout';
      } catch (error) {
        expect((error as Error).message).toMatch(/adapter/i);
        expect((error as Error).message).toMatch(
          /unknown|missing|not.*registered|not.*found|unregistered/i,
        );
        outcome = 'throw';
      }
      expect(compilations).toBe(entry.selector === 'registered' ? 1 : 0);
    } finally {
      unregister();
    }
  });
  (entry.fails ? test.fails : test)(
    'distinguishes missing configuration from an intentional bailout',
    () => {
      expect(outcome).toBe(entry.selector === 'missing' ? 'throw' : 'bailout');
    },
  );
});
