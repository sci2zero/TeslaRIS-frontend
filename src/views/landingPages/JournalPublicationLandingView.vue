<template>
    <v-container id="journalPublication">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        {{ returnCurrentLocaleContent(journalPublication?.title) }}
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
                <v-icon size="x-large" class="large-journalPublication-icon">
                    {{ icon }}
                </v-icon>
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
                            :read-only="!canEdit"
                            @update="updateBasicInfo"
                        />

                        <!-- Basic Info -->
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>
                        <v-row>
                            <v-col cols="6">
                                <div v-if="journalPublication?.journalPublicationType">
                                    {{ $t("typeOfPublicationLabel") }}:
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
                                    {{ journalPublication.scopusId }}
                                </div>
                                <div v-if="journalPublication?.doi">
                                    DOI:
                                </div>
                                <div v-if="journalPublication?.doi" class="response">
                                    <identifier-link :identifier="journalPublication.doi"></identifier-link>
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

        <v-tabs
            v-model="currentTab"
            color="deep-purple-accent-4"
            align-tabs="start"
        >
            <v-tab value="additionalInfo">
                {{ $t("additionalInfoLabel") }}
            </v-tab>
            <v-tab v-if="canEdit || (journalPublication?.contributions && journalPublication?.contributions.length > 0)" value="contributions">
                {{ $t("contributionsLabel") }}
            </v-tab>
            <v-tab v-if="documentIndicators?.length > 0" value="indicators">
                {{ $t("indicatorListLabel") }}
            </v-tab>
            <v-tab v-if="documentClassifications?.length > 0 || canEdit" value="assessments">
                {{ $t("assessmentsLabel") }}
            </v-tab>
        </v-tabs>

        <v-tabs-window v-model="currentTab">
            <v-tabs-window-item value="additionalInfo">
                <!-- Keywords -->
                <keyword-list :keywords="journalPublication?.keywords ? journalPublication.keywords : []" :can-edit="canEdit" @search-keyword="searchKeyword($event)" @update="updateKeywords"></keyword-list>

                <!-- Description -->
                <description-section :description="journalPublication?.description" :can-edit="canEdit" @update="updateDescription"></description-section>

                <attachment-section :document="journalPublication" :can-edit="canEdit" :proofs="journalPublication?.proofs" :file-items="journalPublication?.fileItems"></attachment-section>
            </v-tabs-window-item>
            <v-tabs-window-item value="contributions">
                <person-document-contribution-tabs :document-id="journalPublication?.id" :contribution-list="journalPublication?.contributions ? journalPublication?.contributions : []" :read-only="!canEdit" @update="updateContributions"></person-document-contribution-tabs>
            </v-tabs-window-item>
            <v-tabs-window-item value="indicators">
                <div class="w-50 statistics">
                    <statistics-view :entity-indicators="documentIndicators" :statistics-type="StatisticsType.VIEW"></statistics-view>
                    <statistics-view :entity-indicators="documentIndicators" :statistics-type="StatisticsType.DOWNLOAD"></statistics-view>
                </div>
            </v-tabs-window-item>
            <v-tabs-window-item value="assessments">
                <v-btn v-if="journalPublication?.documentDate" density="compact" @click="assessJournalPublication">
                    {{ $t("assessPublicationLabel") }}
                </v-btn>
                <entity-classification-view
                    :entity-classifications="documentClassifications"
                    :entity-id="journalPublication?.id"
                    :can-edit="false"
                    :containing-entity-type="ApplicableEntityType.DOCUMENT"
                    :applicable-types="[ApplicableEntityType.DOCUMENT]"
                />
            </v-tabs-window-item>
        </v-tabs-window>

        <publication-unbind-button v-if="canEdit && userRole === 'RESEARCHER'" :document-id="(journalPublication?.id as number)" @unbind="handleResearcherUnbind"></publication-unbind-button>

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
import type { DocumentPublicationIndex, PersonDocumentContribution } from '@/models/PublicationModel';
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
import { localiseDate } from '@/i18n/dateLocalisation';
import UriList from '@/components/core/UriList.vue';
import IdentifierLink from '@/components/core/IdentifierLink.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import AttachmentSection from '@/components/core/AttachmentSection.vue';
import JournalPublicationUpdateForm from '@/components/publication/update/JournalPublicationUpdateForm.vue';
import PublicationUnbindButton from '@/components/publication/PublicationUnbindButton.vue';
import UserService from '@/services/UserService';
import StatisticsService from '@/services/StatisticsService';
import EntityIndicatorService from '@/services/assessment/EntityIndicatorService';
import { type EntityClassificationResponse, StatisticsType, type EntityIndicatorResponse } from '@/models/AssessmentModel';
import StatisticsView from '@/components/assessment/statistics/StatisticsView.vue';
import Toast from '@/components/core/Toast.vue';
import EntityClassificationService from '@/services/assessment/EntityClassificationService';
import EntityClassificationView from '@/components/assessment/classifications/EntityClassificationView.vue';
import AssessmentClassificationService from '@/services/assessment/AssessmentClassificationService';


export default defineComponent({
    name: "JournalPublicationLandingPage",
    components: { AttachmentSection, PersonDocumentContributionTabs, Toast, KeywordList, DescriptionSection, LocalizedLink, GenericCrudModal, UriList, IdentifierLink, StatisticsView, PublicationUnbindButton, EntityClassificationView },
    setup() {
        const currentTab = ref("contributions");

        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const userRole = computed(() => UserService.provideUserRole());
        const canEdit = ref(false);

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

        onMounted(() => {
            fetchDisplayData();
        });

        const fetchDisplayData = () => {
            DocumentPublicationService.canEdit(parseInt(currentRoute.params.id as string)).then((response) => {
                canEdit.value = response.data;
            }).catch(() => {
                canEdit.value = false;
            });

            fetchJournalPublication();
            StatisticsService.registerDocumentView(parseInt(currentRoute.params.id as string));

            fetchIndicators();
            fetchClassifications();
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
            DocumentPublicationService.readJournalPublication(parseInt(currentRoute.params.id as string)).then((response) => {
                journalPublication.value = response.data;

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
            });
        };

        const populateData = () => {
            LanguageService.getAllLanguageTags().then(response => {
                response.data.forEach(languageTag => {
                    languageTagMap.value.set(languageTag.id, languageTag);
                })
            });
        };

        const searchKeyword = (keyword: string) => {
            router.push({name:"advancedSearch", query: { searchQuery: keyword.trim(), tab: "publications" }});
        };

        const goToURL = (uri: string) => {
            window.open(uri, '_blank');
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

            performUpdate(true);
        };

        const performUpdate = (reload: boolean) => {
            DocumentPublicationService.updateJournalPublication(journalPublication.value?.id as number, journalPublication.value as JournalPublication).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                if(reload) {
                    fetchJournalPublication();
                }
            }).catch((error) => {
                snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
                if(reload) {
                    fetchJournalPublication();
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

        return {
            journalPublication, icon,
            publications, event, totalPublications, userRole,
            returnCurrentLocaleContent, handleResearcherUnbind,
            languageTagMap, journal, JournalPublicationUpdateForm,
            StatisticsType, documentIndicators, currentTab,
            searchKeyword, goToURL, canEdit, localiseDate,
            addAttachment, deleteAttachment, updateAttachment,
            updateKeywords, updateDescription, snackbar, snackbarMessage,
            updateContributions, updateBasicInfo, getTitleFromValueAutoLocale,
            ApplicableEntityType, documentClassifications, assessJournalPublication
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
