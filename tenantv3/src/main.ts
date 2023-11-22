import { createApp } from 'vue'
import { createPinia } from 'pinia'
  import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify';

import App from './App.vue'
import router from './router'
import i18n from './i18n';
import "@gouvfr/dsfr/dist/dsfr/dsfr.min.css";
import "@gouvfr/dsfr/dist/utility/icons/icons-system/icons-system.min.css";
import "@gouvfr/dsfr/dist/utility/icons/icons-business/icons-business.min.css";
import "@gouvfr/dsfr/dist/utility/icons/icons-design/icons-design.min.css";
import keycloak from './plugin/keycloak';
import axios from 'axios';

const TENANT_API_URL = import.meta.env.VITE_API_URL;

  keycloak
    .init({ onLoad: 'check-sso', checkLoginIframe: false })
    .then((auth) => {
      const aYearFromNow = new Date();
      aYearFromNow.setFullYear(aYearFromNow.getFullYear() + 1);
      // TODO
//       globalCookiesConfig({
//         expireTimes: aYearFromNow.toUTCString(),
//         path: '/',
//         domain: MAIN_URL.endsWith('dossierfacile.fr') ? 'dossierfacile.fr' : 'localhost',
//         secure: true,
//         sameSite: 'None',
//       });

      // Token Refresh
      setInterval(() => {
        keycloak
          .updateToken(70)
          .then()
          .catch(() => {
            console.log('Failed to refresh token');
          });
      }, 6000);
      if (auth) {
        axios.interceptors.request.use(
          (config) => {
            if (config.url?.includes(TENANT_API_URL) && keycloak.authenticated && config?.headers) {
              const localToken = keycloak.token;
              config.headers.Authorization = `Bearer ${localToken}`;
            }
            return config;
          },

          (error) => Promise.reject(error),
        );

        axios.interceptors.response.use(
          (response) => response,
          (error) => {
            if (
              error.response
              && (error.response.status === 401 || error.response.status === 403)
            ) {
              console.log('err');
            }
            return Promise.reject(error);
          },
        );
      }

	const app = createApp(App)
	app.use(createPinia())
	app.use(router)
	app.use(i18n)

  app.use(Vue3Toastify, {
    autoClose: 6000,
  } as ToastContainerOptions);
	app.mount('#app')
    })
    .catch(() => {
      console.log('Authenticated Failed');
      window.location.reload();
    });