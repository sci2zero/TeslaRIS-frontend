<template>
    <table-toolbar :selected-count="selectedFundingPrograms.length" :can-act="isAdmin">
        <template #top-left>
            <slot name="top-left" />
        </template>
        <template #action-items>
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
        </template>
        <template #actions>
            <slot name="actions" />
        </template>
    </table-toolbar>

    <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <v-data-table-server
            v-model="selectedFundingPrograms"
            :sort-by="tableOptions.sortBy"
            :items="fundingPrograms"
            :headers="headers"
            item-value="row"
            :items-length="totalFundingPrograms"
            :show-select="isAdmin"
            return-object
            :items-per-page-text="$t('itemsPerPageLabel')"
            :items-per-page-options="[5, 10, 25, 50]"
            :no-data-text="$t('noDataInTableMessage')"
            :page="tableOptions.page"
            @update:options="refreshTable">
            <template #item="row">
                <tr>
                    <td v-if="isAdmin">
                        <v-checkbox
                            v-model="selectedFundingPrograms"
                            :value="row.item"
                            class="table-checkbox"
                            hide-details
                        />
                    </td>
                    <td v-if="$i18n.locale.startsWith('sr')">
                        <localized-link :to="'funding-program/' + row.item.databaseId">
                            {{ row.item.nameSr }}
                        </localized-link>
                    </td>
                    <td v-else>
                        <localized-link :to="'funding-program/' + row.item.databaseId">
                            {{ row.item.nameOther }}
                        </localized-link>
                    </td>
                    <td v-if="$i18n.locale.startsWith('sr')">
                        <localized-link :to="'organisation-units/' + row.item.funderId">
                            {{ row.item.funderNameSr }}
                        </localized-link>
                    </td>
                    <td v-else>
                        <localized-link :to="'organisation-units/' + row.item.funderId">
                            {{ row.item.funderNameOther }}
                        </localized-link>
                    </td>
                    <td>
                        {{ displayTextOrPlaceholder(localiseDate(row.item.dateFrom)) }}
                    </td>
                    <td>
                        {{ displayTextOrPlaceholder(localiseDate(row.item.dateTo)) }}
                    </td>
                    <td class="text-right">
                        <span class="amount-cell">
                            <span class="amount-value">{{ formatAmount(row.item.totalAmount, locale) }}</span>
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
        :entity-names="selectedFundingPrograms.map(entity => $i18n.locale.startsWith('sr') ? entity.nameSr : entity.nameOther)"
        @continue="deleteSelection" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { FundingProgramIndex } from '@/models/FundingModel';
import FundingProgramService from '@/services/project/FundingProgramService';
import LocalizedLink from '../localization/LocalizedLink.vue';
import TableToolbar from '@/components/core/TableToolbar.vue';
import { displayTextOrPlaceholder } from '@/utils/StringUtil';
import { localiseDate } from '@/utils/DateUtil';
import { useUserRole } from '@/composables/useUserRole';
import { isEqual } from 'lodash';
import PersistentQuestionDialog from '../core/comparators/PersistentQuestionDialog.vue';
import {formatAmount} from "@/utils/MonetaryUtil";


defineProps<{
    fundingPrograms: FundingProgramIndex[];
    totalFundingPrograms: number;
}>();

const emit = defineEmits<{
    (e: "switchPage", page: number, size: number, sort: string | undefined, direction: string | undefined): void;
}>();

const selectedFundingPrograms = ref<FundingProgramIndex[]>([]);

const i18n = useI18n();

const { locale } = useI18n();

const notifications = ref<Map<string, string>>(new Map());

const nameLabel = computed(() => i18n.t("nameLabel"));
const funderNameLabel = computed(() => i18n.t("funderLabel"));
const dateFromLabel = computed(() => i18n.t("dateFromLabel"));
const dateToLabel = computed(() => i18n.t("dateToLabel"));
const totalAmountLabel = computed(() => i18n.t("totalAmountLabel"));

const { isAdmin } = useUserRole();

const nameColumn = computed(() => i18n.t("nameColumn"));
const funderNameColumn = computed(() => i18n.t("funderNameColumn"));

const tableOptions = ref<any>({
  initialCustomConfiguration: true,
  page: 1,
  itemsPerPage: 10,
  sortBy:[{key: nameColumn, order: "asc"}]});

const headers = ref<any>([
    { title: nameLabel, align: "start", sortable: true, key: nameColumn},
    { title: funderNameLabel, align: "start", sortable: true, key: funderNameColumn},
    { title: dateFromLabel, align: "start", sortable: true, key: "dateFrom"},
    { title: dateToLabel, align: "start", sortable: true, key: "dateTo"},
    { title: totalAmountLabel, align: "start", sortable: true, key: "totalAmount"}
]);

const headersSortableMappings: Map<string, string> = new Map([
    ["nameSr", "name_sr_sortable"],
    ["nameOther", "name_other_sortable"],
    ["funderNameSr", "funder_name_sr_sortable"],
    ["funderNameOther", "funder_name_other_sortable"],
    ["dateFrom", "date_from"],
    ["dateTo", "date_to"],
    ["totalAmount", "total_amount"]
]);

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
    Promise.all(selectedFundingPrograms.value.map((fundingProgram: FundingProgramIndex) => {
        return FundingProgramService.deleteFundingProgram(fundingProgram.databaseId)
            .then(() => {
                if (i18n.locale.value.startsWith("sr")) {
                    addNotification(i18n.t("deleteSuccessNotification", { name: fundingProgram.nameSr }));
                } else {
                    addNotification(i18n.t("deleteSuccessNotification", { name: fundingProgram.nameOther }));
                }
            })
            .catch(() => {
                if (i18n.locale.value.startsWith("sr")) {
                    addNotification(i18n.t("deleteFailedNotification", { name: fundingProgram.nameSr }));
                } else {
                    addNotification(i18n.t("deleteFailedNotification", { name: fundingProgram.nameOther }));
                }
                return fundingProgram;
            });
    })).then((failedDeletions) => {
        selectedFundingPrograms.value = selectedFundingPrograms.value.filter((fundingProgram) => failedDeletions.includes(fundingProgram));
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

</style>
