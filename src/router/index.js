import { createRouter, createWebHashHistory } from "vue-router";
import TranslateView from "../views/TranslateView.vue";

const routes = [
  {
    path: "/",
    name: "translate",
    component: TranslateView,
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
