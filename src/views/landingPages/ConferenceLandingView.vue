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
                        <event-update-modal :preset-event="conference" :read-only="!canEdit" @update="updateBasicInfo"></event-update-modal>

                        <!-- Personal Info -->
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>
                        <v-row>
                            <v-col cols="6">
                                <div v-if="!conference?.serialEvent">
                                    {{ $t("eventDateLabel") }}:
                                </div>
                                <div v-if="!conference?.serialEvent" class="response">
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
                                <div v-if="conference?.number">
                                    {{ $t("conferenceNumberLabel") }}:
                                </div>
                                <div v-if="conference?.number" class="response">
                                    {{ conference.number }}
                                </div>
                                <div v-if="conference?.fee">
                                    {{ $t("entryFeeLabel") }}:
                                </div>
                                <div v-if="conference?.fee" class="response">
                                    {{ conference.fee }}
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

        <description-section :description="conference?.description ? conference.description : []" :can-edit="canEdit" @update="updateDescription"></description-section>

        <person-event-contribution-tabs :event-id="conference?.id" :contribution-list="conference?.contributions ? conference.contributions : []" :read-only="!canEdit" @update="updateContributions"></person-event-contribution-tabs>

        <!-- Proceedings List -->
        <div v-if="!conference?.serialEvent">
            <br />
            <proceedings-list :preset-event="conference"></proceedings-list>
        </div>

        <!-- Relations List -->
        <div>
            <events-relation-list :preset-event="conference"></events-relation-list>
        </div>

        <!-- Publication Table -->
        <div v-if="!conference?.serialEvent">
            <h2>{{ $t("publicationsLabel") }}</h2>
            <publication-table-component :publications="publications" :total-publications="totalPublications" @switch-page="switchPublicationsPage"></publication-table-component>
        </div>
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
import PersonEventContributionTabs from '@/components/core/PersonEventContributionTabs.vue';
import type { MultilingualContent } from '@/models/Common';
import EventUpdateModal from '@/components/event/update/EventUpdateModal.vue';
import DescriptionSection from '@/components/core/DescriptionSection.vue';
import { localiseDate } from '@/i18n/dateLocalisation';
import ProceedingsList from '@/components/proceedings/ProceedingsList.vue';
import EventsRelationList from '@/components/event/EventsRelationList.vue';


export default defineComponent({
    name: "ConferenceLandingPage",
    components: { PublicationTableComponent, PersonEventContributionTabs, KeywordList, EventUpdateModal, DescriptionSection, ProceedingsList, EventsRelationList },
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

        const switchPublicationsPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
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

        const updateDescription = (description: MultilingualContent[]) => {
            conference.value!.description = description;
            performUpdate(false);
        };

        const updateContributions = (contributions: PersonEventContribution[]) => {
            conference.value!.contributions = contributions;
            performUpdate(true);
        };

        const updateBasicInfo = (basicInfo: Conference) => {
            conference.value!.name = basicInfo.name;
            conference.value!.nameAbbreviation = basicInfo.nameAbbreviation;
            conference.value!.dateFrom = basicInfo.dateFrom;
            conference.value!.dateTo = basicInfo.dateTo;
            conference.value!.state = basicInfo.state;
            conference.value!.place = basicInfo.place;
            conference.value!.serialEvent = basicInfo.serialEvent;
            conference.value!.fee = basicInfo.fee;
            conference.value!.number = basicInfo.number;

            performUpdate(false);
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
            totalPublications, switchPublicationsPage,
            keywords, getDates, updateBasicInfo,
            canEdit, returnCurrentLocaleContent,
            updateContributions, updateKeywords,
            snackbar, snackbarMessage, updateDescription,
            localiseDate
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
</style>