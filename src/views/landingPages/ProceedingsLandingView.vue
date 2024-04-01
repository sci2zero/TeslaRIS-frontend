<template>
    <v-container id="proceedings">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        {{ returnCurrentLocaleContent(proceedings?.title) }}
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
                        <div class="edit-pen">
                            <v-btn icon variant="outlined"> 
                                <v-icon size="x-large" icon="mdi-file-edit-outline"></v-icon>
                            </v-btn>
                        </div>

                        <!-- Basic Info -->
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>
                        <v-row>
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
                                        {{ returnCurrentLocaleContent(publisher?.name) }}
                                    </localized-link>
                                </div>
                                <div v-if="proceedings?.documentDate">
                                    {{ $t("yearOfPublicationLabel") }}:
                                </div>
                                <div v-if="proceedings?.documentDate" class="response">
                                    {{ proceedings.documentDate }}
                                </div>
                            </v-col>
                            <v-col cols="6">
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
                                    {{ proceedings.doi }}
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
                                    <div v-for="uri in proceedings?.uris" :key="uri">
                                        <v-btn
                                            variant="plain" style="opacity: 0.9;" class="no-uppercase m-0 p-0 h-auto" :href="uri"
                                            target="_blank">
                                            {{ uri }}
                                        </v-btn>
                                    </div>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Keywords -->
        <keyword-list :keywords="proceedings?.keywords ? proceedings.keywords : []" :can-edit="canEdit" @search-keyword="searchKeyword($event)"></keyword-list>

        <!-- Description -->
        <description-section :description="proceedings?.description" :can-edit="canEdit"></description-section>

        <person-document-contribution-list :contribution-list="proceedings?.contributions"></person-document-contribution-list>

        <v-row>
            <h2>{{ $t("proofsLabel") }}</h2>
            <v-col cols="12">
                <attachment-list
                    :attachments="proceedings?.proofs ? proceedings.proofs : []" :can-edit="canEdit" is-proof @create="addAttachment($event, true, proceedings)"
                    @delete="deleteAttachment($event, true, proceedings)" @update="updateAttachment($event, true, proceedings)"></attachment-list>
            </v-col>
        </v-row>
        <v-row>
            <h2>{{ $t("fileItemsLabel") }}</h2>
            <v-col cols="12">
                <attachment-list
                    :attachments="proceedings?.fileItems ? proceedings.fileItems : []" :can-edit="canEdit" @create="addAttachment($event, false, proceedings)" @delete="deleteAttachment($event, false, proceedings)"
                    @update="updateAttachment($event, false, proceedings)"></attachment-list>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import type { LanguageTagResponse } from '@/models/Common';
import { onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { watch } from 'vue';
import type { DocumentPublicationIndex } from '@/models/PublicationModel';
import LanguageService from '@/services/LanguageService';
import { returnCurrentLocaleContent } from '@/i18n/TranslationUtil';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import AttachmentList from '@/components/core/AttachmentList.vue';
import PersonDocumentContributionList from '@/components/core/PersonDocumentContributionList.vue';
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


export default defineComponent({
    name: "ProceedingsLandingPage",
    components: { AttachmentList, PersonDocumentContributionList, KeywordList, DescriptionSection, LocalizedLink },
    setup() {
        const currentRoute = useRoute();
        const router = useRouter();

        const canEdit = ref(false);

        const proceedings = ref<Proceedings>();
        const languageTagMap = ref<Map<number, LanguageTagResponse>>(new Map());
        
        const event = ref<Conference>();
        const publisher = ref<Publisher>();
        
        const publicationSeries = ref<PublicationSeries>();
        const publicationSeriesType = ref<PublicationSeriesType>(PublicationSeriesType.JOURNAL);

        const publications = ref<DocumentPublicationIndex[]>([]);
        const totalPublications = ref<number>(0);

        const i18n = useI18n();

        const icon = ref("mdi-newspaper-variant-multiple");

        onMounted(() => {
            DocumentPublicationService.canEdit(parseInt(currentRoute.params.id as string)).then((response) => {
                canEdit.value = response.data;
            });

            ProceedingsService.readProceedings(parseInt(currentRoute.params.id as string)).then((response) => {
                proceedings.value = response.data;

                proceedings.value?.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);

                EventService.readConference(proceedings.value.eventId as number).then((eventResponse) => {
                    event.value = eventResponse.data;
                });

                if(proceedings.value.publisherId) {
                    PublisherService.readPublisher(proceedings.value.publisherId).then((response) => {
                        publisher.value = response.data;
                    });
                }

                // TODO: Maybe find a more elagant way of handling this
                if(proceedings.value.publicationSeriesId) {
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
    
                populateData();
            });
        });

        watch(i18n.locale, () => {
            populateData();
        });

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

        return {
            proceedings, icon,
            publications, event,
            totalPublications,
            returnCurrentLocaleContent,
            languageTagMap, publicationSeriesType,
            searchKeyword, goToURL, canEdit, publisher,
            addAttachment, deleteAttachment, updateAttachment
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

    .edit-pen-container .edit-pen {
        top: 0px;
        right: 0px;
        position: absolute;
        z-index: 10;
        opacity: 0;
    }

    .edit-pen-container:hover .edit-pen {
        opacity: 0.3;
    }

    .edit-pen-container .edit-pen:hover {
        opacity: 1;
    }

</style>
