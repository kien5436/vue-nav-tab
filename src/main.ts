import "tailwindcss/tailwind.css";
import "../lib/style.css";
import { ContextMenuLocale } from "../lib/use-contextmenu";
import VueNavTab from "../lib";
import { createApp } from "vue";

import App from "./App.vue";

createApp(App)
  .use(VueNavTab, {
    fr: {
      close: "Bonjour",
      closeAbove: "Đóng các thẻ bên trên",
      closeAll: "Đóng tất cả",
      closeBelow: "Đóng các thẻ bên dưới",
      closeLeft: "Đóng các thẻ bên trái",
      closeOthers: "Đóng các thẻ khác",
      closeRight: "Đóng các thẻ bên phải",
      reload: "Tải lại",
    },
    vi: {
      close: "Đóng thẻ",
      closeAbove: "Đóng các thẻ bên trên",
      closeAll: "Đóng tất cả",
      closeBelow: "Đóng các thẻ bên dưới",
      closeLeft: "Đóng các thẻ bên trái",
      closeOthers: "Đóng các thẻ khác",
      closeRight: "Đóng các thẻ bên phải",
      reload: "Tải lại",
    },
  })
  .mount("#app");