<template>
    <v-container id="proceedings">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        <v-skeleton-loader
                            :loading="!proceedings"
                            type="heading"
                            color="blue-lighten-3"
                            class="d-flex justify-center align-center"
                        >
                            <p class="text-h5">
                                {{ returnCurrentLocaleContent(proceedings?.title) }}
                            </p>
                        </v-skeleton-loader>
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ returnCurrentLocaleContent(proceedings?.subTitle) }}
                        <br />
                        {{ $t("proceedingsLabel") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- Proceedings Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon size="x-large" class="large-proceedings-icon">
                    {{ icon }}
                </v-icon>
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="secondary">
                    <v-card-text class="edit-pen-container">
                        <generic-crud-modal
                            :form-component="ProceedingsUpdateForm"
                            :form-props="{ presetProceedings: proceedings}"
                            entity-name="Proceedings"
                            is-update
                            is-section-update
                            :read-only="!canEdit"
                            @update="updateBasicInfo"
                        />

                        <!-- Basic Info -->
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>
                        <basic-info-loader v-if="!proceedings" :citation-button="false" />
                        <v-row v-else>
                            <v-col cols="6">
                                <div v-if="proceedings?.eventId">
                                    {{ $t("conferenceLabel") }}:
                                </div>
                                <div v-if="proceedings?.eventId" class="response">
                                    <localized-link :to="'events/conference/' + proceedings?.eventId">
                                        {{ returnCurrentLocaleContent(event?.name) }}
                                    </localized-link>
                                </div>
                                <div v-if="proceedings?.publisherId">
                                    {{ $t("publisherLabel") }}:
                                </div>
                                <div v-if="proceedings?.publisherId" class="response">
                                    <localized-link :to="'publishers/' + proceedings?.publisherId">
                                        {{ returnCurrentLocaleContent(publisher?.name) }}
                                    </localized-link>
                                </div>
                                <div v-if="proceedings?.publicationSeriesId">
                                    {{ $t("publicationSeriesLabel") }}:
                                </div>
                                <div v-if="proceedings?.publicationSeriesId" class="response">
                                    <localized-link :to="`${publicationSeriesType.toString() === '0' ? 'journals' : 'book-series'}/` + proceedings?.publicationSeriesId">
                                        {{ returnCurrentLocaleContent(publicationSeries?.title) }}
                                    </localized-link>
                                </div>
                                <div v-if="proceedings?.documentDate">
                                    {{ $t("yearOfPublicationLabel") }}:
                                </div>
                                <div v-if="proceedings?.documentDate" class="response">
                                    {{ localiseDate(proceedings.documentDate) }}
                                </div>
                                <div v-if="proceedings?.publicationSeriesVolume">
                                    {{ $t("publicationSeriesVolumeLabel") }}:
                                </div>
                                <div v-if="proceedings?.publicationSeriesVolume" class="response">
                                    {{ proceedings.publicationSeriesVolume }}
                                </div>
                                <div v-if="proceedings?.publicationSeriesIssue">
                                    {{ $t("publicationSeriesIssueLabel") }}:
                                </div>
                                <div v-if="proceedings?.publicationSeriesIssue" class="response">
                                    {{ proceedings.publicationSeriesIssue }}
                                </div>
                                <div v-if="proceedings?.languageTagIds && proceedings?.languageTagIds.length > 0">
                                    {{ $t("languageLabel") }}:
                                </div>
                                <div>
                                    <v-chip v-for="(languageTagId, index) in proceedings?.languageTagIds" :key="index" outlined>
                                        {{ languageTagMap.get(languageTagId)?.display }}
                                    </v-chip>
                                </div>
                            </v-col>
                            <v-col cols="6">
                                <div v-if="proceedings?.eISBN">
                                    E-ISBN:
                                </div>
                                <div v-if="proceedings?.eISBN" class="response">
                                    {{ proceedings.eISBN }}
                                </div>
                                <div v-if="proceedings?.printISBN">
                                    Print ISBN:
                                </div>
                                <div v-if="proceedings?.printISBN" class="response">
                                    {{ proceedings.printISBN }}
                                </div>
                                <div v-if="proceedings?.scopusId">
                                    Scopus ID:
                                </div>
                                <div v-if="proceedings?.scopusId" class="response">
                                    {{ proceedings.scopusId }}
                                </div>
                                <div v-if="proceedings?.doi">
                                    DOI:
                                </div>
                                <div v-if="proceedings?.doi" class="response">
                                    <identifier-link :identifier="proceedings.doi"></identifier-link>
                                </div>
                                <div v-if="proceedings?.openAlexId">
                                    Open Alex ID:
                                </div>
                                <div v-if="proceedings?.openAlexId" class="response">
                                    <identifier-link :identifier="proceedings.openAlexId" type="open_alex"></identifier-link>
                                </div>
                                <div v-if="proceedings?.numberOfPages">
                                    {{ $t("numberOfPagesLabel") }}:
                                </div>
                                <div v-if="proceedings?.numberOfPages" class="response">
                                    {{ proceedings.numberOfPages }}
                                </div>
                                <div v-if="proceedings?.uris && proceedings?.uris.length > 0">
                                    {{ $t("uriInputLabel") }}:
                                </div>
                                <div class="response">
                                    <uri-list :uris="proceedings?.uris"></uri-list>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <publication-badge-section
            :preloaded-doi="proceedings?.doi"
            :document-id="proceedings?.id"
        />

        <br />
        <tab-content-loader v-if="!proceedings" :tab-number="3" layout="list" />
        <v-tabs
            v-show="proceedings"
            v-model="currentTab"
            color="deep-purple-accent-4"
            align-tabs="start"
        >
            <v-tab value="publications">
                {{ $t("scientificResultsListLabel") }}
            </v-tab>
            <v-tab value="additionalInfo">
                {{ $t("additionalInfoLabel") }}
            </v-tab>
            <v-tab value="contributions">
                {{ $t("boardAndReviewersLabel") }}
            </v-tab>
            <v-tab v-if="documentIndicators?.length > 0" value="indicators">
                {{ $t("indicatorListLabel") }}
            </v-tab>
        </v-tabs>

        <v-tabs-window
            v-show="proceedings"
            v-model="currentTab"
        >
            <v-tabs-window-item value="publications">
                <h2>{{ $t("proceedingsPublicationsLabel") }}</h2>
                <publication-table-component
                    :publications="publications"
                    :total-publications="totalPublications"
                    in-comparator
                    show-publication-concrete-type
                    @switch-page="switchPage">
                </publication-table-component>
            </v-tabs-window-item>
            <v-tabs-window-item value="additionalInfo">
                <!-- Keywords -->
                <br />
                <keyword-list
                    :keywords="proceedings?.keywords ? proceedings.keywords : []"
                    :can-edit="canEdit"
                    @search-keyword="searchKeyword($event)"
                    @update="updateKeywords">
                </keyword-list>

                <!-- Description -->
                <description-section
                    :description="proceedings?.description"
                    :can-edit="canEdit"
                    @update="updateDescription">
                </description-section>

                <br />
                <attachment-section
                    :document="proceedings"
                    :can-edit="canEdit"
                    :proofs="proceedings?.proofs"
                    :file-items="proceedings?.fileItems">
                </attachment-section>
            </v-tabs-window-item>
            <v-tabs-window-item value="contributions">
                <person-document-contribution-tabs
                    :document-id="proceedings?.id"
                    :contribution-list="proceedings?.contributions ? proceedings?.contributions : []"
                    :read-only="!canEdit"
                    shows-board-and-reviewers
                    @update="updateContributions">
                </person-document-contribution-tabs>
            </v-tabs-window-item>
            <v-tabs-window-item value="indicators">
                <indicators-section 
                    :indicators="documentIndicators" 
                    :applicable-types="[ApplicableEntityType.DOCUMENT]" 
                    :entity-id="proceedings?.id" 
                    :entity-type="ApplicableEntityType.DOCUMENT" 
                    :can-edit="canEdit"
                    show-statistics
                    :has-attached-files="proceedings?.fileItems && proceedings?.fileItems.length > 0"
                    @create="createIndicator"
                    @updated="fetchIndicators"
                />
            </v-tabs-window-item>
        </v-tabs-window>

        <publication-unbind-button
            v-if="canEdit && isResearcher"
            :document-id="(proceedings?.id as number)"
            @unbind="handleResearcherUnbind">
        </publication-unbind-button>

        <toast v-model="snackbar" :message="snackbarMessage" />
    </v-container>
</template>

<script lang="ts">
import { ApplicableEntityType, type LanguageTagResponse, type MultilingualContent } from '@/models/Common';
import { onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { watch } from 'vue';
import type { DocumentPublicationIndex, PersonDocumentContribution } from '@/models/PublicationModel';
import LanguageService from '@/services/LanguageService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import PersonDocumentContributionTabs from '@/components/core/PersonDocumentContributionTabs.vue';
import KeywordList from '@/components/core/KeywordList.vue';
import DescriptionSection from '@/components/core/DescriptionSection.vue';
import type { Conference } from '@/models/EventModel';
import EventService from '@/services/EventService';
import { addAttachment, updateAttachment, deleteAttachment } from "@/utils/AttachmentUtil";
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import ProceedingsService from '@/services/ProceedingsService';
import { useRoute, useRouter } from 'vue-router';
import type { Proceedings } from '@/models/ProceedingsModel';
import PublisherService from '@/services/PublisherService';
import type { Publisher } from '@/models/PublisherModel';
import { PublicationSeriesType, type PublicationSeries } from '@/models/PublicationSeriesModel';
import JournalService from '@/services/JournalService';
import BookSeriesService from '@/services/BookSeriesService';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import UriList from '@/components/core/UriList.vue';
import IdentifierLink from '@/components/core/IdentifierLink.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import PublicationTableComponent from '@/components/publication/PublicationTableComponent.vue';
import { localiseDate } from '@/i18n/dateLocalisation';
import AttachmentSection from '@/components/core/AttachmentSection.vue';
import ProceedingsUpdateForm from '@/components/proceedings/update/ProceedingsUpdateForm.vue';
import PublicationUnbindButton from '@/components/publication/PublicationUnbindButton.vue';
import StatisticsService from '@/services/StatisticsService';
import EntityIndicatorService from '@/services/assessment/EntityIndicatorService';
import { type DocumentIndicator, StatisticsType, type EntityIndicatorResponse } from '@/models/AssessmentModel';
import Toast from '@/components/core/Toast.vue';
import { useLoginStore } from '@/stores/loginStore';
import { useUserRole } from '@/composables/useUserRole';
import BasicInfoLoader from '@/components/core/BasicInfoLoader.vue';
import TabContentLoader from '@/components/core/TabContentLoader.vue';
import PublicationBadgeSection from '@/components/publication/PublicationBadgeSection.vue';
import IndicatorsSection from '@/components/assessment/indicators/IndicatorsSection.vue';


export default defineComponent({
    name: "ProceedingsLandingPage",
    components: { AttachmentSection, Toast, PersonDocumentContributionTabs, KeywordList, DescriptionSection, LocalizedLink, GenericCrudModal, UriList, IdentifierLink, PublicationTableComponent, PublicationUnbindButton, BasicInfoLoader, TabContentLoader, PublicationBadgeSection, IndicatorsSection },
    setup() {
        const currentTab = ref("");

        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const { isResearcher } = useUserRole();
        const canEdit = ref(false);

        const proceedings = ref<Proceedings>();
        const languageTagMap = ref<Map<number, LanguageTagResponse>>(new Map());
        
        const event = ref<Conference>();
        const publisher = ref<Publisher>();
        
        const publicationSeries = ref<PublicationSeries>();
        const publicationSeriesType = ref<PublicationSeriesType>(PublicationSeriesType.JOURNAL);

        const publications = ref<DocumentPublicationIndex[]>([]);
        const totalPublications = ref<number>(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const i18n = useI18n();

        const icon = ref("mdi-newspaper-variant-multiple");

        const documentIndicators = ref<EntityIndicatorResponse[]>([]);

        const loginStore= useLoginStore();

        onMounted(() => {
            fetchDisplayData();
        });

        const fetchDisplayData = () => {
            if (loginStore.userLoggedIn) {
                DocumentPublicationService.canEdit(parseInt(currentRoute.params.id as string)).then((response) => {
                    canEdit.value = response.data;
                });
            }

            fetchProceedings(true);
            StatisticsService.registerDocumentView(parseInt(currentRoute.params.id as string));
            fetchIndicators();
        };

        const fetchIndicators = () => {
            EntityIndicatorService.fetchDocumentIndicators(parseInt(currentRoute.params.id as string)).then(response => {
                documentIndicators.value = response.data;
            });
        };

        watch(i18n.locale, () => {
            populateData();
        });

        const fetchProceedings = (uponStartup: boolean) => {
            ProceedingsService.readProceedings(parseInt(currentRoute.params.id as string)).then((response) => {
                proceedings.value = response.data;

                document.title = returnCurrentLocaleContent(proceedings.value.title) as string;

                proceedings.value?.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
    
                fetchConnectedEntities();

                populateData();
                
                if(uponStartup) {
                    Promise.all([fetchPublications()]).then(() => {
                        setStartTab();
                    });
                }
            });
        };

        const populateData = () => {
            LanguageService.getAllLanguageTags().then(response => {
                response.data.forEach(languageTag => {
                    languageTagMap.value.set(languageTag.id, languageTag);
                })
            });
        };

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            sort.value = sortField;
            direction.value = sortDir;
            fetchPublications();
        };

        const fetchPublications = () => {
            return DocumentPublicationService.findPublicationsInProceedings(proceedings.value?.id as number, `page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`).then((publicationResponse) => {
                publications.value = publicationResponse.data.content;
                totalPublications.value = publicationResponse.data.totalElements
            });
        };

        const fetchConnectedEntities = () => {
            EventService.readConference(proceedings.value?.eventId as number).then((eventResponse) => {
                    event.value = eventResponse.data;
                });

                if(proceedings.value?.publisherId) {
                    PublisherService.readPublisher(proceedings.value.publisherId).then((response) => {
                        publisher.value = response.data;
                    });
                }

                if(proceedings.value?.publicationSeriesId) {
                    JournalService.readJournal(proceedings.value.publicationSeriesId).then((journalResponse) => {
                        publicationSeries.value = journalResponse.data;
                        publicationSeriesType.value = PublicationSeriesType.JOURNAL;
                    }).catch(() => {
                        BookSeriesService.readBookSeries(proceedings.value?.publicationSeriesId as number).then((bookSeriesResponse) => {
                            publicationSeries.value = bookSeriesResponse.data;
                            publicationSeriesType.value = PublicationSeriesType.BOOK_SERIES;
                        });
                    });
                }
        };

        const searchKeyword = (keyword: string) => {
            router.push({name:"advancedSearch", query: { searchQuery: keyword.trim(), tab: "publications" }});
        };

        const goToURL = (uri: string) => {
            window.open(uri, "_blank");
        };

        const updateBasicInfo = (updatedInfo: Proceedings) => {
            proceedings.value!.title = updatedInfo.title;
            proceedings.value!.subTitle = updatedInfo.subTitle;
            proceedings.value!.description = updatedInfo.description;
            proceedings.value!.keywords = updatedInfo.keywords;
            proceedings.value!.uris = updatedInfo.uris;
            proceedings.value!.documentDate = updatedInfo.documentDate;
            proceedings.value!.doi = updatedInfo.doi;
            proceedings.value!.eISBN = updatedInfo.eISBN;
            proceedings.value!.eventId = updatedInfo.eventId;
            proceedings.value!.languageTagIds = updatedInfo.languageTagIds;
            proceedings.value!.numberOfPages = updatedInfo.numberOfPages;
            proceedings.value!.printISBN = updatedInfo.printISBN;
            proceedings.value!.publicationSeriesId = updatedInfo.publicationSeriesId;
            proceedings.value!.publicationSeriesIssue = updatedInfo.publicationSeriesIssue;
            proceedings.value!.publicationSeriesVolume = updatedInfo.publicationSeriesVolume;
            proceedings.value!.publisherId = updatedInfo.publisherId;
            proceedings.value!.scopusId = updatedInfo.scopusId;
            proceedings.value!.openAlexId = updatedInfo.openAlexId;
            performUpdate(false);
        };

        const updateKeywords = (keywords: MultilingualContent[]) => {
            proceedings.value!.keywords = keywords;
            performUpdate(false);
        };

        const updateDescription = (description: MultilingualContent[]) => {
            proceedings.value!.description = description;
            performUpdate(false);
        };

        const updateContributions = (contributions: PersonDocumentContribution[]) => {
            proceedings.value!.contributions = contributions;
            performUpdate(true);
        };

        const performUpdate = (reload: boolean) => {
            if (proceedings.value?.publicationSeriesId === 0) {
                proceedings.value.publicationSeriesId = undefined;
            }

            ProceedingsService.updateProceedings(proceedings.value?.id as number, proceedings.value as Proceedings).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                fetchConnectedEntities();
                if(reload) {
                    fetchProceedings(false);
                }
            }).catch((error) => {
                snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
                if(reload) {
                    fetchProceedings(false);
                }
            });
        };

        const setStartTab = () => {
            if(totalPublications.value > 0) {
                currentTab.value = "publications";
            } else {
                currentTab.value = "contributions";
            }
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

        return {
            proceedings, icon, fetchIndicators,
            publications, event, currentTab, createIndicator,
            totalPublications, switchPage, ApplicableEntityType,
            returnCurrentLocaleContent, localiseDate,
            languageTagMap, publicationSeriesType,
            searchKeyword, goToURL, canEdit, publisher,
            addAttachment, deleteAttachment, updateAttachment,
            updateKeywords, updateDescription, snackbar, snackbarMessage,
            publicationSeries, updateBasicInfo, updateContributions,
            ProceedingsUpdateForm, handleResearcherUnbind, isResearcher,
            documentIndicators, StatisticsType, currentRoute
        };
}})

</script>

<style scoped>
    #proceedings .large-proceedings-icon {
        font-size: 10em;
    }

    #proceedings .response {
        font-size: 1.2rem;
        margin-bottom: 10px;
        font-weight: bold;
    }

    .edit-pen-container {
        position:relative;
    }
</style>
