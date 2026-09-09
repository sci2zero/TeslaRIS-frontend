<template>
    <div id="conference" class="mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 sm:py-10 lg:py-12">
        <entity-landing-header
            :loading="!conference"
            :entity-label="$t('conferenceLabel')"
            icon="mdi-presentation"
            :can-edit="canEdit"
            :edit-label="$t('updateConferenceLabel')"
            :entity-type="EntityType.CONFERENCE"
            :entity-id="conference?.id"
            @edit="openModal(updateModalRef)"
        >
            <template #modals>
                <generic-crud-modal
                    v-if="canEdit"
                    ref="updateModalRef"
                    hide-activator
                    :form-component="EventUpdateForm"
                    :form-props="{ presetEvent: conference }"
                    entity-name="Conference"
                    is-update
                    is-section-update
                    :read-only="!canEdit"
                    @update="updateBasicInfo"
                />
            </template>
            <template #title>
                {{ returnCurrentLocaleContent(conference?.name) + (conference?.nameAbbreviation && conference.nameAbbreviation.length > 0 ? " (" + returnCurrentLocaleContent(conference?.nameAbbreviation) + ")" : "") }}
            </template>
            <template #meta>
                <landing-meta-item v-if="!conference?.serialEvent && (conference?.dateFrom || conference?.dateTo)" :label="$t('eventDateLabel')" icon="mdi-calendar" tone="slate">
                    {{ localiseDateRange(conference?.dateFrom as string, conference?.dateTo as string) }}
                </landing-meta-item>
                <landing-meta-item v-if="conference?.countryId" :label="$t('stateLabel')" icon="mdi-flag-outline" tone="emerald">
                    {{ returnCurrentLocaleContent(country?.name) }}
                </landing-meta-item>
                <landing-meta-item v-if="conference?.place && conference.place.length > 0" :label="$t('placeLabel')" icon="mdi-map-marker" tone="amber">
                    {{ returnCurrentLocaleContent(conference?.place) }}
                </landing-meta-item>
                <landing-meta-item v-if="(conference?.displayOrganizer?.length ?? 0) > 0" :label="$t('organizerLabel')" icon="mdi-account-group" tone="indigo">
                    {{ returnCurrentLocaleContent(conference?.displayOrganizer) }}
                </landing-meta-item>
            </template>
        </entity-landing-header>

        <tab-content-loader v-if="!conference" layout="sections" />
        <v-tabs
            v-show="conference"
            v-model="currentTab"
            color="deep-purple-accent-4"
            align-tabs="start"
            show-arrows
            class="landing-tabs"
        >
            <v-tab v-show="!conference?.serialEvent" value="publications">
                {{ $t("scientificResultsListLabel") }}
            </v-tab>
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
            <v-tab v-show="isAdmin" value="dataQuality">
                {{ $t("dataQualityLabel") }}
            </v-tab>
        </v-tabs>

        <v-tabs-window
            v-show="conference"
            v-model="currentTab"
            class="min-w-0"
        >
            <v-tabs-window-item value="publications">
                <div class="mt-10">
                    <h2 class="mb-5">
                        {{ $t("conferencePublicationsLabel") }}
                    </h2>
                    <publication-table-component
                        :publications="publications"
                        :total-publications="totalPublications"
                        enable-export
                        :endpoint-type="ExportableEndpointType.EVENT_PUBLICATIONS"
                        :endpoint-token-parameters="[`${conference?.id}`]"
                        @switch-page="switchPublicationsPage"
                    />
                </div>
            </v-tabs-window-item>
            <v-tabs-window-item value="contributions">
                <person-event-contribution-tabs
                    :event-id="conference?.id"
                    :contribution-list="conference?.contributions ? conference.contributions : []"
                    :read-only="!canEdit"
                    :event="conference"
                    @update="updateContributions"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="additionalInfo">
                <landing-additional-info-tab
                    :keywords="conference?.keywords ? conference.keywords : []"
                    :description="conference?.description ? conference.description : []"
                    :can-edit="canEdit"
                    is-general-description
                    :show-remark="false"
                    @update-keywords="updateKeywords"
                    @update-description="updateDescription"
                >
                    <template #details>
                        <landing-detail-field v-if="conference?.confId" label="Conf ID" :value="conference.confId" />
                        <landing-detail-field v-if="conference?.openAlexId" label="Open Alex ID">
                            <identifier-link :identifier="conference.openAlexId" type="open_alex" compact />
                        </landing-detail-field>
                        <landing-detail-field v-if="conference?.number" :label="$t('conferenceNumberLabel')" :value="conference.number" />
                        <landing-detail-field v-if="conference?.fee" :label="$t('cotizationFeeLabel')" :value="conference.fee" />
                        <landing-detail-field v-if="conference?.uris && conference.uris.length > 0" :label="$t('uriInputLabel')">
                            <uri-list :uris="conference.uris" />
                        </landing-detail-field>
                        <landing-detail-field v-if="conference?.serialEvent" :label="$t('isSerialEventMessage')" :value="$t('isSerialEventMessage')" />
                        <div class="md:col-span-2">
                            <entity-identifiers-list
                                :entity-identifiers="eventIdentifiers"
                                :can-edit="canEdit"
                                :entity-id="conference?.id"
                                :containing-entity-type="ApplicableEntityType.EVENT"
                                :concrete-entity-type="ApplicableEntityType.CONFERENCE"
                                @updated="fetchIdentifiers"
                            />
                        </div>
                    </template>

                    <div v-if="!conference?.serialEvent">
                        <proceedings-list
                            :preset-event="conference"
                            :readonly="!canEdit"
                        />
                    </div>

                    <div class="mt-10">
                        <events-relation-list
                            :preset-event="conference"
                            :readonly="!canEdit"
                        />
                    </div>
                </landing-additional-info-tab>
            </v-tabs-window-item>
            <v-tabs-window-item value="indicators">
                <indicators-section
                    :indicators="eventIndicators"
                    :applicable-types="[ApplicableEntityType.EVENT]"
                    :entity-id="conference?.id"
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
                    :entity-id="conference?.id"
                    :can-edit="canClassify"
                    :containing-entity-type="ApplicableEntityType.EVENT"
                    :applicable-types="[ApplicableEntityType.CONFERENCE]"
                    @create="createClassification"
                    @update="fetchClassifications"
                />
            </v-tabs-window-item>
            <v-tabs-window-item v-if="isAdmin" value="revisions">
                <revision-history-table-component
                    class="mt-5"
                    :entity-type="EntityType.CONFERENCE"
                    :entity-id="conference?.id"
                    @restored="fetchConference"
                    @show-assessment-details="showAssessmentDetails"
                />
            </v-tabs-window-item>
            <v-tabs-window-item v-if="isAdmin" value="dataQuality">
                <data-quality-tabs-component
                    ref="dataQualityTabsRef"
                    class="mt-5"
                    :entity-type="EntityType.CONFERENCE"
                    :entity-id="conference?.id"
                />
            </v-tabs-window-item>
        </v-tabs-window>

        <toast v-model="snackbar" :message="snackbarMessage" />
    </div>
