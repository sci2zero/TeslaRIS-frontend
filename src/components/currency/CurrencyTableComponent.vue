<template>
    <v-row class="align-center">
        <v-col cols="auto">
            <v-btn
                density="compact" class="bottom-spacer" :disabled="selectedCurrencies.length === 0"
                @click="startDeletionProcess">
                {{ $t("deleteLabel") }}
            </v-btn>
        </v-col>

        <v-col cols="auto">
            <generic-crud-modal
                :form-component="CurrencyForm"
                :form-props="{ presetCurrency: undefined }"
                entity-name="Currency"
                @create="createNewCurrency"
            />
        </v-col>
    </v-row>

    <v-data-table-server
        v-model="selectedCurrencies"
        :sort-by="tableOptions.sortBy"
        :items="currencies"
        :headers="headers"
        :items-length="totalCurrencies"
        :items-per-page-text="$t('itemsPerPageLabel')"
        :items-per-page-options="[5, 25, 50]"
        :items-per-page="25"
        show-select
        return-object
        :no-data-text="$t('noDataInTableMessage')"
        :page="tableOptions.page"
        @update:options="refreshTable">
        <template #item="row">
            <tr>
                <td>
                    <v-checkbox
                        v-model="selectedCurrencies"
                        :value="row.item"
                        class="table-checkbox"
                        hide-details
                    />
                </td>
                <td>{{ returnCurrentLocaleContent(row.item.currencyName) }}</td>
                <td>{{ row.item.code }}</td>
                <td>{{ row.item.symbol }}</td>
                <td>
                    <generic-crud-modal
                        class="mt-2"
                        :form-component="CurrencyForm"
                        :form-props="{ presetCurrency: row.item }"
                        entity-name="Currency"
                        is-update
                        @update="updateCurrency(row.item.currencyId as number, $event)"
                    />
                </td>
            </tr>
        </template>
    </v-data-table-server>
    
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
        :entity-names="selectedCurrencies.map(entity => returnCurrentLocaleContent(entity.currencyName) as string)"
        @continue="deleteSelection" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { displayTextOrPlaceholder } from '@/utils/StringUtil';
import { getTitleFromValueAutoLocale } from '@/i18n/userType';
import type { Currency } from '@/models/Common';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import CurrencyService from '@/services/CurrencyService';
import GenericCrudModal from '../core/GenericCrudModal.vue';
import CurrencyForm from './CurrencyForm.vue';
import { isEqual } from 'lodash';
import PersistentQuestionDialog from '../core/comparators/PersistentQuestionDialog.vue';


export default defineComponent({
    name: "CurrencyTableComponent",
    components: { GenericCrudModal, PersistentQuestionDialog },
    props: {
        currencies: {
            type: Array<Currency>,
            required: true
        }, 
        totalCurrencies: {
            type: Number,
            required: true
        }},
    emits: ["switchPage"],
    setup(_, {emit}) {
        const selectedCurrencies = ref<Currency[]>([]);
        const notifications = ref<Map<string, string>>(new Map());

        const i18n = useI18n();

        const snackbar = ref(false);
        const snackbarText = ref("");
        const timeout = 5000;

        const nameLabel = computed(() => i18n.t("nameLabel"));
        const codeLabel = computed(() => i18n.t("currencyCodeLabel"));
        const symbolLabel = computed(() => i18n.t("currencySymbolLabel"));
        const actionLabel = computed(() => i18n.t("actionLabel"));

        const tableOptions = ref<any>({initialCustomConfiguration: true, page: 1, itemsPerPage: 25, sortBy:[{key: "name.content", order: "asc"}]});

        const headers = ref<any>([
          { title: nameLabel, align: "start", sortable: true, key: "name.content"},
          { title: codeLabel, align: "start", sortable: true, key: "code"},
          { title: symbolLabel, align: "start", sortable: true, key: "symbol"},
          { title: actionLabel},
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
                sortField = event.sortBy[0].key;
                sortDir = event.sortBy[0].order.toUpperCase();
            }
            emit("switchPage", event.page - 1, event.itemsPerPage, sortField, sortDir);
        };

        const deleteSelection = () => {
            Promise.all(selectedCurrencies.value.map((currency: Currency) => {
                return CurrencyService.deleteCurrency(currency.currencyId as number)
                    .then(() => {
                        addNotification(i18n.t("deleteSuccessNotification", { name: returnCurrentLocaleContent(currency.currencyName) }));
                    })
                    .catch(() => {
                        addNotification(i18n.t("deleteFailedNotification", { name: returnCurrentLocaleContent(currency.currencyName) }));
                        return currency;
                    });
            })).then((failedDeletions) => {
                selectedCurrencies.value = selectedCurrencies.value.filter((currency) => failedDeletions.includes(currency));
                CurrencyService.invalidateCaches();
                refreshTable(tableOptions.value);
            });
        };

        const addNotification = (message: string) => {
            const notificationId = self.crypto.randomUUID();

            notifications.value.set(notificationId, message);
            setTimeout(() => removeNotification(notificationId), 2000);
        };

        const removeNotification = (notificationId: string) => {
            notifications.value.delete(notificationId);
        };

        const createNewCurrency = (currency: Currency) => {
            CurrencyService.createCurrency(currency).then(() => {
                CurrencyService.invalidateCaches();
                if (tableOptions.value.sortBy && tableOptions.value.sortBy.length > 0) {
                    emit("switchPage", tableOptions.value.page - 1, tableOptions.value.itemsPerPage, tableOptions.value.sortBy[0].key, tableOptions.value.sortBy[0].order);
                } else {
                    emit("switchPage", tableOptions.value.page - 1, tableOptions.value.itemsPerPage, "", "");
                }
                
            });
        };

        const updateCurrency = (currencyId: number, currency: Currency) => {
            CurrencyService.updateCurrency(currencyId, currency).then(() => {
                addNotification(i18n.t("updatedSuccessMessage"));
                CurrencyService.invalidateCaches();
                if (tableOptions.value.sortBy && tableOptions.value.sortBy.length > 0) {
                    emit("switchPage", tableOptions.value.page - 1, tableOptions.value.itemsPerPage, tableOptions.value.sortBy[0].key, tableOptions.value.sortBy[0].order);
                } else {
                    emit("switchPage", tableOptions.value.page - 1, tableOptions.value.itemsPerPage, "", "");
                }
            });
        };

        const setSortAndPageOption = (sortBy: {key: string,  order: string}[], page: number) => {
            if (
                (
                    isEqual([{key: "name.content", order: "asc"}], tableOptions.value.sortBy) ||
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

        return {
            headers, snackbar, snackbarText, timeout, refreshTable,
            tableOptions, deleteSelection, displayTextOrPlaceholder,
            getTitleFromValueAutoLocale, returnCurrentLocaleContent,
            selectedCurrencies, notifications, createNewCurrency,
            updateCurrency, setSortAndPageOption, CurrencyForm,
            displayPersistentDialog, startDeletionProcess
        };
    }
});
</script>
