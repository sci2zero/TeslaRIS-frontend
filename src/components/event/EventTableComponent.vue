<template>
    <v-btn
        v-if="userRole === 'ADMIN'" density="compact" style="margin-bottom: 20px;" :disabled="selectedEvents.length === 0"
        @click="deleteSelection">
        {{ $t("deleteLabel") }}
    </v-btn>
    <v-btn
        density="compact" style="margin-bottom: 20px; margin-left: 10px;" :disabled="selectedEvents.length !== 2">
        {{ $t("compareLabel") }}
    </v-btn>
    <v-data-table-server
        v-model="selectedEvents"
        :sort-by="tableOptions.sortBy"
        :items="events"
        :headers="headers"
        item-value="row"
        :items-length="totalEvents"
        show-select
        return-object
        :items-per-page-text="$t('itemsPerPageLabel')"
        :items-per-page-options="[5, 10, 25, 50]"
        @update:options="refreshTable">
        <template #item="row">
            <tr>
                <td>
                    <v-checkbox
                        v-model="selectedEvents"
                        :value="row.item"
                        style="margin:0px;padding:0px"
                        hide-details
                    />
                </td>
                <td v-if="$i18n.locale == 'sr'">
                    <localized-link :to="'events/conference/' + row.item.databaseId">
                        {{ row.item.nameSr }}
                    </localized-link>
                </td>
                <td v-if="$i18n.locale == 'en'">
                    <localized-link :to="'events/conference/' + row.item.databaseId">
                        {{ row.item.nameOther }}
                    </localized-link>
                </td>
                <td>
                    {{ row.item.dateFromTo }}
                </td>
                <td v-if="$i18n.locale == 'sr'">
                    {{ row.item.stateSr }}
                </td>
                <td v-if="$i18n.locale == 'en'">
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
import {EventType, type EventIndex} from '@/models/EventModel';
import EventService from '@/services/EventService';
import LocalizedLink from '../localization/LocalizedLink.vue';


export default defineComponent({
    name: "PublicationTableComponent",
    components: { LocalizedLink },
    props: {
        events: {
            type: Array<EventIndex>,
            required: true
        }, 
        totalEvents: {
            type: Number,
            required: true
        }},
    emits: ["switchPage"],
    setup(props, {emit}) {
        const selectedEvents = ref([]);

        const i18n = useI18n();

        const notifications = ref<Map<string, string>>(new Map());

        const nameLabel = computed(() => i18n.t("nameLabel"));
        const eventDateLabel = computed(() => i18n.t("eventDateLabel"));
        const stateLabel = computed(() => i18n.t("stateLabel"));

        const userRole = computed(() => UserService.provideUserRole());

        const nameColumn = computed(() => i18n.t("nameColumn"));
        const stateColumn = computed(() => i18n.t("stateColumn"));

        const tableOptions = ref<any>({initialCustomConfiguration: true, page: 1, itemsPerPage: 10, sortBy:[{key: nameColumn, order: "asc"}]});

        const headers = [
          { title: nameLabel, align: "start", sortable: true, key: nameColumn},
          { title: eventDateLabel, align: "start", sortable: true, key: "dateFromTo"},
          { title: stateLabel, align: "start", sortable: true, key: stateColumn},
        ];

        const headersSortableMappings: Map<string, string> = new Map([
            ["nameSr", "name_sr_sortable"],
            ["nameOther", "name_other_sortable"],
            ["dateFromTo", "date_sortable"],
            ["stateSr", "state_sr_sortable"],
            ["stateOther", "state_other_sortable"],
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
            Promise.all(selectedEvents.value.map((event: EventIndex) => {
                switch(event.eventType) {
                    case EventType.CONFERENCE:
                        return EventService.deleteConference(event.databaseId)
                            .then(() => {
                                pushlocalizedMessage(true, event);
                            })
                            .catch(() => {
                                pushlocalizedMessage(false, event);
                                return event;
                            });
                }
            })).then((failedDeletions) => {
                selectedEvents.value = selectedEvents.value.filter((event) => failedDeletions.includes(event));
                refreshTable(tableOptions.value);
            });
        }

        const pushlocalizedMessage = (success: boolean, event: EventIndex) => {
            if (success) {
                if (i18n.locale.value === "sr") {
                    addNotification(i18n.t("deleteSuccessNotification", { name: event.nameSr }));
                } else {
                    addNotification(i18n.t("deleteSuccessNotification", { name: event.nameOther }));
                }
            } else {
                if (i18n.locale.value === "sr") {
                    addNotification(i18n.t("deleteFailedNotification", { name: event.nameSr }));
                } else {
                    addNotification(i18n.t("deleteFailedNotification", { name: event.nameOther }));
                }
            }
        }

        const addNotification = (message: string) => {
            const notificationId = self.crypto.randomUUID();

            notifications.value.set(notificationId, message);
            setTimeout(() => removeNotification(notificationId), 2000);
        }

        const removeNotification = (notificationId: string) => {
            notifications.value.delete(notificationId);
        }

        return {selectedEvents, headers, notifications, refreshTable, userRole, deleteSelection, tableOptions};
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
