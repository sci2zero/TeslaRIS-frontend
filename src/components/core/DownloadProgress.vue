<template>
    <v-snackbar
        v-model="isVisible"
        :timeout="-1"
        location="bottom"
        color="background"
        elevation="24"
        class="download-snackbar"
    >
        <div class="d-flex align-center">
            <v-progress-circular
                v-if="progress === 0"
                :model-value="progress"
                :size="50"
                :width="4"
                color="primary"
                class="mr-3"
                indeterminate
            />
            <v-progress-circular
                v-else
                :model-value="progress"
                :size="50"
                :width="4"
                color="primary"
                class="mr-3"
            >
                {{ progress }}%
            </v-progress-circular>
      
            <div>
                <div class="text-body-2 font-weight-medium">
                    {{ fileName }}
                </div>
                <div class="text-caption text-medium-emphasis">
                    {{ downloadState.message ? downloadState.message : statusMessage }}
                </div>
            </div>
        </div>
    </v-snackbar>
</template>

<script setup lang="ts">
import { type DownloadState } from '@/models/Common';
import { useDownloadStore } from '@/stores/downloadStore';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';


const downloadState = ref<DownloadState>({
    progress: 0,
    fileName: "",
    isDownloading: false,
    message: ""
});

const isVisible = computed(() => downloadState.value.isDownloading);
const progress = computed(() => downloadState.value.progress);
const fileName = computed(() => downloadState.value.fileName);

const i18n = useI18n();
const downloadStore = useDownloadStore();

const statusMessage = computed(() => {
    if (progress.value === 0) {
        return i18n.t("startingDownloadLabel");
    }

    if (progress.value === 100) {
        return i18n.t("downloadCompleteLabel");
    }

    return `${i18n.t("downloadingLabel")} ${progress.value}%`;
});

const startDownload = (fileName: string) => {
    downloadState.value = {
        progress: 0,
        fileName,
        isDownloading: true
    };

    downloadStore.setDownloadState(downloadState.value);
};

const setMessage = (message: string) => {
    downloadState.value.message = message;
    downloadStore.setDownloadState(downloadState.value);
};

const cancelDownload = () => {
    downloadState.value = {
        progress: 0,
        fileName: "",
        isDownloading: false
    };

    downloadStore.setDownloadState(downloadState.value);
};

const updateProgress = (newProgress: number) => {
    if (downloadState.value.isDownloading) {
        downloadState.value.message = "";
        
        downloadState.value.progress = Math.min(100, Math.max(0, newProgress))
        downloadStore.setDownloadState(downloadState.value);

        if (downloadState.value.progress === 100) {
            completeDownload();
        }
    }
};

const completeDownload = () => {
    downloadState.value.progress = 100
    setTimeout(() => {
        downloadState.value.isDownloading = false;
        downloadStore.setDownloadState(downloadState.value);
    }, 1500);
};

defineExpose({
    startDownload,
    updateProgress,
    cancelDownload,
    setMessage
});
</script>

<style scoped>

.download-snackbar {
    min-width: 350px;
}

</style>
