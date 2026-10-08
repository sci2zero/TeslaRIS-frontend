<template>
    <landing-section-card
        :title="$t('fundingApplicationsLabel')"
        :count="totalApplications"
        icon="mdi-file-document-edit-outline"
        icon-class="bg-indigo-50 text-indigo-600"
        padded>
        <template v-if="canEdit" #action>
            <v-btn
                v-if="canEdit"
                variant="outlined"
                size="small"
                class="text-none"
                prepend-icon="mdi-plus"
                @click="addDialog = true">
                {{ $t("addFundingApplicationLabel") }}
            </v-btn>
        </template>
        <responsive-data-table
            v-model="selectedApplications"
            :headers="headers"
            :show-select="canEdit"
            container-class="bg-white"
            item-key="databaseId"
            :items="fundingApplications"
            :items-length="totalApplications"
            :page="page + 1"
            :items-per-page="size"
            :sort-by="tableSortBy"
            @update:options="refreshTable">
            <template #top-left>
                <search-bar-component
                    class="w-full min-w-0 max-w-none!"
                    :transparent="false"
                    size="small"
                    @search="onSearch"
                />
            </template>
            <template v-if="canEdit" #selection-menu>
                <v-list-item
                    class="action-menu-item"
                    @click="unlinkSelected"
                >
                    <template #prepend>
                        <v-icon color="error" size="18">
                            mdi-link-off
                        </v-icon>
                    </template>
                    <v-list-item-title class="text-body-2">
                        {{ $t("removeLabel") }}
                    </v-list-item-title>
                </v-list-item>
            </template>
            <template #compact-item="{ item }">
                <entity-list-card :to="recordLink(item)" @preview="openGlance(item)">
                    <div class="flex items-start gap-3">
                        <v-checkbox
                            v-if="canEdit"
                            v-model="selectedApplications"
                            :value="item"
                            :aria-label="applicationTitle(item)"
                            density="compact"
                            hide-details />
                        <entity-row-identity
                            :title="applicationTitle(item)"
                            :to="recordLink(item)"
                            icon="mdi-file-document-edit-outline">
                            <p class="mt-1 text-sm text-slate-600 break-words">
                                {{ displayTextOrPlaceholder(funderName(item)) }}
                            </p>
                        </entity-row-identity>
                    </div>
                </entity-list-card>
            </template>
            <template #row="{ item }">
                <tr>
                    <td v-if="canEdit">
                        <v-checkbox
                            v-model="selectedApplications"
                            :value="item"
                            class="table-checkbox"
                            hide-details
                        />
                    </td>
                    <td>
                        <entity-row-identity
                            :title="applicationTitle(item)"
                            :to="recordLink(item)"
                            icon="mdi-file-document-edit-outline"
                            class="py-2" />
                    </td>
                    <td class="text-sm text-slate-600">
                        <localized-link
                            v-if="item.funderId"
                            :to="'organisation-units/' + item.funderId"
                        >
                            {{ funderName(item) }}
                        </localized-link>
                        <span v-else>
                            {{ displayTextOrPlaceholder(funderName(item)) }}
                        </span>
                    </td>
                    <td class="text-sm text-slate-600">
                        {{ displayTextOrPlaceholder(localiseDate(item.submissionDate)) }}
                    </td>
                    <td class="text-sm text-slate-600">
                        {{ displayTextOrPlaceholder(localiseDate(item.decisionDate)) }}
                    </td>
                    <td class="text-sm text-slate-600">
                        <v-chip
                            v-if="item.result"
                            size="small"
                            :color="getFundingApplicationResultColor(item.result)"
                            variant="flat"
                        >
                            {{ getFundingApplicationResultTitleFromValueAutoLocale(item.result) }}
                        </v-chip>
                        <span v-else>{{ displayTextOrPlaceholder("") }}</span>
                    </td>
                </tr>
            </template>
        </responsive-data-table>
    </landing-section-card>

    <project-relation-glance
        v-if="glancedRecord"
        v-model="glanceOpen"
        :title="applicationTitle(glancedRecord)"
        :to="recordLink(glancedRecord)"
        :fields="glanceFields(glancedRecord)"
        icon="mdi-file-document-edit-outline" />

    <scrollable-dialog v-model="addDialog" persistent max-width="900">
        <template #header>
            <h2 class="px-5 py-4 text-xl font-bold text-slate-800">
                {{ $t("addFundingApplicationLabel") }}
            </h2>
        </template>
        <div class="p-5">
            <funding-application-autocomplete-search
                :preset-project-id="projectId"
                @selected="linkExistingApplication($event)"
                @create="onApplicationCreated"
            />
        </div>
        <template #footer>
            <div class="flex justify-end px-5 py-3">
                <v-btn color="blue darken-1" @click="addDialog = false">
                    {{ $t("closeLabel") }}
                </v-btn>
            </div>
        </template>
    </scrollable-dialog>

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
import Toast from "@/components/core/Toast.vue";
import ScrollableDialog from "@/components/core/ScrollableDialog.vue";
import LandingSectionCard from "@/components/landing/LandingSectionCard.vue";
import ResponsiveDataTable from "@/components/core/ResponsiveDataTable.vue";
import EntityRowIdentity from "@/components/core/EntityRowIdentity.vue";
import EntityListCard from "@/components/core/EntityListCard.vue";
import ProjectRelationGlance from "./ProjectRelationGlance.vue";
import SearchBarComponent from "@/components/core/SearchBarComponent.vue";
import { displayTextOrPlaceholder } from "@/utils/StringUtil";
import { localiseDate } from "@/utils/DateUtil";
import { getFundingApplicationResultColor, getFundingApplicationResultTitleFromValueAutoLocale } from "@/i18n/fundingApplicationResult";
import { useUserRole } from "@/composables/useUserRole";

