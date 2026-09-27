<template>
    <landing-page-layout
        id="materialProduct"
        v-model="currentTab"
        :loading="!materialProduct"
    >
        <template #header>
            <entity-landing-header
                :loading="!materialProduct"
                :subtitle="returnCurrentLocaleContent(materialProduct?.subTitle)"
                :entity-label="$t('materialProductLabel')"
                :badge="materialProduct?.materialProductType ? getMaterialProductTypeTitleFromValueAutoLocale(materialProduct.materialProductType) : ''"
                :year="materialProduct?.documentDate?.year"
                icon="mdi-desktop-classic"
                :can-edit="canEdit && !materialProduct?.isArchived"
                :edit-label="$t('updateMaterialProductLabel')"
                :entity-type="PublicationType.MATERIAL_PRODUCT"
                :entity-id="materialProduct?.id"
                @edit="openModal(updateModalRef)"
            >
                <template #modals>
                    <generic-crud-modal
                        v-if="canEdit && !materialProduct?.isArchived"
                        ref="updateModalRef"
                        hide-activator
                        :form-component="MaterialProductUpdateForm"
                        :form-props="{ presetMaterialProduct: materialProduct }"
                        entity-name="MaterialProduct"
                        is-update
                        is-section-update
                        :read-only="!canEdit || materialProduct?.isArchived"
                        @update="updateBasicInfo"
                    />
                </template>
                <template #title>
                    <rich-title-renderer :title="returnCurrentLocaleContent(materialProduct?.title)" />
                </template>
                <template #affiliation>
                    <p v-if="materialProduct?.publisherId" class="text-lg sm:text-xl font-semibold text-slate-600">
                        <localized-link :to="'publishers/' + materialProduct.publisherId" class="font-medium text-gray-900 underline">
                            {{ returnCurrentLocaleContent(publisher?.name) }}
                        </localized-link>
                    </p>
                    <p v-else-if="materialProduct?.authorReprint" class="text-lg sm:text-xl font-semibold text-slate-600">
                        <localized-link to="scientific-results/author-reprints" class="font-medium text-gray-900 underline">
                            {{ $t("authorReprintLabel") }}
                        </localized-link>
                    </p>
                </template>
                <template #meta>
                    <landing-meta-item v-if="materialProduct?.documentDate" :label="$t('dateOfPublicationLabel')" icon="mdi-calendar" tone="slate">
                        {{ localiseFlexibleDate(materialProduct.documentDate) }}
                    </landing-meta-item>
                    <landing-meta-item v-if="materialProduct?.doi" label="DOI" abbrev="DOI" tone="blue">
                        <identifier-link :identifier="materialProduct.doi" compact />
                    </landing-meta-item>
                </template>
                <template #actions>
                    <document-action-box
                        ref="actionsRef"
                        embedded
                        :doi="materialProduct?.doi"
                        :can-edit="canEdit && !materialProduct?.isArchived"
                        :could-archive="canEdit"
                        :metadata-valid="materialProduct?.isMetadataValid"
                        :files-valid="materialProduct?.areFilesValid"
                        :document-id="parseInt(currentRoute.params.id as string)"
                        :description="returnCurrentLocaleContent(materialProduct?.description)"
                        :document="materialProduct"
                        :handle-researcher-unbind="handleResearcherUnbind"
                        @update="fetchValidationStatus(materialProduct?.id as number, materialProduct as _Document)"
                    />
                </template>
            </entity-landing-header>
        </template>

        <template #before-tabs>
            <publication-badge-section
                class="mb-8"
                :preloaded-doi="materialProduct?.doi"
                :document-id="parseInt(currentRoute.params.id as string)"
                :description="returnCurrentLocaleContent(materialProduct?.description)"
            />
        </template>

        <template #tabs>
            <v-tab value="overview">
                {{ $t("overviewLabel") }}
            </v-tab>
            <v-tab value="contributions">
                {{ $t("contributionsLabel") }}
            </v-tab>
            <v-tab v-show="isDigitalRepositoryEnabled" value="documents">
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
                    :description="materialProduct?.description"
                    :contributions="materialProduct?.contributions"
                    :contribution-types="['AUTHOR']"
                    :for-document-id="materialProduct?.id"
                    :document-type="PublicationType.MATERIAL_PRODUCT"
                    @see-all="currentTab = $event"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="contributions">
                <person-document-contribution-tabs
                    :document-id="materialProduct?.id"
                    :contribution-list="materialProduct?.contributions ? materialProduct?.contributions : []"
                    :read-only="!canEdit || materialProduct?.isArchived"
                    :document-type="PublicationType.MATERIAL_PRODUCT"
                    :concrete-type="(materialProduct?.materialProductType as string)"
                    @update="updateContributions"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="documents">
                <attachment-section
                    :document="materialProduct"
                    :can-edit="canEdit && !materialProduct?.isArchived"
                    :proofs="materialProduct?.proofs"
                    :file-items="materialProduct?.fileItems"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="additionalInfo">
                <landing-additional-info-tab
                    :keywords="materialProduct?.keywords ? materialProduct.keywords : []"
                    :description="materialProduct?.description"
                    :remark="materialProduct?.remark"
                    :can-edit="canEdit && !materialProduct?.isArchived"
                    :document="materialProduct"
                    :containing-entity-type="ApplicableEntityType.DOCUMENT"
                    :concrete-entity-type="ApplicableEntityType.MATERIAL_PRODUCT"
                    :document-identifiers="documentIdentifiers"
                    @search-keyword="searchKeyword"
                    @update-keywords="updateKeywords"
                    @update-description="updateDescription"
                    @update-remark="updateRemark"
                    @identifiers-updated="fetchIdentifiers"
                >
                    <template #details>
                        <landing-detail-field v-if="materialProduct?.internalNumber" :label="$t('internalNumberLabel')" :value="materialProduct.internalNumber" />
                        <landing-detail-field v-if="materialProduct?.productUsers && materialProduct.productUsers.length > 0" :label="$t('productUsersLabel')">
                            {{ returnCurrentLocaleContent(materialProduct.productUsers) }}
                        </landing-detail-field>
                    </template>
                    <template #after-keywords>
                        <landing-research-areas-section
                            :research-areas="materialProduct?.researchAreas"
                            :can-edit="canEdit && !materialProduct?.isArchived"
                            @update="updateResearchAreas"
                        />
                    </template>
                </landing-additional-info-tab>
            </v-tabs-window-item>
            <v-tabs-window-item value="indicators">
                <indicators-section 
                    :indicators="documentIndicators" 
                    :applicable-types="[ApplicableEntityType.DOCUMENT]" 
                    :entity-id="materialProduct?.id" 
                    :entity-type="ApplicableEntityType.DOCUMENT" 
                    :can-edit="canEdit && (isResearcher || isAdmin || isCommission)"
                    show-statistics
                    :has-attached-files="materialProduct?.fileItems && materialProduct?.fileItems.length > 0"
                    @create="createIndicator"
                    @updated="fetchIndicators"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="assessments">
                <entity-classification-view
                    :entity-classifications="documentClassifications"
                    :entity-id="materialProduct?.id"
                    :can-edit="canClassify && !!materialProduct?.documentDate?.year"
                    :containing-entity-type="ApplicableEntityType.DOCUMENT"
                    :applicable-types="[ApplicableEntityType.MATERIAL_PRODUCT]"
                    @create="createClassification"
                    @update="fetchClassifications"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="visualizations">
                <document-visualizations
                    :document-id="(materialProduct?.id as number)"
                    :display-settings="displayConfiguration.displaySettings.value"
                    :display-statistics-tab="displayConfiguration.shouldDisplayStatisticsTab()"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="revisions">
                <revision-history-table-component
                    class="mt-5"
                    :entity-type="PublicationType.MATERIAL_PRODUCT"
                    :entity-id="materialProduct?.id"
                    :restore-blocked-reason="materialProduct?.isArchived ? $t('restoreArchivedDocumentMessage') : undefined"
                    @restored="fetchMaterialProduct"
                    @show-assessment-details="showAssessmentDetails"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="dataQuality">
                <data-quality-tabs-component
                    ref="dataQualityTabsRef"
                    class="mt-5"
                    :entity-type="PublicationType.MATERIAL_PRODUCT"
                    :entity-id="materialProduct?.id"
                />
            </v-tabs-window-item>
        </template>

        <template #footer>
            <share-buttons
                v-if="materialProduct && isResearcher && canEdit"
                :title="(returnCurrentLocaleContent(materialProduct.title) as string)"
                :document-id="(materialProduct.id as number)"
                :document-type="PublicationType.MATERIAL_PRODUCT"
            />

            <toast v-model="snackbar" :message="snackbarMessage" />
        </template>
    </landing-page-layout>
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
import DataQualityService from '@/services/revision/DataQualityService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { Document as _Document, MaterialProduct } from '@/models/PublicationModel';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import PersonDocumentContributionTabs from '@/components/core/PersonDocumentContributionTabs.vue';
import PublisherService from '@/services/PublisherService';
import type { Publisher } from '@/models/PublisherModel';
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import AttachmentSection from '@/components/core/AttachmentSection.vue';
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
import LandingOverviewTab from '@/components/landing/LandingOverviewTab.vue';
import { useDocumentAssessmentActions } from '@/composables/useDocumentAssessmentActions';
import DocumentActionBox from '@/components/publication/DocumentActionBox.vue';
import PublicationBadgeSection from '@/components/publication/PublicationBadgeSection.vue';
import ShareButtons from '@/components/core/ShareButtons.vue';
import { useTrustConfigurationActions } from '@/composables/useTrustConfigurationActions';
import { injectFairSignposting } from '@/utils/FairSignpostingHeadUtil';
import { type AxiosResponseHeaders } from 'axios';
import DocumentVisualizations from '@/components/publication/DocumentVisualizations.vue';
import { useDocumentChartDisplay } from '@/composables/useDocumentChartDisplay';
import MaterialProductUpdateForm from '@/components/publication/update/MaterialProductUpdateForm.vue';
import LandingResearchAreasSection from '@/components/landing/LandingResearchAreasSection.vue';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import { getMaterialProductTypeTitleFromValueAutoLocale } from '@/i18n/materialProductType';
import type { EntityIdentifierResponse } from '@/models/IdentifierModel';
import EntityIdentifierService from '@/services/EntityIdentifierService';
import { localiseFlexibleDate } from '@/utils/DateUtil';
import { updateCommonBasicInfo } from '@/utils/CommonDocumentFieldsUtil';
import RevisionHistoryTableComponent from '@/components/core/revisions/RevisionHistoryTableComponent.vue';
import DataQualityTabsComponent from '@/components/core/revisions/DataQualityTabsComponent.vue';
import EntityLandingHeader from '@/components/landing/EntityLandingHeader.vue';
import LandingMetaItem from '@/components/landing/LandingMetaItem.vue';
import LandingDetailField from '@/components/landing/LandingDetailField.vue';
import LandingAdditionalInfoTab from '@/components/landing/LandingAdditionalInfoTab.vue';
import IdentifierLink from '@/components/core/IdentifierLink.vue';
import LandingPageLayout from '@/components/landing/LandingPageLayout.vue';
import { useFeatureModuleToggles } from '@/composables/useFeatureModuleToggles';

