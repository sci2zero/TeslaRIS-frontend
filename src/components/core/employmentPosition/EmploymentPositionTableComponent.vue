<template>
    <v-row class="align-center">
        <v-col cols="auto">
            <v-btn
                density="compact"
                class="bottom-spacer"
                :disabled="selectedEmploymentPositions.length === 0"
                @click="startDeletionProcess">
                {{ $t("deleteLabel") }}
            </v-btn>
        </v-col>

        <v-col cols="auto">
            <research-area-modal
                :preset-research-area="undefined"
                @submit="createNewEmploymentPosition">
            </research-area-modal>
            <generic-crud-modal
                :form-component="EmploymentPositionForm"
                :form-props="{ presetEmploymentPosition: undefined }"
                entity-name="EmploymentPosition"
                @create="createNewEmploymentPosition"
            />
        </v-col>
    </v-row>

    <v-data-table-server
        v-model="selectedEmploymentPositions"
        :sort-by="tableOptions.sortBy"
        :items="employmentPositions"
        :headers="headers"
        :items-length="totalEmploymentPositions"
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
                        v-model="selectedEmploymentPositions"
                        :value="row.item"
                        class="table-checkbox"
                        hide-details
                    />
                </td>
                <td>{{ returnCurrentLocaleContent(row.item.name) }}</td>
                <td>
                    <rich-text-editor
                        v-model="row.item.displayDescription"
                        :editable="false"
                        :limit-display="100">
                    </rich-text-editor>
                </td>
                <td>
                    {{ row.item.schemeName }}
                </td>
                <td>{{ displayTextOrPlaceholder(returnCurrentLocaleContent(row.item.superEmploymentPositionName) as string) }}</td>
                <td>
                    <generic-crud-modal
                        class="mt-2"
                        :form-component="EmploymentPositionForm"
                        :form-props="{ presetEmploymentPosition: row.item }"
                        entity-name="EmploymentPosition"
                        is-update
                        @update="updateEmploymentPosition(row.item.id as number, $event)"
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
        :entity-names="selectedEmploymentPositions.map(entity => returnCurrentLocaleContent(entity.name) as string)"
        @continue="deleteSelection">
    </persistent-question-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { displayTextOrPlaceholder } from '@/utils/StringUtil';
import { getTitleFromValueAutoLocale } from '@/i18n/userType';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import EmploymentPositionService from '@/services/EmploymentPositionService';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import EmploymentPositionForm from './EmploymentPositionForm.vue';
import { isEqual } from 'lodash';
import PersistentQuestionDialog from '../comparators/PersistentQuestionDialog.vue';
import { type EmploymentPositionHierarchy } from '@/models/InvolvementModel';
import RichTextEditor from '../RichTextEditor.vue';


export default defineComponent({
    name: "EmploymentPositionTableComponent",
    components: { GenericCrudModal, PersistentQuestionDialog, RichTextEditor },
    props: {
        employmentPositions: {
            type: Array<EmploymentPositionHierarchy>,
            required: true
        }, 
        totalEmploymentPositions: {
            type: Number,
            required: true
        }},
    emits: ["switchPage"],
    setup(_, {emit}) {
        const selectedEmploymentPositions = ref<EmploymentPositionHierarchy[]>([]);
        const notifications = ref<Map<string, string>>(new Map());

        const i18n = useI18n();

        const snackbar = ref(false);
        const snackbarText = ref("");
        const timeout = 5000;

        const nameLabel = computed(() => i18n.t("nameLabel"));
        const descriptionLabel = computed(() => i18n.t("descriptionLabel"));
        const schemeNameLabel = computed(() => i18n.t("schemeNameLabel"));
        const superPositionLabel = computed(() => i18n.t("superEmploymentPositionLabel"));
        const actionLabel = computed(() => i18n.t("actionLabel"));

        const tableOptions = ref<any>({initialCustomConfiguration: true, page: 1, itemsPerPage: 25, sortBy:[{key: "name", order: "asc"}]});

        const headers = [
          { title: nameLabel, align: "start", sortable: true, key: "name.content"},
          { title: descriptionLabel, align: "start", sortable: false, key: "description"},
          { title: schemeNameLabel, align: "start", sortable: true, key: "schemeName"},
          { title: superPositionLabel, align: "start", sortable: false, key: "superEmploymentPositionName"},
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

        const deleteSelection = () => {
            Promise.all(selectedEmploymentPositions.value.map((employmentPosition: EmploymentPositionHierarchy) => {
                return EmploymentPositionService.deleteEmploymentPosition(employmentPosition.id as number)
                    .then(() => {
                        addNotification(i18n.t("deleteSuccessNotification", { name: returnCurrentLocaleContent(employmentPosition.name) }));
                    })
                    .catch(() => {
                        addNotification(i18n.t("deleteFailedNotification", { name: returnCurrentLocaleContent(employmentPosition.name) }));
                        return employmentPosition;
                    });
            })).then((failedDeletions) => {
                selectedEmploymentPositions.value = selectedEmploymentPositions.value.filter((employmentPosition) => failedDeletions.includes(employmentPosition));
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

        const createNewEmploymentPosition = (employmentPosition: EmploymentPositionHierarchy) => {
            EmploymentPositionService.createEmploymentPosition(employmentPosition).then(() => {
                if (tableOptions.value.sortBy && tableOptions.value.sortBy.length > 0) {
                    emit("switchPage", tableOptions.value.page - 1, tableOptions.value.itemsPerPage, tableOptions.value.sortBy[0].key, tableOptions.value.sortBy[0].order);
                } else {
                    emit("switchPage", tableOptions.value.page - 1, tableOptions.value.itemsPerPage, "", "");
                }
            });
        };

        const updateEmploymentPosition = (employmentPositionId: number, employmentPosition: EmploymentPositionHierarchy) => {
            EmploymentPositionService.updateEmploymentPosition(employmentPositionId, employmentPosition).then(() => {
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
            getTitleFromValueAutoLocale, returnCurrentLocaleContent,
            selectedEmploymentPositions, notifications, createNewEmploymentPosition,
            updateEmploymentPosition, setSortAndPageOption, EmploymentPositionForm,
            displayPersistentDialog, startDeletionProcess
        };
    }
});
</script>
