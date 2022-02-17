import { createApp } from "vue";
import "tailwindcss/tailwind.css";
import "../lib/style.css";
import VueNavTab from "../lib";

import App from "./App.vue";

createApp(App).use(VueNavTab).mount("#app");
