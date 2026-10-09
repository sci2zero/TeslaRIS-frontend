<template>
    <landing-page-layout
        id="journal"
        v-model="currentTab"
        :loading="!journal"
        loader-layout="list"
        :tab-number="3"
    >
        <template #header>
            <entity-landing-header
                :loading="!journal"
                :subtitle="returnCurrentLocaleContent(journal?.subtitle)"
                :entity-label="$t('journalLabel')"
                :badge="journal?.type ? getArticleCollectionSeriesTypeTitleFromValueAutoLocale(journal.type) : ''"
                icon="mdi-book-open-blank-variant"
                :can-edit="canEdit"
                :edit-label="$t('updateJournalLabel')"
                :entity-type="EntityType.JOURNAL"
                :entity-id="journal?.id"
                @edit="openModal(updateModalRef)"
            >
                <template #modals>
                    <generic-crud-modal
                        v-if="canEdit"
                        ref="updateModalRef"
                        hide-activator
                        :form-component="PublicationSeriesUpdateForm"
                        :form-props="{ presetPublicationSeries: journal, inputType: 'JOURNAL' }"
                        entity-name="Journal"
                        is-update
                        is-section-update
                        :read-only="!canEdit"
                        @update="updateBasicInfo"
                    />
                </template>
                <template #title>
                    {{ returnCurrentLocaleContent(journal?.title) + (journal?.nameAbbreviation && journal?.nameAbbreviation.length > 0 ? " (" + returnCurrentLocaleContent(journal?.nameAbbreviation) + ")" : "") }}
                </template>
                <template #meta>
                    <landing-meta-item v-if="journal?.eissn" label="eISSN" abbrev="eISSN" tone="blue">
                        {{ journal.eissn }}
                    </landing-meta-item>
                    <landing-meta-item v-if="journal?.printISSN" label="Print ISSN" abbrev="ISSN" tone="indigo">
                        {{ journal.printISSN }}
                    </landing-meta-item>
                </template>
            </entity-landing-header>
        </template>

        <template #tabs>
            <v-tab v-if="showOverviewTab" value="overview">
                {{ $t("overviewLabel") }}
            </v-tab>
            <v-tab value="publications">
                {{ $t("scientificResultsListLabel") }}
            </v-tab>
            <v-tab value="additionalInfo">
                {{ $t("additionalInfoLabel") }}
            </v-tab>
            <v-tab value="contributions">
                {{ $t("boardAndReviewersLabel") }}
            </v-tab>
            <v-tab value="indicators">
                {{ $t("indicatorListLabel") }}
            </v-tab>
            <v-tab v-if="canClassify || (journalClassifications && journalClassifications.length > 0)" value="classifications">
                {{ $t("classificationsLabel") }}
            </v-tab>
            <v-tab v-show="canReviewDataQuality && canAssessDataQuality" value="revisions">
                {{ $t("revisionHistoryLabel") }}
            </v-tab>
            <v-tab v-show="canReviewDataQuality && canAssessDataQuality" value="dataQuality">
                {{ $t("dataQualityLabel") }}
            </v-tab>
        </template>

        <template #default>
            <v-tabs-window-item value="overview">
                <landing-overview-tab
                    v-show="showOverview"
                    :contributions="journal?.contributions"
                    :contribution-types="['EDITOR']"
                    :contributors-label="$t('editorsLabel')"
                    @has-content="onOverviewContent"
                    @see-all="currentTab = $event"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="publications">
                <landing-section-card
                    :title="$t('thisJournalPublicationsLabel')"
                    :count="totalPublications"
                    icon="mdi-file-document-multiple-outline"
                    icon-class="bg-indigo-50 text-indigo-600"
                    padded>
                    <publication-table-component
                        embedded
                        :publications="publications"
                        :total-publications="totalPublications"
                        in-comparator
                        show-publication-concrete-type
                        @switch-page="switchPage" />
                </landing-section-card>
            </v-tabs-window-item>
            <v-tabs-window-item value="additionalInfo">
                <landing-additional-info-tab :show-remark="false">
                    <template #details>
                        <landing-detail-field v-if="journal?.languageIds && journal.languageIds.length > 0" :label="$t('languageLabel')">
                            {{ journal.languageIds.map(id => returnCurrentLocaleContent(languageMap.get(id)?.name)).filter(Boolean).join(', ') }}
                        </landing-detail-field>
                        <landing-detail-field v-if="journal?.openAlexId" label="Open Alex ID">
                            <identifier-link :identifier="journal.openAlexId" type="open_alex" compact />
                        </landing-detail-field>
                        <landing-detail-field v-if="journal?.uris && journal.uris.length > 0" :label="$t('uriInputLabel')">
                            <a
                                v-for="uri in journal.uris"
                                :key="uri"
                                :href="uri"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="underline block"
                            >
                                {{ uri }}
                            </a>
                        </landing-detail-field>
                        <div class="md:col-span-2">
                            <entity-identifiers-list
                                :entity-identifiers="publicationSeriesIdentifiers"
                                :can-edit="canEdit"
                                :entity-id="journal?.id"
                                :containing-entity-type="ApplicableEntityType.PUBLICATION_SERIES"
                                :concrete-entity-type="ApplicableEntityType.JOURNAL"
                                @updated="fetchIdentifiers"
                            />
                        </div>
                    </template>
                </landing-additional-info-tab>
            </v-tabs-window-item>
            <v-tabs-window-item value="contributions">
                <landing-section-card
                    :title="$t('boardAndReviewersLabel')"
                    icon="mdi-account-group"
                    icon-class="bg-indigo-50 text-indigo-600"
                    padded>
                    <person-publication-series-contribution-tabs
                        :contribution-list="journal?.contributions ? journal.contributions : []"
                        :publication-series-id="journal?.id"
                        :read-only="!canEdit"
                        shows-board-and-reviewers
                        :article-collection-series-type="journal?.type"
                        @update="updateContributions"
                    />
                </landing-section-card>
            </v-tabs-window-item>
            <v-tabs-window-item value="indicators">
                <landing-section-card
                    :title="$t('indicatorListLabel')"
                    icon="mdi-chart-box-outline"
                    icon-class="bg-indigo-50 text-indigo-600"
                    padded>
                    <indicators-section
                        :indicators="journalIndicators"
                        :applicable-types="[ApplicableEntityType.PUBLICATION_SERIES]"
                        :entity-id="journal?.id"
                        :entity-type="ApplicableEntityType.PUBLICATION_SERIES"
                        :can-edit="false"
                        show-statistics
                    />
                </landing-section-card>
            </v-tabs-window-item>
            <v-tabs-window-item value="classifications">
                <landing-section-card
                    :title="$t('classificationsLabel')"
                    icon="mdi-certificate-outline"
                    icon-class="bg-indigo-50 text-indigo-600"
                    padded>
                    <entity-classification-view
                        :entity-classifications="journalClassifications"
                        :entity-id="journal?.id"
                        :can-edit="canClassify"
                        :containing-entity-type="ApplicableEntityType.PUBLICATION_SERIES"
                        :applicable-types="[ApplicableEntityType.PUBLICATION_SERIES]"
                        @create="createJournalClassification"
                        @update="fetchClassifications"
                    />
                </landing-section-card>
            </v-tabs-window-item>
            <v-tabs-window-item value="revisions">
                <landing-section-card
                    :title="$t('revisionHistoryLabel')"
                    icon="mdi-history"
                    icon-class="bg-indigo-50 text-indigo-600"
                    padded>
                    <revision-history-table-component
                        :entity-type="EntityType.JOURNAL"
                        :entity-id="journal?.id"
                        @restored="() => fetchJournal(false)"
                        @show-assessment-details="showAssessmentDetails"
                    />
                </landing-section-card>
            </v-tabs-window-item>
            <v-tabs-window-item value="dataQuality">
                <landing-section-card
                    :title="$t('dataQualityLabel')"
                    icon="mdi-shield-check-outline"
                    icon-class="bg-indigo-50 text-indigo-600"
                    padded>
                    <data-quality-tabs-component
                        ref="dataQualityTabsRef"
                        :entity-type="EntityType.JOURNAL"
                        :entity-id="journal?.id"
                    />
                </landing-section-card>
            </v-tabs-window-item>
        </template>

        <template #footer>
            <toast v-model="snackbar" :message="snackbarMessage" />
        </template>
    </landing-page-layout>
