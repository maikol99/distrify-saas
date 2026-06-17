import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { initSessionFromStorage } from "./config/axios.config";

const app = createApp(App);

app.use(createPinia());
app.use(router);

// Restaurar el timer de auto-logout si hay sesión activa
// (maneja el caso de recarga de página con sesión vigente)
initSessionFromStorage();

app.mount("#app");
