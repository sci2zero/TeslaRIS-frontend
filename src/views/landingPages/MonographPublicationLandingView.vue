<template>
    <v-container id="monographPublication">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        <v-skeleton-loader
                            :loading="!monographPublication"
                            type="heading"
                            color="blue-lighten-3"
                            class="text-center"
                        >
                            <rich-title-renderer :title="returnCurrentLocaleContent(monographPublication?.title)"></rich-title-renderer>
                        </v-skeleton-loader>
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ returnCurrentLocaleContent(monographPublication?.subTitle) }}
                        <br />
                        {{ $t("monographPublicationLabel") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- MonographPublication Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon v-if="!monographPublication" size="x-large" class="large-monographPublication-icon">
                    {{ icon }}
                </v-icon>
                <wordcloud v-else :for-document-id="monographPublication?.id" compact-icon />
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="secondary">
                    <v-card-text class="edit-pen-container">
                        <generic-crud-modal
                            :form-component="MonographPublicationUpdateForm"
                            :form-props="{ presetMonographPublication: monographPublication}"
                            entity-name="MonographPublication"
                            is-update
                            is-section-update
                            :read-only="!canEdit"
                            @update="updateBasicInfo"
                        />


                        <!-- Basic Info -->
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>
                        <basic-info-loader v-if="!monographPublication" />
                        <v-row v-else>
                            <v-col cols="6">
                                <citation-selector ref="citationRef" :document-id="parseInt(currentRoute.params.id as string)"></citation-selector>
                                <div v-if="monographPublication?.monographPublicationType">
                                    {{ $t("concretePublicationTypeLabel") }}:
                                </div>
                                <div v-if="monographPublication?.monographPublicationType" class="response">
                                    {{ getTitleFromValueAutoLocale(monographPublication.monographPublicationType) }}
                                </div>
                                <div v-if="monographPublication?.startPage">
                                    {{ $t("startPageLabel") }}:
                                </div>
                                <div v-if="monographPublication?.startPage" class="response">
                                    {{ monographPublication.startPage }}
                                </div>
                                <div v-if="monographPublication?.endPage">
                                    {{ $t("endPageLabel") }}:
                                </div>
                                <div v-if="monographPublication?.endPage" class="response">
                                    {{ monographPublication.endPage }}
                                </div>
                                <div v-if="monographPublication?.documentDate">
                                    {{ $t("yearOfPublicationLabel") }}:
                                </div>
                                <div v-if="monographPublication?.documentDate" class="response">
                                    {{ localiseDate(monographPublication.documentDate) }}
                                </div>
                                <div v-if="monographPublication?.monographId">
                                    {{ $t("monographLabel") }}:
                                </div>
                                <div v-if="monographPublication?.monographId" class="response">
                                    <localized-link :to="'scientific-results/monograph/' + monographPublication?.monographId">
                                        {{ returnCurrentLocaleContent(monograph?.title) }}
                                    </localized-link>
                                </div>
                                <div v-if="monographPublication?.eventId">
                                    {{ $t("conferenceLabel") }}:
                                </div>
                                <div v-if="monographPublication?.eventId" class="response">
                                    <localized-link :to="'events/conference/' + monographPublication?.eventId">
                                        {{ returnCurrentLocaleContent(event?.name) }}
                                    </localized-link>
                                </div>
                            </v-col>
                            <v-col cols="6">
                                <div v-if="monographPublication?.scopusId">
                                    Scopus ID:
                                </div>
                                <div v-if="monographPublication?.scopusId" class="response">
                                    {{ monographPublication.scopusId }}
                                </div>
                                <div v-if="monographPublication?.doi">
                                    DOI:
                                </div>
                                <div v-if="monographPublication?.doi" class="response">
                                    <identifier-link :identifier="monographPublication.doi"></identifier-link>
                                </div>
                                <div v-if="monographPublication?.openAlexId">
                                    Open Alex ID:
                                </div>
                                <div v-if="monographPublication?.openAlexId" class="response">
                                    <identifier-link :identifier="monographPublication.openAlexId" type="open_alex"></identifier-link>
                                </div>
                                <div v-if="monographPublication?.articleNumber">
                                    {{ $t("articleNumberLabel") }}:
                                </div>
                                <div v-if="monographPublication?.articleNumber" class="response">
                                    {{ monographPublication.articleNumber }}
                                </div>
                                <div v-if="monographPublication?.numberOfPages">
                                    {{ $t("numberOfPagesLabel") }}:
                                </div>
                                <div v-if="monographPublication?.numberOfPages" class="response">
                                    {{ monographPublication.numberOfPages }}
                                </div>
                                <div v-if="monographPublication?.uris && monographPublication?.uris.length > 0">
                                    {{ $t("uriInputLabel") }}:
                                </div>
                                <div class="response">
                                    <uri-list :uris="monographPublication?.uris"></uri-list>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <publication-badge-section
            :preloaded-doi="monographPublication?.doi"
        />

        <tab-content-loader v-if="!monographPublication" layout="sections" />
        <v-tabs
            v-show="monographPublication"
            v-model="currentTab"
            color="deep-purple-accent-4"
            align-tabs="start"
        >
            <v-tab value="additionalInfo">
                {{ $t("additionalInfoLabel") }}
            </v-tab>
            <v-tab v-if="canEdit || (monographPublication?.contributions && monographPublication?.contributions.length > 0)" value="contributions">
                {{ $t("contributionsLabel") }}
            </v-tab>
            <v-tab v-if="documentIndicators?.length > 0" value="indicators">
                {{ $t("indicatorListLabel") }}
            </v-tab>
            <v-tab v-if="documentClassifications?.length > 0 || canClassify" value="assessments">
                {{ $t("assessmentsLabel") }}
            </v-tab>
        </v-tabs>

        <v-tabs-window
            v-show="monographPublication"
            v-model="currentTab"
        >
            <v-tabs-window-item value="additionalInfo">
                <!-- Keywords -->
                <keyword-list :keywords="monographPublication?.keywords ? monographPublication.keywords : []" :can-edit="canEdit" @search-keyword="searchKeyword($event)" @update="updateKeywords"></keyword-list>

                <!-- Description -->
                <description-section :description="monographPublication?.description" :can-edit="canEdit" @update="updateDescription"></description-section>

                <attachment-section :document="monographPublication" :can-edit="canEdit" :proofs="monographPublication?.proofs" :file-items="monographPublication?.fileItems"></attachment-section>
            </v-tabs-window-item>
            <v-tabs-window-item value="contributions">
                <person-document-contribution-tabs :document-id="monographPublication?.id" :contribution-list="monographPublication?.contributions ? monographPublication?.contributions : []" :read-only="!canEdit" @update="updateContributions"></person-document-contribution-tabs>
            </v-tabs-window-item>
            <v-tabs-window-item value="indicators">
                <indicators-section 
                    :indicators="documentIndicators" 
                    :applicable-types="[ApplicableEntityType.DOCUMENT]" 
                    :entity-id="monographPublication?.id" 
                    :entity-type="ApplicableEntityType.DOCUMENT" 
                    :can-edit="canEdit"
                    show-statistics
                    @create="createIndicator"
                    @updated="fetchIndicators"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="assessments">
                <entity-classification-view
                    :entity-classifications="documentClassifications"
                    :entity-id="monographPublication?.id"
                    :can-edit="canClassify && monographPublication?.documentDate !== ''"
                    :containing-entity-type="ApplicableEntityType.DOCUMENT"
                    :applicable-types="[ApplicableEntityType.DOCUMENT]"
                    @create="createClassification"
                    @update="fetchClassifications"
                />
            </v-tabs-window-item>
        </v-tabs-window>

        <publication-unbind-button v-if="canEdit && isResearcher" :document-id="(monographPublication?.id as number)" @unbind="handleResearcherUnbind"></publication-unbind-button>

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
import type { DocumentPublicationIndex, PersonDocumentContribution } from '@/models/PublicationModel';
import LanguageService from '@/services/LanguageService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { MonographPublication } from '@/models/PublicationModel';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import PersonDocumentContributionTabs from '@/components/core/PersonDocumentContributionTabs.vue';
import KeywordList from '@/components/core/KeywordList.vue';
import DescriptionSection from '@/components/core/DescriptionSection.vue';
import type { Conference } from '@/models/EventModel';
import EventService from '@/services/EventService';
import { addAttachment, updateAttachment, deleteAttachment } from "@/utils/AttachmentUtil";
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import { getTitleFromValueAutoLocale } from '@/i18n/monographPublicationType';
import type { Monograph } from '@/models/PublicationModel';
import MonographService from '@/services/DocumentPublicationService';
import { localiseDate } from '@/i18n/dateLocalisation';
import UriList from '@/components/core/UriList.vue';
import IdentifierLink from '@/components/core/IdentifierLink.vue';
import AttachmentSection from '@/components/core/AttachmentSection.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import MonographPublicationUpdateForm from '@/components/publication/update/MonographPublicationUpdateForm.vue';
import PublicationUnbindButton from '@/components/publication/PublicationUnbindButton.vue';
import StatisticsService from '@/services/StatisticsService';
import { type DocumentAssessmentClassification, type DocumentIndicator, type EntityClassificationResponse, type EntityIndicatorResponse, StatisticsType } from '@/models/AssessmentModel';
import EntityIndicatorService from '@/services/assessment/EntityIndicatorService';
import Toast from '@/components/core/Toast.vue';
import { useLoginStore } from '@/stores/loginStore';
import CitationSelector from '@/components/publication/CitationSelector.vue';
import EntityClassificationService from '@/services/assessment/EntityClassificationService';
import EntityClassificationView from '@/components/assessment/classifications/EntityClassificationView.vue';
import IndicatorsSection from '@/components/assessment/indicators/IndicatorsSection.vue';
import RichTitleRenderer from '@/components/core/RichTitleRenderer.vue';
import { useUserRole } from '@/composables/useUserRole';
import Wordcloud from '@/components/core/Wordcloud.vue';
import BasicInfoLoader from '@/components/core/BasicInfoLoader.vue';
import TabContentLoader from '@/components/core/TabContentLoader.vue';
import PublicationBadgeSection from '@/components/publication/PublicationBadgeSection.vue';


export default defineComponent({
    name: "MonographPublicationLandingPage",
    components: { AttachmentSection, PersonDocumentContributionTabs, Toast, KeywordList, DescriptionSection, LocalizedLink, GenericCrudModal, UriList, IdentifierLink, PublicationUnbindButton, CitationSelector, EntityClassificationView, IndicatorsSection, RichTitleRenderer, Wordcloud, BasicInfoLoader, TabContentLoader, PublicationBadgeSection },
    setup() {
        const currentTab = ref("contributions");

        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const { isResearcher } = useUserRole();
        const canEdit = ref(false);
        const canClassify = ref(false);

        const monographPublication = ref<MonographPublication>();
        const languageTagMap = ref<Map<number, LanguageTagResponse>>(new Map());
        const event = ref<Conference>();
        const monograph = ref<Monograph>();

        const publications = ref<DocumentPublicationIndex[]>([]);
        const totalPublications = ref<number>(0);

        const i18n = useI18n();

        const icon = ref("mdi-newspaper-variant");

        const documentIndicators = ref<EntityIndicatorResponse[]>([]);
        const documentClassifications = ref<EntityClassificationResponse[]>([]);

        const loginStore = useLoginStore();

        const citationRef = ref<typeof CitationSelector>();

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

            fetchMonographPublication();
            StatisticsService.registerDocumentView(parseInt(currentRoute.params.id as string));
            fetchIndicators();
        };

        watch(i18n.locale, () => {
            populateData();
        });

        const fetchMonographPublication = () => {
            DocumentPublicationService.readMonographPublication(parseInt(currentRoute.params.id as string)).then((response) => {
                monographPublication.value = response.data;

                document.title = returnCurrentLocaleContent(monographPublication.value.title) as string;

                monographPublication.value?.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);

                if(monographPublication.value.eventId) {
                    EventService.readConference(monographPublication.value.eventId).then((eventResponse) => {
                        event.value = eventResponse.data;
                    })
                }

                MonographService.readMonograph(monographPublication.value.monographId as number).then(response => {
                    monograph.value = response.data;
                });
    
                populateData();
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
            citationRef.value?.fetchCitations();
        };

        const searchKeyword = (keyword: string) => {
            router.push({name:"advancedSearch", query: { searchQuery: keyword.trim(), tab: "publications" }});
        };

        const goToURL = (uri: string) => {
            window.open(uri, "_blank");
        };

        const updateKeywords = (keywords: MultilingualContent[]) => {
            monographPublication.value!.keywords = keywords;
            performUpdate(false);
        };

        const updateDescription = (description: MultilingualContent[]) => {
            monographPublication.value!.description = description;
            performUpdate(false);
        };

        const updateContributions = (contributions: PersonDocumentContribution[]) => {
            monographPublication.value!.contributions = contributions;
            performUpdate(true);
        };

        const updateBasicInfo = (basicInfo: MonographPublication) => {
            monographPublication.value!.title = basicInfo.title;
            monographPublication.value!.subTitle = basicInfo.subTitle;
            monographPublication.value!.documentDate = basicInfo.documentDate;
            monographPublication.value!.doi = basicInfo.doi;
            monographPublication.value!.scopusId = basicInfo.scopusId;
            monographPublication.value!.uris = basicInfo.uris;
            monographPublication.value!.eventId = basicInfo.eventId;
            monographPublication.value!.monographId = basicInfo.monographId;
            monographPublication.value!.startPage = basicInfo.startPage;
            monographPublication.value!.endPage = basicInfo.endPage;
            monographPublication.value!.numberOfPages = basicInfo.numberOfPages;
            monographPublication.value!.articleNumber = basicInfo.articleNumber;
            monographPublication.value!.monographPublicationType = basicInfo.monographPublicationType;
            monographPublication.value!.openAlexId = basicInfo.openAlexId;

            performUpdate(true);
        };

        const performUpdate = (reload: boolean) => {
            DocumentPublicationService.updateMonographPublication(monographPublication.value?.id as number, monographPublication.value as MonographPublication).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                if(reload) {
                    fetchMonographPublication();
                }
            }).catch((error) => {
                snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
                if(reload) {
                    fetchMonographPublication();
                }
            });
        };

        const handleResearcherUnbind = () => {
            snackbarMessage.value = i18n.t("unbindSuccessfullMessage");
            snackbar.value = true;
            fetchDisplayData();
        };

        const createIndicator = (documentIndicator: {indicator: DocumentIndicator, files: File[]}) => {
            EntityIndicatorService.createDocumentIndicator(documentIndicator.indicator).then((response) => {
                EntityIndicatorService.uploadFilesAndFetchIndicators(documentIndicator.files, response.data.id).then(() => {
                    fetchIndicators();
                });
            });
        };

        const createClassification = (documentClassification: DocumentAssessmentClassification) => {
            EntityClassificationService.createDocumentClassification(documentClassification).then(() => {
                fetchClassifications();
            });
        };

        return {
            monographPublication, publications, event, totalPublications,
            returnCurrentLocaleContent, handleResearcherUnbind,
            languageTagMap, monograph, MonographPublicationUpdateForm,
            searchKeyword, goToURL, canEdit, localiseDate, isResearcher,
            addAttachment, deleteAttachment, updateAttachment, icon,
            updateKeywords, updateDescription, snackbar, snackbarMessage,
            updateContributions, updateBasicInfo, getTitleFromValueAutoLocale,
            documentIndicators, StatisticsType, currentTab, currentRoute, citationRef,
            ApplicableEntityType, canClassify, documentClassifications,
            fetchClassifications, createClassification, fetchIndicators,
            createIndicator
        };
}})

</script>

<style scoped>
    #monographPublication .large-monographPublication-icon {
        font-size: 10em;
    }

    #monographPublication .response {
        font-size: 1.2rem;
        margin-bottom: 10px;
        font-weight: bold;
    }

    .edit-pen-container {
        position:relative;
    }
</style>
