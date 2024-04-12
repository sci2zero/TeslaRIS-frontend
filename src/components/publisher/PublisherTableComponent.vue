<template>
    <v-btn
        v-if="userRole === 'ADMIN'" density="compact" style="margin-bottom: 20px;" :disabled="selectedPublishers.length === 0"
        @click="deleteSelection">
        {{ $t("deleteLabel") }}
    </v-btn>
    <v-btn
        density="compact" style="margin-bottom: 20px; margin-left: 10px;" :disabled="selectedPublishers.length !== 2">
        {{ $t("compareLabel") }}
    </v-btn>
    <v-data-table-server
        v-model="selectedPublishers"
        :sort-by="tableOptions.sortBy"
        :items="publishers"
        :headers="headers"
        item-value="row"
        :items-length="totalPublishers"
        show-select
        return-object
        :items-per-page-text="$t('itemsPerPageLabel')"
        :items-per-page-options="[5, 10, 25, 50]"
        @update:options="refreshTable">
        <template #item="row">
            <tr>
                <td>
                    <v-checkbox
                        v-model="selectedPublishers"
                        :value="row.item"
                        style="margin:0px;padding:0px"
                        hide-details
                    />
                </td>
                <td v-if="$i18n.locale == 'sr'">
                    <localized-link :to="'publishers/' + row.item.databaseId">
                        {{ row.item.nameSr }}
                    </localized-link>
                </td>
                <td v-else>
                    <localized-link :to="'publishers/' + row.item.databaseId">
                        {{ row.item.nameOther }}
                    </localized-link>
                </td>
                <td v-if="$i18n.locale == 'sr'">
                    {{ row.item.placeSr }}
                </td>
                <td v-else>
                    {{ row.item.placeOther }}
                </td>
                <td v-if="$i18n.locale == 'sr'">
                    {{ row.item.stateSr }}
                </td>
                <td v-else>
                    {{ row.item.stateOther }}
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
import type { PublisherIndex } from '@/models/PublisherModel';
import PublisherService from '@/services/PublisherService';
import LocalizedLink from '../localization/LocalizedLink.vue';


export default defineComponent({
    name: "PublisherTableComponent",
    components: { LocalizedLink },
    props: {
        publishers: {
            type: Array<PublisherIndex>,
            required: true
        }, 
        totalPublishers: {
            type: Number,
            required: true
        }},
    emits: ["switchPage"],
    setup(_, {emit}) {
        const selectedPublishers = ref([]);

        const i18n = useI18n();

        const notifications = ref<Map<string, string>>(new Map());

        const nameLabel = computed(() => i18n.t("nameLabel"));
        const placeLabel = computed(() => i18n.t("placeLabel"));
        const stateLabel = computed(() => i18n.t("stateLabel"));

        const userRole = computed(() => UserService.provideUserRole());

        const nameColumn = computed(() => i18n.t("nameColumn"));
        const placeColumn = computed(() => i18n.t("placeColumn"));
        const stateColumn = computed(() => i18n.t("stateColumn"));

        const tableOptions = ref<any>({initialCustomConfiguration: true, page: 1, itemsPerPage: 10, sortBy:[{key: nameColumn, order: "asc"}]});

        const headers = [
          { title: nameLabel, align: "start", sortable: true, key: nameColumn},
          { title: placeLabel, align: "start", sortable: true, key: placeColumn},
          { title: stateLabel, align: "start", sortable: true, key: stateColumn},
        ];

        const headersSortableMappings: Map<string, string> = new Map([
            ["nameSr", "name_sr_sortable"],
            ["nameOther", "name_other_sortable"],
            ["placeSr", "place_sr_sortable"],
            ["placeOther", "place_other_sortable"],
            ["stateSr", "state_sr_sortable"],
            ["stateOther", "state_other_sortable"]
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
            Promise.all(selectedPublishers.value.map((publisher: PublisherIndex) => {
                return PublisherService.deletePublisher(publisher.databaseId)
                    .then(() => {
                        if (i18n.locale.value === "sr") {
                            addNotification(i18n.t("deleteSuccessNotification", { name: publisher.nameSr }));
                        } else {
                            addNotification(i18n.t("deleteSuccessNotification", { name: publisher.nameOther }));
                        }
                    })
                    .catch(() => {
                        if (i18n.locale.value === "sr") {
                            addNotification(i18n.t("deleteFailedNotification", { name: publisher.nameSr }));
                        } else {
                            addNotification(i18n.t("deleteFailedNotification", { name: publisher.nameOther }));
                        }
                        return publisher;
                    });
            })).then((failedDeletions) => {
                selectedPublishers.value = selectedPublishers.value.filter((organisationUnit) => failedDeletions.includes(organisationUnit));
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

        return {selectedPublishers, headers, notifications, refreshTable, userRole, deleteSelection, tableOptions};
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
