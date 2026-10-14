import { runFixtures, type FixtureCase } from '../fixture';

const expectedOutputs = [
  "var p2 = {\n  0: 'a',\n  2: 'c',\n  length: 3,\n};\nvar arr = [];\n{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = p2[Symbol.iterator](),\n        _iteratorNext = _iterator.next,\n        _iteratorCall = function () {}.call,\n        _step;\n      (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      var x = _step.value;\n      arr.push(x);\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}\nexpect(arr).toEqual(['a', undefined, 'c']);\nexpect(1 in arr).toBe(true);",
  "var p2 = {\n  0: 'b',\n  1: 'c',\n  2: 'd',\n  length: 2,\n};\nvar arr = [];\n{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = p2[Symbol.iterator](),\n        _iteratorNext = _iterator.next,\n        _iteratorCall = function () {}.call,\n        _step;\n      (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      var x = _step.value;\n      arr.push(x);\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}\nexpect(arr).toEqual(['b', 'c']);",
  "var p2 = {\n  0: 'b',\n  1: 'c',\n  2: 'd',\n  length: 3,\n};\nvar arr = [];\n{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = p2[Symbol.iterator](),\n        _iteratorNext = _iterator.next,\n        _iteratorCall = function () {}.call,\n        _step;\n      (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      var x = _step.value;\n      arr.push(x);\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}\nexpect(arr).toEqual(['b', 'c', 'd']);",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = p2[Symbol.iterator](),\n        _iteratorNext = _iterator.next,\n        _iteratorCall = function () {}.call,\n        _step;\n      (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      var x = _step.value;\n      arr.push(x);\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  'async () => {\n  for await (let foo of []);\n};',
  "let elm;\n{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = array[Symbol.iterator](),\n        _iteratorNext = _iterator.next,\n        _iteratorCall = function () {}.call,\n        _step;\n      (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      [elm] = _step.value;\n      {\n        console.log(elm);\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = array[Symbol.iterator](),\n        _iteratorNext = _iterator.next,\n        _iteratorCall = function () {}.call,\n        _step;\n      (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      const [elm] = _step.value;\n      {\n        console.log(elm);\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = array[Symbol.iterator](),\n        _iteratorNext = _iterator.next,\n        _iteratorCall = function () {}.call,\n        _step;\n      (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      const elm = _step.value;\n      {\n        console.log(elm);\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = items[Symbol.iterator](),\n        _iteratorNext = _iterator.next,\n        _iteratorCall = function () {}.call,\n        _step;\n      (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      const i = _step.value;\n      i;\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "let i;\n{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = items[Symbol.iterator](),\n        _iteratorNext = _iterator.next,\n        _iteratorCall = function () {}.call,\n        _step;\n      (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      i = _step.value;\n      i;\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "import { array } from 'foo';\n{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = array[Symbol.iterator](),\n        _iteratorNext = _iterator.next,\n        _iteratorCall = function () {}.call,\n        _step;\n      (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      const elm = _step.value;\n      {\n        console.log(elm);\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = arr[Symbol.iterator](),\n        _iteratorNext = _iterator.next,\n        _iteratorCall = function () {}.call,\n        _step;\n      (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      let o = _step.value;\n      {\n        arr = null;\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = array[Symbol.iterator](),\n        _iteratorNext = _iterator.next,\n        _iteratorCall = function () {}.call,\n        _step;\n      (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      const [head, ...tail] = _step.value;\n      {\n        const head = 1;\n        console.log(tail);\n        console.log(head);\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = array[Symbol.iterator](),\n        _iteratorNext = _iterator.next,\n        _iteratorCall = function () {}.call,\n        _step;\n      (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      const [type, ...rest] = _step.value;\n      {\n        const type = 1;\n        console.log(rest);\n        console.log(type);\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = array[Symbol.iterator](),\n        _iteratorNext = _iterator.next,\n        _iteratorCall = function () {}.call,\n        _step;\n      (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      const [head, ...tail] = _step.value;\n      {\n        const head = 1;\n        let tail;\n        console.log(tail);\n        console.log(head);\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = array[Symbol.iterator](),\n        _iteratorNext = _iterator.next,\n        _iteratorCall = function () {}.call,\n        _step;\n      (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      const { type, ...rest } = _step.value;\n      {\n        const type = 1;\n        let rest;\n        console.log(rest);\n        console.log(type);\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = array[Symbol.iterator](),\n        _iteratorNext = _iterator.next,\n        _iteratorCall = function () {}.call,\n        _step;\n      (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      const elm = _step.value;\n      {\n        const elm = 2;\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = arr[Symbol.iterator](),\n        _iteratorNext = _iterator.next,\n        _iteratorCall = function () {}.call,\n        _step;\n      (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      let o = _step.value;\n      {\n        const arr = o;\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "const array = [];\n{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = array[Symbol.iterator](),\n        _iteratorNext = _iterator.next,\n        _iteratorCall = function () {}.call,\n        _step;\n      (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      const elm = _step.value;\n      {\n        console.log(elm);\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "const array = [];\nlet elm;\n{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = array[Symbol.iterator](),\n        _iteratorNext = _iterator.next,\n        _iteratorCall = function () {}.call,\n        _step;\n      (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      elm = _step.value;\n      {\n        console.log(elm);\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "let elm;\n{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = array[Symbol.iterator](),\n        _iteratorNext = _iterator.next,\n        _iteratorCall = function () {}.call,\n        _step;\n      (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      elm = _step.value;\n      {\n        console.log(elm);\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = arr[Symbol.iterator](),\n        _iteratorNext = _iterator.next,\n        _iteratorCall = function () {}.call,\n        _step;\n      (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      i = _step.value;\n      {\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = foo[Symbol.iterator](),\n        _iteratorNext = _iterator.next,\n        _iteratorCall = function () {}.call,\n        _step;\n      (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      var i = _step.value;\n      {\n        switch (i) {\n          case 1:\n            break;\n        }\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = arr[Symbol.iterator](),\n        _iteratorNext = _iterator.next,\n        _iteratorCall = function () {}.call,\n        _step;\n      (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      let i = _step.value;\n      {\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = arr[Symbol.iterator](),\n        _iteratorNext = _iterator.next,\n        _iteratorCall = function () {}.call,\n        _step;\n      (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      obj.prop = _step.value;\n      {\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = arr[Symbol.iterator](),\n        _iteratorNext = _iterator.next,\n        _iteratorCall = function () {}.call,\n        _step;\n      (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      var i = _step.value;\n      {\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}\n{\n  var _iteratorNormalCompletion19 = true,\n    _didIteratorError20 = false,\n    _iteratorError21,\n    _iteratorReturnMethod17,\n    _iteratorReturn18;\n  try {\n    for (\n      var _iterator13 = numbers[Symbol.iterator](),\n        _iteratorNext14 = _iterator13.next,\n        _iteratorCall15 = function () {}.call,\n        _step16;\n      (_step16 = _iteratorCall15.call(_iteratorNext14, _iterator13)), !_step16.done;\n      _iteratorNormalCompletion19 = true\n    ) {\n      if (Object(_step16) !== _step16) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion19 = false;\n      var i = _step16.value;\n      {\n      }\n    }\n  } catch (_iteratorError222) {\n    _didIteratorError20 = true;\n    _iteratorError21 = _iteratorError222;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion19 && (_iteratorReturnMethod17 = _iterator13.return) != null) {\n        _iteratorReturn18 = _iteratorCall15.call(_iteratorReturnMethod17, _iterator13);\n        if (Object(_iteratorReturn18) !== _iteratorReturn18)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError20) throw _iteratorError21;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    b: for (\n      var _iterator = d()[Symbol.iterator](),\n        _iteratorNext = _iterator.next,\n        _iteratorCall = function () {}.call,\n        _step;\n      (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      let c = _step.value;\n      {\n        {\n          var _iteratorNormalCompletion20 = true,\n            _didIteratorError21 = false,\n            _iteratorError22,\n            _iteratorReturnMethod18,\n            _iteratorReturn19;\n          try {\n            for (\n              var _iterator14 = f()[Symbol.iterator](),\n                _iteratorNext15 = _iterator14.next,\n                _iteratorCall16 = function () {}.call,\n                _step17;\n              (_step17 = _iteratorCall16.call(_iteratorNext15, _iterator14)), !_step17.done;\n              _iteratorNormalCompletion20 = true\n            ) {\n              if (Object(_step17) !== _step17)\n                throw new TypeError('Iterator result is not an object');\n              _iteratorNormalCompletion20 = false;\n              let e = _step17.value;\n              {\n                continue b;\n              }\n            }\n          } catch (_iteratorError223) {\n            _didIteratorError21 = true;\n            _iteratorError22 = _iteratorError223;\n          } finally {\n            try {\n              if (\n                !_iteratorNormalCompletion20 &&\n                (_iteratorReturnMethod18 = _iterator14.return) != null\n              ) {\n                _iteratorReturn19 = _iteratorCall16.call(_iteratorReturnMethod18, _iterator14);\n                if (Object(_iteratorReturn19) !== _iteratorReturn19)\n                  throw new TypeError('Iterator result is not an object');\n              }\n            } finally {\n              if (_didIteratorError21) throw _iteratorError22;\n            }\n          }\n        }\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = arr[Symbol.iterator](),\n        _iteratorNext = _iterator.next,\n        _iteratorCall = function () {}.call,\n        _step;\n      (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      var i = _step.value;\n      {\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = array[Symbol.iterator](),\n        _iteratorNext = _iterator.next,\n        _iteratorCall = function () {}.call,\n        _step;\n      (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      const elm = _step.value;\n      {\n        const elm = 2;\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}\n{\n  var _iteratorNormalCompletion19 = true,\n    _didIteratorError20 = false,\n    _iteratorError21,\n    _iteratorReturnMethod17,\n    _iteratorReturn18;\n  try {\n    for (\n      var _iterator13 = [][Symbol.iterator](),\n        _iteratorNext14 = _iterator13.next,\n        _iteratorCall15 = function () {}.call,\n        _step16;\n      (_step16 = _iteratorCall15.call(_iteratorNext14, _iterator13)), !_step16.done;\n      _iteratorNormalCompletion19 = true\n    ) {\n      if (Object(_step16) !== _step16) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion19 = false;\n      let x = _step16.value;\n      {\n        let x = 1;\n      }\n    }\n  } catch (_iteratorError222) {\n    _didIteratorError20 = true;\n    _iteratorError21 = _iteratorError222;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion19 && (_iteratorReturnMethod17 = _iterator13.return) != null) {\n        _iteratorReturn18 = _iteratorCall15.call(_iteratorReturnMethod17, _iterator13);\n        if (Object(_iteratorReturn18) !== _iteratorReturn18)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError20) throw _iteratorError21;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = y[Symbol.iterator](),\n        _iteratorNext = _iterator.next,\n        _iteratorCall = function () {}.call,\n        _step;\n      (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      let x = _step.value;\n      {\n        let x = 1;\n        let y = 2;\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}\n{\n  var _iteratorNormalCompletion18 = true,\n    _didIteratorError19 = false,\n    _iteratorError20,\n    _iteratorReturnMethod16,\n    _iteratorReturn17;\n  try {\n    for (\n      var _iterator12 = [][Symbol.iterator](),\n        _iteratorNext13 = _iterator12.next,\n        _iteratorCall14 = function () {}.call,\n        _step15;\n      (_step15 = _iteratorCall14.call(_iteratorNext13, _iterator12)), !_step15.done;\n      _iteratorNormalCompletion18 = true\n    ) {\n      if (Object(_step15) !== _step15) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion18 = false;\n      let x = _step15.value;\n      {\n        let x = 1;\n        let y = 2;\n      }\n    }\n  } catch (_iteratorError221) {\n    _didIteratorError19 = true;\n    _iteratorError20 = _iteratorError221;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion18 && (_iteratorReturnMethod16 = _iterator12.return) != null) {\n        _iteratorReturn17 = _iteratorCall14.call(_iteratorReturnMethod16, _iterator12);\n        if (Object(_iteratorReturn17) !== _iteratorReturn17)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError19) throw _iteratorError20;\n    }\n  }\n}",
  "const x = [];\n{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = x[Symbol.iterator](),\n        _iteratorNext = _iterator.next,\n        _iteratorCall = function () {}.call,\n        _step;\n      (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      const y = _step.value;\n      {\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}\nconst arr = Object.entries(x);\n{\n  var _iteratorNormalCompletion20 = true,\n    _didIteratorError21 = false,\n    _iteratorError22,\n    _iteratorReturnMethod18,\n    _iteratorReturn19;\n  try {\n    for (\n      var _iterator14 = arr[Symbol.iterator](),\n        _iteratorNext15 = _iterator14.next,\n        _iteratorCall16 = function () {}.call,\n        _step17;\n      (_step17 = _iteratorCall16.call(_iteratorNext15, _iterator14)), !_step17.done;\n      _iteratorNormalCompletion20 = true\n    ) {\n      if (Object(_step17) !== _step17) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion20 = false;\n      const y = _step17.value;\n      {\n      }\n    }\n  } catch (_iteratorError223) {\n    _didIteratorError21 = true;\n    _iteratorError22 = _iteratorError223;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion20 && (_iteratorReturnMethod18 = _iterator14.return) != null) {\n        _iteratorReturn19 = _iteratorCall16.call(_iteratorReturnMethod18, _iterator14);\n        if (Object(_iteratorReturn19) !== _iteratorReturn19)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError21) throw _iteratorError22;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = [][Symbol.iterator](),\n        _iteratorNext = _iterator.next,\n        _iteratorCall = function () {}.call,\n        _step;\n      (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      const y = _step.value;\n      {\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}\n{\n  var _iteratorNormalCompletion20 = true,\n    _didIteratorError21 = false,\n    _iteratorError22,\n    _iteratorReturnMethod18,\n    _iteratorReturn19;\n  try {\n    for (\n      var _iterator14 = Array.from(x)[Symbol.iterator](),\n        _iteratorNext15 = _iterator14.next,\n        _iteratorCall16 = function () {}.call,\n        _step17;\n      (_step17 = _iteratorCall16.call(_iteratorNext15, _iterator14)), !_step17.done;\n      _iteratorNormalCompletion20 = true\n    ) {\n      if (Object(_step17) !== _step17) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion20 = false;\n      const y = _step17.value;\n      {\n      }\n    }\n  } catch (_iteratorError223) {\n    _didIteratorError21 = true;\n    _iteratorError22 = _iteratorError223;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion20 && (_iteratorReturnMethod18 = _iterator14.return) != null) {\n        _iteratorReturn19 = _iteratorCall16.call(_iteratorReturnMethod18, _iterator14);\n        if (Object(_iteratorReturn19) !== _iteratorReturn19)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError21) throw _iteratorError22;\n    }\n  }\n}\n{\n  var _iteratorNormalCompletion30 = true,\n    _didIteratorError31 = false,\n    _iteratorError32,\n    _iteratorReturnMethod28,\n    _iteratorReturn29;\n  try {\n    for (\n      var _iterator24 = Object.keys(x)[Symbol.iterator](),\n        _iteratorNext25 = _iterator24.next,\n        _iteratorCall26 = function () {}.call,\n        _step27;\n      (_step27 = _iteratorCall26.call(_iteratorNext25, _iterator24)), !_step27.done;\n      _iteratorNormalCompletion30 = true\n    ) {\n      if (Object(_step27) !== _step27) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion30 = false;\n      const y = _step27.value;\n      {\n      }\n    }\n  } catch (_iteratorError233) {\n    _didIteratorError31 = true;\n    _iteratorError32 = _iteratorError233;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion30 && (_iteratorReturnMethod28 = _iterator24.return) != null) {\n        _iteratorReturn29 = _iteratorCall26.call(_iteratorReturnMethod28, _iterator24);\n        if (Object(_iteratorReturn29) !== _iteratorReturn29)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError31) throw _iteratorError32;\n    }\n  }\n}\n{\n  var _iteratorNormalCompletion40 = true,\n    _didIteratorError41 = false,\n    _iteratorError42,\n    _iteratorReturnMethod38,\n    _iteratorReturn39;\n  try {\n    for (\n      var _iterator34 = Object.values(x)[Symbol.iterator](),\n        _iteratorNext35 = _iterator34.next,\n        _iteratorCall36 = function () {}.call,\n        _step37;\n      (_step37 = _iteratorCall36.call(_iteratorNext35, _iterator34)), !_step37.done;\n      _iteratorNormalCompletion40 = true\n    ) {\n      if (Object(_step37) !== _step37) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion40 = false;\n      const y = _step37.value;\n      {\n      }\n    }\n  } catch (_iteratorError243) {\n    _didIteratorError41 = true;\n    _iteratorError42 = _iteratorError243;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion40 && (_iteratorReturnMethod38 = _iterator34.return) != null) {\n        _iteratorReturn39 = _iteratorCall36.call(_iteratorReturnMethod38, _iterator34);\n        if (Object(_iteratorReturn39) !== _iteratorReturn39)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError41) throw _iteratorError42;\n    }\n  }\n}\n{\n  var _iteratorNormalCompletion50 = true,\n    _didIteratorError51 = false,\n    _iteratorError52,\n    _iteratorReturnMethod48,\n    _iteratorReturn49;\n  try {\n    for (\n      var _iterator44 = Object.entries(x)[Symbol.iterator](),\n        _iteratorNext45 = _iterator44.next,\n        _iteratorCall46 = function () {}.call,\n        _step47;\n      (_step47 = _iteratorCall46.call(_iteratorNext45, _iterator44)), !_step47.done;\n      _iteratorNormalCompletion50 = true\n    ) {\n      if (Object(_step47) !== _step47) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion50 = false;\n      const y = _step47.value;\n      {\n      }\n    }\n  } catch (_iteratorError253) {\n    _didIteratorError51 = true;\n    _iteratorError52 = _iteratorError253;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion50 && (_iteratorReturnMethod48 = _iterator44.return) != null) {\n        _iteratorReturn49 = _iteratorCall46.call(_iteratorReturnMethod48, _iterator44);\n        if (Object(_iteratorReturn49) !== _iteratorReturn49)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError51) throw _iteratorError52;\n    }\n  }\n}",
  "// @flow\n// This won't be optimize because when `for-of` is handled, the b's type annotation has been removed by the Flow plugin\nfunction a(b) {\n  {\n    var _iteratorNormalCompletion = true,\n      _didIteratorError = false,\n      _iteratorError,\n      _iteratorReturnMethod,\n      _iteratorReturn;\n    try {\n      for (\n        var _iterator = b[Symbol.iterator](),\n          _iteratorNext = _iterator.next,\n          _iteratorCall = function () {}.call,\n          _step;\n        (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n        _iteratorNormalCompletion = true\n      ) {\n        if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n        _iteratorNormalCompletion = false;\n        const y = _step.value;\n        {\n        }\n      }\n    } catch (_iteratorError2) {\n      _didIteratorError = true;\n      _iteratorError = _iteratorError2;\n    } finally {\n      try {\n        if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n          _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n          if (Object(_iteratorReturn) !== _iteratorReturn)\n            throw new TypeError('Iterator result is not an object');\n        }\n      } finally {\n        if (_didIteratorError) throw _iteratorError;\n      }\n    }\n  }\n}",
  "// @flow\n{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = b[Symbol.iterator](),\n        _iteratorNext = _iterator.next,\n        _iteratorCall = function () {}.call,\n        _step;\n      (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      const y = _step.value;\n      {\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "// This won't be optimize because when `for-of` is handled, the b's type annotation has been removed by the TS plugin\nfunction a(b) {\n  {\n    var _iteratorNormalCompletion = true,\n      _didIteratorError = false,\n      _iteratorError,\n      _iteratorReturnMethod,\n      _iteratorReturn;\n    try {\n      for (\n        var _iterator = b[Symbol.iterator](),\n          _iteratorNext = _iterator.next,\n          _iteratorCall = function () {}.call,\n          _step;\n        (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n        _iteratorNormalCompletion = true\n      ) {\n        if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n        _iteratorNormalCompletion = false;\n        const y = _step.value;\n        {\n        }\n      }\n    } catch (_iteratorError2) {\n      _didIteratorError = true;\n      _iteratorError = _iteratorError2;\n    } finally {\n      try {\n        if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n          _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n          if (Object(_iteratorReturn) !== _iteratorReturn)\n            throw new TypeError('Iterator result is not an object');\n        }\n      } finally {\n        if (_didIteratorError) throw _iteratorError;\n      }\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = b[Symbol.iterator](),\n        _iteratorNext = _iterator.next,\n        _iteratorCall = function () {}.call,\n        _step;\n      (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      const y = _step.value;\n      {\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "if (true) {\n  {\n    var _iteratorNormalCompletion = true,\n      _didIteratorError = false,\n      _iteratorError,\n      _iteratorReturnMethod,\n      _iteratorReturn;\n    try {\n      loop: for (\n        var _iterator = [][Symbol.iterator](),\n          _iteratorNext = _iterator.next,\n          _iteratorCall = function () {}.call,\n          _step;\n        (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n        _iteratorNormalCompletion = true\n      ) {\n        if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n        _iteratorNormalCompletion = false;\n        let ch = _step.value;\n        {\n        }\n      }\n    } catch (_iteratorError2) {\n      _didIteratorError = true;\n      _iteratorError = _iteratorError2;\n    } finally {\n      try {\n        if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n          _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n          if (Object(_iteratorReturn) !== _iteratorReturn)\n            throw new TypeError('Iterator result is not an object');\n        }\n      } finally {\n        if (_didIteratorError) throw _iteratorError;\n      }\n    }\n  }\n}",
  "if (true) {\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    actions: for (\n      var _iterator = y[Symbol.iterator](),\n        _iteratorNext = _iterator.next,\n        _iteratorCall = function () {}.call,\n        _step;\n      (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      let x = _step.value;\n      {\n        continue actions;\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "if (true) {\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    loop: for (\n      var _iterator = [][Symbol.iterator](),\n        _iteratorNext = _iterator.next,\n        _iteratorCall = function () {}.call,\n        _step;\n      (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      let ch = _step.value;\n      {\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    myLabel: for (\n      var _iterator = b[Symbol.iterator](),\n        _iteratorNext = _iterator.next,\n        _iteratorCall = function () {}.call,\n        _step;\n      (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      let a = _step.value;\n      {\n        continue myLabel;\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
  "function f(...t) {\n  {\n    var _iteratorNormalCompletion = true,\n      _didIteratorError = false,\n      _iteratorError,\n      _iteratorReturnMethod,\n      _iteratorReturn;\n    try {\n      for (\n        var _iterator = t[Symbol.iterator](),\n          _iteratorNext = _iterator.next,\n          _iteratorCall = function () {}.call,\n          _step;\n        (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n        _iteratorNormalCompletion = true\n      ) {\n        if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n        _iteratorNormalCompletion = false;\n        let o = _step.value;\n        {\n          const t = o;\n        }\n      }\n    } catch (_iteratorError2) {\n      _didIteratorError = true;\n      _iteratorError = _iteratorError2;\n    } finally {\n      try {\n        if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n          _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n          if (Object(_iteratorReturn) !== _iteratorReturn)\n            throw new TypeError('Iterator result is not an object');\n        }\n      } finally {\n        if (_didIteratorError) throw _iteratorError;\n      }\n    }\n  }\n}",
  "function foo() {\n  let input = ['a', 'b', 'c'];\n  let output = {};\n  {\n    var _iteratorNormalCompletion = true,\n      _didIteratorError = false,\n      _iteratorError,\n      _iteratorReturnMethod,\n      _iteratorReturn;\n    try {\n      for (\n        var _iterator = input[Symbol.iterator](),\n          _iteratorNext = _iterator.next,\n          _iteratorCall = function () {}.call,\n          _step;\n        (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n        _iteratorNormalCompletion = true\n      ) {\n        if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n        _iteratorNormalCompletion = false;\n        let c = _step.value;\n        {\n          let name = c;\n          output[name] = name;\n        }\n      }\n    } catch (_iteratorError2) {\n      _didIteratorError = true;\n      _iteratorError = _iteratorError2;\n    } finally {\n      try {\n        if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n          _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n          if (Object(_iteratorReturn) !== _iteratorReturn)\n            throw new TypeError('Iterator result is not an object');\n        }\n      } finally {\n        if (_didIteratorError) throw _iteratorError;\n      }\n    }\n  }\n  return output;\n}",
  "var arr = [1, 2, 3];\nvar results = [];\n{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = arr[Symbol.iterator](),\n        _iteratorNext = _iterator.next,\n        _iteratorCall = function () {}.call,\n        _step;\n      (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      let v = _step.value;\n      {\n        results.push(v);\n        arr = null;\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}\nexpect(results).toEqual([1, 2, 3]);",
  "var arr = [1, 2, 3];\n{\n  var _iteratorNormalCompletion = true,\n    _didIteratorError = false,\n    _iteratorError,\n    _iteratorReturnMethod,\n    _iteratorReturn;\n  try {\n    for (\n      var _iterator = arr[Symbol.iterator](),\n        _iteratorNext = _iterator.next,\n        _iteratorCall = function () {}.call,\n        _step;\n      (_step = _iteratorCall.call(_iteratorNext, _iterator)), !_step.done;\n      _iteratorNormalCompletion = true\n    ) {\n      if (Object(_step) !== _step) throw new TypeError('Iterator result is not an object');\n      _iteratorNormalCompletion = false;\n      let v = _step.value;\n      {\n        console.log(v);\n        arr = null;\n      }\n    }\n  } catch (_iteratorError2) {\n    _didIteratorError = true;\n    _iteratorError = _iteratorError2;\n  } finally {\n    try {\n      if (!_iteratorNormalCompletion && (_iteratorReturnMethod = _iterator.return) != null) {\n        _iteratorReturn = _iteratorCall.call(_iteratorReturnMethod, _iterator);\n        if (Object(_iteratorReturn) !== _iteratorReturn)\n          throw new TypeError('Iterator result is not an object');\n      }\n    } finally {\n      if (_didIteratorError) throw _iteratorError;\n    }\n  }\n}",
];

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
