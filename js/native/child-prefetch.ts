import { NODE_TYPES, NODE_TYPE_IDS } from '../generated/event-schema';
import type { ChildPrefetchPlan } from '../pipeline/types';

const MAGIC = 0x5043464e;
const TYPE_WORDS = Math.ceil(NODE_TYPES.length / 32);
const MEMBER_WORDS = 2 + TYPE_WORDS * 2;
const plans = new WeakMap<ChildPrefetchPlan, Uint32Array>();

/** Source-independent child demand, shared by the exact prepared route plan. */
export function nativeChildPrefetch(plan: ChildPrefetchPlan): Uint32Array {
  const cached = plans.get(plan);
  if (cached) return cached;
  const memberCount = plan.reduce((count, members) => count + members.length, 0);
  const words = new Uint32Array(4 + plan.length * 2 + memberCount * MEMBER_WORDS);
  words.set([MAGIC, plan.length, memberCount, TYPE_WORDS]);
  const membersStart = 4 + plan.length * 2;
  let memberIndex = 0;
  const writeTypes = (offset: number, rules: Record<string, unknown> | null) => {
    if (!rules) return;
    for (const type of Object.keys(rules)) {
      const id = NODE_TYPE_IDS.get(type);
      if (id == null) throw new Error(`invalid child-prefetch node type ${type}`);
      words[offset + (id >>> 5)] |= 1 << (id & 31);
    }
  };
  for (let route = 0; route < plan.length; route++) {
    const members = plan[route];
    words[4 + route * 2] = memberIndex;
    words[5 + route * 2] = members.length;
    for (const { pluginId, capabilities } of members) {
      const offset = membersStart + memberIndex++ * MEMBER_WORDS;
      const mode = capabilities.ancestorChildRules ? capabilities.ancestry?.mode : undefined;
      const depth =
        mode == null
          ? 0
          : typeof mode === 'number'
            ? Math.min(mode, 0xffffffff)
            : mode === 'parent'
              ? 1
              : 0xffffffff;
      words[offset] = pluginId;
      words[offset + 1] = depth;
      writeTypes(offset + 2, capabilities.childRules);
      writeTypes(offset + 2 + TYPE_WORDS, capabilities.ancestorChildRules);
    }
  }
  plans.set(plan, words);
  return words;
}
