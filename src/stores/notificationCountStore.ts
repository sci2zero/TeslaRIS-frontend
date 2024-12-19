import { defineStore } from "pinia";

export const useNotificationCountStore = defineStore('notificationCountStore', {
    state: () => ({
        notificationCount: 0,
    }),
    actions: {
        setNotificationCount(count: number) {
            this.notificationCount = count;
        },
        decrementCounter() {
            if (this.notificationCount > 0) {
                this.notificationCount -= 1;
            }
        },
    },
});