<template>
    <v-btn
        density="compact" class="bottom-spacer" :disabled="selectedClassifications.length === 0"
        @click="deleteSelection">
        {{ $t("deleteLabel") }}
    </v-btn>
    <generic-crud-modal
        :form-component="AssessmentClassificationForm"
        :form-props="{ presetClassification: undefined }"
        entity-name="Classification"
        :read-only="false"
        @create="createNewClassification"
    />

    <v-data-table-server
        v-model="selectedClassifications"
        :sort-by="tableOptions.sortBy"
        :items="classifications"
        :headers="headers"
        :items-length="totalClassifications"
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
                        v-model="selectedClassifications"
                        :value="row.item"
                        class="table-checkbox"
                        hide-details
                    />
                </td>
                <td>{{ returnCurrentLocaleContent(row.item.title) }}</td>
                <td>{{ row.item.code }}</td>
                <td>{{ row.item.formalDescriptionOfRule }}</td>
                <td>
                    <generic-crud-modal
                        :form-component="AssessmentClassificationForm"
                        :form-props="{ presetClassification: row.item }"
                        is-update
                        entity-name=""
                        :read-only="false"
                        @update="updateClassification(row.item.id as number, $event)"
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
import type { AssessmentClassification } from '@/models/AssessmentModel';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import AssessmentClassificationService from '@/services/assessment/AssessmentClassificationService';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import AssessmentClassificationForm from './AssessmentClassificationForm.vue';


export default defineComponent({
    name: "AssessmentClassificationTableComponent",
    components: { GenericCrudModal },
    props: {
        classifications: {
            type: Array<AssessmentClassification>,
            required: true
        }, 
        totalClassifications: {
            type: Number,
            required: true
        }},
    emits: ["switchPage"],
    setup(_, {emit}) {
        const selectedClassifications = ref<AssessmentClassification[]>([]);
        const notifications = ref<Map<string, string>>(new Map());

        const i18n = useI18n();

        const snackbar = ref(false);
        const snackbarText = ref("");
        const timeout = 5000;

        const titleLabel = computed(() => i18n.t("titleLabel"));
        const ruleLabel = computed(() => i18n.t("formalDescriptionOfRuleLabel"));
        const codeLabel = computed(() => i18n.t("codeLabel"));
        const actionLabel = computed(() => i18n.t("actionLabel"));

        const tableOptions = ref<any>({initialCustomConfiguration: true, page: 1, itemsPerPage: 25, sortBy:[{key: "title", order: "asc"}]});

        const headers = [
          { title: titleLabel, align: "start", sortable: true, key: "title.content"},
          { title: codeLabel, align: "start", sortable: true, key: "code"},
          { title: ruleLabel, align: "start", sortable: true, key: "formalDescriptionOfRule"},
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
            Promise.all(selectedClassifications.value.map((classification: AssessmentClassification) => {
                return AssessmentClassificationService.deleteAssessmentClassification(classification.id as number)
                    .then(() => {
                        addNotification(i18n.t("deleteSuccessNotification", { name: returnCurrentLocaleContent(classification.title) }));
                    })
                    .catch(() => {
                        addNotification(i18n.t("deleteFailedNotification", { name: returnCurrentLocaleContent(classification.title) }));
                        return classification;
                    });
            })).then((failedDeletions) => {
                selectedClassifications.value = selectedClassifications.value.filter((classification) => failedDeletions.includes(classification));
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

        const createNewClassification = (classification: AssessmentClassification) => {
            AssessmentClassificationService.createAssessmentClassification(classification).then(() => {
                emit("switchPage", tableOptions.value.page - 1, tableOptions.value.itemsPerPage, tableOptions.value.sortBy[0].key, tableOptions.value.sortBy[0].order);
            });
        };

        const updateClassification = (classificationId: number, classification: AssessmentClassification) => {
            AssessmentClassificationService.updateAssessmentClassification(classificationId, classification).then(() => {
                addNotification(i18n.t("updatedSuccessMessage"));
                emit("switchPage", tableOptions.value.page - 1, tableOptions.value.itemsPerPage, tableOptions.value.sortBy[0].key, tableOptions.value.sortBy[0].order);
            });
        };

        return {headers, snackbar, snackbarText, timeout, refreshTable,
            tableOptions, deleteSelection, displayTextOrPlaceholder,
            getTitleFromValueAutoLocale, returnCurrentLocaleContent,
            selectedClassifications, notifications, createNewClassification,
            updateClassification, AssessmentClassificationForm
        };
    }
});
</script>
