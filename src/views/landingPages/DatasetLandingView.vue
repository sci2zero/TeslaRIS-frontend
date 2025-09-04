<template>
    <v-container id="dataset">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        <v-skeleton-loader
                            :loading="!dataset"
                            type="heading"
                            color="blue-lighten-3"
                            class="text-center"
                        >
                            <rich-title-renderer :title="returnCurrentLocaleContent(dataset?.title)"></rich-title-renderer>
                        </v-skeleton-loader>
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ returnCurrentLocaleContent(dataset?.subTitle) }}
                        <br />
                        {{ $t("datasetLabel") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- Dataset Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon v-if="!dataset" size="x-large" class="large-dataset-icon">
                    {{ icon }}
                </v-icon>
                <wordcloud v-else :for-document-id="dataset?.id" compact-icon />
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="secondary">
                    <v-card-text class="edit-pen-container">
                        <generic-crud-modal
                            :form-component="DatasetUpdateForm"
                            :form-props="{ presetDataset: dataset }"
                            entity-name="Dataset"
                            is-update
                            is-section-update
                            :read-only="!canEdit"
                            @update="updateBasicInfo"
                        />

                        <!-- Basic Info -->
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>
                        <basic-info-loader v-if="!dataset" />
                        <v-row>
                            <v-col cols="6">
                                <citation-selector ref="citationRef" :document-id="parseInt(currentRoute.params.id as string)"></citation-selector>
                                <div v-if="dataset?.internalNumber">
                                    {{ $t("internalNumberLabel") }}:
                                </div>
                                <div v-if="dataset?.internalNumber" class="response">
                                    {{ dataset.internalNumber }}
                                </div>
                                <div v-if="dataset?.documentDate">
                                    {{ $t("yearOfPublicationLabel") }}:
                                </div>
                                <div v-if="dataset?.documentDate" class="response">
                                    {{ localiseDate(dataset.documentDate) }}
                                </div>
                                <div v-if="dataset?.publisherId">
                                    {{ $t("publisherLabel") }}:
                                </div>
                                <div v-if="dataset?.publisherId" class="response">
                                    <localized-link :to="'publishers/' + dataset?.publisherId">
                                        {{ returnCurrentLocaleContent(publisher?.name) }}
                                    </localized-link>
                                </div>
                            </v-col>
                            <v-col cols="6">
                                <div v-if="dataset?.scopusId">
                                    Scopus ID:
                                </div>
                                <div v-if="dataset?.scopusId" class="response">
                                    {{ dataset.scopusId }}
                                </div>
                                <div v-if="dataset?.doi">
                                    DOI:
                                </div>
                                <div v-if="dataset?.doi" class="response">
                                    <identifier-link :identifier="dataset.doi"></identifier-link>
                                </div>
                                <div v-if="dataset?.openAlexId">
                                    Open Alex ID:
                                </div>
                                <div v-if="dataset?.openAlexId" class="response">
                                    <identifier-link :identifier="dataset.openAlexId" type="open_alex"></identifier-link>
                                </div>
                                <div v-if="dataset?.webOfScienceId">
                                    Web of Science ID:
                                </div>
                                <div v-if="dataset?.webOfScienceId" class="response">
                                    <identifier-link :identifier="dataset.webOfScienceId" type="web_of_science"></identifier-link>
                                </div>
                                <div v-if="dataset?.uris && dataset?.uris.length > 0">
                                    {{ $t("uriInputLabel") }}:
                                </div>
                                <div class="response">
                                    <uri-list :uris="dataset?.uris"></uri-list>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <document-action-box
            ref="actionsRef"
            :doi="dataset?.doi"
            :can-edit="canEdit && !dataset?.isArchived"
            :could-archive="canEdit"
            :metadata-valid="dataset?.isMetadataValid"
            :files-valid="dataset?.areFilesValid"
            :document-id="parseInt(currentRoute.params.id as string)"
            :description="returnCurrentLocaleContent(dataset?.description)"
            :document="dataset"
            @update="fetchValidationStatus(dataset?.id as number, dataset as _Document)"
        />

        <tab-content-loader v-if="!dataset" layout="sections" />
        <v-tabs
            v-show="dataset"
            v-model="currentTab"
            color="deep-purple-accent-4"
            align-tabs="start"
        >
            <v-tab value="contributions">
                {{ $t("contributionsLabel") }}
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
            <v-tab value="visualizations">
                {{ $t("visualizationsLabel") }}
            </v-tab>
        </v-tabs>

        <v-tabs-window
            v-show="dataset"
            v-model="currentTab"
        >
            <v-tabs-window-item value="contributions">
                <person-document-contribution-tabs
                    :document-id="dataset?.id"
                    :contribution-list="dataset?.contributions ? dataset?.contributions : []"
                    :read-only="!canEdit"
                    @update="updateContributions">
                </person-document-contribution-tabs>
            </v-tabs-window-item>
            <v-tabs-window-item value="additionalInfo">
                <!-- Keywords -->
                <keyword-list
                    :keywords="dataset?.keywords ? dataset.keywords : []"
                    :can-edit="canEdit && !dataset?.isArchived"
                    @search-keyword="searchKeyword($event)"
                    @update="updateKeywords">
                </keyword-list>

                <!-- Description -->
                <description-section
                    :description="dataset?.description"
                    :can-edit="canEdit && !dataset?.isArchived"
                    @update="updateDescription">
                </description-section>

                <attachment-section
                    :document="dataset"
                    :can-edit="canEdit && !dataset?.isArchived"
                    :proofs="dataset?.proofs"
                    :file-items="dataset?.fileItems">
                </attachment-section>
            </v-tabs-window-item>
            <v-tabs-window-item value="indicators">
                <indicators-section 
                    :indicators="documentIndicators" 
                    :applicable-types="[ApplicableEntityType.DOCUMENT]" 
                    :entity-id="dataset?.id" 
                    :entity-type="ApplicableEntityType.DOCUMENT" 
                    :can-edit="canEdit"
                    show-statistics
                    :has-attached-files="dataset?.fileItems && dataset?.fileItems.length > 0"
                    @create="createIndicator"
                    @updated="fetchIndicators"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="assessments">
                <entity-classification-view
                    :entity-classifications="documentClassifications"
                    :entity-id="dataset?.id"
                    :can-edit="canClassify && dataset?.documentDate !== ''"
                    :containing-entity-type="ApplicableEntityType.DOCUMENT"
                    :applicable-types="[ApplicableEntityType.DOCUMENT]"
                    @create="createClassification"
                    @update="fetchClassifications"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="visualizations">
                <document-visualizations
                    :document-id="(dataset?.id as number)"
                />
            </v-tabs-window-item>
        </v-tabs-window>

        <publication-unbind-button
            v-if="canEdit && isResearcher"
            :document-id="(dataset?.id as number)"
            @unbind="handleResearcherUnbind">
        </publication-unbind-button>

        <toast v-model="snackbar" :message="snackbarMessage" />

        <share-buttons
            v-if="dataset && isResearcher && canEdit"
            :title="(returnCurrentLocaleContent(dataset.title) as string)"
            :document-id="(dataset.id as number)"
            :document-type="PublicationType.DATASET"
        />
    </v-container>
</template>

<script lang="ts">
import { ApplicableEntityType, type LanguageTagResponse, type MultilingualContent } from '@/models/Common';
import { onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { watch } from 'vue';
import { PublicationType, type Document as _Document, type PersonDocumentContribution } from '@/models/PublicationModel';
import LanguageService from '@/services/LanguageService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { Dataset } from '@/models/PublicationModel';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import PersonDocumentContributionTabs from '@/components/core/PersonDocumentContributionTabs.vue';
import DescriptionSection from '@/components/core/DescriptionSection.vue';
import PublisherService from '@/services/PublisherService';
import type { Publisher } from '@/models/PublisherModel';
import { addAttachment, updateAttachment, deleteAttachment } from "@/utils/AttachmentUtil";
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import KeywordList from '@/components/core/KeywordList.vue';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import UriList from '@/components/core/UriList.vue';
import IdentifierLink from '@/components/core/IdentifierLink.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import AttachmentSection from '@/components/core/AttachmentSection.vue';
import DatasetUpdateForm from '@/components/publication/update/DatasetUpdateForm.vue';
import PublicationUnbindButton from '@/components/publication/PublicationUnbindButton.vue';
import StatisticsService from '@/services/StatisticsService';
import EntityIndicatorService from '@/services/assessment/EntityIndicatorService';
import { type DocumentAssessmentClassification, type EntityClassificationResponse, StatisticsType, type EntityIndicatorResponse, type DocumentIndicator } from '@/models/AssessmentModel';
import { localiseDate } from '@/utils/DateUtil';
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
import { useTrustConfigurationActions } from '@/composables/useTrustConfigurationActions';
import ShareButtons from '@/components/core/ShareButtons.vue';
import { type AxiosResponseHeaders } from 'axios';
import { injectFairSignposting } from '@/utils/FairSignpostingHeadUtil';
import DocumentVisualizations from '@/components/publication/DocumentVisualizations.vue';


export default defineComponent({
    name: "DatasetLandingPage",
    components: { AttachmentSection, Toast, PersonDocumentContributionTabs, DescriptionSection, LocalizedLink, KeywordList, GenericCrudModal, UriList, IdentifierLink, PublicationUnbindButton, EntityClassificationView, IndicatorsSection, RichTitleRenderer, Wordcloud, BasicInfoLoader, TabContentLoader, DocumentActionBox, ShareButtons, DocumentVisualizations },
    setup() {
        const currentTab = ref("contributions");
        const snackbar = ref(false);
        const snackbarMessage = ref("");
        
        const currentRoute = useRoute();
        const router = useRouter();

        const dataset = ref<Dataset>();
        const publisher = ref<Publisher>();
        const languageTagMap = ref<Map<number, LanguageTagResponse>>(new Map());

        const { isResearcher } = useUserRole();
        const canEdit = ref(false);
        const canClassify = ref(false);

        const i18n = useI18n();

        const icon = ref("mdi-database");

        const documentIndicators = ref<EntityIndicatorResponse[]>([]);
        const documentClassifications = ref<EntityClassificationResponse[]>([]);

        const loginStore = useLoginStore();

        const actionsRef = ref<typeof DocumentActionBox>();

        onMounted(() => {
            fetchDisplayData();
        });

        const fetchDisplayData = () => {
            if (loginStore.userLoggedIn) {
                DocumentPublicationService.canEdit(parseInt(currentRoute.params.id as string)).then((response) => {
                    canEdit.value = response.data;
                });

                EntityClassificationService.canClassifyDocument(parseInt(currentRoute.params.id as string)).then((response) => {
                    canClassify.value = response.data;
                });

                fetchClassifications();
            }

            fetchDataset();
            StatisticsService.registerDocumentView(parseInt(currentRoute.params.id as string));
            fetchIndicators();
        };

        watch(i18n.locale, () => {
            populateData();
        });

        const fetchDataset = () => {
            DocumentPublicationService.readDataset(
                parseInt(currentRoute.params.id as string)
            ).then((response) => {
                dataset.value = response.data;

                injectFairSignposting(response.headers as AxiosResponseHeaders);

                document.title = returnCurrentLocaleContent(dataset.value.title) as string;

                dataset.value?.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);

                if(dataset.value.publisherId) {
                    PublisherService.readPublisher(dataset.value.publisherId).then((publisherResponse) => {
                        publisher.value = publisherResponse.data;
                    })
                }
    
                populateData();
            }).catch(() => {
                router.push({ name: "notFound" });
            });
        };

        const fetchClassifications = () => {
            EntityClassificationService.fetchDocumentClassifications(parseInt(currentRoute.params.id as string)).then(response => {
                documentClassifications.value = response.data;
            });
        };

        const fetchIndicators = () => {
            EntityIndicatorService.fetchDocumentIndicators(parseInt(currentRoute.params.id as string)).then(response => {
                documentIndicators.value = response.data;
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
            router.push({name:"advancedSearch", query: { searchQuery: keyword.trim(), tab: "publications" }});        
        };

        const goToURL = (uri: string) => {
            window.open(uri, "_blank");
        };

        const updateKeywords = (keywords: MultilingualContent[]) => {
            dataset.value!.keywords = keywords;
            performUpdate(false);
        };

        const updateDescription = (description: MultilingualContent[]) => {
            dataset.value!.description = description;
            performUpdate(false);
        };

        const updateContributions = (contributions: PersonDocumentContribution[]) => {
            dataset.value!.contributions = contributions;
            performUpdate(true);
        };

        const updateBasicInfo = (basicInfo: Dataset) => {
            dataset.value!.title = basicInfo.title;
            dataset.value!.subTitle = basicInfo.subTitle;
            dataset.value!.documentDate = basicInfo.documentDate;
            dataset.value!.doi = basicInfo.doi;
            dataset.value!.scopusId = basicInfo.scopusId;
            dataset.value!.uris = basicInfo.uris;
            dataset.value!.publisherId = basicInfo.publisherId;
            dataset.value!.internalNumber = basicInfo.internalNumber;
            dataset.value!.openAlexId = basicInfo.openAlexId;
            dataset.value!.webOfScienceId = basicInfo.webOfScienceId;

            performUpdate(true);
        };

        const performUpdate = (reload: boolean) => {
            DocumentPublicationService.updateDataset(dataset.value?.id as number, dataset.value as Dataset).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                if(reload) {
                    fetchDataset();
                }
            }).catch((error) => {
                snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
                if(reload) {
                    fetchDataset();
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

        return {
            dataset, icon, publisher, isResearcher, currentTab,
            returnCurrentLocaleContent, handleResearcherUnbind,
            languageTagMap, searchKeyword, goToURL, canEdit,
            addAttachment, updateAttachment, deleteAttachment,
            updateKeywords, updateDescription, snackbar, snackbarMessage,
            updateContributions, updateBasicInfo, DatasetUpdateForm,
            StatisticsType, documentIndicators, localiseDate, PublicationType,
            currentRoute, actionsRef, canClassify, ApplicableEntityType,
            fetchClassifications, documentClassifications, createClassification,
            createIndicator, fetchIndicators, fetchValidationStatus
        };
}})

</script>

<style scoped>
    #dataset .large-dataset-icon {
        font-size: 10em;
    }

    #dataset .response {
        font-size: 1.2rem;
        margin-bottom: 10px;
        font-weight: bold;
    }

    .edit-pen-container {
        position:relative;
    }
</style>
