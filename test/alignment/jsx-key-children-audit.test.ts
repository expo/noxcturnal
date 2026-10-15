import { transformSync } from '@babel/core';
import jsx from '@babel/plugin-transform-react-jsx';
import { describe, expect, test } from 'vitest';
import { compile } from '../compliance/runtime';

function observe(code: string): unknown {
  const context: { result?: unknown } = {};
  const runtime = {
    Fragment: 'fragment',
    createElement: (_type: unknown, props: unknown, ...children: unknown[]) => ({
      props,
      children,
    }),
    jsx: (_type: unknown, props: unknown, key: unknown) => ({ props, key }),
    jsxs: (_type: unknown, props: unknown, key: unknown) => ({ props, key }),
  };
  new Function('React', 'require', 'globalThis', code)(runtime, () => runtime, context);
  return context.result;
}

describe.each(['classic', 'automatic'] as const)('JSX keys and spread children: %s', mode => {
  function babel(source: string): string {
    return transformSync(source, {
      filename: 'input.jsx',
      sourceType: 'script',
      configFile: false,
      babelrc: false,
      plugins: [[jsx, { runtime: mode }]],
    })!.code!;
  }
  test.each(['<div key/>', '<div {...{}} key/>'])('rejects valueless key in %s', expression => {
    const source = `globalThis.result = ${expression};`;
    expect(() => babel(source)).toThrow(/explicit key value/);
    expect(() => compile(source, { jsx: mode }, 'input.jsx')).toThrow(/transform-error/);
  });
  test('accepts an explicit boolean key', () => {
    const source = 'globalThis.result = <div key={true}/>;';
    const expected =
      mode === 'classic' ? { props: { key: true }, children: [] } : { props: {}, key: true };
    expect(observe(babel(source))).toEqual(expected);
    const code = compile(source, { jsx: mode }, 'input.jsx');
    expect(code).not.toContain('<div');
    expect(observe(code)).toEqual(expected);
  });
  test('retains the Babel baseline for duplicate-key effects', () => {
    const source = `
      const events = [];
      const view = <div key={events.push('first')} key={events.push('second')}/>;
      globalThis.result = [events, view];
    `;
    const expected =
      mode === 'classic'
        ? [['first', 'second'], { props: { key: 2 }, children: [] }]
        : [['second'], { props: {}, key: 1 }];
    expect(observe(babel(source))).toEqual(expected);
    const code = compile(source, { jsx: mode }, 'input.jsx');
    expect(code).not.toContain('<div');
    expect(observe(code)).toEqual(expected);
  });
  test.each([false, true])('spread-child extension, mixed=%s', mixed => {
    const setup = `
      const events = [];
      const values = { *[Symbol.iterator]() { events.push('start'); yield 1; events.push('end'); yield 2; } };
    `;
    const expression = mixed ? '<>{...values}{events.push("after")}</>' : '<>{...values}</>';
    const result = `globalThis.result = [events, ${mode === 'classic' ? 'view.children' : 'view.props.children'}];`;
    const source = `${setup} const view = ${expression}; ${result}`;
    expect(() => babel(source)).toThrow(/Spread children are not supported/);
    // Oxc intentionally accepts this extension. Ordinary iterable spreading is
    // the semantic control; Babel rejection is not a runtime oracle.
    const explicit = `${setup} const children = [...values${mixed ? ', events.push("after")' : ''}]; globalThis.result = [events, children];`;
    const expected = mixed
      ? [
          ['start', 'end', 'after'],
          [1, 2, 3],
        ]
      : [
          ['start', 'end'],
          [1, 2],
        ];
    expect(observe(explicit)).toEqual(expected);
    const code = compile(source, { jsx: mode }, 'input.jsx');
    expect(code).not.toContain('<>');
    expect(observe(code)).toEqual(expected);
  });
});
