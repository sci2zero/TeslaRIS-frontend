<template>
    <div id="monographPublication" class="mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 sm:py-10 lg:py-12">
        <entity-landing-header
            :loading="!monographPublication"
            :subtitle="returnCurrentLocaleContent(monographPublication?.subTitle)"
            :entity-label="$t('monographPublicationLabel')"
            :badge="monographPublication?.monographPublicationType ? getTitleFromValueAutoLocale(monographPublication.monographPublicationType) : ''"
            icon="mdi-newspaper-variant"
            :can-edit="canEdit && !monographPublication?.isArchived"
            :edit-label="$t('updateMonographPublicationLabel')"
            :entity-type="PublicationType.MONOGRAPH_PUBLICATION"
            :entity-id="monographPublication?.id"
            @edit="openModal(updateModalRef)"
        >
            <template #modals>
                <generic-crud-modal
                    v-if="canEdit && !monographPublication?.isArchived"
                    ref="updateModalRef"
                    hide-activator
                    :form-component="MonographPublicationUpdateForm"
                    :form-props="{ presetMonographPublication: monographPublication}"
                    entity-name="MonographPublication"
                    is-update
                    is-section-update
                    :read-only="!canEdit || monographPublication?.isArchived"
                    @update="updateBasicInfo"
                />
            </template>
            <template #title>
                <rich-title-renderer :title="returnCurrentLocaleContent(monographPublication?.title)" />
            </template>
            <template #visual>
                <v-icon v-if="!monographPublication" size="x-large" class="text-slate-400">mdi-newspaper-variant</v-icon>
                <wordcloud
                    v-else
                    :for-document-id="monographPublication?.id"
                    :document-type="PublicationType.MONOGRAPH_PUBLICATION"
                    compact-icon
                />
            </template>
            <template #affiliation>
                <p v-if="monographPublication?.monographId" class="text-lg sm:text-xl font-semibold text-slate-600">
                    <localized-link :to="'scientific-results/monograph/' + monographPublication.monographId" class="font-medium text-gray-900 underline">
                        {{ returnCurrentLocaleContent(monographPublication?.monographName) }}
                    </localized-link>
                </p>
            </template>
            <template #meta>
                <landing-meta-item v-if="monographPublication?.documentDate" :label="$t('dateOfPublicationLabel')" icon="mdi-calendar" tone="slate">
                    {{ localiseFlexibleDate(monographPublication.documentDate) }}
                </landing-meta-item>
                <landing-meta-item v-if="monographPublication?.doi" label="DOI" abbrev="DOI" tone="blue">
                    <identifier-link :identifier="monographPublication.doi" compact />
                </landing-meta-item>
            </template>
        </entity-landing-header>

        <document-action-box
            ref="actionsRef"
            :doi="monographPublication?.doi"
            :can-edit="canEdit && !monographPublication?.isArchived"
            :could-archive="canEdit"
            :metadata-valid="monographPublication?.isMetadataValid"
            :files-valid="monographPublication?.areFilesValid"
            :document-id="parseInt(currentRoute.params.id as string)"
            :description="returnCurrentLocaleContent(monographPublication?.description)"
            :document="monographPublication"
            :handle-researcher-unbind="handleResearcherUnbind"
            @update="fetchValidationStatus(monographPublication?.id as number, monographPublication as _Document)"
        />

        <tab-content-loader v-if="!monographPublication" layout="sections" />
        <v-tabs
            v-show="monographPublication"
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
            v-show="monographPublication"
            v-model="currentTab"
            class="min-w-0"
        >
            <v-tabs-window-item value="contributions">
                <person-document-contribution-tabs
                    :document-id="monographPublication?.id"
                    :contribution-list="monographPublication?.contributions ? monographPublication?.contributions : []"
                    :read-only="!canEdit || monographPublication?.isArchived"
                    :document-type="PublicationType.MONOGRAPH_PUBLICATION"
                    :concrete-type="(monographPublication?.monographPublicationType as string)"
                    @update="updateContributions"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="documents">
                <attachment-section
                    :document="monographPublication"
                    :can-edit="canEdit && !monographPublication?.isArchived"
                    :proofs="monographPublication?.proofs"
                    :file-items="monographPublication?.fileItems">
                </attachment-section>
            </v-tabs-window-item>
            <v-tabs-window-item value="additionalInfo">
                <landing-additional-info-tab
                    :keywords="monographPublication?.keywords ? monographPublication.keywords : []"
                    :description="monographPublication?.description"
                    :remark="monographPublication?.remark"
                    :can-edit="canEdit && !monographPublication?.isArchived"
                    :document="monographPublication"
                    :containing-entity-type="ApplicableEntityType.DOCUMENT"
                    :concrete-entity-type="ApplicableEntityType.MONOGRAPH_PUBLICATION"
                    :document-identifiers="documentIdentifiers"
                    @search-keyword="searchKeyword"
                    @update-keywords="updateKeywords"
                    @update-description="updateDescription"
                    @update-remark="updateRemark"
                    @identifiers-updated="fetchIdentifiers"
                >
                    <template #details>
                        <landing-detail-field v-if="monographPublication?.startPage" :label="$t('startPageLabel')" :value="monographPublication.startPage" />
                        <landing-detail-field v-if="monographPublication?.endPage" :label="$t('endPageLabel')" :value="monographPublication.endPage" />
                        <landing-detail-field v-if="monographPublication?.articleNumber" :label="$t('articleNumberLabel')" :value="monographPublication.articleNumber" />
                        <landing-detail-field v-if="monographPublication?.numberOfPages" :label="$t('numberOfPagesLabel')" :value="monographPublication.numberOfPages" />
                        <landing-detail-field v-if="monographPublication?.section?.length" :label="$t('sectionLabel')">
                            {{ returnCurrentLocaleContent(monographPublication.section) }}
                        </landing-detail-field>
                        <landing-detail-field v-if="monographPublication?.eventId" :label="$t('conferenceLabel')">
                            <localized-link :to="'events/conference/' + monographPublication.eventId" class="underline">
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
                    :entity-id="monographPublication?.id" 
                    :entity-type="ApplicableEntityType.DOCUMENT" 
                    :can-edit="canEdit && (isResearcher || isAdmin || isCommission)"
                    show-statistics
                    :has-attached-files="monographPublication?.fileItems && monographPublication?.fileItems.length > 0"
                    @create="createIndicator"
                    @updated="fetchIndicators"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="assessments">
                <entity-classification-view
                    :entity-classifications="documentClassifications"
                    :entity-id="monographPublication?.id"
                    :can-edit="canClassify && !!monographPublication?.documentDate?.year"
                    :containing-entity-type="ApplicableEntityType.DOCUMENT"
                    :applicable-types="[ApplicableEntityType.MONOGRAPH_PUBLICATION]"
                    @create="createClassification"
                    @update="fetchClassifications"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="visualizations">
                <document-visualizations
                    :document-id="(monographPublication?.id as number)"
                    :display-settings="displayConfiguration.displaySettings.value"
                    :display-statistics-tab="displayConfiguration.shouldDisplayStatisticsTab()"
                />
            </v-tabs-window-item>
            <v-tabs-window-item v-if="isAdmin" value="revisions">
                <revision-history-table-component
                    class="mt-5"
                    :entity-type="PublicationType.MONOGRAPH_PUBLICATION"
                    :entity-id="monographPublication?.id"
                    @restored="fetchMonographPublication"
                    @show-assessment-details="showAssessmentDetails"
                />
            </v-tabs-window-item>
            <v-tabs-window-item v-if="isAdmin" value="dataQuality">
                <data-quality-tabs-component
                    ref="dataQualityTabsRef"
                    class="mt-5"
                    :entity-type="PublicationType.MONOGRAPH_PUBLICATION"
                    :entity-id="monographPublication?.id"
                />
            </v-tabs-window-item>
        </v-tabs-window>

        <toast v-model="snackbar" :message="snackbarMessage" />

        <share-buttons
            v-if="monographPublication && isResearcher && canEdit"
            :title="(returnCurrentLocaleContent(monographPublication.title) as string)"
            :document-id="(monographPublication.id as number)"
            :document-type="PublicationType.MONOGRAPH_PUBLICATION"
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
import type { MonographPublication } from '@/models/PublicationModel';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import PersonDocumentContributionTabs from '@/components/core/PersonDocumentContributionTabs.vue';
import type { Conference } from '@/models/EventModel';
import EventService from '@/services/EventService';
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import { getTitleFromValueAutoLocale } from '@/i18n/monographPublicationType';
import { localiseFlexibleDate } from '@/utils/DateUtil';
import AttachmentSection from '@/components/core/AttachmentSection.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import MonographPublicationUpdateForm from '@/components/publication/update/MonographPublicationUpdateForm.vue';
import StatisticsService from '@/services/StatisticsService';
import { type DocumentAssessmentClassification, type DocumentIndicator, type EntityClassificationResponse, type EntityIndicatorResponse, StatisticsType } from '@/models/AssessmentModel';
import EntityIndicatorService from '@/services/assessment/EntityIndicatorService';
import Toast from '@/components/core/Toast.vue';
import { useLoginStore } from '@/stores/loginStore';
import EntityClassificationService from '@/services/assessment/EntityClassificationService';
import EntityClassificationView from '@/components/assessment/classifications/EntityClassificationView.vue';
import IndicatorsSection from '@/components/assessment/indicators/IndicatorsSection.vue';
import RichTitleRenderer from '@/components/core/RichTitleRenderer.vue';
import { useUserRole } from '@/composables/useUserRole';
import Wordcloud from '@/components/core/Wordcloud.vue';
import TabContentLoader from '@/components/core/TabContentLoader.vue';
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
    name: "MonographPublicationLandingPage",
    components: { AttachmentSection, PersonDocumentContributionTabs, Toast, LocalizedLink, GenericCrudModal, EntityClassificationView, IndicatorsSection, RichTitleRenderer, Wordcloud, TabContentLoader, DocumentActionBox, ShareButtons, DocumentVisualizations, RevisionHistoryTableComponent, DataQualityTabsComponent, EntityLandingHeader, LandingMetaItem, LandingDetailField, LandingAdditionalInfoTab, IdentifierLink },
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

        const monographPublication = ref<MonographPublication>();
        const languageTagMap = ref<Map<number, LanguageTagResponse>>(new Map());
        const event = ref<Conference>();

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

            fetchMonographPublication();
            fetchIdentifiers();
            StatisticsService.registerDocumentView(parseInt(currentRoute.params.id as string));
            fetchIndicators();
        };

        watch(i18n.locale, () => {
            populateData();
        });

        const fetchMonographPublication = () => {
            DocumentPublicationService.readMonographPublication(
                parseInt(currentRoute.params.id as string)
            ).then((response) => {
                monographPublication.value = response.data;

                injectFairSignposting(response.headers as AxiosResponseHeaders);

                document.title = returnCurrentLocaleContent(monographPublication.value.title) as string;

                monographPublication.value?.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);

                if(monographPublication.value.eventId) {
                    EventService.readConference(monographPublication.value.eventId).then((eventResponse) => {
                        event.value = eventResponse.data;
                    })
                }
    
                populateData();
            }).catch(() => {
                router.push({ name: "notFound" });
            });
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
            monographPublication.value!.keywords = keywords;
            performUpdate(false);
        };

        const updateDescription = (description: MultilingualContent[]) => {
            monographPublication.value!.description = description;
            performUpdate(false);
        };

        const updateContributions = (contributions: PersonDocumentContribution[]) => {
            monographPublication.value!.contributions = contributions;
            performUpdate(true);
        };

        const updateBasicInfo = (basicInfo: MonographPublication) => {
            monographPublication.value!.monographId = basicInfo.monographId;
            monographPublication.value!.startPage = basicInfo.startPage;
            monographPublication.value!.endPage = basicInfo.endPage;
            monographPublication.value!.numberOfPages = basicInfo.numberOfPages;
            monographPublication.value!.articleNumber = basicInfo.articleNumber;
            monographPublication.value!.monographPublicationType = basicInfo.monographPublicationType;
            monographPublication.value!.section = basicInfo.section;

            updateCommonBasicInfo(monographPublication, basicInfo);

            performUpdate(true);
        };

        const performUpdate = (reload: boolean) => {
            DocumentPublicationService.updateMonographPublication(monographPublication.value?.id as number, monographPublication.value as MonographPublication).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                if(reload) {
                    fetchMonographPublication();
                }
            }).catch((error) => {
                snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
                if(reload) {
                    fetchMonographPublication();
                }
            });
        };

        const handleResearcherUnbind = () => {
            snackbarMessage.value = i18n.t("unbindSuccessfullMessage");
            snackbar.value = true;
            fetchDisplayData();
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
            monographPublication.value!.remark = remark;
            performUpdate(true);
        };

        return {
            monographPublication, publications, event, totalPublications,
            returnCurrentLocaleContent, handleResearcherUnbind,
            languageTagMap, MonographPublicationUpdateForm,
            searchKeyword, canEdit, isResearcher,
            updateKeywords, updateDescription, snackbar, snackbarMessage,
            updateContributions, updateBasicInfo, getTitleFromValueAutoLocale,
            documentIndicators, StatisticsType, currentTab, currentRoute,
            ApplicableEntityType, canClassify, documentClassifications,
            fetchClassifications, createClassification, fetchIndicators,
            createIndicator, actionsRef, fetchValidationStatus, PublicationType,
            updateRemark, displayConfiguration, isAdmin, isCommission,
            fetchIdentifiers, documentIdentifiers, localiseFlexibleDate,
            fetchMonographPublication,
            dataQualityTabsRef, showAssessmentDetails, updateModalRef, openModal
        };
}})

</script>
