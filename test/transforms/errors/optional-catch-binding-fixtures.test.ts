import { runFixtures, type FixtureCase } from '../fixture';

export const fixtureCases = [
  {
    title: 'optional catch bindings (exec)',
    source: `const test = () => {
  try {
    throw 0;
  }
  catch {
    return true;
  }
}
expect(test()).toBe(true);

const test2 = () => {
  try {
    throw 0;
  }
  catch (err) {
    return true;
  }
}
expect(test2()).toBe(true);
`,
    filename: 'exec.js',
    output: `const test = () => {
  try {
    throw 0;
  } catch (_unused) {
    return true;
  }
};
expect(test()).toBe(true);
const test2 = () => {
  try {
    throw 0;
  } catch (err) {
    return true;
  }
};
expect(test2()).toBe(true);`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            optionalCatchBinding: true,
          },
        },
      },
    ],
  },
  {
    title: 'optional catch bindings — try catch block binding (input)',
    source: `try {
  throw 0;
} catch (err) {
  console.log("it failed, but this code executes");
}
`,
    filename: 'input.js',
    output: `try {
  throw 0;
} catch (err) {
  console.log('it failed, but this code executes');
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            optionalCatchBinding: true,
          },
        },
      },
    ],
  },
  {
    title: 'optional catch bindings — try catch block no binding (input)',
    source: `try {
  throw 0;
} catch {
  console.log("it failed, but this code executes");
}
`,
    filename: 'input.js',
    output: `try {
  throw 0;
} catch (_unused) {
  console.log('it failed, but this code executes');
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            optionalCatchBinding: true,
          },
        },
      },
    ],
  },
  {
    title: 'optional catch bindings — try catch finally binding (input)',
    source: `try {
  throw 0;
} catch (err) {
  console.log("it failed, but this code executes");
} finally {
  console.log("this code also executes");
}
`,
    filename: 'input.js',
    output: `try {
  throw 0;
} catch (err) {
  console.log('it failed, but this code executes');
} finally {
  console.log('this code also executes');
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            optionalCatchBinding: true,
          },
        },
      },
    ],
  },
  {
    title: 'optional catch bindings — try catch finally no binding (input)',
    source: `try {
  throw 0;
} catch {
  console.log("it failed, but this code executes");
} finally {
  console.log("this code also executes");
}
`,
    filename: 'input.js',
    output: `try {
  throw 0;
} catch (_unused) {
  console.log('it failed, but this code executes');
} finally {
  console.log('this code also executes');
}`,
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            optionalCatchBinding: true,
          },
        },
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
