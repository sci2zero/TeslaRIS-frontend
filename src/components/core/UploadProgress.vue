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
      
            <div>
                <div class="text-body-2 font-weight-medium">
                    {{ fileName }}
                </div>
                <div class="text-caption text-medium-emphasis">
                    {{ statusMessage }}
                </div>
            </div>
        </div>
    </v-snackbar>

    <toast v-model="error" :message="$t('uploadFailedMessage')" />
</template>

<script setup lang="ts">
import { useUploadStore } from '@/stores/uploadStore';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Toast from './Toast.vue';


const uploadState = ref({
    progress: 0,
    fileName: '',
    isUploading: false
});

const isVisible = computed(() => uploadState.value.isUploading);
const progress = computed(() => uploadState.value.progress);
const fileName = computed(() => uploadState.value.fileName);

const i18n = useI18n();
const uploadStore = useUploadStore();

const error = ref<boolean>(false);

const statusMessage = computed(() => {
    if (progress.value === 100) {
        return i18n.t("uploadCompleteLabel");
    }

    return i18n.t("uploadingLabel");
});

const startUpload = (fileName: string) => {
    uploadState.value = {
        progress: 0,
        fileName,
        isUploading: true
    };

    uploadStore.setUploadState(0, fileName);
};

const updateProgress = (newProgress: number) => {
    if (uploadState.value.isUploading) {
        uploadState.value.progress = newProgress;
        uploadStore.setUploadState(newProgress, uploadState.value.fileName);

        if (uploadState.value.progress === 100) {
            completeUpload();
        }
    }
};

const completeUpload = () => {
    uploadState.value.progress = 100
    setTimeout(() => {
        uploadState.value.isUploading = false;
        uploadStore.setUploadState(100, uploadState.value.fileName);
    }, 1500);
};

const cancelUpload = (displayErrorMessage: boolean = false) => {
    uploadState.value = {
        progress: 0,
        fileName: "",
        isUploading: false
    };

    uploadStore.setUploadState(uploadState.value.progress, uploadState.value.fileName);

    if (displayErrorMessage) {
        error.value = true;
    }
};

defineExpose({
    startUpload,
    updateProgress,
    cancelUpload
});
</script>

<style scoped>

.download-snackbar {
    min-width: 350px;
}

</style>
