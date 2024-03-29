<template>
    <v-btn
        v-if="userRole === 'ADMIN'" density="compact" style="margin-bottom: 20px;" :disabled="selectedJournals.length === 0"
        @click="deleteSelection">
        {{ $t("deleteLabel") }}
    </v-btn>
    <v-btn
        density="compact" style="margin-bottom: 20px; margin-left: 10px;" :disabled="selectedJournals.length !== 2">
        {{ $t("compareLabel") }}
    </v-btn>
    <v-data-table-server
        v-model="selectedJournals"
        :items="journals"
        :headers="headers"
        item-value="row"
        :items-length="totalJournals"
        show-select
        return-object
        :items-per-page-text="$t('itemsPerPageLabel')"
        :items-per-page-options="[5, 10, 25, 50]"
        @update:options="refreshTable">
        <template #item="row">
            <tr>
                <td>
                    <v-checkbox
                        v-model="selectedJournals"
                        :value="row.item"
                        style="margin:0px;padding:0px"
                        hide-details
                    />
                </td>
                <td v-if="$i18n.locale == 'sr'">
                    {{ row.item.titleSr }}
                </td>
                <td v-if="$i18n.locale == 'en'">
                    {{ row.item.titleOther }}
                </td>
                <td>
                    {{ row.item.eissn }}
                </td>
                <td>
                    {{ row.item.printISSN }}
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
import UserService from '@/services/UserService';
import type {JournalIndex} from '@/models/JournalModel';
import JournalService from '@/services/JournalService';

export default defineComponent({
    name: "JournalTableComponent",
    props: {
        journals: {
            type: Array<JournalIndex>,
            required: true
        }, 
        totalJournals: {
            type: Number,
            required: true
        }},
    emits: ["switchPage"],
    setup(props, {emit}) {
        const selectedJournals = ref([]);

        const i18n = useI18n();

        const notifications = ref<Map<string, string>>(new Map());

        const titleLabel = computed(() => i18n.t("titleLabel"));

        const userRole = computed(() => UserService.provideUserRole());

        const titleColumn = computed(() => i18n.t("titleColumn"));

        const tableOptions = ref({initialCustomConfiguration: true, page: 1, itemsPerPage: 10, sortBy:[{key: titleColumn, order: "asc"}]});

        const headers = [
          { title: titleLabel, align: "start", sortable: true, key: titleColumn},
          { title: "eISSN", align: "start", sortable: true, key: "eISSN"},
          { title: "Print ISSN", align: "start", sortable: true, key: "printISSN"},
        ];

        const headersSortableMappings: Map<string, string> = new Map([
            ["titleSr", "title_sr_sortable"],
            ["titleOther", "title_other_sortable"],
            ["eISSN", "e_issn"],
            ["printISSN", "print_issn"]
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

        const deleteSelection = () => {
            Promise.all(selectedJournals.value.map((journal: JournalIndex) => {
                return JournalService.deleteJournal(journal.databaseId)
                    .then(() => {
                        if (i18n.locale.value === "sr") {
                            addNotification(i18n.t("deleteSuccessNotification", { name: journal.titleSr }));
                        } else {
                            addNotification(i18n.t("deleteSuccessNotification", { name: journal.titleOther }));
                        }
                    })
                    .catch(() => {
                        if (i18n.locale.value === "sr") {
                            addNotification(i18n.t("deleteFailedNotification", { name: journal.titleSr }));
                        } else {
                            addNotification(i18n.t("deleteFailedNotification", { name: journal.titleOther }));
                        }
                        return journal;
                    });
            })).then((failedDeletions) => {
                selectedJournals.value = selectedJournals.value.filter((organisationUnit) => failedDeletions.includes(organisationUnit));
                refreshTable(tableOptions.value);
            });
        }

        const addNotification = (message: string) => {
            const notificationId = self.crypto.randomUUID();

            notifications.value.set(notificationId, message);
            setTimeout(() => removeNotification(notificationId), 2000);
        }

        const removeNotification = (notificationId: string) => {
            notifications.value.delete(notificationId);
        }

        return {selectedJournals, headers, notifications, refreshTable, userRole, deleteSelection};
    }
});
</script>

<style scoped>
  .notificationContainer {
    position: fixed;
    top: 10px;
    right: 10px;
    display: grid;
    grid-gap: 0.5em;
    z-index: 99;
  }
</style>
