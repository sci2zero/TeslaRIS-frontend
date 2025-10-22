import UploadProgress from '@/components/core/UploadProgress.vue';
import { defineStore } from 'pinia';
import { ref } from 'vue';


export const useUploadStore = defineStore("upload", () => {
    const isUploading = ref(false);
    const fileName = ref("");
    const progress = ref(0);
    const uploadProgressRef = ref<typeof UploadProgress>();

    const setGlobalUploadProgressRef = (ref: typeof UploadProgress) => {
        uploadProgressRef.value = ref;
    };

    const setUploadState = (progressValue: number, filename: string) => {
        isUploading.value = progressValue < 100;
        fileName.value = filename;
        progress.value = progressValue;  
    };

    return {
        isUploading,
        fileName,
        progress,
        setUploadState,
        uploadProgressRef,
        setGlobalUploadProgressRef
    };
});
