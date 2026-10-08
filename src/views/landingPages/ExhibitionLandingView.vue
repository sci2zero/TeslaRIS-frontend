<template>
    <landing-page-layout
        id="exhibition"
        v-model="currentTab"
        :loading="!exhibition"
    >
        <template #header>
            <entity-landing-header
                :loading="!exhibition"
                :entity-label="$t('exhibitionLabel')"
                :year="!exhibition?.serialEvent && exhibition?.dateFrom ? exhibition.dateFrom.substring(0, 4) : ''"
                icon="mdi-panorama"
                :can-edit="canEdit"
                :edit-label="$t('updateExhibitionLabel')"
                :entity-type="EntityType.EXHIBITION"
                :entity-id="exhibition?.id"
                @edit="openModal(updateModalRef)"
            >
                <template #modals>
                    <generic-crud-modal
                        v-if="canEdit"
                        ref="updateModalRef"
                        hide-activator
                        :form-component="ExhibitionUpdateForm"
                        :form-props="{ presetEvent: exhibition }"
                        entity-name="Exhibition"
                        is-update
                        is-section-update
                        :read-only="!canEdit"
                        @update="updateBasicInfo"
                    />
                </template>
                <template #title>
                    {{ returnCurrentLocaleContent(exhibition?.name) + (exhibition?.nameAbbreviation && exhibition.nameAbbreviation.length > 0 ? " (" + returnCurrentLocaleContent(exhibition?.nameAbbreviation) + ")" : "") }}
                </template>
                <template #meta>
                    <landing-meta-item v-if="!exhibition?.serialEvent && (exhibition?.dateFrom || exhibition?.dateTo)" :label="$t('eventDateLabel')" icon="mdi-calendar" tone="slate">
                        {{ localiseDateRange(exhibition?.dateFrom as string, exhibition?.dateTo as string) }}
                    </landing-meta-item>
                    <landing-meta-item v-if="exhibition?.countryId" :label="$t('stateLabel')" icon="mdi-flag-outline" tone="emerald">
                        {{ returnCurrentLocaleContent(country?.name) }}
                    </landing-meta-item>
                    <landing-meta-item v-if="exhibition?.place && exhibition.place.length > 0" :label="$t('placeLabel')" icon="mdi-map-marker" tone="amber">
                        {{ returnCurrentLocaleContent(exhibition?.place) }}
                    </landing-meta-item>
                    <landing-meta-item v-if="(exhibition?.displayOrganizer?.length ?? 0) > 0" :label="$t('organizerLabel')" icon="mdi-account-group" tone="indigo">
                        {{ returnCurrentLocaleContent(exhibition?.displayOrganizer) }}
                    </landing-meta-item>
                </template>
            </entity-landing-header>
        </template>

        <template #tabs>
            <v-tab v-if="showOverviewTab" value="overview">
                {{ $t("overviewLabel") }}
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
            <v-tab v-show="canReviewDataQuality && canAssessDataQuality" value="revisions">
                {{ $t("revisionHistoryLabel") }}
            </v-tab>
            <v-tab v-show="canReviewDataQuality && canAssessDataQuality" value="dataQuality">
                {{ $t("dataQualityLabel") }}
            </v-tab>
        </template>

        <template #default>
            <v-tabs-window-item value="overview">
                <landing-overview-tab
                    v-show="showOverview"
                    :description="exhibition?.description"
                    is-general-description
                    :contributions="exhibition?.contributions"
                    :contributors-label="$t('participationsLabel')"
                    @has-content="onOverviewContent"
                    @see-all="currentTab = $event"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="contributions">
                <landing-section-card
                    :title="$t('participationsLabel')"
                    icon="mdi-account-group"
                    icon-class="bg-indigo-50 text-indigo-600"
                    padded>
                    <person-event-contribution-tabs
                        :event-id="exhibition?.id"
                        :contribution-list="exhibition?.contributions ? exhibition.contributions : []"
                        :read-only="!canEdit"
                        :event="exhibition"
                        @update="updateContributions"
                    />
                </landing-section-card>
            </v-tabs-window-item>
            <v-tabs-window-item value="additionalInfo">
                <landing-additional-info-tab
                    :keywords="exhibition?.keywords ? exhibition.keywords : []"
                    :description="exhibition?.description ? exhibition.description : []"
                    :can-edit="canEdit"
                    is-general-description
                    :show-remark="false"
                    @update-keywords="updateKeywords"
                    @update-description="updateDescription"
                >
                    <template #details>
                        <landing-detail-field v-if="exhibition?.number" :label="$t('exhibitionNumberLabel')" :value="exhibition.number" />
                        <landing-detail-field v-if="exhibition?.fee" :label="$t('cotizationFeeLabel')" :value="exhibition.fee" />
                        <landing-detail-field v-if="exhibition?.uris && exhibition.uris.length > 0" :label="$t('uriInputLabel')">
                            <uri-list :uris="exhibition.uris" />
                        </landing-detail-field>
                        <landing-detail-field v-if="exhibition?.serialEvent" :label="$t('isSerialEventMessage')" :value="$t('isSerialEventMessage')" />
                        <div class="md:col-span-2">
                            <entity-identifiers-list
                                :entity-identifiers="eventIdentifiers"
                                :can-edit="canEdit"
                                :entity-id="exhibition?.id"
                                :containing-entity-type="ApplicableEntityType.EVENT"
                                :concrete-entity-type="ApplicableEntityType.EXHIBITION"
                                @updated="fetchIdentifiers"
                            />
                        </div>
                    </template>

                    <div class="mt-10">
                        <events-relation-list
                            :preset-event="exhibition"
                            :readonly="!canEdit"
                            :event-type="EventType.EXHIBITION"
                        />
                    </div>
                </landing-additional-info-tab>
            </v-tabs-window-item>
            <v-tabs-window-item value="indicators">
                <landing-section-card
                    :title="$t('indicatorListLabel')"
                    icon="mdi-chart-box-outline"
                    icon-class="bg-indigo-50 text-indigo-600"
                    padded>
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
                </landing-section-card>
            </v-tabs-window-item>
            <v-tabs-window-item value="classifications">
                <landing-section-card
                    :title="$t('classificationsLabel')"
                    icon="mdi-certificate-outline"
                    icon-class="bg-indigo-50 text-indigo-600"
                    padded>
                    <entity-classification-view
                        :entity-classifications="eventClassifications"
                        :entity-id="exhibition?.id"
                        :can-edit="canClassify"
                        :containing-entity-type="ApplicableEntityType.EVENT"
                        :applicable-types="[ApplicableEntityType.EXHIBITION]"
                        @create="createClassification"
                        @update="fetchClassifications"
                    />
                </landing-section-card>
            </v-tabs-window-item>
            <v-tabs-window-item value="revisions">
                <landing-section-card
                    :title="$t('revisionHistoryLabel')"
                    icon="mdi-history"
                    icon-class="bg-indigo-50 text-indigo-600"
                    padded>
                    <revision-history-table-component
                        :entity-type="EntityType.EXHIBITION"
                        :entity-id="exhibition?.id"
                        @restored="fetchExhibition"
                        @show-assessment-details="showAssessmentDetails"
                    />
                </landing-section-card>
            </v-tabs-window-item>
            <v-tabs-window-item value="dataQuality">
                <landing-section-card
                    :title="$t('dataQualityLabel')"
                    icon="mdi-shield-check-outline"
                    icon-class="bg-indigo-50 text-indigo-600"
                    padded>
                    <data-quality-tabs-component
                        ref="dataQualityTabsRef"
                        :entity-type="EntityType.EXHIBITION"
                        :entity-id="exhibition?.id"
                    />
                </landing-section-card>
            </v-tabs-window-item>
        </template>

        <template #footer>
            <toast v-model="snackbar" :message="snackbarMessage" />
        </template>
    </landing-page-layout>
