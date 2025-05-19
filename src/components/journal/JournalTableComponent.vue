<template>
    <v-btn
        v-if="isAdmin" density="compact" class="bottom-spacer" :disabled="selectedJournals.length === 0"
        @click="deleteSelection">
        {{ $t("deleteLabel") }}
    </v-btn>
    <v-btn
        v-if="isAdmin" density="compact" class="compare-button" :disabled="selectedJournals.length !== 2"
        @click="startPublicationComparison">
        {{ $t("comparePublicationsLabel") }}
    </v-btn>
    <v-btn
        v-if="isAdmin" density="compact" class="compare-button" :disabled="selectedJournals.length !== 2"
        @click="startMetadataComparison">
        {{ $t("compareMetadataLabel") }}
    </v-btn>
    <v-data-table-server
        v-model="selectedJournals"
        :sort-by="tableOptions.sortBy"
        :items="journals"
        :headers="headers"
        item-value="row"
        :items-length="totalJournals"
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
                        v-model="selectedJournals"
                        :value="row.item"
                        class="table-checkbox"
                        hide-details
                    />
                </td>
                <td v-if="$i18n.locale == 'sr'">
                    <localized-link :to="'journals/' + row.item.databaseId">
                        {{ row.item.titleSr }}
                    </localized-link>
                </td>
                <td v-else>
                    <localized-link :to="'journals/' + row.item.databaseId">
                        {{ row.item.titleOther }}
                    </localized-link>
                </td>
                <td>
                    {{ displayTextOrPlaceholder(row.item.eissn) }}
                </td>
                <td>
                    {{ displayTextOrPlaceholder(row.item.printISSN) }}
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
import type {JournalIndex} from '@/models/JournalModel';
import JournalService from '@/services/JournalService';
import LocalizedLink from '../localization/LocalizedLink.vue';
import { displayTextOrPlaceholder } from '@/utils/StringUtil';
import router from '@/router';
import { useUserRole } from '@/composables/useUserRole';
import { isEqual } from 'lodash';


export default defineComponent({
    name: "JournalTableComponent",
    components: { LocalizedLink },
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
    setup(_, {emit}) {
        const selectedJournals = ref<JournalIndex[]>([]);

        const i18n = useI18n();

        const notifications = ref<Map<string, string>>(new Map());

        const titleLabel = computed(() => i18n.t("titleLabel"));

        const { isAdmin } = useUserRole();

        const titleColumn = computed(() => i18n.t("titleColumn"));

        const tableOptions = ref<any>({initialCustomConfiguration: true, page: 1, itemsPerPage: 10, sortBy:[{key: titleColumn, order: "asc"}]});

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
                selectedJournals.value = selectedJournals.value.filter((journal) => failedDeletions.includes(journal));
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

        const startPublicationComparison = () => {
            router.push({name: "journalPublicationsComparator", params: {
                leftId: selectedJournals.value[0].databaseId, rightId: selectedJournals.value[1].databaseId
            }});
        };

        const startMetadataComparison = () => {
            router.push({name: "journalMetadataComparator", params: {
                leftId: selectedJournals.value[0].databaseId, rightId: selectedJournals.value[1].databaseId
            }});
        };

        const setSortAndPageOption = (sortBy: {key: string,  order: string}[], page: number) => {
            if (
                (
                    isEqual([{key: titleColumn.value, order: "asc"}], tableOptions.value.sortBy) ||
                    tableOptions.value.sortBy.length === 0
                ) &&
                page == tableOptions.value.page
            ) {
                return
            }

            tableOptions.value.initialCustomConfiguration = true;
            if (sortBy.length === 0) {
                tableOptions.value.sortBy.splice(0);
            } else {
                tableOptions.value.sortBy = sortBy;
            }
            tableOptions.value.page = page;
        };

        return {
            selectedJournals, headers, notifications,
            refreshTable, isAdmin, deleteSelection,
            tableOptions, displayTextOrPlaceholder,
            startPublicationComparison, startMetadataComparison,
            setSortAndPageOption
        };
    }
});
</script>
