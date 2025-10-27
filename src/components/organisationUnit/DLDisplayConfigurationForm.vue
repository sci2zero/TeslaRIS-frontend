<template>
    <v-form v-if="isFormValid" @submit.prevent>
        <v-tabs
            v-if="digitalLibrarySettings"
            v-model="currentTab"
            color="deep-purple-accent-4"
            align-tabs="start"
        >
            <v-tab value="publicationsConfig">
                {{ $t("publicationsLabel") }}
            </v-tab>
            <v-tab value="statisticsConfig">
                {{ $t("statisticsLabel") }}
            </v-tab>
            <v-tab value="leaderboardsConfig">
                {{ $t("leaderboardsLabel") }}
            </v-tab>
        </v-tabs>

        <v-tabs-window
            v-if="digitalLibrarySettings"
            v-model="currentTab"
        >
            <v-tabs-window-item value="publicationsConfig">
                <h3>{{ $t("numberOfPublicationsLabel") }}</h3>
                <v-row>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="digitalLibrarySettings.thesisCountTotal.display"
                                :label="$t('totalThesesLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="digitalLibrarySettings.thesisCountTotal.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="digitalLibrarySettings.thesisCountByYear.display"
                                :label="$t('numberOfThesesYearlyLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="digitalLibrarySettings.thesisCountByYear.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="digitalLibrarySettings.thesisTypeByYear.display"
                                :label="$t('numberOfThesesByTypeAndYearLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="digitalLibrarySettings.thesisTypeByYear.spanWholeRow"
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
                                v-model="digitalLibrarySettings.thesisTypeRatio.display"
                                :label="$t('thesisTypeRatioLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="digitalLibrarySettings.thesisTypeRatio.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                </v-row>
            </v-tabs-window-item>

            <v-tabs-window-item value="statisticsConfig">
                <h3>{{ $t("viewsLabel") }}</h3>
                <v-row>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="digitalLibrarySettings.thesisViewCountTotal.display"
                                :label="$t('totalViewsLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="digitalLibrarySettings.thesisViewCountTotal.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="digitalLibrarySettings.thesisViewCountByMonth.display"
                                :label="$t('numberOfViewsMonthlyLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="digitalLibrarySettings.thesisViewCountByMonth.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="digitalLibrarySettings.thesisViewCountByCountry.display"
                                :label="$t('viewsByCountryLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="digitalLibrarySettings.thesisViewCountByCountry.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                </v-row>
                <h3>{{ $t("downloadsLabel") }}</h3>
                <v-row>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="digitalLibrarySettings.thesisDownloadCountTotal.display"
                                :label="$t('totalViewsLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="digitalLibrarySettings.thesisDownloadCountTotal.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="digitalLibrarySettings.thesisDownloadCountByMonth.display"
                                :label="$t('numberOfViewsMonthlyLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="digitalLibrarySettings.thesisDownloadCountByMonth.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="digitalLibrarySettings.thesisDownloadCountByCountry.display"
                                :label="$t('viewsByCountryLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="digitalLibrarySettings.thesisDownloadCountByCountry.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                </v-row>
            </v-tabs-window-item>

            <v-tabs-window-item value="leaderboardsConfig">
                <h3>{{ $t("leaderboardsLabel") }}</h3>
                <v-row>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="digitalLibrarySettings.viewCountThesisLeaderboard.display"
                                :label="$t('thesesViewCountsLeaderboardLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="digitalLibrarySettings.viewCountThesisLeaderboard.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                    <v-col cols="6">
                        <div class="d-flex flex-row justify-start">
                            <v-checkbox
                                v-model="digitalLibrarySettings.downloadCountThesisLeaderboard.display"
                                :label="$t('thesesDownloadCountsLeaderboardLabel')"
                            ></v-checkbox>
                            <v-checkbox
                                v-model="digitalLibrarySettings.downloadCountThesisLeaderboard.spanWholeRow"
                                :label="$t('spanWholeRowLabel')"
                            ></v-checkbox>
                        </div>
                    </v-col>
                </v-row>
            </v-tabs-window-item>
        </v-tabs-window>

        <toast v-model="snackbar" :message="message" />
    </v-form>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { DigitalLibraryChartDisplaySettings } from '@/models/ChartDisplayConfigurationModel';
import ChartDisplayConfigurationService from '@/services/visualization/ChartDisplayConfigurationService';
import { getErrorMessageForErrorKey } from '@/i18n';
import Toast from '../core/Toast.vue';
import { useI18n } from 'vue-i18n';


const props = defineProps({
    organisationUnitId: {
        type: Number,
        required: true
    }
});


const emit = defineEmits(["updatePersist"]);

const snackbar = ref(false);
const message = ref("");
const i18n = useI18n();

const isFormValid = ref(true);
const currentTab = ref("personConfig");
const digitalLibrarySettings = ref<DigitalLibraryChartDisplaySettings>();

onMounted(() => {
    ChartDisplayConfigurationService.getChartDisplaySettingsForDigitalLibrary(
        props.organisationUnitId
    ).then(response => {
        digitalLibrarySettings.value = response.data;
    });
});

const submit = () => {
    if (!digitalLibrarySettings.value) {
        return;
    }

    ChartDisplayConfigurationService.saveDigitalLibraryChartDisplaySettings(
        props.organisationUnitId,
        digitalLibrarySettings.value
    ).then(() => {
        message.value = i18n.t("updatedSuccessMessage");
        snackbar.value = true;

        emit("updatePersist");
    }).catch((error) => {
        message.value = getErrorMessageForErrorKey(error.response.data.message);
        snackbar.value = true;
    });
};

defineExpose({
    isFormValid,
    submit
});

</script>
