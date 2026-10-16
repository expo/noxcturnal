import { beforeAll, describe, expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';

for (const guarded of [false, true])
  describe.each(['stop', 'skip'] as const)(`guarded=${guarded}: %s`, action => {
    let seen: number[];
    beforeAll(() => {
      seen = [];
      const peerSeen: number[] = [];
      let triggers = 0;
      const plugin = defineNativePlugin({
        name: 'control-owner',
        visitors: [
          defineVisitor('Function', { controlFlow: [action] }, path => {
            triggers++;
            if (action === 'stop') path.stop();
            else path.skip();
          }),
          defineVisitor(
            'NumericLiteral',
            {
              fields: ['value'],
              controlFlow: guarded ? [action] : [],
            },
            path => seen.push(Number(path.node.value)),
          ),
        ],
      });
      const peer = defineNativePlugin({
        name: 'peer',
        visitors: [
          defineVisitor('NumericLiteral', { fields: ['value'] }, path =>
            peerSeen.push(Number(path.node.value)),
          ),
        ],
      });
      expect(
        transform(
          'function f(){return 3;} 4;',
          'input.js',
          defineNativePipeline({
            phases: [{ name: 'scan', plugins: [plugin, peer] }],
          }),
        ).status,
      ).toBe('complete');
      expect(triggers).toBe(1);
      expect(peerSeen).toEqual([3, 4]);
    });
    test('honors plugin control state on routes that only observe', () => {
      expect(seen).toEqual(action === 'stop' ? [] : [4]);
    });
  });
