<template>
    <table-toolbar
        :title="$t('fundingCallsLabel')"
        :selected-count="selectedFundingCalls.length"
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
        <template #actions>
            <v-btn
                v-if="canEdit"
                color="primary"
                prepend-icon="mdi-plus"
                @click="addDialog = true">
                {{ $t("addFundingCallLabel") }}
            </v-btn>
        </template>
    </table-toolbar>

    <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <v-data-table-server
            v-model="selectedFundingCalls"
            :items="fundingCalls"
            :headers="headers"
            item-value="row"
            :items-length="totalFundingCalls"
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
                            v-model="selectedFundingCalls"
                            :value="row.item"
                            class="table-checkbox"
                            hide-details
                        />
                    </td>
                    <td>
                        <localized-link :to="'funding-call/' + row.item.databaseId">
                            {{ $i18n.locale.startsWith("sr") ? row.item.nameSr : row.item.nameOther }}
                        </localized-link>
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
                <span class="text-h5">{{ $t("addFundingCallLabel") }}</span>
            </v-card-title>
            <v-card-text>
                <funding-call-autocomplete-search
                    :preset-funding-program-id="fundingProgramId"
                    :preset-keywords="presetKeywords"
                    :preset-date-from="presetDateFrom"
                    :preset-date-to="presetDateTo"
                    @selected="linkExistingFundingCall($event)"
                    @create="onFundingCallCreated"
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

    <toast v-model="snackbar" :message="snackbarMessage" />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import type { AxiosError } from "axios";
import FundingCallService from "@/services/project/FundingCallService";
import type { FundingCallIndex } from "@/models/FundingCallModel";
import type { ErrorResponse, MultilingualContent } from "@/models/Common";
import LocalizedLink from "@/components/localization/LocalizedLink.vue";
import FundingCallAutocompleteSearch from "@/components/project/FundingCallAutocompleteSearch.vue";
import Toast from "@/components/core/Toast.vue";
import TableToolbar from "@/components/core/TableToolbar.vue";
import SearchBarComponent from "@/components/core/SearchBarComponent.vue";
import { displayTextOrPlaceholder } from "@/utils/StringUtil";
import { localiseDate } from "@/utils/DateUtil";

const props = withDefaults(defineProps<{
    fundingProgramId: number;
    presetKeywords?: MultilingualContent[];
    presetDateFrom?: string;
    presetDateTo?: string;
    canEdit?: boolean;
}>(), {
    presetKeywords: () => [],
    presetDateFrom: "",
    presetDateTo: "",
    canEdit: false
});

const i18n = useI18n();

const fundingCalls = ref<FundingCallIndex[]>([]);
const totalFundingCalls = ref(0);
const selectedFundingCalls = ref<FundingCallIndex[]>([]);

const addDialog = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref("");

const page = ref(0);
const size = ref(10);
const sort = ref("");
const direction = ref("");

const headers = computed(() => [
    { title: i18n.t("nameLabel"), align: "start", sortable: true, key: "name" },
    { title: i18n.t("dateFromLabel"), align: "start", sortable: true, key: "dateFrom" },
    { title: i18n.t("dateToLabel"), align: "start", sortable: true, key: "dateTo" }
]);

const sortFieldMappings = computed<Map<string, string>>(() => {
    const isSr = i18n.locale.value.startsWith("sr");
    return new Map([
        ["name", isSr ? "name_sr_sortable" : "name_other_sortable"],
        ["dateFrom", "date_from"],
        ["dateTo", "date_to"]
    ]);
});

const defaultSortField = computed(() => sortFieldMappings.value.get("name") as string);

// An empty search box emits an empty string, so fall back to "*" -- otherwise the query
// would go out without a single tokens parameter.
const searchParams = ref("tokens=*");

const onSearch = (tokens: string) => {
    searchParams.value = tokens ? tokens : "tokens=*";
    page.value = 0;
    fetchFundingCalls();
};

const fetchFundingCalls = () => {
    const sortField = sort.value || defaultSortField.value;
    const sortDir = sort.value ? direction.value : "ASC";
    const params = `${searchParams.value}&page=${page.value}&size=${size.value}&sort=${sortField},${sortDir}`;
    FundingCallService.searchFundingCalls(params, props.fundingProgramId).then((response) => {
        fundingCalls.value = response.data.content;
        totalFundingCalls.value = response.data.totalElements;
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
    fetchFundingCalls();
};

const reindexDelayMs = 1200;

const refetchAfterReindex = () => {
    setTimeout(() => fetchFundingCalls(), reindexDelayMs);
};

const linkExistingFundingCall = (selected: { title: string; value: number; }) => {
    addDialog.value = false;
    FundingCallService.readFundingCall(selected.value).then((response) => {
        const fundingCall = response.data;
        fundingCall.fundingProgramId = props.fundingProgramId;
        return FundingCallService.updateFundingCall(selected.value, fundingCall);
    }).then(() => {
        notify(i18n.t("updatedSuccessMessage"));
        refetchAfterReindex();
    }).catch((error: AxiosError<ErrorResponse>) => {
        notifyError(error);
    });
};

const onFundingCallCreated = () => {
    addDialog.value = false;
    notify(i18n.t("savedMessage"));
    refetchAfterReindex();
};

const unlinkFundingCall = (fundingCallId: number) => {
    return FundingCallService.readFundingCall(fundingCallId).then((response) => {
        const fundingCall = response.data;
        fundingCall.fundingProgramId = undefined;
        return FundingCallService.updateFundingCall(fundingCallId, fundingCall);
    });
};

const unlinkSelected = () => {
    const removedIds = selectedFundingCalls.value.map((fundingCall) => fundingCall.databaseId);
    Promise.all(removedIds.map((fundingCallId) => unlinkFundingCall(fundingCallId)))
        .then(() => {
            fundingCalls.value = fundingCalls.value.filter((fundingCall) => !removedIds.includes(fundingCall.databaseId));
            totalFundingCalls.value = Math.max(0, totalFundingCalls.value - removedIds.length);
            selectedFundingCalls.value = [];
            notify(i18n.t("updatedSuccessMessage"));
        })
        .catch((error: AxiosError<ErrorResponse>) => {
            notifyError(error);
            fetchFundingCalls();
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
