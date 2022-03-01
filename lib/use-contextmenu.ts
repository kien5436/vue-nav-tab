import { computed, inject, ref } from "vue";

import { refreshTab, removeAll, removeLeft, removeOthers, removeRight, removeTab } from "./operations";
import ContextMenu from "./ContextMenu.vue";
import VueNavTabError from "./error";

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

export function useContextMenu(group: string, navType: "vertical" | "horizontal") {

  const contextMenu = ref<InstanceType<typeof ContextMenu> | null>(null);
  const tabContext = ref<string | null>(null);
  const i18n = inject<ContextMenuLocale>(key, defaultLocales);
  const lang = ref("en");
  const actions = computed(() => [
    {
      id: "reload",
      text: i18n[lang.value].reload,
    },
    {
      id: "close",
      text: i18n[lang.value].close,
    },
    {
      id: "closeAll",
      text: i18n[lang.value].closeAll,
    },
    {
      id: "closeOthers",
      text: i18n[lang.value].closeOthers,
    },
    {
      id: "vertical" === navType ? "closeAbove" : "closeLeft",
      text: "vertical" === navType ? i18n[lang.value].closeAbove : i18n[lang.value].closeLeft,
    },
    {
      id: "vertical" === navType ? "closeBelow" : "closeRight",
      text: "vertical" === navType ? i18n[lang.value].closeBelow : i18n[lang.value].closeRight,
    },
  ]);

  function showContextMenu(e: MouseEvent, tabId: string) {

    const documentLang = document.documentElement.lang;
    lang.value = i18n.hasOwnProperty(documentLang) ? documentLang : "en";

    contextMenu.value?.open(e);
    tabContext.value = tabId;
  }

  function onMenuClick(actionId: string) {

    contextMenu.value?.close();

    if (!tabContext.value) {
      return;
    }

    switch (actionId) {
      case "reload":
        refreshTab(group, tabContext.value);
        break;
      case "close":
        removeTab(group, tabContext.value);
        break;
      case "closeAll":
        removeAll(group);
        break;
      case "closeOthers":
        removeOthers(group, tabContext.value);
        break;
      case "closeLeft":
      case "closeAbove":
        removeLeft(group, tabContext.value);
        break;
      case "closeRight":
      case "closeBelow":
        removeRight(group, tabContext.value);
        break;
    }
  }

  return {
    actions,
    contextMenu,
    onMenuClick,
    showContextMenu,
  };
}