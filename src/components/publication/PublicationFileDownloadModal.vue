<template>
    <div justify="start">
        <v-dialog v-model="dialog" :persistent="persistent" class="narrow">
            <template #activator="scope">
                <v-list-item
                    v-if="isListItem"
                    v-bind="scope.props"
                    class="inline-action"
                    v-on="scope.isActive">
                    <v-list-item-title>{{ $t("filesForDownloadLabel") }}</v-list-item-title>
                </v-list-item>
                <v-btn
                    v-else
                    min-width="70"
                    density="compact"
                    :disabled="!containsFiles"
                    v-bind="scope.props"
                    v-on="scope.isActive">
                    ...
                </v-btn>
            </template>
            
            <v-card v-if="dialog" class="d-flex flex-column align-right pa-4">
                <v-card-title>{{ $t("filesForDownloadLabel") }}</v-card-title>
                <v-card-text>
                    <attachment-section
                        v-if="containsAnyDocumentFile()"
                        :document="document"
                        :is-on-public-review="showThesisSections"
                        :file-items="document?.fileItems"
                        :proofs="document?.proofs"
                        :preliminary-files="(showThesisSections && document) ? (document as Thesis).preliminaryFiles : []"
                        :preliminary-supplements="(showThesisSections && document) ? (document as Thesis).preliminarySupplements : []"
                        :commission-reports="(showThesisSections && document) ? (document as Thesis).commissionReports : []"
                        :hide-empty-sections="hideEmptySections">
                    </attachment-section>
                    <v-progress-circular
                        v-else-if="loading"
                        :size="50"
                        :width="4"
                        color="primary"
                        class="mr-3"
                        indeterminate
                    />
                    <h3 v-else>
                        {{ $t("noFilesForDownloadLabel") }}
                    </h3>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>


<script lang="ts">
import type { Thesis, Document } from "@/models/PublicationModel";
import DocumentPublicationService from "@/services/DocumentPublicationService";
import { ref, watch } from "vue";
import { defineComponent } from "vue";
import AttachmentSection from "../core/AttachmentSection.vue";


export default defineComponent({
    name: "PublicationFileDownloadModal",
    components: { AttachmentSection },
    props: {
        documentId: {
            type: Number,
            required: true
        },
        showThesisSections: {
            type: Boolean,
            default: false
        },
        persistent: {
            type: Boolean,
            default: true
        },
        hideEmptySections: {
            type: Boolean,
            default: false
        },
        isListItem: {
            type: Boolean,
            default: true
        },
        containsFiles: {
            type: Boolean,
            default: true
        }
    },
    setup(props) {
        const currentTab = ref("simpleSearch");
        const dialog = ref(false);
        const document = ref<Document | Thesis>();
        const loading = ref(false);

        watch(dialog, () => {
            if (dialog.value) {
                loading.value = true;
                fetchDocument();
            }
        });

        const fetchDocument = () => {
            if (props.showThesisSections) {
                DocumentPublicationService.readThesis(
                    props.documentId
                ).then(response => {
                    document.value = response.data;
                }).finally(() => {
                    loading.value = false;
                });
            } else {
                DocumentPublicationService.readDocumentPublication(
                    props.documentId
                ).then(response => {
                    document.value = response.data;
                }).finally(() => {
                    loading.value = false;
                });
            }
        };

        const containsAnyDocumentFile = (): boolean => {
            const doc = document.value;
            if (!doc) return false;

            return (doc.fileItems?.length ?? 0) > 0 ||
                (doc.proofs?.length ?? 0) > 0 ||
                ((doc as Thesis)?.preliminaryFiles?.length ?? 0) > 0 ||
                ((doc as Thesis)?.preliminarySupplements?.length ?? 0) > 0 ||
                ((doc as Thesis)?.commissionReports?.length ?? 0) > 0;
        };

        return {
            dialog, currentTab,
            document, loading,
            containsAnyDocumentFile
        };
    }
});
</script>

<style scoped>

.narrow {
    width: 100%;
    max-width: 750px;
}

</style>
