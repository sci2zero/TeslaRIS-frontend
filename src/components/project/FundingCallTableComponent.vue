<template>
    <div class="flex justify-between mb-2">
        <div class="flex items-center gap-2">
            <div v-if="isAdmin && selectedFundingCalls.length > 0" class="action-menu-container">
                <v-menu offset-y>
                    <template #activator="{ props }">
                        <v-btn
                            v-bind="props"
                            color="white"
                            variant="elevated"
                            height="48"
                            prepend-icon="mdi-dots-vertical"
                            class="action-menu-trigger"
                        >
                            {{ $t("actions") }} ({{ selectedFundingCalls.length }})
                        </v-btn>
                    </template>

                    <v-list class="action-menu-list" density="compact">
                        <v-list-item
                            class="action-menu-item"
                            @click="startDeletionProcess"
                        >
                            <template #prepend>
                                <v-icon color="error" size="18">
                                    mdi-delete
                                </v-icon>
                            </template>
                            <v-list-item-title class="text-body-2">
                                {{ $t("deleteLabel") }}
                            </v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </div>
            <div :class="[selectedFundingCalls.length > 0 ? 'w-[19.25rem]' : 'w-[28rem]']">
                <slot name="top-left" />
            </div>
        </div>
        <div class="flex items-center gap-2">
            <slot name="actions" />
        </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <v-data-table-server
            v-model="selectedFundingCalls"
            :sort-by="tableOptions.sortBy"
            :items="fundingCalls"
            :headers="headers"
            item-value="row"
            :items-length="totalFundingCalls"
            :show-select="isAdmin"
            return-object
            :items-per-page-text="$t('itemsPerPageLabel')"
            :items-per-page-options="[5, 10, 25, 50]"
            :no-data-text="$t('noDataInTableMessage')"
            :page="tableOptions.page"
            @update:options="refreshTable">
            <template #[`header.types`]="{ column }">
                <div class="group flex items-center gap-2">
                    <span>{{ column.title }}</span>
                    <v-menu v-if="$slots['type-filter-menu']" :close-on-content-click="false">
                        <template #activator="{ props }">
                            <v-icon
                                v-bind="props"
                                :title="hasActiveTypeFilters ? $t('filterActiveLabel') : $t('filterLabel')"
                                :class="hasActiveTypeFilters ? 'ml-1 text-primary cursor-pointer hover:text-primary-darken-1' : 'ml-1 text-gray-400 cursor-pointer hover:text-gray-600'"
                                icon="mdi-filter"
                            ></v-icon>
                        </template>
                        <div class="p-3 bg-white rounded-lg shadow-lg">
                            <slot name="type-filter-menu" :column="column"></slot>
                        </div>
                    </v-menu>
                </div>
            </template>
            <template #item="row">
                <tr>
                    <td v-if="isAdmin">
                        <v-checkbox
                            v-model="selectedFundingCalls"
                            :value="row.item"
                            class="table-checkbox"
                            hide-details
                        />
                    </td>
                    <td v-if="$i18n.locale.startsWith('sr')">
                        <localized-link :to="'funding-call/' + row.item.databaseId">
                            {{ row.item.nameSr }}
                        </localized-link>
                    </td>
                    <td v-else>
                        <localized-link :to="'funding-call/' + row.item.databaseId">
                            {{ row.item.nameOther }}
                        </localized-link>
                    </td>
                    <td v-if="$i18n.locale.startsWith('sr')">
                        <localized-link v-if="row.item.programId" :to="'funding-program/' + row.item.programId">
                            {{ row.item.programNameSr }}
                        </localized-link>
                        <span v-else>{{ displayTextOrPlaceholder(row.item.programNameSr) }}</span>
                    </td>
                    <td v-else>
                        <localized-link v-if="row.item.programId" :to="'funding-program/' + row.item.programId">
                            {{ row.item.programNameOther }}
                        </localized-link>
                        <span v-else>{{ displayTextOrPlaceholder(row.item.programNameOther) }}</span>
                    </td>
                    <td>
                        <div v-if="row.item.types?.length" class="flex flex-wrap gap-1">
                            <v-chip
                                v-for="fundingType in row.item.types"
                                :key="fundingType"
                                size="small"
                                color="primary"
                                variant="flat"
                                :prepend-icon="getFundingTypeIcon(fundingType)"
                            >
                                {{ getFundingTypeTitleFromValueAutoLocale(fundingType) }}
                            </v-chip>
                        </div>
                        <span v-else>{{ displayTextOrPlaceholder("") }}</span>
                    </td>
                    <td>
                        {{ displayTextOrPlaceholder(localiseDate(row.item.dateFrom)) }}
                    </td>
                    <td>
                        {{ displayTextOrPlaceholder(localiseDate(row.item.dateTo)) }}
                    </td>
                    <td class="text-right">
                        <span class="amount-cell">
                            <span class="amount-value">{{ formatAmount(row.item.amount, locale) }}</span>
                            <span class="amount-currency">{{ row.item.currencySymbol }}</span>
                        </span>
                    </td>
                </tr>
            </template>
        </v-data-table-server>
    </div>
    <div class="notificationContainer">
        <v-slide-y-transition group>
            <v-alert
                v-for="notification in notifications"
                :key="notification[0]"
                theme="dark"
            >
                {{ notification[1] }}
            </v-alert>
        </v-slide-y-transition>
    </div>

    <persistent-question-dialog
        v-model="displayPersistentDialog"
        :title="$t('areYouSureLabel')"
        :message="$t('confirmDeletionMessage')"
        :entity-names="selectedFundingCalls.map(entity => $i18n.locale.startsWith('sr') ? entity.nameSr : entity.nameOther)"
        @continue="deleteSelection" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { FundingCallIndex } from '@/models/FundingCallModel';
