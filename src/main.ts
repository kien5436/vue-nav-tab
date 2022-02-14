import { createApp } from "vue";
import "../lib/index.css";
import VueNavTab from "../lib";

import App from "./App.vue";

createApp(App).use(VueNavTab).mount("#app");
