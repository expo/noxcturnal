import { expect, test, vi } from 'vitest';
import {
  defineNativePipeline,
  defineNativePlugin,
  defineVisitor,
  NativeTransformError,
  transform,
} from '../../index';
import { NativeTransformSession } from '../session';

const hooks = ['createState', 'pre', 'analyze', 'apply', 'enter', 'exit', 'post'] as const;
for (const thrown of [new Error('hook sentinel'), null]) {
  test.each(hooks)(
    `%s failure preserves cause and cleans registered states (${thrown === null ? 'null' : 'Error'})`,
    hook => {
      const events: string[] = [];
      const closed: NativeTransformSession[] = [];
      const originalClose = NativeTransformSession.prototype.close;
      const close = vi
        .spyOn(NativeTransformSession.prototype, 'close')
        .mockImplementation(function (this: NativeTransformSession) {
          closed.push(this);
          originalClose.call(this);
        });
      const plugins = [0, 1, 2].map(id => {
        function step(name: string) {
          events.push(`${id}:${name}`);
          if (id === 1 && name === hook) {
            events.push('throw');
            throw thrown;
          }
        }
        return defineNativePlugin({
          name: `failure-${id}`,
          createState() {
            step('createState');
            return id;
          },
          pre() {
            step('pre');
          },
          analyze() {
            step('analyze');
            return { status: 'supported', analysis: undefined };
          },
          apply() {
            step('apply');
          },
          visitors: [
            defineVisitor(
              'NumericLiteral',
              { scope: true },
              {
                enter() {
                  step('enter');
                },
                exit() {
                  step('exit');
                },
              },
            ),
          ],
          post() {
            step('post');
          },
          cleanup(reason, state) {
            expect(state).toBe(id);
            events.push(`${id}:cleanup:${reason}`);
          },
        });
      });
      let caught: unknown;
      try {
        transform(
          '1;',
          'input.js',
          defineNativePipeline({ phases: [{ name: 'failure', plugins }] }),
        );
      } catch (error) {
        caught = error;
      } finally {
        close.mockRestore();
      }
      expect(caught).toBeInstanceOf(NativeTransformError);
      expect((caught as NativeTransformError).cause).toBe(thrown);
      const cleaned = hook === 'createState' ? [0] : hook === 'pre' ? [0, 1] : [0, 1, 2];
      expect(events.slice(events.indexOf('throw') + 1)).toEqual(
        cleaned.map(id => `${id}:cleanup:error`),
      );
      expect(closed).toHaveLength(1);
      expect(() => closed[0].query({})).toThrow('session-closed');
    },
  );
}

test('unsupported-input state creation failure cleans only previously created states', () => {
  const sentinel = new Error('prepare sentinel');
  const events: string[] = [];
  const plugins = [0, 1, 2].map(id =>
    defineNativePlugin({
      name: `unsupported-${id}`,
      createState() {
        events.push(`create:${id}`);
        if (id === 1) throw sentinel;
        return id;
      },
      pre() {
        events.push(`pre:${id}`);
      },
      cleanup(reason, state) {
        expect(state).toBe(id);
        events.push(`cleanup:${id}:${reason}`);
      },
    }),
  );
  let caught: unknown;
  try {
    transform(
      '1;',
      'input.txt',
      defineNativePipeline({ phases: [{ name: 'unsupported', plugins }] }),
    );
  } catch (error) {
    caught = error;
  }
  expect(caught).toBe(sentinel);
  expect(events).toEqual(['create:0', 'create:1', 'cleanup:0:error']);
});

test('conflicting commit cleans peer states and closes the retained session', () => {
  const events: string[] = [];
  const closed: NativeTransformSession[] = [];
  const originalClose = NativeTransformSession.prototype.close;
  const close = vi
    .spyOn(NativeTransformSession.prototype, 'close')
    .mockImplementation(function (this: NativeTransformSession) {
      closed.push(this);
      originalClose.call(this);
    });
  const plugins = [0, 1].map(id =>
    defineNativePlugin({
      name: `conflict-${id}`,
      createState: () => id,
      visitors: [
        defineVisitor('NumericLiteral', { scope: true }, path => {
          path.replaceWith(String(id + 2));
        }),
      ],
      post() {
        events.push(`post:${id}`);
      },
      cleanup(reason, state) {
        expect(state).toBe(id);
        events.push(`cleanup:${id}:${reason}`);
      },
    }),
  );
  let caught: unknown;
  try {
    transform('1;', 'input.js', defineNativePipeline({ phases: [{ name: 'conflict', plugins }] }));
  } catch (error) {
    caught = error;
  } finally {
    close.mockRestore();
  }
  expect(caught).toBeInstanceOf(NativeTransformError);
  expect((caught as Error).message).toMatch(/conflict|overlap/i);
  expect(events).toEqual(['post:0', 'post:1', 'cleanup:0:error', 'cleanup:1:error']);
  expect(closed).toHaveLength(1);
  expect(() => closed[0].query({})).toThrow('session-closed');
});
