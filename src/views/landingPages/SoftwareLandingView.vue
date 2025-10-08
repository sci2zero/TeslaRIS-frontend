<template>
    <v-container id="software">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        <v-skeleton-loader
                            :loading="!software"
                            type="heading"
                            color="blue-lighten-3"
                            class="text-center"
                        >
                            <rich-title-renderer :title="returnCurrentLocaleContent(software?.title)"></rich-title-renderer>
                        </v-skeleton-loader>
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ returnCurrentLocaleContent(software?.subTitle) }}
                        <br />
                        {{ $t("softwareLabel") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- Software Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon v-if="!software" size="x-large" class="large-software-icon">
                    {{ icon }}
                </v-icon>
                <wordcloud
                    v-else
                    :for-document-id="software?.id"
                    :document-type="PublicationType.SOFTWARE"
                    compact-icon
                />
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="secondary">
                    <v-card-text class="edit-pen-container">
                        <generic-crud-modal
                            :form-component="SoftwareUpdateForm"
                            :form-props="{ presetSoftware: software }"
                            entity-name="Software"
                            is-update
                            is-section-update
                            :read-only="!canEdit || software?.isArchived"
                            @update="updateBasicInfo"
                        />

                        <!-- Basic Info -->
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>
                        <basic-info-loader v-if="!software" />
                        <v-row v-else>
                            <v-col cols="6">
                                <div v-if="software?.internalNumber">
                                    {{ $t("internalNumberLabel") }}:
                                </div>
                                <div v-if="software?.internalNumber" class="response">
                                    {{ software.internalNumber }}
                                </div>
                                <div v-if="software?.documentDate">
                                    {{ $t("yearOfPublicationLabel") }}:
                                </div>
                                <div v-if="software?.documentDate" class="response">
                                    {{ software.documentDate }}
                                </div>
                                <div v-if="software?.publisherId || software?.authorReprint">
                                    {{ $t("publisherLabel") }}:
                                </div>
                                <div v-if="software?.publisherId" class="response">
                                    <localized-link :to="'publishers/' + software?.publisherId">
                                        {{ returnCurrentLocaleContent(publisher?.name) }}
                                    </localized-link>
                                </div>
                                <div v-else-if="software?.authorReprint" class="response">
                                    <localized-link to="scientific-results/author-reprints">
                                        {{ $t("authorReprintLabel") }}
                                    </localized-link>
                                </div>
                            </v-col>
                            <v-col cols="6">
                                <div v-if="software?.scopusId">
                                    Scopus ID:
                                </div>
                                <div v-if="software?.scopusId" class="response">
                                    <identifier-link :identifier="software.scopusId" type="scopus" />
                                </div>
                                <div v-if="software?.doi">
                                    DOI:
                                </div>
                                <div v-if="software?.doi" class="response">
                                    <identifier-link :identifier="software.doi"></identifier-link>
                                </div>
                                <div v-if="software?.openAlexId">
                                    Open Alex ID:
                                </div>
                                <div v-if="software?.openAlexId" class="response">
                                    <identifier-link :identifier="software.openAlexId" type="open_alex"></identifier-link>
                                </div>
                                <div v-if="software?.webOfScienceId">
                                    Web of Science ID:
                                </div>
                                <div v-if="software?.webOfScienceId" class="response">
                                    <identifier-link :identifier="software.webOfScienceId" type="web_of_science"></identifier-link>
                                </div>
                                <div v-if="software?.uris && software?.uris.length > 0">
                                    {{ $t("uriInputLabel") }}:
                                </div>
                                <div class="response">
                                    <uri-list :uris="software?.uris"></uri-list>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <document-action-box
            ref="actionsRef"
            :doi="software?.doi"
            :can-edit="canEdit && !software?.isArchived"
            :could-archive="canEdit"
            :metadata-valid="software?.isMetadataValid"
            :files-valid="software?.areFilesValid"
            :document-id="parseInt(currentRoute.params.id as string)"
            :description="returnCurrentLocaleContent(software?.description)"
            :document="software"
            :handle-researcher-unbind="handleResearcherUnbind"
            @update="fetchValidationStatus(software?.id as number, software as _Document)"
        />

        <tab-content-loader v-if="!software" layout="sections" />
        <v-tabs
            v-show="software"
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
            v-show="software"
            v-model="currentTab">
            <v-tabs-window-item value="contributions">
                <person-document-contribution-tabs
                    :document-id="software?.id"
                    :contribution-list="software?.contributions ? software?.contributions : []"
                    :read-only="!canEdit || software?.isArchived"
                    @update="updateContributions"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="documents">
                <attachment-section
                    :document="software"
                    :can-edit="canEdit && !software?.isArchived"
                    :proofs="software?.proofs"
                    :file-items="software?.fileItems">
                </attachment-section>
            </v-tabs-window-item>
            <v-tabs-window-item value="additionalInfo">
                <!-- Keywords -->
                <keyword-list
                    :keywords="software?.keywords ? software.keywords : []"
                    :can-edit="canEdit && !software?.isArchived"
                    @search-keyword="searchKeyword($event)"
                    @update="updateKeywords">
                </keyword-list>

                <!-- Description -->
                <description-section
                    :description="software?.description"
                    :can-edit="canEdit && !software?.isArchived"
                    @update="updateDescription">
                </description-section>

                <description-section
                    :description="software?.remark"
                    :can-edit="canEdit && !software?.isArchived"
                    is-remark
                    @update="updateRemark"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="indicators">
                <indicators-section 
                    :indicators="documentIndicators" 
                    :applicable-types="[ApplicableEntityType.DOCUMENT]" 
                    :entity-id="software?.id" 
                    :entity-type="ApplicableEntityType.DOCUMENT" 
                    :can-edit="canEdit"
                    show-statistics
                    :has-attached-files="software?.fileItems && software?.fileItems.length > 0"
                    @create="createIndicator"
                    @updated="fetchIndicators"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="assessments">
                <entity-classification-view
                    :entity-classifications="documentClassifications"
                    :entity-id="software?.id"
                    :can-edit="canClassify && software?.documentDate !== ''"
                    :containing-entity-type="ApplicableEntityType.DOCUMENT"
                    :applicable-types="[ApplicableEntityType.DOCUMENT]"
                    @create="createClassification"
                    @update="fetchClassifications"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="visualizations">
                <document-visualizations
                    :document-id="(software?.id as number)"
                    :display-settings="displayConfiguration.displaySettings.value"
                    :display-statistics-tab="displayConfiguration.shouldDisplayStatisticsTab()"
                />
            </v-tabs-window-item>
        </v-tabs-window>

        <share-buttons
            v-if="software && isResearcher && canEdit"
            :title="(returnCurrentLocaleContent(software.title) as string)"
            :document-id="(software.id as number)"
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
import type { Document as _Document, Software } from '@/models/PublicationModel';
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
import SoftwareUpdateForm from '@/components/publication/update/SoftwareUpdateForm.vue';
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


export default defineComponent({
    name: "SoftwareLandingPage",
    components: { AttachmentSection, PersonDocumentContributionTabs, DescriptionSection, LocalizedLink, KeywordList, GenericCrudModal, UriList, IdentifierLink, Toast, EntityClassificationView, IndicatorsSection, RichTitleRenderer, Wordcloud, BasicInfoLoader, TabContentLoader, DocumentActionBox, ShareButtons, DocumentVisualizations },
    setup() {
        const currentTab = ref("contributions");

        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const software = ref<Software>();
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

            fetchSoftware();
            StatisticsService.registerDocumentView(parseInt(currentRoute.params.id as string));
            fetchIndicators();
        };

        watch(i18n.locale, () => {
            populateData();
        });

        const fetchSoftware = () => {
            DocumentPublicationService.readSoftware(
                parseInt(currentRoute.params.id as string)
            ).then((response) => {
                software.value = response.data;

                injectFairSignposting(response.headers as AxiosResponseHeaders);

                document.title = returnCurrentLocaleContent(software.value.title) as string;

                software.value?.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);

                if(software.value.publisherId) {
                    PublisherService.readPublisher(software.value.publisherId).then((publisherResponse) => {
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
            router.push({name:"advancedSearch", query: { searchQuery: keyword.trim(), tab: "publications" }});
        };

        const goToURL = (uri: string) => {
            window.open(uri, "_blank");
        }

        const updateKeywords = (keywords: MultilingualContent[]) => {
            software.value!.keywords = keywords;
            performUpdate(false);
        };

        const updateDescription = (description: MultilingualContent[]) => {
            software.value!.description = description;
            performUpdate(false);
        };

        const updateContributions = (contributions: PersonDocumentContribution[]) => {
            software.value!.contributions = contributions;
            performUpdate(true);
        };

        const updateBasicInfo = (basicInfo: Software) => {
            software.value!.title = basicInfo.title;
            software.value!.subTitle = basicInfo.subTitle;
            software.value!.documentDate = basicInfo.documentDate;
            software.value!.doi = basicInfo.doi;
            software.value!.scopusId = basicInfo.scopusId;
            software.value!.uris = basicInfo.uris;
            software.value!.publisherId = basicInfo.publisherId;
            software.value!.internalNumber = basicInfo.internalNumber;
            software.value!.openAlexId = basicInfo.openAlexId;
            software.value!.webOfScienceId = basicInfo.webOfScienceId;
            software.value!.authorReprint = basicInfo.authorReprint;

            performUpdate(true);
        };

        const performUpdate = (reload: boolean) => {
            DocumentPublicationService.updateSoftware(software.value?.id as number, software.value as Software).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                if(reload) {
                    fetchSoftware();
                }
            }).catch(() => {
                snackbarMessage.value = i18n.t("genericErrorMessage");
                snackbar.value = true;
                if(reload) {
                    fetchSoftware();
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
            software.value!.remark = remark;
            performUpdate(true);
        };

        return {
            software, icon, publisher, ApplicableEntityType,
            returnCurrentLocaleContent, currentTab, canClassify,
            languageTagMap, searchKeyword, goToURL, canEdit,
            updateKeywords, updateDescription, StatisticsType,
            snackbar, snackbarMessage, updateContributions,
            updateBasicInfo, SoftwareUpdateForm, isResearcher,
            handleResearcherUnbind, documentIndicators,
            actionsRef, currentRoute, createClassification,
            fetchClassifications, documentClassifications,
            fetchIndicators, createIndicator, PublicationType,
            fetchSoftware, fetchValidationStatus, updateRemark,
            displayConfiguration
        };
}})

</script>

<style scoped>
    #software .large-software-icon {
        font-size: 10em;
    }

    #software .response {
        font-size: 1.2rem;
        margin-bottom: 10px;
        font-weight: bold;
    }

    .edit-pen-container {
        position:relative;
    }
</style>
