<template>
    <v-container>
        <h1>{{ $t("deduplicationPageLabel") }}</h1>

        <v-btn class="mt-2 mb-2" @click="scanForDuplicates">
            {{ $t("scanForDuplicatesLabel") }}
        </v-btn>

        <v-card class="pa-3" variant="flat" color="grey-lighten-5">
            <v-card-text
                v-if="
                    totalDocumentSuggestions === 0 && totalJournalSuggestions === 0 && 
                        totalBookSeriesSuggestions === 0 && totalEventSuggestions === 0 && 
                        totalPersonSuggestions === 0 && totalOrganisationUnitSuggestions === 0"
            >
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
                    <v-tab v-if="totalJournalSuggestions > 0" value="journals">
                        {{ $t("journalListLabel") }}
                    </v-tab>
                    <v-tab v-if="totalBookSeriesSuggestions > 0" value="bookSeries">
                        {{ $t("bookSeriesListLabel") }}
                    </v-tab>
                    <v-tab v-if="totalEventSuggestions > 0" value="events">
                        {{ $t("eventListLabel") }}
                    </v-tab>
                    <v-tab v-if="totalPersonSuggestions > 0" value="persons">
                        {{ $t("personListLabel") }}
                    </v-tab>
                    <v-tab v-if="totalOrganisationUnitSuggestions > 0" value="organisationUnits">
                        {{ $t("ouListLabel") }}
                    </v-tab>
                </v-tabs>

                <v-window v-model="currentTab">
                    <v-window-item value="documents">
                        <document-deduplication-table :suggestions="documentSuggestions" :total-suggestions="totalDocumentSuggestions" @switch-page="switchDeduplicationSuggestionsPage"></document-deduplication-table>
                    </v-window-item>

                    <v-window-item value="journals">
                        <document-deduplication-table :suggestions="journalSuggestions" :total-suggestions="totalJournalSuggestions" @switch-page="switchDeduplicationSuggestionsPage"></document-deduplication-table>
                    </v-window-item>

                    <v-window-item value="bookSeries">
                        <document-deduplication-table :suggestions="bookSeriesSuggestions" :total-suggestions="totalBookSeriesSuggestions" @switch-page="switchDeduplicationSuggestionsPage"></document-deduplication-table>
                    </v-window-item>

                    <v-window-item value="events">
                        <document-deduplication-table :suggestions="eventSuggestions" :total-suggestions="totalEventSuggestions" @switch-page="switchDeduplicationSuggestionsPage"></document-deduplication-table>
                    </v-window-item>

                    <v-window-item value="persons">
                        <document-deduplication-table :suggestions="personSuggestions" :total-suggestions="totalPersonSuggestions" @switch-page="switchDeduplicationSuggestionsPage"></document-deduplication-table>
                    </v-window-item>

                    <v-window-item value="organisationUnits">
                        <document-deduplication-table :suggestions="organisationUnitSuggestions" :total-suggestions="totalOrganisationUnitSuggestions" @switch-page="switchDeduplicationSuggestionsPage"></document-deduplication-table>
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
import type { DeduplicationSuggestion } from "@/models/PublicationModel";
import DeduplicationService from "@/services/DeduplicationService";
import { EntityType } from "@/models/MergeModel";
import { useRoute, useRouter } from "vue-router";
import { watch } from "vue";