import FundingCallService from '@/services/project/FundingCallService';
import LocalizedLink from '../localization/LocalizedLink.vue';
import { displayTextOrPlaceholder } from '@/utils/StringUtil';
import { localiseDate } from '@/utils/DateUtil';
import { useUserRole } from '@/composables/useUserRole';
import { isEqual } from 'lodash';
import PersistentQuestionDialog from '../core/comparators/PersistentQuestionDialog.vue';
import { formatAmount } from '@/utils/MonetaryUtil';
import { getFundingTypeTitleFromValueAutoLocale } from '@/i18n/fundingType';
import { FundingType } from '@/models/FundingModel';


withDefaults(defineProps<{
    fundingCalls: FundingCallIndex[];
    totalFundingCalls: number;
    hasActiveTypeFilters?: boolean;
}>(), {
    hasActiveTypeFilters: false
});

const emit = defineEmits<{
    (e: "switchPage", page: number, size: number, sort: string | undefined, direction: string | undefined): void;
}>();

const selectedFundingCalls = ref<FundingCallIndex[]>([]);

const i18n = useI18n();

const { locale } = useI18n();

const notifications = ref<Map<string, string>>(new Map());

const nameLabel = computed(() => i18n.t("nameLabel"));
const programNameLabel = computed(() => i18n.t("fundingProgramLabel"));
const dateFromLabel = computed(() => i18n.t("dateFromLabel"));
const dateToLabel = computed(() => i18n.t("dateToLabel"));
const totalAmountLabel = computed(() => i18n.t("totalAmountLabel"));
const fundingTypesLabel = computed(() => i18n.t("fundingTypesLabel"));

const { isAdmin } = useUserRole();

const nameColumn = computed(() => i18n.t("nameColumn"));
const programNameColumn = computed(() => i18n.t("programNameColumn"));

const tableOptions = ref<any>({initialCustomConfiguration: true, page: 1, itemsPerPage: 10, sortBy:[{key: nameColumn, order: "asc"}]});

const headers = ref<any>([
    { title: nameLabel, align: "start", sortable: true, key: nameColumn},
    { title: programNameLabel, align: "start", sortable: true, key: programNameColumn},
    { title: fundingTypesLabel, align: "start", sortable: false, key: "types"},
    { title: dateFromLabel, align: "start", sortable: true, key: "dateFrom"},
    { title: dateToLabel, align: "start", sortable: true, key: "dateTo"},
    { title: totalAmountLabel, align: "start", sortable: true, key: "amount"}
]);

