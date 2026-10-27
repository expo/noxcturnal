import { expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';

for (const indexed of [false, true]) {
  test(`parenthesized static callees expose facts and match selectors (indexed=${indexed})`, () => {
    const cases = [
      { source: 'Platform.select({})', member: true },
      { source: '(Platform).select({})', member: true },
      { source: '((Platform))["select"]({})', member: true },
      { source: '((Platform).select)({})', member: false },
      { source: '(Platform).select?.({})', member: true },
      { source: '(Platform)?.select({})', member: true },
    ];
    const source = cases.map(entry => `${entry.source};`).join('\n');
    const facts: unknown[] = [];
    const selected: string[] = [];
    const physicalCallees: string[] = [];
    const physicalObjects: string[] = [];
    const plugin = defineNativePlugin({
      name: 'callee-path',
      ...(indexed
        ? {
            contract: { queries: [{ exports: true }] },
            pre(context) {
              context.query({ exports: true });
            },
          }
        : {}),
      visitors: [
        defineVisitor(
          'CallExpression',
          {
            fields: ['calleePath', 'calleeName', 'calleeGlobal'],
            children: { callee: { route: 'Expression', fields: ['name', 'memberPath'] } },
          },
          path => {
            facts.push({
              source: path.sourceText(),
              path: path.node.calleePath,
              name: path.node.calleeName,
              global: path.node.calleeGlobal,
              hydratedMatch: path.getChild('callee')?.matchesPattern('Platform.select'),
            });
          },
        ),
        defineVisitor(
          {
            route: 'CallExpression',
            where: { calleePath: { equals: 'Platform.select' }, calleeGlobal: { equals: true } },
            children: { arguments: { route: 'ObjectExpression' } },
          },
          {},
          path => {
            selected.push(path.sourceText());
            path.replaceWith('undefined');
          },
        ),
        defineVisitor(
          { route: 'CallExpression', children: { callee: { route: 'MemberExpression' } } },
          {},
          path => physicalCallees.push(path.sourceText()),
        ),
        defineVisitor(
          {
            route: 'CallExpression',
            children: {
              callee: { route: 'MemberExpression', children: { object: { route: 'Identifier' } } },
            },
          },
          {},
          path => physicalObjects.push(path.sourceText()),
        ),
      ],
    });
    const result = transform(
      source,
      'input.js',
      defineNativePipeline({ phases: [{ name: 'callee-path', plugins: [plugin] }] }),
    );
    expect(result.status).toBe('complete');
    if (result.status !== 'complete') throw new Error(result.reason);
    expect(facts).toEqual(
      cases.map(entry => ({
        source: entry.source,
        path: 'Platform.select',
        name: undefined,
        global: true,
        hydratedMatch: entry.member,
      })),
    );
    expect(selected).toEqual(cases.map(entry => entry.source));
    expect(result.code).toBe(cases.map(() => 'undefined;').join('\n'));
    expect(physicalCallees).toEqual(cases.filter(entry => entry.member).map(entry => entry.source));
    expect(physicalObjects).toEqual(['Platform.select({})']);
  });
}

test('callee roots keep binding facts and static path boundaries through parentheses', () => {
  const seen: unknown[] = [];
  const globals: string[] = [];
  const plugin = defineNativePlugin({
    name: 'callee-root-boundaries',
    visitors: [
      defineVisitor(
        'CallExpression',
        { fields: ['calleePath', 'calleeName', 'calleeGlobal'] },
        path => {
          seen.push({
            source: path.sourceText(),
            path: path.node.calleePath,
            name: path.node.calleeName,
            global: path.node.calleeGlobal,
          });
        },
      ),
      defineVisitor(
        {
          route: 'CallExpression',
          where: { calleePath: { equals: 'Platform.select' }, calleeGlobal: { equals: true } },
        },
        {},
        path => globals.push(path.sourceText()),
      ),
    ],
  });
  expect(
    transform(
      `((Platform)).select({});
     function local(Platform) { ((Platform))["select"]({}); }
     (Platform)({});
     (Platform)[key]({});
     (Platform)["select.extra"]({});
     (Platform?.select)({});`,
      'input.js',
      defineNativePipeline({ phases: [{ name: 'roots', plugins: [plugin] }] }),
    ).status,
  ).toBe('complete');
  expect(seen).toEqual([
    { source: '((Platform)).select({})', path: 'Platform.select', name: undefined, global: true },
    {
      source: '((Platform))["select"]({})',
      path: 'Platform.select',
      name: undefined,
      global: false,
    },
    { source: '(Platform)({})', path: 'Platform', name: undefined, global: true },
    { source: '(Platform)[key]({})', path: undefined, name: undefined, global: undefined },
    {
      source: '(Platform)["select.extra"]({})',
      path: 'Platform.select\\.extra',
      name: undefined,
      global: true,
    },
    { source: '(Platform?.select)({})', path: undefined, name: undefined, global: undefined },
  ]);
  expect(globals).toEqual(['((Platform)).select({})']);
});
