<template>
    <v-form @submit.prevent>
        <v-tabs
            v-if="displaySettings"
            v-model="currentTab"
            color="deep-purple-accent-4"
            align-tabs="start"
        >
            <v-tab value="personConfig">
                {{ $t("routeLabel.persons") }}
            </v-tab>
            <v-tab value="organisationUnitConfig">
                {{ $t("ouListLabel") }}
            </v-tab>
            <v-tab value="documentConfig">
                {{ $t("publicationsLabel") }}
            </v-tab>
        </v-tabs>

        <v-tabs-window
            v-if="displaySettings"
            v-model="currentTab"
        >
            <v-tabs-window-item v-if="personSettings" value="personConfig">
                <h3>{{ $t("numberOfPublicationsLabel") }}</h3>
                <v-row>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="personSettings.publicationCountTotal.display"
                                :label="$t('totalPublicationsLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="personSettings.publicationCountTotal.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="personSettings.publicationCountByYear.display"
                                :label="$t('numberOfPublicationsYearlyLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="personSettings.publicationCountByYear.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="personSettings.publicationTypeByYear.display"
                                :label="$t('numberOfPublicationsByTypeAndYearLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="personSettings.publicationTypeByYear.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="personSettings.publicationCategoryByYear.display"
                                :label="$t('numberOfPublicationsByMCategoryAndYearLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="personSettings.publicationCategoryByYear.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                </v-row>
                <h3>{{ $t("publicationTypesLabel") }}</h3>
                <v-row>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="personSettings.publicationTypeRatio.display"
                                :label="$t('publicationTypeRatioLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="personSettings.publicationTypeRatio.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="personSettings.publicationCategoryRatio.display"
                                :label="$t('publicationMCategoryRatioLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="personSettings.publicationCategoryRatio.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                </v-row>
                <h3>{{ $t("citationCountLabel") }}</h3>
                <v-row>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="personSettings.citationCountTotal.display"
                                :label="$t('totalCitationsLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="personSettings.citationCountTotal.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="personSettings.citationCountByYear.display"
                                :label="$t('numberOfCitationsYearlyLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="personSettings.citationCountByYear.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                </v-row>
                <h3>{{ $t("statisticsLabel") }}</h3>
                <v-row>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="personSettings.viewCountTotal.display"
                                :label="$t('totalViewsLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="personSettings.viewCountTotal.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="personSettings.viewCountByMonth.display"
                                :label="$t('numberOfViewsMonthlyLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="personSettings.viewCountByMonth.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="personSettings.viewCountByCountry.display"
                                :label="$t('viewsByCountryLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="personSettings.viewCountByCountry.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                </v-row>
            </v-tabs-window-item>

            <v-tabs-window-item v-if="ouSettings" value="organisationUnitConfig">
                <h3>{{ $t("numberOfPublicationsLabel") }}</h3>
                <v-row>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="ouSettings.publicationCountTotal.display"
                                :label="$t('totalPublicationsLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="ouSettings.publicationCountTotal.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="ouSettings.publicationCountByYear.display"
                                :label="$t('numberOfPublicationsYearlyLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="ouSettings.publicationCountByYear.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="ouSettings.publicationTypeByYear.display"
                                :label="$t('numberOfPublicationsByTypeAndYearLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="ouSettings.publicationTypeByYear.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="ouSettings.publicationCategoryByYear.display"
                                :label="$t('numberOfPublicationsByMCategoryAndYearLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="ouSettings.publicationCategoryByYear.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                </v-row>
                <h3>{{ $t("publicationTypesLabel") }}</h3>
                <v-row>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="ouSettings.publicationTypeRatio.display"
                                :label="$t('publicationTypeRatioLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="ouSettings.publicationTypeRatio.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="ouSettings.publicationCategoryRatio.display"
                                :label="$t('publicationMCategoryRatioLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="ouSettings.publicationCategoryRatio.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                </v-row>
                <h3>{{ $t("statisticsLabel") }}</h3>
                <v-row>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="ouSettings.viewCountTotal.display"
                                :label="$t('totalViewsLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="ouSettings.viewCountTotal.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="ouSettings.viewCountByMonth.display"
                                :label="$t('numberOfViewsMonthlyLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="ouSettings.viewCountByMonth.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="ouSettings.viewCountByCountry.display"
                                :label="$t('viewsByCountryLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="ouSettings.viewCountByCountry.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                </v-row>
                <h3>{{ $t("leaderboardsLabel") }}</h3>
                <v-row>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="ouSettings.publicationCountPersonLeaderboard.display"
                                :label="$t('personPublicationCountLeaderboardLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="ouSettings.publicationCountPersonLeaderboard.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="ouSettings.publicationCountSubUnitLeaderboard.display"
                                :label="$t('subUnitPublicationCountLeaderboardLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="ouSettings.publicationCountSubUnitLeaderboard.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="ouSettings.citationCountPersonLeaderboard.display"
                                :label="$t('personCitationCountLeaderboardLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="ouSettings.citationCountPersonLeaderboard.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="ouSettings.citationCountSubUnitLeaderboard.display"
                                :label="$t('subUnitCitationCountLeaderboardLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="ouSettings.citationCountSubUnitLeaderboard.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="ouSettings.assessmentPointPersonLeaderboard.display"
                                :label="$t('personAssessmentPointsLeaderboardLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="ouSettings.assessmentPointPersonLeaderboard.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="ouSettings.assessmentPointSubUnitLeaderboard.display"
                                :label="$t('subUnitAssessmentPointsLeaderboardLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="ouSettings.assessmentPointSubUnitLeaderboard.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                </v-row>
            </v-tabs-window-item>

            <v-tabs-window-item v-if="documentSettings" value="documentConfig">
                <h3>{{ $t("statisticsLabel") }}</h3>
                <v-row>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="documentSettings.viewCountTotal.display"
                                :label="$t('totalViewsLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="documentSettings.viewCountTotal.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="documentSettings.viewCountByMonth.display"
                                :label="$t('numberOfViewsMonthlyLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="documentSettings.viewCountByMonth.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="documentSettings.downloadCountTotal.display"
                                :label="$t('totalDownloadsLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="documentSettings.downloadCountTotal.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="documentSettings.downloadCountByMonth.display"
                                :label="$t('numberOfDownloadsMonthlyLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="documentSettings.downloadCountByMonth.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="documentSettings.viewCountByCountry.display"
                                :label="$t('viewsByCountryLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="documentSettings.viewCountByCountry.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="documentSettings.downloadCountByCountry.display"
                                :label="$t('downloadsByCountryLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="documentSettings.downloadCountByCountry.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                </v-row>
            </v-tabs-window-item>
        </v-tabs-window>
    </v-form>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { DocumentChartDisplaySettings, FullChartDisplaySettings, OUChartDisplaySettings, PersonChartDisplaySettings } from '@/models/ChartDisplayConfigurationModel';
import ChartDisplayConfigurationService from '@/services/visualization/ChartDisplayConfigurationService';

const props = defineProps({
    organisationUnitId: {
        type: Number,
        required: true
    }
});

const currentTab = ref("personConfig");
const displaySettings = ref<FullChartDisplaySettings>();

const personSettings = ref<PersonChartDisplaySettings>();
const ouSettings = ref<OUChartDisplaySettings>();
const documentSettings = ref<DocumentChartDisplaySettings>();

onMounted(() => {
    ChartDisplayConfigurationService.getFullChartDisplaySettings(
        props.organisationUnitId
    ).then(response => {
        displaySettings.value = response.data;
        personSettings.value = displaySettings.value.personChartDisplaySettings;
        ouSettings.value = displaySettings.value.ouChartDisplaySettings;
        documentSettings.value = displaySettings.value.documentChartDisplaySettings;
    });
});
</script>
