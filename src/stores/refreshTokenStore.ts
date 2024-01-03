import { defineStore } from 'pinia';

export const useRefreshTokenStore = defineStore('refreshToken', {
  state: () => ({
    refreshing: false,
  }),
  actions: {
    startedRefresh() {
      this.refreshing = true;
    },
    finishedRefresh() {
      this.refreshing = false;
    },
  },
});