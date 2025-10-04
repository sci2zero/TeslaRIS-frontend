import DownloadProgress from '@/components/core/DownloadProgress.vue';
import { type DownloadState } from '@/models/Common';
import { defineStore } from 'pinia';
import { ref } from 'vue';


export const useDownloadStore = defineStore("download", () => {
    const isDownloading = ref(false);
    const fileName = ref("");
    const progress = ref(0);
    const downloadProgressRef = ref<typeof DownloadProgress>();

    const setGlobalDownloadProgressRef = (ref: typeof DownloadProgress) => {
        downloadProgressRef.value = ref;
    };

    const setDownloadState = (newState: DownloadState) => {
        isDownloading.value = newState.isDownloading;
        fileName.value = newState.fileName;
        progress.value = newState.progress;  
    };

    return {
        isDownloading,
        fileName,
        progress,
        setDownloadState,
        downloadProgressRef,
        setGlobalDownloadProgressRef
    };
});
