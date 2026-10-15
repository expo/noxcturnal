import { expect, test } from 'vitest';
import type { PreflightReactCompiler } from '../../../js/index';
import { transformOutcome } from '../transform';

const component = `
export function Greeting({ name }) {
  const message = 'Hello, ' + name;
  return <Text>{message}</Text>;
}
`;

function compiler(overrides: Partial<PreflightReactCompiler> = {}): PreflightReactCompiler {
  return {
    compilationMode: 'infer',
    panicThreshold: 'none',
    target: '19',
    enableResetCacheOnSourceFileChanges: false,
    ...overrides,
  };
}

test('supports infer compilation mode', async () => {
  expect(
    await transformOutcome(component, 'input.jsx', {
      reactCompiler: compiler({ compilationMode: 'infer' }),
      jsx: 'preserve',
    }),
  ).toMatchInlineSnapshot(`
    "import { c as _c } from 'react/compiler-runtime';
    export function Greeting(t0) {
      const $ = _c(2);
      const { name } = t0;
      const message = 'Hello, ' + name;
      let t1;
      if ($[0] !== message) {
        t1 = <Text>{message}</Text>;
        $[0] = message;
        $[1] = t1;
      } else {
        t1 = $[1];
      }
      return t1;
    }"
  `);
});

test('leaves functions with recoverable compiler errors uncompiled when panic threshold is none', async () => {
  const source = `import { useEffect, useRef } from 'react';
export function useEventListener(listener) {
  const listenerRef = useRef(listener);
  listenerRef.current = listener;
  useEffect(() => listenerRef.current(), [listenerRef]);
}`;

  expect(
    await transformOutcome(source, 'useEvent.js', {
      reactCompiler: compiler({ panicThreshold: 'none' }),
      jsx: 'preserve',
    }),
  ).toBe(`import { useEffect, useRef } from 'react';
export function useEventListener(listener) {
  const listenerRef = useRef(listener);
  listenerRef.current = listener;
  useEffect(() => listenerRef.current(), [listenerRef]);
}`);
});

test('supports syntax compilation mode', async () => {
  expect(
    await transformOutcome(
      `export function Greeting() { 'use memo'; return <Text />; }`,
      'input.jsx',
      {
        reactCompiler: compiler({ compilationMode: 'syntax' }),
        jsx: 'preserve',
      },
    ),
  ).toMatchInlineSnapshot(`
    "import { c as _c } from 'react/compiler-runtime';
    export function Greeting() {
      'use memo';
      const $ = _c(1);
      let t0;
      if ($[0] === Symbol.for('react.memo_cache_sentinel')) {
        t0 = <Text />;
        $[0] = t0;
      } else {
        t0 = $[0];
      }
      return t0;
    }"
  `);
});

test('supports annotation compilation mode', async () => {
  expect(
    await transformOutcome(component, 'input.jsx', {
      reactCompiler: compiler({ compilationMode: 'annotation' }),
      jsx: 'preserve',
    }),
  ).toMatchInlineSnapshot(`
    "export function Greeting({ name }) {
      const message = 'Hello, ' + name;
      return <Text>{message}</Text>;
    }"
  `);
});

test('supports all compilation mode', async () => {
  expect(
    await transformOutcome(`export function calculate(value) { return value * 2; }`, 'input.js', {
      reactCompiler: compiler({ compilationMode: 'all' }),
    }),
  ).toMatchInlineSnapshot(`
    "export function calculate(value) {
      return value * 2;
    }"
  `);
});

test('targets React 17', async () => {
  expect(
    await transformOutcome(component, 'input.jsx', {
      reactCompiler: compiler({ target: '17' }),
      jsx: 'preserve',
    }),
  ).toMatchInlineSnapshot(`
    "import { c as _c } from 'react-compiler-runtime';
    export function Greeting(t0) {
      const $ = _c(2);
      const { name } = t0;
      const message = 'Hello, ' + name;
      let t1;
      if ($[0] !== message) {
        t1 = <Text>{message}</Text>;
        $[0] = message;
        $[1] = t1;
      } else {
        t1 = $[1];
      }
      return t1;
    }"
  `);
});

test('targets React 18', async () => {
  expect(
    await transformOutcome(component, 'input.jsx', {
      reactCompiler: compiler({ target: '18' }),
      jsx: 'preserve',
    }),
  ).toMatchInlineSnapshot(`
    "import { c as _c } from 'react-compiler-runtime';
    export function Greeting(t0) {
      const $ = _c(2);
      const { name } = t0;
      const message = 'Hello, ' + name;
      let t1;
      if ($[0] !== message) {
        t1 = <Text>{message}</Text>;
        $[0] = message;
        $[1] = t1;
      } else {
        t1 = $[1];
      }
      return t1;
    }"
  `);
});

test('targets React 19', async () => {
  expect(
    await transformOutcome(component, 'input.jsx', {
      reactCompiler: compiler({ target: '19' }),
      jsx: 'preserve',
    }),
  ).toMatchInlineSnapshot(`
    "import { c as _c } from 'react/compiler-runtime';
    export function Greeting(t0) {
      const $ = _c(2);
      const { name } = t0;
      const message = 'Hello, ' + name;
      let t1;
      if ($[0] !== message) {
        t1 = <Text>{message}</Text>;
        $[0] = message;
        $[1] = t1;
      } else {
        t1 = $[1];
      }
      return t1;
    }"
  `);
});

