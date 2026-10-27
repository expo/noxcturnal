import { expect, test } from 'vitest';
import { defineNativePipeline, defineNativePlugin, defineVisitor, transform } from '../../index';

test.each(['complete', 'bailout', 'error'] as const)(
  'nested transform %s leaves the outer cached ancestry intact',
  outcome => {
    let depth = 0;
    let outerName = '';
    let outerFilename = '';
    const names: string[] = [];
    const literals: string[] = [];
    const retained: { readonly bindingName?: string }[] = [];
    const pipeline = defineNativePipeline({
      phases: [
        {
          name: 'inspect',
          plugins: [
            defineNativePlugin({
              name: 'nested-transform',
              visitors: [
                defineVisitor(
                  'CallExpression',
                  {
                    ancestry: {
                      mode: 'findParent',
                      routes: { VariableDeclarator: { fields: ['bindingName'] } },
                    },
                  },
                  path => {
                    const owner = path.findParent(
                      parent => parent.node.type === 'VariableDeclarator',
                    );
                    if (owner?.node.type !== 'VariableDeclarator') throw new Error('Missing owner');
                    expect(owner.node.bindingName).toBe(depth ? 'inner' : outerName);
                    if (depth) {
                      if (outcome === 'error') throw new Error('inner-error');
                      if (outcome === 'bailout') path.unsupported('inner-boundary');
                      return;
                    }
                    retained.push(owner.node);
                    depth++;
                    try {
                      const run = () =>
                        transform('const inner=read("inner");', 'inner.js', pipeline);
                      if (outcome === 'error') expect(run).toThrow('inner-error');
                      else expect(run().status).toBe(outcome);
                    } finally {
                      depth--;
                    }
                    const again = path.findParent(
                      parent => parent.node.type === 'VariableDeclarator',
                    );
                    expect(
                      again?.node.type === 'VariableDeclarator' && again.node.bindingName,
                    ).toBe(outerName);
                    expect(owner.node.bindingName).toBe(outerName);
                    names.push(owner.node.bindingName!);
                  },
                ),
                defineVisitor('StringLiteral', { fields: ['value'] }, path => {
                  expect(path.context.filename).toBe(depth ? 'inner.js' : outerFilename);
                  literals.push(path.node.value);
                }),
              ],
            }),
          ],
        },
      ],
    });
    for (let i = 0; i < 3; i++) {
      outerName = `outer${i}`;
      outerFilename = `${outerName}.js`;
      const source = `const ${outerName}=read("${outerName}");`;
      const result = transform(source, outerFilename, pipeline);
      expect(result.status).toBe('complete');
      if (result.status === 'complete') expect(result.code).toBe(source);
    }
    expect(names).toEqual(['outer0', 'outer1', 'outer2']);
    expect(literals).toEqual(
      outcome === 'complete'
        ? ['inner', 'outer0', 'inner', 'outer1', 'inner', 'outer2']
        : ['outer0', 'outer1', 'outer2'],
    );
    expect(retained.map(node => node.bindingName)).toEqual(['outer0', 'outer1', 'outer2']);
  },
);
