<template>
    <v-container id="exhibition">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        <v-skeleton-loader
                            :loading="!exhibition"
                            type="heading"
                            color="blue-lighten-3"
                            class="d-flex justify-center align-center"
                        >
                            <p class="text-h5">
                                {{ returnCurrentLocaleContent(exhibition?.name) + (exhibition?.nameAbbreviation && exhibition.nameAbbreviation.length > 0 ? " (" + returnCurrentLocaleContent(exhibition?.nameAbbreviation) + ")" : "") }}
                            </p>
                        </v-skeleton-loader>
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ $t("exhibitionLabel") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- Exhibition Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon size="x-large" class="large-exhibition-icon">
                    {{ icon }}
                </v-icon>
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="secondary">
                    <v-card-text class="edit-pen-container">
                        <generic-crud-modal
                            :form-component="ExhibitionUpdateForm"
                            :form-props="{ presetEvent: exhibition }"
                            entity-name="Exhibition"
                            is-update
                            is-section-update
                            :read-only="!canEdit"
                            @update="updateBasicInfo"
                        />

                        <!-- Personal Info -->
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>
                        <basic-info-loader v-if="!exhibition" :citation-button="false" />
                        <v-row>
                            <v-col cols="6">
                                <div v-if="!exhibition?.serialEvent">
                                    {{ $t("eventDateLabel") }}:
                                </div>
                                <div v-if="!exhibition?.serialEvent" class="response">
                                    {{ localiseDateRange(exhibition?.dateFrom as string, exhibition?.dateTo as string) }}
                                </div>
                                <div v-if="exhibition?.countryId">
                                    {{ $t("stateLabel") }}:
                                </div>
                                <div v-if="exhibition?.countryId" class="response">
                                    {{ returnCurrentLocaleContent(country?.name) }}
                                </div>
                                <div v-if="exhibition?.place && exhibition.place.length > 0">
                                    {{ $t("placeLabel") }}:
                                </div>
                                <div v-if="exhibition?.place && exhibition.place.length > 0" class="response">
                                    {{ returnCurrentLocaleContent(exhibition?.place) }}
                                </div>
                                <div v-if="exhibition?.number">
                                    {{ $t("exhibitionNumberLabel") }}:
                                </div>
                                <div v-if="exhibition?.number" class="response">
                                    {{ exhibition.number }}
                                </div>
                                <div v-if="exhibition?.fee">
                                    {{ $t("cotizationFeeLabel") }}:
                                </div>
                                <div v-if="exhibition?.fee" class="response">
                                    {{ exhibition.fee }}
                                </div>
                                <div v-if="(exhibition?.displayOrganizer?.length ?? 0) > 0">
                                    {{ $t("organizerLabel") }}:
                                </div>
                                <div v-if="(exhibition?.displayOrganizer?.length ?? 0) > 0" class="response">
                                    {{ returnCurrentLocaleContent(exhibition?.displayOrganizer) }}
                                </div>
                                <div v-if="exhibition?.uris && exhibition?.uris.length > 0">
                                    {{ $t("uriInputLabel") }}:
                                </div>
                                <div class="response">
                                    <uri-list :uris="exhibition?.uris"></uri-list>
                                </div>
                                <br />
                                <div v-if="exhibition?.serialEvent">
                                    <h2>{{ $t("isSerialEventMessage") }}</h2>
                                </div>
                                <div>
                                    <entity-identifiers-list
                                        :entity-identifiers="eventIdentifiers"
                                        :can-edit="canEdit" 
                                        :entity-id="exhibition?.id" 
                                        :containing-entity-type="ApplicableEntityType.EVENT"
                                        :concrete-entity-type="ApplicableEntityType.EXHIBITION"
                                        @updated="fetchIdentifiers"
                                    />
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <tab-content-loader v-if="!exhibition" layout="sections" />
        <v-tabs
            v-show="exhibition"
            v-model="currentTab"
            color="deep-purple-accent-4"
            align-tabs="start"
        >
            <!-- <v-tab v-show="!exhibition?.serialEvent" value="publications">
                {{ $t("scientificResultsListLabel") }}
            </v-tab> -->
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
        </v-tabs>

        <v-tabs-window
            v-show="exhibition"
            v-model="currentTab">
            <!-- <v-tabs-window-item value="publications">
                <div class="mt-10">
                    <h2 class="mb-5">
                        {{ $t("exhibitionPublicationsLabel") }}
                    </h2>
                    <publication-table-component
                        :publications="publications"
                        :total-publications="totalPublications"
                        @switch-page="switchPublicationsPage">
                    </publication-table-component>
                </div>
            </v-tabs-window-item> -->
            <v-tabs-window-item value="contributions">
                <person-event-contribution-tabs
                    :event-id="exhibition?.id"
                    :contribution-list="exhibition?.contributions ? exhibition.contributions : []"
                    :read-only="!canEdit"
                    :event="exhibition"
                    @update="updateContributions"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="additionalInfo">
                <keyword-list
                    :keywords="exhibition?.keywords ? exhibition?.keywords : []"
                    :can-edit="canEdit"
                    @update="updateKeywords">
                </keyword-list>
                <description-section
                    :description="exhibition?.description ? exhibition.description : []"
                    :can-edit="canEdit"
                    is-general-description
                    @update="updateDescription">
                </description-section>

                <div class="mt-10">
                    <events-relation-list
                        :preset-event="exhibition"
                        :readonly="!canEdit"
                        :event-type="EventType.EXHIBITION"
                    />
                </div>
            </v-tabs-window-item>
            <v-tabs-window-item value="indicators">
                <indicators-section 
                    :indicators="eventIndicators" 
                    :applicable-types="[ApplicableEntityType.EVENT]" 
                    :entity-id="exhibition?.id" 
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
                    :entity-id="exhibition?.id"
                    :can-edit="canClassify"
                    :containing-entity-type="ApplicableEntityType.EVENT"
                    :applicable-types="[ApplicableEntityType.EXHIBITION]"
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
import { useRoute, useRouter } from 'vue-router';
import KeywordList from '@/components/core/KeywordList.vue';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import { EventType, type Exhibition, type PersonEventContribution } from "@/models/EventModel";
import EventService from '@/services/EventService';
import PersonEventContributionTabs from '@/components/core/PersonEventContributionTabs.vue';
import { ApplicableEntityType, type Country, type MultilingualContent } from '@/models/Common';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import DescriptionSection from '@/components/core/DescriptionSection.vue';
import { localiseDateRange } from '@/utils/DateUtil';
import EventsRelationList from '@/components/event/EventsRelationList.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import CountryService from '@/services/CountryService';
import ExhibitionUpdateForm from '@/components/event/update/ExhibitionUpdateForm.vue';
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
import EntityIdentifierService from '@/services/EntityIdentifierService';
import type { EntityIdentifierResponse } from '@/models/IdentifierModel';
import EntityIdentifiersList from '@/components/core/identifiers/EntityIdentifiersList.vue';


