<template>
    <v-container>
        <h1>{{ $t("deduplicationPageLabel") }}</h1>

        <v-btn class="mt-2 mb-2" @click="scanForDuplicates">
            {{ $t("scanForDuplicatesLabel") }}
        </v-btn>

        <v-card class="pa-3" variant="flat" color="grey-lighten-5">
            <v-card-text v-if="totalDocumentSuggestions === 0">
                <h2>{{ $t("noDeduplicationSuggestionsMessage") }}</h2>
            </v-card-text>
            <v-card-text v-else class="edit-pen-container">
                <v-tabs
                    v-model="currentTab"
                    color="deep-purple-accent-4"
                    align-tabs="start"
                >
                    <v-tab v-if="totalDocumentSuggestions > 0" value="documents">
                        {{ $t("documentsLabel") }}
                    </v-tab>
                </v-tabs>

                <v-window v-model="currentTab">
                    <v-window-item value="documents">
                        <document-deduplication-table :suggestions="documentSuggestions" :total-suggestions="totalDocumentSuggestions" @switch-page="switchDocumentSuggestionsPage"></document-deduplication-table>
                    </v-window-item>
                </v-window>
            </v-card-text>
        </v-card>

        <v-snackbar
            v-model="snackbar"
            :timeout="5000">
            {{ message }}
            <template #actions>
                <v-btn
                    color="blue"
                    variant="text"
                    @click="snackbar = false">
                    {{ $t("closeLabel") }}
                </v-btn>
            </template>
        </v-snackbar>
    </v-container>
</template>

<script lang="ts">
import { onMounted } from "vue";
import { ref } from "vue";
import { defineComponent } from "vue";
import { useI18n } from "vue-i18n";
import DocumentDeduplicationTable from "@/components/deduplication/DocumentDeduplicationTable.vue";
import type { DocumentDeduplicationSuggestion } from "@/models/PublicationModel";
import DeduplicationService from "@/services/DeduplicationService";


export default defineComponent({
    name: "DeduplicationView",
    components: { DocumentDeduplicationTable },
    setup() {
        const currentTab = ref("documents");

        const documentSuggestions = ref<DocumentDeduplicationSuggestion[]>([]);
        const totalDocumentSuggestions = ref(0);

        const documentSuggestionsPage = ref(0);
        const documentSuggestionsSize = ref(5);

        const i18n = useI18n();

        const snackbar = ref(false);
        const message = ref("");

        onMounted(() => {
            document.title = `TeslaRIS - ${i18n.t("deduplicationLabel")}`;

            fetchDocumentSuggestions();
        });

        const fetchDocumentSuggestions = () => {
            DeduplicationService.fetchDocumentSuggestions(documentSuggestionsPage.value, documentSuggestionsSize.value).then(response => {
                documentSuggestions.value = response.data.content;
                totalDocumentSuggestions.value = response.data.totalElements;
            });
        };

        const switchDocumentSuggestionsPage = (nextPage: number, pageSize: number) => {
            documentSuggestionsPage.value = nextPage;
            documentSuggestionsSize.value = pageSize;
            fetchDocumentSuggestions();
        };

        const scanForDuplicates = () => {
            DeduplicationService.performDeduplicationScan().then(response => {
                if(response.data) {
                    message.value = i18n.t("startedDeduplicationScanMessage");
                } else {
                    message.value = i18n.t("deduplicationScanInProgressMessage");
                }
                snackbar.value = true;
            });
        };

        return {
            currentTab, documentSuggestions,
            totalDocumentSuggestions,
            switchDocumentSuggestionsPage,
            scanForDuplicates, snackbar,
            message
        };
    },
});
</script>
