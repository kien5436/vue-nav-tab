import { computed, inject, reactive, ref } from "vue";

import { refreshTab, removeAll, removeLeft, removeOthers, removeRight, removeTab, useTabs } from "./use-operations";
import ContextMenu from "../components/ContextMenu.vue";
import VueNavTabError from "../utils/error";

export interface ContextMenuLocale {
  [key: string]: {
    close: string;
    closeAbove: string;
    closeAll: string;
    closeBelow: string;
    closeLeft: string;
    closeOthers: string;
    closeRight: string;
    reload: string;
  }
}

type ContextMenuLocaleValue = ContextMenuLocale[keyof ContextMenuLocale];

export const defaultLocales: {
  en: ContextMenuLocaleValue,
  vi: ContextMenuLocaleValue
} = {
  en: {
    close: "Close",
    closeAbove: "Close to the above",
    closeAll: "Close all",
    closeBelow: "Close to the below",
    closeLeft: "Close to the left",
    closeOthers: "Close others",
    closeRight: "Close to the right",
    reload: "Reload",
  },
  vi: {
    close: "Đóng",
    closeAbove: "Đóng các thẻ bên trên",
    closeAll: "Đóng tất cả",
    closeBelow: "Đóng các thẻ bên dưới",
    closeLeft: "Đóng các thẻ bên trái",
    closeOthers: "Đóng các thẻ khác",
    closeRight: "Đóng các thẻ bên phải",
    reload: "Tải lại",
  },
};

export const key = "vnt-i18n";

export function mergeWithDefaultLocales(options: ContextMenuLocale) {

  const i18n: ContextMenuLocale = { ...defaultLocales };
  const requiredProps = Object.keys(defaultLocales.en);

  for (const lang in options) {

    if (options.hasOwnProperty(lang)) {

      const messages = options[lang];

      for (const prop of requiredProps) {

        if (!messages.hasOwnProperty(prop) || "string" !== typeof (messages[prop as keyof ContextMenuLocaleValue])) {

          throw new VueNavTabError(`'${prop}' is missing from 'options.${lang}' or has mismatch type. Possible values are {
            close: string;
            closeAbove: string;
            closeAll: string;
            closeBelow: string;
            closeLeft: string;
            closeOthers: string;
            closeRight: string;
            reload: string;
          }`);
        }
      }

      i18n[lang] = messages;
    }
  }

  return i18n;
}

export interface Action {
  disabled: boolean;
  id: string;
  text: string;
}

export function useContextMenu(group: string, navType: "vertical" | "horizontal") {

  const contextMenu = ref<InstanceType<typeof ContextMenu> | null>(null);
  let tabContext: string | null = null;
  const i18n = inject<ContextMenuLocale>(key, defaultLocales);
  const lang = ref("en");
  const disabledActions: Record<string, boolean> = reactive({
    close: false,
    closeAbove: false,
    closeBelow: false,
    closeLeft: false,
    closeRight: false,
  });
  const actions = computed<Action[]>(() => [
    {
      disabled: false,
      id: "reload",
      text: i18n[lang.value].reload,
    },
    {
      disabled: disabledActions.close,
      id: "close",
      text: i18n[lang.value].close,
    },
    {
      disabled: false,
      id: "closeAll",
      text: i18n[lang.value].closeAll,
    },
    {
      disabled: false,
      id: "closeOthers",
      text: i18n[lang.value].closeOthers,
    },
    {
      disabled: disabledActions.closeAbove || disabledActions.closeLeft,
      id: "vertical" === navType ? "closeAbove" : "closeLeft",
      text: "vertical" === navType ? i18n[lang.value].closeAbove : i18n[lang.value].closeLeft,
    },
    {
      disabled: disabledActions.closeBelow || disabledActions.closeRight,
      id: "vertical" === navType ? "closeBelow" : "closeRight",
      text: "vertical" === navType ? i18n[lang.value].closeBelow : i18n[lang.value].closeRight,
    },
  ]);

  function showContextMenu(e: MouseEvent, tabId: string) {

    const documentLang = document.documentElement.lang;

    lang.value = i18n.hasOwnProperty(documentLang) ? documentLang : "en";

    contextMenu.value?.open(e);
    tabContext = tabId;

    disableActions(tabId);
  }

  function onMenuClick(actionId: string) {

    if (disabledActions[actionId]) {
      return;
    }

    contextMenu.value?.close();

    if (!tabContext) {
      return;
    }

    switch (actionId) {
      case "reload":
        refreshTab(group, tabContext);
        break;
      case "close":
        removeTab(group, tabContext);
        break;
      case "closeAll":
        removeAll(group);
        break;
      case "closeOthers":
        removeOthers(group, tabContext);
        break;
      case "closeLeft":
      case "closeAbove":
        removeLeft(group, tabContext);
        break;
      case "closeRight":
      case "closeBelow":
        removeRight(group, tabContext);
        break;
    }
  }

  function disableActions(tabId: string) {

    const tabs = useTabs(group);
    const selectedTabIdx = tabs.findIndex((tab) => tab.id === tabId);
    const selectedTab = tabs[selectedTabIdx];

    disabledActions.closeLeft = disabledActions.closeAbove = 0 === selectedTabIdx;
    disabledActions.closeRight = disabledActions.closeBelow = tabs.length - 1 === selectedTabIdx;
    disabledActions.close = !selectedTab.closable;
  }

  return {
    actions,
    contextMenu,
    onMenuClick,
    showContextMenu,
  };
}