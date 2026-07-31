import { expect, test } from 'vitest';
import { transformSource } from '../transform';

test('strips TypeScript syntax', async () => {
  const source = `type User = { name: string };
enum Status { Ready = 'ready' }
export function greeting(user: User, status: Status = Status.Ready): string {
  return \`${'${user.name}: ${status}'}\`;
}`;
  expect(await transformSource(source, 'input.ts', { typescript: 'strip' })).toMatchInlineSnapshot(`
    "var Status = /* @__PURE__ */ (function (Status) {
      Status['Ready'] = 'ready';
      return Status;
    })(Status || {});
    export function greeting(user, status = Status.Ready) {
      return \`\${user.name}: \${status}\`;
    }"
  `);
});
