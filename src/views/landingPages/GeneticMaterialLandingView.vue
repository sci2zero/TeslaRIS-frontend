<template>
    <v-container id="geneticMaterial">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        <v-skeleton-loader
                            :loading="!geneticMaterial"
                            type="heading"
                            color="blue-lighten-3"
                            class="text-center"
                        >
                            <rich-title-renderer :title="returnCurrentLocaleContent(geneticMaterial?.title)"></rich-title-renderer>
                        </v-skeleton-loader>
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ returnCurrentLocaleContent(geneticMaterial?.subTitle) }}
                        <br />
                        {{ $t("geneticMaterialLabel") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- GeneticMaterial Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon v-if="!geneticMaterial" size="x-large" class="large-geneticMaterial-icon">
                    {{ icon }}
                </v-icon>
                <wordcloud
                    v-else
                    :for-document-id="geneticMaterial?.id"
                    :document-type="PublicationType.GENETIC_MATERIAL"
                    compact-icon
                />
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="secondary">
                    <v-card-text class="edit-pen-container">
                        <generic-crud-modal
                            :form-component="GeneticMaterialUpdateForm"
                            :form-props="{ presetGeneticMaterial: geneticMaterial }"
                            entity-name="GeneticMaterial"
                            is-update
                            is-section-update
                            :read-only="!canEdit || geneticMaterial?.isArchived"
                            @update="updateBasicInfo"
                        />

                        <!-- Basic Info -->
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>
                        <basic-info-loader v-if="!geneticMaterial" />
                        <v-row v-else>
                            <v-col cols="6">
                                <div v-if="geneticMaterial?.geneticMaterialType">
                                    {{ $t("geneticMaterialTypeLabel") }}:
                                </div>
                                <div v-if="geneticMaterial?.geneticMaterialType" class="response">
                                    {{ getGeneticMaterialTypeTitleFromValueAutoLocale(geneticMaterial.geneticMaterialType) }}
                                </div>
                                <div v-if="geneticMaterial?.internalNumber">
                                    {{ $t("internalNumberLabel") }}:
                                </div>
                                <div v-if="geneticMaterial?.internalNumber" class="response">
                                    {{ geneticMaterial.internalNumber }}
                                </div>
                                <div v-if="geneticMaterial?.documentDate">
                                    {{ $t("yearOfPublicationLabel") }}:
                                </div>
                                <div v-if="geneticMaterial?.documentDate" class="response">
                                    {{ geneticMaterial.documentDate }}
                                </div>
                                <div v-if="geneticMaterial?.publisherId || geneticMaterial?.authorReprint">
                                    {{ $t("publisherLabel") }}:
                                </div>
                                <div v-if="geneticMaterial?.publisherId" class="response">
                                    <localized-link :to="'publishers/' + geneticMaterial?.publisherId">
                                        {{ returnCurrentLocaleContent(publisher?.name) }}
                                    </localized-link>
                                </div>
                                <div v-else-if="geneticMaterial?.authorReprint" class="response">
                                    <localized-link to="scientific-results/author-reprints">
                                        {{ $t("authorReprintLabel") }}
                                    </localized-link>
                                </div>
                            </v-col>
                            <v-col cols="6">
                                <div v-if="geneticMaterial?.scopusId">
                                    Scopus ID:
                                </div>
                                <div v-if="geneticMaterial?.scopusId" class="response">
                                    <identifier-link :identifier="geneticMaterial.scopusId" type="scopus" />
                                </div>
                                <div v-if="geneticMaterial?.doi">
                                    DOI:
                                </div>
                                <div v-if="geneticMaterial?.doi" class="response">
                                    <identifier-link :identifier="geneticMaterial.doi"></identifier-link>
                                </div>
                                <div v-if="geneticMaterial?.openAlexId">
                                    Open Alex ID:
                                </div>
                                <div v-if="geneticMaterial?.openAlexId" class="response">
                                    <identifier-link :identifier="geneticMaterial.openAlexId" type="open_alex"></identifier-link>
                                </div>
                                <div v-if="geneticMaterial?.webOfScienceId">
                                    Web of Science ID:
                                </div>
                                <div v-if="geneticMaterial?.webOfScienceId" class="response">
                                    <identifier-link :identifier="geneticMaterial.webOfScienceId" type="web_of_science"></identifier-link>
                                </div>
                                <div v-if="geneticMaterial?.uris && geneticMaterial?.uris.length > 0">
                                    {{ $t("uriInputLabel") }}:
                                </div>
                                <div class="response">
                                    <uri-list :uris="geneticMaterial?.uris"></uri-list>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

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
            v-show="geneticMaterial"
            v-model="currentTab">
            <v-tabs-window-item value="contributions">
                <person-document-contribution-tabs
                    :document-id="geneticMaterial?.id"
                    :contribution-list="geneticMaterial?.contributions ? geneticMaterial?.contributions : []"
                    :read-only="!canEdit || geneticMaterial?.isArchived"
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
                <!-- Keywords -->
                <keyword-list
                    :keywords="geneticMaterial?.keywords ? geneticMaterial.keywords : []"
                    :can-edit="canEdit && !geneticMaterial?.isArchived"
                    @search-keyword="searchKeyword($event)"
                    @update="updateKeywords">
                </keyword-list>

                <!-- Description -->
                <description-section
                    :description="geneticMaterial?.description"
                    :can-edit="canEdit && !geneticMaterial?.isArchived"
                    @update="updateDescription">
                </description-section>

                <description-section
                    :description="geneticMaterial?.remark"
                    :can-edit="canEdit && !geneticMaterial?.isArchived"
                    is-remark
                    @update="updateRemark"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="indicators">
                <indicators-section 
                    :indicators="documentIndicators" 
                    :applicable-types="[ApplicableEntityType.DOCUMENT]" 
                    :entity-id="geneticMaterial?.id" 
                    :entity-type="ApplicableEntityType.DOCUMENT" 
                    :can-edit="canEdit"
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
                    :can-edit="canClassify && geneticMaterial?.documentDate !== ''"
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
        </v-tabs-window>

        <share-buttons
            v-if="geneticMaterial && isResearcher && canEdit"
            :title="(returnCurrentLocaleContent(geneticMaterial.title) as string)"
            :document-id="(geneticMaterial.id as number)"
            :document-type="PublicationType.SOFTWARE"
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
import type { Document as _Document, GeneticMaterial } from '@/models/PublicationModel';
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
import { getGeneticMaterialTypeTitleFromValueAutoLocale } from '@/i18n/geneticMaterialType';
import GeneticMaterialUpdateForm from '@/components/publication/update/GeneticMaterialUpdateForm.vue';


export default defineComponent({
    name: "GeneticMaterialLandingPage",
    components: { AttachmentSection, PersonDocumentContributionTabs, DescriptionSection, LocalizedLink, KeywordList, GenericCrudModal, UriList, IdentifierLink, Toast, EntityClassificationView, IndicatorsSection, RichTitleRenderer, Wordcloud, BasicInfoLoader, TabContentLoader, DocumentActionBox, ShareButtons, DocumentVisualizations },
    setup() {
        const currentTab = ref("contributions");

        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const geneticMaterial = ref<GeneticMaterial>();
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

            fetchGeneticMaterial();
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
            geneticMaterial.value!.title = basicInfo.title;
            geneticMaterial.value!.subTitle = basicInfo.subTitle;
            geneticMaterial.value!.documentDate = basicInfo.documentDate;
            geneticMaterial.value!.doi = basicInfo.doi;
            geneticMaterial.value!.scopusId = basicInfo.scopusId;
            geneticMaterial.value!.uris = basicInfo.uris;
            geneticMaterial.value!.publisherId = basicInfo.publisherId;
            geneticMaterial.value!.internalNumber = basicInfo.internalNumber;
            geneticMaterial.value!.openAlexId = basicInfo.openAlexId;
            geneticMaterial.value!.webOfScienceId = basicInfo.webOfScienceId;
            geneticMaterial.value!.authorReprint = basicInfo.authorReprint;
            geneticMaterial.value!.geneticMaterialType = basicInfo.geneticMaterialType;

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
            geneticMaterial, icon, publisher, ApplicableEntityType,
            returnCurrentLocaleContent, currentTab, canClassify,
            languageTagMap, searchKeyword, goToURL, canEdit,
            updateKeywords, updateDescription, StatisticsType,
            snackbar, snackbarMessage, updateContributions,
            updateBasicInfo, isResearcher, displayConfiguration,
            handleResearcherUnbind, documentIndicators,
            actionsRef, currentRoute, createClassification,
            fetchClassifications, documentClassifications,
            fetchIndicators, createIndicator, PublicationType,
            fetchGeneticMaterial, fetchValidationStatus, updateRemark,
            getGeneticMaterialTypeTitleFromValueAutoLocale,
            GeneticMaterialUpdateForm
        };
}})

</script>

<style scoped>
    #geneticMaterial .large-geneticMaterial-icon {
        font-size: 10em;
    }

    #geneticMaterial .response {
        font-size: 1.2rem;
        margin-bottom: 10px;
        font-weight: bold;
    }

    .edit-pen-container {
        position:relative;
    }
</style>
