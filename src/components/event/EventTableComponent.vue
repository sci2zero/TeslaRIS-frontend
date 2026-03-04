<template>
    <v-btn
        v-if="isAdmin" density="compact" class="bottom-spacer" :disabled="selectedEvents.length === 0"
        @click="startDeletionProcess">
        {{ $t("deleteLabel") }}
    </v-btn>
    <v-btn
        v-if="isAdmin"
        density="compact"
        class="compare-button"
        :disabled="selectedEvents.length !== 2 || selectedEvents.some(e => e.eventType !== EventType.CONFERENCE)"
        @click="startProceedingsComparison">
        {{ $t("compareProceedingsLabel") }}
    </v-btn>
    <v-btn
        v-if="isAdmin"
        density="compact"
        class="compare-button"
        :disabled="selectedEvents.length !== 2 || (selectedEvents[0].eventType !== selectedEvents[1].eventType)"
        @click="startMetadataComparison">
        {{ $t("compareMetadataLabel") }}
    </v-btn>
    <v-data-table-server
        v-model="selectedEvents"
        :sort-by="tableOptions.sortBy"
        :items="events"
        :headers="headers"
        item-value="row"
        :items-length="totalEvents"
        :show-select="isAdmin"
        return-object
        :items-per-page-text="$t('itemsPerPageLabel')"
        :items-per-page-options="[5, 10, 25, 50]"
        :no-data-text="$t('noDataInTableMessage')"
        :page="tableOptions.page"
        @update:options="refreshTable">
        <template #[`header.type`]="{ isSorted, column, toggleSort, getSortIcon }">
            <div class="group flex items-center gap-2" @click="toggleSort(column)">
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
                <v-icon class="" :class="[isSorted(column) ? 'opacity-100' : 'opacity-0 group-hover:opacity-50']" :icon="getSortIcon(column)"></v-icon>
            </div>
        </template>
        <template #item="row">
            <tr>
                <td v-if="isAdmin">
                    <v-checkbox
                        v-model="selectedEvents"
                        :value="row.item"
                        class="table-checkbox"
                        hide-details
                    />
                </td>
                <td v-if="$i18n.locale.startsWith('sr')">
                    <localized-link :to="'events/' + getPathByEventType(row.item.eventType) + '/' + row.item.databaseId">
                        {{ row.item.nameSr }}
                    </localized-link>
                </td>
                <td v-else>
                    <localized-link :to="'events/' + getPathByEventType(row.item.eventType) + '/' + row.item.databaseId">
                        {{ row.item.nameOther }}
                    </localized-link>
                </td>
                <td>
                    {{ displayTextOrPlaceholder(row.item.dateFromTo) }}
                </td>
                <td>
                    {{ getEventTypeTitleFromValueAutoLocale(row.item.eventType) }}
                </td>
                <td v-if="$i18n.locale.startsWith('sr')">
                    {{ displayTextOrPlaceholder(row.item.stateSr) }}
                </td>
                <td v-else>
                    {{ displayTextOrPlaceholder(row.item.stateOther) }}
                </td>
                <td>
                    <v-icon v-if="row.item.serialEvent" icon="mdi-check"></v-icon>
                    <v-icon v-else icon="mdi-cancel"></v-icon>
                </td>
                <td>
                    <entity-classification-modal-content
                        :entity-id="row.item.databaseId"
                        :entity-type="ApplicableEntityType.EVENT"
                        :applicable-type="row.item.eventType === EventType.CONFERENCE ? ApplicableEntityType.CONFERENCE : ApplicableEntityType.EXHIBITION"
                        @classified="eventClassified(row.item)"
                        @update="refreshTable(tableOptions)">
                    </entity-classification-modal-content>
                </td>
                <td v-if="isCommission">
                    <v-icon v-if="row.item.classifiedBy?.includes(loggedInUser?.commissionId as number)" icon="mdi-check"></v-icon>
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

    <persistent-question-dialog
        v-model="displayPersistentDialog"
        :title="$t('areYouSureLabel')"
        :message="$t('confirmDeletionMessage')"
        :entity-names="selectedEvents.map(entity => $i18n.locale.startsWith('sr') ? entity.nameSr : entity.nameOther)"
        @continue="deleteSelection">
    </persistent-question-dialog>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import {EventType, type EventIndex} from '@/models/EventModel';
import EventService from '@/services/EventService';
import LocalizedLink from '../localization/LocalizedLink.vue';
import { displayTextOrPlaceholder } from '@/utils/StringUtil';
import { useRouter } from 'vue-router';
import EntityClassificationModalContent from '../assessment/classifications/EntityClassificationModalContent.vue';
import { useUserRole } from '@/composables/useUserRole';
import { ApplicableEntityType } from '@/models/Common';
import { isEqual } from 'lodash';
import PersistentQuestionDialog from '../core/comparators/PersistentQuestionDialog.vue';
import { getEventTypeTitleFromValueAutoLocale } from '@/i18n/eventType';


