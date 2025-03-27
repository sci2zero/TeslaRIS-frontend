<template>
    <v-row 
        v-if="reportCounts.length > 0 && (reportRequest?.thesisType === ThesisType.PHD || reportRequest?.thesisType === ThesisType.PHD_ART_PROJECT)"
        class="d-flex flex-row justify-between">
        <v-col cols="12" sm="6" md="2">
            <v-select
                v-model="selectedLang"
                :items="langItems"
                :label="$t('languageLabel') + '*'"
                :rules="requiredSelectionRules"
                return-object>
            </v-select>
        </v-col>
        <v-col cols="12" sm="6" md="2">
            <v-btn
                class="bottom-spacer mt-4"
                density="compact"
                @click="downloadReport">
                {{ $t("downloadLabel") }}
            </v-btn>
        </v-col>
    </v-row>
    <v-data-table
        v-if="reportCounts.length > 0"
        :headers="headers"
        :items="reportCounts"
        density="comfortable"
        hide-default-footer
        class="mb-5"
    >
        <template #top>
            <v-toolbar flat>
                <v-toolbar-title>{{ $t("thesisReportTitle") }}</v-toolbar-title>
            </v-toolbar>
        </template>

        <template #item="props">
            <tr>
                <td>
                    <localized-link
                        v-if="props.item.institutionId"
                        :to="'organisation-units/' + props.item.institutionId">
                        {{ returnCurrentLocaleContent(props.item.institutionName) }}
                    </localized-link>
                    <strong v-else>{{ returnCurrentLocaleContent(props.item.institutionName) }}</strong>
                </td>
                <td>
                    <thesis-library-report-table-modal
                        class="mt-3"
                        :display-count="props.item.defendedCount"
                        :report-request="(reportRequest as ThesisReportRequest)"
                        :report-type="ThesisReportType.DEFENDED">
                    </thesis-library-report-table-modal>
                </td>
                <td>
                    <thesis-library-report-table-modal
                        class="mt-3"
                        :display-count="props.item.topicsAcceptedCount"
                        :report-request="(reportRequest as ThesisReportRequest)"
                        :report-type="ThesisReportType.ACCEPTED">
                    </thesis-library-report-table-modal>
                </td>
                <td>
                    <thesis-library-report-table-modal
                        class="mt-3"
                        :display-count="props.item.putOnPublicReviewCount"
                        :report-request="(reportRequest as ThesisReportRequest)"
                        :report-type="ThesisReportType.PUBLIC_REVIEW">
                    </thesis-library-report-table-modal>
                </td>
                <td>
                    <thesis-library-report-table-modal
                        class="mt-3"
                        :display-count="props.item.publiclyAvailableCount"
                        :report-request="(reportRequest as ThesisReportRequest)"
                        :report-type="ThesisReportType.PUBLICLY_AVAILABLE">
                    </thesis-library-report-table-modal>
                </td>
            </tr>
        </template>
    </v-data-table>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch, type PropType } from 'vue';
import { type ThesisReportCounts, ThesisReportType, type ThesisReportRequest } from '@/models/ThesisLibraryModel';
import ThesisLibraryReportTableModal from './ThesisLibraryReportTableModal.vue';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import { useI18n } from 'vue-i18n';
import ThesisLibraryReportingService from '@/services/thesisLibrary/ThesisLibraryReportingService';
import { ThesisType } from '@/models/PublicationModel';
import { getLangItems } from '@/i18n/languages';
import { useValidationUtils } from '@/utils/ValidationUtils';
import LocalizedLink from '../localization/LocalizedLink.vue';


export default defineComponent({
    name: "ThesisLibraryTableComponent",
    components: { ThesisLibraryReportTableModal, LocalizedLink },
    props: {
        reportRequest: {
            type: Object as PropType<ThesisReportRequest | undefined>,
            required: true
        }
    },
    emits: ["switchPage"],
    setup(props) {
        const reportCounts = ref<ThesisReportCounts[]>([]);
        const langItems = getLangItems();
        const selectedLang = ref<{title: string, value: string}>({title: "Srpski", value: "sr"});

        const { requiredSelectionRules } = useValidationUtils();
        
        const i18n = useI18n();
        const nameLabel = computed(() => i18n.t("nameLabel"));
        const defendedLabel = computed(() => i18n.t("defendedLabel"));
        const acceptedLabel = computed(() => i18n.t("acceptedLabel"));
        const publicReviewLabel = computed(() => i18n.t("publicReviewLabel"));
        const publiclyAvailableLabel = computed(() => i18n.t("publiclyAvailableLabel"));

        const headers = ref<any>([
            { title: nameLabel, align: "start", sortable: false, key: "name"},
            { title: defendedLabel, align: "start", sortable: false, key: "defended"},
            { title: acceptedLabel, align: "start", sortable: false, key: "accepted"},
            { title: publicReviewLabel, align: "start", sortable: false, key: "publicReview"},
            { title: publiclyAvailableLabel, align: "start", sortable: false, key: "publicAccess"},
        ]);

        watch(() => props.reportRequest, () => {
            fetchReportCounts();
        });

        const fetchReportCounts = () => {
            if (!props.reportRequest) {
                return;
            }

            ThesisLibraryReportingService.getReportCounts(props.reportRequest).then(response => {
                reportCounts.value = response.data;
            });
        };

        const downloadReport = () => {
            if (!props.reportRequest) {
                return;
            }

            ThesisLibraryReportingService.downloadReport(props.reportRequest, selectedLang.value.value);
        };

        return {
            reportCounts, headers,
            returnCurrentLocaleContent,
            ThesisReportType, downloadReport,
            ThesisType, langItems, selectedLang,
            requiredSelectionRules
        };
    }
});
</script>
