import { bench as vitestBench } from 'vitest';

import { defineNativePipeline, transform } from '../index';
import type { PreflightPlan } from '../index';

const runtimeHelpers = {
  mode: 'runtime',
  moduleName: '@babel/runtime',
  version: '7.29.7',
} as const;

function endToEndBench(
  name: string,
  source: string,
  filename: string,
  native: PreflightPlan,
  expectedOutput: readonly RegExp[],
) {
  const pipeline = defineNativePipeline({
    phases: [{ name: 'representative-transform', native }],
  });
  const run = () => {
    const result = transform(source, filename, pipeline);
    if (result.status !== 'complete') {
      throw new Error(`${name} bailed out: ${result.reason}`);
    }
    for (const expectation of expectedOutput) {
      if (!expectation.test(result.code)) {
        throw new Error(`${name} did not produce ${expectation}`);
      }
    }
    return result.code.length;
  };

  // Vitest can render a failed benchmark callback as a NaN row without making
  // the benchmark command fail. Verify the complete path during registration too.
  run();
  vitestBench(name, run);
}

const productionTsxSource = Array.from(
  { length: 100 },
  (_, index) => `
    type Props${index} = { user?: { name?: string }, defaults: object };
    export class Card${index} extends React.Component<Props${index}> {
      visits = 0;
      render() {
        this.visits ||= 1;
        const { defaults, ...rest } = this.props;
        const name = this.props.user?.name ?? "Guest";
        return <View {...defaults} title={name} visits={this.visits} data={rest} />;
      }
    }
  `,
).join('\n');

endToEndBench(
  'end-to-end production TSX language stack (100 components)',
  productionTsxSource,
  'App.tsx',
  {
    typescript: 'strip',
    jsx: 'automatic',
    jsxImportSource: 'react',
    helpers: runtimeHelpers,
    comments: false,
    transforms: {
      classProperties: { loose: true },
      logicalAssignmentOperators: true,
      optionalChaining: { loose: false },
      nullishCoalescingOperator: { loose: false },
      objectRestSpread: { loose: true, useBuiltIns: true },
    },
  },
  [
    /react\/jsx-runtime/,
    /extends React\.Component/,
    /@babel\/runtime\/helpers\/objectWithoutPropertiesLoose/,
    /this\.visits \|\|/,
  ],
);

const asyncResourceSource = Array.from(
  { length: 75 },
  (_, index) => `
    export async function collect${index}(items, acquire) {
      await using resource = await acquire(${index});
      const values = [];
      for await (const item of items) values.push(await resource.read(item));
      return values;
    }
  `,
).join('\n');

endToEndBench(
  'end-to-end async iteration and resource management (75 functions)',
  asyncResourceSource,
  'resources.js',
  {
    helpers: runtimeHelpers,
    comments: false,
    transforms: {
      asyncGeneratorFunctions: true,
      asyncFunctions: true,
      explicitResourceManagement: true,
    },
  },
  [
    /@babel\/runtime\/helpers\/asyncIterator/,
    /@babel\/runtime\/helpers\/asyncToGenerator/,
    /@babel\/runtime\/helpers\/usingCtx/,
  ],
);

const legacyModuleSource = Array.from(
  { length: 100 },
  (_, index) => `
    export * as dependency${index} from "dependency-${index}";
    export function compute${index}({ base = ${index}, values = [] } = {}) {
      try {
        let total = base ** 2;
        for (const value of values) total += value;
        return total;
      } catch {
        return -1;
      }
    }
  `,
).join('\n');

endToEndBench(
  'end-to-end legacy module and function stack (100 exports)',
  legacyModuleSource,
  'legacy.mjs',
  {
    helpers: runtimeHelpers,
    comments: false,
    transforms: {
      blockScoping: true,
      destructuring: true,
      parameters: true,
      forOf: true,
      exponentiationOperator: true,
      exportNamespaceFrom: true,
      optionalCatchBinding: true,
    },
  },
  [/import \* as _dependency/, /Math\.pow/, /catch \(_unused\)/, /var total/],
);