</template>

<script lang="ts">

import { ApplicableEntityType, type LanguageResponse } from '@/models/Common';
import { onMounted, nextTick } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { watch } from 'vue';
import PublicationTableComponent from '@/components/publication/PublicationTableComponent.vue';
import type { DocumentPublicationIndex } from '@/models/PublicationModel';
import DocumentPublicationService from "@/services/DocumentPublicationService";
import DataQualityService from '@/services/revision/DataQualityService';
import type { Journal } from '@/models/JournalModel';
import JournalService from '@/services/JournalService';
import LanguageService from '@/services/LanguageService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import PersonPublicationSeriesContributionTabs from '@/components/core/PersonPublicationSeriesContributionTabs.vue';
import type { PersonPublicationSeriesContribution } from '@/models/PublicationSeriesModel';
import { getErrorMessageForErrorKey } from '@/i18n';
import PublicationSeriesUpdateForm from '@/components/publicationSeries/update/PublicationSeriesUpdateForm.vue';
import EntityIndicatorService from '@/services/assessment/EntityIndicatorService';
import type { EntityClassificationResponse, EntityIndicatorResponse, PublicationSeriesAssessmentClassification } from '@/models/AssessmentModel';
import IndicatorsSection from '@/components/assessment/indicators/IndicatorsSection.vue';
import Toast from '@/components/core/Toast.vue';
import EntityClassificationService from '@/services/assessment/EntityClassificationService';
import EntityClassificationView from '@/components/assessment/classifications/EntityClassificationView.vue';
import { useLoginStore } from '@/stores/loginStore';
import StatisticsService from '@/services/StatisticsService';
import IdentifierLink from '@/components/core/IdentifierLink.vue';
import EntityIdentifierService from '@/services/EntityIdentifierService';
import type { EntityIdentifierResponse } from '@/models/IdentifierModel';
import EntityIdentifiersList from '@/components/core/identifiers/EntityIdentifiersList.vue';
import { getArticleCollectionSeriesTypeTitleFromValueAutoLocale } from '@/i18n/articleCollectionSeriesType';
import RevisionHistoryTableComponent from '@/components/core/revisions/RevisionHistoryTableComponent.vue';
import { EntityType } from '@/models/MergeModel';
import { useUserRole } from '@/composables/useUserRole';
import DataQualityTabsComponent from '@/components/core/revisions/DataQualityTabsComponent.vue';
import EntityLandingHeader from '@/components/landing/EntityLandingHeader.vue';
import LandingMetaItem from '@/components/landing/LandingMetaItem.vue';
import LandingDetailField from '@/components/landing/LandingDetailField.vue';
import LandingAdditionalInfoTab from '@/components/landing/LandingAdditionalInfoTab.vue';
import LandingOverviewTab from '@/components/landing/LandingOverviewTab.vue';
import { useLandingOverview } from '@/composables/useLandingOverview';
import LandingPageLayout from '@/components/landing/LandingPageLayout.vue';
import LandingSectionCard from '@/components/landing/LandingSectionCard.vue';

