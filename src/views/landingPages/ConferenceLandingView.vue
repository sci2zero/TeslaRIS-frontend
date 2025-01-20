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
                        <generic-crud-modal
                            :form-component="EventUpdateForm"
                            :form-props="{ presetEvent: conference }"
                            entity-name="Software"
                            is-update
                            is-section-update
                            :read-only="!canEdit"
                            @update="updateBasicInfo"
                        />

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
                                    {{ localiseDateRange(conference?.dateFrom as string, conference?.dateTo as string) }}
                                </div>
                                <div v-if="conference?.countryId">
                                    {{ $t("stateLabel") }}:
                                </div>
                                <div v-if="conference?.countryId" class="response">
                                    {{ returnCurrentLocaleContent(country?.name) }}
                                </div>
                                <div v-if="conference?.place && conference.place.length > 0">
                                    {{ $t("placeLabel") }}:
                                </div>
                                <div v-if="conference?.place && conference.place.length > 0" class="response">
                                    {{ returnCurrentLocaleContent(conference?.place) }}
                                </div>
                                <div v-if="conference?.confId">
                                    Conf ID:
                                </div>
                                <div v-if="conference?.confId" class="response">
                                    {{ conference.confId }}
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
                                <div v-if="conference?.uris && conference?.uris.length > 0">
                                    {{ $t("uriInputLabel") }}:
                                </div>
                                <div class="response">
                                    <uri-list :uris="conference?.uris"></uri-list>
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

        <v-tabs
            v-model="currentTab"
            color="deep-purple-accent-4"
            align-tabs="start"
        >
            <v-tab value="additionalInfo">
                {{ $t("additionalInfoLabel") }}
            </v-tab>
            <v-tab v-if="canEdit || (conference?.contributions && conference?.contributions.length > 0)" value="contributions">
                {{ $t("contributionsLabel") }}
            </v-tab>
            <v-tab v-if="eventIndicators?.length > 0 || canClassify" value="indicators">
                {{ $t("indicatorListLabel") }}
            </v-tab>
            <v-tab v-if="eventClassifications?.length > 0 || canClassify" value="classifications">
                {{ $t("classificationsLabel") }}
            </v-tab>
        </v-tabs>

        <v-tabs-window v-model="currentTab">
            <v-tabs-window-item value="additionalInfo">
                <keyword-list :keywords="conference?.keywords ? conference?.keywords : []" :can-edit="canEdit" @update="updateKeywords"></keyword-list>
                <description-section :description="conference?.description ? conference.description : []" :can-edit="canEdit" @update="updateDescription"></description-section>
            
                <!-- Proceedings List -->
                <div v-if="!conference?.serialEvent">
                    <br />
                    <proceedings-list :preset-event="conference" :readonly="!canEdit"></proceedings-list>
                </div>

                <div>
                    <events-relation-list :preset-event="conference" :readonly="!canEdit"></events-relation-list>
                </div>

                <!-- Publication Table -->
                <div v-if="!conference?.serialEvent">
                    <h2>{{ $t("publicationsLabel") }}</h2>
                    <publication-table-component :publications="publications" :total-publications="totalPublications" @switch-page="switchPublicationsPage"></publication-table-component>
                </div>
            </v-tabs-window-item>
            <v-tabs-window-item value="contributions">
                <person-event-contribution-tabs :event-id="conference?.id" :contribution-list="conference?.contributions ? conference.contributions : []" :read-only="!canEdit" @update="updateContributions"></person-event-contribution-tabs>
            </v-tabs-window-item>
            <v-tabs-window-item value="indicators">
                <indicators-section 
                    :indicators="eventIndicators" 
                    :applicable-types="[ApplicableEntityType.EVENT]" 
                    :entity-id="conference?.id" 
                    :entity-type="ApplicableEntityType.EVENT" 
                    :can-edit="canClassify"
                    @create="createIndicator"
                    @updated="fetchIndicators"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="classifications">
                <entity-classification-view
                    :entity-classifications="eventClassifications"
                    :entity-id="conference?.id"
                    :can-edit="canClassify"
                    :containing-entity-type="ApplicableEntityType.EVENT"
                    :applicable-types="[ApplicableEntityType.EVENT]"
                    @create="createClassification"
                    @update="fetchClassifications"
                />
            </v-tabs-window-item>
        </v-tabs-window>
        
        <toast v-model="snackbar" :message="snackbarMessage" />
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
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { Conference, PersonEventContribution } from "@/models/EventModel";
import EventService from '@/services/EventService';
import PersonEventContributionTabs from '@/components/core/PersonEventContributionTabs.vue';
import { ApplicableEntityType, type Country, type MultilingualContent } from '@/models/Common';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import DescriptionSection from '@/components/core/DescriptionSection.vue';
import { localiseDateRange } from '@/i18n/dateLocalisation';
import ProceedingsList from '@/components/proceedings/ProceedingsList.vue';
import EventsRelationList from '@/components/event/EventsRelationList.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import CountryService from '@/services/CountryService';
import EventUpdateForm from '@/components/event/update/EventUpdateForm.vue';
import UriList from '@/components/core/UriList.vue';
import EntityIndicatorService from '@/services/assessment/EntityIndicatorService';
import type { EntityClassificationResponse, EntityIndicatorResponse, EventAssessmentClassification, EventIndicator } from '@/models/AssessmentModel';
import IndicatorsSection from '@/components/assessment/indicators/IndicatorsSection.vue';
import Toast from '@/components/core/Toast.vue';
import EntityClassificationService from '@/services/assessment/EntityClassificationService';
import EntityClassificationView from '@/components/assessment/classifications/EntityClassificationView.vue';


