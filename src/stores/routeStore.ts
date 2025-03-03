import { defineStore } from 'pinia';

export const useRouteStore = defineStore('route', {
    state: () => ({
        nextRoute: null as null | any,
        params: {} as any
    }),
    actions: {
        setRouteAndParams(value: string, params: any) {
            this.nextRoute = value;
            this.params = params;
        },
        fetchAndClearRoute() {
            const route = this.nextRoute;
            this.nextRoute = null;
            return route;
        },
        fetchAndClearParams() {
            const params = this.params;
            this.params = null;
            return params;
        }
    },
});
