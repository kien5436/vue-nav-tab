import { defineComponent, h } from 'vue';
import { describe, expect, it, vi } from 'vitest';

import useDragDrop from '../lib/hooks/use-drag-n-drop';
import { createTabs, Tab, useCurrentTab, useTabs } from '../lib/hooks/use-operations';

const stubView = defineComponent({ name: 'StubView', render: () => h('p', 'stub') });

function seedGroup(group: string) {
  createTabs(group, [
    { active: true, closable: true, id: 'a', title: 'A', view: stubView },
    { closable: true, id: 'b', title: 'B', view: stubView },
    { closable: true, id: 'c', title: 'C', view: stubView },
  ]);
}

function mockTransfer(group: string, id: string) {
  const store = new Map<string, string>([
    ['text/vnt-group', group],
    ['text/plain', id],
  ]);

  return {
    getData: (format: string) => store.get(format) ?? '',
    setData: vi.fn((format: string, data: string) => {
      store.set(format, data);
    }),
  };
}

function dragEvent(target: EventTarget, transfer: ReturnType<typeof mockTransfer>) {
  return {
    dataTransfer: transfer as unknown as DataTransfer,
    preventDefault: vi.fn(),
    target,
  } as unknown as DragEvent;
}

function itemEl(id: string) {
  const el = document.createElement('div');

  el.className = 'vp-item';
  el.id = `${id}-tab`;

  return el;
}

function orderOf(group: string) {
  return useTabs(group).map((tab: Tab) => tab.id);
}

