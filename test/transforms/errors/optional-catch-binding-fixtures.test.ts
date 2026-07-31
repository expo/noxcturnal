import { runFixtures, type FixtureCase } from '../fixture';

const expectedOutputs = [
  'const test = () => {\n  try {\n    throw 0;\n  } catch (_unused) {\n    return true;\n  }\n};\nexpect(test()).toBe(true);\nconst test2 = () => {\n  try {\n    throw 0;\n  } catch (err) {\n    return true;\n  }\n};\nexpect(test2()).toBe(true);',
  "try {\n  throw 0;\n} catch (err) {\n  console.log('it failed, but this code executes');\n}",
  "try {\n  throw 0;\n} catch (_unused) {\n  console.log('it failed, but this code executes');\n}",
  "try {\n  throw 0;\n} catch (err) {\n  console.log('it failed, but this code executes');\n} finally {\n  console.log('this code also executes');\n}",
  "try {\n  throw 0;\n} catch (_unused) {\n  console.log('it failed, but this code executes');\n} finally {\n  console.log('this code also executes');\n}",
] as const;

export const fixtureCases = [
  {
    title: 'optional catch bindings (exec)',
    source:
      'const test = () => {\n  try {\n    throw 0;\n  }\n  catch {\n    return true;\n  }\n}\nexpect(test()).toBe(true);\n\nconst test2 = () => {\n  try {\n    throw 0;\n  }\n  catch (err) {\n    return true;\n  }\n}\nexpect(test2()).toBe(true);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            optionalCatchBinding: true,
          },
        },
        output: expectedOutputs[0],
      },
    ],
  },
  {
    title: 'optional catch bindings — try catch block binding (input)',
    source:
      'try {\n  throw 0;\n} catch (err) {\n  console.log("it failed, but this code executes");\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            optionalCatchBinding: true,
          },
        },
        output: expectedOutputs[1],
      },
    ],
  },
  {
    title: 'optional catch bindings — try catch block no binding (input)',
    source:
      'try {\n  throw 0;\n} catch {\n  console.log("it failed, but this code executes");\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            optionalCatchBinding: true,
          },
        },
        output: expectedOutputs[2],
      },
    ],
  },
  {
    title: 'optional catch bindings — try catch finally binding (input)',
    source:
      'try {\n  throw 0;\n} catch (err) {\n  console.log("it failed, but this code executes");\n} finally {\n  console.log("this code also executes");\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            optionalCatchBinding: true,
          },
        },
        output: expectedOutputs[3],
      },
    ],
  },
  {
    title: 'optional catch bindings — try catch finally no binding (input)',
    source:
      'try {\n  throw 0;\n} catch {\n  console.log("it failed, but this code executes");\n} finally {\n  console.log("this code also executes");\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            optionalCatchBinding: true,
          },
        },
        output: expectedOutputs[4],
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
