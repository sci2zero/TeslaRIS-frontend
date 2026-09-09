<template>
    <div id="geneticMaterial" class="mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 sm:py-10 lg:py-12">
        <entity-landing-header
            :loading="!geneticMaterial"
            :subtitle="returnCurrentLocaleContent(geneticMaterial?.subTitle)"
            :entity-label="$t('geneticMaterialLabel')"
            :badge="geneticMaterial?.geneticMaterialType ? getGeneticMaterialTypeTitleFromValueAutoLocale(geneticMaterial.geneticMaterialType) : ''"
            icon="mdi-desktop-classic"
            :can-edit="canEdit && !geneticMaterial?.isArchived"
            :edit-label="$t('updateGeneticMaterialLabel')"
            :entity-type="PublicationType.GENETIC_MATERIAL"
            :entity-id="geneticMaterial?.id"
            @edit="openModal(updateModalRef)"
        >
            <template #modals>
                <generic-crud-modal
                    v-if="canEdit && !geneticMaterial?.isArchived"
                    ref="updateModalRef"
                    hide-activator
                    :form-component="GeneticMaterialUpdateForm"
                    :form-props="{ presetGeneticMaterial: geneticMaterial }"
                    entity-name="GeneticMaterial"
                    is-update
                    is-section-update
                    :read-only="!canEdit || geneticMaterial?.isArchived"
                    @update="updateBasicInfo"
                />
            </template>
            <template #title>
                <rich-title-renderer :title="returnCurrentLocaleContent(geneticMaterial?.title)" />
            </template>
            <template #visual>
                <v-icon v-if="!geneticMaterial" size="x-large" class="text-slate-400">mdi-desktop-classic</v-icon>
                <wordcloud
                    v-else
                    :for-document-id="geneticMaterial?.id"
                    :document-type="PublicationType.GENETIC_MATERIAL"
                    compact-icon
                />
            </template>
            <template #affiliation>
                <p v-if="geneticMaterial?.publisherId" class="text-lg sm:text-xl font-semibold text-slate-600">
                    <localized-link :to="'publishers/' + geneticMaterial.publisherId" class="font-medium text-gray-900 underline">
                        {{ returnCurrentLocaleContent(publisher?.name) }}
                    </localized-link>
                </p>
                <p v-else-if="geneticMaterial?.authorReprint" class="text-lg sm:text-xl font-semibold text-slate-600">
                    <localized-link to="scientific-results/author-reprints" class="font-medium text-gray-900 underline">
                        {{ $t("authorReprintLabel") }}
                    </localized-link>
                </p>
            </template>
            <template #meta>
                <landing-meta-item v-if="geneticMaterial?.documentDate" :label="$t('dateOfPublicationLabel')" icon="mdi-calendar" tone="slate">
                    {{ localiseFlexibleDate(geneticMaterial.documentDate) }}
                </landing-meta-item>
                <landing-meta-item v-if="geneticMaterial?.doi" label="DOI" abbrev="DOI" tone="blue">
                    <identifier-link :identifier="geneticMaterial.doi" compact />
                </landing-meta-item>
            </template>
        </entity-landing-header>

        <document-action-box
            ref="actionsRef"
            :doi="geneticMaterial?.doi"
            :can-edit="canEdit && !geneticMaterial?.isArchived"
            :could-archive="canEdit"
            :metadata-valid="geneticMaterial?.isMetadataValid"
            :files-valid="geneticMaterial?.areFilesValid"
            :document-id="parseInt(currentRoute.params.id as string)"
            :description="returnCurrentLocaleContent(geneticMaterial?.description)"
            :document="geneticMaterial"
            :handle-researcher-unbind="handleResearcherUnbind"
            @update="fetchValidationStatus(geneticMaterial?.id as number, geneticMaterial as _Document)"
        />

        <tab-content-loader v-if="!geneticMaterial" layout="sections" />
        <v-tabs
            v-show="geneticMaterial"
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
            v-show="geneticMaterial"
            v-model="currentTab"
            class="min-w-0"
        >
            <v-tabs-window-item value="contributions">
                <person-document-contribution-tabs
                    :document-id="geneticMaterial?.id"
                    :contribution-list="geneticMaterial?.contributions ? geneticMaterial?.contributions : []"
                    :read-only="!canEdit || geneticMaterial?.isArchived"
                    :document-type="PublicationType.GENETIC_MATERIAL"
                    :concrete-type="(geneticMaterial?.geneticMaterialType as string)"
                    @update="updateContributions"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="documents">
                <attachment-section
                    :document="geneticMaterial"
                    :can-edit="canEdit && !geneticMaterial?.isArchived"
                    :proofs="geneticMaterial?.proofs"
                    :file-items="geneticMaterial?.fileItems">
                </attachment-section>
            </v-tabs-window-item>
            <v-tabs-window-item value="additionalInfo">
                <landing-additional-info-tab
                    :keywords="geneticMaterial?.keywords ? geneticMaterial.keywords : []"
                    :description="geneticMaterial?.description"
                    :remark="geneticMaterial?.remark"
                    :can-edit="canEdit && !geneticMaterial?.isArchived"
                    :document="geneticMaterial"
                    :containing-entity-type="ApplicableEntityType.DOCUMENT"
                    :concrete-entity-type="ApplicableEntityType.GENETIC_MATERIAL"
                    :document-identifiers="documentIdentifiers"
                    @search-keyword="searchKeyword"
                    @update-keywords="updateKeywords"
                    @update-description="updateDescription"
                    @update-remark="updateRemark"
                    @identifiers-updated="fetchIdentifiers"
                >
                    <template #details>
                        <landing-detail-field v-if="geneticMaterial?.internalNumber" :label="$t('internalNumberLabel')" :value="geneticMaterial.internalNumber" />
                    </template>
                </landing-additional-info-tab>
            </v-tabs-window-item>
            <v-tabs-window-item value="indicators">
                <indicators-section 
                    :indicators="documentIndicators" 
                    :applicable-types="[ApplicableEntityType.DOCUMENT]" 
                    :entity-id="geneticMaterial?.id" 
                    :entity-type="ApplicableEntityType.DOCUMENT" 
                    :can-edit="canEdit && (isResearcher || isAdmin || isCommission)"
                    show-statistics
                    :has-attached-files="geneticMaterial?.fileItems && geneticMaterial?.fileItems.length > 0"
                    @create="createIndicator"
                    @updated="fetchIndicators"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="assessments">
                <entity-classification-view
                    :entity-classifications="documentClassifications"
                    :entity-id="geneticMaterial?.id"
                    :can-edit="canClassify && !!geneticMaterial?.documentDate?.year"
                    :containing-entity-type="ApplicableEntityType.DOCUMENT"
                    :applicable-types="[ApplicableEntityType.GENETIC_MATERIAL]"
                    @create="createClassification"
                    @update="fetchClassifications"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="visualizations">
                <document-visualizations
                    :document-id="(geneticMaterial?.id as number)"
                    :display-settings="displayConfiguration.displaySettings.value"
                    :display-statistics-tab="displayConfiguration.shouldDisplayStatisticsTab()"
                />
            </v-tabs-window-item>
            <v-tabs-window-item v-if="isAdmin" value="revisions">
                <revision-history-table-component
                    class="mt-5"
                    :entity-type="PublicationType.GENETIC_MATERIAL"
                    :entity-id="geneticMaterial?.id"
                    @restored="fetchGeneticMaterial"
                    @show-assessment-details="showAssessmentDetails"
                />
            </v-tabs-window-item>
            <v-tabs-window-item v-if="isAdmin" value="dataQuality">
                <data-quality-tabs-component
                    ref="dataQualityTabsRef"
                    class="mt-5"
                    :entity-type="PublicationType.GENETIC_MATERIAL"
                    :entity-id="geneticMaterial?.id"
                />
            </v-tabs-window-item>
        </v-tabs-window>

        <share-buttons
            v-if="geneticMaterial && isResearcher && canEdit"
            :title="(returnCurrentLocaleContent(geneticMaterial.title) as string)"
            :document-id="(geneticMaterial.id as number)"
            :document-type="PublicationType.GENETIC_MATERIAL"
        />

        <toast v-model="snackbar" :message="snackbarMessage" />
    </div>
