<template>
    <v-btn
        density="compact" 
        class="bottom-spacer"
        :disabled="selectedIdentifiers.length === 0"
        @click="startDeletionProcess">
        {{ $t("deleteLabel") }}
    </v-btn>
    <generic-crud-modal
        :form-component="IdentifierForm"
        :form-props="{ presetIdentifier: undefined }"
        entity-name="Identifier"
        :read-only="false"
        @create="createNewIdentifier"
    />

    <v-data-table-server
        v-model="selectedIdentifiers"
        :sort-by="tableOptions.sortBy"
        :items="identifiers"
        :headers="headers"
        :items-length="totalIdentifiers"
        :items-per-page-text="$t('itemsPerPageLabel')"
        :items-per-page-options="[50, 100]"
        :items-per-page="50"
        show-select
        return-object
        @update:options="refreshTable">
        <template #item="row">
            <tr>
                <td>
                    <v-checkbox
                        v-model="selectedIdentifiers"
                        :value="row.item"
                        class="table-checkbox"
                        hide-details
                    />
                </td>
                <td>{{ returnCurrentLocaleContent(row.item.title) }}</td>
                <td>{{ returnCurrentLocaleContent(row.item.description) }}</td>
                <td>{{ row.item.code }}</td>
                <td>{{ row.item.regularExpression }}</td>
                <td>{{ row.item.uriPrefix }}</td>
                <td>
                    <generic-crud-modal
                        :form-component="IdentifierForm"
                        :form-props="{ presetIdentifier: row.item }"
                        is-update
                        entity-name="Identifier"
                        :read-only="false"
                        @update="updateIdentifier(row.item.id, $event)"
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
        :entity-names="selectedIdentifiers.map(entity => entity.code)"
        @continue="deleteSelection">
    </persistent-question-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { displayTextOrPlaceholder } from '@/utils/StringUtil';
import { getTitleFromValueAutoLocale } from '@/i18n/userType';
import type { Identifier, IdentifierResponse } from '@/models/IdentifierModel';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import IdentifierService from '@/services/IdentifierService';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import IdentifierForm from './IdentifierForm.vue';
import PersistentQuestionDialog from '@/components/core/comparators/PersistentQuestionDialog.vue';


export default defineComponent({
    name: "IdentifierTableComponent",
    components: { GenericCrudModal, PersistentQuestionDialog },
    props: {
        identifiers: {
            type: Array<IdentifierResponse>,
            required: true
        }, 
        totalIdentifiers: {
            type: Number,
            required: true
        }},
    emits: ["switchPage"],
    setup(_, {emit}) {
        const selectedIdentifiers = ref<IdentifierResponse[]>([]);
        const notifications = ref<Map<string, string>>(new Map());

        const i18n = useI18n();

        const snackbar = ref(false);
        const snackbarText = ref("");
        const timeout = 5000;

        const titleLabel = computed(() => i18n.t("titleLabel"));
        const descriptionLabel = computed(() => i18n.t("descriptionLabel"));
        const codeLabel = computed(() => i18n.t("codeLabel"));
        const regularExpressionLabel = computed(() => i18n.t("regularExpressionLabel"));
        const uriPrefixLabel = computed(() => i18n.t("uriPrefixLabel"));
        const actionLabel = computed(() => i18n.t("actionLabel"));

        const tableOptions = ref<any>({
            initialCustomConfiguration: true, page: 1, itemsPerPage: 50, sortBy:[{key: "title.content", order: "asc"}]
        });

        const headers = [
          { title: titleLabel, align: "start", sortable: true, key: "title.content"},
          { title: descriptionLabel, align: "start", sortable: false, key: "description.content"},
          { title: codeLabel, align: "start", sortable: true, key: "code"},
          { title: regularExpressionLabel, align: "start", sortable: true, key: "regularExpression"},
          { title: uriPrefixLabel, align: "start", sortable: true, key: "uriPrefix"},
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
            Promise.all(selectedIdentifiers.value.map((identifier: IdentifierResponse) => {
                return IdentifierService.deleteIdentifier(identifier.id as number)
                    .then(() => {
                        addNotification(i18n.t("deleteSuccessNotification", { name: returnCurrentLocaleContent(identifier.title) }));
                    })
                    .catch(() => {
                        addNotification(i18n.t("deleteFailedNotification", { name: returnCurrentLocaleContent(identifier.title) }));
                        return identifier;
                    });
            })).then((failedDeletions) => {
                selectedIdentifiers.value = 
                    selectedIdentifiers.value.filter((identifier) => failedDeletions.includes(identifier));
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

        const createNewIdentifier = (identifier: Identifier) => {
            IdentifierService.createIdentifier(identifier).then(() => {
                emit("switchPage",
                    tableOptions.value.page - 1,
                    tableOptions.value.itemsPerPage,
                    tableOptions.value.sortBy[0].key,
                    tableOptions.value.sortBy[0].order
                );
            });
        };

        const updateIdentifier = (identifierId: number, identifier: Identifier) => {
            IdentifierService.updateIdentifier(identifierId, identifier).then(() => {
                addNotification(i18n.t("updatedSuccessMessage"));
                emit("switchPage",
                    tableOptions.value.page - 1,
                    tableOptions.value.itemsPerPage,
                    tableOptions.value.sortBy[0].key,
                    tableOptions.value.sortBy[0].order
                );
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
            selectedIdentifiers, notifications, createNewIdentifier,
            updateIdentifier, IdentifierForm, displayPersistentDialog,
            startDeletionProcess
        };
    }
});
</script>
