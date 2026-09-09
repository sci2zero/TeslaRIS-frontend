<template>
    <div id="intangibleProduct" class="mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 sm:py-10 lg:py-12">
        <entity-landing-header
            :loading="!intangibleProduct"
            :subtitle="returnCurrentLocaleContent(intangibleProduct?.subTitle)"
            :entity-label="$t('intangibleProductLabel')"
            :badge="intangibleProduct?.intangibleProductType ? getIntangibleProductTypeTitleFromValueAutoLocale(intangibleProduct.intangibleProductType) : ''"
            icon="mdi-desktop-classic"
            :can-edit="canEdit && !intangibleProduct?.isArchived"
            :edit-label="$t('updateIntangibleProductLabel')"
            :entity-type="PublicationType.INTANGIBLE_PRODUCT"
            :entity-id="intangibleProduct?.id"
            @edit="openModal(updateModalRef)"
        >
            <template #modals>
                <generic-crud-modal
                    v-if="canEdit && !intangibleProduct?.isArchived"
                    ref="updateModalRef"
                    hide-activator
                    :form-component="IntangibleProductUpdateForm"
                    :form-props="{ presetIntangibleProduct: intangibleProduct }"
                    entity-name="IntangibleProduct"
                    is-update
                    is-section-update
                    :read-only="!canEdit || intangibleProduct?.isArchived"
                    @update="updateBasicInfo"
                />
            </template>
            <template #title>
                <rich-title-renderer :title="returnCurrentLocaleContent(intangibleProduct?.title)" />
            </template>
            <template #visual>
                <v-icon v-if="!intangibleProduct" size="x-large" class="text-slate-400">mdi-desktop-classic</v-icon>
                <wordcloud
                    v-else
                    :for-document-id="intangibleProduct?.id"
                    :document-type="PublicationType.INTANGIBLE_PRODUCT"
                    compact-icon
                />
            </template>
            <template #affiliation>
                <p v-if="intangibleProduct?.publisherId" class="text-lg sm:text-xl font-semibold text-slate-600">
                    <localized-link :to="'publishers/' + intangibleProduct.publisherId" class="font-medium text-gray-900 underline">
                        {{ returnCurrentLocaleContent(publisher?.name) }}
                    </localized-link>
                </p>
                <p v-else-if="intangibleProduct?.authorReprint" class="text-lg sm:text-xl font-semibold text-slate-600">
                    <localized-link to="scientific-results/author-reprints" class="font-medium text-gray-900 underline">
                        {{ $t("authorReprintLabel") }}
                    </localized-link>
                </p>
            </template>
            <template #meta>
                <landing-meta-item v-if="intangibleProduct?.documentDate" :label="$t('dateOfPublicationLabel')" icon="mdi-calendar" tone="slate">
                    {{ localiseFlexibleDate(intangibleProduct.documentDate) }}
                </landing-meta-item>
                <landing-meta-item v-if="intangibleProduct?.doi" label="DOI" abbrev="DOI" tone="blue">
                    <identifier-link :identifier="intangibleProduct.doi" compact />
                </landing-meta-item>
            </template>
        </entity-landing-header>

        <document-action-box
            ref="actionsRef"
            :doi="intangibleProduct?.doi"
            :can-edit="canEdit && !intangibleProduct?.isArchived"
            :could-archive="canEdit"
            :metadata-valid="intangibleProduct?.isMetadataValid"
            :files-valid="intangibleProduct?.areFilesValid"
            :document-id="parseInt(currentRoute.params.id as string)"
            :description="returnCurrentLocaleContent(intangibleProduct?.description)"
            :document="intangibleProduct"
            :handle-researcher-unbind="handleResearcherUnbind"
            @update="fetchValidationStatus(intangibleProduct?.id as number, intangibleProduct as _Document)"
        />

        <tab-content-loader v-if="!intangibleProduct" layout="sections" />
        <v-tabs
            v-show="intangibleProduct"
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
            v-show="intangibleProduct"
            v-model="currentTab"
            class="min-w-0"
        >
            <v-tabs-window-item value="contributions">
                <person-document-contribution-tabs
                    :document-id="intangibleProduct?.id"
                    :contribution-list="intangibleProduct?.contributions ? intangibleProduct?.contributions : []"
                    :read-only="!canEdit || intangibleProduct?.isArchived"
                    :document-type="PublicationType.INTANGIBLE_PRODUCT"
                    :concrete-type="(intangibleProduct?.intangibleProductType as string)"
                    @update="updateContributions"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="documents">
                <attachment-section
                    :document="intangibleProduct"
                    :can-edit="canEdit && !intangibleProduct?.isArchived"
                    :proofs="intangibleProduct?.proofs"
                    :file-items="intangibleProduct?.fileItems">
                </attachment-section>
            </v-tabs-window-item>
            <v-tabs-window-item value="additionalInfo">
                <landing-additional-info-tab
                    :keywords="intangibleProduct?.keywords ? intangibleProduct.keywords : []"
                    :description="intangibleProduct?.description"
                    :remark="intangibleProduct?.remark"
                    :can-edit="canEdit && !intangibleProduct?.isArchived"
                    :document="intangibleProduct"
                    :containing-entity-type="ApplicableEntityType.DOCUMENT"
                    :concrete-entity-type="ApplicableEntityType.INTANGIBLE_PRODUCT"
                    :document-identifiers="documentIdentifiers"
                    @search-keyword="searchKeyword"
                    @update-keywords="updateKeywords"
                    @update-description="updateDescription"
                    @update-remark="updateRemark"
                    @identifiers-updated="fetchIdentifiers"
                >
                    <template #details>
                        <landing-detail-field v-if="intangibleProduct?.internalNumber" :label="$t('internalNumberLabel')" :value="intangibleProduct.internalNumber" />
                        <landing-detail-field v-if="intangibleProduct?.productUsers && intangibleProduct.productUsers.length > 0" :label="$t('productUsersLabel')">
                            {{ returnCurrentLocaleContent(intangibleProduct.productUsers) }}
                        </landing-detail-field>
                    </template>
                    <template #after-keywords>
                        <v-row>
                            <v-col cols="12">
                                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                                    <v-card-text class="edit-pen-container">
                                        <research-areas-update-modal 
                                            :research-areas-hierarchy="intangibleProduct?.researchAreas"
                                            :read-only="!canEdit"
                                            @update="updateResearchAreas">
                                        </research-areas-update-modal>

                                        <h4 class="mt-5 mb-7">
                                            <strong>{{ $t("researchAreasLabel") }}</strong>
                                        </h4>
                                        <research-area-hierarchy
                                            :research-areas="intangibleProduct?.researchAreas" 
                                        />
                                    </v-card-text>
                                </v-card>
                            </v-col>
                        </v-row>
                    </template>
                </landing-additional-info-tab>
            </v-tabs-window-item>
            <v-tabs-window-item value="indicators">
                <indicators-section 
                    :indicators="documentIndicators" 
                    :applicable-types="[ApplicableEntityType.DOCUMENT]" 
                    :entity-id="intangibleProduct?.id" 
                    :entity-type="ApplicableEntityType.DOCUMENT" 
                    :can-edit="canEdit && (isResearcher || isAdmin || isCommission)"
                    show-statistics
                    :has-attached-files="intangibleProduct?.fileItems && intangibleProduct?.fileItems.length > 0"
                    @create="createIndicator"
                    @updated="fetchIndicators"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="assessments">
                <entity-classification-view
                    :entity-classifications="documentClassifications"
                    :entity-id="intangibleProduct?.id"
                    :can-edit="canClassify && !!intangibleProduct?.documentDate?.year"
                    :containing-entity-type="ApplicableEntityType.DOCUMENT"
                    :applicable-types="[ApplicableEntityType.MATERIAL_PRODUCT]"
                    @create="createClassification"
                    @update="fetchClassifications"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="visualizations">
                <document-visualizations
                    :document-id="(intangibleProduct?.id as number)"
                    :display-settings="displayConfiguration.displaySettings.value"
                    :display-statistics-tab="displayConfiguration.shouldDisplayStatisticsTab()"
                />
            </v-tabs-window-item>
            <v-tabs-window-item v-if="isAdmin" value="revisions">
                <revision-history-table-component
                    class="mt-5"
                    :entity-type="PublicationType.INTANGIBLE_PRODUCT"
                    :entity-id="intangibleProduct?.id"
                    @restored="fetchIntangibleProduct"
                    @show-assessment-details="showAssessmentDetails"
                />
            </v-tabs-window-item>
            <v-tabs-window-item v-if="isAdmin" value="dataQuality">
                <data-quality-tabs-component
                    ref="dataQualityTabsRef"
                    class="mt-5"
                    :entity-type="PublicationType.INTANGIBLE_PRODUCT"
                    :entity-id="intangibleProduct?.id"
                />
            </v-tabs-window-item>
        </v-tabs-window>

        <share-buttons
            v-if="intangibleProduct && isResearcher && canEdit"
            :title="(returnCurrentLocaleContent(intangibleProduct.title) as string)"
            :document-id="(intangibleProduct.id as number)"
            :document-type="PublicationType.INTANGIBLE_PRODUCT"
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
import type { Document as _Document, IntangibleProduct } from '@/models/PublicationModel';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import PersonDocumentContributionTabs from '@/components/core/PersonDocumentContributionTabs.vue';
import PublisherService from '@/services/PublisherService';
import type { Publisher } from '@/models/PublisherModel';
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import AttachmentSection from '@/components/core/AttachmentSection.vue';
import IntangibleProductUpdateForm from '@/components/publication/update/IntangibleProductUpdateForm.vue';
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
import ResearchAreasUpdateModal from '@/components/core/ResearchAreasUpdateModal.vue';
import ResearchAreaHierarchy from '@/components/core/ResearchAreaHierarchy.vue';
import { getIntangibleProductTypeTitleFromValueAutoLocale } from '@/i18n/intangibleProductType';
import type { EntityIdentifierResponse } from '@/models/IdentifierModel';
import EntityIdentifierService from '@/services/EntityIdentifierService';
import { updateCommonBasicInfo } from '@/utils/CommonDocumentFieldsUtil';
import RevisionHistoryTableComponent from '@/components/core/revisions/RevisionHistoryTableComponent.vue';
import { localiseFlexibleDate } from '@/utils/DateUtil';
import DataQualityTabsComponent from '@/components/core/revisions/DataQualityTabsComponent.vue';
import EntityLandingHeader from '@/components/landing/EntityLandingHeader.vue';
import LandingMetaItem from '@/components/landing/LandingMetaItem.vue';
import LandingDetailField from '@/components/landing/LandingDetailField.vue';
import LandingAdditionalInfoTab from '@/components/landing/LandingAdditionalInfoTab.vue';
import IdentifierLink from '@/components/core/IdentifierLink.vue';


