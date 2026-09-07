<template>
    <table-toolbar
        :title="$t('fundingApplicationsLabel')"
        :selected-count="selectedApplications.length"
        :can-act="canEdit"
    >
        <template #top-left>
            <search-bar-component
                :transparent="false"
                size="small"
                @search="onSearch"
            />
        </template>
        <template #action-items>
            <v-list-item
                class="action-menu-item"
                @click="displayPersistentDialog = true"
            >
                <template #prepend>
                    <v-icon color="error" size="18">
                        mdi-delete
                    </v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                    {{ $t("removeLabel") }}
                </v-list-item-title>
            </v-list-item>
        </template>
        <template #actions>
            <v-btn
                v-if="canEdit"
                color="primary"
                prepend-icon="mdi-plus"
                @click="addDialog = true">
                {{ $t("addFundingApplicationLabel") }}
            </v-btn>
        </template>
    </table-toolbar>

    <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <v-data-table-server
            v-model="selectedApplications"
            :items="fundingApplications"
            :headers="headers"
            item-value="row"
            :items-length="totalApplications"
            :show-select="canEdit"
            return-object
            :items-per-page-text="$t('itemsPerPageLabel')"
            :items-per-page-options="[5, 10, 25, 50]"
            :no-data-text="$t('noDataInTableMessage')"
            :page="page + 1"
            @update:options="refreshTable">
            <template #item="row">
                <tr>
                    <td v-if="canEdit">
                        <v-checkbox
                            v-model="selectedApplications"
                            :value="row.item"
                            class="table-checkbox"
                            hide-details
                        />
                    </td>
                    <td>
                        <localized-link :to="'funding-application/' + row.item.databaseId">
                            {{ displayTextOrPlaceholder($i18n.locale.startsWith("sr") ? row.item.projectNameSr : row.item.projectNameOther) }}
                        </localized-link>
                    </td>
                    <td>
                        {{ displayTextOrPlaceholder($i18n.locale.startsWith("sr") ? (row.item.funderNameSr || row.item.funderNameOther) : (row.item.funderNameOther || row.item.funderNameSr)) }}
                    </td>
                    <td>
                        {{ displayTextOrPlaceholder(localiseDate(row.item.submissionDate)) }}
                    </td>
                    <td>
                        {{ displayTextOrPlaceholder(localiseDate(row.item.decisionDate)) }}
                    </td>
                    <td>
                        <v-chip
                            v-if="row.item.result"
                            size="small"
                            :color="getFundingApplicationResultColor(row.item.result)"
                            variant="flat"
                        >
                            {{ getFundingApplicationResultTitleFromValueAutoLocale(row.item.result) }}
                        </v-chip>
                        <span v-else>{{ displayTextOrPlaceholder("") }}</span>
                    </td>
                </tr>
            </template>
        </v-data-table-server>
    </div>

    <v-dialog v-model="addDialog" persistent max-width="900">
        <v-card>
            <v-card-title>
                <span class="text-h5">{{ $t("addFundingApplicationLabel") }}</span>
            </v-card-title>
            <v-card-text>
                <funding-application-autocomplete-search
                    :preset-funding-call-id="fundingCallId"
                    @selected="linkExistingApplication($event)"
                    @create="onApplicationCreated"
                />
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn color="blue darken-1" @click="addDialog = false">
                    {{ $t("closeLabel") }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <persistent-question-dialog
        v-model="displayPersistentDialog"
        :title="$t('areYouSureLabel')"
        :message="$t('confirmDeletionMessage')"
        :entity-names="selectedApplications.map(application => applicationTitle(application))"
        @continue="deleteSelected" />

    <toast v-model="snackbar" :message="snackbarMessage" />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import type { AxiosError } from "axios";
import FundingApplicationService from "@/services/project/FundingApplicationService";
import type { FundingApplicationIndex } from "@/models/FundingApplicationModel";
import type { ErrorResponse } from "@/models/Common";
import LocalizedLink from "@/components/localization/LocalizedLink.vue";
import FundingApplicationAutocompleteSearch from "@/components/project/FundingApplicationAutocompleteSearch.vue";
import PersistentQuestionDialog from "@/components/core/comparators/PersistentQuestionDialog.vue";
import Toast from "@/components/core/Toast.vue";
import TableToolbar from "@/components/core/TableToolbar.vue";
import SearchBarComponent from "@/components/core/SearchBarComponent.vue";
import { displayTextOrPlaceholder } from "@/utils/StringUtil";
import { localiseDate } from "@/utils/DateUtil";
import { getFundingApplicationResultColor, getFundingApplicationResultTitleFromValueAutoLocale } from "@/i18n/fundingApplicationResult";

const props = defineProps({
    fundingCallId: {
        type: Number,
        required: true
    },
    canEdit: {
        type: Boolean,
        default: false
    }
});

const i18n = useI18n();

const fundingApplications = ref<FundingApplicationIndex[]>([]);
const totalApplications = ref(0);
const selectedApplications = ref<FundingApplicationIndex[]>([]);

const addDialog = ref(false);
const displayPersistentDialog = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref("");

const page = ref(0);
const size = ref(10);
const sort = ref("");
const direction = ref("");

const headers = computed(() => [
    { title: i18n.t("projectLabel"), align: "start", sortable: true, key: "project" },
    { title: i18n.t("funderLabel"), align: "start", sortable: false, key: "funder" },
    { title: i18n.t("submissionDateLabel"), align: "start", sortable: true, key: "submissionDate" },
    { title: i18n.t("dateOfDecisionLabel"), align: "start", sortable: true, key: "decisionDate" },
    { title: i18n.t("resultLabel"), align: "start", sortable: false, key: "result" }
]);

const sortFieldMappings = computed<Map<string, string>>(() => {
    const isSr = i18n.locale.value.startsWith("sr");
    return new Map([
        ["project", isSr ? "project_name_sr_sortable" : "project_name_other_sortable"],
        ["submissionDate", "submission_date"],
        ["decisionDate", "decision_date"]
    ]);
});

const defaultSortField = computed(() => sortFieldMappings.value.get("project") as string);

const applicationTitle = (application: FundingApplicationIndex) => {
    const isSr = i18n.locale.value.startsWith("sr");
    const projectName = isSr ? application.projectNameSr : application.projectNameOther;
    const callName = isSr ? application.fundingCallNameSr : application.fundingCallNameOther;
    const combined = [projectName, callName].filter(part => part).join(" — ");
    return combined || `#${application.databaseId}`;
};

// An empty search box emits an empty string, so fall back to "*" -- otherwise the query
// would go out without a single tokens parameter.
const searchParams = ref("tokens=*");

const onSearch = (tokens: string) => {
    searchParams.value = tokens ? tokens : "tokens=*";
    page.value = 0;
    fetchFundingApplications();
};

const fetchFundingApplications = () => {
    const sortField = sort.value || defaultSortField.value;
    const sortDir = sort.value ? direction.value : "ASC";
    const params = `${searchParams.value}&page=${page.value}&size=${size.value}&sort=${sortField},${sortDir}`;
    FundingApplicationService.searchFundingApplications(params, null, props.fundingCallId).then((response) => {
        fundingApplications.value = response.data.content;
        totalApplications.value = response.data.totalElements;
    });
};

const refreshTable = (event: any) => {
    page.value = event.page - 1;
    size.value = event.itemsPerPage;
    if (event.sortBy.length > 0) {
        sort.value = sortFieldMappings.value.get(event.sortBy[0].key) ?? "";
        direction.value = event.sortBy[0].order.toUpperCase();
    } else {
        sort.value = "";
        direction.value = "";
    }
    fetchFundingApplications();
};

const reindexDelayMs = 1200;

const refetchAfterReindex = () => {
    setTimeout(() => fetchFundingApplications(), reindexDelayMs);
};

const linkExistingApplication = (selected: { title: string; value: number; }) => {
    addDialog.value = false;
    FundingApplicationService.readFundingApplication(selected.value).then((response) => {
        const fundingApplication = response.data;
        fundingApplication.fundingCallId = props.fundingCallId;
        return FundingApplicationService.updateFundingApplication(selected.value, fundingApplication);
    }).then(() => {
        notify(i18n.t("updatedSuccessMessage"));
        refetchAfterReindex();
    }).catch((error: AxiosError<ErrorResponse>) => {
        notifyError(error);
    });
};

const onApplicationCreated = () => {
    addDialog.value = false;
    notify(i18n.t("savedMessage"));
    refetchAfterReindex();
};

const deleteSelected = () => {
    const removedIds = selectedApplications.value.map((application) => application.databaseId);
    const removedNames = selectedApplications.value.map((application) => applicationTitle(application)).join(", ");
    Promise.all(removedIds.map((applicationId) => FundingApplicationService.deleteFundingApplication(applicationId)))
        .then(() => {
            fundingApplications.value = fundingApplications.value.filter((application) => !removedIds.includes(application.databaseId));
            totalApplications.value = Math.max(0, totalApplications.value - removedIds.length);
            selectedApplications.value = [];
            notify(i18n.t("deleteSuccessNotification", { name: removedNames }));
        })
        .catch((error: AxiosError<ErrorResponse>) => {
            notifyError(error);
            fetchFundingApplications();
        });
};

const notify = (message: string) => {
    snackbarMessage.value = message;
    snackbar.value = true;
};

const notifyError = (error: AxiosError<ErrorResponse>) => {
    const backendMessage = error.response?.data.message as string;
    const translated = backendMessage ? i18n.t(backendMessage) : "";
    notify(translated && translated !== backendMessage ? translated : i18n.t("genericErrorMessage"));
};
</script>
