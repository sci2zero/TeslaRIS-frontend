<template>
    <v-container id="journal">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        {{ returnCurrentLocaleContent(journal?.title) + (journal?.nameAbbreviation ? " (" + returnCurrentLocaleContent(journal?.nameAbbreviation) + ")" : "") }}
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ $t("journalLabel") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- Journal Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon size="x-large" class="large-journal-icon">
                    {{ icon }}
                </v-icon>
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="secondary">
                    <v-card-text class="edit-pen-container">
                        <publication-series-update-modal :read-only="!canEdit" :preset-publication-series="journal" input-type="JOURNAL" @update="updateBasicInfo"></publication-series-update-modal>

                        <!-- Basic Info -->
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>
                        <v-row>
                            <v-col cols="6">
                                <div>eISSN:</div>
                                <div class="response">
                                    {{ journal?.eissn ? journal.eissn : $t("notYetSetMessage") }}
                                </div>
                                <div>Print ISSN:</div>
                                <div class="response">
                                    {{ journal?.printISSN ? journal.printISSN : $t("notYetSetMessage") }}
                                </div>
                                <div v-if="journal?.languageTagIds && journal?.languageTagIds.length > 0">
                                    {{ $t("languageLabel") }}:
                                </div>
                                <div>
                                    <v-chip v-for="(languageTagId, index) in journal?.languageTagIds" :key="index" outlined>
                                        {{ languageTagMap.get(languageTagId)?.display }}
                                    </v-chip>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <person-publication-series-contribution-list :contribution-list="journal?.contributions ? journal.contributions : []" :read-only="!canEdit" @update="updateContributions"></person-publication-series-contribution-list>

        <!-- Publication Table -->
        <br />
        <publication-table-component :publications="publications" :total-publications="totalPublications" @switch-page="switchPage"></publication-table-component>
        
        <v-snackbar
            v-model="snackbar"
            :timeout="5000">
            {{ snackbarMessage }}
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

import type { LanguageTagResponse } from '@/models/Common';
import { onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { watch } from 'vue';
import PublicationTableComponent from '@/components/publication/PublicationTableComponent.vue';
import type { DocumentPublicationIndex } from '@/models/PublicationModel';
import DocumentPublicationService from "@/services/DocumentPublicationService";
import type { Journal } from '@/models/JournalModel';
import JournalService from '@/services/JournalService';
import LanguageService from '@/services/LanguageService';
import { returnCurrentLocaleContent } from '@/i18n/TranslationUtil';
import PublicationSeriesUpdateModal from '@/components/publicationSeries/update/PublicationSeriesUpdateModal.vue';
import PersonPublicationSeriesContributionList from '@/components/core/PersonPublicationSeriesContributionList.vue';
import type { PersonPublicationSeriesContribution } from '@/models/PublicationSeriesModel';

export default defineComponent({
    name: "JournalLandingPage",
    components: { PublicationTableComponent, PublicationSeriesUpdateModal, PersonPublicationSeriesContributionList },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();

        const journal = ref<Journal>();
        const languageTagMap = ref<Map<number, LanguageTagResponse>>(new Map());

        const publications = ref<DocumentPublicationIndex[]>([]);
        const totalPublications = ref<number>(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const i18n = useI18n();

        const icon = ref("mdi-book-open-blank-variant");

        const canEdit = ref(false);

        onMounted(() => {
            JournalService.canEdit(parseInt(currentRoute.params.id as string)).then(response => {
                canEdit.value = response.data;
            });

            fetchJournal();
        });

        watch(i18n.locale, () => {
            populateData();
        });

        const fetchJournal = () => {
            JournalService.readJournal(parseInt(currentRoute.params.id as string)).then((response) => {
                journal.value = response.data;

                journal.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);

                fetchPublications();                
                populateData();
            });
        };

        const populateData = () => {
            LanguageService.getAllLanguageTags().then(response => {
                response.data.forEach(languageTag => {
                    languageTagMap.value.set(languageTag.id, languageTag);
                })
            });
        };

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            sort.value = sortField;
            direction.value = sortDir;
            fetchPublications();
        };

        const fetchPublications = () => {
            if (!journal.value?.id) {
                return;
            }

            DocumentPublicationService.findPublicationsInJournal(journal.value?.id as number, `page=${page.value}&size=${size.value}&sort=${sort.value}`).then((publicationResponse) => {
                publications.value = publicationResponse.data.content;
                totalPublications.value = publicationResponse.data.totalElements
            });
        };

        const updateBasicInfo = (updatedJournal: Journal) => {
            journal.value!.title = updatedJournal.title;
            journal.value!.nameAbbreviation = updatedJournal.nameAbbreviation;
            journal.value!.eissn = updatedJournal.eissn;
            journal.value!.printISSN = updatedJournal.printISSN;
            journal.value!.languageTagIds = updatedJournal.languageTagIds;

            performUpdate(false);
        };

        const updateContributions = (contributions: PersonPublicationSeriesContribution[]) => {
            journal.value!.contributions = contributions;
            performUpdate(true);
        };

        const performUpdate = (reload: boolean) => {
            JournalService.updateJournal(journal.value?.id as number, journal.value as Journal).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                if(reload) {
                    fetchJournal();
                }
            }).catch(() => {
                snackbarMessage.value = i18n.t("genericErrorMessage");
                snackbar.value = true;
                if(reload) {
                    fetchJournal();
                }
            });
        };

        return {
            journal, icon,
            publications, 
            totalPublications,
            switchPage, canEdit,
            returnCurrentLocaleContent,
            languageTagMap, updateBasicInfo,
            snackbar, snackbarMessage,
            updateContributions
        };
}})

</script>

<style scoped>
    #journal .large-journal-icon {
        font-size: 10em;
    }

    #journal .response {
        font-size: 1.2rem;
        margin-bottom: 10px;
        font-weight: bold;
    }

    .edit-pen-container {
        position:relative;
    }
</style>