describe('useDragDrop', () => {

  it('stores the group and the sliced tab id on drag start', () => {
    seedGroup('dd-start');
    const transfer = mockTransfer('', '');
    const { dragStart } = useDragDrop('dd-start');

    dragStart(dragEvent(itemEl('b'), transfer));

    expect(transfer.setData).toHaveBeenCalledWith('text/vnt-group', 'dd-start');
    expect(transfer.setData).toHaveBeenCalledWith('text/plain', 'b');
  });

  it('swaps the dragged tab with the drop target on drag over', () => {
    seedGroup('dd-over');
    const { dragOver } = useDragDrop('dd-over');
    const event = dragEvent(itemEl('c'), mockTransfer('dd-over', 'a'));

    dragOver(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(orderOf('dd-over')).toEqual(['c', 'b', 'a']);
  });

  it('ignores drag over from another group', () => {
    seedGroup('dd-foreign');
    const { dragOver } = useDragDrop('dd-foreign');
    const event = dragEvent(itemEl('c'), mockTransfer('other-group', 'a'));

    dragOver(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(orderOf('dd-foreign')).toEqual(['a', 'b', 'c']);
  });

  it('ignores drag over outside a tab item', () => {
    seedGroup('dd-outside');
    const { dragOver } = useDragDrop('dd-outside');
    const event = dragEvent(document.createElement('span'), mockTransfer('dd-outside', 'a'));

    dragOver(event);

    expect(orderOf('dd-outside')).toEqual(['a', 'b', 'c']);
  });

  it('keeps the order when hovering the dragged tab itself', () => {
    seedGroup('dd-same');
    const { dragOver } = useDragDrop('dd-same');
    const event = dragEvent(itemEl('b'), mockTransfer('dd-same', 'b'));

    dragOver(event);

    expect(orderOf('dd-same')).toEqual(['a', 'b', 'c']);
  });

  it('swaps the dragged tab with the drop target on drop', () => {
    seedGroup('dd-drop');
    const { drop } = useDragDrop('dd-drop');
    const event = dragEvent(itemEl('c'), mockTransfer('dd-drop', 'a'));

    drop(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(orderOf('dd-drop')).toEqual(['c', 'b', 'a']);
  });

  it('ignores drops outside a tab item', () => {
    seedGroup('dd-drop-outside');
    const { drop } = useDragDrop('dd-drop-outside');
    const event = dragEvent(document.createElement('span'), mockTransfer('dd-drop-outside', 'a'));

    drop(event);

    expect(orderOf('dd-drop-outside')).toEqual(['a', 'b', 'c']);
  });

  it('ignores drops from another group', () => {
    seedGroup('dd-drop-foreign');
    const { drop } = useDragDrop('dd-drop-foreign');
    const event = dragEvent(itemEl('c'), mockTransfer('other-group', 'a'));

    drop(event);

    expect(orderOf('dd-drop-foreign')).toEqual(['a', 'b', 'c']);
  });

  it.each(['x-tab', 'a.b-c', 'sp ace'])('DND-01: stores punctuated id %s exactly on drag start', (id) => {
    const group = `dd-punct-${id.replace(/[^a-z]/gi, '')}`;

    seedGroup(group);
    const transfer = mockTransfer('', '');
    const { dragStart } = useDragDrop(group);

    dragStart(dragEvent(itemEl(id), transfer));

    expect(transfer.setData).toHaveBeenCalledWith('text/plain', id);
  });

  it('DND-02: resolves a child element to its containing tab', () => {
    seedGroup('dd-child');
    const { dragOver } = useDragDrop('dd-child');
    const item = itemEl('c');
    const child = document.createElement('span');

    item.appendChild(child);
    dragOver(dragEvent(child, mockTransfer('dd-child', 'a')));

    expect(orderOf('dd-child')).toEqual(['c', 'b', 'a']);
  });

  it('DND-02: preserves the active tab across a swap', () => {
    seedGroup('dd-active');
    const { drop } = useDragDrop('dd-active');

    drop(dragEvent(itemEl('c'), mockTransfer('dd-active', 'a')));

    expect(orderOf('dd-active')).toEqual(['c', 'b', 'a']);
    expect(useCurrentTab('dd-active').value.id).toBe('a');
  });

  it('DND-04: tolerates a missing dataTransfer', () => {
    seedGroup('dd-nodt');
    const { dragOver, drop } = useDragDrop('dd-nodt');
    const bare = (target: EventTarget) => ({ preventDefault: vi.fn(), target }) as unknown as DragEvent;

    expect(() => {
      dragOver(bare(itemEl('c')));
      drop(bare(itemEl('c')));
    }).not.toThrow();
    expect(orderOf('dd-nodt')).toEqual(['a', 'b', 'c']);
  });

  // Known defect: findIndex returns -1 and the swap writes undefined into the tab array.
  it.fails('DND-04: rejects an unknown dragged id on dragOver', () => {
    const group = 'dd-baddrag-dragOver';

    seedGroup(group);
    const api = useDragDrop(group);

    api.dragOver(dragEvent(itemEl('c'), mockTransfer(group, 'ghost')));

    expect(orderOf(group)).toEqual(['a', 'b', 'c']);
  });

  // Known defect: findIndex returns -1 and the swap writes undefined into the tab array.
  it.fails('DND-04: rejects an unknown dragged id on drop', () => {
    const group = 'dd-baddrag-drop';

    seedGroup(group);
    const api = useDragDrop(group);

    api.drop(dragEvent(itemEl('c'), mockTransfer(group, 'ghost')));

    expect(orderOf(group)).toEqual(['a', 'b', 'c']);
  });

  // Known defect: findIndex returns -1 and the swap writes undefined into the tab array.
  it.fails('DND-04: rejects an unknown target id on dragOver', () => {
    const group = 'dd-badtarget-dragOver';

    seedGroup(group);
    const api = useDragDrop(group);

    api.dragOver(dragEvent(itemEl('ghost'), mockTransfer(group, 'a')));

    expect(orderOf(group)).toEqual(['a', 'b', 'c']);
  });

  // Known defect: findIndex returns -1 and the swap writes undefined into the tab array.
  it.fails('DND-04: rejects an unknown target id on drop', () => {
    const group = 'dd-badtarget-drop';

    seedGroup(group);
    const api = useDragDrop(group);

    api.drop(dragEvent(itemEl('ghost'), mockTransfer(group, 'a')));

    expect(orderOf(group)).toEqual(['a', 'b', 'c']);
  });

  // Known defect: findIndex returns -1 and the swap writes undefined into the tab array.
  it.fails('DND-04: rejects a malformed target DOM id on dragOver', () => {
    const group = 'dd-baddom-dragOver';

    seedGroup(group);
    const api = useDragDrop(group);
    const malformed = document.createElement('div');

    malformed.className = 'vp-item';
    malformed.id = 'oops';
    api.dragOver(dragEvent(malformed, mockTransfer(group, 'a')));

    expect(orderOf(group)).toEqual(['a', 'b', 'c']);
  });

  // Known defect: findIndex returns -1 and the swap writes undefined into the tab array.
  it.fails('DND-04: rejects a malformed target DOM id on drop', () => {
    const group = 'dd-baddom-drop';

    seedGroup(group);
    const api = useDragDrop(group);
    const malformed = document.createElement('div');

    malformed.className = 'vp-item';
    malformed.id = 'oops';
    api.drop(dragEvent(malformed, mockTransfer(group, 'a')));

    expect(orderOf(group)).toEqual(['a', 'b', 'c']);
  });
});
