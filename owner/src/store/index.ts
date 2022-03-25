import { Property } from 'df-shared/src/models/Property';
import { createStore } from 'vuex';
import { User } from 'df-shared/src/models/User';
import { useCookies } from 'vue3-cookies';
import { OwnerUser } from '../../../df-shared/src/models/OwnerUser';
import i18n from '../i18n';
import AuthService from '../components/auth/AuthService';
import keycloak from '../plugin/keycloak';
import OwnerService from '../components/account/OwnerService';

export class OwnerState {
  user = new User();

  status = { loggedIn: false };

  isFunnel = false;

  hasFooter = true;

  properties: Property[] = [];

  propertyToEdit: Property = new Property();

  propertyToConsult: Property = new Property();
}

const localStore = localStorage.getItem('store');
const initialStore = localStore !== null ? JSON.parse(localStore) : new OwnerState();
const MAIN_URL = `//${import.meta.env.VITE_MAIN_URL?.toString()}`;

const store = createStore({
  state: initialStore,
  mutations: {
    initState(state) {
      Object.assign(state, new OwnerState());
    },
    setHasFooter(state: OwnerState, hasFooter: boolean) {
      state.hasFooter = hasFooter;
    },
    loadUser(state: OwnerState, owner: OwnerUser) {
      Object.assign(state.user, owner);
      state.properties = owner.properties;
      Object.assign(state.status.loggedIn, true);
    },
    logout(state: OwnerState) {
      Object.assign(state.status.loggedIn, false);
      Object.assign(state.user, {});
    },
    setLastName(state: OwnerState, lastName: string) {
      state.user.lastName = lastName;
    },
    setFirstName(state: OwnerState, firstName: string) {
      state.user.firstName = firstName;
    },
    setEmail(state: OwnerState, email: string) { Object.assign(state.user.email, email); },
    setName(state: OwnerState, name: string) {
      state.propertyToEdit.name = name;
    },
    setRent(state: OwnerState, rent: number) {
      state.propertyToEdit.rentCost = rent;
    },
    updatePropertyToEdit(state: OwnerState, id: number) {
      const prop = state.properties.find((p) => p.id === id);
      if (prop) {
        Object.assign(state.propertyToEdit, { ...prop });
      }
    },
    updatePropertyToConsult(state: OwnerState, id: number) {
      const prop = state.properties.find((p) => p.id === id);
      if (prop) {
        Object.assign(state.propertyToConsult, { ...prop });
      }
    },
    setPropertyToEdit(state: OwnerState, property: Property) {
      state.propertyToEdit = { ...property };
    },
  },
  actions: {
    setLang(_, lang: string) {
      i18n.global.locale.value = lang;
      const html = document.documentElement;
      html.setAttribute('lang', i18n.global.locale.value);
      const { cookies } = useCookies();
      const expireTimes = new Date();
      expireTimes.setFullYear(expireTimes.getFullYear() + 1);
      cookies.set('lang', lang, expireTimes, '/', MAIN_URL.endsWith('dossierfacile.fr') ? 'dossierfacile.fr' : 'localhost');
    },
    register({ commit }, user) {
      return AuthService.register(user).then(
        (response) => {
          commit('registerSuccess');
          return Promise.resolve(response.data);
        },
        (error) => {
          commit('registerFailure');
          return Promise.reject(error);
        },
      );
    },
    setHasFooter({ commit }, hasFooter: boolean) {
      commit('setHasFooter', hasFooter);
    },
    loadUser({ commit }) {
      return AuthService.loadUser().then(
        (response: any) => {
          commit('loadUser', response.data);
          return Promise.resolve(response.data);
        },
        (error: any) => Promise.reject(error),
      );
    },
    logout({ commit }, redirect = true) {
      return AuthService.logout()
        .then(async () => {
          await commit('logout');
          await commit('initState');
          if (redirect) {
            window.location.replace(MAIN_URL);
            return;
          }
          window.location.reload();
        })
        .catch(() => {
          window.location.reload();
        });
    },
    setFirstName({ commit }, firstName: string) { commit('setFirstName', firstName); },
    setLastName({ commit }, lastName: string) { commit('setLastName', lastName); },
    setEmail({ commit }, email: string) { commit('setEmail', email); },
    saveNames({ commit }, { lastName, firstName, email }) {
      return OwnerService.saveNames(lastName, firstName, email).then((response) => {
        commit('loadUser', response.data);
        return Promise.resolve(response.data);
      });
    },
    setName({ commit }, name: string) {
      commit('setName', name);
    },
    setRent({ commit }, cost: number) {
      commit('setRent', cost);
    },
    saveProperty({ commit }) {
      return OwnerService.saveProperty(this.state.propertyToEdit).then((response) => {
        commit('setPropertyToEdit', response.data);
        return Promise.resolve(response.data);
      });
    },
    newProperty({ commit }) {
      return commit('setPropertyToEdit', {});
    },
    updatePropertyToEdit({ commit }, id: number) {
      commit('updatePropertyToEdit', id);
    },
    updatePropertyToConsult({ commit }, id: number) {
      commit('updatePropertyToConsult', id);
    },
    deleteProperty({ commit }, id: number) {
      return OwnerService.deleteProperty(id).then(async (response) => {
        await commit('loadUser', response.data);
        return Promise.resolve(response.data);
      });
    },
  },
  getters: {
    getUser(state: OwnerState) {
      return state.user;
    },
    isLoggedIn() {
      return keycloak.authenticated;
    },
    hasFooter(state: OwnerState) {
      return state.hasFooter;
    },
    getProperties(state: OwnerState) {
      return state.properties;
    },
    getPropertyToEdit(state: OwnerState) {
      return state.propertyToEdit;
    },
    getPropertyToConsult(state: OwnerState) {
      return state.propertyToConsult;
    },
  },
});

export default store;
