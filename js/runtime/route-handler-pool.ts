import type { DispatchRoute } from '../pipeline/types';
import type { NativeEvent } from '../types';

type Handler = (event: NativeEvent) => void;
type Compiler = (route: DispatchRoute) => Handler;
interface Bindings {
  initial: Handler[];
  handlers: Handler[];
  changed: Uint32Array;
  changedCount: number;
  compile: Compiler | undefined;
}
interface Pool {
  idle: Bindings | undefined;
}

// Definitions live across files, but bound handlers capture per-file owners.
// Keep one idle set per route plan and clear those bindings on every exit.
const pools = new WeakMap<readonly DispatchRoute[], Pool>();

export function withRouteHandlers(
  routes: readonly DispatchRoute[],
  compile: Compiler,
  run: (handlers: readonly Handler[]) => void,
): void {
  let pool = pools.get(routes);
  if (!pool) pools.set(routes, (pool = { idle: undefined }));
  let bindings = pool.idle;
  pool.idle = undefined;
  if (!bindings) {
    const created: Bindings = {
      initial: [],
      handlers: [],
      changed: new Uint32Array(routes.length),
      changedCount: 0,
      compile: undefined,
    };
    for (const [index, route] of routes.entries()) {
      const initial: Handler = event => {
        const handler = created.compile!(route);
        created.handlers[index] = handler;
        created.changed[created.changedCount++] = index;
        handler(event);
      };
      created.initial.push(initial);
      created.handlers.push(initial);
    }
    bindings = created;
  }
  bindings.compile = compile;
  try {
    run(bindings.handlers);
  } finally {
    bindings.compile = undefined;
    for (let changed = 0; changed < bindings.changedCount; changed++) {
      const index = bindings.changed[changed];
      bindings.handlers[index] = bindings.initial[index];
    }
    bindings.changedCount = 0;
    // A reentrant transform acquires its own set. Retain only one when idle.
    pool.idle ??= bindings;
  }
}
