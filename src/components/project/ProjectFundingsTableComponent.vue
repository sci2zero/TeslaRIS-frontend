<template>
    <table-toolbar
        :title="$t('fundingsLabel')"
        :selected-count="selectedFundings.length"
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
                {{ $t("addFundingLabel") }}
            </v-btn>
        </template>
    </table-toolbar>

    <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <v-data-table-server
            v-model="selectedFundings"
            :items="fundings"
            :headers="headers"
            item-value="row"
            :items-length="totalFundings"
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
                            v-model="selectedFundings"
                            :value="row.item"
                            class="table-checkbox"
                            hide-details
                        />
                    </td>
                    <td>
                        <localized-link :to="'funding/' + row.item.databaseId">
                            {{ $i18n.locale.startsWith("sr") ? row.item.nameSr : row.item.nameOther }}
                        </localized-link>
                    </td>
                    <td>
                        {{ displayTextOrPlaceholder($i18n.locale.startsWith("sr") ? (row.item.funderNameSr || row.item.funderNameOther) : (row.item.funderNameOther || row.item.funderNameSr)) }}
                    </td>
                    <td>
                        {{ displayTextOrPlaceholder(localiseDate(row.item.dateFrom)) }}
                    </td>
                    <td>
                        {{ displayTextOrPlaceholder(localiseDate(row.item.dateTo)) }}
                    </td>
                </tr>
            </template>
        </v-data-table-server>
    </div>

    <v-dialog v-model="addDialog" persistent max-width="900">
        <v-card>
            <v-card-title>
                <span class="text-h5">{{ $t("addFundingLabel") }}</span>
            </v-card-title>
            <v-card-text>
                <funding-autocomplete-search
                    :preset-project="project"
                    @selected="linkExistingFunding($event)"
                    @create="onFundingCreated"
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
        :entity-names="selectedFundings.map(funding => fundingTitle(funding))"
        @continue="deleteSelected" />

    <toast v-model="snackbar" :message="snackbarMessage" />
</template>

<script setup lang="ts">
import { computed, ref, type PropType } from "vue";
import { useI18n } from "vue-i18n";
import type { AxiosError } from "axios";
import FundingService from "@/services/project/FundingService";
import type { FundingIndex } from "@/models/FundingModel";
import type { Project } from "@/models/ProjectModel";
import type { ErrorResponse } from "@/models/Common";
import LocalizedLink from "@/components/localization/LocalizedLink.vue";
import FundingAutocompleteSearch from "@/components/project/FundingAutocompleteSearch.vue";
import PersistentQuestionDialog from "@/components/core/comparators/PersistentQuestionDialog.vue";
import Toast from "@/components/core/Toast.vue";
import TableToolbar from "@/components/core/TableToolbar.vue";
import SearchBarComponent from "@/components/core/SearchBarComponent.vue";
import { displayTextOrPlaceholder } from "@/utils/StringUtil";
import { localiseDate } from "@/utils/DateUtil";

const props = defineProps({
    project: {
        type: Object as PropType<Project>,
        required: true
    },
    canEdit: {
        type: Boolean,
        default: false
    }
});

const i18n = useI18n();

const fundings = ref<FundingIndex[]>([]);
const totalFundings = ref(0);
const selectedFundings = ref<FundingIndex[]>([]);

const addDialog = ref(false);
const displayPersistentDialog = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref("");

const page = ref(0);
const size = ref(10);
const sort = ref("");
const direction = ref("");

const headers = computed(() => [
    { title: i18n.t("nameLabel"), align: "start", sortable: true, key: "name" },
    { title: i18n.t("funderLabel"), align: "start", sortable: true, key: "funder" },
    { title: i18n.t("dateFromLabel"), align: "start", sortable: true, key: "dateFrom" },
    { title: i18n.t("dateToLabel"), align: "start", sortable: true, key: "dateTo" }
]);

const sortFieldMappings = computed<Map<string, string>>(() => {
    const isSr = i18n.locale.value.startsWith("sr");
    return new Map([
        ["name", isSr ? "name_sr_sortable" : "name_other_sortable"],
        ["funder", isSr ? "funder_name_sr_sortable" : "funder_name_other_sortable"],
        ["dateFrom", "date_from"],
        ["dateTo", "date_to"]
    ]);
});

const defaultSortField = computed(() => sortFieldMappings.value.get("name") as string);

const fundingTitle = (funding: FundingIndex) => {
    const name = i18n.locale.value.startsWith("sr") ? funding.nameSr : funding.nameOther;
    return name || `#${funding.databaseId}`;
};

// An empty search box emits an empty string, so fall back to "*" -- otherwise the query
// would go out without a single tokens parameter.
const searchParams = ref("tokens=*");

const onSearch = (tokens: string) => {
    searchParams.value = tokens ? tokens : "tokens=*";
    page.value = 0;
    fetchFundings();
};

const fetchFundings = () => {
    const sortField = sort.value || defaultSortField.value;
    const sortDir = sort.value ? direction.value : "ASC";
    const params = `${searchParams.value}&page=${page.value}&size=${size.value}&sort=${sortField},${sortDir}`;
    FundingService.searchFunding(params, null, props.project.id).then((response) => {
        fundings.value = response.data.content;
        totalFundings.value = response.data.totalElements;
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
    fetchFundings();
};

const reindexDelayMs = 1200;

const refetchAfterReindex = () => {
    setTimeout(() => fetchFundings(), reindexDelayMs);
};

const linkExistingFunding = (selected: { title: string; value: number; }) => {
    addDialog.value = false;
    FundingService.readFunding(selected.value).then((response) => {
        const funding = response.data;
        funding.projectId = props.project.id as number;
        return FundingService.updateFunding(selected.value, funding);
    }).then(() => {
        notify(i18n.t("updatedSuccessMessage"));
        refetchAfterReindex();
    }).catch((error: AxiosError<ErrorResponse>) => {
        notifyError(error);
    });
};

const onFundingCreated = () => {
    addDialog.value = false;
    notify(i18n.t("savedMessage"));
    refetchAfterReindex();
};

const deleteSelected = () => {
    const removedIds = selectedFundings.value.map((funding) => funding.databaseId);
    const removedNames = selectedFundings.value.map((funding) => fundingTitle(funding)).join(", ");
    Promise.all(removedIds.map((fundingId) => FundingService.deleteFunding(fundingId)))
        .then(() => {
            fundings.value = fundings.value.filter((funding) => !removedIds.includes(funding.databaseId));
            totalFundings.value = Math.max(0, totalFundings.value - removedIds.length);
            selectedFundings.value = [];
            notify(i18n.t("deleteSuccessNotification", { name: removedNames }));
        })
        .catch((error: AxiosError<ErrorResponse>) => {
            notifyError(error);
            fetchFundings();
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