export default defineComponent({
    name: "DeduplicationView",
    components: { DocumentDeduplicationTable },
    setup() {
        const route = useRoute();
        const currentTab = ref(route.query.tab || "documents");

        const router = useRouter();

        const documentSuggestions = ref<DeduplicationSuggestion[]>([]);
        const journalSuggestions = ref<DeduplicationSuggestion[]>([]);
        const bookSeriesSuggestions = ref<DeduplicationSuggestion[]>([]);
        const eventSuggestions = ref<DeduplicationSuggestion[]>([]);
        const personSuggestions = ref<DeduplicationSuggestion[]>([]);
        const organisationUnitSuggestions = ref<DeduplicationSuggestion[]>([]);

        const totalDocumentSuggestions = ref(0);
        const totalJournalSuggestions = ref(0);
        const totalBookSeriesSuggestions = ref(0);
        const totalEventSuggestions = ref(0);
        const totalPersonSuggestions = ref(0);
        const totalOrganisationUnitSuggestions = ref(0);

        const documentSuggestionsPage = ref(0);
        const journalSuggestionsPage = ref(0);
        const bookSeriesSuggestionsPage = ref(0);
        const eventSuggestionsPage = ref(0);
        const personSuggestionsPage = ref(0);
        const organisationUnitSuggestionsPage = ref(0);
        
        const globalPageSize = ref(5);

        const i18n = useI18n();

        const snackbar = ref(false);
        const message = ref("");

        onMounted(() => {
            document.title = `TeslaRIS - ${i18n.t("deduplicationPageLabel")}`;

            fetchDocumentSuggestions();
            fetchJournalSuggestions();
            fetchEventSuggestions();
            fetchPersonSuggestions();
            fetchOrganisationUnitSuggestions();
        });

        watch(currentTab, () => {
            router.push({name:"deduplication", query: { tab: currentTab.value }});
        });

        const fetchDocumentSuggestions = () => {
            DeduplicationService.fetchDeduplicationSuggestions(documentSuggestionsPage.value, globalPageSize.value, EntityType.PUBLICATION).then(response => {
                documentSuggestions.value = response.data.content;
                totalDocumentSuggestions.value = response.data.totalElements;
            });
        };

        const fetchJournalSuggestions = () => {
            DeduplicationService.fetchDeduplicationSuggestions(journalSuggestionsPage.value, globalPageSize.value, EntityType.JOURNAL).then(response => {
                journalSuggestions.value = response.data.content;
                totalJournalSuggestions.value = response.data.totalElements;
            });
        };

        const fetchBookSeriesSuggestions = () => {
            DeduplicationService.fetchDeduplicationSuggestions(bookSeriesSuggestionsPage.value, globalPageSize.value, EntityType.BOOK_SERIES).then(response => {
                bookSeriesSuggestions.value = response.data.content;
                totalBookSeriesSuggestions.value = response.data.totalElements;
            });
        };

        const fetchEventSuggestions = () => {
            DeduplicationService.fetchDeduplicationSuggestions(eventSuggestionsPage.value, globalPageSize.value, EntityType.EVENT).then(response => {
                eventSuggestions.value = response.data.content;
                totalEventSuggestions.value = response.data.totalElements;
            });
        };

        const fetchPersonSuggestions = () => {
            DeduplicationService.fetchDeduplicationSuggestions(personSuggestionsPage.value, globalPageSize.value, EntityType.PERSON).then(response => {
                personSuggestions.value = response.data.content;
                totalPersonSuggestions.value = response.data.totalElements;
            });
        };

        const fetchOrganisationUnitSuggestions = () => {
            DeduplicationService.fetchDeduplicationSuggestions(organisationUnitSuggestionsPage.value, globalPageSize.value, EntityType.ORGANISATION_UNIT).then(response => {
                organisationUnitSuggestions.value = response.data.content;
                totalOrganisationUnitSuggestions.value = response.data.totalElements;
                if(totalOrganisationUnitSuggestions.value === 0) {
                    navigateToPopulatedTab();
                }
            });
        };

        const navigateToPopulatedTab = () => {
            if(totalDocumentSuggestions.value > 0) {
                currentTab.value = "documents";
            } else if(totalJournalSuggestions.value > 0) {
                currentTab.value = "journals";
            }else if(totalBookSeriesSuggestions.value > 0) {
                currentTab.value = "bookSeries";
            }else if(totalEventSuggestions.value > 0) {
                currentTab.value = "events";
            }else if(totalPersonSuggestions.value > 0) {
                currentTab.value = "persons";
            }else if(totalOrganisationUnitSuggestions.value > 0) {
                currentTab.value = "organisationUnits";
            }
        };

        const switchDeduplicationSuggestionsPage = (nextPage: number, pageSize: number, type: EntityType) => {
            globalPageSize.value = pageSize;
            
            switch (type) {
                case EntityType.PUBLICATION:
                    documentSuggestionsPage.value = nextPage;
                    fetchDocumentSuggestions();
                    break;
                case EntityType.JOURNAL:
                    journalSuggestionsPage.value = nextPage;
                    fetchJournalSuggestions();
                    break;
                case EntityType.BOOK_SERIES:
                    bookSeriesSuggestionsPage.value = nextPage;
                    fetchBookSeriesSuggestions();
                    break;
                case EntityType.EVENT:
                    eventSuggestionsPage.value = nextPage;
                    fetchEventSuggestions();
                    break;
                case EntityType.PERSON:
                    personSuggestionsPage.value = nextPage;
                    fetchPersonSuggestions();
                    break;
                case EntityType.ORGANISATION_UNIT:
                    organisationUnitSuggestionsPage.value = nextPage;
                    fetchOrganisationUnitSuggestions();
                    break;
            }
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
            switchDeduplicationSuggestionsPage,
            scanForDuplicates, snackbar,
            message, journalSuggestions,
            totalJournalSuggestions,
            eventSuggestions, totalEventSuggestions,
            personSuggestions, totalPersonSuggestions,
            totalBookSeriesSuggestions,
            totalOrganisationUnitSuggestions,
            organisationUnitSuggestions,
            bookSeriesSuggestions
        };
    },
});
</script>
