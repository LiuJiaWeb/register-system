import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router';
import { defineAsyncComponent } from 'vue';
import routesList from './routesList.js';

const router = createRouter({
  history: createWebHistory(), // history 模式
  routes: routesList,
});

// 全局路由守卫
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title}`;
  }
  next();
});

router.afterEach((to, from) => {
});

export default router;