export default defineComponent({
    name: "JournalLandingPage",
    components: { LandingSectionCard, LandingPageLayout, PublicationTableComponent, GenericCrudModal, PersonPublicationSeriesContributionTabs, IndicatorsSection, Toast, EntityClassificationView, IdentifierLink, EntityIdentifiersList, RevisionHistoryTableComponent, DataQualityTabsComponent, EntityLandingHeader, LandingMetaItem, LandingDetailField, LandingAdditionalInfoTab, LandingOverviewTab },
    setup() {
        const { isAdmin, isViceDeanForScience, canReviewDataQuality } = useUserRole();

        const currentTab = ref("overview");

        const dataQualityTabsRef = ref<typeof DataQualityTabsComponent>();

        const showAssessmentDetails = (
            version: { majorVersion: number, minorVersion: number }) => {
            currentTab.value = "dataQuality";

            nextTick(() => dataQualityTabsRef.value?.selectVersion(
                version.majorVersion, version.minorVersion));
        };

        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();

        const journal = ref<Journal>();
        const { showOverview, showOverviewTab, onOverviewContent } = useLandingOverview(
            journal,
            currentTab,
            "publications",
        );
        const languageMap = ref<Map<number, LanguageResponse>>(new Map());

        const publications = ref<DocumentPublicationIndex[]>([]);
        const totalPublications = ref<number>(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const i18n = useI18n();
        const router = useRouter();

        const canEdit = ref(false);
        const canAssessDataQuality = ref(false);
        const canClassify = ref(false);

        const journalIndicators = ref<EntityIndicatorResponse[]>();
        const journalClassifications = ref<EntityClassificationResponse[]>();
        const publicationSeriesIdentifiers = ref<EntityIdentifierResponse[]>([]);

        const loginStore = useLoginStore();

        const updateModalRef = ref<{ dialog: boolean } | null>(null);

        const openModal = (modal: { dialog: boolean } | null) => {
            if (modal) {
                modal.dialog = true;
            }
        };

        onMounted(() => {
            if (loginStore.userLoggedIn) {
                DataQualityService.canAssessDataQuality(
                    EntityType.JOURNAL,
                    parseInt(currentRoute.params.id as string)
                ).then((response) => {
                    canAssessDataQuality.value = response.data;
                });

                JournalService.canEdit(parseInt(currentRoute.params.id as string)).then(response => {
                    canEdit.value = response.data;
                });
                JournalService.canClassify(parseInt(currentRoute.params.id as string)).then(response => {
                    canClassify.value = response.data;
                });
                fetchClassifications();
            
                StatisticsService.registerPublicationSeriesView(parseInt(currentRoute.params.id as string));
            }

            fetchJournal(true);
            fetchIdentifiers();
            fetchIndicators();
        });

        watch(i18n.locale, () => {
            populateData();
        });

        const fetchJournal = (uponStartup: boolean) => {
            JournalService.readJournal(
                parseInt(currentRoute.params.id as string)
            ).then((response) => {
                journal.value = response.data;

                document.title = returnCurrentLocaleContent(journal.value.title) as string;

                journal.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);

                if(uponStartup) {
                    Promise.all([fetchPublications()]).then(() => {
                        setStartTab();
                    });
                }

                populateData();
            }).catch(() => {
                router.push({ name: "notFound" });
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

        const fetchIdentifiers = () => {
            EntityIdentifierService.fetchPublicationSeriesIdentifiers(parseInt(currentRoute.params.id as string)).then(response => {
                publicationSeriesIdentifiers.value = response.data;
            });
        };

        const populateData = () => {
            LanguageService.getAllLanguages().then(response => {
                response.data.forEach(language => {
                    languageMap.value.set(language.id, language);
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
            journal.value!.languageIds = updatedJournal.languageIds;
            journal.value!.openAlexId = updatedJournal.openAlexId;
            journal.value!.uris = updatedJournal.uris;
            journal.value!.subtitle = updatedJournal.subtitle;
            journal.value!.type = updatedJournal.type;

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
            if (currentTab.value !== "dataQuality" && showOverview.value) {
                currentTab.value = "overview";
            }
        };

        const createJournalClassification = (journalClassification: PublicationSeriesAssessmentClassification) => {
            EntityClassificationService.createPublicationSeriesClassification(journalClassification).then(() => {
                fetchClassifications();
            });
        };

        return {
            journal, publications, totalPublications, canAssessDataQuality, canReviewDataQuality,
            switchPage, canEdit, returnCurrentLocaleContent,
            languageMap, updateBasicInfo, canClassify,
            snackbar, snackbarMessage, journalIndicators,
            updateContributions, ApplicableEntityType,
            currentTab, showOverview, showOverviewTab, onOverviewContent, PublicationSeriesUpdateForm,
            journalClassifications, createJournalClassification,
            fetchClassifications, publicationSeriesIdentifiers,
            getArticleCollectionSeriesTypeTitleFromValueAutoLocale,
            fetchIdentifiers, isViceDeanForScience,
            isAdmin, EntityType, fetchJournal,
            dataQualityTabsRef, showAssessmentDetails,
            updateModalRef, openModal
        };
}})

</script>
