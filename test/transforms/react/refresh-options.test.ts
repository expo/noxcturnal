import { expect, test } from 'vitest';
import { transformSource } from '../transform';

const component = `
export function Counter() {
  const [count, setCount] = useState(0);
  return <Button onClick={() => setCount(count + 1)}>{count}</Button>;
}
`;

test('uses custom registration and signature identifiers', async () => {
  expect(
    await transformSource(component, 'input.jsx', {
      reactRefresh: { refreshReg: 'register', refreshSig: 'signature' },
      jsx: 'preserve',
    }),
  ).toMatchInlineSnapshot(`
    "var _s = signature();
    export function Counter() {
      _s();
      const [count, setCount] = useState(0);
      return <Button onClick={() => setCount(count + 1)}>{count}</Button>;
    }
    _s(Counter, 'oDgYfYHkD9Wkv4hrAPCkI/ev3YU=');
    _c = Counter;
    var _c;
    register(_c, 'Counter');"
  `);
});

test('emits compact hook signatures by default', async () => {
  expect(
    await transformSource(component, 'input.jsx', {
      reactRefresh: { emitFullSignatures: false },
      jsx: 'preserve',
    }),
  ).toMatchInlineSnapshot(`
    "var _s = $RefreshSig$();
    export function Counter() {
      _s();
      const [count, setCount] = useState(0);
      return <Button onClick={() => setCount(count + 1)}>{count}</Button>;
    }
    _s(Counter, 'oDgYfYHkD9Wkv4hrAPCkI/ev3YU=');
    _c = Counter;
    var _c;
    $RefreshReg$(_c, 'Counter');"
  `);
});

test('emits full hook signatures when requested', async () => {
  expect(
    await transformSource(component, 'input.jsx', {
      reactRefresh: { emitFullSignatures: true },
      jsx: 'preserve',
    }),
  ).toMatchInlineSnapshot(`
    "var _s = $RefreshSig$();
    export function Counter() {
      _s();
      const [count, setCount] = useState(0);
      return <Button onClick={() => setCount(count + 1)}>{count}</Button>;
    }
    _s(Counter, 'useState{[count, setCount](0)}');
    _c = Counter;
    var _c;
    $RefreshReg$(_c, 'Counter');"
  `);
});