</template>

<script lang="ts">
import { ApplicableEntityType, type LanguageTagResponse, type MultilingualContent } from '@/models/Common';
import { onMounted, nextTick } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { watch } from 'vue';
import { PublicationType, type PersonDocumentContribution } from '@/models/PublicationModel';
import LanguageService from '@/services/LanguageService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { Document as _Document, GeneticMaterial } from '@/models/PublicationModel';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import PersonDocumentContributionTabs from '@/components/core/PersonDocumentContributionTabs.vue';
import PublisherService from '@/services/PublisherService';
import type { Publisher } from '@/models/PublisherModel';
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import AttachmentSection from '@/components/core/AttachmentSection.vue';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
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
import ShareButtons from '@/components/core/ShareButtons.vue';
import { useTrustConfigurationActions } from '@/composables/useTrustConfigurationActions';
import { injectFairSignposting } from '@/utils/FairSignpostingHeadUtil';
import { type AxiosResponseHeaders } from 'axios';
import DocumentVisualizations from '@/components/publication/DocumentVisualizations.vue';
import { useDocumentChartDisplay } from '@/composables/useDocumentChartDisplay';
import { getGeneticMaterialTypeTitleFromValueAutoLocale } from '@/i18n/geneticMaterialType';
import GeneticMaterialUpdateForm from '@/components/publication/update/GeneticMaterialUpdateForm.vue';
import type { EntityIdentifierResponse } from '@/models/IdentifierModel';
import EntityIdentifierService from '@/services/EntityIdentifierService';
import { updateCommonBasicInfo } from '@/utils/CommonDocumentFieldsUtil';
import { localiseFlexibleDate } from '@/utils/DateUtil';
import RevisionHistoryTableComponent from '@/components/core/revisions/RevisionHistoryTableComponent.vue';
import DataQualityTabsComponent from '@/components/core/revisions/DataQualityTabsComponent.vue';
import EntityLandingHeader from '@/components/landing/EntityLandingHeader.vue';
import LandingMetaItem from '@/components/landing/LandingMetaItem.vue';
import LandingDetailField from '@/components/landing/LandingDetailField.vue';
import LandingAdditionalInfoTab from '@/components/landing/LandingAdditionalInfoTab.vue';
import IdentifierLink from '@/components/core/IdentifierLink.vue';


