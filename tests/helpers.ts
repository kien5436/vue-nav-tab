import { defineComponent, h } from 'vue';

import { Tab } from '../lib/hooks/use-operations';

export const stubView = defineComponent({
  name: 'StubView',
  render: () => h('p', { class: 'stub-view' }, 'stub'),
});

export const MsgView = defineComponent({
  name: 'MsgView',
  props: {
    msg: {
      default: '',
      type: String,
    },
  },
  setup(props) {
    return () => h('p', { class: 'msg-view' }, props.msg);
  },
});

export const MsgTitle = defineComponent({
  name: 'MsgTitle',
  props: {
    label: {
      default: '',
      type: String,
    },
  },
  setup(props) {
    return () => h('span', { class: 'title-comp' }, props.label);
  },
});

export function makeTab(id: string, overrides: Partial<Tab> = {}): Tab {
  return { id, title: `Title ${id}`, view: stubView, ...overrides };
}

interface Unmountable {unmount(): void;}

const mounted: Unmountable[] = [];

export function trackMounted<W extends Unmountable>(wrapper: W): W {
  mounted.push(wrapper);

  return wrapper;
}

export function unmountAll() {
  for (const wrapper of mounted.splice(0))
    wrapper.unmount();

}
