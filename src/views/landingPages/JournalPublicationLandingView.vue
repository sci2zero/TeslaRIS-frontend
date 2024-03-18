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
                                    {{ journalPublication.documentDate }}
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
                                    {{ journalPublication.doi }}
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
                                    <div v-for="uri in journalPublication?.uris" :key="uri">
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
        <v-row>
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div class="edit-pen">
                            <v-btn icon variant="outlined" size="small"> 
                                <v-icon size="x-large" icon="mdi-file-edit-outline"></v-icon>
                            </v-btn>
                        </div>

                        <div><b>{{ $t("keywordsLabel") }}</b></div>
                        <strong v-if="!keywords || keywords.length === 0">{{ $t("notYetSetMessage") }}</strong>
                        <v-chip v-for="(keyword, index) in keywords" :key="index" outlined @click="searchKeyword(keyword)">
                            {{ keyword }}
                        </v-chip>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Description -->
        <v-row>
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div class="edit-pen">
                            <v-btn icon variant="outlined" size="small"> 
                                <v-icon size="x-large" icon="mdi-file-edit-outline"></v-icon>
                            </v-btn>
                        </div>

                        <div><b>{{ $t("descriptionLabel") }}</b></div>
                        <strong v-if="!journalPublication?.description">{{ $t("notYetSetMessage") }}</strong>
                        <p>{{ returnCurrentLocaleContent(journalPublication?.description) }}</p>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div class="edit-pen">
                            <v-btn icon variant="outlined" size="small"> 
                                <v-icon size="x-large" icon="mdi-file-edit-outline"></v-icon>
                            </v-btn>
                        </div>
                        <div><b>{{ $t("authorsLabel") }}</b></div>
                        <strong v-if="journalPublication?.contributions?.length === 0">{{ $t("notYetSetMessage") }}</strong>
                        
                        <div v-for="(contribution, index) in journalPublication?.contributions" :key="index" class="py-5">
                            <localized-link :to="'persons/' + contribution.personId">
                                <h4><strong>{{ contribution.personName?.firstname + " " + contribution.personName?.otherName + " " + contribution.personName?.lastname + (contribution.isMainContributor ? ` (${$t("mainContributorLabel")})` : "") + (contribution.isCorrespondingContributor ? ` (${$t("correspondingContributorLabel")})` : "") }}</strong></h4>
                            </localized-link>
                            <h5><strong>{{ `${$t("emailLabel")}: ${contribution.contact?.contactEmail}` }}</strong></h5>
                            <h5><strong>{{ `${$t("phoneNumberLabel")}: ${contribution.contact?.phoneNumber}` }}</strong></h5>
                            <v-divider v-if="index < (journalPublication?.contributions ? journalPublication?.contributions.length : 1) - 1 " class="mt-10"></v-divider>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-row>
            <attachment-list :attachments="journalPublication?.fileItems ? journalPublication.fileItems : []"></attachment-list>
        </v-row>
        <v-row>
            <attachment-list :attachments="journalPublication?.proofs ? journalPublication.proofs : []"></attachment-list>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import type { LanguageTagResponse } from '@/models/Common';
import { onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { watch } from 'vue';
import type { DocumentPublicationIndex } from '@/models/PublicationModel';
import LanguageService from '@/services/LanguageService';
import { returnCurrentLocaleContent } from '@/i18n/TranslationUtil';
import type { JournalPublication } from '@/models/PublicationModel';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import AttachmentList from '@/components/core/AttachmentList.vue';


export default defineComponent({
    name: "JournalPublicationLandingPage",
    components: { AttachmentList },
    setup() {
        const currentRoute = useRoute();
        const router = useRouter();

        const journalPublication = ref<JournalPublication>();
        const languageTagMap = ref<Map<number, LanguageTagResponse>>(new Map());

        const publications = ref<DocumentPublicationIndex[]>([]);
        const totalPublications = ref<number>(0);
        const keywords = ref();

        const i18n = useI18n();

        const icon = ref("mdi-newspaper-variant")

        onMounted(() => {
            DocumentPublicationService.readJournalPublication(parseInt(currentRoute.params.id as string)).then((response) => {
                console.log(response.data);
                journalPublication.value = response.data;

                journalPublication.value?.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
    
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

            keywords.value = returnCurrentLocaleContent(journalPublication.value?.keywords)?.split(",") as string[];
        };

        const searchKeyword = (keyword: string) => {
            router.push({name:"advancedSearch", query: { searchQuery: keyword.trim() }})        
        };

        const goToURL = (uri: string) => {
            window.open(uri, '_blank');
        }

        return {
            journalPublication, icon,
            publications, 
            totalPublications,
            returnCurrentLocaleContent,
            languageTagMap, keywords,
            searchKeyword, goToURL
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
