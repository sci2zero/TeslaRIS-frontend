<template>
    <v-container id="journal">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        {{ returnCurrentLocaleContent(journal?.title as MultilingualContent[]) + (journal?.nameAbbreviation ? " (" + returnCurrentLocaleContent(journal?.nameAbbreviation as MultilingualContent[]) + ")" : "") }}
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ $t("journalLabel") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- Journal Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon size="x-large" class="large-journal-icon">
                    {{ accountIcon }}
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

                        <!-- Personal Info -->
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>
                        <v-row>
                            <v-col cols="6">
                                <div>eISSN:</div>
                                <div class="response">
                                    {{ journal?.eissn ? journal.eissn : $t("notYetSetMessage") }}
                                </div>
                                <div>Print ISSN:</div>
                                <div class="response">
                                    {{ journal?.printISSN ? journal.printISSN : $t("notYetSetMessage") }}
                                </div>
                                <div>
                                    {{ $t("languageLabel") }}:
                                </div>
                                <div>
                                    <v-chip v-for="(languageTagId, index) in journal?.languageTagIds" :key="index" outlined>
                                        {{ languageTagMap.get(languageTagId)?.display }}
                                    </v-chip>
                                </div>
                            </v-col>
                        </v-row>
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
                        <div><b>{{ $t("contributionsLabel") }}</b></div>
                        <strong v-if="journal?.contributions?.length === 0">{{ $t("notYetSetMessage") }}</strong>
                        
                        <div v-for="(contribution, index) in journal?.contributions" :key="index" class="py-5">
                            <h4><strong>{{ contribution.personName?.firstname + " " + contribution.personName?.otherName + " " + contribution.personName?.lastname }}</strong></h4>
                            <p>{{ contribution.dateFrom ? `${contribution.dateFrom} - ${contribution.dateTo ? contribution.dateTo : $t("presentLabel")}` : $t("currentLabel") }}</p>
                            <v-divider v-if="index < (journal?.contributions ? journal?.contributions.length : 1) - 1 " class="mt-10"></v-divider>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Publication Table -->
        <br />
        <publication-table-component :publications="publications" :total-publications="totalPublications" @switch-page="switchPage"></publication-table-component>
    </v-container>
</template>

<script lang="ts">

import type { LanguageTagResponse } from '@/models/Common';
import { onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { watch } from 'vue';
import PublicationTableComponent from '@/components/publication/PublicationTableComponent.vue';
import type { DocumentPublicationIndex } from '@/models/PublicationModel';
import DocumentPublicationService from "@/services/DocumentPublicationService";
import type { Journal } from '@/models/JournalModel';
import JournalService from '@/services/JournalService';
import LanguageService from '@/services/LanguageService';
import { returnCurrentLocaleContent } from '@/i18n/TranslationUtil';


export default defineComponent({
    name: "JournalLandingPage",
    components: { PublicationTableComponent },
    setup() {
        const currentRoute = useRoute();

        const journal = ref<Journal>();
        const languageTagMap = ref<Map<number, LanguageTagResponse>>(new Map());

        const publications = ref<DocumentPublicationIndex[]>([]);
        const totalPublications = ref<number>(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const i18n = useI18n();

        const researcherName = ref("");
        const accountIcon = ref("mdi-book-open-blank-variant")

        onMounted(() => {
            JournalService.readJournal(parseInt(currentRoute.params.id as string)).then((response) => {
                console.log(response.data);
                journal.value = response.data;

                fetchPublications();                
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

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            sort.value = sortField;
            direction.value = sortDir;
            fetchPublications();
        };

        const fetchPublications = () => {
            if (!journal.value?.id) {
                return;
            }

            DocumentPublicationService.findPublicationsInJournal(journal.value?.id as number, `page=${page.value}&size=${size.value}&sort=${sort.value}`).then((publicationResponse) => {
                publications.value = publicationResponse.data.content;
                totalPublications.value = publicationResponse.data.totalElements
            });
        };

        return {
            researcherName,
            journal,
            accountIcon,
            publications, 
            totalPublications,
            switchPage,
            returnCurrentLocaleContent,
            languageTagMap
        };
}})

</script>

<style scoped>
    #journal .large-journal-icon {
        font-size: 10em;
    }

    #journal .response {
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