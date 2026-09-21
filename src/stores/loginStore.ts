import { defineStore } from 'pinia';

export const useLoginStore = defineStore('login', {
    state: () => ({
        userLoggedIn: false,
        // Incremented on every request - a flag would be consumed by whichever
        // watcher reacts first, leaving the remaining ones without a signal.
        usernameReloadRequests: 0,
        explicitlyLoggedOut: false
    }),
    actions: {
        emitLoginSuccess() {
            this.userLoggedIn = true;
        },
        emitReloadUsername() {
            this.usernameReloadRequests++;
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
