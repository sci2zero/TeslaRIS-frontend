<template>
    <v-container id="materialProduct">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        <v-skeleton-loader
                            :loading="!materialProduct"
                            type="heading"
                            color="blue-lighten-3"
                            class="text-center"
                        >
                            <rich-title-renderer :title="returnCurrentLocaleContent(materialProduct?.title)" />
                        </v-skeleton-loader>
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ returnCurrentLocaleContent(materialProduct?.subTitle) }}
                        <br />
                        {{ $t("materialProductLabel") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- MaterialProduct Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon v-if="!materialProduct" size="x-large" class="large-materialProduct-icon">
                    {{ icon }}
                </v-icon>
                <wordcloud
                    v-else
                    :for-document-id="materialProduct?.id"
                    :document-type="PublicationType.MATERIAL_PRODUCT"
                    compact-icon
                />
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="secondary">
                    <v-card-text class="edit-pen-container">
                        <!-- <generic-crud-modal
                            :form-component="MaterialProductUpdateForm"
                            :form-props="{ presetMaterialProduct: materialProduct }"
                            entity-name="MaterialProduct"
                            is-update
                            is-section-update
                            :read-only="!canEdit || materialProduct?.isArchived"
                            @update="updateBasicInfo"
                        /> -->

                        <!-- Basic Info -->
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>
                        <basic-info-loader v-if="!materialProduct" />
                        <v-row v-else>
                            <v-col cols="6">
                                <div v-if="materialProduct?.internalNumber">
                                    {{ $t("internalNumberLabel") }}:
                                </div>
                                <div v-if="materialProduct?.internalNumber" class="response">
                                    {{ materialProduct.internalNumber }}
                                </div>
                                <div v-if="materialProduct?.documentDate">
                                    {{ $t("yearOfPublicationLabel") }}:
                                </div>
                                <div v-if="materialProduct?.documentDate" class="response">
                                    {{ materialProduct.documentDate }}
                                </div>
                                <div v-if="materialProduct?.publisherId || materialProduct?.authorReprint">
                                    {{ $t("publisherLabel") }}:
                                </div>
                                <div v-if="materialProduct?.publisherId" class="response">
                                    <localized-link :to="'publishers/' + materialProduct?.publisherId">
                                        {{ returnCurrentLocaleContent(publisher?.name) }}
                                    </localized-link>
                                </div>
                                <div v-else-if="materialProduct?.authorReprint" class="response">
                                    <localized-link to="scientific-results/author-reprints">
                                        {{ $t("authorReprintLabel") }}
                                    </localized-link>
                                </div>
                            </v-col>
                            <v-col cols="6">
                                <div v-if="materialProduct?.scopusId">
                                    Scopus ID:
                                </div>
                                <div v-if="materialProduct?.scopusId" class="response">
                                    <identifier-link :identifier="materialProduct.scopusId" type="scopus" />
                                </div>
                                <div v-if="materialProduct?.doi">
                                    DOI:
                                </div>
                                <div v-if="materialProduct?.doi" class="response">
                                    <identifier-link :identifier="materialProduct.doi"></identifier-link>
                                </div>
                                <div v-if="materialProduct?.openAlexId">
                                    Open Alex ID:
                                </div>
                                <div v-if="materialProduct?.openAlexId" class="response">
                                    <identifier-link :identifier="materialProduct.openAlexId" type="open_alex"></identifier-link>
                                </div>
                                <div v-if="materialProduct?.webOfScienceId">
                                    Web of Science ID:
                                </div>
                                <div v-if="materialProduct?.webOfScienceId" class="response">
                                    <identifier-link :identifier="materialProduct.webOfScienceId" type="web_of_science"></identifier-link>
                                </div>
                                <div v-if="materialProduct?.uris && materialProduct?.uris.length > 0">
                                    {{ $t("uriInputLabel") }}:
                                </div>
                                <div class="response">
                                    <uri-list :uris="materialProduct?.uris"></uri-list>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <document-action-box
            ref="actionsRef"
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

        <tab-content-loader v-if="!materialProduct" layout="sections" />
        <v-tabs
            v-show="materialProduct"
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
            v-show="materialProduct"
            v-model="currentTab">
            <v-tabs-window-item value="contributions">
                <person-document-contribution-tabs
                    :document-id="materialProduct?.id"
                    :contribution-list="materialProduct?.contributions ? materialProduct?.contributions : []"
                    :read-only="!canEdit || materialProduct?.isArchived"
                    @update="updateContributions"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="documents">
                <attachment-section
                    :document="materialProduct"
                    :can-edit="canEdit && !materialProduct?.isArchived"
                    :proofs="materialProduct?.proofs"
                    :file-items="materialProduct?.fileItems">
                </attachment-section>
            </v-tabs-window-item>
            <v-tabs-window-item value="additionalInfo">
                <!-- Keywords -->
                <keyword-list
                    :keywords="materialProduct?.keywords ? materialProduct.keywords : []"
                    :can-edit="canEdit && !materialProduct?.isArchived"
                    @search-keyword="searchKeyword($event)"
                    @update="updateKeywords">
                </keyword-list>

                <!-- Research Area -->
                <v-row>
                    <v-col cols="12">
                        <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                            <v-card-text class="edit-pen-container">
                                <research-areas-update-modal 
                                    :research-areas-hierarchy="materialProduct?.researchAreas"
                                    :read-only="!canEdit"
                                    @update="updateResearchAreas">
                                </research-areas-update-modal>

                                <h4 class="mt-5 mb-7">
                                    <strong>{{ $t("researchAreasLabel") }}</strong>
                                </h4>
                                <research-area-hierarchy
                                    :research-areas="materialProduct?.researchAreas" 
                                />
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>

                <!-- Description -->
                <description-section
                    :description="materialProduct?.description"
                    :can-edit="canEdit && !materialProduct?.isArchived"
                    @update="updateDescription">
                </description-section>

                <description-section
                    :description="materialProduct?.remark"
                    :can-edit="canEdit && !materialProduct?.isArchived"
                    is-remark
                    @update="updateRemark"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="indicators">
                <indicators-section 
                    :indicators="documentIndicators" 
                    :applicable-types="[ApplicableEntityType.DOCUMENT]" 
                    :entity-id="materialProduct?.id" 
                    :entity-type="ApplicableEntityType.DOCUMENT" 
                    :can-edit="canEdit"
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
                    :can-edit="canClassify && materialProduct?.documentDate !== ''"
                    :containing-entity-type="ApplicableEntityType.DOCUMENT"
                    :applicable-types="[ApplicableEntityType.DOCUMENT]"
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
        </v-tabs-window>

        <share-buttons
            v-if="materialProduct && isResearcher && canEdit"
            :title="(returnCurrentLocaleContent(materialProduct.title) as string)"
            :document-id="(materialProduct.id as number)"
            :document-type="PublicationType.MATERIAL_PRODUCT"
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
import type { Document as _Document, MaterialProduct } from '@/models/PublicationModel';
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
import ResearchAreaHierarchy from '@/components/core/ResearchAreaHierarchy.vue';
import ResearchAreasUpdateModal from '@/components/core/ResearchAreasUpdateModal.vue';


export default defineComponent({
    name: "MaterialProductLandingPage",
    components: { AttachmentSection, PersonDocumentContributionTabs, DescriptionSection, LocalizedLink, KeywordList, UriList, IdentifierLink, Toast, EntityClassificationView, IndicatorsSection, RichTitleRenderer, Wordcloud, BasicInfoLoader, TabContentLoader, DocumentActionBox, ShareButtons, DocumentVisualizations, ResearchAreaHierarchy, ResearchAreasUpdateModal },
    setup() {
        const currentTab = ref("contributions");

        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const materialProduct = ref<MaterialProduct>();
        const publisher = ref<Publisher>();
        const languageTagMap = ref<Map<number, LanguageTagResponse>>(new Map());

        const { isResearcher } = useUserRole();
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

            fetchMaterialProduct();
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
            materialProduct.value!.title = basicInfo.title;
            materialProduct.value!.subTitle = basicInfo.subTitle;
            materialProduct.value!.documentDate = basicInfo.documentDate;
            materialProduct.value!.doi = basicInfo.doi;
            materialProduct.value!.scopusId = basicInfo.scopusId;
            materialProduct.value!.uris = basicInfo.uris;
            materialProduct.value!.publisherId = basicInfo.publisherId;
            materialProduct.value!.internalNumber = basicInfo.internalNumber;
            materialProduct.value!.openAlexId = basicInfo.openAlexId;
            materialProduct.value!.webOfScienceId = basicInfo.webOfScienceId;
            materialProduct.value!.authorReprint = basicInfo.authorReprint;
            materialProduct.value!.researchAreasId = basicInfo.researchAreasId;
            materialProduct.value!.productUsers = basicInfo.productUsers;
            materialProduct.value!.numberProduced = basicInfo.numberProduced;
            materialProduct.value!.materialProductType = basicInfo.materialProductType;

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
            materialProduct, icon, publisher, ApplicableEntityType,
            returnCurrentLocaleContent, currentTab, canClassify,
            languageTagMap, searchKeyword, goToURL, canEdit,
            updateKeywords, updateDescription, StatisticsType,
            snackbar, snackbarMessage, updateContributions,
            updateBasicInfo, isResearcher,
            handleResearcherUnbind, documentIndicators,
            actionsRef, currentRoute, createClassification,
            fetchClassifications, documentClassifications,
            fetchIndicators, createIndicator, PublicationType,
            fetchMaterialProduct, fetchValidationStatus, updateRemark,
            displayConfiguration, updateResearchAreas
        };
}})

</script>

<style scoped>
    #materialProduct .large-materialProduct-icon {
        font-size: 10em;
    }

    #materialProduct .response {
        font-size: 1.2rem;
        margin-bottom: 10px;
        font-weight: bold;
    }

    .edit-pen-container {
        position:relative;
    }
</style>
