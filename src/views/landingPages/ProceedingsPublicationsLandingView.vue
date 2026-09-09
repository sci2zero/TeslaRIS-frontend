<template>
    <div id="proceedingsPublication" class="mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 sm:py-10 lg:py-12">
        <entity-landing-header
            :loading="!proceedingsPublication"
            :subtitle="returnCurrentLocaleContent(proceedingsPublication?.subTitle)"
            :entity-label="$t('proceedingsPublicationLabel')"
            :badge="proceedingsPublication?.proceedingsPublicationType ? getTitleFromValueAutoLocale(proceedingsPublication.proceedingsPublicationType) : ''"
            icon="mdi-newspaper-variant"
            :can-edit="canEdit && !proceedingsPublication?.isArchived"
            :edit-label="$t('updateProceedingsPublicationLabel')"
            :entity-type="PublicationType.PROCEEDINGS_PUBLICATION"
            :entity-id="proceedingsPublication?.id"
            @edit="openModal(updateModalRef)"
        >
            <template #modals>
                <generic-crud-modal
                    v-if="canEdit && !proceedingsPublication?.isArchived"
                    ref="updateModalRef"
                    hide-activator
                    :form-component="ProceedingsPublicationUpdateForm"
                    :form-props="{ presetProceedingsPublication: proceedingsPublication}"
                    entity-name="ProceedingsPublication"
                    is-update
                    is-section-update
                    :read-only="!canEdit || proceedingsPublication?.isArchived"
                    @update="updateBasicInfo"
                />
            </template>
            <template #title>
                <rich-title-renderer :title="returnCurrentLocaleContent(proceedingsPublication?.title)" />
            </template>
            <template #visual>
                <v-icon v-if="!proceedingsPublication" size="x-large" class="text-slate-400">mdi-newspaper-variant</v-icon>
                <wordcloud
                    v-else
                    :for-document-id="proceedingsPublication?.id"
                    :document-type="PublicationType.PROCEEDINGS_PUBLICATION"
                    compact-icon
                />
            </template>
            <template #affiliation>
                <p v-if="proceedingsPublication?.proceedingsId" class="text-lg sm:text-xl font-semibold text-slate-600">
                    <localized-link :to="'proceedings/' + proceedingsPublication.proceedingsId" class="font-medium text-gray-900 underline">
                        {{ returnCurrentLocaleContent(proceedings?.title) }}
                    </localized-link>
                </p>
                <p v-if="proceedingsPublication?.eventId" class="text-base sm:text-lg text-slate-600">
                    <localized-link :to="'events/conference/' + proceedingsPublication.eventId" class="font-medium text-gray-900 underline">
                        {{ returnCurrentLocaleContent(event?.name) }}
                    </localized-link>
                </p>
            </template>
            <template #meta>
                <landing-meta-item v-if="proceedingsPublication?.documentDate" :label="$t('dateOfPublicationLabel')" icon="mdi-calendar" tone="slate">
                    {{ localiseFlexibleDate(proceedingsPublication.documentDate) }}
                </landing-meta-item>
                <landing-meta-item v-if="proceedingsPublication?.doi" label="DOI" abbrev="DOI" tone="blue">
                    <identifier-link :identifier="proceedingsPublication.doi" compact />
                </landing-meta-item>
            </template>
        </entity-landing-header>

        <document-action-box
            ref="actionsRef"
            :doi="proceedingsPublication?.doi"
            :can-edit="canEdit && !proceedingsPublication?.isArchived"
            :could-archive="canEdit"
            :metadata-valid="proceedingsPublication?.isMetadataValid"
            :files-valid="proceedingsPublication?.areFilesValid"
            :document-id="parseInt(currentRoute.params.id as string)"
            :description="returnCurrentLocaleContent(proceedingsPublication?.description)"
            :document="proceedingsPublication"
            :handle-researcher-unbind="handleResearcherUnbind"
            :transfer-to="PublicationType.JOURNAL_PUBLICATION"
            type-transfer-suffix="Journal"
            @update="fetchValidationStatus(proceedingsPublication?.id as number, proceedingsPublication as _Document)"
        />

        <tab-content-loader v-if="!proceedingsPublication" layout="list" />
        <v-tabs
            v-show="proceedingsPublication"
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
            <v-tab v-show="documentIndicators && documentIndicators.length > 0" value="indicators">
                {{ $t("indicatorListLabel") }}
            </v-tab>
            <v-tab v-show="(documentClassifications && documentClassifications.length > 0) || canEdit" value="assessments">
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
            v-show="proceedingsPublication"
            v-model="currentTab"
            class="min-w-0"
        >
            <v-tabs-window-item value="contributions">
                <person-document-contribution-tabs
                    :document-id="proceedingsPublication?.id"
                    :contribution-list="proceedingsPublication?.contributions ? proceedingsPublication?.contributions : []"
                    :read-only="!canEdit || proceedingsPublication?.isArchived"
                    :document-type="PublicationType.PROCEEDINGS_PUBLICATION"
                    :concrete-type="(proceedingsPublication?.proceedingsPublicationType as string)"
                    @update="updateContributions"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="documents">
                <attachment-section
                    :document="proceedingsPublication"
                    :can-edit="canEdit && !proceedingsPublication?.isArchived"
                    :proofs="proceedingsPublication?.proofs"
                    :file-items="proceedingsPublication?.fileItems">
                </attachment-section>  
            </v-tabs-window-item>
            <v-tabs-window-item value="additionalInfo">
                <landing-additional-info-tab
                    :keywords="proceedingsPublication?.keywords ? proceedingsPublication.keywords : []"
                    :description="proceedingsPublication?.description"
                    :remark="proceedingsPublication?.remark"
                    :can-edit="canEdit && !proceedingsPublication?.isArchived"
                    :document="proceedingsPublication"
                    :containing-entity-type="ApplicableEntityType.DOCUMENT"
                    :concrete-entity-type="ApplicableEntityType.PROCEEDINGS_PUBLICATION"
                    :document-identifiers="documentIdentifiers"
                    @search-keyword="searchKeyword"
                    @update-keywords="updateKeywords"
                    @update-description="updateDescription"
                    @update-remark="updateRemark"
                    @identifiers-updated="fetchIdentifiers"
                >
                    <template #details>
                        <landing-detail-field v-if="proceedingsPublication?.startPage" :label="$t('startPageLabel')" :value="proceedingsPublication.startPage" />
                        <landing-detail-field v-if="proceedingsPublication?.endPage" :label="$t('endPageLabel')" :value="proceedingsPublication.endPage" />
                        <landing-detail-field v-if="proceedingsPublication?.articleNumber" :label="$t('articleNumberLabel')" :value="proceedingsPublication.articleNumber" />
                        <landing-detail-field v-if="proceedingsPublication?.numberOfPages" :label="$t('numberOfPagesLabel')" :value="proceedingsPublication.numberOfPages" />
                        <landing-detail-field v-if="proceedingsPublication?.section?.length" :label="$t('sectionLabel')">
                            {{ returnCurrentLocaleContent(proceedingsPublication.section) }}
                        </landing-detail-field>
                    </template>
                </landing-additional-info-tab>
            </v-tabs-window-item>
            <v-tabs-window-item value="indicators">
                <indicators-section 
                    :indicators="documentIndicators" 
                    :applicable-types="[ApplicableEntityType.DOCUMENT]" 
                    :entity-id="proceedingsPublication?.id" 
                    :entity-type="ApplicableEntityType.DOCUMENT" 
                    :can-edit="canEdit && (isResearcher || isAdmin || isCommission)"
                    show-statistics
                    :has-attached-files="proceedingsPublication?.fileItems && proceedingsPublication?.fileItems.length > 0"
                    @create="createIndicator"
                    @updated="fetchIndicators"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="assessments">
                <v-btn v-if="proceedingsPublication?.documentDate" density="compact" class="ml-5" @click="assessProceedingsPublication">
                    {{ $t("assessPublicationLabel") }}
                </v-btn>
                <entity-classification-view
                    :entity-classifications="documentClassifications"
                    :entity-id="proceedingsPublication?.id"
                    :can-edit="canClassify && !!proceedingsPublication?.documentDate?.year"
                    :containing-entity-type="ApplicableEntityType.DOCUMENT"
                    :applicable-types="[ApplicableEntityType.PROCEEDINGS_PUBLICATION]"
                    @create="createClassification"
                    @update="fetchClassifications"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="visualizations">
                <document-visualizations
                    :document-id="(proceedingsPublication?.id as number)"
                    :display-settings="displayConfiguration.displaySettings.value"
                    :display-statistics-tab="displayConfiguration.shouldDisplayStatisticsTab()"
                />
            </v-tabs-window-item>
            <v-tabs-window-item v-if="isAdmin" value="revisions">
                <revision-history-table-component
                    class="mt-5"
                    :entity-type="PublicationType.PROCEEDINGS_PUBLICATION"
                    :entity-id="proceedingsPublication?.id"
                    @restored="fetchProceedingsPublication"
                    @show-assessment-details="showAssessmentDetails"
                />
            </v-tabs-window-item>
            <v-tabs-window-item v-if="isAdmin" value="dataQuality">
                <data-quality-tabs-component
                    ref="dataQualityTabsRef"
                    class="mt-5"
                    :entity-type="PublicationType.PROCEEDINGS_PUBLICATION"
                    :entity-id="proceedingsPublication?.id"
                />
            </v-tabs-window-item>
        </v-tabs-window>

        <toast v-model="snackbar" :message="snackbarMessage" />

        <share-buttons
            v-if="proceedingsPublication && isResearcher && canEdit"
            :title="(returnCurrentLocaleContent(proceedingsPublication.title) as string)"
            :document-id="(proceedingsPublication.id as number)"
            :document-type="PublicationType.PROCEEDINGS_PUBLICATION"
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
import type { ProceedingsPublication } from '@/models/PublicationModel';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import PersonDocumentContributionTabs from '@/components/core/PersonDocumentContributionTabs.vue';
import type { Conference } from '@/models/EventModel';
import EventService from '@/services/EventService';
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import type { ProceedingsResponse } from '@/models/ProceedingsModel';
import ProceedingsService from '@/services/ProceedingsService';
import { getTitleFromValueAutoLocale } from "@/i18n/proceedingsPublicationType";
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import { localiseFlexibleDate } from '@/utils/DateUtil';
import { getErrorMessageForErrorKey } from '@/i18n';
import AttachmentSection from '@/components/core/AttachmentSection.vue';
import ProceedingsPublicationUpdateForm from '@/components/publication/update/ProceedingsPublicationUpdateForm.vue';
import StatisticsService from '@/services/StatisticsService';
import EntityIndicatorService from '@/services/assessment/EntityIndicatorService';
import { type DocumentAssessmentClassification, type DocumentIndicator, type EntityClassificationResponse, type EntityIndicatorResponse, StatisticsType } from '@/models/AssessmentModel';
import Toast from '@/components/core/Toast.vue';
import { useLoginStore } from '@/stores/loginStore';
import EntityClassificationService from '@/services/assessment/EntityClassificationService';
import EntityClassificationView from '@/components/assessment/classifications/EntityClassificationView.vue';
import AssessmentClassificationService from '@/services/assessment/AssessmentClassificationService';
import RichTitleRenderer from '@/components/core/RichTitleRenderer.vue';
import { useUserRole } from '@/composables/useUserRole';
import Wordcloud from '@/components/core/Wordcloud.vue';
import TabContentLoader from '@/components/core/TabContentLoader.vue';
import { useDocumentAssessmentActions } from '@/composables/useDocumentAssessmentActions';
import IndicatorsSection from '@/components/assessment/indicators/IndicatorsSection.vue';
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
    name: "ProceedingsPublicationLandingPage",
    components: { AttachmentSection, PersonDocumentContributionTabs, Toast, LocalizedLink, GenericCrudModal, EntityClassificationView, RichTitleRenderer, Wordcloud, TabContentLoader, DocumentActionBox, IndicatorsSection, ShareButtons, DocumentVisualizations, RevisionHistoryTableComponent, DataQualityTabsComponent, EntityLandingHeader, LandingMetaItem, LandingDetailField, LandingAdditionalInfoTab, IdentifierLink },
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

        const proceedingsPublication = ref<ProceedingsPublication>();
        const languageTagMap = ref<Map<number, LanguageTagResponse>>(new Map());
        
        const event = ref<Conference>();
        const proceedings = ref<ProceedingsResponse>();

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

            fetchProceedingsPublication();
            fetchIdentifiers();
            StatisticsService.registerDocumentView(parseInt(currentRoute.params.id as string));
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

        const fetchProceedingsPublication = () => {
            DocumentPublicationService.readProceedingsPublication(
                parseInt(currentRoute.params.id as string)
            ).then((response) => {
                proceedingsPublication.value = response.data;

                injectFairSignposting(response.headers as AxiosResponseHeaders);

                document.title = returnCurrentLocaleContent(proceedingsPublication.value.title) as string;

                proceedingsPublication.value?.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);

                EventService.readConference(proceedingsPublication.value.eventId as number).then((eventResponse) => {
                    event.value = eventResponse.data;
                });

                ProceedingsService.readProceedings(proceedingsPublication.value.proceedingsId as number).then((eventResponse) => {
                    proceedings.value = eventResponse.data;
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
            proceedingsPublication.value!.keywords = keywords;
            performUpdate(false);
        };

        const updateDescription = (description: MultilingualContent[]) => {
            proceedingsPublication.value!.description = description;
            performUpdate(false);
        };

        const updateContributions = (contributions: PersonDocumentContribution[]) => {
            proceedingsPublication.value!.contributions = contributions;
            performUpdate(true);
        };

        const updateBasicInfo = (basicInfo: ProceedingsPublication) => {
            proceedingsPublication.value!.proceedingsId = basicInfo.proceedingsId;
            proceedingsPublication.value!.startPage = basicInfo.startPage;
            proceedingsPublication.value!.endPage = basicInfo.endPage;
            proceedingsPublication.value!.numberOfPages = basicInfo.numberOfPages;
            proceedingsPublication.value!.articleNumber = basicInfo.articleNumber;
            proceedingsPublication.value!.proceedingsPublicationType = basicInfo.proceedingsPublicationType;
            proceedingsPublication.value!.section = basicInfo.section;

            updateCommonBasicInfo(proceedingsPublication, basicInfo);

            performUpdate(true);
        };

        const performUpdate = (reload: boolean) => {
            DocumentPublicationService.updateProceedingsPublication(proceedingsPublication.value?.id as number, proceedingsPublication.value as ProceedingsPublication).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                if(reload) {
                    fetchProceedingsPublication();
                }
            }).catch((error) => {
                snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
                if(reload) {
                    fetchProceedingsPublication();
                }
            });
        };

        const handleResearcherUnbind = () => {
            snackbarMessage.value = i18n.t("unbindSuccessfullMessage");
            snackbar.value = true;
            fetchDisplayData();
        };

        const assessProceedingsPublication = () => {
            AssessmentClassificationService.assessProceedingsPublication(parseInt(currentRoute.params.id as string)).then(() => {
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
            proceedingsPublication.value!.remark = remark;
            performUpdate(true);
        };

        return {
            proceedingsPublication, publications, event, displayConfiguration,
            totalPublications, returnCurrentLocaleContent, isResearcher,
            languageTagMap, ProceedingsPublicationUpdateForm,
            searchKeyword, canEdit, proceedings, getTitleFromValueAutoLocale,
            updateKeywords, updateDescription, snackbar, snackbarMessage,
            updateContributions, updateBasicInfo, handleResearcherUnbind,
            StatisticsType, documentIndicators, currentTab, ApplicableEntityType,
            documentClassifications, assessProceedingsPublication,
            fetchClassifications, canClassify, createClassification,
            currentRoute, actionsRef, fetchIndicators, createIndicator,
            fetchValidationStatus, PublicationType, updateRemark, isAdmin,
            isCommission, fetchIdentifiers, documentIdentifiers,
            localiseFlexibleDate,
            fetchProceedingsPublication,
            dataQualityTabsRef, showAssessmentDetails, updateModalRef, openModal
        };
}})

</script>
