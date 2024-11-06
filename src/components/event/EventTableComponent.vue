<template>
    <v-btn
        v-if="userRole === 'ADMIN'" density="compact" class="bottom-spacer" :disabled="selectedEvents.length === 0"
        @click="deleteSelection">
        {{ $t("deleteLabel") }}
    </v-btn>
    <v-btn
        v-if="userRole === 'ADMIN'"
        density="compact" class="compare-button" :disabled="selectedEvents.length !== 2" @click="startProceedingsComparison">
        {{ $t("compareProceedingsLabel") }}
    </v-btn>
    <v-btn
        v-if="userRole === 'ADMIN'"
        density="compact" class="compare-button" :disabled="selectedEvents.length !== 2" @click="startMetadataComparison">
        {{ $t("compareMetadataLabel") }}
    </v-btn>
    <v-data-table-server
        v-model="selectedEvents"
        :sort-by="tableOptions.sortBy"
        :items="events"
        :headers="headers"
        item-value="row"
        :items-length="totalEvents"
        :show-select="userRole === 'ADMIN'"
        return-object
        :items-per-page-text="$t('itemsPerPageLabel')"
        :items-per-page-options="[5, 10, 25, 50]"
        @update:options="refreshTable">
        <template #item="row">
            <tr>
                <td v-if="userRole === 'ADMIN'">
                    <v-checkbox
                        v-model="selectedEvents"
                        :value="row.item"
                        class="table-checkbox"
                        hide-details
                    />
                </td>
                <td v-if="$i18n.locale == 'sr'">
                    <localized-link :to="'events/conference/' + row.item.databaseId">
                        {{ row.item.nameSr }}
                    </localized-link>
                </td>
                <td v-else>
                    <localized-link :to="'events/conference/' + row.item.databaseId">
                        {{ row.item.nameOther }}
                    </localized-link>
                </td>
                <td>
                    {{ displayTextOrPlaceholder(row.item.dateFromTo) }}
                </td>
                <td v-if="$i18n.locale == 'sr'">
                    {{ displayTextOrPlaceholder(row.item.stateSr) }}
                </td>
                <td v-else>
                    {{ displayTextOrPlaceholder(row.item.stateOther) }}
                </td>
                <td>
                    <v-icon v-if="row.item.serialEvent" icon="mdi-check"></v-icon>
                    <v-icon v-else icon="mdi-cancel"></v-icon>
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
import { displayTextOrPlaceholder } from '@/utils/StringUtil';
import { useRouter } from 'vue-router';

export default defineComponent({
    name: "EventTableComponent",
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
    setup(_, {emit}) {
        const selectedEvents = ref<EventIndex[]>([]);

        const i18n = useI18n();
        const router = useRouter();

        const notifications = ref<Map<string, string>>(new Map());

        const nameLabel = computed(() => i18n.t("nameLabel"));
        const eventDateLabel = computed(() => i18n.t("eventDateLabel"));
        const stateLabel = computed(() => i18n.t("stateLabel"));
        const serialEventLabel = computed(() => i18n.t("serialEventLabel"));

        const userRole = computed(() => UserService.provideUserRole());

        const nameColumn = computed(() => i18n.t("nameColumn"));
        const stateColumn = computed(() => i18n.t("stateColumn"));

        const tableOptions = ref<any>({initialCustomConfiguration: true, page: 1, itemsPerPage: 10, sortBy:[{key: nameColumn, order: "asc"}]});

        const headers = [
          { title: nameLabel, align: "start", sortable: true, key: nameColumn},
          { title: eventDateLabel, align: "start", sortable: true, key: "dateFromTo"},
          { title: stateLabel, align: "start", sortable: true, key: stateColumn},
          { title: serialEventLabel, align: "start", sortable: false, key: "serialEvent"},
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
        };

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
        };

        const addNotification = (message: string) => {
            const notificationId = self.crypto.randomUUID();

            notifications.value.set(notificationId, message);
            setTimeout(() => removeNotification(notificationId), 2000);
        };

        const removeNotification = (notificationId: string) => {
            notifications.value.delete(notificationId);
        };

        const isSerialEventInSelection = () => {
            if (selectedEvents.value[0].serialEvent || selectedEvents.value[1].serialEvent) {
                addNotification(i18n.t("cannotCompareSerialEventsMessage"));
                return true;
            }
            
            return false;
        };

        const startProceedingsComparison = () => {
            if (isSerialEventInSelection()) {
                return;
            }

            router.push({name: "eventProceedingsComparator", params: {
                leftId: selectedEvents.value[0].databaseId, rightId: selectedEvents.value[1].databaseId
            }});
        };

        const startMetadataComparison = () => {
            if (isSerialEventInSelection()) {
                return;
            }

            router.push({name: "eventMetadataComparator", params: {
                leftId: selectedEvents.value[0].databaseId, rightId: selectedEvents.value[1].databaseId
            }});
        };

        const setSortOption = (sortBy: {key: string,  order: string}[]) => {
            tableOptions.value.initialCustomConfiguration = true;
            tableOptions.value.sortBy = sortBy;
        };

        return {
            selectedEvents, headers, notifications,
            refreshTable, userRole, deleteSelection,
            tableOptions, displayTextOrPlaceholder,
            startProceedingsComparison, startMetadataComparison,
            setSortOption
        };
    }
});
</script>
