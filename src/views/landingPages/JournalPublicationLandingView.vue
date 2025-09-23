<template>
    <v-container id="journalPublication">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        <v-skeleton-loader
                            :loading="!journalPublication"
                            type="heading"
                            color="blue-lighten-3"
                            class="text-center"
                        >
                            <rich-title-renderer :title="returnCurrentLocaleContent(journalPublication?.title)"></rich-title-renderer>
                        </v-skeleton-loader>
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ returnCurrentLocaleContent(journalPublication?.subTitle) }}
                        <br />
                        {{ $t("journalPublicationLabel") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- JournalPublication Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon v-if="!journalPublication" size="x-large" class="large-journalPublication-icon">
                    {{ icon }}
                </v-icon>
                <wordcloud v-else :for-document-id="journalPublication?.id" compact-icon />
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="secondary">
                    <v-card-text class="edit-pen-container">
                        <generic-crud-modal
                            :form-component="JournalPublicationUpdateForm"
                            :form-props="{ presetJournalPublication: journalPublication}"
                            entity-name="JournalPublication"
                            is-update
                            is-section-update
                            :read-only="!canEdit || journalPublication?.isArchived"
                            @update="updateBasicInfo"
                        />

                        <!-- Basic Info -->
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>
                        <basic-info-loader v-if="!journalPublication" />
                        <v-row v-else>
                            <v-col cols="6">
                                <div v-if="journalPublication?.journalPublicationType">
                                    {{ $t("concretePublicationTypeLabel") }}:
                                </div>
                                <div v-if="journalPublication?.journalPublicationType" class="response">
                                    {{ getTitleFromValueAutoLocale(journalPublication.journalPublicationType) }}
                                </div>
                                <div v-if="journalPublication?.volume">
                                    {{ $t("volumeLabel") }}:
                                </div>
                                <div v-if="journalPublication?.volume" class="response">
                                    {{ journalPublication.volume }}
                                </div>
                                <div v-if="journalPublication?.issue">
                                    {{ $t("issueLabel") }}:
                                </div>
                                <div v-if="journalPublication?.issue" class="response">
                                    {{ journalPublication.issue }}
                                </div>
                                <div v-if="journalPublication?.startPage">
                                    {{ $t("startPageLabel") }}:
                                </div>
                                <div v-if="journalPublication?.startPage" class="response">
                                    {{ journalPublication.startPage }}
                                </div>
                                <div v-if="journalPublication?.endPage">
                                    {{ $t("endPageLabel") }}:
                                </div>
                                <div v-if="journalPublication?.endPage" class="response">
                                    {{ journalPublication.endPage }}
                                </div>
                                <div v-if="journalPublication?.documentDate">
                                    {{ $t("yearOfPublicationLabel") }}:
                                </div>
                                <div v-if="journalPublication?.documentDate" class="response">
                                    {{ localiseDate(journalPublication.documentDate) }}
                                </div>
                                <div v-if="journalPublication?.journalId">
                                    {{ $t("journalLabel") }}:
                                </div>
                                <div v-if="journalPublication?.journalId" class="response">
                                    <localized-link :to="'journals/' + journalPublication?.journalId">
                                        {{ returnCurrentLocaleContent(journal?.title) }}
                                    </localized-link>
                                </div>
                                <div v-if="journalPublication?.eventId">
                                    {{ $t("conferenceLabel") }}:
                                </div>
                                <div v-if="journalPublication?.eventId" class="response">
                                    <localized-link :to="'events/conference/' + journalPublication?.eventId">
                                        {{ returnCurrentLocaleContent(event?.name) }}
                                    </localized-link>
                                </div>
                            </v-col>
                            <v-col cols="6">
                                <div v-if="journalPublication?.scopusId">
                                    Scopus ID:
                                </div>
                                <div v-if="journalPublication?.scopusId" class="response">
                                    <identifier-link :identifier="journalPublication.scopusId" type="scopus" />
                                </div>
                                <div v-if="journalPublication?.doi">
                                    DOI:
                                </div>
                                <div v-if="journalPublication?.doi" class="response">
                                    <identifier-link :identifier="journalPublication.doi"></identifier-link>
                                </div>
                                <div v-if="journalPublication?.openAlexId">
                                    Open Alex ID:
                                </div>
                                <div v-if="journalPublication?.openAlexId" class="response">
                                    <identifier-link :identifier="journalPublication.openAlexId" type="open_alex"></identifier-link>
                                </div>
                                <div v-if="journalPublication?.webOfScienceId">
                                    Web of Science ID:
                                </div>
                                <div v-if="journalPublication?.webOfScienceId" class="response">
                                    <identifier-link :identifier="journalPublication.webOfScienceId" type="web_of_science"></identifier-link>
                                </div>
                                <div v-if="journalPublication?.articleNumber">
                                    {{ $t("articleNumberLabel") }}:
                                </div>
                                <div v-if="journalPublication?.articleNumber" class="response">
                                    {{ journalPublication.articleNumber }}
                                </div>
                                <div v-if="journalPublication?.numberOfPages">
                                    {{ $t("numberOfPagesLabel") }}:
                                </div>
                                <div v-if="journalPublication?.numberOfPages" class="response">
                                    {{ journalPublication.numberOfPages }}
                                </div>
                                <div v-if="journalPublication?.uris && journalPublication?.uris.length > 0">
                                    {{ $t("uriInputLabel") }}:
                                </div>
                                <div class="response">
                                    <uri-list :uris="journalPublication?.uris"></uri-list>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <document-action-box
            ref="actionsRef"
            :doi="journalPublication?.doi"
            :can-edit="canEdit && !journalPublication?.isArchived"
            :could-archive="canEdit"
            :metadata-valid="journalPublication?.isMetadataValid"
            :files-valid="journalPublication?.areFilesValid"
            :document-id="parseInt(currentRoute.params.id as string)"
            :description="returnCurrentLocaleContent(journalPublication?.description)"
            :document="journalPublication"
            :handle-researcher-unbind="handleResearcherUnbind"
            @update="fetchValidationStatus(journalPublication?.id as number, journalPublication as _Document)"
        />

        <tab-content-loader v-if="!journalPublication" layout="sections" />
        <v-tabs
            v-show="journalPublication"
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
            <v-tab v-show="documentIndicators?.length > 0 || canClassify" value="indicators">
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
            v-show="journalPublication"
            v-model="currentTab"
        >
            <v-tabs-window-item value="contributions">
                <person-document-contribution-tabs
                    :document-id="journalPublication?.id"
                    :contribution-list="journalPublication?.contributions ? journalPublication?.contributions : []"
                    :read-only="!canEdit || journalPublication?.isArchived"
                    @update="updateContributions"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="documents">
                <attachment-section
                    :document="journalPublication"
                    :can-edit="canEdit && !journalPublication?.isArchived"
                    :proofs="journalPublication?.proofs"
                    :file-items="journalPublication?.fileItems">
                </attachment-section>
            </v-tabs-window-item>
            <v-tabs-window-item value="additionalInfo">
                <!-- Keywords -->
                <keyword-list
                    :keywords="journalPublication?.keywords ? journalPublication.keywords : []"
                    :can-edit="canEdit && !journalPublication?.isArchived"
                    @search-keyword="searchKeyword($event)"
                    @update="updateKeywords">
                </keyword-list>

                <!-- Description -->
                <description-section
                    :description="journalPublication?.description"
                    :can-edit="canEdit && !journalPublication?.isArchived"
                    @update="updateDescription">
                </description-section>

                <description-section
                    :description="journalPublication?.remark"
                    :can-edit="canEdit && !journalPublication?.isArchived"
                    is-remark
                    @update="updateRemark"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="indicators">
                <indicators-section 
                    :indicators="documentIndicators" 
                    :applicable-types="[ApplicableEntityType.DOCUMENT]" 
                    :entity-id="journalPublication?.id" 
                    :entity-type="ApplicableEntityType.DOCUMENT" 
                    :can-edit="canEdit"
                    show-statistics
                    :has-attached-files="journalPublication?.fileItems && journalPublication?.fileItems.length > 0"
                    @create="createIndicator"
                    @updated="fetchIndicators"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="assessments">
                <v-btn v-if="journalPublication?.documentDate && canEdit" density="compact" class="ml-5" @click="assessJournalPublication">
                    {{ $t("assessPublicationLabel") }}
                </v-btn>
                <entity-classification-view
                    :entity-classifications="documentClassifications"
                    :entity-id="journalPublication?.id"
                    :can-edit="canClassify && journalPublication?.documentDate !== ''"
                    :containing-entity-type="ApplicableEntityType.DOCUMENT"
                    :applicable-types="[ApplicableEntityType.DOCUMENT]"
                    @create="createClassification"
                    @update="fetchClassifications"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="visualizations">
                <document-visualizations
                    :document-id="(journalPublication?.id as number)"
                />
            </v-tabs-window-item>
        </v-tabs-window>

        <toast v-model="snackbar" :message="snackbarMessage" />

        <share-buttons
            v-if="journalPublication && isResearcher && canEdit"
            :title="(returnCurrentLocaleContent(journalPublication.title) as string)"
            :document-id="(journalPublication.id as number)"
            :document-type="PublicationType.JOURNAL_PUBLICATION"
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
import { PublicationType, type Document as _Document, type DocumentPublicationIndex, type PersonDocumentContribution } from '@/models/PublicationModel';
import LanguageService from '@/services/LanguageService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { JournalPublication } from '@/models/PublicationModel';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import PersonDocumentContributionTabs from '@/components/core/PersonDocumentContributionTabs.vue';
import KeywordList from '@/components/core/KeywordList.vue';
import DescriptionSection from '@/components/core/DescriptionSection.vue';
import type { Conference } from '@/models/EventModel';
import EventService from '@/services/EventService';
import { addAttachment, updateAttachment, deleteAttachment } from "@/utils/AttachmentUtil";
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import { getTitleFromValueAutoLocale } from '@/i18n/journalPublicationType';
import type { Journal } from '@/models/JournalModel';
import JournalService from '@/services/JournalService';
import { localiseDate } from '@/utils/DateUtil';
import UriList from '@/components/core/UriList.vue';
import IdentifierLink from '@/components/core/IdentifierLink.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import AttachmentSection from '@/components/core/AttachmentSection.vue';
import JournalPublicationUpdateForm from '@/components/publication/update/JournalPublicationUpdateForm.vue';
import StatisticsService from '@/services/StatisticsService';
import EntityIndicatorService from '@/services/assessment/EntityIndicatorService';
import { type EntityClassificationResponse, StatisticsType, type EntityIndicatorResponse, type DocumentAssessmentClassification, type DocumentIndicator } from '@/models/AssessmentModel';
import Toast from '@/components/core/Toast.vue';
import EntityClassificationService from '@/services/assessment/EntityClassificationService';
import EntityClassificationView from '@/components/assessment/classifications/EntityClassificationView.vue';
import AssessmentClassificationService from '@/services/assessment/AssessmentClassificationService';
import { useLoginStore } from '@/stores/loginStore';
import RichTitleRenderer from '@/components/core/RichTitleRenderer.vue';
import { useUserRole } from '@/composables/useUserRole';
import Wordcloud from '@/components/core/Wordcloud.vue';
import BasicInfoLoader from '@/components/core/BasicInfoLoader.vue';
import TabContentLoader from '@/components/core/TabContentLoader.vue';
import IndicatorsSection from '@/components/assessment/indicators/IndicatorsSection.vue';
import { useDocumentAssessmentActions } from '@/composables/useDocumentAssessmentActions';
import DocumentActionBox from '@/components/publication/DocumentActionBox.vue';
import { useTrustConfigurationActions } from '@/composables/useTrustConfigurationActions';
import ShareButtons from '@/components/core/ShareButtons.vue';
import { type AxiosResponseHeaders } from 'axios';
import { injectFairSignposting } from '@/utils/FairSignpostingHeadUtil';
import DocumentVisualizations from '@/components/publication/DocumentVisualizations.vue';


export default defineComponent({
    name: "JournalPublicationLandingPage",
    components: { AttachmentSection, PersonDocumentContributionTabs, Toast, KeywordList, DescriptionSection, LocalizedLink, GenericCrudModal, UriList, IdentifierLink, EntityClassificationView, RichTitleRenderer, Wordcloud, BasicInfoLoader, TabContentLoader, IndicatorsSection, DocumentActionBox, ShareButtons, DocumentVisualizations },
    setup() {
        const currentTab = ref("contributions");

        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const { isResearcher } = useUserRole();
        const canEdit = ref(false);
        const canClassify = ref(false);

        const journalPublication = ref<JournalPublication>();
        const languageTagMap = ref<Map<number, LanguageTagResponse>>(new Map());
        const event = ref<Conference>();
        const journal = ref<Journal>();

        const publications = ref<DocumentPublicationIndex[]>([]);
        const totalPublications = ref<number>(0);

        const i18n = useI18n();

        const icon = ref("mdi-newspaper-variant");

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

            fetchJournalPublication();
            StatisticsService.registerDocumentView(parseInt(currentRoute.params.id as string));

            fetchIndicators();
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

        watch(i18n.locale, () => {
            populateData();
        });

        const fetchJournalPublication = () => {
            DocumentPublicationService.readJournalPublication(
                parseInt(currentRoute.params.id as string)
            ).then((response) => {
                journalPublication.value = response.data;

                injectFairSignposting(response.headers as AxiosResponseHeaders);

                document.title = returnCurrentLocaleContent(journalPublication.value.title) as string;

                journalPublication.value?.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);

                if(journalPublication.value.eventId) {
                    EventService.readConference(journalPublication.value.eventId).then((eventResponse) => {
                        event.value = eventResponse.data;
                    })
                }

                JournalService.readJournal(journalPublication.value.journalId).then(response => {
                    journal.value = response.data;
                });
    
                populateData();
            }).catch(() => {
                router.push({ name: "notFound" });
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
            journalPublication.value!.keywords = keywords;
            performUpdate(false);
        };

        const updateDescription = (description: MultilingualContent[]) => {
            journalPublication.value!.description = description;
            performUpdate(false);
        };

        const updateContributions = (contributions: PersonDocumentContribution[]) => {
            journalPublication.value!.contributions = contributions;
            performUpdate(true);
        };

        const updateBasicInfo = (basicInfo: JournalPublication) => {
            journalPublication.value!.title = basicInfo.title;
            journalPublication.value!.subTitle = basicInfo.subTitle;
            journalPublication.value!.documentDate = basicInfo.documentDate;
            journalPublication.value!.doi = basicInfo.doi;
            journalPublication.value!.scopusId = basicInfo.scopusId;
            journalPublication.value!.uris = basicInfo.uris;
            journalPublication.value!.eventId = basicInfo.eventId;
            journalPublication.value!.journalId = basicInfo.journalId;
            journalPublication.value!.startPage = basicInfo.startPage;
            journalPublication.value!.endPage = basicInfo.endPage;
            journalPublication.value!.volume = basicInfo.volume;
            journalPublication.value!.issue = basicInfo.issue;
            journalPublication.value!.numberOfPages = basicInfo.numberOfPages;
            journalPublication.value!.articleNumber = basicInfo.articleNumber;
            journalPublication.value!.journalPublicationType = basicInfo.journalPublicationType;
            journalPublication.value!.openAlexId = basicInfo.openAlexId;
            journalPublication.value!.webOfScienceId = basicInfo.webOfScienceId;

            performUpdate(true);
        };

        const performUpdate = (reload: boolean) => {
            DocumentPublicationService.updateJournalPublication(journalPublication.value?.id as number, journalPublication.value as JournalPublication).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                if(reload) {
                    fetchJournalPublication();
                    assessJournalPublication();
                }
            }).catch((error) => {
                snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
                if(reload) {
                    fetchJournalPublication();
                    assessJournalPublication();
                }
            });
        };

        const handleResearcherUnbind = () => {
            snackbarMessage.value = i18n.t("unbindSuccessfullMessage");
            snackbar.value = true;
            fetchDisplayData();
        };

        const assessJournalPublication = () => {
            AssessmentClassificationService.assessJournalPublication(parseInt(currentRoute.params.id as string)).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                fetchClassifications();
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
            journalPublication.value!.remark = remark;
            performUpdate(true);
        };

        return {
            journalPublication, icon, canClassify, fetchJournalPublication,
            publications, event, totalPublications, isResearcher,
            returnCurrentLocaleContent, handleResearcherUnbind,
            languageTagMap, journal, JournalPublicationUpdateForm,
            StatisticsType, documentIndicators, currentTab, createIndicator,
            searchKeyword, goToURL, canEdit, localiseDate, fetchIndicators,
            addAttachment, deleteAttachment, updateAttachment, actionsRef,
            updateKeywords, updateDescription, snackbar, snackbarMessage,
            updateContributions, updateBasicInfo, getTitleFromValueAutoLocale,
            ApplicableEntityType, documentClassifications, assessJournalPublication,
            createClassification, fetchClassifications, currentRoute,
            fetchValidationStatus, PublicationType, updateRemark
        };
}})

</script>

<style scoped>
    #journalPublication .large-journalPublication-icon {
        font-size: 10em;
    }

    #journalPublication .response {
        font-size: 1.2rem;
        margin-bottom: 10px;
        font-weight: bold;
    }

    .edit-pen-container {
        position:relative;
    }
</style>
