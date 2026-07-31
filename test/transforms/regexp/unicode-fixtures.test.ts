import { runFixtures, type FixtureCase } from '../fixture';

const expectedOutputs = [
  "var string = 'foo💩bar';\nvar match = string.match(\n  /foo((?:[\\0-\\t\\x0B\\f\\x0E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF]))bar/,\n);",
  "var string = 'foo💩bar';\nvar match = string.match(/foo(.)bar/);",
  '/(?:[\\u0000-\\u004A\\u004C-\\uD7FF\\uE000-\\uFFFF]|\\uD800[\\uDC00-\\uDFFF]|[\\uD801-\\uDBFE][\\uDC00-\\uDFFF]|\\uDBFF[\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])/.test(\n  string,\n);\n/(?:[\\u0000-\\u006A\\u006C-\\uD7FF\\uE000-\\uFFFF]|\\uD800[\\uDC00-\\uDFFF]|[\\uD801-\\uDBFE][\\uDC00-\\uDFFF]|\\uDBFF[\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])/.test(\n  string,\n);\n/(?:[\\u0000-\\u2129\\u212B-\\uD7FF\\uE000-\\uFFFF]|\\uD800[\\uDC00-\\uDFFF]|[\\uD801-\\uDBFE][\\uDC00-\\uDFFF]|\\uDBFF[\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])/.test(\n  string,\n);\n/(?:[\\u0000-\\u004A\\u004C-\\u2129\\u212B-\\uD7FF\\uE000-\\uFFFF]|\\uD800[\\uDC00-\\uDFFF]|[\\uD801-\\uDBFE][\\uDC00-\\uDFFF]|\\uDBFF[\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])/i.test(\n  string,\n);\n/(?:[\\u0000-\\u006A\\u006C-\\u2129\\u212B-\\uD7FF\\uE000-\\uFFFF]|\\uD800[\\uDC00-\\uDFFF]|[\\uD801-\\uDBFE][\\uDC00-\\uDFFF]|\\uDBFF[\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])/i.test(\n  string,\n);\n/(?:[\\u0000-\\u004A\\u004C-\\u2129\\u212B-\\uD7FF\\uE000-\\uFFFF]|\\uD800[\\uDC00-\\uDFFF]|[\\uD801-\\uDBFE][\\uDC00-\\uDFFF]|\\uDBFF[\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])/i.test(\n  string,\n);',
  '/^https?:\\/\\//.test(string);',
] as const;

export const fixtureCases = [
  {
    title: 'unicode regex — basic (input)',
    source: 'var string = "foo💩bar";\nvar match = string.match(/foo(.)bar/u);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpUnicode: true,
          },
        },
        output: expectedOutputs[0],
      },
    ],
  },
  {
    title: 'unicode regex — ignore non unicode (input)',
    source: 'var string = "foo💩bar";\nvar match = string.match(/foo(.)bar/);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpUnicode: true,
          },
        },
        output: expectedOutputs[1],
      },
    ],
  },
  {
    title: 'unicode regex — negated set (input)',
    source:
      '/[^K]/u.test(string);\n/[^k]/u.test(string);\n/[^\\u212a]/u.test(string);\n\n/[^K]/iu.test(string);\n/[^k]/iu.test(string);\n/[^\\u212a]/iu.test(string);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpUnicode: true,
          },
        },
        output: expectedOutputs[2],
      },
    ],
  },
  {
    title: 'unicode regex — slash (input)',
    source: '/^https?:\\/\\//u.test(string);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpUnicode: true,
          },
        },
        output: expectedOutputs[3],
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
