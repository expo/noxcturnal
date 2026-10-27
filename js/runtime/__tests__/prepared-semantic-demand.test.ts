import { expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';

test('prepared semantic requirements preserve file-specific predicates and payload facts', () => {
  const globals: string[] = [];
  const calls: { name: string | undefined; global: boolean | undefined }[] = [];
  const pipeline = defineNativePipeline({
    phases: [
      {
        name: 'read',
        plugins: [
          defineNativePlugin({
            name: 'semantic-demand',
            visitors: [
              defineVisitor(
                'Identifier',
                { fields: ['name'], where: { global: { equals: true } } },
                path => {
                  globals.push(path.node.name);
                },
              ),
              defineVisitor('CallExpression', { fields: ['calleeName', 'calleeGlobal'] }, path => {
                calls.push({ name: path.node.calleeName, global: path.node.calleeGlobal });
              }),
            ],
          }),
        ],
      },
    ],
  });
  const first = {
    source: 'outside();function owner(outside){outside();}',
    globals: ['outside'],
    calls: [
      { name: 'outside', global: true },
      { name: 'outside', global: false },
    ],
  };
  const second = {
    source: 'const outside=()=>{};outside();function owner(){external();}',
    globals: ['external'],
    calls: [
      { name: 'outside', global: false },
      { name: 'external', global: true },
    ],
  };
  for (const [index, entry] of [first, second, first].entries()) {
    globals.length = 0;
    calls.length = 0;
    const result = transform(entry.source, `input${index}.js`, pipeline);
    expect(result.status).toBe('complete');
    if (result.status === 'complete') expect(result.code).toBe(entry.source);
    expect(globals).toEqual(entry.globals);
    expect(calls).toEqual(entry.calls);
  }
});
