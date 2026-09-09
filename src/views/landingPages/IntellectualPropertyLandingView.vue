<template>
    <div id="intellectualProperty" class="mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 sm:py-10 lg:py-12">
        <entity-landing-header
            :loading="!intellectualProperty"
            :subtitle="returnCurrentLocaleContent(intellectualProperty?.subTitle)"
            :entity-label="$t('intellectualPropertyLabel')"
            :badge="intellectualProperty?.type ? getIntellectualPropertyTypeTitleFromValueAutoLocale(intellectualProperty.type) : ''"
            icon="mdi-seal-variant"
            :can-edit="canEdit && !intellectualProperty?.isArchived"
            :edit-label="$t('updateLabel')"
            :entity-type="PublicationType.INTELLECTUAL_PROPERTY"
            :entity-id="intellectualProperty?.id"
            @edit="openModal(updateModalRef)"
        >
            <template #modals>
                <generic-crud-modal
                    v-if="canEdit && !intellectualProperty?.isArchived"
                    ref="updateModalRef"
                    hide-activator
                    :form-component="IntellectualPropertyUpdateForm"
                    :form-props="{ presetIntellectualProperty: intellectualProperty }"
                    entity-name="IntellectualProperty"
                    is-update
                    is-section-update
                    :read-only="!canEdit || intellectualProperty?.isArchived"
                    @update="updateBasicInfo"
                />
            </template>
            <template #title>
                <rich-title-renderer :title="returnCurrentLocaleContent(intellectualProperty?.title)" />
            </template>
            <template #visual>
                <v-icon v-if="!intellectualProperty" size="x-large" class="text-slate-400">mdi-seal-variant</v-icon>
                <wordcloud
                    v-else
                    :for-document-id="intellectualProperty?.id"
                    :document-type="PublicationType.INTELLECTUAL_PROPERTY"
                    compact-icon
                />
            </template>
            <template #affiliation>
                <p v-if="intellectualProperty?.publisherName?.length" class="text-lg sm:text-xl font-semibold text-slate-600">
                    <localized-link :to="'publishers/' + intellectualProperty.publisherId" class="font-medium text-gray-900 underline">
                        {{ returnCurrentLocaleContent(intellectualProperty?.publisherName) }}
                    </localized-link>
                </p>
                <p v-else-if="intellectualProperty?.authorReprint" class="text-lg sm:text-xl font-semibold text-slate-600">
                    <localized-link to="scientific-results/author-reprints" class="font-medium text-gray-900 underline">
                        {{ $t("authorReprintLabel") }}
                    </localized-link>
                </p>
            </template>
            <template #meta>
                <landing-meta-item v-if="intellectualProperty?.applicationStatus" :label="$t('intellectualPropertyApplicationStatusLabel')" icon="mdi-progress-check" tone="amber">
                    {{ getIntellectualPropertyApplicationStatusTitleFromValueAutoLocale(intellectualProperty.applicationStatus) }}
                </landing-meta-item>
                <landing-meta-item v-if="intellectualProperty?.documentDate" :label="$t('dateOfPublicationLabel')" icon="mdi-calendar" tone="slate">
                    {{ localiseFlexibleDate(intellectualProperty.documentDate) }}
                </landing-meta-item>
                <landing-meta-item v-if="intellectualProperty?.number" :label="$t('intellectualPropertyNumberLabel')" icon="mdi-identifier" tone="emerald">
                    {{ intellectualProperty.number }}
                </landing-meta-item>
                <landing-meta-item v-if="intellectualProperty?.doi" label="DOI" abbrev="DOI" tone="blue">
                    <identifier-link :identifier="intellectualProperty.doi" compact />
                </landing-meta-item>
            </template>
        </entity-landing-header>

        <document-action-box
            ref="actionsRef"
            :doi="intellectualProperty?.doi"
            :can-edit="canEdit && !intellectualProperty?.isArchived"
            :could-archive="canEdit"
            :metadata-valid="intellectualProperty?.isMetadataValid"
            :files-valid="intellectualProperty?.areFilesValid"
            :document-id="parseInt(currentRoute.params.id as string)"
            :description="returnCurrentLocaleContent(intellectualProperty?.description)"
            :document="intellectualProperty"
            :handle-researcher-unbind="handleResearcherUnbind"
            @update="fetchValidationStatus(intellectualProperty?.id as number, intellectualProperty as _Document)"
        />

        <tab-content-loader v-if="!intellectualProperty" layout="sections" />
        <v-tabs
            v-show="intellectualProperty"
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
            v-show="intellectualProperty"
            v-model="currentTab"
            class="min-w-0"
        >
            <v-tabs-window-item value="contributions">
                <person-document-contribution-tabs
                    :document-id="intellectualProperty?.id"
                    :contribution-list="intellectualProperty?.contributions ? intellectualProperty?.contributions : []"
                    :read-only="!canEdit || intellectualProperty?.isArchived"
                    :document-type="PublicationType.INTELLECTUAL_PROPERTY"
                    @update="updateContributions"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="documents">
                <attachment-section
                    :document="intellectualProperty"
                    :can-edit="canEdit && !intellectualProperty?.isArchived"
                    :proofs="intellectualProperty?.proofs"
                    :file-items="intellectualProperty?.fileItems">
                </attachment-section>
            </v-tabs-window-item>
            <v-tabs-window-item value="additionalInfo">
                <landing-additional-info-tab
                    :keywords="intellectualProperty?.keywords ? intellectualProperty.keywords : []"
                    :description="intellectualProperty?.description"
                    :remark="intellectualProperty?.remark"
                    :can-edit="canEdit && !intellectualProperty?.isArchived"
                    :document="intellectualProperty"
                    :containing-entity-type="ApplicableEntityType.DOCUMENT"
                    :concrete-entity-type="ApplicableEntityType.INTELLECTUAL_PROPERTY"
                    :document-identifiers="documentIdentifiers"
                    @search-keyword="searchKeyword"
                    @update-keywords="updateKeywords"
                    @update-description="updateDescription"
                    @update-remark="updateRemark"
                    @identifiers-updated="fetchIdentifiers"
                >
                    <template #details>
                        <landing-detail-field v-if="intellectualProperty?.dateRequested" :label="$t('dateRequestedLabel')">
                            {{ localiseFlexibleDate(intellectualProperty.dateRequested) }}
                        </landing-detail-field>
                        <landing-detail-field v-if="intellectualProperty?.dateFilingPriority" :label="$t('dateFilingPriorityLabel')">
                            {{ localiseFlexibleDate(intellectualProperty.dateFilingPriority) }}
                        </landing-detail-field>
                        <landing-detail-field v-if="intellectualProperty?.dateTo" :label="$t('dateToLabel')">
                            {{ localiseFlexibleDate(intellectualProperty.dateTo) }}
                        </landing-detail-field>
                    </template>
                </landing-additional-info-tab>
            </v-tabs-window-item>
            <v-tabs-window-item value="indicators">
                <indicators-section 
                    :indicators="documentIndicators" 
                    :applicable-types="[ApplicableEntityType.DOCUMENT]" 
                    :entity-id="intellectualProperty?.id" 
                    :entity-type="ApplicableEntityType.DOCUMENT" 
                    :can-edit="canEdit && (isResearcher || isAdmin || isCommission)"
                    show-statistics
                    :has-attached-files="intellectualProperty?.fileItems && intellectualProperty?.fileItems.length > 0"
                    @create="createIndicator"
                    @updated="fetchIndicators"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="assessments">
                <entity-classification-view
                    :entity-classifications="documentClassifications"
                    :entity-id="intellectualProperty?.id"
                    :can-edit="canClassify && !!intellectualProperty?.documentDate?.year"
                    :containing-entity-type="ApplicableEntityType.DOCUMENT"
                    :applicable-types="[ApplicableEntityType.INTELLECTUAL_PROPERTY]"
                    @create="createClassification"
                    @update="fetchClassifications"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="visualizations">
                <document-visualizations
                    :document-id="(intellectualProperty?.id as number)"
                    :display-settings="displayConfiguration.displaySettings.value"
                    :display-statistics-tab="displayConfiguration.shouldDisplayStatisticsTab()"
                />
            </v-tabs-window-item>
            <v-tabs-window-item v-if="isAdmin" value="revisions">
                <revision-history-table-component
                    class="mt-5"
                    :entity-type="PublicationType.INTELLECTUAL_PROPERTY"
                    :entity-id="intellectualProperty?.id"
                    @restored="fetchIntellectualProperty"
                    @show-assessment-details="showAssessmentDetails"
                />
            </v-tabs-window-item>
            <v-tabs-window-item v-if="isAdmin" value="dataQuality">
                <data-quality-tabs-component
                    ref="dataQualityTabsRef"
                    class="mt-5"
                    :entity-type="PublicationType.INTELLECTUAL_PROPERTY"
                    :entity-id="intellectualProperty?.id"
                />
            </v-tabs-window-item>
        </v-tabs-window>

        <share-buttons
            v-if="intellectualProperty && isResearcher && canEdit"
            :title="(returnCurrentLocaleContent(intellectualProperty.title) as string)"
            :document-id="(intellectualProperty.id as number)"
            :document-type="PublicationType.INTELLECTUAL_PROPERTY"
        />

        <toast v-model="snackbar" :message="snackbarMessage" />
    </div>
