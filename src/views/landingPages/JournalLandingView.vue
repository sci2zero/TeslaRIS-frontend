<template>
    <v-container id="journal">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        {{ returnCurrentLocaleContent(journal?.title) + (journal?.nameAbbreviation && journal?.nameAbbreviation.length > 0 ? " (" + returnCurrentLocaleContent(journal?.nameAbbreviation) + ")" : "") }}
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
                        <generic-crud-modal
                            :form-component="PublicationSeriesUpdateForm"
                            :form-props="{ presetPublicationSeries: journal, inputType: 'JOURNAL' }"
                            entity-name="Journal"
                            is-update
                            is-section-update
                            :read-only="!canEdit"
                            @update="updateBasicInfo"
                        />

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
                                <div v-if="journal?.uris && journal?.uris.length > 0">
                                    {{ $t("uriInputLabel") }}:
                                </div>
                                <div class="response">
                                    <uri-list :uris="journal?.uris"></uri-list>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <br />
        <v-tabs
            v-model="currentTab"
            color="deep-purple-accent-4"
            align-tabs="start"
        >
            <v-tab v-if="totalPublications > 0" value="publications">
                {{ $t("scientificResultsListLabel") }}
            </v-tab>
            <v-tab v-if="canEdit || (journal?.contributions && journal?.contributions.length > 0)" value="contributions">
                {{ $t("contributionsLabel") }}
            </v-tab>
            <v-tab v-if="canClassify || journalIndicators.length > 0" value="indicators">
                {{ $t("indicatorListLabel") }}
            </v-tab>
            <v-tab v-if="canClassify || journalClassifications.length > 0" value="classifications">
                {{ $t("classificationsLabel") }}
            </v-tab>
        </v-tabs>

        <v-tabs-window v-model="currentTab">
            <v-tabs-window-item value="publications">
                <!-- Publications Table -->
                <h2>{{ $t("journalPublicationsLabel") }}</h2>
                <publication-table-component :publications="publications" :total-publications="totalPublications" in-comparator @switch-page="switchPage"></publication-table-component>
            </v-tabs-window-item>
            <v-tabs-window-item value="contributions">
                <person-publication-series-contribution-tabs :contribution-list="journal?.contributions ? journal.contributions : []" :read-only="!canEdit" @update="updateContributions"></person-publication-series-contribution-tabs>
            </v-tabs-window-item>
            <v-tabs-window-item value="indicators">
                <indicators-section 
                    :indicators="journalIndicators" 
                    :applicable-types="[ApplicableEntityType.PUBLICATION_SERIES]" 
                    :entity-id="journal?.id"
                    :entity-type="ApplicableEntityType.PUBLICATION_SERIES" 
                    :can-edit="false"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="classifications">
                <entity-classification-view
                    :entity-classifications="journalClassifications"
                    :entity-id="journal?.id"
                    :can-edit="canClassify"
                    :containing-entity-type="ApplicableEntityType.PUBLICATION_SERIES"
                    :applicable-types="[ApplicableEntityType.PUBLICATION_SERIES]"
                    @create="createJournalClassification"
                    @update="fetchClassifications"
                />
            </v-tabs-window-item>
        </v-tabs-window>

        <toast v-model="snackbar" :message="snackbarMessage" />
    </v-container>
</template>

<script lang="ts">

import { ApplicableEntityType, type LanguageTagResponse } from '@/models/Common';
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
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import PersonPublicationSeriesContributionTabs from '@/components/core/PersonPublicationSeriesContributionTabs.vue';
import type { PersonPublicationSeriesContribution } from '@/models/PublicationSeriesModel';
import { getErrorMessageForErrorKey } from '@/i18n';
import PublicationSeriesUpdateForm from '@/components/publicationSeries/update/PublicationSeriesUpdateForm.vue';
import UriList from '@/components/core/UriList.vue';
import EntityIndicatorService from '@/services/assessment/EntityIndicatorService';
import type { EntityClassificationResponse, EntityIndicatorResponse, PublicationSeriesAssessmentClassification } from '@/models/AssessmentModel';
import IndicatorsSection from '@/components/assessment/indicators/IndicatorsSection.vue';
import Toast from '@/components/core/Toast.vue';
import EntityClassificationService from '@/services/assessment/EntityClassificationService';
import EntityClassificationView from '@/components/assessment/classifications/EntityClassificationView.vue';
import { useLoginStore } from '@/stores/loginStore';


export default defineComponent({
    name: "JournalLandingPage",
    components: { PublicationTableComponent, GenericCrudModal, PersonPublicationSeriesContributionTabs, UriList, IndicatorsSection, Toast, EntityClassificationView },
    setup() {
        const currentTab = ref("");

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
        const canClassify = ref(false);

        const journalIndicators = ref<EntityIndicatorResponse[]>([]);
        const journalClassifications = ref<EntityClassificationResponse[]>([]);

        const loginStore = useLoginStore();

        onMounted(() => {
            if (loginStore.userLoggedIn) {
                JournalService.canEdit(parseInt(currentRoute.params.id as string)).then(response => {
                    canEdit.value = response.data;
                });
                JournalService.canClassify(parseInt(currentRoute.params.id as string)).then(response => {
                    canClassify.value = response.data;
                });
                fetchClassifications();
            }

            fetchJournal(true);
            fetchIndicators();
        });

        watch(i18n.locale, () => {
            populateData();
        });

        const fetchJournal = (uponStartup: boolean) => {
            JournalService.readJournal(parseInt(currentRoute.params.id as string)).then((response) => {
                journal.value = response.data;

                document.title = returnCurrentLocaleContent(journal.value.title) as string;

                journal.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);

                if(uponStartup) {
                    Promise.all([fetchPublications()]).then(() => {
                        setStartTab();
                    });
                }

                populateData();
            });
        };

        const fetchIndicators = () => {
            EntityIndicatorService.fetchPublicationSeriesIndicators(parseInt(currentRoute.params.id as string)).then(response => {
                journalIndicators.value = response.data;
            });
        };

        const fetchClassifications = () => {
            EntityClassificationService.fetchPublicationSeriesClassifications(parseInt(currentRoute.params.id as string)).then((response) => {
                journalClassifications.value = response.data;
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
            return DocumentPublicationService.findPublicationsInJournal(journal.value?.id as number, `page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`).then((publicationResponse) => {
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
            journal.value!.uris = updatedJournal.uris;

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
                    fetchJournal(false);
                }
            }).catch((error) => {
                snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
                if(reload) {
                    fetchJournal(false);
                }
            });
        };

        const setStartTab = () => {
            if(totalPublications.value > 0) {
                currentTab.value = "publications";
            } else if ((journal.value?.contributions?.length && journal.value?.contributions?.length > 0) || canEdit.value) {
                currentTab.value = "contributions";
            } else {
                currentTab.value = "indicators";
            }
        };

        const createJournalClassification = (journalClassification: PublicationSeriesAssessmentClassification) => {
            EntityClassificationService.createPublicationSeriesClassification(journalClassification).then(() => {
                fetchClassifications();
            });
        };

        return {
            journal, icon, publications, totalPublications,
            switchPage, canEdit, returnCurrentLocaleContent,
            languageTagMap, updateBasicInfo, canClassify,
            snackbar, snackbarMessage, journalIndicators,
            updateContributions, ApplicableEntityType,
            currentTab, PublicationSeriesUpdateForm,
            journalClassifications, createJournalClassification,
            fetchClassifications
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