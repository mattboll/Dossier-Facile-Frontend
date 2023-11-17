import { User } from "../models/User";
import axios from "axios";

const API_URL = `https://${import.meta.env.VITE_API_URL}/api/`;

export const AuthService = {
  logout() {
    return axios.post(API_URL + "user/logout");
  },

  register(user: User, source: string, internalPartnerId: string) {
    return axios.post(API_URL + "register/account", {
      email: user.email,
      password: user.password,
      confirm: user.confirm,
      firstName: user.firstName,
      lastName: user.lastName,
      source: source,
      internalPartnerId: internalPartnerId,
    });
  },

  deleteAccount() {
    return axios.delete(API_URL + "user/deleteAccount");
  },

  resetPassword(user: User) {
    return axios.post(API_URL + "user/forgotPassword", {
      email: user.email,
    });
  },

  changePassword(user: User) {
    return axios.post(`${API_URL}user/createPassword/${user.token}`, {
      password: user.password,
    });
  },
  createPasswordCouple(user: User) {
    return axios.post(`${API_URL}user/createPassword/${user.token}`, {
      password: user.password,
    });
  },
  createPasswordGroup(user: User) {
    return axios.post(`${API_URL}user/createPassword/${user.token}`, {
      password: user.password,
    });
  },

  loadUser() {
    return axios.get(
      API_URL + "tenant/profile?nocache=" + new Date().getTime()
    );
  },

  confirmAccount(token: string) {
    return axios.get(`${API_URL}register/confirmAccount/${token}`);
  },
};
