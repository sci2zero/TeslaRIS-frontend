<template>
    <div justify="start">
        <v-dialog v-model="dialog" persistent class="narrow">
            <template #activator="scope">
                <v-list-item
                    v-bind="scope.props"
                    class="inline-action"
                    v-on="scope.isActive">
                    <v-list-item-title>{{ $t("filesForDownloadLabel") }}</v-list-item-title>
                </v-list-item>
            </template>
            
            <v-card v-if="dialog" class="d-flex flex-column align-right pa-4">
                <v-card-title>{{ $t("filesForDownloadLabel") }}</v-card-title>
                <v-card-text>
                    <attachment-section :document="document" :proofs="[]" :file-items="document?.fileItems"></attachment-section>
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
import { type Document } from "@/models/PublicationModel";
import DocumentPublicationService from "@/services/DocumentPublicationService";
import { ref, watch } from "vue";
import { defineComponent } from "vue";
import AttachmentSection from "../core/AttachmentSection.vue";


export default defineComponent({
    name: "PublicationReferenceFormats",
    components: { AttachmentSection },
    props: {
        documentId: {
            type: Number,
            required: true
        }
    },
    setup(props) {
        const currentTab = ref("simpleSearch");
        const dialog = ref(false);
        const document = ref<Document>();

        watch(dialog, () => {
            if (dialog.value) {
                fetchDocument();
            }
        });

        const fetchDocument = () => {
            DocumentPublicationService.readDocumentPublication(
                props.documentId
            ).then(response => {
                document.value = response.data;
            });
        };

        return {
            dialog,
            currentTab,
            document
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
