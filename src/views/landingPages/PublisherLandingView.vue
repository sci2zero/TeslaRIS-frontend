<template>
    <v-container id="publisher">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        {{ returnCurrentLocaleContent(publisher?.name) }}
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ $t("publisherLabel") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- Publisher Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon size="x-large" class="large-publisher-icon">
                    {{ icon }}
                </v-icon>
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="secondary">
                    <v-card-text class="edit-pen-container">
                        <publisher-update-modal :read-only="!canEdit" :preset-publisher="publisher" @update="updateBasicInfo"></publisher-update-modal>

                        <!-- Basic Info -->
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>
                        <v-row>
                            <v-col cols="6">
                                <div v-if="publisher?.state && publisher?.state.length > 0">
                                    {{ $t("stateLabel") }}:
                                </div>
                                <div v-if="publisher?.state && publisher?.state.length > 0" class="response">
                                    {{ returnCurrentLocaleContent(publisher?.state) }}
                                </div>
                            </v-col>
                            <v-col cols="6">
                                <div v-if="publisher?.place && publisher?.place.length > 0">
                                    {{ $t("placeLabel") }}:
                                </div>
                                <div v-if="publisher?.place && publisher?.place.length > 0" class="response">
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
import LanguageService from '@/services/LanguageService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { Publisher } from '@/models/PublisherModel';
import PublisherService from '@/services/PublisherService';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import PublisherUpdateModal from '@/components/publisher/update/PublisherUpdateModal.vue';
import { getErrorMessageForErrorKey } from '@/i18n';


export default defineComponent({
    name: "PublisherSeriesLandingPage",
    components: { PublicationTableComponent, PublisherUpdateModal },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");

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

        const icon = ref("mdi-account-group");

        const canEdit = ref(false);

        onMounted(() => {
            PublisherService.canEdit(parseInt(currentRoute.params.id as string)).then((response) => {
                canEdit.value = response.data;
            });

            PublisherService.readPublisher(parseInt(currentRoute.params.id as string)).then((response) => {
                publisher.value = response.data;

                document.title = returnCurrentLocaleContent(publisher.value.name) as string;

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

        const updateBasicInfo = (updatedBasicInfo: Publisher) => {
            publisher.value!.name = updatedBasicInfo.name;
            publisher.value!.place = updatedBasicInfo.place;
            publisher.value!.state = updatedBasicInfo.state;

            PublisherService.updatePublisher(publisher.value?.id as number, publisher.value as Publisher).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
            }).catch((error) => {
                snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
            });
        };

        return {
            publisher, icon,
            publications, 
            totalPublications,
            switchPage,
            returnCurrentLocaleContent,
            languageTagMap, canEdit,
            updateBasicInfo, snackbar, snackbarMessage
        };
}})

</script>

<style scoped>
    #publisher .large-publisher-icon {
        font-size: 10em;
    }

    #publisher .response {
        font-size: 1.2rem;
        margin-bottom: 10px;
        font-weight: bold;
    }

    .edit-pen-container {
        position:relative;
    }
</style>
