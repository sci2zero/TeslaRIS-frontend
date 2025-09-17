import { defineStore } from 'pinia';

export const useRegisterStore = defineStore('register', {
    state: () => ({
        registerPersonData: null as any
    }),
    actions: {
        setRegisterPersonData(person : any) {
            this.registerPersonData = person;
        },
        clearRegisterPersonData() {
            this.registerPersonData = null;
        }
    },
});
