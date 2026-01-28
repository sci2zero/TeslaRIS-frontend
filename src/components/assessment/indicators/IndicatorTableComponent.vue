<template>
    <v-btn
        density="compact" 
        class="bottom-spacer"
        :disabled="selectedIndicators.length === 0"
        @click="startDeletionProcess">
        {{ $t("deleteLabel") }}
    </v-btn>
    <generic-crud-modal
        :form-component="IndicatorForm"
        :form-props="{ presetIndicator: undefined }"
        entity-name="Indicator"
        :read-only="false"
        @create="createNewIndicator"
    />

    <v-data-table-server
        v-model="selectedIndicators"
        :sort-by="tableOptions.sortBy"
        :items="indicators"
        :headers="headers"
        :items-length="totalIndicators"
        :items-per-page-text="$t('itemsPerPageLabel')"
        :items-per-page-options="[5, 25, 50]"
        :items-per-page="25"
        show-select
        return-object
        @update:options="refreshTable">
        <template #item="row">
            <tr>
                <td>
                    <v-checkbox
                        v-model="selectedIndicators"
                        :value="row.item"
                        class="table-checkbox"
                        hide-details
                    />
                </td>
                <td>{{ returnCurrentLocaleContent(row.item.title) }}</td>
                <td>{{ returnCurrentLocaleContent(row.item.description) }}</td>
                <td>{{ row.item.code }}</td>
                <td>
                    <generic-crud-modal
                        :form-component="IndicatorForm"
                        :form-props="{ presetIndicator: row.item }"
                        is-update
                        entity-name="Indicator"
                        :read-only="false"
                        @update="updateIndicator(row.item.id, $event)"
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
        :entity-names="selectedIndicators.map(entity => entity.code)"
        @continue="deleteSelection">
    </persistent-question-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { displayTextOrPlaceholder } from '@/utils/StringUtil';
import { getTitleFromValueAutoLocale } from '@/i18n/userType';
import type { IndicatorRequest, IndicatorResponse } from '@/models/AssessmentModel';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import IndicatorService from '@/services/assessment/IndicatorService';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import IndicatorForm from './IndicatorForm.vue';
import PersistentQuestionDialog from '@/components/core/comparators/PersistentQuestionDialog.vue';


export default defineComponent({
    name: "IndicatorTableComponent",
    components: { GenericCrudModal, PersistentQuestionDialog },
    props: {
        indicators: {
            type: Array<IndicatorResponse>,
            required: true
        }, 
        totalIndicators: {
            type: Number,
            required: true
        }},
    emits: ["switchPage"],
    setup(_, {emit}) {
        const selectedIndicators = ref<IndicatorResponse[]>([]);
        const notifications = ref<Map<string, string>>(new Map());

        const i18n = useI18n();

        const snackbar = ref(false);
        const snackbarText = ref("");
        const timeout = 5000;

        const titleLabel = computed(() => i18n.t("titleLabel"));
        const descriptionLabel = computed(() => i18n.t("descriptionLabel"));
        const codeLabel = computed(() => i18n.t("codeLabel"));
        const actionLabel = computed(() => i18n.t("actionLabel"));

        const tableOptions = ref<any>({initialCustomConfiguration: true, page: 1, itemsPerPage: 25, sortBy:[{key: "title.content", order: "asc"}]});

        const headers = [
          { title: titleLabel, align: "start", sortable: true, key: "title.content"},
          { title: descriptionLabel, align: "start", sortable: false, key: "description.content"},
          { title: codeLabel, align: "start", sortable: true, key: "code"},
          { title: actionLabel},
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
            Promise.all(selectedIndicators.value.map((indicator: IndicatorResponse) => {
                return IndicatorService.deleteIndicator(indicator.id as number)
                    .then(() => {
                        addNotification(i18n.t("deleteSuccessNotification", { name: returnCurrentLocaleContent(indicator.title) }));
                    })
                    .catch(() => {
                        addNotification(i18n.t("deleteFailedNotification", { name: returnCurrentLocaleContent(indicator.title) }));
                        return indicator;
                    });
            })).then((failedDeletions) => {
                selectedIndicators.value = selectedIndicators.value.filter((indicator) => failedDeletions.includes(indicator));
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

        const createNewIndicator = (indicator: IndicatorRequest) => {
            IndicatorService.createIndicator(indicator).then(() => {
                emit("switchPage", tableOptions.value.page - 1, tableOptions.value.itemsPerPage, tableOptions.value.sortBy[0].key, tableOptions.value.sortBy[0].order);
            });
        };

        const updateIndicator = (indicatorId: number, indicator: IndicatorRequest) => {
            IndicatorService.updateIndicator(indicatorId, indicator).then(() => {
                addNotification(i18n.t("updatedSuccessMessage"));
                emit("switchPage", tableOptions.value.page - 1, tableOptions.value.itemsPerPage, tableOptions.value.sortBy[0].key, tableOptions.value.sortBy[0].order);
            });
        };

        const displayPersistentDialog = ref(false);
        const startDeletionProcess = () => {
            displayPersistentDialog.value = true;
        };
        
        return {
            headers, snackbar, snackbarText, timeout, refreshTable,
            tableOptions, deleteSelection, displayTextOrPlaceholder,
            getTitleFromValueAutoLocale, returnCurrentLocaleContent,
            selectedIndicators, notifications, createNewIndicator,
            updateIndicator, IndicatorForm, displayPersistentDialog,
            startDeletionProcess
        };
    }
});
</script>
