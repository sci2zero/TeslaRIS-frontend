<template>
    <v-container id="monograph">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        <v-skeleton-loader
                            :loading="!monograph"
                            type="heading"
                            color="blue-lighten-3"
                            class="text-center"
                        >
                            <rich-title-renderer :title="returnCurrentLocaleContent(monograph?.title)"></rich-title-renderer>
                        </v-skeleton-loader>
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ returnCurrentLocaleContent(monograph?.subTitle) }}
                        <br />
                        {{ $t("monographLabel") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- Monograph Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon v-if="!monograph" size="x-large" class="large-monograph-icon">
                    {{ icon }}
                </v-icon>
                <wordcloud v-else :for-document-id="monograph?.id" compact-icon />
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="secondary">
                    <v-card-text class="edit-pen-container">
                        <generic-crud-modal
                            :form-component="MonographUpdateForm"
                            :form-props="{ presetMonograph: monograph}"
                            entity-name="Monograph"
                            is-update
                            is-section-update
                            :read-only="!canEdit"
                            @update="updateBasicInfo"
                        />

                        <!-- Basic Info -->
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>
                        <basic-info-loader v-if="!monograph" />
                        <v-row v-else>
                            <v-col cols="6">
                                <div v-if="monograph?.monographType">
                                    {{ $t("monographTypeLabel") }}:
                                </div>
                                <div v-if="monograph?.monographType" class="response">
                                    {{ getMonographTypeTitleFromValueAutoLocale(monograph.monographType) }}
                                </div>
                                <div v-if="monograph?.documentDate">
                                    {{ $t("yearOfPublicationLabel") }}:
                                </div>
                                <div v-if="monograph?.documentDate" class="response">
                                    {{ monograph.documentDate }}
                                </div>
                                <div v-if="monograph?.eisbn">
                                    eISBN:
                                </div>
                                <div v-if="monograph?.eisbn" class="response">
                                    {{ monograph.eisbn }}
                                </div>
                                <div v-if="monograph?.printISBN">
                                    Print ISBN:
                                </div>
                                <div v-if="monograph?.printISBN" class="response">
                                    {{ monograph.printISBN }}
                                </div>
                                <div v-if="monograph?.numberOfPages">
                                    {{ $t("numberOfPagesLabel") }}:
                                </div>
                                <div v-if="monograph?.numberOfPages" class="response">
                                    {{ monograph.numberOfPages }}
                                </div>
                                <div v-if="monograph?.volume">
                                    {{ $t("volumeLabel") }}:
                                </div>
                                <div v-if="monograph?.volume" class="response">
                                    {{ monograph.volume }}
                                </div>
                                <div v-if="monograph?.number">
                                    {{ $t("numberLabel") }}:
                                </div>
                                <div v-if="monograph?.number" class="response">
                                    {{ monograph.number }}
                                </div>
                                <div v-if="monograph?.publisherId || monograph?.authorReprint">
                                    {{ $t("publisherLabel") }}:
                                </div>
                                <div v-if="monograph?.publisherId" class="response">
                                    <localized-link :to="'publishers/' + monograph?.publisherId">
                                        {{ returnCurrentLocaleContent(publisher?.name) }}
                                    </localized-link>
                                </div>
                                <div v-else-if="monograph?.authorReprint" class="response">
                                    <localized-link to="scientific-results/author-reprints">
                                        {{ $t("authorReprintLabel") }}
                                    </localized-link>
                                </div>
                                <div v-if="monograph?.languageTagIds && monograph?.languageTagIds.length > 0">
                                    {{ $t("languageLabel") }}:
                                </div>
                                <div>
                                    <v-chip v-for="(languageTagId, index) in monograph?.languageTagIds" :key="index" outlined>
                                        {{ languageTagMap.get(languageTagId)?.display }}
                                    </v-chip>
                                </div>
                            </v-col>
                            <v-col cols="6">
                                <div v-if="monograph?.scopusId">
                                    Scopus ID:
                                </div>
                                <div v-if="monograph?.scopusId" class="response">
                                    {{ monograph.scopusId }}
                                </div>
                                <div v-if="monograph?.doi">
                                    DOI:
                                </div>
                                <div v-if="monograph?.doi" class="response">
                                    <identifier-link :identifier="monograph.doi"></identifier-link>
                                </div>
                                <div v-if="monograph?.openAlexId">
                                    Open Alex ID:
                                </div>
                                <div v-if="monograph?.openAlexId" class="response">
                                    <identifier-link :identifier="monograph.openAlexId" type="open_alex"></identifier-link>
                                </div>
                                <div v-if="monograph?.webOfScienceId">
                                    Web of Science ID:
                                </div>
                                <div v-if="monograph?.webOfScienceId" class="response">
                                    <identifier-link :identifier="monograph.webOfScienceId" type="web_of_science"></identifier-link>
                                </div>
                                <div v-if="monograph?.eventId">
                                    {{ $t("conferenceLabel") }}:
                                </div>
                                <div v-if="monograph?.eventId" class="response">
                                    <localized-link :to="'events/conference/' + monograph?.eventId">
                                        {{ returnCurrentLocaleContent(event?.name) }}
                                    </localized-link>
                                </div>
                                <div v-if="monograph?.publicationSeriesId">
                                    {{ $t("publicationSeriesLabel") }}:
                                </div>
                                <div v-if="monograph?.publicationSeriesId" class="response">
                                    <localized-link :to="`${publicationSeriesType.toString() === '0' ? 'journals' : 'book-series'}/` + monograph?.publicationSeriesId">
                                        {{ returnCurrentLocaleContent(publicationSeries?.title) }}
                                    </localized-link>
                                </div>
                                <div v-if="monograph?.uris && monograph?.uris.length > 0">
                                    {{ $t("uriInputLabel") }}:
                                </div>
                                <div class="response">
                                    <uri-list :uris="monograph?.uris"></uri-list>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <document-action-box
            ref="actionsRef"
            :doi="monograph?.doi"
            :can-edit="canEdit && !monograph?.isArchived"
            :could-archive="canEdit"
            :metadata-valid="monograph?.isMetadataValid"
            :files-valid="monograph?.areFilesValid"
            :document-id="parseInt(currentRoute.params.id as string)"
            :description="returnCurrentLocaleContent(monograph?.description)"
            :document="monograph"
            @update="fetchValidationStatus(monograph?.id as number, monograph as _Document)"
        />

        <tab-content-loader v-if="!monograph" layout="sections" />
        <v-tabs
            v-show="monograph"
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
            <v-tab value="researchArea">
                {{ $t("researchAreaLabel") }}
            </v-tab>
            <v-tab v-show="documentIndicators?.length > 0 || canEdit" value="indicators">
                {{ $t("indicatorListLabel") }}
            </v-tab>
            <v-tab v-show="documentClassifications?.length > 0 || canClassify" value="assessments">
                {{ $t("assessmentsLabel") }}
            </v-tab>
        </v-tabs>

        <v-tabs-window
            v-show="monograph"
            v-model="currentTab"
        >
            <v-tabs-window-item value="contributions">
                <person-document-contribution-tabs
                    :document-id="monograph?.id"
                    :contribution-list="monograph?.contributions ? monograph?.contributions : []"
                    :read-only="!canEdit || monograph?.isArchived"
                    @update="updateContributions">
                </person-document-contribution-tabs>
            </v-tabs-window-item>
            <v-tabs-window-item value="additionalInfo">
                <!-- Keywords -->
                <keyword-list
                    :keywords="monograph?.keywords ? monograph.keywords : []"
                    :can-edit="canEdit && !monograph?.isArchived"
                    @search-keyword="searchKeyword($event)"
                    @update="updateKeywords">
                </keyword-list>

                <!-- Description -->
                <description-section
                    :description="monograph?.description"
                    :can-edit="canEdit && !monograph?.isArchived"
                    @update="updateDescription">
                </description-section>
                
                <!-- Publications Table -->
                <v-row>
                    <v-col cols="12">
                        <h2>{{ $t("monographPublicationsLabel") }}</h2>
                        <publication-table-component
                            :publications="publications"
                            :total-publications="totalPublications"
                            in-comparator
                            show-publication-concrete-type
                            @switch-page="switchPage">
                        </publication-table-component>
                    </v-col>
                </v-row>

                <attachment-section
                    :document="monograph"
                    :can-edit="canEdit && !monograph?.isArchived"
                    :proofs="monograph?.proofs"
                    :file-items="monograph?.fileItems">
                </attachment-section>
            </v-tabs-window-item>
            <v-tabs-window-item value="researchArea">
                <v-row>
                    <v-col cols="12">
                        <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                            <v-card-text class="edit-pen-container">
                                <research-areas-update-modal
                                    :research-areas-hierarchy="researchAreaHierarchy ? [researchAreaHierarchy] : []"
                                    :read-only="!canEdit || monograph?.isArchived"
                                    limit-one
                                    @update="updateResearchAreas">
                                </research-areas-update-modal>
                                <div><b>{{ $t("researchAreasLabel") }}</b></div>
                                <research-area-hierarchy
                                    :research-areas="researchAreaHierarchy ? [researchAreaHierarchy] : []">
                                </research-area-hierarchy>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-tabs-window-item>
            <v-tabs-window-item value="indicators">
                <indicators-section 
                    :indicators="documentIndicators" 
                    :applicable-types="[ApplicableEntityType.MONOGRAPH]" 
                    :entity-id="monograph?.id" 
                    :entity-type="ApplicableEntityType.DOCUMENT" 
                    :can-edit="canEdit"
                    show-statistics
                    :has-attached-files="monograph?.fileItems && monograph?.fileItems.length > 0"
                    @create="createIndicator"
                    @updated="fetchIndicators"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="assessments">
                <entity-classification-view
                    :entity-classifications="documentClassifications"
                    :entity-id="monograph?.id"
                    :can-edit="((canClassify && monograph?.documentDate) as boolean)"
                    :containing-entity-type="ApplicableEntityType.DOCUMENT"
                    :applicable-types="[ApplicableEntityType.DOCUMENT]"
                    @create="createClassification"
                    @update="fetchClassifications"
                />
            </v-tabs-window-item>
        </v-tabs-window>

        <publication-unbind-button
            v-if="canEdit && isResearcher"
            :document-id="(monograph?.id as number)"
            @unbind="handleResearcherUnbind">
        </publication-unbind-button>

        <toast v-model="snackbar" :message="snackbarMessage" />

        <share-buttons
            v-if="monograph && isResearcher && canEdit"
            :title="(returnCurrentLocaleContent(monograph.title) as string)"
            :document-id="(monograph.id as number)"
            :document-type="PublicationType.MONOGRAPH"
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
import type { Monograph } from '@/models/PublicationModel';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import PersonDocumentContributionTabs from '@/components/core/PersonDocumentContributionTabs.vue';
import DescriptionSection from '@/components/core/DescriptionSection.vue';
import { addAttachment, updateAttachment, deleteAttachment } from "@/utils/AttachmentUtil";
import KeywordList from '@/components/core/KeywordList.vue';
import ResearchAreaService from '@/services/ResearchAreaService';
import type { ResearchArea } from '@/models/OrganisationUnitModel';
import ResearchAreaHierarchy from '@/components/core/ResearchAreaHierarchy.vue';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import { getMonographTypeTitleFromValueAutoLocale } from '@/i18n/monographType';
import { PublicationSeriesType, type PublicationSeries } from '@/models/PublicationSeriesModel';
import EventService from '@/services/EventService';
import type { Conference } from '@/models/EventModel';
import JournalService from '@/services/JournalService';
import BookSeriesService from '@/services/BookSeriesService';
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import UriList from '@/components/core/UriList.vue';
import IdentifierLink from '@/components/core/IdentifierLink.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import PublicationTableComponent from '@/components/publication/PublicationTableComponent.vue';
import AttachmentSection from '@/components/core/AttachmentSection.vue';
import MonographUpdateForm from '@/components/publication/update/MonographUpdateForm.vue';
import PublicationUnbindButton from '@/components/publication/PublicationUnbindButton.vue';
import StatisticsService from '@/services/StatisticsService';
import { type DocumentIndicator, StatisticsType, type EntityIndicatorResponse, type EntityClassificationResponse, type DocumentAssessmentClassification } from '@/models/AssessmentModel';
import EntityIndicatorService from '@/services/assessment/EntityIndicatorService';
import ResearchAreasUpdateModal from '@/components/core/ResearchAreasUpdateModal.vue';
import IndicatorsSection from '@/components/assessment/indicators/IndicatorsSection.vue';
import Toast from '@/components/core/Toast.vue';
import { useLoginStore } from '@/stores/loginStore';
import EntityClassificationService from '@/services/assessment/EntityClassificationService';
import EntityClassificationView from '@/components/assessment/classifications/EntityClassificationView.vue';
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
import PublisherService from '@/services/PublisherService';
import { type Publisher } from '@/models/PublisherModel';


export default defineComponent({
    name: "MonographLandingPage",
    components: { AttachmentSection, Toast, PersonDocumentContributionTabs, DescriptionSection, KeywordList, ResearchAreaHierarchy, GenericCrudModal, LocalizedLink, UriList, IdentifierLink, PublicationTableComponent, PublicationUnbindButton, ResearchAreasUpdateModal, IndicatorsSection, EntityClassificationView, RichTitleRenderer, Wordcloud, BasicInfoLoader, TabContentLoader, DocumentActionBox, ShareButtons },
    setup() {
        const currentTab = ref("contributions");

        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const monograph = ref<Monograph>();
        const languageTagMap = ref<Map<number, LanguageTagResponse>>(new Map());
        const publisher = ref<Publisher>();

        const { isResearcher } = useUserRole();
        const canEdit = ref(false);
        const canClassify = ref(false);

        const i18n = useI18n();

        const researchAreaHierarchy = ref<ResearchArea>();

        const icon = ref("mdi-book-open-page-variant");

        const event = ref<Conference>();
        const publicationSeries = ref<PublicationSeries>();
        const publicationSeriesType = ref<PublicationSeriesType>(PublicationSeriesType.JOURNAL);

        const publications = ref<DocumentPublicationIndex[]>([]);
        const totalPublications = ref<number>(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

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

            fetchMonograph();
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

        const fetchMonograph = () => {
            DocumentPublicationService.readMonograph(
                parseInt(currentRoute.params.id as string)
            ).then((response) => {
                monograph.value = response.data;

                injectFairSignposting(response.headers as AxiosResponseHeaders);

                document.title = returnCurrentLocaleContent(monograph.value.title) as string;

                monograph.value?.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
    
                fetchConnectedEntities();
                fetchPublications();
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

        const populateData = () => {
            LanguageService.getAllLanguageTags().then(response => {
                response.data.forEach(languageTag => {
                    languageTagMap.value.set(languageTag.id, languageTag);
                })
            });

            if (monograph.value?.researchAreaId) {
                ResearchAreaService.readResearchAreaHierarchy(monograph.value?.researchAreaId).then(response => {
                    researchAreaHierarchy.value = response.data;
                });
            }
            actionsRef.value?.fetchCitations();
        };

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            sort.value = sortField;
            direction.value = sortDir;
            fetchPublications();
        };

        const fetchPublications = () => {
            if (!monograph.value?.id) {
                return;
            }

            DocumentPublicationService.findPublicationsInMonograph(monograph.value?.id as number, `page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`).then((publicationResponse) => {
                publications.value = publicationResponse.data.content;
                totalPublications.value = publicationResponse.data.totalElements
            });
        };

        const fetchConnectedEntities = () => {
            if (monograph.value?.eventId) {
                EventService.readConference(monograph.value?.eventId as number).then((eventResponse) => {
                    event.value = eventResponse.data;
                });
            }

            if(monograph.value?.publicationSeriesId) {
                JournalService.readJournal(monograph.value.publicationSeriesId).then((journalResponse) => {
                    publicationSeries.value = journalResponse.data;
                    publicationSeriesType.value = PublicationSeriesType.JOURNAL;
                }).catch(() => {
                    BookSeriesService.readBookSeries(monograph.value?.publicationSeriesId as number).then((bookSeriesResponse) => {
                        publicationSeries.value = bookSeriesResponse.data;
                        publicationSeriesType.value = PublicationSeriesType.BOOK_SERIES;
                    });
                });
            }

            if(monograph.value?.publisherId) {
                PublisherService.readPublisher(monograph.value.publisherId).then(response => {
                    publisher.value = response.data;
                });
            }
        };

        const searchKeyword = (keyword: string) => {
            router.push({name:"advancedSearch", query: { searchQuery: keyword.trim(), tab: "publications" }});
        };

        const goToURL = (uri: string) => {
            window.open(uri, "_blank");
        }

        const updateKeywords = (keywords: MultilingualContent[]) => {
            monograph.value!.keywords = keywords;
            performUpdate(false);
        };

        const updateDescription = (description: MultilingualContent[]) => {
            monograph.value!.description = description;
            performUpdate(false);
        };

        const updateContributions = (contributions: PersonDocumentContribution[]) => {
            monograph.value!.contributions = contributions;
            performUpdate(true);
        };

        const updateResearchAreas = (researchAreaIds: number[]) => {
            monograph.value!.researchAreaId = researchAreaIds[0];

            performUpdate(true);
        };

        const updateBasicInfo = (basicInfo: Monograph) => {
            monograph.value!.title = basicInfo.title;
            monograph.value!.subTitle = basicInfo.subTitle;
            monograph.value!.documentDate = basicInfo.documentDate;
            monograph.value!.doi = basicInfo.doi;
            monograph.value!.scopusId = basicInfo.scopusId;
            monograph.value!.uris = basicInfo.uris;
            monograph.value!.number = basicInfo.number;
            monograph.value!.volume = basicInfo.volume;
            monograph.value!.researchAreaId = basicInfo.researchAreaId;
            monograph.value!.languageTagIds = basicInfo.languageTagIds;
            monograph.value!.publicationSeriesId = basicInfo.publicationSeriesId;
            monograph.value!.numberOfPages = basicInfo.numberOfPages;
            monograph.value!.eisbn = basicInfo.eisbn;
            monograph.value!.printISBN = basicInfo.printISBN;
            monograph.value!.openAlexId = basicInfo.openAlexId;
            monograph.value!.webOfScienceId = basicInfo.webOfScienceId;
            monograph.value!.publisherId = basicInfo.publisherId;
            monograph.value!.authorReprint = basicInfo.authorReprint;

            performUpdate(true);
        };

        const performUpdate = (reload: boolean) => {
            DocumentPublicationService.updateMonograph(monograph.value?.id as number, monograph.value as Monograph).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                if(reload) {
                    fetchMonograph();
                }
            }).catch((error) => {
                snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
                if(reload) {
                    fetchMonograph();
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
            monograph, icon, actionsRef,
            returnCurrentLocaleContent,
            languageTagMap, updateBasicInfo,
            searchKeyword, goToURL, canEdit,
            addAttachment, updateAttachment,
            updateKeywords, updateDescription,
            snackbar, snackbarMessage, event,
            researchAreaHierarchy, updateContributions,
            publicationSeries, publicationSeriesType,
            getMonographTypeTitleFromValueAutoLocale,
            switchPage, publications, totalPublications,
            MonographUpdateForm, deleteAttachment,
            handleResearcherUnbind, isResearcher,
            documentIndicators, StatisticsType,
            currentTab, updateResearchAreas,
            ApplicableEntityType, currentRoute,
            createIndicator, fetchIndicators,
            createClassification, fetchClassifications,
            documentClassifications, canClassify,
            fetchValidationStatus, PublicationType,
            publisher
        };
}})

</script>

<style scoped>
    #monograph .large-monograph-icon {
        font-size: 10em;
    }

    #monograph .response {
        font-size: 1.2rem;
        margin-bottom: 10px;
        font-weight: bold;
    }

    .edit-pen-container {
        position:relative;
    }
</style>
