<template>
    <v-container id="otherEvent">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        <v-skeleton-loader
                            :loading="!otherEvent"
                            type="heading"
                            color="blue-lighten-3"
                            class="d-flex justify-center align-center"
                        >
                            <p class="text-h5">
                                {{ returnCurrentLocaleContent(otherEvent?.name) + (otherEvent?.nameAbbreviation && otherEvent.nameAbbreviation.length > 0 ? " (" + returnCurrentLocaleContent(otherEvent?.nameAbbreviation) + ")" : "") }}
                            </p>
                        </v-skeleton-loader>
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ $t("otherEventLabel") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- OtherEvent Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon size="x-large" class="large-otherEvent-icon">
                    {{ icon }}
                </v-icon>
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="secondary">
                    <v-card-text class="edit-pen-container">
                        <generic-crud-modal
                            :form-component="OtherEventUpdateForm"
                            :form-props="{ presetEvent: otherEvent }"
                            entity-name="OtherEvent"
                            is-update
                            is-section-update
                            :read-only="!canEdit"
                            @update="updateBasicInfo"
                        />

                        <!-- Personal Info -->
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>
                        <basic-info-loader v-if="!otherEvent" :citation-button="false" />
                        <v-row>
                            <v-col cols="3">
                                <div v-if="!otherEvent?.serialEvent">
                                    {{ $t("eventDateLabel") }}:
                                </div>
                                <div v-if="!otherEvent?.serialEvent" class="response">
                                    {{ localiseDateRange(otherEvent?.dateFrom as string, otherEvent?.dateTo as string) }}
                                </div>
                                <div v-if="otherEvent?.countryId">
                                    {{ $t("stateLabel") }}:
                                </div>
                                <div v-if="otherEvent?.countryId" class="response">
                                    {{ returnCurrentLocaleContent(country?.name) }}
                                </div>
                                <div v-if="otherEvent?.place && otherEvent.place.length > 0">
                                    {{ $t("placeLabel") }}:
                                </div>
                                <div v-if="otherEvent?.place && otherEvent.place.length > 0" class="response">
                                    {{ returnCurrentLocaleContent(otherEvent?.place) }}
                                </div>
                                <div v-if="otherEvent?.type">
                                    {{ $t("otherEventTypeLabel") }}:
                                </div>
                                <div v-if="otherEvent?.type" class="response">
                                    {{ getOtherEventTypeTitleFromValueAutoLocale(otherEvent.type) }}
                                </div>
                                <div v-if="(otherEvent?.displayOrganizer?.length ?? 0) > 0">
                                    {{ $t("organizerLabel") }}:
                                </div>
                                <div v-if="(otherEvent?.displayOrganizer?.length ?? 0) > 0" class="response">
                                    {{ returnCurrentLocaleContent(otherEvent?.displayOrganizer) }}
                                </div>
                                <div v-if="otherEvent?.uris && otherEvent?.uris.length > 0">
                                    {{ $t("uriInputLabel") }}:
                                </div>
                                <div class="response">
                                    <uri-list :uris="otherEvent?.uris"></uri-list>
                                </div>
                                <br />
                                <div v-if="otherEvent?.serialEvent">
                                    <h2>{{ $t("isSerialEventMessage") }}</h2>
                                </div>
                                <div>
                                    <entity-identifiers-list
                                        :entity-identifiers="eventIdentifiers"
                                        :can-edit="canEdit" 
                                        :entity-id="otherEvent?.id" 
                                        :containing-entity-type="ApplicableEntityType.EVENT"
                                        :concrete-entity-type="ApplicableEntityType.OTHER_EVENT"
                                        @updated="fetchIdentifiers"
                                    />
                                </div>
                            </v-col>
                            <v-col cols="3">
                                <data-quality-remarks-dialog
                                    :entity-type="EntityType.OTHER_EVENT"
                                    :entity-id="otherEvent?.id"
                                />
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <tab-content-loader v-if="!otherEvent" layout="sections" />
        <v-tabs
            v-show="otherEvent"
            v-model="currentTab"
            color="deep-purple-accent-4"
            align-tabs="start"
        >
            <v-tab value="contributions">
                {{ $t("participationsLabel") }}
            </v-tab>    
            <v-tab value="additionalInfo">
                {{ $t("additionalInfoLabel") }}
            </v-tab>
            <v-tab v-show="(eventIndicators && eventIndicators.length > 0) || canClassify" value="indicators">
                {{ $t("indicatorListLabel") }}
            </v-tab>
            <v-tab v-show="(eventClassifications && eventClassifications.length > 0) || canClassify" value="classifications">
                {{ $t("classificationsLabel") }}
            </v-tab>
            <v-tab v-show="isAdmin" value="revisions">
                {{ $t("revisionHistoryLabel") }}
            </v-tab>
        </v-tabs>

        <v-tabs-window
            v-show="otherEvent"
            v-model="currentTab">
            <v-tabs-window-item value="contributions">
                <person-event-contribution-tabs
                    :event-id="otherEvent?.id"
                    :contribution-list="otherEvent?.contributions ? otherEvent.contributions : []"
                    :read-only="!canEdit"
                    :event="otherEvent"
                    @update="updateContributions"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="additionalInfo">
                <keyword-list
                    :keywords="otherEvent?.keywords ? otherEvent?.keywords : []"
                    :can-edit="canEdit"
                    @update="updateKeywords">
                </keyword-list>
                <description-section
                    :description="otherEvent?.description ? otherEvent.description : []"
                    :can-edit="canEdit"
                    is-general-description
                    @update="updateDescription">
                </description-section>

                <div class="mt-10">
                    <events-relation-list
                        :preset-event="otherEvent"
                        :readonly="!canEdit"
                    />
                </div>
            </v-tabs-window-item>
            <v-tabs-window-item value="indicators">
                <indicators-section 
                    :indicators="eventIndicators" 
                    :applicable-types="[ApplicableEntityType.EVENT]" 
                    :entity-id="otherEvent?.id" 
                    :entity-type="ApplicableEntityType.EVENT" 
                    :can-edit="canClassify"
                    show-statistics
                    @create="createIndicator"
                    @updated="fetchIndicators"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="classifications">
                <entity-classification-view
                    :entity-classifications="eventClassifications"
                    :entity-id="otherEvent?.id"
                    :can-edit="canClassify"
                    :containing-entity-type="ApplicableEntityType.EVENT"
                    :applicable-types="[ApplicableEntityType.OTHER_EVENT]"
                    @create="createClassification"
                    @update="fetchClassifications"
                />
            </v-tabs-window-item>
            <v-tabs-window-item v-if="isAdmin" value="revisions">
                <revision-history-table-component
                    class="mt-5"
                    :entity-type="EntityType.OTHER_EVENT"
                    :entity-id="otherEvent?.id"
                    @restored="fetchOtherEvent"
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
import { useRoute, useRouter } from 'vue-router';
import KeywordList from '@/components/core/KeywordList.vue';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { OtherEvent, PersonEventContribution } from "@/models/EventModel";
import EventService from '@/services/EventService';
import PersonEventContributionTabs from '@/components/core/PersonEventContributionTabs.vue';
import { ApplicableEntityType, type Country, type MultilingualContent } from '@/models/Common';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import DescriptionSection from '@/components/core/DescriptionSection.vue';
import { localiseDateRange } from '@/utils/DateUtil';
import EventsRelationList from '@/components/event/EventsRelationList.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import CountryService from '@/services/CountryService';
import OtherEventUpdateForm from '@/components/event/update/OtherEventUpdateForm.vue';
import UriList from '@/components/core/UriList.vue';
import EntityIndicatorService from '@/services/assessment/EntityIndicatorService';
import type { EntityClassificationResponse, EntityIndicatorResponse, EventAssessmentClassification, EventIndicator } from '@/models/AssessmentModel';
import IndicatorsSection from '@/components/assessment/indicators/IndicatorsSection.vue';
import Toast from '@/components/core/Toast.vue';
import EntityClassificationService from '@/services/assessment/EntityClassificationService';
import EntityClassificationView from '@/components/assessment/classifications/EntityClassificationView.vue';
import { useLoginStore } from '@/stores/loginStore';
import BasicInfoLoader from '@/components/core/BasicInfoLoader.vue';
import TabContentLoader from '@/components/core/TabContentLoader.vue';
import StatisticsService from '@/services/StatisticsService';
import { getOtherEventTypeTitleFromValueAutoLocale } from '@/i18n/otherEventType';
import EntityIdentifiersList from '@/components/core/identifiers/EntityIdentifiersList.vue';
import type { EntityIdentifierResponse } from '@/models/IdentifierModel';
import EntityIdentifierService from '@/services/EntityIdentifierService';
import RevisionHistoryTableComponent from '@/components/core/revisions/RevisionHistoryTableComponent.vue';
import DataQualityRemarksDialog from '@/components/core/revisions/DataQualityRemarksDialog.vue';
import { EntityType } from '@/models/MergeModel';
import { useUserRole } from '@/composables/useUserRole';


