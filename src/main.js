import { createApp } from 'vue';
import App from './App.vue';
const app = createApp(App);
app.config.errorHandler = error => {
  console.error(error);
  window.studioBoot?.crash();
};
try {
  app.mount('#app');
  window.studioBoot?.ready();
} catch (error) {
  console.error(error);
  window.studioBoot?.fail();
}
