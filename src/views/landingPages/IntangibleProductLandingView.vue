<template>
    <v-container id="intangibleProduct">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        <v-skeleton-loader
                            :loading="!intangibleProduct"
                            type="heading"
                            color="blue-lighten-3"
                            class="text-center"
                        >
                            <rich-title-renderer :title="returnCurrentLocaleContent(intangibleProduct?.title)"></rich-title-renderer>
                        </v-skeleton-loader>
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ returnCurrentLocaleContent(intangibleProduct?.subTitle) }}
                        <br />
                        {{ $t("intangibleProductLabel") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- IntangibleProduct Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon v-if="!intangibleProduct" size="x-large" class="large-intangible-product-icon">
                    {{ icon }}
                </v-icon>
                <wordcloud
                    v-else
                    :for-document-id="intangibleProduct?.id"
                    :document-type="PublicationType.INTANGIBLE_PRODUCT"
                    compact-icon
                />
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="secondary">
                    <v-card-text class="edit-pen-container">
                        <generic-crud-modal
                            :form-component="IntangibleProductUpdateForm"
                            :form-props="{ presetIntangibleProduct: intangibleProduct }"
                            entity-name="IntangibleProduct"
                            is-update
                            is-section-update
                            :read-only="!canEdit || intangibleProduct?.isArchived"
                            @update="updateBasicInfo"
                        />

                        <!-- Basic Info -->
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>
                        <basic-info-loader v-if="!intangibleProduct" />
                        <v-row v-else>
                            <v-col cols="6">
                                <div v-if="intangibleProduct?.intangibleProductType">
                                    {{ $t("intangibleProductTypeLabel") }}:
                                </div>
                                <div v-if="intangibleProduct?.intangibleProductType" class="response">
                                    {{ getIntangibleProductTypeTitleFromValueAutoLocale(intangibleProduct.intangibleProductType) }}
                                </div>
                                <div v-if="intangibleProduct?.internalNumber">
                                    {{ $t("internalNumberLabel") }}:
                                </div>
                                <div v-if="intangibleProduct?.internalNumber" class="response">
                                    {{ intangibleProduct.internalNumber }}
                                </div>
                                <div v-if="intangibleProduct?.documentDate">
                                    {{ $t("yearOfPublicationLabel") }}:
                                </div>
                                <div v-if="intangibleProduct?.documentDate" class="response">
                                    {{ intangibleProduct.documentDate }}
                                </div>
                                <div v-if="intangibleProduct?.publisherId || intangibleProduct?.authorReprint">
                                    {{ $t("publisherLabel") }}:
                                </div>
                                <div v-if="intangibleProduct?.publisherId" class="response">
                                    <localized-link :to="'publishers/' + intangibleProduct?.publisherId">
                                        {{ returnCurrentLocaleContent(publisher?.name) }}
                                    </localized-link>
                                </div>
                                <div v-else-if="intangibleProduct?.authorReprint" class="response">
                                    <localized-link to="scientific-results/author-reprints">
                                        {{ $t("authorReprintLabel") }}
                                    </localized-link>
                                </div>
                                <div v-if="intangibleProduct?.productUsers && intangibleProduct?.productUsers.length > 0">
                                    {{ $t("productUsersLabel") }}:
                                </div>
                                <div v-if="intangibleProduct?.productUsers && intangibleProduct?.productUsers.length > 0" class="response">
                                    {{ returnCurrentLocaleContent(intangibleProduct.productUsers) }}
                                </div>
                            </v-col>
                            <v-col cols="6">
                                <div v-if="intangibleProduct?.scopusId">
                                    Scopus ID:
                                </div>
                                <div v-if="intangibleProduct?.scopusId" class="response">
                                    <identifier-link :identifier="intangibleProduct.scopusId" type="scopus" />
                                </div>
                                <div v-if="intangibleProduct?.doi">
                                    DOI:
                                </div>
                                <div v-if="intangibleProduct?.doi" class="response">
                                    <identifier-link :identifier="intangibleProduct.doi"></identifier-link>
                                </div>
                                <div v-if="intangibleProduct?.openAlexId">
                                    Open Alex ID:
                                </div>
                                <div v-if="intangibleProduct?.openAlexId" class="response">
                                    <identifier-link :identifier="intangibleProduct.openAlexId" type="open_alex"></identifier-link>
                                </div>
                                <div v-if="intangibleProduct?.webOfScienceId">
                                    Web of Science ID:
                                </div>
                                <div v-if="intangibleProduct?.webOfScienceId" class="response">
                                    <identifier-link :identifier="intangibleProduct.webOfScienceId" type="web_of_science"></identifier-link>
                                </div>
                                <div v-if="intangibleProduct?.uris && intangibleProduct?.uris.length > 0">
                                    {{ $t("uriInputLabel") }}:
                                </div>
                                <div class="response">
                                    <uri-list :uris="intangibleProduct?.uris"></uri-list>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

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
            <v-tab v-show="documentIndicators?.length > 0" value="indicators">
                {{ $t("indicatorListLabel") }}
            </v-tab>
            <v-tab v-show="documentClassifications?.length > 0 || canClassify" value="assessments">
                {{ $t("assessmentsLabel") }}
            </v-tab>
            <v-tab v-show="displayConfiguration.shouldDisplayStatisticsTab()" value="visualizations">
                {{ $t("visualizationsLabel") }}
            </v-tab>
        </v-tabs>

        <v-tabs-window
            v-show="intangibleProduct"
            v-model="currentTab">
            <v-tabs-window-item value="contributions">
                <person-document-contribution-tabs
                    :document-id="intangibleProduct?.id"
                    :contribution-list="intangibleProduct?.contributions ? intangibleProduct?.contributions : []"
                    :read-only="!canEdit || intangibleProduct?.isArchived"
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
                <!-- Keywords -->
                <keyword-list
                    :keywords="intangibleProduct?.keywords ? intangibleProduct.keywords : []"
                    :can-edit="canEdit && !intangibleProduct?.isArchived"
                    @search-keyword="searchKeyword($event)"
                    @update="updateKeywords">
                </keyword-list>

                <!-- Research Area -->
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

                <!-- Description -->
                <description-section
                    :description="intangibleProduct?.description"
                    :can-edit="canEdit && !intangibleProduct?.isArchived"
                    @update="updateDescription">
                </description-section>

                <description-section
                    :description="intangibleProduct?.remark"
                    :can-edit="canEdit && !intangibleProduct?.isArchived"
                    is-remark
                    @update="updateRemark"
                />
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
                    :can-edit="canClassify && intangibleProduct?.documentDate !== ''"
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
        </v-tabs-window>

        <share-buttons
            v-if="intangibleProduct && isResearcher && canEdit"
            :title="(returnCurrentLocaleContent(intangibleProduct.title) as string)"
            :document-id="(intangibleProduct.id as number)"
            :document-type="PublicationType.INTANGIBLE_PRODUCT"
        />

        <toast v-model="snackbar" :message="snackbarMessage" />
    </v-container>
</template>

<script lang="ts">
import { ApplicableEntityType, type LanguageTagResponse, type MultilingualContent } from '@/models/Common';
import { onMounted } from 'vue';
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
import DescriptionSection from '@/components/core/DescriptionSection.vue';
import PublisherService from '@/services/PublisherService';
import type { Publisher } from '@/models/PublisherModel';
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import KeywordList from '@/components/core/KeywordList.vue';
import UriList from '@/components/core/UriList.vue';
import IdentifierLink from '@/components/core/IdentifierLink.vue';
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
import BasicInfoLoader from '@/components/core/BasicInfoLoader.vue';
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


export default defineComponent({
    name: "IntangibleProductLandingPage",
    components: { AttachmentSection, PersonDocumentContributionTabs, DescriptionSection, LocalizedLink, KeywordList, GenericCrudModal, UriList, IdentifierLink, Toast, EntityClassificationView, IndicatorsSection, RichTitleRenderer, Wordcloud, BasicInfoLoader, TabContentLoader, DocumentActionBox, ShareButtons, DocumentVisualizations, ResearchAreasUpdateModal, ResearchAreaHierarchy },
    setup() {
        const currentTab = ref("contributions");

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

        const icon = ref("mdi-desktop-classic");

        const documentIndicators = ref<EntityIndicatorResponse[]>([]);
        const documentClassifications = ref<EntityClassificationResponse[]>([]);

        const loginStore = useLoginStore();

        const actionsRef = ref<typeof DocumentActionBox>();

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

        const goToURL = (uri: string) => {
            window.open(uri, "_blank");
        }

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
            intangibleProduct.value!.title = basicInfo.title;
            intangibleProduct.value!.subTitle = basicInfo.subTitle;
            intangibleProduct.value!.documentDate = basicInfo.documentDate;
            intangibleProduct.value!.doi = basicInfo.doi;
            intangibleProduct.value!.scopusId = basicInfo.scopusId;
            intangibleProduct.value!.uris = basicInfo.uris;
            intangibleProduct.value!.publisherId = basicInfo.publisherId;
            intangibleProduct.value!.internalNumber = basicInfo.internalNumber;
            intangibleProduct.value!.openAlexId = basicInfo.openAlexId;
            intangibleProduct.value!.webOfScienceId = basicInfo.webOfScienceId;
            intangibleProduct.value!.authorReprint = basicInfo.authorReprint;
            intangibleProduct.value!.researchAreasId = basicInfo.researchAreasId;
            intangibleProduct.value!.productUsers = basicInfo.productUsers;
            intangibleProduct.value!.intangibleProductType = basicInfo.intangibleProductType;

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
            intangibleProduct, icon, publisher, ApplicableEntityType,
            returnCurrentLocaleContent, currentTab, canClassify,
            languageTagMap, searchKeyword, goToURL, canEdit,
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
            isAdmin, isCommission
        };
}})

</script>

<style scoped>
    #intangibleProduct .large-intangible-product-icon {
        font-size: 10em;
    }

    #intangibleProduct .response {
        font-size: 1.2rem;
        margin-bottom: 10px;
        font-weight: bold;
    }

    .edit-pen-container {
        position:relative;
    }
</style>