const props = defineProps({
    projectId: {
        type: Number,
        required: true
    },
    canEdit: {
        type: Boolean,
        default: false
    }
});

const i18n = useI18n();
const { isAdmin } = useUserRole();

const fundingApplications = ref<FundingApplicationIndex[]>([]);
const totalApplications = ref(0);
const selectedApplications = ref<FundingApplicationIndex[]>([]);

const glanceOpen = ref(false);
const glancedRecord = ref<FundingApplicationIndex | null>(null);
const openGlance = (item: FundingApplicationIndex) => {
    glancedRecord.value = item;
    glanceOpen.value = true;
};
const recordLink = (item: FundingApplicationIndex) => isAdmin.value ? 'funding-application/' + item.databaseId : undefined;
const glanceFields = (item: FundingApplicationIndex) => [
    { label: i18n.t("funderLabel"), value: funderName(item) },
    { label: i18n.t("submissionDateLabel"), value: localiseDate(item.submissionDate) },
    { label: i18n.t("dateOfDecisionLabel"), value: localiseDate(item.decisionDate) },
    { label: i18n.t("resultLabel"), value: item.result ? getFundingApplicationResultTitleFromValueAutoLocale(item.result) : undefined }
];

const tableSortBy = ref<{ key: string; order: string }[]>([]);

const addDialog = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref("");

const page = ref(0);
const size = ref(10);
const sort = ref("");
const direction = ref("");

const funderName = (application: FundingApplicationIndex) => {
    const isSr = i18n.locale.value.startsWith("sr");
    return isSr
        ? (application.funderNameSr || application.funderNameOther)
        : (application.funderNameOther || application.funderNameSr);
};

const headers = computed(() => [
    { title: i18n.t("fundingApplicationLabel"), align: "start", sortable: true, key: "fundingCall" },
    { title: i18n.t("funderLabel"), align: "start", sortable: false, key: "funder" },
    { title: i18n.t("submissionDateLabel"), align: "start", sortable: true, key: "submissionDate" },
    { title: i18n.t("dateOfDecisionLabel"), align: "start", sortable: true, key: "decisionDate" },
    { title: i18n.t("resultLabel"), align: "start", sortable: false, key: "result" }
]);

const sortFieldMappings = computed<Map<string, string>>(() => {
    const isSr = i18n.locale.value.startsWith("sr");
    return new Map([
        ["fundingCall", isSr ? "funding_call_name_sr_sortable" : "funding_call_name_other_sortable"],
        ["submissionDate", "submission_date"],
        ["decisionDate", "decision_date"]
    ]);
});

const defaultSortField = computed(() => sortFieldMappings.value.get("fundingCall") as string);

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
    FundingApplicationService.searchFundingApplications(params, props.projectId).then((response) => {
        fundingApplications.value = response.data.content;
        totalApplications.value = response.data.totalElements;
    });
};

const refreshTable = (event: any) => {
    const changed = size.value !== event.itemsPerPage
        || JSON.stringify(tableSortBy.value) !== JSON.stringify(event.sortBy);
    page.value = changed ? 0 : event.page - 1;
    size.value = event.itemsPerPage;
    tableSortBy.value = event.sortBy;
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
        fundingApplication.projectId = props.projectId;
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

const unlinkApplication = (applicationId: number) => {
    return FundingApplicationService.readFundingApplication(applicationId).then((response) => {
        const fundingApplication = response.data;
        fundingApplication.projectId = undefined;
        return FundingApplicationService.updateFundingApplication(applicationId, fundingApplication);
    });
};

const unlinkSelected = () => {
    const removedIds = selectedApplications.value.map((application) => application.databaseId);
    Promise.all(removedIds.map((applicationId) => unlinkApplication(applicationId)))
        .then(() => {
            fundingApplications.value = fundingApplications.value.filter((application) => !removedIds.includes(application.databaseId));
            totalApplications.value = Math.max(0, totalApplications.value - removedIds.length);
            selectedApplications.value = [];
            notify(i18n.t("updatedSuccessMessage"));
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
