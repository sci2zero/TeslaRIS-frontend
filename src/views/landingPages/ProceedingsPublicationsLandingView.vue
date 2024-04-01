<template>
    <v-container id="proceedingsPublication">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        {{ returnCurrentLocaleContent(proceedingsPublication?.title) }}
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
                <v-icon size="x-large" class="large-proceedingsPublication-icon">
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
                                <div v-if="proceedingsPublication?.proceedingsPublicationType">
                                    {{ $t("typeOfPublicationLabel") }}:
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
                                    {{ proceedingsPublication.documentDate }}
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
                                    {{ proceedingsPublication.doi }}
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
                                    <div v-for="uri in proceedingsPublication?.uris" :key="uri">
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
        <keyword-list :keywords="proceedingsPublication?.keywords ? proceedingsPublication.keywords : []" :can-edit="canEdit" @search-keyword="searchKeyword($event)"></keyword-list>

        <!-- Description -->
        <description-section :description="proceedingsPublication?.description" :can-edit="canEdit"></description-section>

        <person-document-contribution-list :contribution-list="proceedingsPublication?.contributions"></person-document-contribution-list>

        <v-row>
            <h2>{{ $t("proofsLabel") }}</h2>
            <v-col cols="12">
                <attachment-list
                    :attachments="proceedingsPublication?.proofs ? proceedingsPublication.proofs : []" :can-edit="canEdit" is-proof @create="addAttachment($event, true, proceedingsPublication)"
                    @delete="deleteAttachment($event, true, proceedingsPublication)" @update="updateAttachment($event, true, proceedingsPublication)"></attachment-list>
            </v-col>
        </v-row>
        <v-row>
            <h2>{{ $t("fileItemsLabel") }}</h2>
            <v-col cols="12">
                <attachment-list
                    :attachments="proceedingsPublication?.fileItems ? proceedingsPublication.fileItems : []" :can-edit="canEdit" @create="addAttachment($event, false, proceedingsPublication)" @delete="deleteAttachment($event, false, proceedingsPublication)"
                    @update="updateAttachment($event, false, proceedingsPublication)"></attachment-list>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import type { LanguageTagResponse } from '@/models/Common';
import { computed, onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { watch } from 'vue';
import type { DocumentPublicationIndex, ProceedingsPublicationType } from '@/models/PublicationModel';
import LanguageService from '@/services/LanguageService';
import { returnCurrentLocaleContent } from '@/i18n/TranslationUtil';
import type { ProceedingsPublication } from '@/models/PublicationModel';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import AttachmentList from '@/components/core/AttachmentList.vue';
import PersonDocumentContributionList from '@/components/core/PersonDocumentContributionList.vue';
import KeywordList from '@/components/core/KeywordList.vue';
import DescriptionSection from '@/components/core/DescriptionSection.vue';
import type { Conference } from '@/models/EventModel';
import EventService from '@/services/EventService';
import { addAttachment, updateAttachment, deleteAttachment } from "@/utils/AttachmentUtil";
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import type { ProceedingsResponse } from '@/models/ProceedingsModel';
import ProceedingsService from '@/services/ProceedingsService';
import { proceedingsPublicationTypeSr, proceedingsPublicationTypeEn, getTitleFromValue } from "@/i18n/proceedingsPublicationType";


export default defineComponent({
    name: "ProceedingsPublicationLandingPage",
    components: { AttachmentList, PersonDocumentContributionList, KeywordList, DescriptionSection, LocalizedLink },
    setup() {
        const currentRoute = useRoute();
        const router = useRouter();

        const canEdit = ref(false);

        const proceedingsPublication = ref<ProceedingsPublication>();
        const languageTagMap = ref<Map<number, LanguageTagResponse>>(new Map());
        
        const event = ref<Conference>();
        const proceedings = ref<ProceedingsResponse>();

        const publications = ref<DocumentPublicationIndex[]>([]);
        const totalPublications = ref<number>(0);

        const i18n = useI18n();
        const publicationTypes = computed((): { title: string, value: ProceedingsPublicationType }[] => i18n.locale.value === "sr" ? proceedingsPublicationTypeSr : proceedingsPublicationTypeEn);

        const icon = ref("mdi-newspaper-variant");

        onMounted(() => {
            DocumentPublicationService.canEdit(parseInt(currentRoute.params.id as string)).then((response) => {
                canEdit.value = response.data;
            });

            DocumentPublicationService.readProceedingsPublication(parseInt(currentRoute.params.id as string)).then((response) => {
                proceedingsPublication.value = response.data;

                proceedingsPublication.value?.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);

                EventService.readConference(proceedingsPublication.value.eventId as number).then((eventResponse) => {
                    event.value = eventResponse.data;
                });

                ProceedingsService.readProceedings(proceedingsPublication.value.proceedingsId as number).then((eventResponse) => {
                    proceedings.value = eventResponse.data;
                });
    
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
            proceedingsPublication, icon,
            publications, event,
            totalPublications,
            returnCurrentLocaleContent,
            languageTagMap,
            searchKeyword, goToURL, canEdit, proceedings, getTitleFromValue,
            addAttachment, deleteAttachment, updateAttachment, publicationTypes
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
