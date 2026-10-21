import { runFixtures, type FixtureCase } from '../fixture';

export const fixtureCases = [
  {
    title: 'unicode regex — basic (input)',
    source: `var string = "foo💩bar";
var match = string.match(/foo(.)bar/u);
`,
    filename: 'input.js',
    output: `var string = 'foo💩bar';
var match = string.match(
  /foo((?:[\\u0000-\\u0009\\u000B-\\u000C\\u000E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF]))bar/,
);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpUnicode: true,
          },
        },
      },
    ],
  },
  {
    title: 'unicode regex — ignore non unicode (input)',
    source: `var string = "foo💩bar";
var match = string.match(/foo(.)bar/);
`,
    filename: 'input.js',
    output: `var string = 'foo💩bar';
var match = string.match(/foo(.)bar/);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpUnicode: true,
          },
        },
      },
    ],
  },
  {
    title: 'unicode regex — negated set (input)',
    source: `/[^K]/u.test(string);
/[^k]/u.test(string);
/[^\\u212a]/u.test(string);

/[^K]/iu.test(string);
/[^k]/iu.test(string);
/[^\\u212a]/iu.test(string);
`,
    filename: 'input.js',
    output: `/(?:[\\u0000-\\u004A\\u004C-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])/.test(
  string,
);
/(?:[\\u0000-\\u006A\\u006C-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])/.test(
  string,
);
/(?:[\\u0000-\\u2129\\u212B-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])/.test(
  string,
);
/(?:[\\u0000-\\u004A\\u004C-\\u006A\\u006C-\\u2129\\u212B-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])/i.test(
  string,
);
/(?:[\\u0000-\\u004A\\u004C-\\u006A\\u006C-\\u2129\\u212B-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])/i.test(
  string,
);
/(?:[\\u0000-\\u004A\\u004C-\\u006A\\u006C-\\u2129\\u212B-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[\\u0000-\\uD7FF\\uDC00-\\uFFFF]|^)[\\uDC00-\\uDFFF])/i.test(
  string,
);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpUnicode: true,
          },
        },
      },
    ],
  },
  {
    title: 'unicode regex — slash (input)',
    source: `/^https?:\\/\\//u.test(string);
`,
    filename: 'input.js',
    output: '/^https?:\\/\\//.test(string);',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpUnicode: true,
          },
        },
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