</template>

<script lang="ts">
import { onMounted, nextTick } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import { EventType, type Exhibition, type PersonEventContribution } from "@/models/EventModel";
import EventService from '@/services/EventService';
import DataQualityService from '@/services/revision/DataQualityService';
import PersonEventContributionTabs from '@/components/core/PersonEventContributionTabs.vue';
import { ApplicableEntityType, type Country, type MultilingualContent } from '@/models/Common';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
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
import StatisticsService from '@/services/StatisticsService';
import EntityIdentifierService from '@/services/EntityIdentifierService';
import type { EntityIdentifierResponse } from '@/models/IdentifierModel';
import EntityIdentifiersList from '@/components/core/identifiers/EntityIdentifiersList.vue';
import RevisionHistoryTableComponent from '@/components/core/revisions/RevisionHistoryTableComponent.vue';
import { EntityType } from '@/models/MergeModel';
import { useUserRole } from '@/composables/useUserRole';
import DataQualityTabsComponent from '@/components/core/revisions/DataQualityTabsComponent.vue';
import EntityLandingHeader from '@/components/landing/EntityLandingHeader.vue';
import LandingMetaItem from '@/components/landing/LandingMetaItem.vue';
import LandingDetailField from '@/components/landing/LandingDetailField.vue';
import LandingAdditionalInfoTab from '@/components/landing/LandingAdditionalInfoTab.vue';
import LandingOverviewTab from '@/components/landing/LandingOverviewTab.vue';
import { useLandingOverview } from '@/composables/useLandingOverview';
import LandingPageLayout from '@/components/landing/LandingPageLayout.vue';
import LandingSectionCard from '@/components/landing/LandingSectionCard.vue';

