<template>
    <div id="journalPublication" class="mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 sm:py-10 lg:py-12">
        <entity-landing-header
            :loading="!journalPublication"
            :subtitle="returnCurrentLocaleContent(journalPublication?.subTitle)"
            :entity-label="$t('journalPublicationLabel')"
            :badge="journalPublication?.journalPublicationType ? getTitleFromValueAutoLocale(journalPublication.journalPublicationType) : ''"
            icon="mdi-newspaper-variant"
            :can-edit="canEdit && !journalPublication?.isArchived"
            :edit-label="$t('updateJournalPublicationLabel')"
            :entity-type="PublicationType.JOURNAL_PUBLICATION"
            :entity-id="journalPublication?.id"
            @edit="openModal(updateModalRef)"
        >
            <template #modals>
                <generic-crud-modal
                    v-if="canEdit && !journalPublication?.isArchived"
                    ref="updateModalRef"
                    hide-activator
                    :form-component="JournalPublicationUpdateForm"
                    :form-props="{ presetJournalPublication: journalPublication }"
                    entity-name="JournalPublication"
                    is-update
                    is-section-update
                    :read-only="!canEdit || journalPublication?.isArchived"
                    @update="updateBasicInfo"
                />
            </template>
            <template #title>
                <rich-title-renderer :title="returnCurrentLocaleContent(journalPublication?.title)" />
            </template>
            <template #visual>
                <v-icon v-if="!journalPublication" size="x-large" class="text-slate-400">mdi-newspaper-variant</v-icon>
                <wordcloud
                    v-else
                    :for-document-id="journalPublication?.id"
                    :document-type="PublicationType.JOURNAL_PUBLICATION"
                    compact-icon
                />
            </template>
            <template #affiliation>
                <p v-if="journalPublication?.journalId" class="text-lg sm:text-xl font-semibold text-slate-600">
                    <localized-link :to="'journals/' + journalPublication.journalId" class="font-medium text-gray-900 underline">
                        {{ returnCurrentLocaleContent(journal?.title) }}
                    </localized-link>
                </p>
            </template>
            <template #meta>
                <landing-meta-item v-if="journalPublication?.documentDate" :label="$t('dateOfPublicationLabel')" icon="mdi-calendar" tone="slate">
                    {{ localiseFlexibleDate(journalPublication.documentDate) }}
                </landing-meta-item>
                <landing-meta-item v-if="journalPublication?.volume" :label="$t('volumeLabel')" icon="mdi-book-open-variant" tone="emerald">
                    {{ journalPublication.volume }}
                </landing-meta-item>
                <landing-meta-item v-if="journalPublication?.issue" :label="$t('issueLabel')" icon="mdi-numeric" tone="amber">
                    {{ journalPublication.issue }}
                </landing-meta-item>
                <landing-meta-item v-if="journalPublication?.doi" label="DOI" abbrev="DOI" tone="blue">
                    <identifier-link :identifier="journalPublication.doi" compact />
                </landing-meta-item>
            </template>
        </entity-landing-header>

        <document-action-box
            ref="actionsRef"
            :doi="journalPublication?.doi"
            :can-edit="canEdit && !journalPublication?.isArchived"
            :could-archive="canEdit"
            :metadata-valid="journalPublication?.isMetadataValid"
            :files-valid="journalPublication?.areFilesValid"
            :document-id="parseInt(currentRoute.params.id as string)"
            :description="returnCurrentLocaleContent(journalPublication?.description)"
            :document="journalPublication"
            :handle-researcher-unbind="handleResearcherUnbind"
            :transfer-to="PublicationType.PROCEEDINGS_PUBLICATION"
            type-transfer-suffix="Proceedings"
            enable-metadata-scanning
            @update="fetchValidationStatus(journalPublication?.id as number, journalPublication as _Document)"
        />

        <tab-content-loader v-if="!journalPublication" layout="sections" />
        <v-tabs
            v-show="journalPublication"
            v-model="currentTab"
            color="deep-purple-accent-4"
            align-tabs="start"
            show-arrows
            class="landing-tabs"
        >
            <v-tab value="contributions">
                {{ $t("contributionsLabel") }}
            </v-tab>
            <v-tab value="documents">
                {{ $t("documentsLabel") }}
            </v-tab>
            <v-tab value="additionalInfo">
                {{ $t("additionalInfoLabel") }}
            </v-tab>
            <v-tab v-show="(documentIndicators && documentIndicators.length > 0) || canClassify" value="indicators">
                {{ $t("indicatorListLabel") }}
            </v-tab>
            <v-tab v-show="(documentClassifications && documentClassifications.length > 0) || canClassify" value="assessments">
                {{ $t("assessmentsLabel") }}
            </v-tab>
            <v-tab v-show="displayConfiguration.shouldDisplayStatisticsTab()" value="visualizations">
                {{ $t("visualizationsLabel") }}
            </v-tab>
            <v-tab v-show="isAdmin" value="revisions">
                {{ $t("revisionHistoryLabel") }}
            </v-tab>
            <v-tab v-show="isAdmin" value="dataQuality">
                {{ $t("dataQualityLabel") }}
            </v-tab>
        </v-tabs>

        <v-tabs-window
            v-show="journalPublication"
            v-model="currentTab"
            class="min-w-0"
        >
            <v-tabs-window-item value="contributions">
                <person-document-contribution-tabs
                    :document-id="journalPublication?.id"
                    :contribution-list="journalPublication?.contributions ? journalPublication?.contributions : []"
                    :read-only="!canEdit || journalPublication?.isArchived"
                    :document-type="PublicationType.JOURNAL_PUBLICATION"
                    :concrete-type="(journalPublication?.journalPublicationType as string)"
                    @update="updateContributions"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="documents">
                <attachment-section
                    :document="journalPublication"
                    :can-edit="canEdit && !journalPublication?.isArchived"
                    :proofs="journalPublication?.proofs"
                    :file-items="journalPublication?.fileItems">
                </attachment-section>
            </v-tabs-window-item>
            <v-tabs-window-item value="additionalInfo">
                <landing-additional-info-tab
                    :keywords="journalPublication?.keywords ? journalPublication.keywords : []"
                    :description="journalPublication?.description"
                    :remark="journalPublication?.remark"
                    :can-edit="canEdit && !journalPublication?.isArchived"
                    :document="journalPublication"
                    :containing-entity-type="ApplicableEntityType.DOCUMENT"
                    :concrete-entity-type="ApplicableEntityType.JOURNAL_PUBLICATION"
                    :document-identifiers="documentIdentifiers"
                    @search-keyword="searchKeyword"
                    @update-keywords="updateKeywords"
                    @update-description="updateDescription"
                    @update-remark="updateRemark"
                    @identifiers-updated="fetchIdentifiers"
                >
                    <template #details>
                        <landing-detail-field v-if="journalPublication?.startPage" :label="$t('startPageLabel')" :value="journalPublication.startPage" />
                        <landing-detail-field v-if="journalPublication?.endPage" :label="$t('endPageLabel')" :value="journalPublication.endPage" />
                        <landing-detail-field v-if="journalPublication?.articleNumber" :label="$t('articleNumberLabel')" :value="journalPublication.articleNumber" />
                        <landing-detail-field v-if="journalPublication?.numberOfPages" :label="$t('numberOfPagesLabel')" :value="journalPublication.numberOfPages" />
                        <landing-detail-field v-if="journalPublication?.section?.length" :label="$t('sectionLabel')">
                            {{ returnCurrentLocaleContent(journalPublication.section) }}
                        </landing-detail-field>
                        <landing-detail-field v-if="journalPublication?.eventId" :label="$t('conferenceLabel')">
                            <localized-link :to="'events/conference/' + journalPublication.eventId" class="underline">
                                {{ returnCurrentLocaleContent(event?.name) }}
                            </localized-link>
                        </landing-detail-field>
                    </template>
                </landing-additional-info-tab>
            </v-tabs-window-item>
            <v-tabs-window-item value="indicators">
                <indicators-section 
                    :indicators="documentIndicators" 
                    :applicable-types="[ApplicableEntityType.DOCUMENT]" 
                    :entity-id="journalPublication?.id" 
                    :entity-type="ApplicableEntityType.DOCUMENT" 
                    :can-edit="canEdit && (isResearcher || isAdmin || isCommission)"
                    show-statistics
                    :has-attached-files="journalPublication?.fileItems && journalPublication?.fileItems.length > 0"
                    @create="createIndicator"
                    @updated="fetchIndicators"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="assessments">
                <v-btn v-if="journalPublication?.documentDate && canEdit" density="compact" class="ml-5" @click="assessJournalPublication">
                    {{ $t("assessPublicationLabel") }}
                </v-btn>
                <entity-classification-view
                    :entity-classifications="documentClassifications"
                    :entity-id="journalPublication?.id"
                    :can-edit="canClassify && !!journalPublication?.documentDate?.year"
                    :containing-entity-type="ApplicableEntityType.DOCUMENT"
                    :applicable-types="[ApplicableEntityType.JOURNAL_PUBLICATION]"
                    @create="createClassification"
                    @update="fetchClassifications"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="visualizations">
                <document-visualizations
                    :document-id="(journalPublication?.id as number)"
                    :display-settings="displayConfiguration.displaySettings.value"
                    :display-statistics-tab="displayConfiguration.shouldDisplayStatisticsTab()"
                />
            </v-tabs-window-item>
            <v-tabs-window-item v-if="isAdmin" value="revisions">
                <revision-history-table-component
                    class="mt-5"
                    :entity-type="PublicationType.JOURNAL_PUBLICATION"
                    :entity-id="journalPublication?.id"
                    @restored="fetchJournalPublication"
                    @show-assessment-details="showAssessmentDetails"
                />
            </v-tabs-window-item>
            <v-tabs-window-item v-if="isAdmin" value="dataQuality">
                <data-quality-tabs-component
                    ref="dataQualityTabsRef"
                    class="mt-5"
                    :entity-type="PublicationType.JOURNAL_PUBLICATION"
                    :entity-id="journalPublication?.id"
                />
            </v-tabs-window-item>
        </v-tabs-window>

        <toast v-model="snackbar" :message="snackbarMessage" />

        <share-buttons
            v-if="journalPublication && isResearcher && canEdit"
            :title="(returnCurrentLocaleContent(journalPublication.title) as string)"
            :document-id="(journalPublication.id as number)"
            :document-type="PublicationType.JOURNAL_PUBLICATION"
        />
    </div>
