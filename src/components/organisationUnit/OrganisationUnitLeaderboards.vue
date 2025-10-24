<template>
    <v-row
        v-if="currentTab !== 'statistics'"
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
    <v-row
        v-else-if="currentTab === 'statistics'"
        class="align-center mt-2"
        style="max-width: 300px;">
        <v-col cols="6">
            <date-picker
                v-model="startDate"
                :label="$t('startDateLabel')"
                color="primary"
                required
                :allow-deletion="false"
            />
        </v-col>
        <v-col cols="6">
            <date-picker
                v-model="endDate"
                :label="$t('endDateLabel')"
                color="primary"
                required
                :allow-deletion="false"
            />
        </v-col>
    </v-row>

    <v-tabs
        v-if="organisationUnitId"
        v-model="currentTab"
        color="deep-purple-accent-4"
        align-tabs="start"
    >
        <v-tab v-show="displayPublicationsTab" value="publicationCount">
            {{ $t("publicationCountLeaderboardLabel") }}
        </v-tab>
        <v-tab v-show="displayCitationsTab" value="citationCount">
            {{ $t("citationCountLeaderboardLabel") }}
        </v-tab>
        <v-tab v-show="displayPointsTab" value="assessmentPoints">
            {{ $t("assessmentPointsLeaderboardLabel") }}
        </v-tab>
        <v-tab v-show="displayCitationsTab" value="statistics">
            {{ $t("viewsLabel") }}
        </v-tab>
    </v-tabs>

    <v-tabs-window
        v-if="organisationUnitId"
        v-model="currentTab"
    >
        <v-tabs-window-item value="publicationCount">
            <v-row class="d-flex justify-center">
                <v-col
                    v-if="displaySettings?.publicationCountPersonLeaderboard.display"
                    cols="12" :md="displaySettings?.publicationCountPersonLeaderboard.spanWholeRow ? 8 : 6">
                    <leaderboard-table
                        :leaderboard-data="personPublicationCountsLeaderboard"
                        :title="$t('personPublicationCountLeaderboardLabel')"
                    />
                </v-col>
                <v-col
                    v-if="displaySettings?.publicationCountSubUnitLeaderboard.display && subUnitPublicationCountsLeaderboard.length > 0"
                    cols="12" :md="displaySettings?.publicationCountSubUnitLeaderboard.spanWholeRow ? 8 : 6">
                    <leaderboard-table
                        :leaderboard-data="subUnitPublicationCountsLeaderboard"
                        :title="$t('subUnitPublicationCountLeaderboardLabel')"
                        display-employee-count
                    />
                </v-col>
            </v-row>
        </v-tabs-window-item>
        <v-tabs-window-item value="citationCount">
            <v-row class="d-flex justify-center">
                <v-col
                    v-if="displaySettings?.citationCountPersonLeaderboard.display"
                    cols="12" :md="displaySettings?.citationCountPersonLeaderboard.spanWholeRow ? 8 : 6">
                    <leaderboard-table
                        :leaderboard-data="personCitationCountsLeaderboard"
                        :title="$t('personCitationCountLeaderboardLabel')"
                    />
                </v-col>
                <v-col
                    v-if="displaySettings?.citationCountSubUnitLeaderboard.display && subUnitCitationCountsLeaderboard.length > 0"
                    cols="12" :md="displaySettings?.citationCountSubUnitLeaderboard.spanWholeRow ? 8 : 6">
                    <leaderboard-table
                        :leaderboard-data="subUnitCitationCountsLeaderboard"
                        :title="$t('subUnitCitationCountLeaderboardLabel')"
                    />
                </v-col>
                <v-col
                    v-if="displaySettings?.citationCountDocumentLeaderboard.display"
                    cols="12" :md="displaySettings?.citationCountDocumentLeaderboard.spanWholeRow ? 8 : 6">
                    <leaderboard-table
                        :leaderboard-data="documentCitationCountsLeaderboard"
                        :title="$t('documentCitationCountLeaderboardLabel')"
                    />
                </v-col>
            </v-row>
        </v-tabs-window-item>
        <v-tabs-window-item value="assessmentPoints">
            <v-row class="d-flex justify-center">
                <v-col
                    v-if="displaySettings?.assessmentPointPersonLeaderboard.display"
                    cols="12" :md="displaySettings?.assessmentPointPersonLeaderboard.spanWholeRow ? 12 : 6">
                    <div>
                        <leaderboard-table
                            v-for="leaderboard in personAssessmentPointsLeaderboard" :key="leaderboard.commissionId"
                            :leaderboard-data="leaderboard.leaderboardData"
                            :title="$t('personAssessmentPointsLeaderboardLabel')"
                            :subtitle="`${$t('commissionLabel')}: ${(returnCurrentLocaleContent(leaderboard.commissionDescription) as string)}`"
                        />
                    </div>
                </v-col>
                <v-col
                    v-if="displaySettings?.assessmentPointSubUnitLeaderboard.display && subUnitAssessmentPointsLeaderboard.length > 0"
                    cols="12" :md="displaySettings?.assessmentPointSubUnitLeaderboard.spanWholeRow ? 12 : 6">
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
        <v-tabs-window-item value="statistics">
            <div v-if="isDigitalLibraryClient">
                <v-checkbox
                    v-model="displayThesesLibraryAnalytics"
                    class="table-checkbox"
                    :label="$t('digitalLibraryAnalyticsLabel')"
                />
            </div>

            <v-row class="d-flex justify-center">
                <v-col
                    v-if="displaySettings?.viewCountPersonLeaderboard.display"
                    cols="12" :md="displaySettings?.viewCountPersonLeaderboard.spanWholeRow ? 12 : 6">
                    <leaderboard-table
                        :leaderboard-data="personViewCountsLeaderboard"
                        :title="$t('personViewCountsLeaderboardLabel')"
                    />
                </v-col>
                <v-col
                    v-if="displaySettings?.viewCountDocumentLeaderboard.display"
                    cols="12" :md="displaySettings?.viewCountDocumentLeaderboard.spanWholeRow ? 12 : 6">
                    <leaderboard-table
                        :leaderboard-data="documentViewCountsLeaderboard"
                        :title="$t('documentViewCountsLeaderboardLabel')"
                    />
                </v-col>
                <v-col
                    v-if="displaySettings?.downloadCountDocumentLeaderboard.display"
                    cols="12" :md="displaySettings?.downloadCountDocumentLeaderboard.spanWholeRow ? 12 : 6">
                    <leaderboard-table
                        :leaderboard-data="documentDownloadCountsLeaderboard"
                        :title="$t('documentDownloadCountsLeaderboardLabel')"
                    />
                </v-col>
            </v-row>

            <div
                v-if="displayThesesLibraryAnalytics"
                ref="thesisLibraryAnalyticsRef">
                <div class="flex flex-col justify-center items-center text-center mt-14">
                    <h2 class="text-3xl font-semibold">
                        {{ $t("digitalLibraryAnalyticsLabel") }}
                    </h2>
                    <v-select
                        v-model="selectedThesisTypes"
                        class="no-empty-outline publication-type-select mt-3"
                        :items="thesisTypes"
                        :label="$t('thesisTypeLabel')"
                        return-object
                        multiple
                    ></v-select>
                </div>

                <v-row>
                    <v-col
                        v-if="digitalLibraryDisplaySettings?.viewCountThesisLeaderboard.display"
                        cols="12" :md="digitalLibraryDisplaySettings?.viewCountThesisLeaderboard.spanWholeRow ? 12 : 6">
                        <leaderboard-table
                            :leaderboard-data="thesesViewCountsLeaderboard"
                            :title="$t('thesesViewCountsLeaderboardLabel')"
                        />
                    </v-col>
                    <v-col
                        v-if="digitalLibraryDisplaySettings?.downloadCountThesisLeaderboard.display"
                        cols="12" :md="digitalLibraryDisplaySettings?.downloadCountThesisLeaderboard.spanWholeRow ? 12 : 6">
                        <leaderboard-table
                            :leaderboard-data="thesesDownloadCountsLeaderboard"
                            :title="$t('thesesDownloadCountsLeaderboardLabel')"
                        />
                    </v-col>
                </v-row>
            </div>
        </v-tabs-window-item>
    </v-tabs-window>
