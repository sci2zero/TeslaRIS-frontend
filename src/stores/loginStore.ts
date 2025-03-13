import { defineStore } from 'pinia';

export const useLoginStore = defineStore('login', {
    state: () => ({
        userLoggedIn: false,
        reloadUserName: false,
        explicitlyLoggedOut: false
    }),
    actions: {
        emitLoginSuccess() {
            this.userLoggedIn = true;
        },
        emitReloadUsername() {
            this.reloadUserName = true;
        },
        emitUsernameReloaded() {
            this.reloadUserName = false;
        },
        userLoggedOut() {
            this.userLoggedIn = false;
        },
        explicitlyLogout() {
            this.userLoggedIn = false;
            this.explicitlyLoggedOut = true;
        },
        reachedLoginPage() {
            this.explicitlyLoggedOut = false;
        },
        initialize() {
            const token = localStorage.getItem('jwt');
            this.userLoggedIn = !!token;
        }
    },
});
