import { defineStore } from 'pinia';

export const useLoginStore = defineStore('login', {
  state: () => ({
    userLoggedIn: false,
  }),
  actions: {
    emitLoginSuccess() {
      this.userLoggedIn = true;
    },
    userLoggedOut() {
      this.userLoggedIn = false;
    },
  },
});