<template>
    <v-row class="align-center">
        <v-col cols="auto">
            <v-btn
                density="compact" class="bottom-spacer" :disabled="selectedCountries.length === 0"
                @click="deleteSelection">
                {{ $t("deleteLabel") }}
            </v-btn>
        </v-col>

        <v-col cols="auto">
            <generic-crud-modal
                :form-component="CountryForm"
                :form-props="{ presetCountry: undefined }"
                entity-name="Country"
                @create="createNewCountry"
            />
        </v-col>
    </v-row>

    <v-data-table-server
        v-model="selectedCountries"
        :sort-by="tableOptions.sortBy"
        :items="countries"
        :headers="headers"
        :items-length="totalCountrys"
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
                        v-model="selectedCountries"
                        :value="row.item"
                        class="table-checkbox"
                        hide-details
                    />
                </td>
                <td>{{ returnCurrentLocaleContent(row.item.name) }}</td>
                <td>{{ row.item.code }}</td>
                <td>
                    <generic-crud-modal
                        class="mt-2"
                        :form-component="CountryForm"
                        :form-props="{ presetCountry: row.item }"
                        entity-name="Country"
                        is-update
                        @update="updateCountry(row.item.id as number, $event)"
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
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { displayTextOrPlaceholder } from '@/utils/StringUtil';
import { getTitleFromValueAutoLocale } from '@/i18n/userType';
import type { Country } from '@/models/Common';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import CountryService from '@/services/CountryService';
import GenericCrudModal from '../core/GenericCrudModal.vue';
import CountryForm from './CountryForm.vue';


export default defineComponent({
    name: "CountryTableComponent",
    components: { GenericCrudModal },
    props: {
        countries: {
            type: Array<Country>,
            required: true
        }, 
        totalCountrys: {
            type: Number,
            required: true
        }},
    emits: ["switchPage"],
    setup(_, {emit}) {
        const selectedCountries = ref<Country[]>([]);
        const notifications = ref<Map<string, string>>(new Map());

        const i18n = useI18n();

        const snackbar = ref(false);
        const snackbarText = ref("");
        const timeout = 5000;

        const nameLabel = computed(() => i18n.t("nameLabel"));
        const codeLabel = computed(() => i18n.t("countryCodeLabel"));
        const actionLabel = computed(() => i18n.t("actionLabel"));

        const tableOptions = ref<any>({initialCustomConfiguration: true, page: 1, itemsPerPage: 25, sortBy:[{key: "name.content", order: "asc"}]});

        const headers = ref<any>([
          { title: nameLabel, align: "start", sortable: true, key: "name.content"},
          { title: codeLabel, align: "start", sortable: true, key: "code"},
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
            Promise.all(selectedCountries.value.map((country: Country) => {
                return CountryService.deleteCountry(country.id as number)
                    .then(() => {
                        addNotification(i18n.t("deleteSuccessNotification", { name: returnCurrentLocaleContent(country.name) }));
                    })
                    .catch(() => {
                        addNotification(i18n.t("deleteFailedNotification", { name: returnCurrentLocaleContent(country.name) }));
                        return country;
                    });
            })).then((failedDeletions) => {
                selectedCountries.value = selectedCountries.value.filter((country) => failedDeletions.includes(country));
                CountryService.invalidateCaches();
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

        const createNewCountry = (country: Country) => {
            CountryService.createCountry(country).then(() => {
                CountryService.invalidateCaches();
                if (tableOptions.value.sortBy && tableOptions.value.sortBy.length > 0) {
                    emit("switchPage", tableOptions.value.page - 1, tableOptions.value.itemsPerPage, tableOptions.value.sortBy[0].key, tableOptions.value.sortBy[0].order);
                } else {
                    emit("switchPage", tableOptions.value.page - 1, tableOptions.value.itemsPerPage, "", "");
                }
                
            });
        };

        const updateCountry = (countryId: number, country: Country) => {
            CountryService.updateCountry(countryId, country).then(() => {
                addNotification(i18n.t("updatedSuccessMessage"));
                CountryService.invalidateCaches();
                if (tableOptions.value.sortBy && tableOptions.value.sortBy.length > 0) {
                    emit("switchPage", tableOptions.value.page - 1, tableOptions.value.itemsPerPage, tableOptions.value.sortBy[0].key, tableOptions.value.sortBy[0].order);
                } else {
                    emit("switchPage", tableOptions.value.page - 1, tableOptions.value.itemsPerPage, "", "");
                }
            });
        };

        const setSortAndPageOption = (sortBy: {key: string,  order: string}[], page: number) => {
            tableOptions.value.initialCustomConfiguration = true;
            if (sortBy.length === 0) {
                tableOptions.value.sortBy.splice(0);
            } else {
                tableOptions.value.sortBy = sortBy;
            }
            tableOptions.value.page = page;
        };

        return {
            headers, snackbar, snackbarText, timeout, refreshTable,
            tableOptions, deleteSelection, displayTextOrPlaceholder,
            getTitleFromValueAutoLocale, returnCurrentLocaleContent,
            selectedCountries, notifications, createNewCountry,
            updateCountry, setSortAndPageOption, CountryForm
        };
    }
});
</script>