test('supports the none panic threshold', async () => {
  expect(
    await transformOutcome(component, 'input.jsx', {
      reactCompiler: compiler({ panicThreshold: 'none' }),
      jsx: 'preserve',
    }),
  ).toMatchInlineSnapshot(`
    "import { c as _c } from 'react/compiler-runtime';
    export function Greeting(t0) {
      const $ = _c(2);
      const { name } = t0;
      const message = 'Hello, ' + name;
      let t1;
      if ($[0] !== message) {
        t1 = <Text>{message}</Text>;
        $[0] = message;
        $[1] = t1;
      } else {
        t1 = $[1];
      }
      return t1;
    }"
  `);
});

test('supports the critical-errors panic threshold', async () => {
  expect(
    await transformOutcome(component, 'input.jsx', {
      reactCompiler: compiler({ panicThreshold: 'critical_errors' }),
      jsx: 'preserve',
    }),
  ).toMatchInlineSnapshot(`
    "import { c as _c } from 'react/compiler-runtime';
    export function Greeting(t0) {
      const $ = _c(2);
      const { name } = t0;
      const message = 'Hello, ' + name;
      let t1;
      if ($[0] !== message) {
        t1 = <Text>{message}</Text>;
        $[0] = message;
        $[1] = t1;
      } else {
        t1 = $[1];
      }
      return t1;
    }"
  `);
});

test('supports the all-errors panic threshold', async () => {
  expect(
    await transformOutcome(component, 'input.jsx', {
      reactCompiler: compiler({ panicThreshold: 'all_errors' }),
      jsx: 'preserve',
    }),
  ).toMatchInlineSnapshot(`
    "import { c as _c } from 'react/compiler-runtime';
    export function Greeting(t0) {
      const $ = _c(2);
      const { name } = t0;
      const message = 'Hello, ' + name;
      let t1;
      if ($[0] !== message) {
        t1 = <Text>{message}</Text>;
        $[0] = message;
        $[1] = t1;
      } else {
        t1 = $[1];
      }
      return t1;
    }"
  `);
});

test('can enable source-file cache resets', async () => {
  expect(
    await transformOutcome(component, 'input.jsx', {
      reactCompiler: compiler({ enableResetCacheOnSourceFileChanges: true }),
      jsx: 'preserve',
    }),
  ).toMatchInlineSnapshot(`
    "import { c as _c } from 'react/compiler-runtime';
    export function Greeting(t0) {
      const $ = _c(3);
      if ($[0] !== '41b93c60e698291325bbaf4e117cdd33c4f8f530') {
        for (let i = 1; i < 3; i++) $[i] = Symbol.for('react.memo_cache_sentinel');
        $[0] = '41b93c60e698291325bbaf4e117cdd33c4f8f530';
      }
      const { name } = t0;
      const message = 'Hello, ' + name;
      let t1;
      if ($[1] !== message) {
        t1 = <Text>{message}</Text>;
        $[1] = message;
        $[2] = t1;
      } else {
        t1 = $[2];
      }
      return t1;
    }"
  `);
});

test('can disable source-file cache resets', async () => {
  expect(
    await transformOutcome(component, 'input.jsx', {
      reactCompiler: compiler({ enableResetCacheOnSourceFileChanges: false }),
      jsx: 'preserve',
    }),
  ).toMatchInlineSnapshot(`
    "import { c as _c } from 'react/compiler-runtime';
    export function Greeting(t0) {
      const $ = _c(2);
      const { name } = t0;
      const message = 'Hello, ' + name;
      let t1;
      if ($[0] !== message) {
        t1 = <Text>{message}</Text>;
        $[0] = message;
        $[1] = t1;
      } else {
        t1 = $[1];
      }
      return t1;
    }"
  `);
});

test('honors custom opt-out directives', async () => {
  const source = `export function Greeting() { 'use no optimize'; return <Text />; }`;
  expect(
    await transformOutcome(source, 'input.jsx', {
      reactCompiler: compiler({ customOptOutDirectives: ['use no optimize'] }),
      jsx: 'preserve',
    }),
  ).toMatchInlineSnapshot(`
    "export function Greeting() {
      'use no optimize';
      return <Text />;
    }"
  `);
});

test('merges custom opt-out directives with the compiler defaults', async () => {
  const source = `export function DefaultOptOut() { 'use no memo'; return <Text />; }
export function CustomOptOut() { 'widget'; return <Text />; }`;
  expect(
    await transformOutcome(source, 'input.jsx', {
      reactCompiler: compiler({ customOptOutDirectives: ['widget'] }),
      jsx: 'preserve',
    }),
  ).toMatchInlineSnapshot(`
    "export function DefaultOptOut() {
      'use no memo';
      return <Text />;
    }
    export function CustomOptOut() {
      'widget';
      return <Text />;
    }"
  `);
});