</template>

<script setup lang="ts">
import type { CommissionAssessmentPointsPersonLeaderboard, LeaderboardEntry } from '@/models/Common';
import PersonLeaderboardService from '@/services/visualization/PersonLeaderboardService';
import { max, min } from 'lodash';
import { computed, onMounted, type PropType, ref, watch } from 'vue';
import LeaderboardTable from '../charts/LeaderboardTable.vue';
import OrganisationUnitLeaderboardService from '@/services/visualization/OrganisationUnitLeaderboardService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { DigitalLibraryChartDisplaySettings, OUChartDisplaySettings } from '@/models/ChartDisplayConfigurationModel';
import DocumentLeaderboardService from '@/services/visualization/DocumentLeaderboardService';
import DatePicker from '../core/DatePicker.vue';
import { StatisticsType } from '@/models/AssessmentModel';
import { getThesisTypesForGivenLocale } from '@/i18n/thesisType';
import { ThesisType } from '@/models/PublicationModel';
import DigitalLibraryLeaderboardService from '@/services/visualization/DigitalLibraryLeaderboardService';
import { useUserRole } from '@/composables/useUserRole';


const props = defineProps({
    organisationUnitId: {
        type: Number,
        required: true
    },
    displaySettings: {
        type: Object as PropType<OUChartDisplaySettings | undefined>,
        required: true
    },
    digitalLibraryDisplaySettings: {
        type: Object as PropType<DigitalLibraryChartDisplaySettings | undefined>,
        required: true
    },
    displayPublicationsTab: {
        type: Boolean,
        required: true
    },
    displayCitationsTab: {
        type: Boolean,
        required: true
    },
    displayPointsTab: {
        type: Boolean,
        required: true
    },
    isDigitalLibraryClient: {
        type: Boolean,
        default: false
    }
});

