import { bench } from 'vitest';
import { defineNativePipeline, defineNativePlugin, NativeTransformSession, transform } from '../dist/index.js';

const source = Array.from({ length: 2_000 }, (_, index) => `export const value${index} = source${index} + ${index};`).join('\n');
bench('subscribed Identifier event materialization', () => {
  const session = NativeTransformSession.open(source, 'benchmark.js');
  session.next(['Identifier']);
  session.close();
});

bench('broad native event materialization', () => {
  const session = NativeTransformSession.open(source, 'benchmark.js');
  session.next(['*']);
  session.close();
});

const visitorPipeline = defineNativePipeline({ apiVersion: 1, phases: [{ name: 'visit', plugins: [defineNativePlugin({ name: 'identifier-count', apiVersion: 1, visitor: { Identifier() {} } })] }] });
bench('static JavaScript visitor transform', () => {
  transform(source, 'benchmark.js', visitorPipeline);
});
