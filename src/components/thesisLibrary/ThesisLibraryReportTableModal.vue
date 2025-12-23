<template>
    <div justify="start">
        <v-dialog v-model="dialog" class="wide">
            <template #activator="scope">
                <v-btn
                    color="primary" :disabled="displayCount === 0"
                    density="compact" class="bottom-spacer" v-bind="scope.props"
                    v-on="scope.isActive">
                    {{ displayCount }}
                </v-btn>
            </template>
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ getReportName() }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <div
                            v-if="isLoading"
                            class="flex justify-center">
                            <v-progress-circular
                                color="primary"
                                :size="40"
                                :width="3"
                                indeterminate
                            ></v-progress-circular>
                        </div>
                        <div v-show="!isLoading">
                            <publication-table-component
                                :publications="publications"
                                :total-publications="totalPublications"
                                shows-research-outputs
                                allow-selection
                                @switch-page="switchPage">
                            </publication-table-component>
                        </div>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>


<script lang="ts">
import { type ThesisReportRequest, ThesisReportType } from "@/models/ThesisLibraryModel";
import { type PropType, ref } from "vue";
import { defineComponent } from "vue";
import PublicationTableComponent from "../publication/PublicationTableComponent.vue";
import { type DocumentPublicationIndex } from "@/models/PublicationModel";
import ThesisLibraryReportingService from "@/services/thesisLibrary/ThesisLibraryReportingService";
import { useI18n } from "vue-i18n";

export default defineComponent({
    name: "ThesisLibraryReportTableModal",
    components: { PublicationTableComponent },
    props: {
        displayCount: {
            type: Number,
            required: true
        },
        reportRequest: {
            type: Object as PropType<ThesisReportRequest>,
            required: true
        },
        reportType: {
            type: Object as PropType<ThesisReportType>,
            required: true
        },
        institutionId: {
            type: Number,
            required: true
        }
    },
    setup(props) {
        const dialog = ref(false);
        const i18n = useI18n();

        const isLoading = ref(false);

        const publications = ref<DocumentPublicationIndex[]>([]);
        const totalPublications = ref<number>(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");
        
        const fetchTheses = () => {
            const reportMethods = {
                [ThesisReportType.DEFENDED]:
                    (body: ThesisReportRequest, pageable: string) =>
                        ThesisLibraryReportingService.getDefendedThesesForPeriod(body, pageable),
                [ThesisReportType.NOT_DEFENDED]:
                    (body: ThesisReportRequest, pageable: string) =>
                        ThesisLibraryReportingService.getNotDefendedThesesForPeriod(body, pageable),
                [ThesisReportType.PUBLICLY_AVAILABLE]:
                    (body: ThesisReportRequest, pageable: string) =>
                        ThesisLibraryReportingService.getPubliclyAvailableThesesForPeriod(body, pageable),
                [ThesisReportType.CLOSED_ACCESS]:
                    (body: ThesisReportRequest, pageable: string) =>
                        ThesisLibraryReportingService.getClosedAccessThesesForPeriod(body, pageable)
            };

            const fetchMethod = reportMethods[props.reportType];

            const reportRequest = Object.assign(
                {},
                props.reportRequest,
                { 
                    topLevelInstitutionIds: [props.institutionId]
                }
            );
            
            if (fetchMethod) {
                isLoading.value = true;
                fetchMethod(reportRequest, `page=${page.value}&size=${size.value}&sort=${sort.value}`)
                    .then(({ data }) => {
                        publications.value = data.content;
                        totalPublications.value = data.totalElements;
                        isLoading.value = false;
                    });
            }
        };

        const getReportName = () => {
            switch (props.reportType) {
                case ThesisReportType.DEFENDED:
                    return i18n.t("defendedThesesLabel");
                case ThesisReportType.NOT_DEFENDED:
                    return i18n.t("notDefendedThesesLabel");
                case ThesisReportType.PUBLICLY_AVAILABLE:
                    return i18n.t("publiclyAvailableThesesLabel");
                case ThesisReportType.CLOSED_ACCESS:
                    return i18n.t("closedAccessThesesLabel");
            }
        };

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            sort.value = sortField;
            direction.value = sortDir;
            fetchTheses();
        };

        return { 
            dialog, publications, isLoading,
            totalPublications, switchPage,
            fetchTheses, getReportName
        };
    }
});
</script>

<style scoped>

.wide {
    width: 100%;
    max-width: 1500px;
}

</style>
