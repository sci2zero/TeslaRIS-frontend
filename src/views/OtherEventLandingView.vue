<template>
    <div id="otherEvent" class="mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 sm:py-10 lg:py-12">
        <entity-landing-header
            :loading="!otherEvent"
            :entity-label="$t('otherEventLabel')"
            :badge="otherEvent?.type ? getOtherEventTypeTitleFromValueAutoLocale(otherEvent.type) : ''"
            icon="mdi-presentation"
            :can-edit="canEdit"
            :edit-label="$t('updateLabel')"
            :entity-type="EntityType.OTHER_EVENT"
            :entity-id="otherEvent?.id"
            @edit="openModal(updateModalRef)"
        >
            <template #modals>
                <generic-crud-modal
                    v-if="canEdit"
                    ref="updateModalRef"
                    hide-activator
                    :form-component="OtherEventUpdateForm"
                    :form-props="{ presetEvent: otherEvent }"
                    entity-name="OtherEvent"
                    is-update
                    is-section-update
                    :read-only="!canEdit"
                    @update="updateBasicInfo"
                />
            </template>
            <template #title>
                {{ returnCurrentLocaleContent(otherEvent?.name) + (otherEvent?.nameAbbreviation && otherEvent.nameAbbreviation.length > 0 ? " (" + returnCurrentLocaleContent(otherEvent?.nameAbbreviation) + ")" : "") }}
            </template>
            <template #meta>
                <landing-meta-item v-if="!otherEvent?.serialEvent && (otherEvent?.dateFrom || otherEvent?.dateTo)" :label="$t('eventDateLabel')" icon="mdi-calendar" tone="slate">
                    {{ localiseDateRange(otherEvent?.dateFrom as string, otherEvent?.dateTo as string) }}
                </landing-meta-item>
                <landing-meta-item v-if="otherEvent?.countryId" :label="$t('stateLabel')" icon="mdi-flag-outline" tone="emerald">
                    {{ returnCurrentLocaleContent(country?.name) }}
                </landing-meta-item>
                <landing-meta-item v-if="otherEvent?.place && otherEvent.place.length > 0" :label="$t('placeLabel')" icon="mdi-map-marker" tone="amber">
                    {{ returnCurrentLocaleContent(otherEvent?.place) }}
                </landing-meta-item>
                <landing-meta-item v-if="(otherEvent?.displayOrganizer?.length ?? 0) > 0" :label="$t('organizerLabel')" icon="mdi-account-group" tone="indigo">
                    {{ returnCurrentLocaleContent(otherEvent?.displayOrganizer) }}
                </landing-meta-item>
            </template>
        </entity-landing-header>

        <tab-content-loader v-if="!otherEvent" layout="sections" />
        <v-tabs
            v-show="otherEvent"
            v-model="currentTab"
            color="deep-purple-accent-4"
            align-tabs="start"
            show-arrows
            class="landing-tabs"
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
            <v-tab v-show="isAdmin" value="dataQuality">
                {{ $t("dataQualityLabel") }}
            </v-tab>
        </v-tabs>

        <v-tabs-window
            v-show="otherEvent"
            v-model="currentTab"
            class="min-w-0"
        >
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
                <landing-additional-info-tab
                    :keywords="otherEvent?.keywords ? otherEvent.keywords : []"
                    :description="otherEvent?.description ? otherEvent.description : []"
                    :can-edit="canEdit"
                    is-general-description
                    :show-remark="false"
                    @update-keywords="updateKeywords"
                    @update-description="updateDescription"
                >
                    <template #details>
                        <landing-detail-field v-if="otherEvent?.uris && otherEvent.uris.length > 0" :label="$t('uriInputLabel')">
                            <uri-list :uris="otherEvent.uris" />
                        </landing-detail-field>
                        <landing-detail-field v-if="otherEvent?.serialEvent" :label="$t('isSerialEventMessage')" :value="$t('isSerialEventMessage')" />
                        <div class="md:col-span-2">
                            <entity-identifiers-list
                                :entity-identifiers="eventIdentifiers"
                                :can-edit="canEdit"
                                :entity-id="otherEvent?.id"
                                :containing-entity-type="ApplicableEntityType.EVENT"
                                :concrete-entity-type="ApplicableEntityType.OTHER_EVENT"
                                @updated="fetchIdentifiers"
                            />
                        </div>
                    </template>

                    <div class="mt-10">
                        <events-relation-list
                            :preset-event="otherEvent"
                            :readonly="!canEdit"
                        />
                    </div>
                </landing-additional-info-tab>
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
                    @show-assessment-details="showAssessmentDetails"
                />
            </v-tabs-window-item>
            <v-tabs-window-item v-if="isAdmin" value="dataQuality">
                <data-quality-tabs-component
                    ref="dataQualityTabsRef"
                    class="mt-5"
                    :entity-type="EntityType.OTHER_EVENT"
                    :entity-id="otherEvent?.id"
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
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { OtherEvent, PersonEventContribution } from "@/models/EventModel";
import EventService from '@/services/EventService';
import PersonEventContributionTabs from '@/components/core/PersonEventContributionTabs.vue';
import { ApplicableEntityType, type Country, type MultilingualContent } from '@/models/Common';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
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
import TabContentLoader from '@/components/core/TabContentLoader.vue';
import StatisticsService from '@/services/StatisticsService';
import { getOtherEventTypeTitleFromValueAutoLocale } from '@/i18n/otherEventType';
import EntityIdentifiersList from '@/components/core/identifiers/EntityIdentifiersList.vue';
import type { EntityIdentifierResponse } from '@/models/IdentifierModel';
import EntityIdentifierService from '@/services/EntityIdentifierService';
import RevisionHistoryTableComponent from '@/components/core/revisions/RevisionHistoryTableComponent.vue';
import { EntityType } from '@/models/MergeModel';
import { useUserRole } from '@/composables/useUserRole';
import DataQualityTabsComponent from '@/components/core/revisions/DataQualityTabsComponent.vue';
import EntityLandingHeader from '@/components/landing/EntityLandingHeader.vue';
import LandingMetaItem from '@/components/landing/LandingMetaItem.vue';
import LandingDetailField from '@/components/landing/LandingDetailField.vue';
import LandingAdditionalInfoTab from '@/components/landing/LandingAdditionalInfoTab.vue';


export default defineComponent({
    name: "OtherEventLandingPage",
    components: { PersonEventContributionTabs, GenericCrudModal, EventsRelationList, UriList, IndicatorsSection, Toast, EntityClassificationView, TabContentLoader, EntityIdentifiersList, RevisionHistoryTableComponent, DataQualityTabsComponent, EntityLandingHeader, LandingMetaItem, LandingDetailField, LandingAdditionalInfoTab },
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
        const otherEvent = ref<OtherEvent>();
        const keywords = ref<string[]>([]);

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
            updateContributions, updateKeywords,
            snackbar, snackbarMessage, updateDescription,
            country, OtherEventUpdateForm, ApplicableEntityType,
            eventIndicators, fetchIndicators, createIndicator,
            currentTab, eventClassifications, createClassification,
            fetchClassifications, canClassify, fetchIdentifiers,
            getOtherEventTypeTitleFromValueAutoLocale, eventIdentifiers,
            isAdmin, EntityType, fetchOtherEvent,
            dataQualityTabsRef, showAssessmentDetails,
            updateModalRef, openModal
        };
}})

</script>
