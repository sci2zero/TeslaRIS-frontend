import { defineStore } from 'pinia';

export const useRouteStore = defineStore('route', {
    state: () => ({
        nextRoute: null as null | any,
    }),
    actions: {
        setRoute(value: string) {
            this.nextRoute = value;
        },
        fetchAndClearRoute() {
            const route = this.nextRoute;
            this.nextRoute = null;
            return route;
        },
    },
});
