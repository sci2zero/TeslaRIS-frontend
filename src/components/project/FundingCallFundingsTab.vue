<template>
    <v-row class="mt-5 align-center">
        <v-col cols="auto">
            <h2>{{ $t("fundingsLabel") }}</h2>
        </v-col>
        <v-spacer />
        <v-col v-if="canEdit" cols="auto">
            <v-btn
                density="comfortable"
                color="primary"
                prepend-icon="mdi-plus"
                @click="addDialog = true">
                {{ $t("addFundingLabel") }}
            </v-btn>
            <v-btn
                density="comfortable"
                class="ml-2"
                color="error"
                variant="outlined"
                prepend-icon="mdi-link-off"
                :disabled="selectedFundings.length === 0"
                @click="unlinkSelected">
                {{ $t("removeLabel") }}
            </v-btn>
        </v-col>
    </v-row>

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
                    {{ displayTextOrPlaceholder($i18n.locale.startsWith("sr") ? row.item.funderNameSr : row.item.funderNameOther) }}
                </td>
                <td>
                    {{ displayTextOrPlaceholder(row.item.dateFrom) }}
                </td>
                <td>
                    {{ displayTextOrPlaceholder(row.item.dateTo) }}
                </td>
            </tr>
        </template>
    </v-data-table-server>

    <v-dialog v-model="addDialog" persistent max-width="900">
        <v-card>
            <v-card-title>
                <span class="text-h5">{{ $t("addFundingLabel") }}</span>
            </v-card-title>
            <v-card-text>
                <funding-autocomplete-search
                    :preset-funding-call-id="fundingCallId"
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

    <toast v-model="snackbar" :message="snackbarMessage" />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import FundingService from "@/services/project/FundingService";
import type { FundingIndex } from "@/models/FundingModel";
import LocalizedLink from "@/components/localization/LocalizedLink.vue";
import FundingAutocompleteSearch from "@/components/project/FundingAutocompleteSearch.vue";
import Toast from "@/components/core/Toast.vue";
import { displayTextOrPlaceholder } from "@/utils/StringUtil";

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

const fundings = ref<FundingIndex[]>([]);
const totalFundings = ref(0);
const selectedFundings = ref<FundingIndex[]>([]);

const addDialog = ref(false);
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

// A default, deterministic sort keeps the result window stable across refreshes;
// without it Elasticsearch may return the same set in a different order each time.
const defaultSortField = computed(() => sortFieldMappings.value.get("name") as string);

const fetchFundings = () => {
    const sortField = sort.value || defaultSortField.value;
    const sortDir = sort.value ? direction.value : "ASC";
    const params = `tokens=*&page=${page.value}&size=${size.value}&sort=${sortField},${sortDir}`;
    FundingService.searchFunding(params, props.fundingCallId).then((response) => {
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

// The list is served from Elasticsearch, which reindexes asynchronously after a
// DB update, so an immediate refetch would still return the stale rows. For adds
// we refetch after a short delay; for removes we update the list optimistically.
const reindexDelayMs = 1200;

const refetchAfterReindex = () => {
    setTimeout(() => fetchFundings(), reindexDelayMs);
};

const linkExistingFunding = (selected: { title: string; value: number; }) => {
    addDialog.value = false;
    FundingService.readFunding(selected.value).then((response) => {
        const funding = response.data;
        funding.fundingCallId = props.fundingCallId;
        return FundingService.updateFunding(selected.value, funding);
    }).then(() => {
        notify(i18n.t("updatedSuccessMessage"));
        refetchAfterReindex();
    }).catch(() => {
        notify(i18n.t("genericErrorMessage"));
    });
};

const onFundingCreated = () => {
    addDialog.value = false;
    notify(i18n.t("savedMessage"));
    refetchAfterReindex();
};

const unlinkFunding = (fundingId: number) => {
    return FundingService.readFunding(fundingId).then((response) => {
        const funding = response.data;
        funding.fundingCallId = undefined;
        return FundingService.updateFunding(fundingId, funding);
    });
};

const unlinkSelected = () => {
    const removedIds = selectedFundings.value.map((funding) => funding.databaseId);
    Promise.all(removedIds.map((fundingId) => unlinkFunding(fundingId)))
        .then(() => {
            fundings.value = fundings.value.filter((funding) => !removedIds.includes(funding.databaseId));
            totalFundings.value = Math.max(0, totalFundings.value - removedIds.length);
            selectedFundings.value = [];
            notify(i18n.t("updatedSuccessMessage"));
        })
        .catch(() => {
            notify(i18n.t("genericErrorMessage"));
        });
};

const notify = (message: string) => {
    snackbarMessage.value = message;
    snackbar.value = true;
};
</script>
