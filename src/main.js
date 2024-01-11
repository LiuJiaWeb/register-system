import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import router from '@/router/index.js';
import 'animate.css'; // animate__animated animate__fadeIn
import 'modern-css-reset';
import '@/static/style/global.scss'

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);
app.mount('#app');
