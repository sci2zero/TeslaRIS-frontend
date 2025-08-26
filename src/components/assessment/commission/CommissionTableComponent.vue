<template>
    <v-btn
        density="compact" class="bottom-spacer" :disabled="selectedCommissions.length === 0"
        @click="deleteSelection">
        {{ $t("deleteLabel") }}
    </v-btn>
    <generic-crud-modal
        :form-component="CommissionForm"
        :form-props="{ presetCommission: undefined }"
        entity-name="Commission"
        :read-only="false"
        @create="createNewCommission"
    />

    <v-data-table-server
        v-model="selectedCommissions"
        :sort-by="tableOptions.sortBy"
        :items="commissions"
        :headers="headers"
        :items-length="totalCommissions"
        :items-per-page-text="$t('itemsPerPageLabel')"
        :items-per-page-options="[5, 10, 25, 50]"
        show-select
        return-object
        @update:options="refreshTable">
        <template #item="row">
            <tr>
                <td>
                    <v-checkbox
                        v-model="selectedCommissions"
                        :value="row.item"
                        class="table-checkbox"
                        hide-details
                    />
                </td>
                <td>
                    <localized-link :to="'assessment/commissions/' + row.item.id">
                        {{ returnCurrentLocaleContent(row.item.description) }}
                    </localized-link>
                </td>
                <td>{{ displayTextOrPlaceholder(localiseDate(row.item.assessmentDateFrom)) }}</td>
                <td>{{ displayTextOrPlaceholder(localiseDate(row.item.assessmentDateTo)) }}</td>
                <td>
                    {{ row.item.formalDescriptionOfRule }}
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
import { getTitleFromValueAutoLocale } from '@/i18n/userType';
import type { Commission, CommissionResponse } from '@/models/AssessmentModel';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import CommissionService from '@/services/assessment/CommissionService';
import { localiseDate } from '@/utils/DateUtil';
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import CommissionForm from './CommissionForm.vue';


export default defineComponent({
    name: "CommissionTableComponent",
    components: { LocalizedLink, GenericCrudModal },
    props: {
        commissions: {
            type: Array<CommissionResponse>,
            required: true
        }, 
        totalCommissions: {
            type: Number,
            required: true
        }},
    emits: ["switchPage"],
    setup(_, {emit}) {
        const selectedCommissions = ref<CommissionResponse[]>([]);
        const notifications = ref<Map<string, string>>(new Map());

        const i18n = useI18n();

        const snackbar = ref(false);
        const snackbarText = ref("");
        const timeout = 5000;

        const descriptionLabel = computed(() => i18n.t("descriptionLabel"));
        const dateFromLabel = computed(() => i18n.t("startDateLabel"));
        const dateToLabel = computed(() => i18n.t("endDateLabel"));
        const formalDescriptionOfRuleLabel = computed(() => i18n.t("classificationRuleLabel"));

        const tableOptions = ref<any>({initialCustomConfiguration: true, page: 1, itemsPerPage: 10, sortBy:[{key: "description", order: "asc"}]});

        const headers = [
          { title: descriptionLabel, align: "start", sortable: true, key: "description.content"},
          { title: dateFromLabel, align: "start", sortable: true, key: "assessmentDateFrom"},
          { title: dateToLabel, align: "start", sortable: true, key: "assessmentDateTo"},
          { title: formalDescriptionOfRuleLabel, align: "start", sortable: true, key: "formalDescriptionOfRule"}
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
            Promise.all(selectedCommissions.value.map((commission: CommissionResponse) => {
                return CommissionService.deleteCommission(commission.id as number)
                    .then(() => {
                        addNotification(i18n.t("deleteSuccessNotification", { name: returnCurrentLocaleContent(commission.description) }));
                    })
                    .catch(() => {
                        addNotification(i18n.t("deleteFailedNotification", { name: returnCurrentLocaleContent(commission.description) }));
                        return commission;
                    });
            })).then((failedDeletions) => {
                selectedCommissions.value = selectedCommissions.value.filter((commission) => failedDeletions.includes(commission));
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

        const createNewCommission = (newCommission: Commission) => {
            CommissionService.createCommission(newCommission).then(() => {
                refreshTable(tableOptions.value);
            });
        };

        return {headers, snackbar, snackbarText, timeout, refreshTable,
            tableOptions, deleteSelection, displayTextOrPlaceholder,
            getTitleFromValueAutoLocale, returnCurrentLocaleContent,
            selectedCommissions, notifications, localiseDate,
            CommissionForm, createNewCommission
        };
    }
});
</script>
