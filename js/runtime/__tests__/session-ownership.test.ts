import { expect, test, vi } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';
import { NativeTransformSession } from '../session';

test.each([false, true])(
  'session ownership follows changed source=%s and closes at completion',
  changed => {
    const observed: NativeTransformSession[] = [];
    const closed: NativeTransformSession[] = [];
    const events: string[] = [];
    const originalResolve = NativeTransformSession.prototype.resolveBindingScope;
    const originalClose = NativeTransformSession.prototype.close;
    const resolve = vi
      .spyOn(NativeTransformSession.prototype, 'resolveBindingScope')
      .mockImplementation(function (this: NativeTransformSession, ...args) {
        observed.push(this);
        events.push('observe');
        return originalResolve.apply(this, args);
      });
    const close = vi
      .spyOn(NativeTransformSession.prototype, 'close')
      .mockImplementation(function (this: NativeTransformSession) {
        closed.push(this);
        events.push('close');
        originalClose.call(this);
      });
    const first = defineNativePlugin({
      name: 'first',
      editEffect: changed ? 'expression-shape' : 'none',
      visitors: [
        defineVisitor('NumericLiteral', { scope: true }, path => {
          expect(path.scope.hasBinding('value')).toBe(true);
          if (changed) path.replaceWith('2');
        }),
      ],
    });
    const second = defineNativePlugin({
      name: 'second',
      editEffect: 'none',
      visitors: [
        defineVisitor('NumericLiteral', { scope: true }, path => {
          expect(path.scope.hasBinding('value')).toBe(true);
          expect(path.sourceText()).toBe(changed ? '2' : '1');
        }),
      ],
    });
    try {
      const result = transform(
        'const value = 1;',
        'input.js',
        defineNativePipeline({
          phases: [
            { name: 'first', plugins: [first] },
            { name: 'second', plugins: [second] },
          ],
        }),
      );
      expect(result.status).toBe('complete');
      expect(observed).toHaveLength(2);
      if (changed) {
        expect(observed[0]).not.toBe(observed[1]);
        expect(closed).toEqual(observed);
        expect(events).toEqual(['observe', 'close', 'observe', 'close']);
      } else {
        expect(observed[0]).toBe(observed[1]);
        expect(closed).toEqual([observed[0]]);
        expect(events).toEqual(['observe', 'observe', 'close']);
      }
      for (const session of observed) expect(() => session.query({})).toThrow('session-closed');
    } finally {
      resolve.mockRestore();
      close.mockRestore();
    }
  },
);