const headersSortableMappings: Map<string, string> = new Map([
    ["nameSr", "name_sr_sortable"],
    ["nameOther", "name_other_sortable"],
    ["programNameSr", "program_name_sr_sortable"],
    ["programNameOther", "program_name_other_sortable"],
    ["dateFrom", "date_from"],
    ["dateTo", "date_to"],
    ["amount", "amount"]
]);

const getFundingTypeIcon = (type: FundingType) => {
    switch (type) {
        case FundingType.GRANT:
            return "mdi-cash-multiple";
        case FundingType.CALL:
            return "mdi-bullhorn";
        default:
            return "mdi-file-document";
    }
};

const refreshTable = (event: any) => {
    if (tableOptions.value.initialCustomConfiguration) {
        tableOptions.value.initialCustomConfiguration = false;
        event = tableOptions.value;
    }
    tableOptions.value = event;
    let sortField: string | undefined = "";
    let sortDir: string | undefined = "";
    if (event.sortBy.length > 0) {
        sortField = headersSortableMappings.get(event.sortBy[0].key);
        sortDir = event.sortBy[0].order.toUpperCase();
    }
    emit("switchPage", event.page - 1, event.itemsPerPage, sortField, sortDir);
};

const addNotification = (message: string) => {
    const notificationId = self.crypto.randomUUID();

    notifications.value.set(notificationId, message);
    setTimeout(() => removeNotification(notificationId), 2000);
};

const removeNotification = (notificationId: string) => {
    notifications.value.delete(notificationId);
};

const deleteSelection = () => {
    Promise.all(selectedFundingCalls.value.map((fundingCall: FundingCallIndex) => {
        return FundingCallService.deleteFundingCall(fundingCall.databaseId)
            .then(() => {
                if (i18n.locale.value.startsWith("sr")) {
                    addNotification(i18n.t("deleteSuccessNotification", { name: fundingCall.nameSr }));
                } else {
                    addNotification(i18n.t("deleteSuccessNotification", { name: fundingCall.nameOther }));
                }
            })
            .catch(() => {
                if (i18n.locale.value.startsWith("sr")) {
                    addNotification(i18n.t("deleteFailedNotification", { name: fundingCall.nameSr }));
                } else {
                    addNotification(i18n.t("deleteFailedNotification", { name: fundingCall.nameOther }));
                }
                return fundingCall;
            });
    })).then((failedDeletions) => {
        selectedFundingCalls.value = selectedFundingCalls.value.filter((fundingCall) => failedDeletions.includes(fundingCall));
        refreshTable(tableOptions.value);
    });
};

const setSortAndPageOption = (sortBy: {key: string, order: string}[], page: number) => {
    if (
        (
            isEqual([{key: nameColumn.value, order: "asc"}], tableOptions.value.sortBy) ||
            tableOptions.value.sortBy.length === 0
        ) &&
        page == tableOptions.value.page
    ) {
        tableOptions.value.sortBy.splice(0);
        return;
    }

    tableOptions.value.initialCustomConfiguration = true;
    if (sortBy.length === 0) {
        tableOptions.value.sortBy.splice(0);
    } else {
        tableOptions.value.sortBy = sortBy;
    }
    tableOptions.value.page = page;
};

const displayPersistentDialog = ref(false);
const startDeletionProcess = () => {
    displayPersistentDialog.value = true;
};

defineExpose({
    setSortAndPageOption
});
</script>

<style scoped>
.amount-cell {
    display: flex;
    justify-content: flex-end;
    align-items: baseline;
    gap: 0.35rem;
}

.amount-value {
    text-align: right;
}

.amount-currency {
    flex: none;
    min-width: 3ch;
    text-align: left;
}

.action-menu-container {
    display: flex;
    justify-content: flex-start;
}

.action-menu-trigger {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);
}

.action-menu-list {
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    border: 1px solid rgba(0, 0, 0, 0.08);
}

.action-menu-item {
    border-radius: 6px;
    margin: 2px 4px;
    transition: all 0.2s ease;
}

.action-menu-item:hover {
    background-color: rgba(25, 118, 210, 0.08);
}
</style>