export default defineComponent({
    name: "ConferenceLandingPage",
    components: { PublicationTableComponent, PersonEventContributionTabs, KeywordList, GenericCrudModal, DescriptionSection, ProceedingsList, EventsRelationList, UriList, IndicatorsSection, Toast, EntityClassificationView },
    setup() {
        const currentTab = ref("contributions");

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
        const canClassify = ref(false);
        const country = ref<Country>();

        const eventIndicators = ref<EntityIndicatorResponse[]>([]);
        const eventClassifications = ref<EntityClassificationResponse[]>([]);

        onMounted(() => {
            EventService.canEdit(parseInt(currentRoute.params.id as string)).then((response) => {
                canEdit.value = response.data;
            });

            EventService.canClassify(parseInt(currentRoute.params.id as string)).then((response) => {
                canClassify.value = response.data;
            });

            fetchConference();
            fetchIndicators();
            fetchClassifications();
        });

        const fetchIndicators = () => {
            EntityIndicatorService.fetchEventIndicators(parseInt(currentRoute.params.id as string)).then(response => {
                eventIndicators.value = response.data;
            });
        };

        const fetchClassifications = () => {
            EntityClassificationService.fetchEventClassifications(parseInt(currentRoute.params.id as string)).then(response => {
                eventClassifications.value = response.data;
            });
        };

        const fetchConference = () => {
            EventService.readConference(parseInt(currentRoute.params.id as string)).then((response) => {
                conference.value = response.data;
                
                document.title = returnCurrentLocaleContent(conference.value.name) as string;

                fetchPublications();
                fetchDetails();
            });
        };

        const fetchDetails = () => {
            if (conference.value?.countryId) {
                CountryService.readCountry(conference.value.countryId as number).then((response) => {
                    country.value = response.data;
                });
            }
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
            conference.value!.countryId = basicInfo.countryId;
            conference.value!.place = basicInfo.place;
            conference.value!.serialEvent = basicInfo.serialEvent;
            conference.value!.fee = basicInfo.fee;
            conference.value!.number = basicInfo.number;
            conference.value!.confId = basicInfo.confId;
            conference.value!.uris = basicInfo.uris;

            performUpdate(true);
        };

        const performUpdate = (reload: boolean) => {
            EventService.updateConference(conference.value?.id as number, conference.value as Conference).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                if(reload) {
                    fetchConference();
                }
            }).catch((error) => {
                snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
                if(reload) {
                    fetchConference();
                }
            });
        };

        const createIndicator = (eventIndicator: EventIndicator) => {
            EntityIndicatorService.createEventIndicator(eventIndicator).then(() => {
                fetchIndicators();
            });
        };

        const createClassification = (eventClassification: EventAssessmentClassification) => {
            EntityClassificationService.createEventClassification(eventClassification).then(() => {
                fetchClassifications();
            });
        };

        return {
            conference, icon, publications,
            totalPublications, switchPublicationsPage,
            keywords, localiseDateRange, updateBasicInfo,
            canEdit, returnCurrentLocaleContent,
            updateContributions, updateKeywords,
            snackbar, snackbarMessage, updateDescription,
            country, EventUpdateForm, ApplicableEntityType,
            eventIndicators, fetchIndicators, createIndicator,
            currentTab, eventClassifications, createClassification,
            fetchClassifications, canClassify
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