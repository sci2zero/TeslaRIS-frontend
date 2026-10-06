<template>
    <v-row class="align-center">
        <v-col cols="auto">
            <v-btn
                density="compact"
                class="bottom-spacer"
                :disabled="selectedResearchAreas.length === 0"
                @click="startDeletionProcess">
                {{ $t("deleteLabel") }}
            </v-btn>
        </v-col>

        <v-col cols="auto">
            <generic-crud-modal
                :form-component="ResearchAreaForm"
                :form-props="{ presetResearchArea: undefined }"
                entity-name="ResearchArea"
                @create="createNewResearchArea"
            />
        </v-col>
    </v-row>

    <v-data-table-server
        v-model="selectedResearchAreas"
        :sort-by="tableOptions.sortBy"
        :items="researchAreas"
        :headers="headers"
        :items-length="totalResearchAreas"
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
                        :model-value="isSelected(row.item)"
                        class="table-checkbox"
                        hide-details
                        @update:model-value="toggleSelection(row.item, $event as boolean)"
                    />
                </td>
                <td>{{ returnCurrentLocaleContent(row.item.name) }}</td>
                <td>
                    <rich-text-editor
                        v-model="row.item.displayDescription"
                        :editable="false"
                        :limit-display="100" />
                </td>
                <td>{{ displayTextOrPlaceholder(returnCurrentLocaleContent(row.item.superResearchAreaName) as string) }}</td>
                <td>
                    <generic-crud-modal
                        class="mt-2"
                        :form-component="ResearchAreaForm"
                        :form-props="{ presetResearchArea: row.item }"
                        entity-name="ResearchArea"
                        is-update
                        @update="updateResearchArea(row.item.id as number, $event)"
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
        :entity-names="selectedResearchAreas.map(entity => returnCurrentLocaleContent(entity.name) as string)"
        @continue="deleteSelection" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { displayTextOrPlaceholder } from '@/utils/StringUtil';
import { getTitleFromValueAutoLocale } from '@/i18n/userType';
import type { ResearchAreaRequest, ResearchAreaResponse } from '@/models/Common';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import ResearchAreaService from '@/services/ResearchAreaService';
import GenericCrudModal from '../core/GenericCrudModal.vue';
import ResearchAreaForm from './ResearchAreaForm.vue';
import { isEqual } from 'lodash';
import RichTextEditor from '../core/RichTextEditor.vue';
import PersistentQuestionDialog from '../core/comparators/PersistentQuestionDialog.vue';