</template>

<script lang="ts">
import { ApplicableEntityType, type LanguageTagResponse, type MultilingualContent } from '@/models/Common';
import { onMounted, nextTick } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { watch } from 'vue';
import { PublicationType, type Document as _Document, type DocumentPublicationIndex, type PersonDocumentContribution } from '@/models/PublicationModel';
import LanguageService from '@/services/LanguageService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { JournalPublication } from '@/models/PublicationModel';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import PersonDocumentContributionTabs from '@/components/core/PersonDocumentContributionTabs.vue';
import type { Conference } from '@/models/EventModel';
import EventService from '@/services/EventService';
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import { getTitleFromValueAutoLocale } from '@/i18n/journalPublicationType';
import type { Journal } from '@/models/JournalModel';
import JournalService from '@/services/JournalService';
import { localiseFlexibleDate } from '@/utils/DateUtil';
import { getErrorMessageForErrorKey } from '@/i18n';
import AttachmentSection from '@/components/core/AttachmentSection.vue';
import JournalPublicationUpdateForm from '@/components/publication/update/JournalPublicationUpdateForm.vue';
import StatisticsService from '@/services/StatisticsService';
import EntityIndicatorService from '@/services/assessment/EntityIndicatorService';
import { type EntityClassificationResponse, StatisticsType, type EntityIndicatorResponse, type DocumentAssessmentClassification, type DocumentIndicator } from '@/models/AssessmentModel';
import Toast from '@/components/core/Toast.vue';
import EntityClassificationService from '@/services/assessment/EntityClassificationService';
import EntityClassificationView from '@/components/assessment/classifications/EntityClassificationView.vue';
import AssessmentClassificationService from '@/services/assessment/AssessmentClassificationService';
import { useLoginStore } from '@/stores/loginStore';
import RichTitleRenderer from '@/components/core/RichTitleRenderer.vue';
import { useUserRole } from '@/composables/useUserRole';
import Wordcloud from '@/components/core/Wordcloud.vue';
import TabContentLoader from '@/components/core/TabContentLoader.vue';
import IndicatorsSection from '@/components/assessment/indicators/IndicatorsSection.vue';
import { useDocumentAssessmentActions } from '@/composables/useDocumentAssessmentActions';
import DocumentActionBox from '@/components/publication/DocumentActionBox.vue';
import { useTrustConfigurationActions } from '@/composables/useTrustConfigurationActions';
import ShareButtons from '@/components/core/ShareButtons.vue';
import { type AxiosResponseHeaders } from 'axios';
import { injectFairSignposting } from '@/utils/FairSignpostingHeadUtil';
import DocumentVisualizations from '@/components/publication/DocumentVisualizations.vue';
import { useDocumentChartDisplay } from '@/composables/useDocumentChartDisplay';
import type { EntityIdentifierResponse } from '@/models/IdentifierModel';
import EntityIdentifierService from '@/services/EntityIdentifierService';
import { updateCommonBasicInfo } from '@/utils/CommonDocumentFieldsUtil';
import RevisionHistoryTableComponent from '@/components/core/revisions/RevisionHistoryTableComponent.vue';
import DataQualityTabsComponent from '@/components/core/revisions/DataQualityTabsComponent.vue';
import EntityLandingHeader from '@/components/landing/EntityLandingHeader.vue';
import LandingMetaItem from '@/components/landing/LandingMetaItem.vue';
import LandingDetailField from '@/components/landing/LandingDetailField.vue';
import LandingAdditionalInfoTab from '@/components/landing/LandingAdditionalInfoTab.vue';
import IdentifierLink from '@/components/core/IdentifierLink.vue';


