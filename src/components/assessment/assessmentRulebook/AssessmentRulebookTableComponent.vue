<template>
    <v-btn
        density="compact" class="bottom-spacer" :disabled="selectedAssessmentRulebooks.length === 0"
        @click="deleteSelection">
        {{ $t("deleteLabel") }}
    </v-btn>
    <generic-assessment-modal
        :form-component="AssessmentRulebookForm"
        :form-props="{ presetAssessmentRulebook: undefined }"
        @create="createNewAssessmentRulebook"
    />

    <v-data-table-server
        v-model="selectedAssessmentRulebooks"
        :sort-by="tableOptions.sortBy"
        :items="assessmentRulebooks"
        :headers="headers"
        :items-length="totalAssessmentRulebooks"
        :items-per-page-text="$t('itemsPerPageLabel')"
        :items-per-page-options="[5, 10, 25, 50]"
        show-select
        return-object
        @update:options="refreshTable">
        <template #item="row">
            <tr>
                <td>
                    <v-checkbox
                        v-model="selectedAssessmentRulebooks"
                        :value="row.item"
                        class="table-checkbox"
                        hide-details
                    />
                </td>
                <td>
                    <localized-link :to="'assessment/assessment-rulebooks/' + row.item.id">
                        {{ returnCurrentLocaleContent(row.item.name) }}
                    </localized-link>
                </td>
                <td>{{ displayTextOrPlaceholder(returnCurrentLocaleContent(row.item.description) as string) }}</td>
                <td>{{ localiseDate(row.item.issueDate) }}</td>
                <td>
                    <localized-link v-if="row.item.publisherId" :to="'publishers/' + row.item.publisherId">
                        {{ returnCurrentLocaleContent(row.item.publisherName) }}
                    </localized-link>
                    <p v-else>
                        -
                    </p>
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
import type { AssessmentRulebook, AssessmentRulebookResponse } from '@/models/AssessmentModel';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import AssessmentRulebookService from '@/services/assessment/AssessmentRulebookService';
import { localiseDate } from '@/i18n/dateLocalisation';
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import GenericAssessmentModal from '../GenericAssessmentModal.vue';
import AssessmentRulebookForm from './AssessmentRulebookForm.vue';


export default defineComponent({
    name: "AssessmentRulebookTableComponent",
    components: { LocalizedLink, GenericAssessmentModal },
    props: {
        assessmentRulebooks: {
            type: Array<AssessmentRulebookResponse>,
            required: true
        }, 
        totalAssessmentRulebooks: {
            type: Number,
            required: true
        }},
    emits: ["switchPage"],
    setup(_, {emit}) {
        const selectedAssessmentRulebooks = ref<AssessmentRulebookResponse[]>([]);
        const notifications = ref<Map<string, string>>(new Map());

        const i18n = useI18n();

        const snackbar = ref(false);
        const snackbarText = ref("");
        const timeout = 5000;

        const nameLabel = computed(() => i18n.t("nameLabel"));
        const descriptionLabel = computed(() => i18n.t("descriptionLabel"));
        const dateLabel = computed(() => i18n.t("issueDateLabel"));
        const publisherLabel = computed(() => i18n.t("publisherLabel"));

        const tableOptions = ref<any>({initialCustomConfiguration: true, page: 1, itemsPerPage: 10, sortBy:[{key: "name", order: "asc"}]});

        const headers = [
          { title: nameLabel, align: "start", sortable: true, key: "name"},
          { title: descriptionLabel, align: "start", sortable: true, key: "description"},
          { title: dateLabel, align: "start", sortable: true, key: "code"},
          { title: publisherLabel, align: "start", sortable: false}
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
            Promise.all(selectedAssessmentRulebooks.value.map((assessmentRulebook: AssessmentRulebookResponse) => {
                return AssessmentRulebookService.deleteAssessmentRulebook(assessmentRulebook.id as number)
                    .then(() => {
                        addNotification(i18n.t("deleteSuccessNotification", { name: returnCurrentLocaleContent(assessmentRulebook.name) }));
                    })
                    .catch(() => {
                        addNotification(i18n.t("deleteFailedNotification", { name: returnCurrentLocaleContent(assessmentRulebook.name) }));
                        return assessmentRulebook;
                    });
            })).then((failedDeletions) => {
                selectedAssessmentRulebooks.value = selectedAssessmentRulebooks.value.filter((assessmentRulebook) => failedDeletions.includes(assessmentRulebook));
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

        const createNewAssessmentRulebook = (assessmentRulebook: AssessmentRulebook) => {
            AssessmentRulebookService.createAssessmentRulebook(assessmentRulebook).then(() => {
                emit("switchPage", tableOptions.value.page - 1, tableOptions.value.itemsPerPage, tableOptions.value.sortBy[0].key, tableOptions.value.sortBy[0].order);
            });
        };

        const updateAssessmentRulebook = (assessmentRulebookId: number, assessmentRulebook: AssessmentRulebook) => {
            AssessmentRulebookService.updateAssessmentRulebook(assessmentRulebookId, assessmentRulebook).then(() => {
                addNotification(i18n.t("updatedSuccessMessage"));
                emit("switchPage", tableOptions.value.page - 1, tableOptions.value.itemsPerPage, tableOptions.value.sortBy[0].key, tableOptions.value.sortBy[0].order);
            });
        };

        return {headers, snackbar, snackbarText, timeout, refreshTable,
            tableOptions, deleteSelection, displayTextOrPlaceholder,
            getTitleFromValueAutoLocale, returnCurrentLocaleContent,
            selectedAssessmentRulebooks, notifications, createNewAssessmentRulebook,
            updateAssessmentRulebook, localiseDate, AssessmentRulebookForm
        };
    }
});
</script>
