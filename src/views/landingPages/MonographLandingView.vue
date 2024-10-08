<template>
    <v-container id="monograph">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        {{ returnCurrentLocaleContent(monograph?.title) }}
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
                <v-icon size="x-large" class="large-monograph-icon">
                    {{ icon }}
                </v-icon>
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="secondary">
                    <v-card-text class="edit-pen-container">
                        <monograph-update-modal :read-only="!canEdit" :preset-monograph="monograph" @update="updateBasicInfo"></monograph-update-modal>

                        <!-- Basic Info -->
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>
                        <v-row>
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
                                    <doi-link :doi="monograph.doi"></doi-link>
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

        <!-- Keywords -->
        <keyword-list :keywords="monograph?.keywords ? monograph.keywords : []" :can-edit="canEdit" @search-keyword="searchKeyword($event)" @update="updateKeywords"></keyword-list>

        <!-- Description -->
        <description-section :description="monograph?.description" :can-edit="canEdit" @update="updateDescription"></description-section>

        <!-- Research Area -->
        <v-row>
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div><b>{{ $t("researchAreasLabel") }}</b></div>
                        <research-area-hierarchy :research-areas="researchAreaHierarchy ? [researchAreaHierarchy] : []"></research-area-hierarchy>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        
        <person-document-contribution-tabs :document-id="monograph?.id" :contribution-list="monograph?.contributions ? monograph?.contributions : []" :read-only="!canEdit" @update="updateContributions"></person-document-contribution-tabs>

        <!-- Publications Table -->
        <v-row>
            <h2>{{ $t("monographPublicationsLabel") }}</h2>
            <v-col cols="12">
                <publication-table-component :publications="publications" :total-publications="totalPublications" in-comparator @switch-page="switchPage"></publication-table-component>
            </v-col>
        </v-row>

        <v-row>
            <h2>{{ $t("proofsLabel") }}</h2>
            <v-col cols="12">
                <attachment-list
                    :attachments="monograph?.proofs ? monograph.proofs : []" :can-edit="canEdit" is-proof @create="addAttachment($event, true, monograph)"
                    @delete="deleteAttachment($event, true, monograph)" @update="updateAttachment($event, true, monograph)"></attachment-list>
            </v-col>
        </v-row>
        <v-row>
            <h2>{{ $t("fileItemsLabel") }}</h2>
            <v-col cols="12">
                <attachment-list
                    :attachments="monograph?.fileItems ? monograph.fileItems : []" :can-edit="canEdit" @create="addAttachment($event, false, monograph)" @delete="deleteAttachment($event, false, monograph)"
                    @update="updateAttachment($event, false, monograph)"></attachment-list>
            </v-col>
        </v-row>

        <v-snackbar
            v-model="snackbar"
            :timeout="5000">
            {{ snackbarMessage }}
            <template #actions>
                <v-btn
                    color="blue"
                    variant="text"
                    @click="snackbar = false">
                    {{ $t("closeLabel") }}
                </v-btn>
            </template>
        </v-snackbar>
    </v-container>
</template>

<script lang="ts">
import type { LanguageTagResponse, MultilingualContent } from '@/models/Common';
import { onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { watch } from 'vue';
import type { DocumentPublicationIndex, PersonDocumentContribution } from '@/models/PublicationModel';
import LanguageService from '@/services/LanguageService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { Monograph } from '@/models/PublicationModel';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import AttachmentList from '@/components/core/AttachmentList.vue';
import PersonDocumentContributionTabs from '@/components/core/PersonDocumentContributionTabs.vue';
import DescriptionSection from '@/components/core/DescriptionSection.vue';
import { addAttachment, updateAttachment, deleteAttachment } from "@/utils/AttachmentUtil";
import KeywordList from '@/components/core/KeywordList.vue';
import ResearchAreaService from '@/services/ResearchAreaService';
import type { ResearchArea } from '@/models/OrganisationUnitModel';
import ResearchAreaHierarchy from '@/components/core/ResearchAreaHierarchy.vue';
import MonographUpdateModal from '@/components/publication/update/MonographUpdateModal.vue';
import { getMonographTypeTitleFromValueAutoLocale } from '@/i18n/monographType';
import { PublicationSeriesType, type PublicationSeries } from '@/models/PublicationSeriesModel';
import EventService from '@/services/EventService';
import type { Conference } from '@/models/EventModel';
import JournalService from '@/services/JournalService';
import BookSeriesService from '@/services/BookSeriesService';
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import UriList from '@/components/core/UriList.vue';
import DoiLink from '@/components/core/DoiLink.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import PublicationTableComponent from '@/components/publication/PublicationTableComponent.vue';


export default defineComponent({
    name: "MonographLandingPage",
    components: { AttachmentList, PersonDocumentContributionTabs, DescriptionSection, KeywordList, ResearchAreaHierarchy, MonographUpdateModal, LocalizedLink, UriList, DoiLink, PublicationTableComponent },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const monograph = ref<Monograph>();
        const languageTagMap = ref<Map<number, LanguageTagResponse>>(new Map());

        const canEdit = ref(false);

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

        onMounted(() => {
            DocumentPublicationService.canEdit(parseInt(currentRoute.params.id as string)).then((response) => {
                canEdit.value = response.data;
            });

            fetchMonograph();
        });

        watch(i18n.locale, () => {
            populateData();
        });

        const fetchMonograph = () => {
            DocumentPublicationService.readMonograph(parseInt(currentRoute.params.id as string)).then((response) => {
                monograph.value = response.data;

                document.title = returnCurrentLocaleContent(monograph.value.title) as string;

                monograph.value?.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
    
                fetchConnectedEntities();
                fetchPublications();
                populateData();
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
        };

        const searchKeyword = (keyword: string) => {
            router.push({name:"advancedSearch", query: { searchQuery: keyword.trim(), tab: "publications" }});
        };

        const goToURL = (uri: string) => {
            window.open(uri, '_blank');
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

        return {
            monograph, icon,
            returnCurrentLocaleContent,
            languageTagMap, updateBasicInfo,
            searchKeyword, goToURL, canEdit,
            addAttachment, updateAttachment, deleteAttachment,
            updateKeywords, updateDescription,
            snackbar, snackbarMessage, event,
            researchAreaHierarchy, updateContributions,
            publicationSeries, publicationSeriesType,
            getMonographTypeTitleFromValueAutoLocale,
            switchPage, publications, totalPublications
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
