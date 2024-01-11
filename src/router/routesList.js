const routesList = [
  {
    path: '/',
    name: 'index',
    meta: {
      title: '首页',
    },
    component: () => import('@/views/index/index.vue'),
  },
]

export default routesList
