import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
// 全局icon
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import "element-plus/theme-chalk/index.css";

const app = createApp(App);
// 全局icon
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(store);
app.use(router);
app.use(ElementPlus);
app.mount("#app");
