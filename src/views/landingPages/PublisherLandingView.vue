<template>
    <v-container id="bookSeries">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        {{ returnCurrentLocaleContent(publisher?.name) }}
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ $t("bookSeriesLabel") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- BookSeries Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon size="x-large" class="large-bookSeries-icon">
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

                        <!-- Personal Info -->
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>
                        <v-row>
                            <v-col cols="6">
                                <div v-if="publisher?.state && publisher?.state.length > 0">
                                    {{ $t("stateLabel") }}:
                                </div>
                                <div v-if="publisher?.state && publisher?.state.length > 0">
                                    {{ returnCurrentLocaleContent(publisher?.state) }}
                                </div>
                            </v-col>
                            <v-col cols="6">
                                <div v-if="publisher?.place && publisher?.place.length > 0">
                                    {{ $t("placeLabel") }}:
                                </div>
                                <div v-if="publisher?.place && publisher?.place.length > 0">
                                    {{ returnCurrentLocaleContent(publisher?.place) }}
                                </div>
                            </v-col>
                        </v-row>
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
import LanguageService from '@/services/LanguageService';
import { returnCurrentLocaleContent } from '@/i18n/TranslationUtil';
import type { Publisher } from '@/models/PublisherModel';
import PublisherService from '@/services/PublisherService';
import DocumentPublicationService from '@/services/DocumentPublicationService';


export default defineComponent({
    name: "BookSeriesLandingPage",
    components: { PublicationTableComponent },
    setup() {
        const currentRoute = useRoute();

        const publisher = ref<Publisher>();
        const languageTagMap = ref<Map<number, LanguageTagResponse>>(new Map());

        const publications = ref<DocumentPublicationIndex[]>([]);
        const totalPublications = ref<number>(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const i18n = useI18n();

        const icon = ref("mdi-newspaper-variant-multiple-outline")

        onMounted(() => {
            PublisherService.readPublisher(parseInt(currentRoute.params.id as string)).then((response) => {
                console.log(response.data);
                publisher.value = response.data;

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
            if (!publisher.value?.id) {
                return;
            }

            DocumentPublicationService.findPublicationsForPublisher(publisher.value?.id as number, `page=${page.value}&size=${size.value}&sort=${sort.value}`).then((response) => {
                publications.value = response.data.content;
                totalPublications.value = response.data.totalElements;
            })
        };

        return {
            publisher, icon,
            publications, 
            totalPublications,
            switchPage,
            returnCurrentLocaleContent,
            languageTagMap
        };
}})

</script>

<style scoped>
    #bookSeries .large-bookSeries-icon {
        font-size: 10em;
    }

    #bookSeries .response {
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
