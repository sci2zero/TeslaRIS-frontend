<template>
    <v-container id="bookSeries">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        {{ returnCurrentLocaleContent(bookSeries?.title) + (bookSeries?.nameAbbreviation ? " (" + returnCurrentLocaleContent(bookSeries?.nameAbbreviation) + ")" : "") }}
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
                        <publication-series-update-modal :read-only="!canEdit" :preset-publication-series="bookSeries" input-type="BOOK_SERIES" @update="updateBasicInfo"></publication-series-update-modal>

                        <!-- Personal Info -->
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>
                        <v-row>
                            <v-col cols="6">
                                <div>eISSN:</div>
                                <div class="response">
                                    {{ bookSeries?.eissn ? bookSeries.eissn : $t("notYetSetMessage") }}
                                </div>
                                <div>Print ISSN:</div>
                                <div class="response">
                                    {{ bookSeries?.printISSN ? bookSeries.printISSN : $t("notYetSetMessage") }}
                                </div>
                                <div v-if="bookSeries?.languageTagIds && bookSeries?.languageTagIds.length > 0">
                                    {{ $t("languageLabel") }}:
                                </div>
                                <div>
                                    <v-chip v-for="(languageTagId, index) in bookSeries?.languageTagIds" :key="index" outlined>
                                        {{ languageTagMap.get(languageTagId)?.display }}
                                    </v-chip>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <person-publication-series-contribution-tabs :contribution-list="bookSeries?.contributions ? bookSeries.contributions : []" :read-only="!canEdit" @update="updateContributions"></person-publication-series-contribution-tabs>

        <!-- Publication Table -->
        <br />
        <publication-table-component :publications="publications" :total-publications="totalPublications" @switch-page="switchPage"></publication-table-component>
        
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
import type { LanguageTagResponse } from '@/models/Common';
import { onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { watch } from 'vue';
import PublicationTableComponent from '@/components/publication/PublicationTableComponent.vue';
import type { DocumentPublicationIndex } from '@/models/PublicationModel';
import type { BookSeries } from '@/models/BookSeriesModel';
import BookSeriesService from '@/services/BookSeriesService';
import LanguageService from '@/services/LanguageService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import PublicationSeriesUpdateModal from '@/components/publicationSeries/update/PublicationSeriesUpdateModal.vue';
import ProceedingsService from '@/services/ProceedingsService';
import type { PersonPublicationSeriesContribution } from '@/models/PublicationSeriesModel';
import PersonPublicationSeriesContributionTabs from '@/components/core/PersonPublicationSeriesContributionTabs.vue';
import { getErrorMessageForErrorKey } from '@/i18n';


export default defineComponent({
    name: "BookSeriesLandingPage",
    components: { PublicationTableComponent, PublicationSeriesUpdateModal, PersonPublicationSeriesContributionTabs },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();

        const bookSeries = ref<BookSeries>();
        const languageTagMap = ref<Map<number, LanguageTagResponse>>(new Map());

        const publications = ref<DocumentPublicationIndex[]>([]);
        const totalPublications = ref<number>(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const i18n = useI18n();

        const icon = ref("mdi-bookshelf");

        const canEdit = ref(false);

        onMounted(() => {
            BookSeriesService.canEdit(parseInt(currentRoute.params.id as string)).then(response => {
                canEdit.value = response.data;
            });

            fetchBookSeries();
        });

        watch(i18n.locale, () => {
            populateData();
        });

        const fetchBookSeries = () => {
            BookSeriesService.readBookSeries(parseInt(currentRoute.params.id as string)).then((response) => {
                bookSeries.value = response.data;

                document.title = returnCurrentLocaleContent(bookSeries.value.title) as string;

                bookSeries.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);

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
        };

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            sort.value = sortField;
            direction.value = sortDir;
            fetchPublications();
        };

        const fetchPublications = () => {
            if (!bookSeries.value?.id) {
                return;
            }

            ProceedingsService.findProceedingsForBookSeries(bookSeries.value?.id as number, `page=${page.value}&size=${size.value}&sort=${sort.value}`).then((response) => {
                publications.value = response.data.content;
                totalPublications.value = response.data.totalElements
            });
        };

        const updateBasicInfo = (updatedBookSeries: BookSeries) => {
            bookSeries.value!.title = updatedBookSeries.title;
            bookSeries.value!.nameAbbreviation = updatedBookSeries.nameAbbreviation;
            bookSeries.value!.eissn = updatedBookSeries.eissn;
            bookSeries.value!.printISSN = updatedBookSeries.printISSN;
            bookSeries.value!.languageTagIds = updatedBookSeries.languageTagIds;

            performUpdate(false);
        };

        const updateContributions = (contributions: PersonPublicationSeriesContribution[]) => {
            bookSeries.value!.contributions = contributions;
            performUpdate(true);
        };

        const performUpdate = (reload: boolean) => {
            BookSeriesService.updateBookSeries(bookSeries.value?.id as number, bookSeries.value as BookSeries).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                if(reload) {
                    fetchBookSeries();
                }
            }).catch((error) => {
                snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
                if(reload) {
                    fetchBookSeries();
                }
            });
        };

        return {
            bookSeries, icon,
            publications, 
            totalPublications,
            switchPage,
            returnCurrentLocaleContent,
            languageTagMap, canEdit,
            updateBasicInfo, snackbar,
            snackbarMessage, updateContributions
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
</style>