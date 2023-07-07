import { createRouter, createWebHashHistory } from "vue-router";
import SettingView from "../views/SettingView.vue";

const routes = [
  {
    path: "/",
    name: "setting",
    component: SettingView,
  },
  {
    path: "/translate",
    name: "translate",
    component: () => import("../views/TranslateView.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