export default defineComponent({
    name: "ResearchAreaTableComponent",
    components: { GenericCrudModal, RichTextEditor, PersistentQuestionDialog },
    props: {
        researchAreas: {
            type: Array<ResearchAreaResponse>,
            required: true
        }, 
        totalResearchAreas: {
            type: Number,
            required: true
        }},
    emits: ["switchPage"],
    setup(props, {emit}) {
        const selectedResearchAreas = ref<ResearchAreaResponse[]>([]);
        const notifications = ref<Map<string, string>>(new Map());

        const i18n = useI18n();

        const snackbar = ref(false);
        const snackbarText = ref("");
        const timeout = 5000;

        const nameLabel = computed(() => i18n.t("nameLabel"));
        const descriptionLabel = computed(() => i18n.t("descriptionLabel"));
        const superAreaLabel = computed(() => i18n.t("superResearchAreaLabel"));
        const actionLabel = computed(() => i18n.t("actionLabel"));

        const tableOptions = ref<any>({initialCustomConfiguration: true, page: 1, itemsPerPage: 25, sortBy:[{key: "name", order: "asc"}]});

        const headers = [
          { title: nameLabel, align: "start", sortable: true, key: "name.content"},
          { title: descriptionLabel, align: "start", sortable: true, key: "description"},
          { title: superAreaLabel, align: "start", sortable: false, key: "superResearchAreaName"},
          { title: actionLabel}
        ];

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

        const isSelected = (researchArea: ResearchAreaResponse) => {
            return selectedResearchAreas.value.some((selected) => selected.id === researchArea.id);
        };

        const toggleSelection = (researchArea: ResearchAreaResponse, checked: boolean) => {
            if (checked) {
                if (!isSelected(researchArea)) {
                    selectedResearchAreas.value = [...selectedResearchAreas.value, researchArea];
                }
            } else {
                selectedResearchAreas.value = selectedResearchAreas.value.filter(
                    (selected) => selected.id !== researchArea.id);
            }
        };

        // Selection is remembered by id, never by row reference: refreshing the table
        // replaces every row object, so keeping references would leave the delete button
        // enabled over rows that are no longer rendered.
        const idsToReselect = ref<Set<number>>(new Set());
        watch(() => props.researchAreas, (researchAreas) => {
            if (idsToReselect.value.size === 0) {
                return;
            }

            selectedResearchAreas.value = researchAreas.filter(
                (researchArea) => idsToReselect.value.has(researchArea.id as number));
            idsToReselect.value = new Set();
        });

        const deleteSelection = async () => {
            const byId = new Map<number, ResearchAreaResponse>();
            selectedResearchAreas.value
                .filter((researchArea) => researchArea.id !== undefined)
                .forEach((researchArea) => byId.set(researchArea.id as number, researchArea));

            // A research area cannot be deleted while it still has children, so the
            // selection is deleted bottom-up: each round takes the areas that have no
            // remaining selected child. Children of areas outside the selection are not
            // touched - those deletions are supposed to be refused.
            const selectedChildCount = new Map<number, number>();
            byId.forEach((_, id) => selectedChildCount.set(id, 0));
            byId.forEach((researchArea) => {
                const superId = researchArea.superResearchAreaId;
                if (superId !== undefined && selectedChildCount.has(superId)) {
                    selectedChildCount.set(superId, (selectedChildCount.get(superId) as number) + 1);
                }
            });

            const remaining = new Set<number>(byId.keys());
            const blocked = new Set<number>();
            const failed = new Set<number>();

            const attemptDeletion = async (id: number) => {
                const researchArea = byId.get(id) as ResearchAreaResponse;
                const name = returnCurrentLocaleContent(researchArea.name) as string;

                if (blocked.has(id)) {
                    failed.add(id);
                    addNotification(i18n.t("deleteBlockedByDescendantNotification", { name }));
                    return id;
                }

                try {
                    await ResearchAreaService.deleteResearchArea(id);
                    addNotification(i18n.t("deleteSuccessNotification", { name }));
                } catch {
                    failed.add(id);
                    addNotification(i18n.t("deleteFailedNotification", { name }));
                }

                return id;
            };

            while (remaining.size > 0) {
                const deletableNow = [...remaining].filter(
                    (id) => selectedChildCount.get(id) === 0);

                if (deletableNow.length === 0) {
                    // Unreachable for a well-formed hierarchy; guards against a cycle in
                    // the data leaving this loop spinning.
                    remaining.forEach((id) => failed.add(id));
                    break;
                }

                // Nothing inside one round is an ancestor of anything else in it, so the
                // round itself can go out in parallel; rounds must stay sequential because
                // every delete is its own transaction.
                await Promise.all(deletableNow.map(attemptDeletion));

                deletableNow.forEach((id) => {
                    remaining.delete(id);

                    const superId = byId.get(id)?.superResearchAreaId;
                    if (superId === undefined || !selectedChildCount.has(superId)) {
                        return;
                    }

                    // An ancestor of something that could not be deleted cannot be deleted
                    // either - report that rather than letting it fail with a bare conflict.
                    if (failed.has(id)) {
                        blocked.add(superId);
                    }

                    selectedChildCount.set(superId, (selectedChildCount.get(superId) as number) - 1);
                });
            }

            idsToReselect.value = failed;
            selectedResearchAreas.value = [];

            clampPageAfterDeletion(byId.size - failed.size);
            refreshTable(tableOptions.value);
        };

        // Deleting the last rows of a page would otherwise refetch a page that no longer
        // exists, showing an empty table until the table clamps itself a request later.
        const clampPageAfterDeletion = (deletedCount: number) => {
            const itemsPerPage = tableOptions.value.itemsPerPage;
            if (!itemsPerPage || itemsPerPage < 1) {
                return;
            }

            const remainingTotal = Math.max(props.totalResearchAreas - deletedCount, 0);
            const lastPage = Math.max(Math.ceil(remainingTotal / itemsPerPage), 1);
            if (tableOptions.value.page > lastPage) {
                tableOptions.value.page = lastPage;
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

        const createNewResearchArea = (researchArea: ResearchAreaRequest) => {
            ResearchAreaService.createResearchArea(researchArea).then(() => {
                if (tableOptions.value.sortBy && tableOptions.value.sortBy.length > 0) {
                    emit("switchPage", tableOptions.value.page - 1, tableOptions.value.itemsPerPage, tableOptions.value.sortBy[0].key, tableOptions.value.sortBy[0].order);
                } else {
                    emit("switchPage", tableOptions.value.page - 1, tableOptions.value.itemsPerPage, "", "");
                }
            });
        };

        const updateResearchArea = (researchAreaId: number, researchArea: ResearchAreaRequest) => {
            ResearchAreaService.updateResearchArea(researchAreaId, researchArea).then(() => {
                addNotification(i18n.t("updatedSuccessMessage"));
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
                    isEqual([{key: "name", order: "asc"}], tableOptions.value.sortBy) ||
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

        return {headers, snackbar, snackbarText, timeout, refreshTable,
            tableOptions, deleteSelection, displayTextOrPlaceholder,
            isSelected, toggleSelection,
            getTitleFromValueAutoLocale, returnCurrentLocaleContent,
            selectedResearchAreas, notifications, createNewResearchArea,
            updateResearchArea, setSortAndPageOption, ResearchAreaForm,
            displayPersistentDialog, startDeletionProcess
        };
    }
});
</script>