export default defineComponent({
    name: "EventTableComponent",
    components: { LocalizedLink, EntityClassificationModalContent, PersistentQuestionDialog },
    props: {
        events: {
            type: Array<EventIndex>,
            required: true
        }, 
        hasActiveTypeFilters: {
            type: Boolean,
            default: false
        },
        totalEvents: {
            type: Number,
            required: true
        }
    },
    emits: ["switchPage"],
    setup(_, {emit}) {
        const selectedEvents = ref<EventIndex[]>([]);

        const i18n = useI18n();
        const router = useRouter();

        const notifications = ref<Map<string, string>>(new Map());

        const nameLabel = computed(() => i18n.t("nameLabel"));
        const eventDateLabel = computed(() => i18n.t("eventDateLabel"));
        const eventTypeLabel = computed(() => i18n.t("eventTypeLabel"));
        const stateLabel = computed(() => i18n.t("stateLabel"));
        const serialEventLabel = computed(() => i18n.t("serialEventLabel"));
        const actionLabel = computed(() => i18n.t("actionLabel"));
        const classifiedByMeLabel = computed(() => i18n.t("classifiedByMeLabel"));

        const { isAdmin, isCommission, loggedInUser } = useUserRole();

        const nameColumn = computed(() => i18n.t("nameColumn"));
        const stateColumn = computed(() => i18n.t("stateColumn"));

        const tableOptions = ref<any>(
            {
                initialCustomConfiguration: true,
                page: 1,
                itemsPerPage: 10,
                sortBy:[
                    {
                        key: (isCommission.value ? "dateFromTo" : nameColumn),
                        order: (isCommission.value ? "desc" : "asc")
                    }
                ]
            }
        );

        const headers = ref<any[]>([
          { title: nameLabel, align: "start", sortable: true, key: nameColumn},
          { title: eventDateLabel, align: "start", sortable: true, key: "dateFromTo"},
          { title: eventTypeLabel, align: "start", sortable: true, key: "type"},
          { title: stateLabel, align: "start", sortable: true, key: stateColumn},
          { title: serialEventLabel, align: "start", sortable: false, key: "serialEvent"}
        ]);

        onMounted(() => {
            if (isAdmin.value || isCommission.value) {
                headers.value.push({ title: actionLabel, align: "start", sortable: false, key: "action"});
            }

            if (isCommission.value) {
                headers.value.push({ title: classifiedByMeLabel, align: "start", sortable: false, key: "classifiedBy"});
                tableOptions.value.sortBy = [{key: "dateFromTo", order: "desc"}];
            }
        });

        const headersSortableMappings: Map<string, string> = new Map([
            ["nameSr", "name_sr_sortable"],
            ["nameOther", "name_other_sortable"],
            ["dateFromTo", "date_sortable"],
            ["stateSr", "state_sr_sortable"],
            ["stateOther", "state_other_sortable"],
            ["type", "event_type"]
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
                if (i18n.locale.value.startsWith("sr")) {
                    addNotification(i18n.t("deleteSuccessNotification", { name: event.nameSr }));
                } else {
                    addNotification(i18n.t("deleteSuccessNotification", { name: event.nameOther }));
                }
            } else {
                if (i18n.locale.value.startsWith("sr")) {
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

            let metadataComparisonPageName = "";
            switch (selectedEvents.value[0].eventType) {
                case EventType.CONFERENCE:
                    metadataComparisonPageName = "conferenceMetadataComparator";
                    break;
                case EventType.EXHIBITION:
                    metadataComparisonPageName = "exhibitionMetadataComparator";
                    break;
            }

            router.push({name: metadataComparisonPageName, params: {
                leftId: selectedEvents.value[0].databaseId, rightId: selectedEvents.value[1].databaseId
            }});
        };

        const setSortAndPageOption = (sortBy: {key: string,  order: string}[], page: number) => {
            if (
                (
                    isEqual([
                        {
                            key: (isCommission.value ? "dateFromTo" : nameColumn),
                            order: (isCommission.value ? "desc" : "asc")
                        }
                    ], tableOptions.value.sortBy) ||
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

        const eventClassified = (event: EventIndex) => {
            if (event.serialEvent) {
                refreshTable(tableOptions.value);
                return;
            }

            const commissionId = loggedInUser.value?.commissionId as number;
            if (event.classifiedBy) {
                if (!event.classifiedBy.includes(commissionId)) {
                    event.classifiedBy.push(commissionId);
                }
            } else {
                event.classifiedBy = [commissionId];
            }
        };

        const displayPersistentDialog = ref(false);
        const startDeletionProcess = () => {
            displayPersistentDialog.value = true;
        };

        const getPathByEventType = (eventType: EventType) => {
            switch (eventType) {
                case EventType.CONFERENCE:
                    return "conference";
                case EventType.EXHIBITION:
                    return "exhibition";
                default:
                    return "conference"; // should never happen
            }
        };

        return {
            selectedEvents, headers, notifications,
            refreshTable, isAdmin, deleteSelection,
            tableOptions, displayTextOrPlaceholder,
            startProceedingsComparison, startMetadataComparison,
            setSortAndPageOption, loggedInUser, isCommission,
            eventClassified, ApplicableEntityType,
            displayPersistentDialog, startDeletionProcess,
            getEventTypeTitleFromValueAutoLocale, EventType,
            getPathByEventType
        };
    }
});
</script>
