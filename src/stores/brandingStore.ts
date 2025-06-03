import type { MultilingualContent } from "@/models/Common";
import { defineStore } from "pinia";

export const useBrandingStore = defineStore('brandingStore', {
    state: (): {rebranded: boolean, newTitle: MultilingualContent[]} => ({
        rebranded: false,
        newTitle: []
    }),
    actions: {
        isRebranded(newTitle: MultilingualContent[]) {
            this.newTitle = newTitle;
            this.rebranded = true;
        },
        rebrandingHandled() {
            this.rebranded = false;
            this.newTitle = [];
        },
    },
});
