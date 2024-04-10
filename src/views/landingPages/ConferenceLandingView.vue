<template>
    <v-container id="conference">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        {{ returnCurrentLocaleContent(conference?.name) + (conference?.nameAbbreviation && conference.nameAbbreviation.length > 0 ? " (" + returnCurrentLocaleContent(conference?.nameAbbreviation) + ")" : "") }}
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ $t("conferenceLabel") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- Conference Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon size="x-large" class="large-conference-icon">
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
                                <div>{{ $t("eventDateLabel") }}:</div>
                                <div class="response">
                                    {{ getDates(conference?.dateFrom as string, conference?.dateTo as string) }}
                                </div>
                                <div v-if="conference?.description && conference.description.length > 0">
                                    {{ $t("descriptionLabel") }}:
                                </div>
                                <div v-if="conference?.description && conference.description.length > 0" class="response">
                                    {{ returnCurrentLocaleContent(conference?.description) }}
                                </div>
                                <div v-if="conference?.state && conference.state.length > 0">
                                    {{ $t("stateLabel") }}:
                                </div>
                                <div v-if="conference?.state && conference.state.length > 0" class="response">
                                    {{ returnCurrentLocaleContent(conference?.state) }}
                                </div>
                                <div v-if="conference?.place && conference.place.length > 0">
                                    {{ $t("placeLabel") }}:
                                </div>
                                <div v-if="conference?.place && conference.place.length > 0" class="response">
                                    {{ returnCurrentLocaleContent(conference?.place) }}
                                </div>
                                <div v-if="keywords && keywords.length > 0">
                                    {{ $t("keywordsLabel") }}:
                                </div>
                                <br />
                                <div>
                                    <h2>{{ conference?.serialEvent ? $t("isSerialEventMessage") : $t("isOneTimeEventMessage") }}</h2>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <keyword-list :keywords="conference?.keywords ? conference?.keywords : []" :can-edit="canEdit" @update="updateKeywords"></keyword-list>

        <person-event-contribution-list :contribution-list="conference?.contributions ? conference.contributions : []" :read-only="!canEdit" @update="updateContributions"></person-event-contribution-list>

        <!-- Publication Table -->
        <br />
        <publication-table-component :publications="publications" :total-publications="totalPublications" @switch-page="switchPage"></publication-table-component>
    </v-container>
</template>

<script lang="ts">
import { onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import KeywordList from '@/components/core/KeywordList.vue';
import PublicationTableComponent from '@/components/publication/PublicationTableComponent.vue';
import type { DocumentPublicationIndex } from '@/models/PublicationModel';
import DocumentPublicationService from "@/services/DocumentPublicationService";
import { returnCurrentLocaleContent } from '@/i18n/TranslationUtil';
import type { Conference, PersonEventContribution } from "@/models/EventModel";
import EventService from '@/services/EventService';
import PersonEventContributionList from '@/components/core/PersonEventContributionList.vue';
import type { MultilingualContent } from '@/models/Common';


export default defineComponent({
    name: "ConferenceLandingPage",
    components: { PublicationTableComponent, PersonEventContributionList, KeywordList },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const conference = ref<Conference>();
        const keywords = ref<string[]>([]);

        const publications = ref<DocumentPublicationIndex[]>([]);
        const totalPublications = ref<number>(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const i18n = useI18n();

        const icon = ref("mdi-presentation");

        const canEdit = ref(false);

        onMounted(() => {
            EventService.canEdit(parseInt(currentRoute.params.id as string)).then((response) => {
                canEdit.value = response.data;
            });

            fetchConference();
        });

        const fetchConference = () => {
            EventService.readConference(parseInt(currentRoute.params.id as string)).then((response) => {
                conference.value = response.data;

                fetchPublications();
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
            if (!conference.value?.id) {
                return;
            }

            DocumentPublicationService.findPublicationsInEvent(conference.value?.id as number, `page=${page.value}&size=${size.value}&sort=${sort.value}`).then((publicationResponse) => {
                publications.value = publicationResponse.data.content;
                totalPublications.value = publicationResponse.data.totalElements
            });
        };

        const getDates = (from: string, to: string): string => {
            if(!from || !to) {
                return "";
            }

            const fromDate = new Date(Date.parse(from));
            const toDate = new Date(Date.parse(to));

            const diffInMonths = Math.abs((toDate.getMonth() - fromDate.getMonth()) + 
                      12 * (toDate.getFullYear() - fromDate.getFullYear()));

            if (diffInMonths > 3) {
                return fromDate.getFullYear().toString();
            }

            return `${fromDate.toLocaleDateString("sr")} - ${toDate.toLocaleDateString("sr")}`;
        };

        const updateKeywords = (keywords: MultilingualContent[]) => {
            conference.value!.keywords = keywords;
            performUpdate(false);
        };

        const updateContributions = (contributions: PersonEventContribution[]) => {
            conference.value!.contributions = contributions;
            performUpdate(true);
        };

        const performUpdate = (reload: boolean) => {
            EventService.updateConference(conference.value?.id as number, conference.value as Conference).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                if(reload) {
                    fetchConference();
                }
            }).catch(() => {
                snackbarMessage.value = i18n.t("genericErrorMessage");
                snackbar.value = true;
                if(reload) {
                    fetchConference();
                }
            });
        };

        return {
            conference, icon, publications, 
            totalPublications, switchPage,
            keywords, getDates,
            canEdit, returnCurrentLocaleContent,
            updateContributions, updateKeywords,
            snackbar, snackbarMessage
        };
}})

</script>

<style scoped>
    #conference .large-conference-icon {
        font-size: 10em;
    }

    #conference .response {
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