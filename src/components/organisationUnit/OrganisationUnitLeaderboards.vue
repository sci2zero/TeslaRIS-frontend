<template>
    <v-row
        no-gutters
        class="align-center mt-2"
        style="max-width: 250px;">
        <v-col cols="5">
            <v-text-field
                v-model="fromYear"
                type="number"
                density="compact"
                variant="outlined"
                hide-details
                :label="$t('fromLabel')"
                class="mr-2"
                :min="minYear"
                :max="min([maxYear, toYear])"
            ></v-text-field>
        </v-col>
        <v-col cols="5">
            <v-text-field
                v-model="toYear"
                type="number"
                density="compact"
                variant="outlined"
                hide-details
                :label="$t('toLabel')"
                :min="max([minYear, fromYear])"
                :max="maxYear"
            ></v-text-field>
        </v-col>
    </v-row>

    <v-tabs
        v-if="organisationUnitId"
        v-model="currentTab"
        color="deep-purple-accent-4"
        align-tabs="start"
    >
        <v-tab value="publicationCount">
            {{ $t("publicationCountLeaderboardLabel") }}
        </v-tab>
        <v-tab value="citationCount">
            {{ $t("citationCountLeaderboardLabel") }}
        </v-tab>
        <v-tab value="assessmentPoints">
            {{ $t("assessmentPointsLeaderboardLabel") }}
        </v-tab>
    </v-tabs>

    <v-tabs-window
        v-if="organisationUnitId"
        v-model="currentTab"
    >
        <v-tabs-window-item value="publicationCount">
            <v-row>
                <v-col :cols="subUnitPublicationCountsLeaderboard.length > 0 ? 6 : 12">
                    <leaderboard-table
                        :leaderboard-data="personPublicationCountsLeaderboard"
                        :title="$t('personPublicationCountLeaderboardLabel')"
                    />
                </v-col>
                <v-col v-if="subUnitPublicationCountsLeaderboard.length > 0">
                    <leaderboard-table
                        :leaderboard-data="subUnitPublicationCountsLeaderboard"
                        :title="$t('subUnitPublicationCountLeaderboardLabel')"
                    />
                </v-col>
            </v-row>
        </v-tabs-window-item>
        <v-tabs-window-item value="citationCount">
            <v-row>
                <v-col :cols="subUnitCitationCountsLeaderboard.length > 0 ? 6 : 12">
                    <leaderboard-table
                        :leaderboard-data="personCitationCountsLeaderboard"
                        :title="$t('personCitationCountLeaderboardLabel')"
                    />
                </v-col>
                <v-col v-if="subUnitCitationCountsLeaderboard.length > 0">
                    <leaderboard-table
                        :leaderboard-data="subUnitCitationCountsLeaderboard"
                        :title="$t('subUnitCitationCountLeaderboardLabel')"
                    />
                </v-col>
            </v-row>
        </v-tabs-window-item>
        <v-tabs-window-item value="assessmentPoints">
            <v-row>
                <v-col :cols="subUnitAssessmentPointsLeaderboard.length > 0 ? 6 : 12">
                    <div>
                        <leaderboard-table
                            v-for="leaderboard in personAssessmentPointsLeaderboard" :key="leaderboard.commissionId"
                            :leaderboard-data="leaderboard.leaderboardData"
                            :title="$t('personAssessmentPointsLeaderboardLabel')"
                            :subtitle="`${$t('commissionLabel')}: ${(returnCurrentLocaleContent(leaderboard.commissionDescription) as string)}`"
                        />
                    </div>
                </v-col>
                <v-col v-if="subUnitAssessmentPointsLeaderboard.length > 0">
                    <div>
                        <leaderboard-table
                            v-for="leaderboard in subUnitAssessmentPointsLeaderboard" :key="leaderboard.commissionId"
                            :leaderboard-data="leaderboard.leaderboardData"
                            :title="$t('subUnitAssessmentPointsLeaderboardLabel')"
                            :subtitle="`${$t('commissionLabel')}: ${(returnCurrentLocaleContent(leaderboard.commissionDescription) as string)}`"
                        />
                    </div>
                </v-col>
            </v-row>
        </v-tabs-window-item>
    </v-tabs-window>
</template>