export default defineComponent({
    name: "MaterialProductLandingPage",
    components: { LandingPageLayout, AttachmentSection, PersonDocumentContributionTabs, LocalizedLink, Toast, EntityClassificationView, IndicatorsSection, RichTitleRenderer, LandingOverviewTab, DocumentActionBox, PublicationBadgeSection, ShareButtons, DocumentVisualizations, GenericCrudModal, RevisionHistoryTableComponent, DataQualityTabsComponent, EntityLandingHeader, LandingMetaItem, LandingDetailField, LandingAdditionalInfoTab, IdentifierLink, LandingResearchAreasSection },
    setup() {
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
        const router = useRouter();

        const materialProduct = ref<MaterialProduct>();
        const publisher = ref<Publisher>();
        const languageTagMap = ref<Map<number, LanguageTagResponse>>(new Map());

        const {
            isResearcher, isAdmin,
            isCommission,
            canReviewDataQuality
        } = useUserRole();

        const {
            isDigitalRepositoryEnabled
        } = useFeatureModuleToggles();

        const canEdit = ref(false);
        const canAssessDataQuality = ref(false);
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
                DataQualityService.canAssessDataQuality(
                    PublicationType.MATERIAL_PRODUCT,
                    parseInt(currentRoute.params.id as string)
                ).then((response) => {
                    canAssessDataQuality.value = response.data;
                });

                DocumentPublicationService.canEdit(parseInt(currentRoute.params.id as string)).then((response) => {
                    canEdit.value = response.data;
                }).catch(() => canEdit.value = false);

                EntityClassificationService.canClassifyDocument(parseInt(currentRoute.params.id as string)).then((response) => {
                    canClassify.value = response.data;
                });

                fetchClassifications();
            }

            fetchMaterialProduct();
            fetchIdentifiers();
            StatisticsService.registerDocumentView(parseInt(currentRoute.params.id as string));
            fetchIndicators();
        };

        watch(i18n.locale, () => {
            populateData();
        });

        const fetchMaterialProduct = () => {
            DocumentPublicationService.readMaterialProduct(
                parseInt(currentRoute.params.id as string)
            ).then((response) => {
                materialProduct.value = response.data;

                injectFairSignposting(response.headers as AxiosResponseHeaders);

                document.title = returnCurrentLocaleContent(materialProduct.value.title) as string;

                materialProduct.value?.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);

                if(materialProduct.value.publisherId) {
                    PublisherService.readPublisher(materialProduct.value.publisherId).then((publisherResponse) => {
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
            materialProduct.value!.keywords = keywords;
            performUpdate(false);
        };

        const updateDescription = (description: MultilingualContent[]) => {
            materialProduct.value!.description = description;
            performUpdate(false);
        };

        const updateContributions = (contributions: PersonDocumentContribution[]) => {
            materialProduct.value!.contributions = contributions;
            performUpdate(true);
        };

        const updateBasicInfo = (basicInfo: MaterialProduct) => {
            materialProduct.value!.publisherId = basicInfo.publisherId;
            materialProduct.value!.internalNumber = basicInfo.internalNumber;
            materialProduct.value!.authorReprint = basicInfo.authorReprint;
            materialProduct.value!.researchAreasId = basicInfo.researchAreasId;
            materialProduct.value!.productUsers = basicInfo.productUsers;
            materialProduct.value!.numberProduced = basicInfo.numberProduced;
            materialProduct.value!.materialProductType = basicInfo.materialProductType;

            updateCommonBasicInfo(materialProduct, basicInfo);

            performUpdate(true);
        };

        const performUpdate = (reload: boolean) => {
            DocumentPublicationService.updateMaterialProduct(
                materialProduct.value?.id as number,
                materialProduct.value as MaterialProduct
            ).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                if(reload) {
                    fetchMaterialProduct();
                }
            }).catch(() => {
                snackbarMessage.value = i18n.t("genericErrorMessage");
                snackbar.value = true;
                if(reload) {
                    fetchMaterialProduct();
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
            materialProduct.value!.remark = remark;
            performUpdate(true);
        };

        const updateResearchAreas = (researchAreaIds: number[]) => {
            materialProduct.value!.researchAreasId = researchAreaIds;
            performUpdate(true);
        };

        return {
            materialProduct, publisher, ApplicableEntityType, canAssessDataQuality, canReviewDataQuality,
            returnCurrentLocaleContent, currentTab, canClassify,
            languageTagMap, searchKeyword, canEdit,
            updateKeywords, updateDescription, StatisticsType,
            snackbar, snackbarMessage, updateContributions,
            updateBasicInfo, isResearcher, MaterialProductUpdateForm,
            handleResearcherUnbind, documentIndicators, isCommission,
            actionsRef, currentRoute, createClassification,
            fetchClassifications, documentClassifications,
            fetchIndicators, createIndicator, PublicationType,
            fetchMaterialProduct, fetchValidationStatus, updateRemark,
            displayConfiguration, updateResearchAreas, isAdmin,
            getMaterialProductTypeTitleFromValueAutoLocale,
            documentIdentifiers, fetchIdentifiers,
            localiseFlexibleDate,
            dataQualityTabsRef, showAssessmentDetails, updateModalRef, openModal,

            isDigitalRepositoryEnabled,
        };
}})

</script>