export default defineComponent({
    name: "JournalPublicationLandingPage",
    components: { AttachmentSection, PersonDocumentContributionTabs, Toast, LocalizedLink, GenericCrudModal, EntityClassificationView, RichTitleRenderer, Wordcloud, TabContentLoader, IndicatorsSection, DocumentActionBox, ShareButtons, DocumentVisualizations, RevisionHistoryTableComponent, DataQualityTabsComponent, EntityLandingHeader, LandingMetaItem, LandingDetailField, LandingAdditionalInfoTab, IdentifierLink },
    setup() {
        const currentTab = ref("contributions");

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
        const router = useRouter();

        const { isResearcher, isAdmin, isCommission } = useUserRole();
        const canEdit = ref(false);
        const canClassify = ref(false);

        const journalPublication = ref<JournalPublication>();
        const languageTagMap = ref<Map<number, LanguageTagResponse>>(new Map());
        const event = ref<Conference>();
        const journal = ref<Journal>();

        const publications = ref<DocumentPublicationIndex[]>([]);
        const totalPublications = ref<number>(0);

        const i18n = useI18n();

        const documentIndicators = ref<EntityIndicatorResponse[]>();
        const documentClassifications = ref<EntityClassificationResponse[]>();
        const documentIdentifiers = ref<EntityIdentifierResponse[]>([]);

        const loginStore = useLoginStore();

        const actionsRef = ref<typeof DocumentActionBox>();
        const updateModalRef = ref<{ dialog: boolean } | null>(null);

        const openModal = (modal: { dialog: boolean } | null) => {
            if (modal) {
                modal.dialog = true;
            }
        };

        const displayConfiguration = useDocumentChartDisplay(parseInt(currentRoute.params.id as string));

        onMounted(() => {
            fetchDisplayData();
        });

        const fetchDisplayData = () => {
            if (loginStore.userLoggedIn) {
                DocumentPublicationService.canEdit(parseInt(currentRoute.params.id as string)).then((response) => {
                    canEdit.value = response.data;
                }).catch(() => canEdit.value = false);

                EntityClassificationService.canClassifyDocument(parseInt(currentRoute.params.id as string)).then((response) => {
                    canClassify.value = response.data;
                });

                fetchClassifications();
            }

            fetchJournalPublication();
            StatisticsService.registerDocumentView(parseInt(currentRoute.params.id as string));

            fetchIdentifiers();
            fetchIndicators();
        };

        const fetchIndicators = () => {
            EntityIndicatorService.fetchDocumentIndicators(parseInt(currentRoute.params.id as string)).then(response => {
                documentIndicators.value = response.data;
            });
        };

        const fetchClassifications = () => {
            EntityClassificationService.fetchDocumentClassifications(parseInt(currentRoute.params.id as string)).then(response => {
                documentClassifications.value = response.data;
            });
        };

        const fetchIdentifiers = () => {
            EntityIdentifierService.fetchDocumentIdentifiers(
                parseInt(currentRoute.params.id as string)
            ).then(response => {
                documentIdentifiers.value = response.data;
            });
        };

        watch(i18n.locale, () => {
            populateData();
        });

        const fetchJournalPublication = () => {
            DocumentPublicationService.readJournalPublication(
                parseInt(currentRoute.params.id as string)
            ).then((response) => {
                journalPublication.value = response.data;

                injectFairSignposting(response.headers as AxiosResponseHeaders);

                document.title = returnCurrentLocaleContent(journalPublication.value.title) as string;

                journalPublication.value?.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);

                if(journalPublication.value.eventId) {
                    EventService.readConference(journalPublication.value.eventId).then((eventResponse) => {
                        event.value = eventResponse.data;
                    })
                }

                JournalService.readJournal(journalPublication.value.journalId).then(response => {
                    journal.value = response.data;
                });
    
                populateData();
            }).catch(() => {
                router.push({ name: "notFound" });
            });
        };

        const populateData = () => {
            LanguageService.getAllLanguageTags().then(response => {
                response.data.forEach(languageTag => {
                    languageTagMap.value.set(languageTag.id, languageTag);
                })
            });
            actionsRef.value?.fetchCitations();
        };

        const searchKeyword = (keyword: string) => {
            router.push({name:"advancedSearch", query: { searchQuery: keyword.trim(), tab: "publications", search: "simple" }});
        };

        const updateKeywords = (keywords: MultilingualContent[]) => {
            journalPublication.value!.keywords = keywords;
            performUpdate(false);
        };

        const updateDescription = (description: MultilingualContent[]) => {
            journalPublication.value!.description = description;
            performUpdate(false);
        };

        const updateContributions = (contributions: PersonDocumentContribution[]) => {
            journalPublication.value!.contributions = contributions;
            performUpdate(true);
        };

        const updateBasicInfo = (basicInfo: JournalPublication) => {
            journalPublication.value!.journalId = basicInfo.journalId;
            journalPublication.value!.startPage = basicInfo.startPage;
            journalPublication.value!.endPage = basicInfo.endPage;
            journalPublication.value!.volume = basicInfo.volume;
            journalPublication.value!.issue = basicInfo.issue;
            journalPublication.value!.numberOfPages = basicInfo.numberOfPages;
            journalPublication.value!.articleNumber = basicInfo.articleNumber;
            journalPublication.value!.journalPublicationType = basicInfo.journalPublicationType;
            journalPublication.value!.section = basicInfo.section;

            updateCommonBasicInfo(journalPublication, basicInfo);

            performUpdate(true);
        };

        const performUpdate = (reload: boolean) => {
            DocumentPublicationService.updateJournalPublication(journalPublication.value?.id as number, journalPublication.value as JournalPublication).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                if(reload) {
                    fetchJournalPublication();
                }
            }).catch((error) => {
                snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
                if(reload) {
                    fetchJournalPublication();
                }
            });
        };

        const handleResearcherUnbind = () => {
            snackbarMessage.value = i18n.t("unbindSuccessfullMessage");
            snackbar.value = true;
            fetchDisplayData();
        };

        const assessJournalPublication = () => {
            AssessmentClassificationService.assessJournalPublication(parseInt(currentRoute.params.id as string)).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                fetchClassifications();
            });
        };

        const {createDocumentClassification, createDocumentIndicator} = useDocumentAssessmentActions();
        
        const createClassification = (documentClassification: DocumentAssessmentClassification) => {
            createDocumentClassification(documentClassification, () => fetchClassifications())
        };

        const createIndicator = (documentIndicator: {indicator: DocumentIndicator, files: File[]}) => {
            createDocumentIndicator(documentIndicator, () => fetchIndicators());
        };

        const { fetchValidationStatus } = useTrustConfigurationActions();

        const updateRemark = (remark: MultilingualContent[]) => {
            journalPublication.value!.remark = remark;
            performUpdate(true);
        };

        return {
            journalPublication, canClassify, fetchJournalPublication,
            publications, event, totalPublications, isResearcher,
            returnCurrentLocaleContent, handleResearcherUnbind, actionsRef,
            languageTagMap, journal, JournalPublicationUpdateForm,
            StatisticsType, documentIndicators, currentTab, createIndicator,
            searchKeyword, canEdit, fetchIndicators,
            updateKeywords, updateDescription, snackbar, snackbarMessage,
            updateContributions, updateBasicInfo, getTitleFromValueAutoLocale,
            ApplicableEntityType, documentClassifications, assessJournalPublication,
            createClassification, fetchClassifications, currentRoute, isAdmin, isCommission,
            fetchValidationStatus, PublicationType, updateRemark, displayConfiguration,
            documentIdentifiers, fetchIdentifiers, localiseFlexibleDate,
            dataQualityTabsRef, showAssessmentDetails, updateModalRef, openModal
        };
}})

</script>
