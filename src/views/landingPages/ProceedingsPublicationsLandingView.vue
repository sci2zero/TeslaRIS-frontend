<template>
    <v-container id="proceedingsPublication">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5">
                        <v-skeleton-loader
                            :loading="!proceedingsPublication"
                            type="heading"
                            color="blue-lighten-3"
                            class="text-center"
                        >
                            <rich-title-renderer :title="returnCurrentLocaleContent(proceedingsPublication?.title)"></rich-title-renderer>
                        </v-skeleton-loader>
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ returnCurrentLocaleContent(proceedingsPublication?.subTitle) }}
                        <br />
                        {{ $t("proceedingsPublicationLabel") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- ProceedingsPublication Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon v-if="!proceedingsPublication" size="x-large" class="large-proceedingsPublication-icon">
                    {{ icon }}
                </v-icon>
                <wordcloud v-else :for-document-id="proceedingsPublication?.id" compact-icon />
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="secondary">
                    <v-card-text class="edit-pen-container">
                        <generic-crud-modal
                            :form-component="ProceedingsPublicationUpdateForm"
                            :form-props="{ presetProceedingsPublication: proceedingsPublication}"
                            entity-name="ProceedingsPublication"
                            is-update
                            is-section-update
                            :read-only="!canEdit"
                            @update="updateBasicInfo"
                        />

                        <!-- Basic Info -->
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>
                        <basic-info-loader v-if="!proceedingsPublication" />
                        <v-row v-else>
                            <v-col cols="6">
                                <div v-if="proceedingsPublication?.proceedingsPublicationType">
                                    {{ $t("concretePublicationTypeLabel") }}:
                                </div>
                                <div v-if="proceedingsPublication?.proceedingsPublicationType" class="response">
                                    {{ getTitleFromValue(proceedingsPublication.proceedingsPublicationType, publicationTypes) }}
                                </div>
                                <div v-if="proceedingsPublication?.eventId">
                                    {{ $t("conferenceLabel") }}:
                                </div>
                                <div v-if="proceedingsPublication?.eventId" class="response">
                                    <localized-link :to="'events/conference/' + proceedingsPublication?.eventId">
                                        {{ returnCurrentLocaleContent(event?.name) }}
                                    </localized-link>
                                </div>
                                <div v-if="proceedingsPublication?.proceedingsId">
                                    {{ $t("proceedingsLabel") }}:
                                </div>
                                <div v-if="proceedingsPublication?.proceedingsId" class="response">
                                    <localized-link :to="'proceedings/' + proceedingsPublication?.proceedingsId">
                                        {{ returnCurrentLocaleContent(proceedings?.title) }}
                                    </localized-link>
                                </div>
                                <div v-if="proceedingsPublication?.startPage">
                                    {{ $t("startPageLabel") }}:
                                </div>
                                <div v-if="proceedingsPublication?.startPage" class="response">
                                    {{ proceedingsPublication.startPage }}
                                </div>
                                <div v-if="proceedingsPublication?.endPage">
                                    {{ $t("endPageLabel") }}:
                                </div>
                                <div v-if="proceedingsPublication?.endPage" class="response">
                                    {{ proceedingsPublication.endPage }}
                                </div>
                                <div v-if="proceedingsPublication?.documentDate">
                                    {{ $t("yearOfPublicationLabel") }}:
                                </div>
                                <div v-if="proceedingsPublication?.documentDate" class="response">
                                    {{ localiseDate(proceedingsPublication.documentDate) }}
                                </div>
                            </v-col>
                            <v-col cols="6">
                                <div v-if="proceedingsPublication?.scopusId">
                                    Scopus ID:
                                </div>
                                <div v-if="proceedingsPublication?.scopusId" class="response">
                                    {{ proceedingsPublication.scopusId }}
                                </div>
                                <div v-if="proceedingsPublication?.doi">
                                    DOI:
                                </div>
                                <div v-if="proceedingsPublication?.doi" class="response">
                                    <identifier-link :identifier="proceedingsPublication.doi"></identifier-link>
                                </div>
                                <div v-if="proceedingsPublication?.openAlexId">
                                    Open Alex ID:
                                </div>
                                <div v-if="proceedingsPublication?.openAlexId" class="response">
                                    <identifier-link :identifier="proceedingsPublication.openAlexId" type="open_alex"></identifier-link>
                                </div>
                                <div v-if="proceedingsPublication?.articleNumber">
                                    {{ $t("articleNumberLabel") }}:
                                </div>
                                <div v-if="proceedingsPublication?.articleNumber" class="response">
                                    {{ proceedingsPublication.articleNumber }}
                                </div>
                                <div v-if="proceedingsPublication?.numberOfPages">
                                    {{ $t("numberOfPagesLabel") }}:
                                </div>
                                <div v-if="proceedingsPublication?.numberOfPages" class="response">
                                    {{ proceedingsPublication.numberOfPages }}
                                </div>
                                <div v-if="proceedingsPublication?.uris && proceedingsPublication?.uris.length > 0">
                                    {{ $t("uriInputLabel") }}:
                                </div>
                                <div class="response">
                                    <uri-list :uris="proceedingsPublication?.uris"></uri-list>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <document-action-box
            ref="actionsRef"
            :doi="proceedingsPublication?.doi"
            :document-id="parseInt(currentRoute.params.id as string)"
        />

        <tab-content-loader v-if="!proceedingsPublication" layout="list" />
        <v-tabs
            v-show="proceedingsPublication"
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
            <v-tab v-show="documentClassifications?.length > 0 || canEdit" value="assessments">
                {{ $t("assessmentsLabel") }}
            </v-tab>
        </v-tabs>

        <v-tabs-window
            v-show="proceedingsPublication"
            v-model="currentTab">
            <v-tabs-window-item value="additionalInfo">
                <!-- Keywords -->
                <keyword-list :keywords="proceedingsPublication?.keywords ? proceedingsPublication.keywords : []" :can-edit="canEdit" @search-keyword="searchKeyword($event)" @update="updateKeywords"></keyword-list>

                <!-- Description -->
                <description-section :description="proceedingsPublication?.description" :can-edit="canEdit" @update="updateDescription"></description-section>

                <attachment-section :document="proceedingsPublication" :can-edit="canEdit" :proofs="proceedingsPublication?.proofs" :file-items="proceedingsPublication?.fileItems"></attachment-section>    
            </v-tabs-window-item>
            <v-tabs-window-item value="contributions">
                <person-document-contribution-tabs
                    :document-id="proceedingsPublication?.id"
                    :contribution-list="proceedingsPublication?.contributions ? proceedingsPublication?.contributions : []"
                    :read-only="!canEdit"
                    @update="updateContributions"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="indicators">
                <indicators-section 
                    :indicators="documentIndicators" 
                    :applicable-types="[ApplicableEntityType.DOCUMENT]" 
                    :entity-id="proceedingsPublication?.id" 
                    :entity-type="ApplicableEntityType.DOCUMENT" 
                    :can-edit="canEdit"
                    show-statistics
                    :has-attached-files="proceedingsPublication?.fileItems && proceedingsPublication?.fileItems.length > 0"
                    @create="createIndicator"
                    @updated="fetchIndicators"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="assessments">
                <v-btn v-if="proceedingsPublication?.documentDate" density="compact" class="ml-5" @click="assessProceedingsPublication">
                    {{ $t("assessPublicationLabel") }}
                </v-btn>
                <entity-classification-view
                    :entity-classifications="documentClassifications"
                    :entity-id="proceedingsPublication?.id"
                    :can-edit="canClassify && proceedingsPublication?.documentDate !== ''"
                    :containing-entity-type="ApplicableEntityType.DOCUMENT"
                    :applicable-types="[ApplicableEntityType.DOCUMENT]"
                    @create="createClassification"
                    @update="fetchClassifications"
                />
            </v-tabs-window-item>
        </v-tabs-window>

        <publication-unbind-button
            v-if="canEdit && isResearcher"
            :document-id="(proceedingsPublication?.id as number)"
            @unbind="handleResearcherUnbind">
        </publication-unbind-button>

        <toast v-model="snackbar" :message="snackbarMessage" />
    </v-container>
</template>

<script lang="ts">
import { ApplicableEntityType, type LanguageTagResponse, type MultilingualContent } from '@/models/Common';
import { computed, onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { watch } from 'vue';
import type { DocumentPublicationIndex, PersonDocumentContribution, ProceedingsPublicationType } from '@/models/PublicationModel';
import LanguageService from '@/services/LanguageService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { ProceedingsPublication } from '@/models/PublicationModel';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import PersonDocumentContributionTabs from '@/components/core/PersonDocumentContributionTabs.vue';
import KeywordList from '@/components/core/KeywordList.vue';
import DescriptionSection from '@/components/core/DescriptionSection.vue';
import type { Conference } from '@/models/EventModel';
import EventService from '@/services/EventService';
import { addAttachment, updateAttachment, deleteAttachment } from "@/utils/AttachmentUtil";
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import type { ProceedingsResponse } from '@/models/ProceedingsModel';
import ProceedingsService from '@/services/ProceedingsService';
import { getTitleFromValue, getTypesForGivenLocale } from "@/i18n/proceedingsPublicationType";
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import { localiseDate } from '@/i18n/dateLocalisation';
import UriList from '@/components/core/UriList.vue';
import IdentifierLink from '@/components/core/IdentifierLink.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import AttachmentSection from '@/components/core/AttachmentSection.vue';
import ProceedingsPublicationUpdateForm from '@/components/publication/update/ProceedingsPublicationUpdateForm.vue';
import PublicationUnbindButton from '@/components/publication/PublicationUnbindButton.vue';
import StatisticsService from '@/services/StatisticsService';
import EntityIndicatorService from '@/services/assessment/EntityIndicatorService';
import { type DocumentAssessmentClassification, type DocumentIndicator, type EntityClassificationResponse, type EntityIndicatorResponse, StatisticsType } from '@/models/AssessmentModel';
import Toast from '@/components/core/Toast.vue';
import { useLoginStore } from '@/stores/loginStore';
import EntityClassificationService from '@/services/assessment/EntityClassificationService';
import EntityClassificationView from '@/components/assessment/classifications/EntityClassificationView.vue';
import AssessmentClassificationService from '@/services/assessment/AssessmentClassificationService';
import RichTitleRenderer from '@/components/core/RichTitleRenderer.vue';
import { useUserRole } from '@/composables/useUserRole';
import Wordcloud from '@/components/core/Wordcloud.vue';
import BasicInfoLoader from '@/components/core/BasicInfoLoader.vue';
import TabContentLoader from '@/components/core/TabContentLoader.vue';
import { useDocumentAssessmentActions } from '@/composables/useDocumentAssessmentActions';
import IndicatorsSection from '@/components/assessment/indicators/IndicatorsSection.vue';
import DocumentActionBox from '@/components/publication/DocumentActionBox.vue';


export default defineComponent({
    name: "ProceedingsPublicationLandingPage",
    components: { AttachmentSection, PersonDocumentContributionTabs, Toast, KeywordList, DescriptionSection, LocalizedLink, GenericCrudModal, UriList, IdentifierLink, PublicationUnbindButton, EntityClassificationView, RichTitleRenderer, Wordcloud, BasicInfoLoader, TabContentLoader, DocumentActionBox, IndicatorsSection },
    setup() {
        const currentTab = ref("contributions");

        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const { isResearcher } = useUserRole();
        const canEdit = ref(false);
        const canClassify = ref(false);

        const proceedingsPublication = ref<ProceedingsPublication>();
        const languageTagMap = ref<Map<number, LanguageTagResponse>>(new Map());
        
        const event = ref<Conference>();
        const proceedings = ref<ProceedingsResponse>();

        const publications = ref<DocumentPublicationIndex[]>([]);
        const totalPublications = ref<number>(0);

        const i18n = useI18n();
        const publicationTypes = computed((): { title: string, value: ProceedingsPublicationType }[] => (getTypesForGivenLocale() as { title: string; value: ProceedingsPublicationType; }[]));

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
                });

                EntityClassificationService.canClassifyDocument(parseInt(currentRoute.params.id as string)).then((response) => {
                    canClassify.value = response.data;
                });

                fetchClassifications();
            }

            fetchProceedingsPublication();
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

        const fetchProceedingsPublication = () => {
            DocumentPublicationService.readProceedingsPublication(parseInt(currentRoute.params.id as string)).then((response) => {
                proceedingsPublication.value = response.data;

                document.title = returnCurrentLocaleContent(proceedingsPublication.value.title) as string;

                proceedingsPublication.value?.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);

                EventService.readConference(proceedingsPublication.value.eventId as number).then((eventResponse) => {
                    event.value = eventResponse.data;
                });

                ProceedingsService.readProceedings(proceedingsPublication.value.proceedingsId as number).then((eventResponse) => {
                    proceedings.value = eventResponse.data;
                });
    
                populateData();
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
            proceedingsPublication.value!.keywords = keywords;
            performUpdate(false);
        };

        const updateDescription = (description: MultilingualContent[]) => {
            proceedingsPublication.value!.description = description;
            performUpdate(false);
        };

        const updateContributions = (contributions: PersonDocumentContribution[]) => {
            proceedingsPublication.value!.contributions = contributions;
            performUpdate(true);
        };

        const updateBasicInfo = (basicInfo: ProceedingsPublication) => {
            proceedingsPublication.value!.title = basicInfo.title;
            proceedingsPublication.value!.subTitle = basicInfo.subTitle;
            proceedingsPublication.value!.doi = basicInfo.doi;
            proceedingsPublication.value!.scopusId = basicInfo.scopusId;
            proceedingsPublication.value!.uris = basicInfo.uris;
            proceedingsPublication.value!.eventId = basicInfo.eventId;
            proceedingsPublication.value!.proceedingsId = basicInfo.proceedingsId;
            proceedingsPublication.value!.startPage = basicInfo.startPage;
            proceedingsPublication.value!.endPage = basicInfo.endPage;
            proceedingsPublication.value!.numberOfPages = basicInfo.numberOfPages;
            proceedingsPublication.value!.articleNumber = basicInfo.articleNumber;
            proceedingsPublication.value!.proceedingsPublicationType = basicInfo.proceedingsPublicationType;
            proceedingsPublication.value!.openAlexId = basicInfo.openAlexId;

            performUpdate(true);
        };

        const performUpdate = (reload: boolean) => {
            DocumentPublicationService.updateProceedingsPublication(proceedingsPublication.value?.id as number, proceedingsPublication.value as ProceedingsPublication).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                if(reload) {
                    fetchProceedingsPublication();
                    assessProceedingsPublication();
                }
            }).catch((error) => {
                snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
                if(reload) {
                    fetchProceedingsPublication();
                    assessProceedingsPublication();
                }
            });
        };

        const handleResearcherUnbind = () => {
            snackbarMessage.value = i18n.t("unbindSuccessfullMessage");
            snackbar.value = true;
            fetchDisplayData();
        };

        const assessProceedingsPublication = () => {
            AssessmentClassificationService.assessProceedingsPublication(parseInt(currentRoute.params.id as string)).then(() => {
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

        return {
            proceedingsPublication, icon, publications, event,
            totalPublications, returnCurrentLocaleContent, isResearcher,
            languageTagMap, localiseDate, ProceedingsPublicationUpdateForm,
            searchKeyword, goToURL, canEdit, proceedings, getTitleFromValue,
            addAttachment, deleteAttachment, updateAttachment, publicationTypes,
            updateKeywords, updateDescription, snackbar, snackbarMessage,
            updateContributions, updateBasicInfo, handleResearcherUnbind,
            StatisticsType, documentIndicators, currentTab, ApplicableEntityType,
            documentClassifications, assessProceedingsPublication,
            fetchClassifications, canClassify, createClassification,
            currentRoute, actionsRef, fetchIndicators, createIndicator
        };
}})

</script>

<style scoped>
    #proceedingsPublication .large-proceedingsPublication-icon {
        font-size: 10em;
    }

    #proceedingsPublication .response {
        font-size: 1.2rem;
        margin-bottom: 10px;
        font-weight: bold;
    }

    .edit-pen-container {
        position:relative;
    }
</style>