export default defineComponent({
    name: "ExhibitionLandingPage",
    components: { PersonEventContributionTabs, KeywordList, GenericCrudModal, DescriptionSection, EventsRelationList, UriList, IndicatorsSection, Toast, EntityClassificationView, BasicInfoLoader, TabContentLoader, EntityIdentifiersList },
    setup() {
        const currentTab = ref("contributions");

        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const exhibition = ref<Exhibition>();
        const keywords = ref<string[]>([]);
        
        const i18n = useI18n();
        const router = useRouter();

        const icon = ref("mdi-panorama");

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
            fetchExhibition();
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

        const fetchIdentifiers = () => {
            EntityIdentifierService.fetchEventIdentifiers(parseInt(currentRoute.params.id as string)).then(response => {
                eventIdentifiers.value = response.data;
            });
        };

        const fetchExhibition = () => {
            EventService.readExhibition(
                parseInt(currentRoute.params.id as string)
            ).then((response) => {
                exhibition.value = response.data;
                
                document.title = returnCurrentLocaleContent(exhibition.value.name) as string;

                fetchDetails();
            }).catch(() => {
                router.push({ name: "notFound" });
            });
        };

        const fetchDetails = () => {
            if (exhibition.value?.countryId) {
                CountryService.readCountry(exhibition.value.countryId as number).then((response) => {
                    country.value = response.data;
                });
            }
        };

        const updateKeywords = (keywords: MultilingualContent[]) => {
            exhibition.value!.keywords = keywords;
            performUpdate(false);
        };

        const updateDescription = (description: MultilingualContent[]) => {
            exhibition.value!.description = description;
            performUpdate(false);
        };

        const updateContributions = (contributions: PersonEventContribution[]) => {
            exhibition.value!.contributions = contributions;
            performUpdate(true);
        };

        const updateBasicInfo = (basicInfo: Exhibition) => {
            exhibition.value!.name = basicInfo.name;
            exhibition.value!.nameAbbreviation = basicInfo.nameAbbreviation;
            exhibition.value!.dateFrom = basicInfo.dateFrom;
            exhibition.value!.dateTo = basicInfo.dateTo;
            exhibition.value!.countryId = basicInfo.countryId;
            exhibition.value!.place = basicInfo.place;
            exhibition.value!.serialEvent = basicInfo.serialEvent;
            exhibition.value!.fee = basicInfo.fee;
            exhibition.value!.number = basicInfo.number;
            exhibition.value!.uris = basicInfo.uris;
            exhibition.value!.displayOrganizer = basicInfo.displayOrganizer;

            performUpdate(true);
        };

        const performUpdate = (reload: boolean) => {
            EventService.updateExhibition(exhibition.value?.id as number, exhibition.value as Exhibition).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                if(reload) {
                    fetchExhibition();
                }
            }).catch((error) => {
                snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
                if(reload) {
                    fetchExhibition();
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
            exhibition, icon, fetchIdentifiers,
            keywords, localiseDateRange, updateBasicInfo,
            canEdit, returnCurrentLocaleContent,
            updateContributions, updateKeywords,
            snackbar, snackbarMessage, updateDescription,
            country, ExhibitionUpdateForm, ApplicableEntityType,
            eventIndicators, fetchIndicators, createIndicator,
            currentTab, eventClassifications, createClassification,
            fetchClassifications, canClassify, EventType,
            eventIdentifiers
        };
}})

</script>

<style scoped>
    #exhibition .large-exhibition-icon {
        font-size: 10em;
    }

    #exhibition .response {
        font-size: 1.2rem;
        margin-bottom: 10px;
        font-weight: bold;
    }

    .edit-pen-container {
        position:relative;
    }
</style>