export default defineComponent({
    name: "ExhibitionLandingPage",
    components: { LandingSectionCard, LandingPageLayout, PersonEventContributionTabs, GenericCrudModal, EventsRelationList, UriList, IndicatorsSection, Toast, EntityClassificationView, EntityIdentifiersList, RevisionHistoryTableComponent, DataQualityTabsComponent, EntityLandingHeader, LandingMetaItem, LandingDetailField, LandingAdditionalInfoTab, LandingOverviewTab },
    setup() {
        const { isAdmin, isViceDeanForScience, canReviewDataQuality } = useUserRole();

        const currentTab = ref("overview");

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
        const exhibition = ref<Exhibition>();
        const { showOverview, showOverviewTab, onOverviewContent } = useLandingOverview(
            exhibition,
            currentTab,
            "contributions",
        );
        const keywords = ref<string[]>([]);

        const i18n = useI18n();
        const router = useRouter();

        const canEdit = ref(false);
        const canAssessDataQuality = ref(false);
        const canClassify = ref(false);
        const country = ref<Country>();

        const eventIndicators = ref<EntityIndicatorResponse[]>();
        const eventClassifications = ref<EntityClassificationResponse[]>();
        const eventIdentifiers = ref<EntityIdentifierResponse[]>([]);

        const loginStore = useLoginStore();

        onMounted(() => {
            if (loginStore.userLoggedIn) {
                DataQualityService.canAssessDataQuality(
                    EntityType.EXHIBITION,
                    parseInt(currentRoute.params.id as string)
                ).then((response) => {
                    canAssessDataQuality.value = response.data;
                });

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
            exhibition, fetchIdentifiers, canAssessDataQuality, canReviewDataQuality,
            keywords, localiseDateRange, updateBasicInfo,
            canEdit, returnCurrentLocaleContent,
            updateContributions, updateKeywords,
            snackbar, snackbarMessage, updateDescription,
            country, ExhibitionUpdateForm, ApplicableEntityType,
            eventIndicators, fetchIndicators, createIndicator,
            currentTab, showOverview, showOverviewTab, onOverviewContent, eventClassifications, createClassification,
            fetchClassifications, canClassify, EventType,
            eventIdentifiers, isViceDeanForScience,
            isAdmin, EntityType, fetchExhibition,
            dataQualityTabsRef, showAssessmentDetails,
            updateModalRef, openModal
        };
}})

</script>