export default defineComponent({
    name: "GeneticMaterialLandingPage",
    components: { AttachmentSection, PersonDocumentContributionTabs, LocalizedLink, GenericCrudModal, Toast, EntityClassificationView, IndicatorsSection, RichTitleRenderer, Wordcloud, TabContentLoader, DocumentActionBox, ShareButtons, DocumentVisualizations, RevisionHistoryTableComponent, DataQualityTabsComponent, EntityLandingHeader, LandingMetaItem, LandingDetailField, LandingAdditionalInfoTab, IdentifierLink },
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

        const geneticMaterial = ref<GeneticMaterial>();
        const publisher = ref<Publisher>();
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

        const handleResearcherUnbind = () => {
            snackbarMessage.value = i18n.t("unbindSuccessfullMessage");
            snackbar.value = true;
            fetchDisplayData();
        };

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

            fetchGeneticMaterial();
            fetchIdentifiers();
            StatisticsService.registerDocumentView(parseInt(currentRoute.params.id as string));
            fetchIndicators();
        };

        watch(i18n.locale, () => {
            populateData();
        });

        const fetchGeneticMaterial = () => {
            DocumentPublicationService.readGeneticMaterial(
                parseInt(currentRoute.params.id as string)
            ).then((response) => {
                geneticMaterial.value = response.data;

                injectFairSignposting(response.headers as AxiosResponseHeaders);

                document.title = returnCurrentLocaleContent(geneticMaterial.value.title) as string;

                geneticMaterial.value?.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);

                if(geneticMaterial.value.publisherId) {
                    PublisherService.readPublisher(geneticMaterial.value.publisherId).then((publisherResponse) => {
                        publisher.value = publisherResponse.data;
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
            geneticMaterial.value!.keywords = keywords;
            performUpdate(false);
        };

        const updateDescription = (description: MultilingualContent[]) => {
            geneticMaterial.value!.description = description;
            performUpdate(false);
        };

        const updateContributions = (contributions: PersonDocumentContribution[]) => {
            geneticMaterial.value!.contributions = contributions;
            performUpdate(true);
        };

        const updateBasicInfo = (basicInfo: GeneticMaterial) => {
            geneticMaterial.value!.publisherId = basicInfo.publisherId;
            geneticMaterial.value!.internalNumber = basicInfo.internalNumber;
            geneticMaterial.value!.authorReprint = basicInfo.authorReprint;
            geneticMaterial.value!.geneticMaterialType = basicInfo.geneticMaterialType;

            updateCommonBasicInfo(geneticMaterial, basicInfo);

            performUpdate(true);
        };

        const performUpdate = (reload: boolean) => {
            DocumentPublicationService.updateGeneticMaterial(geneticMaterial.value?.id as number, geneticMaterial.value as GeneticMaterial).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                if(reload) {
                    fetchGeneticMaterial();
                }
            }).catch(() => {
                snackbarMessage.value = i18n.t("genericErrorMessage");
                snackbar.value = true;
                if(reload) {
                    fetchGeneticMaterial();
                }
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
            geneticMaterial.value!.remark = remark;
            performUpdate(true);
        };

        return {
            geneticMaterial, publisher, ApplicableEntityType,
            returnCurrentLocaleContent, currentTab, canClassify,
            languageTagMap, searchKeyword, canEdit,
            updateKeywords, updateDescription, StatisticsType,
            snackbar, snackbarMessage, updateContributions,
            updateBasicInfo, isResearcher, displayConfiguration,
            handleResearcherUnbind, documentIndicators,
            actionsRef, currentRoute, createClassification,
            fetchClassifications, documentClassifications,
            fetchIndicators, createIndicator, PublicationType,
            fetchGeneticMaterial, fetchValidationStatus, updateRemark,
            getGeneticMaterialTypeTitleFromValueAutoLocale,
            GeneticMaterialUpdateForm, isAdmin, isCommission,
            fetchIdentifiers, documentIdentifiers, localiseFlexibleDate,
            dataQualityTabsRef, showAssessmentDetails, updateModalRef, openModal
        };
}})

</script>
