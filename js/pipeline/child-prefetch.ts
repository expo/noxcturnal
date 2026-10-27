import type { ChildPrefetchPlan } from './types';

/** Share the child-demand projection across files, preserving delivery route IDs. */
export function compileChildPrefetch(routes: ChildPrefetchPlan): ChildPrefetchPlan | undefined {
  let needed = false;
  const plan = routes.map(members =>
    members.filter(({ capabilities }) => {
      if (!capabilities.childRules && !capabilities.ancestorChildRules) return false;
      needed = true;
      return true;
    }),
  );
  return needed ? plan : undefined;
}