export default defineComponent({
    name: "OtherEventLandingPage",
    components: { PersonEventContributionTabs, KeywordList, GenericCrudModal, DescriptionSection, EventsRelationList, UriList, IndicatorsSection, Toast, EntityClassificationView, BasicInfoLoader, TabContentLoader, EntityIdentifiersList, RevisionHistoryTableComponent, DataQualityRemarksDialog },
    setup() {
        const { isAdmin } = useUserRole();

        const currentTab = ref("contributions");

        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const otherEvent = ref<OtherEvent>();
        const keywords = ref<string[]>([]);
        
        const i18n = useI18n();
        const router = useRouter();

        const icon = ref("mdi-presentation");

        const canEdit = ref(false);
        const canClassify = ref(false);
        const country = ref<Country>();

        const eventIndicators = ref<EntityIndicatorResponse[]>();
        const eventClassifications = ref<EntityClassificationResponse[]>();
        const eventIdentifiers = ref<EntityIdentifierResponse[]>([]);

        const loginStore = useLoginStore();

        onMounted(() => {
            if (loginStore.userLoggedIn) {
                EventService.canEdit(parseInt(currentRoute.params.id as string)).then((response) => {
                    canEdit.value = response.data;
                });
                EventService.canClassify(parseInt(currentRoute.params.id as string)).then((response) => {
                    canClassify.value = response.data;
                });
                fetchClassifications();

                StatisticsService.registerEventView(parseInt(currentRoute.params.id as string));
            }

            fetchIdentifiers();
            fetchOtherEvent();
            fetchIndicators();
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

        const fetchOtherEvent = () => {
            EventService.readOtherEvent(
                parseInt(currentRoute.params.id as string)
            ).then((response) => {
                otherEvent.value = response.data;
                
                document.title = returnCurrentLocaleContent(otherEvent.value.name) as string;

                fetchDetails();

                currentTab.value =
                    ((otherEvent.value?.contributions?.length ?? 0) > 0) ? "contributions" : "additionalInfo";
            }).catch(() => {
                router.push({ name: "notFound" });
            });
        };

        const fetchDetails = () => {
            if (otherEvent.value?.countryId) {
                CountryService.readCountry(otherEvent.value.countryId as number).then((response) => {
                    country.value = response.data;
                });
            }
        };

        const updateKeywords = (keywords: MultilingualContent[]) => {
            otherEvent.value!.keywords = keywords;
            performUpdate(false);
        };

        const updateDescription = (description: MultilingualContent[]) => {
            otherEvent.value!.description = description;
            performUpdate(false);
        };

        const updateContributions = (contributions: PersonEventContribution[]) => {
            otherEvent.value!.contributions = contributions;
            performUpdate(true);
        };

        const fetchIdentifiers = () => {
            EntityIdentifierService.fetchEventIdentifiers(parseInt(currentRoute.params.id as string)).then(response => {
                eventIdentifiers.value = response.data;
            });
        };

        const updateBasicInfo = (basicInfo: OtherEvent) => {
            otherEvent.value!.name = basicInfo.name;
            otherEvent.value!.nameAbbreviation = basicInfo.nameAbbreviation;
            otherEvent.value!.dateFrom = basicInfo.dateFrom;
            otherEvent.value!.dateTo = basicInfo.dateTo;
            otherEvent.value!.countryId = basicInfo.countryId;
            otherEvent.value!.place = basicInfo.place;
            otherEvent.value!.serialEvent = basicInfo.serialEvent;
            otherEvent.value!.type = basicInfo.type;
            otherEvent.value!.uris = basicInfo.uris;
            otherEvent.value!.displayOrganizer = basicInfo.displayOrganizer;

            performUpdate(true);
        };

        const performUpdate = (reload: boolean) => {
            EventService.updateOtherEvent(otherEvent.value?.id as number, otherEvent.value as OtherEvent).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                if(reload) {
                    fetchOtherEvent();
                }
            }).catch((error) => {
                snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
                if(reload) {
                    fetchOtherEvent();
                }
            });
        };

        const createIndicator = async (eventIndicator: {indicator: EventIndicator, files: File[]}) => {
            EntityIndicatorService.createEventIndicator(eventIndicator.indicator).then((response) => {
                EntityIndicatorService.uploadFilesAndFetchIndicators(eventIndicator.files, response.data.id).then(() => {
                    fetchIndicators();
                });
            });
        };

        const createClassification = (eventClassification: EventAssessmentClassification) => {
            EntityClassificationService.createEventClassification(eventClassification).then(() => {
                fetchClassifications();
            });
        };

        return {
            keywords, localiseDateRange, updateBasicInfo,
            canEdit, returnCurrentLocaleContent, otherEvent,
            updateContributions, updateKeywords, icon,
            snackbar, snackbarMessage, updateDescription,
            country, OtherEventUpdateForm, ApplicableEntityType,
            eventIndicators, fetchIndicators, createIndicator,
            currentTab, eventClassifications, createClassification,
            fetchClassifications, canClassify, fetchIdentifiers,
            getOtherEventTypeTitleFromValueAutoLocale, eventIdentifiers,
            isAdmin, EntityType, fetchOtherEvent
        };
}})

</script>

<style scoped>
    #otherEvent .large-otherEvent-icon {
        font-size: 10em;
    }

    #otherEvent .response {
        font-size: 1.2rem;
        margin-bottom: 10px;
        font-weight: bold;
    }

    .edit-pen-container {
        position:relative;
    }
</style>
