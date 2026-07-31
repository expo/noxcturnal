import { runFixtures, type FixtureCase } from '../fixture';

const expectedOutputs = [
  "var p2 = {\n  0: 'a',\n  2: 'c',\n  length: 3,\n};\nvar arr = [];\n{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = p2[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n      (_step = _iteratorNext.call(_iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      var x = _step.value;\n      arr.push(x);\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}\nexpect(arr).toEqual(['a', undefined, 'c']);\nexpect(1 in arr).toBe(true);",
  "var p2 = {\n  0: 'b',\n  1: 'c',\n  2: 'd',\n  length: 2,\n};\nvar arr = [];\n{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = p2[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n      (_step = _iteratorNext.call(_iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      var x = _step.value;\n      arr.push(x);\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}\nexpect(arr).toEqual(['b', 'c']);",
  "var p2 = {\n  0: 'b',\n  1: 'c',\n  2: 'd',\n  length: 3,\n};\nvar arr = [];\n{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = p2[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n      (_step = _iteratorNext.call(_iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      var x = _step.value;\n      arr.push(x);\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}\nexpect(arr).toEqual(['b', 'c', 'd']);",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = p2[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n      (_step = _iteratorNext.call(_iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      var x = _step.value;\n      arr.push(x);\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  'async () => {\n  for await (let foo of []);\n};',
  "let elm;\n{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = array[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n      (_step = _iteratorNext.call(_iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      [elm] = _step.value;\n      {\n        console.log(elm);\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = array[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n      (_step = _iteratorNext.call(_iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      const [elm] = _step.value;\n      {\n        console.log(elm);\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = array[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n      (_step = _iteratorNext.call(_iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      const elm = _step.value;\n      {\n        console.log(elm);\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = items[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n      (_step = _iteratorNext.call(_iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      const i = _step.value;\n      i;\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "let i;\n{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = items[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n      (_step = _iteratorNext.call(_iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      i = _step.value;\n      i;\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "import { array } from 'foo';\n{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = array[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n      (_step = _iteratorNext.call(_iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      const elm = _step.value;\n      {\n        console.log(elm);\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = arr[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n      (_step = _iteratorNext.call(_iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      let o = _step.value;\n      {\n        arr = null;\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = array[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n      (_step = _iteratorNext.call(_iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      const [head, ...tail] = _step.value;\n      {\n        const head = 1;\n        console.log(tail);\n        console.log(head);\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = array[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n      (_step = _iteratorNext.call(_iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      const [type, ...rest] = _step.value;\n      {\n        const type = 1;\n        console.log(rest);\n        console.log(type);\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = array[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n      (_step = _iteratorNext.call(_iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      const [head, ...tail] = _step.value;\n      {\n        const head = 1;\n        let tail;\n        console.log(tail);\n        console.log(head);\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = array[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n      (_step = _iteratorNext.call(_iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      const { type, ...rest } = _step.value;\n      {\n        const type = 1;\n        let rest;\n        console.log(rest);\n        console.log(type);\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = array[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n      (_step = _iteratorNext.call(_iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      const elm = _step.value;\n      {\n        const elm = 2;\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = arr[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n      (_step = _iteratorNext.call(_iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      let o = _step.value;\n      {\n        const arr = o;\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "const array = [];\n{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = array[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n      (_step = _iteratorNext.call(_iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      const elm = _step.value;\n      {\n        console.log(elm);\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "const array = [];\nlet elm;\n{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = array[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n      (_step = _iteratorNext.call(_iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      elm = _step.value;\n      {\n        console.log(elm);\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "let elm;\n{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = array[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n      (_step = _iteratorNext.call(_iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      elm = _step.value;\n      {\n        console.log(elm);\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = arr[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n      (_step = _iteratorNext.call(_iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      i = _step.value;\n      {\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = foo[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n      (_step = _iteratorNext.call(_iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      var i = _step.value;\n      {\n        switch (i) {\n          case 1:\n            break;\n        }\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = arr[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n      (_step = _iteratorNext.call(_iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      let i = _step.value;\n      {\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = arr[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n      (_step = _iteratorNext.call(_iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      obj.prop = _step.value;\n      {\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = arr[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n      (_step = _iteratorNext.call(_iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      var i = _step.value;\n      {\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}\n{\n  var _iteratorNormalCompletion15 = true,\n    _didIteratorError16 = false,\n    _iteratorError17,\n    _iteratorReturnMethod13,\n    _iteratorReturn14;\n  try {\n    for (\n      var _iterator10 = numbers[Symbol.iterator](), _iteratorNext11 = _iterator10.next, _step12;\n      (_step12 = _iteratorNext11.call(_iterator10)), !_step12.done;\n      _iteratorNormalCompletion15 = true\n    ) {\n      if (Object(_step12) !== _step12) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion15 = false;\n      var i = _step12.value;\n      {\n      }\n    }\n  } catch (_iteratorError218) {\n    _didIteratorError16 = true;\n    _iteratorError17 = _iteratorError218;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion15 && (_iteratorReturnMethod13 = _iterator10.return) != null) {\n        _iteratorReturn14 = _iteratorReturnMethod13.call(_iterator10);\n        if (Object(_iteratorReturn14) !== _iteratorReturn14)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError16) throw _iteratorError17;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    b: for (\n      var _iterator = d()[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n      (_step = _iteratorNext.call(_iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      let c = _step.value;\n      {\n        {\n          var _iteratorNormalCompletion16 = true,\n            _didIteratorError17 = false,\n            _iteratorError18,\n            _iteratorReturnMethod14,\n            _iteratorReturn15;\n          try {\n            for (\n              var _iterator11 = f()[Symbol.iterator](), _iteratorNext12 = _iterator11.next, _step13;\n              (_step13 = _iteratorNext12.call(_iterator11)), !_step13.done;\n              _iteratorNormalCompletion16 = true\n            ) {\n              if (Object(_step13) !== _step13)\n                throw new TypeError('Iterator result is not an object');\n              _iteratorNormalCompletion16 = false;\n              let e = _step13.value;\n              {\n                continue b;\n              }\n            }\n          } catch (_iteratorError219) {\n            _didIteratorError17 = true;\n            _iteratorError18 = _iteratorError219;\n          } finally {\n            try {\n              if (\n                !_iteratorNormalCompletion16 &&\n                (_iteratorReturnMethod14 = _iterator11.return) != null\n              ) {\n                _iteratorReturn15 = _iteratorReturnMethod14.call(_iterator11);\n                if (Object(_iteratorReturn15) !== _iteratorReturn15)\n                  throw new TypeError('Iterator result is not an object');\n              }\n            } finally {\n              if (_didIteratorError17) throw _iteratorError18;\n            }\n          }\n        }\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = arr[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n      (_step = _iteratorNext.call(_iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      var i = _step.value;\n      {\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = array[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n      (_step = _iteratorNext.call(_iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      const elm = _step.value;\n      {\n        const elm = 2;\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}\n{\n  var _iteratorNormalCompletion16 = true,\n    _didIteratorError17 = false,\n    _iteratorError18,\n    _iteratorReturnMethod14,\n    _iteratorReturn15;\n  try {\n    for (\n      var _iterator11 = [][Symbol.iterator](), _iteratorNext12 = _iterator11.next, _step13;\n      (_step13 = _iteratorNext12.call(_iterator11)), !_step13.done;\n      _iteratorNormalCompletion16 = true\n    ) {\n      if (Object(_step13) !== _step13) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion16 = false;\n      let x = _step13.value;\n      {\n        let x = 1;\n      }\n    }\n  } catch (_iteratorError219) {\n    _didIteratorError17 = true;\n    _iteratorError18 = _iteratorError219;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion16 && (_iteratorReturnMethod14 = _iterator11.return) != null) {\n        _iteratorReturn15 = _iteratorReturnMethod14.call(_iterator11);\n        if (Object(_iteratorReturn15) !== _iteratorReturn15)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError17) throw _iteratorError18;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = y[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n      (_step = _iteratorNext.call(_iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      let x = _step.value;\n      {\n        let x = 1;\n        let y = 2;\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}\n{\n  var _iteratorNormalCompletion16 = true,\n    _didIteratorError17 = false,\n    _iteratorError18,\n    _iteratorReturnMethod14,\n    _iteratorReturn15;\n  try {\n    for (\n      var _iterator11 = [][Symbol.iterator](), _iteratorNext12 = _iterator11.next, _step13;\n      (_step13 = _iteratorNext12.call(_iterator11)), !_step13.done;\n      _iteratorNormalCompletion16 = true\n    ) {\n      if (Object(_step13) !== _step13) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion16 = false;\n      let x = _step13.value;\n      {\n        let x = 1;\n        let y = 2;\n      }\n    }\n  } catch (_iteratorError219) {\n    _didIteratorError17 = true;\n    _iteratorError18 = _iteratorError219;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion16 && (_iteratorReturnMethod14 = _iterator11.return) != null) {\n        _iteratorReturn15 = _iteratorReturnMethod14.call(_iterator11);\n        if (Object(_iteratorReturn15) !== _iteratorReturn15)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError17) throw _iteratorError18;\n    }\n  }\n}",
  "const x = [];\n{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = x[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n      (_step = _iteratorNext.call(_iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      const y = _step.value;\n      {\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}\nconst arr = Object.entries(x);\n{\n  var _iteratorNormalCompletion17 = true,\n    _didIteratorError18 = false,\n    _iteratorError19,\n    _iteratorReturnMethod15,\n    _iteratorReturn16;\n  try {\n    for (\n      var _iterator12 = arr[Symbol.iterator](), _iteratorNext13 = _iterator12.next, _step14;\n      (_step14 = _iteratorNext13.call(_iterator12)), !_step14.done;\n      _iteratorNormalCompletion17 = true\n    ) {\n      if (Object(_step14) !== _step14) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion17 = false;\n      const y = _step14.value;\n      {\n      }\n    }\n  } catch (_iteratorError220) {\n    _didIteratorError18 = true;\n    _iteratorError19 = _iteratorError220;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion17 && (_iteratorReturnMethod15 = _iterator12.return) != null) {\n        _iteratorReturn16 = _iteratorReturnMethod15.call(_iterator12);\n        if (Object(_iteratorReturn16) !== _iteratorReturn16)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError18) throw _iteratorError19;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = [][Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n      (_step = _iteratorNext.call(_iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      const y = _step.value;\n      {\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}\n{\n  var _iteratorNormalCompletion15 = true,\n    _didIteratorError16 = false,\n    _iteratorError17,\n    _iteratorReturnMethod13,\n    _iteratorReturn14;\n  try {\n    for (\n      var _iterator10 = Array.from(x)[Symbol.iterator](),\n        _iteratorNext11 = _iterator10.next,\n        _step12;\n      (_step12 = _iteratorNext11.call(_iterator10)), !_step12.done;\n      _iteratorNormalCompletion15 = true\n    ) {\n      if (Object(_step12) !== _step12) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion15 = false;\n      const y = _step12.value;\n      {\n      }\n    }\n  } catch (_iteratorError218) {\n    _didIteratorError16 = true;\n    _iteratorError17 = _iteratorError218;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion15 && (_iteratorReturnMethod13 = _iterator10.return) != null) {\n        _iteratorReturn14 = _iteratorReturnMethod13.call(_iterator10);\n        if (Object(_iteratorReturn14) !== _iteratorReturn14)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError16) throw _iteratorError17;\n    }\n  }\n}\n{\n  var _iteratorNormalCompletion24 = true,\n    _didIteratorError25 = false,\n    _iteratorError26,\n    _iteratorReturnMethod22,\n    _iteratorReturn23;\n  try {\n    for (\n      var _iterator19 = Object.keys(x)[Symbol.iterator](),\n        _iteratorNext20 = _iterator19.next,\n        _step21;\n      (_step21 = _iteratorNext20.call(_iterator19)), !_step21.done;\n      _iteratorNormalCompletion24 = true\n    ) {\n      if (Object(_step21) !== _step21) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion24 = false;\n      const y = _step21.value;\n      {\n      }\n    }\n  } catch (_iteratorError227) {\n    _didIteratorError25 = true;\n    _iteratorError26 = _iteratorError227;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion24 && (_iteratorReturnMethod22 = _iterator19.return) != null) {\n        _iteratorReturn23 = _iteratorReturnMethod22.call(_iterator19);\n        if (Object(_iteratorReturn23) !== _iteratorReturn23)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError25) throw _iteratorError26;\n    }\n  }\n}\n{\n  var _iteratorNormalCompletion33 = true,\n    _didIteratorError34 = false,\n    _iteratorError35,\n    _iteratorReturnMethod31,\n    _iteratorReturn32;\n  try {\n    for (\n      var _iterator28 = Object.values(x)[Symbol.iterator](),\n        _iteratorNext29 = _iterator28.next,\n        _step30;\n      (_step30 = _iteratorNext29.call(_iterator28)), !_step30.done;\n      _iteratorNormalCompletion33 = true\n    ) {\n      if (Object(_step30) !== _step30) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion33 = false;\n      const y = _step30.value;\n      {\n      }\n    }\n  } catch (_iteratorError236) {\n    _didIteratorError34 = true;\n    _iteratorError35 = _iteratorError236;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion33 && (_iteratorReturnMethod31 = _iterator28.return) != null) {\n        _iteratorReturn32 = _iteratorReturnMethod31.call(_iterator28);\n        if (Object(_iteratorReturn32) !== _iteratorReturn32)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError34) throw _iteratorError35;\n    }\n  }\n}\n{\n  var _iteratorNormalCompletion42 = true,\n    _didIteratorError43 = false,\n    _iteratorError44,\n    _iteratorReturnMethod40,\n    _iteratorReturn41;\n  try {\n    for (\n      var _iterator37 = Object.entries(x)[Symbol.iterator](),\n        _iteratorNext38 = _iterator37.next,\n        _step39;\n      (_step39 = _iteratorNext38.call(_iterator37)), !_step39.done;\n      _iteratorNormalCompletion42 = true\n    ) {\n      if (Object(_step39) !== _step39) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion42 = false;\n      const y = _step39.value;\n      {\n      }\n    }\n  } catch (_iteratorError245) {\n    _didIteratorError43 = true;\n    _iteratorError44 = _iteratorError245;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion42 && (_iteratorReturnMethod40 = _iterator37.return) != null) {\n        _iteratorReturn41 = _iteratorReturnMethod40.call(_iterator37);\n        if (Object(_iteratorReturn41) !== _iteratorReturn41)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError43) throw _iteratorError44;\n    }\n  }\n}",
  "// @flow\n// This won't be optimize because when `for-of` is handled, the b's type annotation has been removed by the Flow plugin\nfunction a(b) {\n  {\n    var _iteratorNormalCompletion = true,\n      _didIteratorError = false,\n      _iteratorError,\n      _iteratorReturnMethod,\n      _iteratorReturn;\n    try {\n      for (\n        var _iterator = b[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n        (_step = _iteratorNext.call(_iterator)), !_step.done;\n        _iteratorNormalCompletion = true\n      ) {\n        if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n        _iteratorNormalCompletion = false;\n        const y = _step.value;\n        {\n        }\n      }\n    } catch (_iteratorError2) {\n      _didIteratorError = true;\n      _iteratorError = _iteratorError2;\n    } finally {\n      try {\n        if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n          _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n          if (Object(_iteratorReturn) !== _iteratorReturn)\n            throw new TypeError('Iterator result is not an object');\n        }\n      } finally {\n        if (_didIteratorError) throw _iteratorError;\n      }\n    }\n  }\n}",
  "// @flow\n{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = b[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n      (_step = _iteratorNext.call(_iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      const y = _step.value;\n      {\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "// This won't be optimize because when `for-of` is handled, the b's type annotation has been removed by the TS plugin\nfunction a(b) {\n  {\n    var _iteratorNormalCompletion = true,\n      _didIteratorError = false,\n      _iteratorError,\n      _iteratorReturnMethod,\n      _iteratorReturn;\n    try {\n      for (\n        var _iterator = b[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n        (_step = _iteratorNext.call(_iterator)), !_step.done;\n        _iteratorNormalCompletion = true\n      ) {\n        if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n        _iteratorNormalCompletion = false;\n        const y = _step.value;\n        {\n        }\n      }\n    } catch (_iteratorError2) {\n      _didIteratorError = true;\n      _iteratorError = _iteratorError2;\n    } finally {\n      try {\n        if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n          _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n          if (Object(_iteratorReturn) !== _iteratorReturn)\n            throw new TypeError('Iterator result is not an object');\n        }\n      } finally {\n        if (_didIteratorError) throw _iteratorError;\n      }\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = b[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n      (_step = _iteratorNext.call(_iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      const y = _step.value;\n      {\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "if (true) {\n  {\n    var _iteratorNormalCompletion = true,\n      _didIteratorError = false,\n      _iteratorError,\n      _iteratorReturnMethod,\n      _iteratorReturn;\n    try {\n      loop: for (\n        var _iterator = [][Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n        (_step = _iteratorNext.call(_iterator)), !_step.done;\n        _iteratorNormalCompletion = true\n      ) {\n        if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n        _iteratorNormalCompletion = false;\n        let ch = _step.value;\n        {\n        }\n      }\n    } catch (_iteratorError2) {\n      _didIteratorError = true;\n      _iteratorError = _iteratorError2;\n    } finally {\n      try {\n        if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n          _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n          if (Object(_iteratorReturn) !== _iteratorReturn)\n            throw new TypeError('Iterator result is not an object');\n        }\n      } finally {\n        if (_didIteratorError) throw _iteratorError;\n      }\n    }\n  }\n}",
  "if (true) {\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    actions: for (\n      var _iterator = y[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n      (_step = _iteratorNext.call(_iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      let x = _step.value;\n      {\n        continue actions;\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "if (true) {\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    loop: for (\n      var _iterator = [][Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n      (_step = _iteratorNext.call(_iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      let ch = _step.value;\n      {\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    myLabel: for (\n      var _iterator = b[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n      (_step = _iteratorNext.call(_iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      let a = _step.value;\n      {\n        continue myLabel;\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "function f(...t) {\n  {\n    var _iteratorNormalCompletion = true,\n      _didIteratorError = false,\n      _iteratorError,\n      _iteratorReturnMethod,\n      _iteratorReturn;\n    try {\n      for (\n        var _iterator = t[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n        (_step = _iteratorNext.call(_iterator)), !_step.done;\n        _iteratorNormalCompletion = true\n      ) {\n        if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n        _iteratorNormalCompletion = false;\n        let o = _step.value;\n        {\n          const t = o;\n        }\n      }\n    } catch (_iteratorError2) {\n      _didIteratorError = true;\n      _iteratorError = _iteratorError2;\n    } finally {\n      try {\n        if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n          _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n          if (Object(_iteratorReturn) !== _iteratorReturn)\n            throw new TypeError('Iterator result is not an object');\n        }\n      } finally {\n        if (_didIteratorError) throw _iteratorError;\n      }\n    }\n  }\n}",
  "function foo() {\n  let input = ['a', 'b', 'c'];\n  let output = {};\n  {\n    var _iteratorNormalCompletion = true,\n      _didIteratorError = false,\n      _iteratorError,\n      _iteratorReturnMethod,\n      _iteratorReturn;\n    try {\n      for (\n        var _iterator = input[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n        (_step = _iteratorNext.call(_iterator)), !_step.done;\n        _iteratorNormalCompletion = true\n      ) {\n        if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n        _iteratorNormalCompletion = false;\n        let c = _step.value;\n        {\n          let name = c;\n          output[name] = name;\n        }\n      }\n    } catch (_iteratorError2) {\n      _didIteratorError = true;\n      _iteratorError = _iteratorError2;\n    } finally {\n      try {\n        if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n          _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n          if (Object(_iteratorReturn) !== _iteratorReturn)\n            throw new TypeError('Iterator result is not an object');\n        }\n      } finally {\n        if (_didIteratorError) throw _iteratorError;\n      }\n    }\n  }\n  return output;\n}",
  "var arr = [1, 2, 3];\nvar results = [];\n{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = arr[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n      (_step = _iteratorNext.call(_iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      let v = _step.value;\n      {\n        results.push(v);\n        arr = null;\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}\nexpect(results).toEqual([1, 2, 3]);",
  "var arr = [1, 2, 3];\n{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = arr[Symbol.iterator](), _iteratorNext = _iterator.next, _step;\n      (_step = _iteratorNext.call(_iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      let v = _step.value;\n      {\n        console.log(v);\n        arr = null;\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorReturnMethod.call(_iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
] as const;

export const fixtureCases = [
  {
    title: 'allowArrayLike — holes (exec)',
    source:
      'var p2 = { 0: "a", 2: "c", length: 3 };\n\nvar arr = [];\nfor (var x of p2) arr.push(x);\n\nexpect(arr).toEqual(["a", undefined, "c"]);\nexpect(1 in arr).toBe(true); // Not holey\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[0],
      },
    ],
  },
  {
    title: 'allowArrayLike — length cropped (exec)',
    source:
      'var p2 = { 0: "b", 1: "c", 2: "d", length: 2 };\n\nvar arr = [];\nfor (var x of p2) arr.push(x);\n\nexpect(arr).toEqual(["b", "c"]);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[1],
      },
    ],
  },
  {
    title: 'allowArrayLike — simple (exec)',
    source:
      'var p2 = { 0: "b", 1: "c", 2: "d", length: 3 };\n\nvar arr = [];\nfor (var x of p2) arr.push(x);\n\nexpect(arr).toEqual(["b", "c", "d"]);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[2],
      },
    ],
  },
  {
    title: 'allowArrayLike — simple (input)',
    source: 'for (var x of p2) arr.push(x);\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[3],
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for await of (input)',
    source: 'async () => { for await (let foo of []); };\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[4],
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of array pattern (input)',
    source: 'let elm;\nfor ([elm] of array) {\n  console.log(elm);\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[5],
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of declaration array pattern (input)',
    source: 'for (const [elm] of array) {\n  console.log(elm);\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[6],
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of declaration (input)',
    source: 'for (const elm of array) {\n  console.log(elm);\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[7],
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of expression declaration (input)',
    source: 'for (const i of items) i;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[8],
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of expression (input)',
    source: 'let i;\nfor (i of items) i;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[9],
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of import amd (input)',
    source: 'import { array } from "foo";\n\nfor (const elm of array) {\n  console.log(elm);\n}\n',
    filename: 'input.mjs',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[10],
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of modify iterable (input)',
    source: 'for (let o of arr) {\n  arr = null;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[11],
      },
    ],
  },
  {
    title:
      'assumption iterableIsArray — for of partial redeclaration in body array pattern (input)',
    source:
      'for (const [head, ...tail] of array) {\n  const head = 1;\n  console.log(tail);\n  console.log(head);\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[12],
      },
    ],
  },
  {
    title:
      'assumption iterableIsArray — for of partial redeclaration in body object pattern (input)',
    source:
      'for (const [type, ...rest] of array) {\n  const type = 1;\n  console.log(rest);\n  console.log(type);\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[13],
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of redeclaration in body array pattern (input)',
    source:
      'for (const [head, ...tail] of array) {\n  const head = 1;\n  let tail;\n  console.log(tail);\n  console.log(head);\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[14],
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of redeclaration in body object pattern (input)',
    source:
      'for (const {type, ...rest} of array) {\n  const type = 1;\n  let rest;\n  console.log(rest);\n  console.log(type);\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[15],
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of redeclaration in body (input)',
    source: 'for (const elm of array) {\n  const elm = 2;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[16],
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of redeclare iterable (input)',
    source: 'for (let o of arr) {\n  const arr = o;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[17],
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of static declaration (input)',
    source: 'const array = [];\n\nfor (const elm of array) {\n  console.log(elm);\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[18],
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of static (input)',
    source: 'const array = [];\nlet elm;\n\nfor (elm of array) {\n  console.log(elm);\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[19],
      },
    ],
  },
  {
    title: 'assumption iterableIsArray — for of (input)',
    source: 'let elm;\n\nfor (elm of array) {\n  console.log(elm);\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[20],
      },
    ],
  },
  {
    title: 'assumption skipForOfIteratorClosing — identifier (input)',
    source: 'for (i of arr) {\n\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[21],
      },
    ],
  },
  {
    title: 'assumption skipForOfIteratorClosing — ignore cases (input)',
    source: 'for (var i of foo) {\n  switch (i) {\n    case 1:\n      break;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[22],
      },
    ],
  },
  {
    title: 'assumption skipForOfIteratorClosing — let (input)',
    source: 'for (let i of arr) {\n\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[23],
      },
    ],
  },
  {
    title: 'assumption skipForOfIteratorClosing — member expression (input)',
    source: 'for (obj.prop of arr) {\n\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[24],
      },
    ],
  },
  {
    title: 'assumption skipForOfIteratorClosing — multiple (input)',
    source: 'for (var i of arr) {\n\n}\n\nfor (var i of numbers) {\n\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[25],
      },
    ],
  },
  {
    title: 'assumption skipForOfIteratorClosing — nested label for of (input)',
    source: 'b: for (let c of d()) {\n  for (let e of f()) {\n    continue b;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[26],
      },
    ],
  },
  {
    title: 'assumption skipForOfIteratorClosing — var (input)',
    source: 'for (var i of arr) {\n\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[27],
      },
    ],
  },
  {
    title: 'for of as array — for of redeclaration in body (input)',
    source:
      'for (const elm of array) {\n  const elm = 2;\n}\n\nfor (let x of []) {\n  let x = 1;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[28],
      },
    ],
  },
  {
    title: 'loose — for of redeclaration in body (input)',
    source:
      'for (let x of y) {\n  let x = 1;\n  let y = 2;\n}\n\nfor (let x of []) {\n  let x = 1;\n  let y = 2;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[29],
      },
    ],
  },
  {
    title: 'opt — array binding (input)',
    source:
      'const x = [];\nfor (const y of x) {}\nconst arr = Object.entries(x);\nfor (const y of arr) {}\n\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[30],
      },
    ],
  },
  {
    title: 'opt — built ins (input)',
    source:
      'for (const y of []) {}\nfor (const y of Array.from(x)) {}\nfor (const y of Object.keys(x)) {}\nfor (const y of Object.values(x)) {}\nfor (const y of Object.entries(x)) {}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[31],
      },
    ],
  },
  {
    title: 'opt — type annotation array flow deopt (input)',
    source:
      "// @flow\n// This won't be optimize because when `for-of` is handled, the b's type annotation has been removed by the Flow plugin\nfunction a(b: Array<any>) {\n  for (const y of b) {}\n}\n",
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[32],
      },
    ],
  },
  {
    title: 'opt — type annotation array flow (input)',
    source: '// @flow\nfor (const y of (b: Array<any>)) {}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[33],
      },
    ],
  },
  {
    title: 'opt — type annotation array ts deopt (input)',
    source:
      "// This won't be optimize because when `for-of` is handled, the b's type annotation has been removed by the TS plugin\nfunction a(b: Array<any>) {\n  for (const y of b) {}\n}\n",
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[34],
      },
    ],
  },
  {
    title: 'opt — type annotation array ts (input)',
    source: 'for (const y of (b as Array<any>)) {}\n',
    filename: 'input.ts',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[35],
      },
    ],
  },
  {
    title: 'regression — if block label 3858 (input)',
    source: 'if ( true ) {\n  loop: for (let ch of []) {\n  }\n}\n\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[36],
      },
    ],
  },
  {
    title: 'regression — if block label generic iterable 12610 (input)',
    source: 'if (true)\n  actions: for (let x of y) {\n    continue actions\n  }\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[37],
      },
    ],
  },
  {
    title: 'regression — if label 3858 (input)',
    source: 'if ( true )\n  loop: for (let ch of []) {\n  }\n\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[38],
      },
    ],
  },
  {
    title: 'regression — label object with comment 4995 (input)',
    source: 'myLabel: //woops\nfor (let a of b) {\n  continue myLabel;\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[39],
      },
    ],
  },
  {
    title: 'regression — redeclare array 8913 (input)',
    source: 'function f(...t) {\n  for (let o of t) {\n    const t = o;\n  }\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[40],
      },
    ],
  },
  {
    title: 'regression — regression 1169 (input)',
    source:
      "function foo() {\n  let input = ['a', 'b', 'c']\n  let output = {}\n\n  for (let c of input) {\n    let name = c\n    output[name] = name\n  }\n\n  return output\n}\n",
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[41],
      },
    ],
  },
  {
    title: 'regression — scope 9696 (exec)',
    source:
      'var arr = [1, 2, 3];\nvar results = [];\n\nfor (let v of arr) {\n  results.push(v);\n  arr = null;\n}\n\nexpect(results).toEqual([1, 2, 3]);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[42],
      },
    ],
  },
  {
    title: 'regression — scope 9696 (input)',
    source: 'var arr = [1,2,3]\n\nfor (let v of arr) {\n  console.log(v)\n  arr = null\n}\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            forOf: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[43],
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