const fromYear = ref<number>((new Date()).getFullYear() - 10);
const toYear = ref<number>((new Date()).getFullYear());
const minYear = ref(1950);
const maxYear = ref((new Date()).getFullYear());

const startDate = ref<string>((new Date(`${(new Date()).getFullYear() - 10}-01-01`)).toISOString());
const endDate = ref<string>((new Date()).toISOString());

const currentTab = ref("publicationCount");

const {
    isInstitutionalLibrarian,
    isHeadOfLibrary
} = useUserRole();

const personPublicationCountsLeaderboard = ref<LeaderboardEntry[]>([]);
const personCitationCountsLeaderboard = ref<LeaderboardEntry[]>([]);
const personAssessmentPointsLeaderboard = ref<CommissionAssessmentPointsPersonLeaderboard[]>([]);
const personViewCountsLeaderboard = ref<LeaderboardEntry[]>([]);

const subUnitPublicationCountsLeaderboard = ref<LeaderboardEntry[]>([]);
const subUnitCitationCountsLeaderboard = ref<LeaderboardEntry[]>([]);
const subUnitAssessmentPointsLeaderboard = ref<CommissionAssessmentPointsPersonLeaderboard[]>([]);

const documentCitationCountsLeaderboard = ref<LeaderboardEntry[]>([]);
const documentViewCountsLeaderboard = ref<LeaderboardEntry[]>([]);
const documentDownloadCountsLeaderboard = ref<LeaderboardEntry[]>([]);

const thesesViewCountsLeaderboard = ref<LeaderboardEntry[]>([]);
const thesesDownloadCountsLeaderboard = ref<LeaderboardEntry[]>([]);

const thesisTypes = computed(() => getThesisTypesForGivenLocale());
const selectedThesisTypes = ref<{ title: string, value: ThesisType }[]>([]);

const displayThesesLibraryAnalytics = ref(false);

onMounted(() => {
    if (isInstitutionalLibrarian.value || isHeadOfLibrary.value) {
        displayThesesLibraryAnalytics.value = true;
    }

    fetchLeaderboardData();
    deduceStartTab();
});

const fetchLeaderboardData = () => {
    fetchPersonLeaderboards();
    fetchOrganisationSubUnitsLeaderboards();
    fetchDocumentLeaderboards();

    if (displayThesesLibraryAnalytics.value) {
        fetchDigitalLibraryLeaderboards();
    }
};

const fetchPersonLeaderboards = () => {
    personPublicationCountsLeaderboard.value.splice(0);
    PersonLeaderboardService.getPersonPublicationCountLeaderboard(
        props.organisationUnitId, fromYear.value, toYear.value
    ).then((response) => {
        personPublicationCountsLeaderboard.value = response.data;
    });

    personCitationCountsLeaderboard.value.splice(0);
    PersonLeaderboardService.getPersonCitationCountLeaderboard(
        props.organisationUnitId, fromYear.value, toYear.value
    ).then((response) => {
        personCitationCountsLeaderboard.value = response.data;
    });

    personAssessmentPointsLeaderboard.value.splice(0);
    PersonLeaderboardService.getPersonAssessmentPointsLeaderboard(
        props.organisationUnitId, fromYear.value, toYear.value
    ).then((response) => {
        personAssessmentPointsLeaderboard.value = response.data;
    });

    personViewCountsLeaderboard.value.splice(0);
    PersonLeaderboardService.getPersonViewCountLeaderboard(
        props.organisationUnitId, startDate.value.split("T")[0], endDate.value.split("T")[0]
    ).then((response) => {
        personViewCountsLeaderboard.value = response.data;
    });
};