</template>

<script lang="ts">
import { onMounted, nextTick } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import PublicationTableComponent from '@/components/publication/PublicationTableComponent.vue';
import type { DocumentPublicationIndex } from '@/models/PublicationModel';
import DocumentPublicationService from "@/services/DocumentPublicationService";
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { Conference, PersonEventContribution } from "@/models/EventModel";
import EventService from '@/services/EventService';
import PersonEventContributionTabs from '@/components/core/PersonEventContributionTabs.vue';
import { ApplicableEntityType, ExportableEndpointType, type Country, type MultilingualContent } from '@/models/Common';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import { localiseDateRange } from '@/utils/DateUtil';
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
import { useLoginStore } from '@/stores/loginStore';
import TabContentLoader from '@/components/core/TabContentLoader.vue';
import StatisticsService from '@/services/StatisticsService';
import IdentifierLink from '@/components/core/IdentifierLink.vue';
import EntityIdentifiersList from '@/components/core/identifiers/EntityIdentifiersList.vue';
import EntityIdentifierService from '@/services/EntityIdentifierService';
import type { EntityIdentifierResponse } from '@/models/IdentifierModel';
import RevisionHistoryTableComponent from '@/components/core/revisions/RevisionHistoryTableComponent.vue';
import { EntityType } from '@/models/MergeModel';
import { useUserRole } from '@/composables/useUserRole';
import DataQualityTabsComponent from '@/components/core/revisions/DataQualityTabsComponent.vue';
import EntityLandingHeader from '@/components/landing/EntityLandingHeader.vue';
import LandingMetaItem from '@/components/landing/LandingMetaItem.vue';
import LandingDetailField from '@/components/landing/LandingDetailField.vue';
import LandingAdditionalInfoTab from '@/components/landing/LandingAdditionalInfoTab.vue';