</template>

<script lang="ts">
import type { LanguageTagResponse, MultilingualContent } from '@/models/Common';
import { onMounted, nextTick } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { watch } from 'vue';
import { PublicationType, type Document as _Document, type PersonDocumentContribution } from '@/models/PublicationModel';
import LanguageService from '@/services/LanguageService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { IntellectualProperty } from '@/models/PublicationModel';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import PersonDocumentContributionTabs from '@/components/core/PersonDocumentContributionTabs.vue';
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import AttachmentSection from '@/components/core/AttachmentSection.vue';
import IntellectualPropertyUpdateForm from '@/components/publication/update/IntellectualPropertyUpdateForm.vue';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import StatisticsService from '@/services/StatisticsService';
import EntityIndicatorService from '@/services/assessment/EntityIndicatorService';
import { type DocumentAssessmentClassification, type EntityClassificationResponse, StatisticsType, type EntityIndicatorResponse, type DocumentIndicator } from '@/models/AssessmentModel';
import Toast from '@/components/core/Toast.vue';
import { useLoginStore } from '@/stores/loginStore';
import EntityClassificationService from '@/services/assessment/EntityClassificationService';
import EntityClassificationView from '@/components/assessment/classifications/EntityClassificationView.vue';
import { ApplicableEntityType } from '@/models/Common';
import IndicatorsSection from '@/components/assessment/indicators/IndicatorsSection.vue';
import RichTitleRenderer from '@/components/core/RichTitleRenderer.vue';
import { useUserRole } from '@/composables/useUserRole';
import Wordcloud from '@/components/core/Wordcloud.vue';
import TabContentLoader from '@/components/core/TabContentLoader.vue';
import { useDocumentAssessmentActions } from '@/composables/useDocumentAssessmentActions';
import DocumentActionBox from '@/components/publication/DocumentActionBox.vue';
import { useTrustConfigurationActions } from '@/composables/useTrustConfigurationActions';
import ShareButtons from '@/components/core/ShareButtons.vue';
import { injectFairSignposting } from '@/utils/FairSignpostingHeadUtil';
import { type AxiosResponseHeaders } from 'axios';
import DocumentVisualizations from '@/components/publication/DocumentVisualizations.vue';
import { useDocumentChartDisplay } from '@/composables/useDocumentChartDisplay';
import type { EntityIdentifierResponse } from '@/models/IdentifierModel';
import EntityIdentifierService from '@/services/EntityIdentifierService';
import { updateCommonBasicInfo } from '@/utils/CommonDocumentFieldsUtil';
import { getIntellectualPropertyApplicationStatusTitleFromValueAutoLocale } from '@/i18n/intellectualPropertyApplicationStatus';
import { getIntellectualPropertyTypeTitleFromValueAutoLocale } from '@/i18n/intellectualPropertyType';
import { localiseFlexibleDate } from '@/utils/DateUtil';
import RevisionHistoryTableComponent from '@/components/core/revisions/RevisionHistoryTableComponent.vue';
import DataQualityTabsComponent from '@/components/core/revisions/DataQualityTabsComponent.vue';
import EntityLandingHeader from '@/components/landing/EntityLandingHeader.vue';
import LandingMetaItem from '@/components/landing/LandingMetaItem.vue';
import LandingDetailField from '@/components/landing/LandingDetailField.vue';
import LandingAdditionalInfoTab from '@/components/landing/LandingAdditionalInfoTab.vue';
import IdentifierLink from '@/components/core/IdentifierLink.vue';


