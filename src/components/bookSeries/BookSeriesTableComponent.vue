<template>
    <v-btn
        v-if="isAdmin" density="compact" class="bottom-spacer" :disabled="selectedBookSeries.length === 0"
        @click="deleteSelection">
        {{ $t("deleteLabel") }}
    </v-btn>
    <v-btn
        v-if="isAdmin" density="compact" class="compare-button" :disabled="selectedBookSeries.length !== 2"
        @click="startPublicationComparison">
        {{ $t("comparePublicationsLabel") }}
    </v-btn>
    <v-btn
        v-if="isAdmin" density="compact" class="compare-button" :disabled="selectedBookSeries.length !== 2"
        @click="startMetadataComparison">
        {{ $t("compareMetadataLabel") }}
    </v-btn>
    <v-data-table-server
        v-model="selectedBookSeries"
        :sort-by="tableOptions.sortBy"
        :items="bookSeries"
        :headers="headers"
        item-value="row"
        :items-length="totalBookSeries"
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
                        v-model="selectedBookSeries"
                        :value="row.item"
                        class="table-checkbox"
                        hide-details
                    />
                </td>
                <td v-if="$i18n.locale == 'sr'">
                    <localized-link :to="'book-series/' + row.item.databaseId">
                        {{ row.item.titleSr }}
                    </localized-link>
                </td>
                <td v-else>
                    <localized-link :to="'book-series/' + row.item.databaseId">
                        {{ row.item.titleOther }}
                    </localized-link>
                </td>
                <td>
                    {{ displayTextOrPlaceholder(row.item.eISSN) }}
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
import type {BookSeriesIndex} from '@/models/BookSeriesModel';
import BookSeriesService from '@/services/BookSeriesService';
import LocalizedLink from '../localization/LocalizedLink.vue';
import { displayTextOrPlaceholder } from '@/utils/StringUtil';
import { useRouter } from 'vue-router';
import { useUserRole } from '@/composables/useUserRole';


export default defineComponent({
    name: "BookSeriesTableComponent",
    components: { LocalizedLink },
    props: {
        bookSeries: {
            type: Array<BookSeriesIndex>,
            required: true
        }, 
        totalBookSeries: {
            type: Number,
            required: true
        }},
    emits: ["switchPage"],
    setup(_, {emit}) {
        const selectedBookSeries = ref<BookSeriesIndex[]>([]);

        const i18n = useI18n();

        const router = useRouter();

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
            Promise.all(selectedBookSeries.value.map((bookSeries: BookSeriesIndex) => {
                return BookSeriesService.deleteBookSeries(bookSeries.databaseId)
                    .then(() => {
                        if (i18n.locale.value === "sr") {
                            addNotification(i18n.t("deleteSuccessNotification", { name: bookSeries.titleSr }));
                        } else {
                            addNotification(i18n.t("deleteSuccessNotification", { name: bookSeries.titleOther }));
                        }
                    })
                    .catch(() => {
                        if (i18n.locale.value === "sr") {
                            addNotification(i18n.t("deleteFailedNotification", { name: bookSeries.titleSr }));
                        } else {
                            addNotification(i18n.t("deleteFailedNotification", { name: bookSeries.titleOther }));
                        }
                        return bookSeries;
                    });
            })).then((failedDeletions) => {
                selectedBookSeries.value = selectedBookSeries.value.filter((bookSeries) => failedDeletions.includes(bookSeries));
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
            router.push({name: "bookSeriesPublicationsComparator", params: {
                leftId: selectedBookSeries.value[0].databaseId, rightId: selectedBookSeries.value[1].databaseId
            }});
        };

        const startMetadataComparison = () => {
            router.push({name: "bookSeriesMetadataComparator", params: {
                leftId: selectedBookSeries.value[0].databaseId, rightId: selectedBookSeries.value[1].databaseId
            }});
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

        return {selectedBookSeries, headers, notifications, 
            refreshTable, isAdmin, deleteSelection,
            tableOptions, displayTextOrPlaceholder,
            startPublicationComparison,
            startMetadataComparison, setSortAndPageOption
        };
    }
});
</script>