export default defineComponent({
    name: "ConferenceLandingPage",
    components: { PublicationTableComponent, PersonEventContributionTabs, GenericCrudModal, ProceedingsList, EventsRelationList, UriList, IndicatorsSection, Toast, EntityClassificationView, TabContentLoader, IdentifierLink, EntityIdentifiersList, RevisionHistoryTableComponent, DataQualityTabsComponent, EntityLandingHeader, LandingMetaItem, LandingDetailField, LandingAdditionalInfoTab },
    setup() {
        const { isAdmin } = useUserRole();

        const currentTab = ref("contributions");

        const dataQualityTabsRef = ref<typeof DataQualityTabsComponent>();
        const updateModalRef = ref<{ dialog: boolean } | null>(null);

        const openModal = (modal: { dialog: boolean } | null) => {
            if (modal) {
                modal.dialog = true;
            }
        };

        const showAssessmentDetails = (
            version: { majorVersion: number, minorVersion: number }) => {
            currentTab.value = "dataQuality";

            nextTick(() => dataQualityTabsRef.value?.selectVersion(
                version.majorVersion, version.minorVersion));
        };

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
        const router = useRouter();

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
            fetchConference();
            fetchIndicators();
        });

        const fetchIndicators = () => {
            EntityIndicatorService.fetchEventIndicators(parseInt(currentRoute.params.id as string)).then(response => {
                eventIndicators.value = response.data;
            });
        };

        const fetchIdentifiers = () => {
            EntityIdentifierService.fetchEventIdentifiers(parseInt(currentRoute.params.id as string)).then(response => {
                eventIdentifiers.value = response.data;
            });
        };

        const fetchClassifications = () => {
            EntityClassificationService.fetchEventClassifications(parseInt(currentRoute.params.id as string)).then(response => {
                eventClassifications.value = response.data;
            });
        };

        const fetchConference = () => {
            EventService.readConference(
                parseInt(currentRoute.params.id as string)
            ).then((response) => {
                conference.value = response.data;

                document.title = returnCurrentLocaleContent(conference.value.name) as string;

                fetchPublications();
                fetchDetails();

                currentTab.value = !conference.value?.serialEvent ? "publications" : "contributions";
            }).catch(() => {
                router.push({ name: "notFound" });
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

            DocumentPublicationService.findPublicationsInEvent(
                conference.value?.id as number,
                `page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`).then((publicationResponse) => {
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
            conference.value!.openAlexId = basicInfo.openAlexId;
            conference.value!.uris = basicInfo.uris;
            conference.value!.displayOrganizer = basicInfo.displayOrganizer;

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
            conference, publications,
            totalPublications, switchPublicationsPage,
            keywords, localiseDateRange, updateBasicInfo,
            canEdit, returnCurrentLocaleContent,
            updateContributions, updateKeywords,
            snackbar, snackbarMessage, updateDescription,
            country, EventUpdateForm, ApplicableEntityType,
            eventIndicators, fetchIndicators, createIndicator,
            currentTab, eventClassifications, createClassification,
            fetchClassifications, canClassify, ExportableEndpointType,
            fetchIdentifiers, eventIdentifiers,
            isAdmin, EntityType, fetchConference,
            dataQualityTabsRef, showAssessmentDetails,
            updateModalRef, openModal
        };
}})

</script>
