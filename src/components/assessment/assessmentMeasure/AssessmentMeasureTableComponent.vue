<template>
    <v-btn
        density="compact" class="bottom-spacer" :disabled="selectedAssessmentMeasures.length === 0"
        @click="deleteSelection">
        {{ $t("deleteLabel") }}
    </v-btn>
    <generic-crud-modal
        :form-component="AssessmentMeasureForm"
        :form-props="{ presetAssessmentMeasure: undefined }"
        entity-name="AssessmentMeasure"
        :read-only="false"
        @create="createNewAssessmentMeasure"
    />

    <v-data-table-server
        v-model="selectedAssessmentMeasures"
        :sort-by="tableOptions.sortBy"
        :items="assessmentMeasures"
        :headers="headers"
        :items-length="totalAssessmentMeasures"
        :items-per-page-text="$t('itemsPerPageLabel')"
        :items-per-page-options="[5, 10, 25, 50]"
        show-select
        return-object
        @update:options="refreshTable">
        <template #item="row">
            <tr>
                <td>
                    <v-checkbox
                        v-model="selectedAssessmentMeasures"
                        :value="row.item"
                        class="table-checkbox"
                        hide-details
                    />
                </td>
                <td>
                    {{ returnCurrentLocaleContent(row.item.title) }}
                </td>
                <td>{{ row.item.code }}</td>
                <td>{{ row.item.pointRule }}</td>
                <td>
                    {{ row.item.scalingRule }}
                </td>
                <td>
                    <generic-crud-modal
                        class="mt-5"
                        :form-component="AssessmentMeasureForm"
                        :form-props="{ presetAssessmentMeasure: row.item }"
                        is-update
                        entity-name="AssessmentMeasure"
                        :read-only="false"
                        @update="updateAssessmentMeasure(row.item.id as number, $event)"
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
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { displayTextOrPlaceholder } from '@/utils/StringUtil';
import { getTitleFromValueAutoLocale } from '@/i18n/userTypes';
import type { AssessmentMeasure } from '@/models/AssessmentModel';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import AssessmentMeasureService from '@/services/assessment/AssessmentMeasureService';
import { localiseDate } from '@/i18n/dateLocalisation';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import AssessmentMeasureForm from './AssessmentMeasureForm.vue';


export default defineComponent({
    name: "AssessmentMeasureTableComponent",
    components: { GenericCrudModal },
    props: {
        assessmentMeasures: {
            type: Array<AssessmentMeasure>,
            required: true
        }, 
        totalAssessmentMeasures: {
            type: Number,
            required: true
        }},
    emits: ["switchPage", "create", "update"],
    setup(_, {emit}) {
        const selectedAssessmentMeasures = ref<AssessmentMeasure[]>([]);
        const notifications = ref<Map<string, string>>(new Map());

        const i18n = useI18n();

        const snackbar = ref(false);
        const snackbarText = ref("");
        const timeout = 5000;

        const titleLabel = computed(() => i18n.t("titleLabel"));
        const codeLabel = computed(() => i18n.t("codeLabel"));
        const pointRuleLabel = computed(() => i18n.t("pointRuleLabel"));
        const scalingRuleLabel = computed(() => i18n.t("scalingRuleLabel"));
        const actionLabel = computed(() => i18n.t("actionLabel"));

        const tableOptions = ref<any>({initialCustomConfiguration: true, page: 1, itemsPerPage: 10, sortBy:[{key: "code", order: "asc"}]});

        const headers = [
          { title: titleLabel, align: "start", sortable: false},
          { title: codeLabel, align: "start", sortable: true, key: "code"},
          { title: pointRuleLabel, align: "start", sortable: true, key: "value"},
          { title: scalingRuleLabel, align: "start", sortable: true, key: "rule"},
          { title: actionLabel, align: "start", sortable: false}
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
            Promise.all(selectedAssessmentMeasures.value.map((assessmentMeasure: AssessmentMeasure) => {
                return AssessmentMeasureService.deleteAssessmentMeasure(assessmentMeasure.id as number)
                    .then(() => {
                        addNotification(i18n.t("deleteSuccessNotification", { name: returnCurrentLocaleContent(assessmentMeasure.title) }));
                    })
                    .catch(() => {
                        addNotification(i18n.t("deleteFailedNotification", { name: returnCurrentLocaleContent(assessmentMeasure.title) }));
                        return assessmentMeasure;
                    });
            })).then((failedDeletions) => {
                selectedAssessmentMeasures.value = selectedAssessmentMeasures.value.filter((assessmentMeasure) => failedDeletions.includes(assessmentMeasure));
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

        const createNewAssessmentMeasure = (assessmentMeasure: AssessmentMeasure) => {
            emit("create", assessmentMeasure);
        };

        const updateAssessmentMeasure = (assessmentMeasureId: number, assessmentMeasure: AssessmentMeasure) => {
            AssessmentMeasureService.updateAssessmentMeasure(assessmentMeasureId, assessmentMeasure).then(() => {
                addNotification(i18n.t("updatedSuccessMessage"));
                assessmentMeasure.id = assessmentMeasureId;
                emit("update", assessmentMeasureId, assessmentMeasure);
            });
        };

        return {headers, snackbar, snackbarText, timeout, refreshTable,
            tableOptions, deleteSelection, displayTextOrPlaceholder,
            getTitleFromValueAutoLocale, returnCurrentLocaleContent,
            selectedAssessmentMeasures, notifications, createNewAssessmentMeasure,
            updateAssessmentMeasure, localiseDate, AssessmentMeasureForm
        };
    }
});
</script>
