<template>
    <v-container id="patent">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        <v-skeleton-loader
                            :loading="!patent"
                            type="heading"
                            color="blue-lighten-3"
                            class="text-center"
                        >
                            <rich-title-renderer :title="returnCurrentLocaleContent(patent?.title)"></rich-title-renderer>
                        </v-skeleton-loader>
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ returnCurrentLocaleContent(patent?.subTitle) }}
                        <br />
                        {{ $t("patentLabel") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- Patent Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon v-if="!patent" size="x-large" class="large-patent-icon">
                    {{ icon }}
                </v-icon>
                <wordcloud v-else :for-document-id="patent?.id" compact-icon />
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="secondary">
                    <v-card-text class="edit-pen-container">
                        <generic-crud-modal
                            :form-component="PatentUpdateForm"
                            :form-props="{ presetPatent: patent }"
                            entity-name="Patent"
                            is-update
                            is-section-update
                            :read-only="!canEdit || patent?.isArchived"
                            @update="updateBasicInfo"
                        />

                        <!-- Basic Info -->
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>
                        <basic-info-loader v-if="!patent" />
                        <v-row v-else>
                            <v-col cols="6">
                                <div v-if="patent?.number">
                                    {{ $t("patentNumberLabel") }}:
                                </div>
                                <div v-if="patent?.number" class="response">
                                    {{ patent.number }}
                                </div>
                                <div v-if="patent?.documentDate">
                                    {{ $t("yearOfPublicationLabel") }}:
                                </div>
                                <div v-if="patent?.documentDate" class="response">
                                    {{ patent.documentDate }}
                                </div>
                                <div v-if="patent?.publisherId || patent?.authorReprint">
                                    {{ $t("publisherLabel") }}:
                                </div>
                                <div v-if="patent?.publisherId" class="response">
                                    <localized-link :to="'publishers/' + patent?.publisherId">
                                        {{ returnCurrentLocaleContent(publisher?.name) }}
                                    </localized-link>
                                </div>
                                <div v-else-if="patent?.authorReprint" class="response">
                                    <localized-link to="scientific-results/author-reprints">
                                        {{ $t("authorReprintLabel") }}
                                    </localized-link>
                                </div>
                            </v-col>
                            <v-col cols="6">
                                <div v-if="patent?.scopusId">
                                    Scopus ID:
                                </div>
                                <div v-if="patent?.scopusId" class="response">
                                    <identifier-link :identifier="patent.scopusId" type="scopus" />
                                </div>
                                <div v-if="patent?.doi">
                                    DOI:
                                </div>
                                <div v-if="patent?.doi" class="response">
                                    <identifier-link :identifier="patent.doi"></identifier-link>
                                </div>
                                <div v-if="patent?.openAlexId">
                                    Open Alex ID:
                                </div>
                                <div v-if="patent?.openAlexId" class="response">
                                    <identifier-link :identifier="patent.openAlexId" type="open_alex"></identifier-link>
                                </div>
                                <div v-if="patent?.webOfScienceId">
                                    Web of Science ID:
                                </div>
                                <div v-if="patent?.webOfScienceId" class="response">
                                    <identifier-link :identifier="patent.webOfScienceId" type="web_of_science"></identifier-link>
                                </div>
                                <div v-if="patent?.uris && patent?.uris.length > 0">
                                    {{ $t("uriInputLabel") }}:
                                </div>
                                <div class="response">
                                    <uri-list :uris="patent?.uris"></uri-list>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <document-action-box
            ref="actionsRef"
            :doi="patent?.doi"
            :can-edit="canEdit && !patent?.isArchived"
            :could-archive="canEdit"
            :metadata-valid="patent?.isMetadataValid"
            :files-valid="patent?.areFilesValid"
            :document-id="parseInt(currentRoute.params.id as string)"
            :description="returnCurrentLocaleContent(patent?.description)"
            :document="patent"
            :handle-researcher-unbind="handleResearcherUnbind"
            @update="fetchValidationStatus(patent?.id as number, patent as _Document)"
        />

        <tab-content-loader v-if="!patent" layout="sections" />
        <v-tabs
            v-show="patent"
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
        </v-tabs>

        <v-tabs-window
            v-show="patent"
            v-model="currentTab"
        >
            <v-tabs-window-item value="contributions">
                <person-document-contribution-tabs
                    :document-id="patent?.id"
                    :contribution-list="patent?.contributions ? patent?.contributions : []"
                    :read-only="!canEdit || patent?.isArchived"
                    @update="updateContributions"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="documents">
                <attachment-section
                    :document="patent"
                    :can-edit="canEdit && !patent?.isArchived"
                    :proofs="patent?.proofs"
                    :file-items="patent?.fileItems">
                </attachment-section>
            </v-tabs-window-item>
            <v-tabs-window-item value="additionalInfo">
                <!-- Keywords -->
                <keyword-list
                    :keywords="patent?.keywords ? patent.keywords : []"
                    :can-edit="canEdit && !patent?.isArchived"
                    @search-keyword="searchKeyword($event)"
                    @update="updateKeywords">
                </keyword-list>

                <!-- Description -->
                <description-section
                    :description="patent?.description"
                    :can-edit="canEdit && !patent?.isArchived"
                    @update="updateDescription">
                </description-section>

                <description-section
                    :description="patent?.remark"
                    :can-edit="canEdit && !patent?.isArchived"
                    is-remark
                    @update="updateRemark"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="indicators">
                <indicators-section 
                    :indicators="documentIndicators" 
                    :applicable-types="[ApplicableEntityType.DOCUMENT]" 
                    :entity-id="patent?.id" 
                    :entity-type="ApplicableEntityType.DOCUMENT" 
                    :can-edit="canEdit"
                    show-statistics
                    :has-attached-files="patent?.fileItems && patent?.fileItems.length > 0"
                    @create="createIndicator"
                    @updated="fetchIndicators"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="assessments">
                <entity-classification-view
                    :entity-classifications="documentClassifications"
                    :entity-id="patent?.id"
                    :can-edit="canClassify && patent?.documentDate !== ''"
                    :containing-entity-type="ApplicableEntityType.DOCUMENT"
                    :applicable-types="[ApplicableEntityType.DOCUMENT]"
                    @create="createClassification"
                    @update="fetchClassifications"
                />
            </v-tabs-window-item>
        </v-tabs-window>

        <share-buttons
            v-if="patent && isResearcher && canEdit"
            :title="(returnCurrentLocaleContent(patent.title) as string)"
            :document-id="(patent.id as number)"
            :document-type="PublicationType.PATENT"
        />

        <toast v-model="snackbar" :message="snackbarMessage" />
    </v-container>
</template>

<script lang="ts">
import type { LanguageTagResponse, MultilingualContent } from '@/models/Common';
import { onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { watch } from 'vue';
import { PublicationType, type Document as _Document, type PersonDocumentContribution } from '@/models/PublicationModel';
import LanguageService from '@/services/LanguageService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { Patent } from '@/models/PublicationModel';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import PersonDocumentContributionTabs from '@/components/core/PersonDocumentContributionTabs.vue';
import DescriptionSection from '@/components/core/DescriptionSection.vue';
import PublisherService from '@/services/PublisherService';
import type { Publisher } from '@/models/PublisherModel';
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import KeywordList from '@/components/core/KeywordList.vue';
import UriList from '@/components/core/UriList.vue';
import IdentifierLink from '@/components/core/IdentifierLink.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import AttachmentSection from '@/components/core/AttachmentSection.vue';
import PatentUpdateForm from '@/components/publication/update/PatentUpdateForm.vue';
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
import BasicInfoLoader from '@/components/core/BasicInfoLoader.vue';
import TabContentLoader from '@/components/core/TabContentLoader.vue';
import { useDocumentAssessmentActions } from '@/composables/useDocumentAssessmentActions';
import DocumentActionBox from '@/components/publication/DocumentActionBox.vue';
import { useTrustConfigurationActions } from '@/composables/useTrustConfigurationActions';
import ShareButtons from '@/components/core/ShareButtons.vue';
import { injectFairSignposting } from '@/utils/FairSignpostingHeadUtil';
import { type AxiosResponseHeaders } from 'axios';


export default defineComponent({
    name: "PatentLandingPage",
    components: { AttachmentSection, Toast, PersonDocumentContributionTabs, DescriptionSection, LocalizedLink, KeywordList, GenericCrudModal, UriList, IdentifierLink, EntityClassificationView, IndicatorsSection, RichTitleRenderer, Wordcloud, BasicInfoLoader, TabContentLoader, DocumentActionBox, ShareButtons },
    setup() {
        const currentTab = ref("contributions");

        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const patent = ref<Patent>();
        const publisher = ref<Publisher>();
        const languageTagMap = ref<Map<number, LanguageTagResponse>>(new Map());

        const { isResearcher } = useUserRole();
        const canEdit = ref(false);
        const canClassify = ref(false);

        const i18n = useI18n();

        const icon = ref("mdi-seal-variant");

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
                }).catch(() => canEdit.value = false);

                EntityClassificationService.canClassifyDocument(parseInt(currentRoute.params.id as string)).then((response) => {
                    canClassify.value = response.data;
                });

                fetchClassifications();
            }

            fetchPatent();
            StatisticsService.registerDocumentView(parseInt(currentRoute.params.id as string));
            fetchIndicators();
        };

        watch(i18n.locale, () => {
            populateData();
        });

        const fetchPatent = () => {
            DocumentPublicationService.readPatent(
                parseInt(currentRoute.params.id as string)
            ).then((response) => {
                patent.value = response.data;

                injectFairSignposting(response.headers as AxiosResponseHeaders);

                document.title = returnCurrentLocaleContent(patent.value.title) as string;

                patent.value?.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);

                if(patent.value.publisherId) {
                    PublisherService.readPublisher(patent.value.publisherId).then((publisherResponse) => {
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
        };

        const updateKeywords = (keywords: MultilingualContent[]) => {
            patent.value!.keywords = keywords;
            performUpdate(false);
        };

        const updateDescription = (description: MultilingualContent[]) => {
            patent.value!.description = description;
            performUpdate(false);
        };

        const updateContributions = (contributions: PersonDocumentContribution[]) => {
            patent.value!.contributions = contributions;
            performUpdate(true);
        };

        const updateBasicInfo = (basicInfo: Patent) => {
            patent.value!.title = basicInfo.title;
            patent.value!.subTitle = basicInfo.subTitle;
            patent.value!.documentDate = basicInfo.documentDate;
            patent.value!.doi = basicInfo.doi;
            patent.value!.scopusId = basicInfo.scopusId;
            patent.value!.uris = basicInfo.uris;
            patent.value!.publisherId = basicInfo.publisherId;
            patent.value!.number = basicInfo.number;
            patent.value!.openAlexId = basicInfo.openAlexId;
            patent.value!.webOfScienceId = basicInfo.webOfScienceId;
            patent.value!.authorReprint = basicInfo.authorReprint;

            performUpdate(true);
        };

        const performUpdate = (reload: boolean) => {
            DocumentPublicationService.updatePatent(patent.value?.id as number, patent.value as Patent).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                if(reload) {
                    fetchPatent();
                }
            }).catch((error) => {
                snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
                if(reload) {
                    fetchPatent();
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
            patent.value!.remark = remark;
            performUpdate(true);
        };

        return {
            patent, icon, publisher, currentTab, ApplicableEntityType,
            returnCurrentLocaleContent, PatentUpdateForm, canClassify,
            languageTagMap, searchKeyword, goToURL, canEdit, isResearcher,
            updateKeywords, updateDescription, snackbar, snackbarMessage,
            updateContributions, updateBasicInfo, handleResearcherUnbind,
            StatisticsType, documentIndicators, actionsRef, currentRoute,
            createClassification, fetchClassifications, documentClassifications,
            createIndicator, fetchIndicators, fetchValidationStatus,
            PublicationType, updateRemark
        };
}})

</script>

<style scoped>
    #patent .large-patent-icon {
        font-size: 10em;
    }

    #patent .response {
        font-size: 1.2rem;
        margin-bottom: 10px;
        font-weight: bold;
    }

    .edit-pen-container {
        position:relative;
    }

</style>