export default defineComponent({
    name: "IntellectualPropertyLandingPage",
    components: { AttachmentSection, Toast, PersonDocumentContributionTabs, LocalizedLink, GenericCrudModal, EntityClassificationView, IndicatorsSection, RichTitleRenderer, Wordcloud, TabContentLoader, DocumentActionBox, ShareButtons, DocumentVisualizations, RevisionHistoryTableComponent, DataQualityTabsComponent, EntityLandingHeader, LandingMetaItem, LandingDetailField, LandingAdditionalInfoTab, IdentifierLink },
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

        const intellectualProperty = ref<IntellectualProperty>();
        const languageTagMap = ref<Map<number, LanguageTagResponse>>(new Map());

        const { isResearcher, isAdmin, isCommission } = useUserRole();
        const canEdit = ref(false);
        const canClassify = ref(false);

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

            fetchIntellectualProperty();
            fetchIdentifiers();
            StatisticsService.registerDocumentView(parseInt(currentRoute.params.id as string));
            fetchIndicators();
        };

        watch(i18n.locale, () => {
            populateData();
        });

        const fetchIntellectualProperty = () => {
            DocumentPublicationService.readIntellectualProperty(
                parseInt(currentRoute.params.id as string)
            ).then((response) => {
                intellectualProperty.value = response.data;

                injectFairSignposting(response.headers as AxiosResponseHeaders);

                document.title = returnCurrentLocaleContent(intellectualProperty.value.title) as string;

                intellectualProperty.value?.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
    
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
            intellectualProperty.value!.keywords = keywords;
            performUpdate(false);
        };

        const updateDescription = (description: MultilingualContent[]) => {
            intellectualProperty.value!.description = description;
            performUpdate(false);
        };

        const updateContributions = (contributions: PersonDocumentContribution[]) => {
            intellectualProperty.value!.contributions = contributions;
            performUpdate(true);
        };

        const updateBasicInfo = (basicInfo: IntellectualProperty) => {
            intellectualProperty.value!.publisherId = basicInfo.publisherId;
            intellectualProperty.value!.number = basicInfo.number;
            intellectualProperty.value!.authorReprint = basicInfo.authorReprint;
            intellectualProperty.value!.dateRequested = basicInfo.dateRequested;
            intellectualProperty.value!.dateFilingPriority = basicInfo.dateFilingPriority;
            intellectualProperty.value!.dateTo = basicInfo.dateTo;
            intellectualProperty.value!.type = basicInfo.type;
            intellectualProperty.value!.applicationStatus = basicInfo.applicationStatus;

            updateCommonBasicInfo(intellectualProperty, basicInfo);

            performUpdate(true);
        };

        const performUpdate = (reload: boolean) => {
            DocumentPublicationService.updateIntellectualProperty(intellectualProperty.value?.id as number, intellectualProperty.value as IntellectualProperty).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                if(reload) {
                    fetchIntellectualProperty();
                }
            }).catch((error) => {
                snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
                if(reload) {
                    fetchIntellectualProperty();
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
            intellectualProperty.value!.remark = remark;
            performUpdate(true);
        };

        return {
            intellectualProperty, currentTab, ApplicableEntityType,
            returnCurrentLocaleContent, IntellectualPropertyUpdateForm, canClassify,
            languageTagMap, searchKeyword, canEdit, isResearcher,
            updateKeywords, updateDescription, snackbar, snackbarMessage,
            updateContributions, updateBasicInfo, handleResearcherUnbind,
            StatisticsType, documentIndicators, actionsRef, currentRoute,
            createClassification, fetchClassifications, documentClassifications,
            createIndicator, fetchIndicators, fetchValidationStatus,
            PublicationType, updateRemark, displayConfiguration, isAdmin, isCommission,
            fetchIdentifiers, documentIdentifiers, localiseFlexibleDate,
            getIntellectualPropertyTypeTitleFromValueAutoLocale,
            getIntellectualPropertyApplicationStatusTitleFromValueAutoLocale,
            fetchIntellectualProperty,
            dataQualityTabsRef, showAssessmentDetails, updateModalRef, openModal
        };
}})

</script>