export default defineComponent({
    name: "IntangibleProductLandingPage",
    components: { AttachmentSection, PersonDocumentContributionTabs, LocalizedLink, GenericCrudModal, Toast, EntityClassificationView, IndicatorsSection, RichTitleRenderer, Wordcloud, TabContentLoader, DocumentActionBox, ShareButtons, DocumentVisualizations, ResearchAreasUpdateModal, ResearchAreaHierarchy, RevisionHistoryTableComponent, DataQualityTabsComponent, EntityLandingHeader, LandingMetaItem, LandingDetailField, LandingAdditionalInfoTab, IdentifierLink },
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

        const intangibleProduct = ref<IntangibleProduct>();
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

            fetchIntangibleProduct();
            fetchIdentifiers();
            StatisticsService.registerDocumentView(parseInt(currentRoute.params.id as string));
            fetchIndicators();
        };

        watch(i18n.locale, () => {
            populateData();
        });

        const fetchIntangibleProduct = () => {
            DocumentPublicationService.readIntangibleProduct(
                parseInt(currentRoute.params.id as string)
            ).then((response) => {
                intangibleProduct.value = response.data;

                injectFairSignposting(response.headers as AxiosResponseHeaders);

                document.title = returnCurrentLocaleContent(intangibleProduct.value.title) as string;

                intangibleProduct.value?.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);

                if(intangibleProduct.value.publisherId) {
                    PublisherService.readPublisher(intangibleProduct.value.publisherId).then((publisherResponse) => {
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
            intangibleProduct.value!.keywords = keywords;
            performUpdate(false);
        };

        const updateDescription = (description: MultilingualContent[]) => {
            intangibleProduct.value!.description = description;
            performUpdate(false);
        };

        const updateContributions = (contributions: PersonDocumentContribution[]) => {
            intangibleProduct.value!.contributions = contributions;
            performUpdate(true);
        };

        const updateBasicInfo = (basicInfo: IntangibleProduct) => {
            intangibleProduct.value!.publisherId = basicInfo.publisherId;
            intangibleProduct.value!.internalNumber = basicInfo.internalNumber;
            intangibleProduct.value!.authorReprint = basicInfo.authorReprint;
            intangibleProduct.value!.researchAreasId = basicInfo.researchAreasId;
            intangibleProduct.value!.productUsers = basicInfo.productUsers;
            intangibleProduct.value!.intangibleProductType = basicInfo.intangibleProductType;

            updateCommonBasicInfo(intangibleProduct, basicInfo);

            performUpdate(true);
        };

        const performUpdate = (reload: boolean) => {
            DocumentPublicationService.updateIntangibleProduct(
                intangibleProduct.value?.id as number, intangibleProduct.value as IntangibleProduct
            ).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                if(reload) {
                    fetchIntangibleProduct();
                }
            }).catch(() => {
                snackbarMessage.value = i18n.t("genericErrorMessage");
                snackbar.value = true;
                if(reload) {
                    fetchIntangibleProduct();
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
            intangibleProduct.value!.remark = remark;
            performUpdate(true);
        };

        const updateResearchAreas = (researchAreaIds: number[]) => {
            intangibleProduct.value!.researchAreasId = researchAreaIds;
            performUpdate(true);
        };

        return {
            intangibleProduct, publisher, ApplicableEntityType,
            returnCurrentLocaleContent, currentTab, canClassify,
            languageTagMap, searchKeyword, canEdit,
            updateKeywords, updateDescription, StatisticsType,
            snackbar, snackbarMessage, updateContributions,
            updateBasicInfo, IntangibleProductUpdateForm, isResearcher,
            handleResearcherUnbind, documentIndicators,
            actionsRef, currentRoute, createClassification,
            fetchClassifications, documentClassifications,
            fetchIndicators, createIndicator, PublicationType,
            fetchIntangibleProduct, fetchValidationStatus, updateRemark,
            displayConfiguration, updateResearchAreas,
            getIntangibleProductTypeTitleFromValueAutoLocale,
            isAdmin, isCommission, fetchIdentifiers, documentIdentifiers,
            localiseFlexibleDate,
            dataQualityTabsRef, showAssessmentDetails, updateModalRef, openModal
        };
}})

</script>

<style scoped>
.edit-pen-container {
    position: relative;
}
</style>
