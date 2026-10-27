// Keep direct node-ID addressing without allocating a slot for every parsed node.
const PAGE_SHIFT = 8;
const PAGE_SIZE = 1 << PAGE_SHIFT;
const PAGE_MASK = PAGE_SIZE - 1;

type Page<T> = (T | undefined)[];

export class NodeCache<T> {
  private pages: (Page<T> | undefined)[] = [];
  get(nodeId: number): T | undefined {
    if (nodeId !== nodeId >>> 0) throw new RangeError('invalid node id');
    return this.pages[nodeId >>> PAGE_SHIFT]?.[nodeId & PAGE_MASK];
  }

  set(nodeId: number, value: T): void {
    if (nodeId !== nodeId >>> 0) throw new RangeError('invalid node id');
    const pageId = nodeId >>> PAGE_SHIFT;
    let page = this.pages[pageId];
    if (!page) {
      // Packed directory growth avoids dictionary elements when IDs arrive out
      // of order. Only the touched page materializes its node slots.
      while (this.pages.length <= pageId) this.pages.push(undefined);
      this.pages[pageId] = page = new Array<T | undefined>(PAGE_SIZE).fill(undefined);
    }
    page[nodeId & PAGE_MASK] = value;
  }
}