const fetchOrganisationSubUnitsLeaderboards = () => {
    subUnitPublicationCountsLeaderboard.value.splice(0);
    OrganisationUnitLeaderboardService.getOrganisationUnitPublicationCountLeaderboard(
        props.organisationUnitId, fromYear.value, toYear.value
    ).then((response) => {
        subUnitPublicationCountsLeaderboard.value = response.data;
    });

    subUnitCitationCountsLeaderboard.value.splice(0);
    OrganisationUnitLeaderboardService.getOrganisationUnitCitationCountLeaderboard(
        props.organisationUnitId, fromYear.value, toYear.value
    ).then((response) => {
        subUnitCitationCountsLeaderboard.value = response.data;
    });

    subUnitAssessmentPointsLeaderboard.value.splice(0);
    OrganisationUnitLeaderboardService.getOrganisationUnitAssessmentPointsLeaderboard(
        props.organisationUnitId, fromYear.value, toYear.value
    ).then((response) => {
        subUnitAssessmentPointsLeaderboard.value = response.data;
    });
};

const fetchDocumentLeaderboards = () => {
    documentCitationCountsLeaderboard.value.splice(0);
    DocumentLeaderboardService.getDocumentCitationCountLeaderboard(
        props.organisationUnitId, fromYear.value, toYear.value
    ).then((response) => {
        documentCitationCountsLeaderboard.value = response.data;
    });

    documentViewCountsLeaderboard.value.splice(0);
    DocumentLeaderboardService.getDocumentStatisticCountLeaderboard(
        props.organisationUnitId, startDate.value.split("T")[0], endDate.value.split("T")[0], StatisticsType.VIEW
    ).then((response) => {
        documentViewCountsLeaderboard.value = response.data;
    });

    documentDownloadCountsLeaderboard.value.splice(0);
    DocumentLeaderboardService.getDocumentStatisticCountLeaderboard(
        props.organisationUnitId, startDate.value.split("T")[0], endDate.value.split("T")[0], StatisticsType.DOWNLOAD
    ).then((response) => {
        documentDownloadCountsLeaderboard.value = response.data;
    });
};

const fetchDigitalLibraryLeaderboards = () => {
    thesesViewCountsLeaderboard.value.splice(0);
    DigitalLibraryLeaderboardService.getThesisStatisticCountLeaderboard(
        props.organisationUnitId,
        startDate.value.split("T")[0], endDate.value.split("T")[0],
        StatisticsType.VIEW, selectedThesisTypes.value.map(type => type.value)
    ).then((response) => {
        thesesViewCountsLeaderboard.value = response.data;
    });

    thesesDownloadCountsLeaderboard.value.splice(0);
    DigitalLibraryLeaderboardService.getThesisStatisticCountLeaderboard(
        props.organisationUnitId,
        startDate.value.split("T")[0], endDate.value.split("T")[0],
        StatisticsType.DOWNLOAD, selectedThesisTypes.value.map(type => type.value)
    ).then((response) => {
        thesesDownloadCountsLeaderboard.value = response.data;
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

watch(
    [
        selectedThesisTypes,
        displayThesesLibraryAnalytics
    ], () => {
        if (displayThesesLibraryAnalytics.value) {
            fetchDigitalLibraryLeaderboards();
        }
    }
);

const deduceStartTab = () => {
    if (props.displayPublicationsTab) {
        currentTab.value = "publicationCount";
    } else if (props.displayCitationsTab) {
        currentTab.value = "citationCount";
    } else if (props.displayPointsTab) {
        currentTab.value = "assessmentPoints";
    }
};

const thesisLibraryAnalyticsRef = ref<HTMLElement>();

watch(thesisLibraryAnalyticsRef, () => {
    if (thesisLibraryAnalyticsRef.value) {
        thesisLibraryAnalyticsRef.value.scrollIntoView({ behavior: "smooth", block: "start" });
    }
});

</script>

<style scoped>

.publication-type-select {
    width: 500px;
}

</style>
