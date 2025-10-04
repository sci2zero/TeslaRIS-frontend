<template>
    <div class="d-flex flex-row justify-center">
        <v-list
            v-if="allgeneratedBackups.length > 0"
            :lines="false"
            density="comfortable"
            class="d-block mt-10 flex-col justify-center bigger-font"
        >
            <v-list-item
                v-for="generatedBackup in allgeneratedBackups" :key="generatedBackup"
                :value="generatedBackup"
                class="mb-2"
            >
                <v-list-item-title @click="downloadbackup(generatedBackup)">
                    {{ generatedBackup }}
                </v-list-item-title>
            </v-list-item>
        </v-list>
        <h2 v-else class="d-flex mt-10 flex-col justify-center">
            {{ $t("nogeneratedBackupsLabel") }}
        </h2>
    </div>

    <persistent-question-dialog
        ref="dialogRef"
        :title="$t('areYouSureLabel')"
        :message="$t('backupDownloadWarning')"
        @continue="finishBackupDownloading">
    </persistent-question-dialog>
</template>

<script lang="ts">
import PersistentQuestionDialog from '@/components/core/comparators/PersistentQuestionDialog.vue';
import DocumentBackupService from '@/services/DocumentBackupService';
import ThesisLibraryBackupService from '@/services/thesisLibrary/ThesisLibraryBackup';
import { defineComponent, onMounted, type PropType, ref } from 'vue';


export default defineComponent({
    name: "BackupList",
    components: { PersistentQuestionDialog },
    props: {
        backupType: {
            type: Object as PropType<"thesis" | "document">,
            required: true
        }
    },
    setup(props) {
        const allgeneratedBackups = ref<string[]>([]);

        const dialogRef = ref<typeof PersistentQuestionDialog>();
        const backupForDownloading = ref("");
        
        onMounted(() => {
            fetchBackups();
        });

        const fetchBackups = () => {
            if (props.backupType === "thesis") {
                ThesisLibraryBackupService.listBackups()
                .then(response => {
                    allgeneratedBackups.value = response.data;
                });
            } else {
                DocumentBackupService.listBackups()
                .then(response => {
                    allgeneratedBackups.value = response.data;
                });
            }
        };

        const downloadbackup = (backupFileName: string) => {
            backupForDownloading.value = backupFileName;
            dialogRef.value?.toggle();
        };

        const finishBackupDownloading = () => {
            if (props.backupType === "thesis") {
                ThesisLibraryBackupService.downloadBackupFile(backupForDownloading.value)
                .then(() => {
                    fetchBackups();
                });
            } else {
                DocumentBackupService.downloadBackupFile(backupForDownloading.value)
                .then(() => {
                    fetchBackups();
                });
            }
        };

        return {
            allgeneratedBackups,
            downloadbackup,
            dialogRef,
            finishBackupDownloading
        };
    }
});
</script>