<script setup lang="ts">
import type { CommissionAssessmentPointsPersonLeaderboard, LeaderboardEntry } from '@/models/Common';
import PersonLeaderboardService from '@/services/visualization/PersonLeaderboardService';
import { max, min } from 'lodash';
import { onMounted, ref, watch } from 'vue';
import LeaderboardTable from '../charts/LeaderboardTable.vue';
import OrganisationUnitLeaderboardService from '@/services/visualization/OrganisationUnitLeaderboardService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';


const props = defineProps({
    organisationUnitId: {
        type: Number,
        required: true
    }
});

const fromYear = ref<number>((new Date()).getFullYear() - 10);
const toYear = ref<number>((new Date()).getFullYear());
const minYear = ref(1950);
const maxYear = ref((new Date()).getFullYear());

const currentTab = ref("publicationCount");

const personPublicationCountsLeaderboard = ref<LeaderboardEntry[]>([]);
const personCitationCountsLeaderboard = ref<LeaderboardEntry[]>([]);
const personAssessmentPointsLeaderboard = ref<CommissionAssessmentPointsPersonLeaderboard[]>([]);

const subUnitPublicationCountsLeaderboard = ref<LeaderboardEntry[]>([]);
const subUnitCitationCountsLeaderboard = ref<LeaderboardEntry[]>([]);
const subUnitAssessmentPointsLeaderboard = ref<CommissionAssessmentPointsPersonLeaderboard[]>([]);

onMounted(() => {
    fetchLeaderboardData();
});

const fetchLeaderboardData = () => {
    fetchPersonLeaderboards();
    fetchOrganisationSubUnitsLeaderboards();
};

const fetchPersonLeaderboards = () => {
    personPublicationCountsLeaderboard.value.splice(0);
    PersonLeaderboardService.getPersonPublicationCountLeaderboard(
        props.organisationUnitId, fromYear.value, toYear.value
    ).then((response) => {
        personPublicationCountsLeaderboard.value = response.data
    });

    personCitationCountsLeaderboard.value.splice(0);
    PersonLeaderboardService.getPersonCitationCountLeaderboard(
        props.organisationUnitId, fromYear.value, toYear.value
    ).then((response) => {
        personCitationCountsLeaderboard.value = response.data
    });

    personAssessmentPointsLeaderboard.value.splice(0);
    PersonLeaderboardService.getPersonAssessmentPointsLeaderboard(
        props.organisationUnitId, fromYear.value, toYear.value
    ).then((response) => {
        personAssessmentPointsLeaderboard.value = response.data
    });
};

const fetchOrganisationSubUnitsLeaderboards = () => {
    subUnitPublicationCountsLeaderboard.value.splice(0);
    OrganisationUnitLeaderboardService.getOrganisationUnitPublicationCountLeaderboard(
        props.organisationUnitId, fromYear.value, toYear.value
    ).then((response) => {
        subUnitPublicationCountsLeaderboard.value = response.data
    });

    subUnitCitationCountsLeaderboard.value.splice(0);
    OrganisationUnitLeaderboardService.getOrganisationUnitCitationCountLeaderboard(
        props.organisationUnitId, fromYear.value, toYear.value
    ).then((response) => {
        subUnitCitationCountsLeaderboard.value = response.data
    });

    subUnitAssessmentPointsLeaderboard.value.splice(0);
    OrganisationUnitLeaderboardService.getOrganisationUnitAssessmentPointsLeaderboard(
        props.organisationUnitId, fromYear.value, toYear.value
    ).then((response) => {
        console.log(response)
        subUnitAssessmentPointsLeaderboard.value = response.data
    });
};

watch([fromYear, toYear], () => {
    if (fromYear.value < minYear.value) {
        fromYear.value = minYear.value;
    } else if (fromYear.value > maxYear.value) {
        fromYear.value = maxYear.value;
    }

    if (toYear.value < minYear.value) {
        toYear.value = minYear.value;
    } else if (toYear.value > maxYear.value) {
        toYear.value = maxYear.value;
    }
    
    if (fromYear.value > toYear.value) {
        fromYear.value = toYear.value;
    }

    if (toYear.value < fromYear.value) {
        toYear.value = fromYear.value;
    }

    fetchLeaderboardData();
});

</script>
