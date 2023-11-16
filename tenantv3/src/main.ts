import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import i18n from './i18n';
import "@gouvfr/dsfr/dist/dsfr/dsfr.min.css";
import "@gouvfr/dsfr/dist/utility/icons/icons-system/icons-system.min.css";
import "@gouvfr/dsfr/dist/utility/icons/icons-business/icons-business.min.css";
import "@gouvfr/dsfr/dist/utility/icons/icons-design/icons-design.min.css";

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
