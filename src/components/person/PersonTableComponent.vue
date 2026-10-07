<template>
    <responsive-data-table
        v-model="selectedPersons"
        :items="persons"
        :headers="headers"
        :items-length="totalPersons"
        :show-select="showSelect"
        :page="tableOptions.page"
        :items-per-page="tableOptions.itemsPerPage"
        :sort-by="tableOptions.sortBy"
        :in-comparator="inComparator"
        draggable-group="persons"
        container-class="modern-table-container"
        :table-class="selectedPersons.length > 0 ? 'modern-data-table has-selection' : 'modern-data-table'"
        @update:options="refreshTable"
        @dragged="onDropCallback"
    >
        <template v-if="$slots['top-left']" #top-left>
            <div :class="[selectedPersons.length > 0 ? 'w-64' : 'w-96']">
                <slot name="top-left" />
            </div>
        </template>
        <template #actions>
            <add-employment-modal
                v-if="employmentInstitutionId > 0 && (isAdmin || isInstitutionalEditor)"
                class="mb-4"
                :institution-id="employmentInstitutionId"
                @update="notifyUserAndRefreshTable" />
            <slot name="actions" />
        </template>
        <template #selection-menu>
            <v-list-item
                v-if="(isAdmin || allowComparison) && !isAlumniTable && !isCommissionResearchersTable"
                :disabled="selectedPersons.length <= 0"
                class="action-menu-item"
                @click="startDeletionProcess"
            >
                <template #prepend>
                    <v-icon color="error" size="18">
                        mdi-delete
                    </v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                    {{ $t("deleteLabel") }}
                </v-list-item-title>
            </v-list-item>

            <v-list-item
                v-if="(isAdmin || isCommission) && isCommissionResearchersTable"
                :disabled="selectedPersons.length <= 0"
                class="action-menu-item"
                @click="removeSelection"
            >
                <template #prepend>
                    <v-icon color="warning" size="18">
                        mdi-account-remove
                    </v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                    {{ $t("removeResearcherLabel") }}
                </v-list-item-title>
            </v-list-item>

            <v-list-item
                v-if="(isAdmin || allowComparison) && !isAlumniTable && !isCommissionResearchersTable"
                :disabled="selectedPersons.length !== 2"
                class="action-menu-item"
                @click="startPublicationComparison"
            >
                <template #prepend>
                    <v-icon color="info" size="18">
                        mdi-file-document-multiple
                    </v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                    {{ $t("compareContributionsLabel") }}
                    <span class="selection-indicator">({{ selectedPersons.length }}/2)</span>
                </v-list-item-title>
            </v-list-item>

            <v-list-item
                v-if="(isAdmin || allowComparison) && !isAlumniTable && !isCommissionResearchersTable"
                :disabled="selectedPersons.length !== 2"
                class="action-menu-item"
                @click="startMetadataComparison"
            >
                <template #prepend>
                    <v-icon color="info" size="18">
                        mdi-database-search
                    </v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                    {{ $t("compareMetadataLabel") }}
                    <span class="selection-indicator">({{ selectedPersons.length }}/2)</span>
                </v-list-item-title>
            </v-list-item>

            <v-list-item
                v-if="enableExport"
                class="action-menu-item"
                @click="openExportModal"
            >
                <template #prepend>
                    <v-icon color="success" size="18">
                        mdi-download
                    </v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                    {{ $t("exportLabel") }}
                </v-list-item-title>
            </v-list-item>
        </template>
        <template #compact-item="{ item }">
            <person-list-item
                :item="item"
                :selected-persons="selectedPersons"
                :show-select="showSelect"
                @update:selected-persons="selectedPersons = $event"
                @open="openGlance(item)"
            />
        </template>
        <template #row="{ item }">
            <person-table-row
                :item="item"
                :selected-persons="selectedPersons"
                :show-select="showSelect"
                @update:selected-persons="selectedPersons = $event"
            />
        </template>
        <template #empty>
            <div class="empty-state">
                <v-icon size="48" color="grey-lighten-1" class="mb-4">
                    mdi-database-search
                </v-icon>
                <p class="text-h6 text-grey-darken-1 mb-2">
                    {{ $t("noDataInTableMessage") }}
                </p>
                <p class="text-body-2 text-grey">
                    {{ $t("tryAdjustingFilters") }}
                </p>
            </div>
        </template>
    </responsive-data-table>

    <table-export-modal
        v-if="enableExport"
        ref="exportModal"
        :export-entity="ExportEntity.PERSON"
        :export-ids="(selectedPersons.map(person => person.databaseId) as number[])"
        :disabled="selectedPersons.length === 0"
        :potential-max-amount-requested="selectedPersons.length >= tableOptions.itemsPerPage"
        :total-results="totalPersons"
        :endpoint-type="endpointType"
        :endpoint-token-parameters="endpointTokenParameters"
        :hide-activation-button="true" />

    <person-quick-glance
        v-model="glanceOpen"
        :item="glancedPerson"
    />
    
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
        :entity-names="selectedPersons.map(entity => entity.name.split('; ')[0])"
        @continue="deleteSelection" />
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { PersonIndex } from '@/models/PersonModel';
import PersonService from '@/services/PersonService';
import InvolvementService from '@/services/InvolvementService';
import AddEmploymentModal from './involvement/AddEmploymentModal.vue';
import { useUserRole } from '@/composables/useUserRole';
import { ExportableEndpointType, ExportEntity } from '@/models/Common';
import TableExportModal from '../core/TableExportModal.vue';
import { isEqual } from 'lodash';
import PersistentQuestionDialog from '../core/comparators/PersistentQuestionDialog.vue';
import { useRouter } from 'vue-router';
import ResponsiveDataTable from '../core/ResponsiveDataTable.vue';
import PersonTableRow from './PersonTableRow.vue';
import PersonListItem from './PersonListItem.vue';
import PersonQuickGlance from './PersonQuickGlance.vue';


export default defineComponent({
    name: "PersonTableComponent",
    components: { ResponsiveDataTable, AddEmploymentModal, TableExportModal, PersistentQuestionDialog, PersonTableRow, PersonListItem, PersonQuickGlance },
    props: {
        persons: {
            type: Array<PersonIndex>,
            required: true
        }, 
        totalPersons: {
            type: Number,
            required: true
        },
        inComparator: {
            type: Boolean,
            default: false
        },
        employmentInstitutionId: {
            type: Number,
            default: -1
        },
        isAlumniTable: {
            type: Boolean,
            default: false
        },
        isCommissionResearchersTable: {
            type: Boolean,
            default: false
        },
        enableExport: {
            type: Boolean,
            default: false
        },
        endpointType: {
            type: Object as PropType<ExportableEndpointType | undefined>,
            default: undefined
        },
        endpointTokenParameters: {
            type: Array<string>,
            default: []
        },
        allowComparison: {
            type: Boolean,
            default: false
        }
    },
    emits: ["switchPage", "dragged", "delete"],
    setup(props, {emit}) {
        const selectedPersons = ref<PersonIndex[]>([]);
        const glanceOpen = ref(false);
        const glancedPerson = ref<PersonIndex | null>(null);

        const i18n = useI18n();
        const router = useRouter();

        const notifications = ref<Map<string, string>>(new Map());

        const fullNameLabel = computed(() => i18n.t("fullNameLabel"));
        const organisationUnitLabel = computed(() => i18n.t("organisationUnitLabel"));
        // const birthdateLabel = computed(() => i18n.t("birthdateLabel"));
        const identifiers = computed(() => i18n.t("identifiersLabel"));

        const { isAdmin, isInstitutionalEditor, isCommission, isUserLoggedIn } = useUserRole();

        const showSelect = computed(() => isAdmin.value || props.enableExport);

        const employmentColumn = computed(() => i18n.t("employmentColumn"));

        const tableOptions = ref<any>({initialCustomConfiguration: true, page: 1, itemsPerPage: 10, sortBy:[{key: "name",  order: "asc"}]});

        const headers = ref<any>([
          { title: fullNameLabel, align: "start", sortable: true, key: "name"},
          { title: organisationUnitLabel, align: "start", sortable: true, key: employmentColumn},
          { title: identifiers, align: "start", sortable: true, key: "orcid"},
        ]);

        const headersSortableMappings: Map<string, string> = new Map([
            ["name", "name_sortable"],
            ["employmentsSr", "employments_sr_sortable"],
            ["employmentsOther", "employments_other_sortable"],
            ["birthdate", "birthdate_sortable"],
            ["orcid", "orcid"],
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
            Promise.all(selectedPersons.value.map((person: PersonIndex) => {
                if (props.employmentInstitutionId > 0) {
                    return InvolvementService.terminateEmployment(person.databaseId, props.employmentInstitutionId)
                        .then(() => {
                            addNotification(i18n.t("terminationSuccessNotification", { name: person.name }));
                        })
                        .catch(() => {
                            addNotification(i18n.t("terminationFailedNotification", { name: person.name }));
                            return person;
                        });
                } else {
                    return PersonService.deleteResearcher(person.databaseId)
                        .then(() => {
                            addNotification(i18n.t("deleteSuccessNotification", { name: person.name }));
                        })
                        .catch(() => {
                            addNotification(i18n.t("deleteFailedNotification", { name: person.name }));
                            return person;
                        });
                }
            })).then((failedDeletions) => {
                selectedPersons.value = selectedPersons.value.filter((person) => failedDeletions.includes(person));
                refreshTable(tableOptions.value);
                if (props.employmentInstitutionId > 0) {
                    emit("delete");
                }
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

        const startPublicationComparison = () => {
            router.push({name: "personPublicationsComparator", params: {
                leftId: selectedPersons.value[0].databaseId, rightId: selectedPersons.value[1].databaseId
            }});
        };

        const startMetadataComparison = () => {
            router.push({name: "personMetadataComparator", params: {
                leftId: selectedPersons.value[0].databaseId, rightId: selectedPersons.value[1].databaseId
            }});
        };

        const onDropCallback = (event: any) => {
            emit("dragged", event);
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

        const notifyUserAndRefreshTable = (success: boolean) => {
            if (success) {
                addNotification(i18n.t("savedMessage"));
            } else {
                addNotification(i18n.t("genericErrorMessage"));
            }

            refreshTable(tableOptions.value);
        };

        const removeSelection = () => {
            emit("delete", selectedPersons.value.map(person => person.databaseId));
        };

        const exportModal = ref<any>(null);

        const openExportModal = () => {
            if (exportModal.value) {
                exportModal.value.openModal();
            }
        };

        const displayPersistentDialog = ref(false);
        const startDeletionProcess = () => {
            displayPersistentDialog.value = true;
        };

        const openGlance = (item: PersonIndex) => {
            glancedPerson.value = item;
            glanceOpen.value = true;
        };

        return {
            selectedPersons, headers, notifications, isUserLoggedIn,
            refreshTable, isAdmin, deleteSelection, ExportEntity,
            tableOptions, isInstitutionalEditor,
            startPublicationComparison, isCommission,
            startMetadataComparison, onDropCallback, removeSelection,
            setSortAndPageOption, notifyUserAndRefreshTable,
            openExportModal, exportModal,
            startDeletionProcess, displayPersistentDialog,
            showSelect, glanceOpen, glancedPerson, openGlance
        };
    }
});
</script>

<style scoped>

    /* Action Menu Styling */
    .action-menu-container {
        display: flex;
        justify-content: flex-start;
    }

    .action-menu-trigger {
        /* text-transform: none; */
        /* font-weight: 500; */
        /* letter-spacing: 0.5px; */
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);
    }

    .action-menu-list {
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        border: 1px solid rgba(0, 0, 0, 0.08);
    }

    .action-menu-item {
        border-radius: 6px;
        margin: 2px 4px;
        transition: all 0.2s ease;
    }

    .action-menu-item:hover {
        background-color: rgba(25, 118, 210, 0.08);
    }

    .selection-indicator {
        font-size: 0.75rem;
        color: #666;
        font-weight: 500;
        margin-left: 4px;
    }

    :deep(.modern-table-container) {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        overflow: hidden;
        border: 1px solid rgba(0, 0, 0, 0.06);
    }

    :deep(.modern-data-table) {
        background: transparent;
    }

    :deep(.modern-data-table .v-data-table__wrapper) {
        border-radius: 12px;
    }

    :deep(.modern-data-table .v-table) {
        background: transparent;
    }

    :deep(.modern-data-table .v-table__wrapper) {
        border-radius: 12px;
    }

    :deep(.modern-data-table .v-data-table-header) {
        background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
        border-bottom: 2px solid rgba(25, 118, 210, 0.1);
    }

    :deep(.modern-data-table .v-data-table-header th) {
        font-weight: 600;
        color: #424242;
        font-size: 0.9rem;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        padding: 16px 12px;
        border-bottom: 2px solid rgba(25, 118, 210, 0.1);
    }

    :deep(.modern-data-table .v-data-table-header .v-checkbox) {
        margin: 0;
    }

    /* Checkbox Column */
    .checkbox-column {
        padding-left: 12px;
        padding-right: 12px;
        width: 48px;
    }

    .table-checkbox :deep(.v-selection-control__input) {
        margin: 0;
    }

    /* Person Info */
    .person-info {
        display: flex;
        flex-direction: column;
    }

    .person-name-section {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .person-name {
        font-weight: 600;
        color: #424242;
        text-decoration: none;
        font-size: 1rem;
        transition: all 0.2s ease;
    }

    .person-name:hover {
        color: #1976d2;
        text-decoration: underline;
    }

    .person-year {
        font-size: 0.85rem;
        color: #666;
        font-weight: 400;
        margin-top: 0.15rem;
    }

    .employment-item {
        display: flex;
        flex-direction: column;
    }

    .employment-entry {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.85rem;
        color: #666;
        padding: 2px 0;
    }

    .employment-icon {
        color: #999;
        flex-shrink: 0;
    }

    .employment-link {
        color: #666;
        text-decoration: none;
        font-size: 0.85rem;
        transition: all 0.2s ease;
    }

    .employment-link:hover {
        color: #1976d2;
        text-decoration: underline;
    }

    .employment-text {
        color: #666;
        font-size: 0.85rem;
    }

    /* Date Cell */
    .date-cell {
        display: flex;
        align-items: center;
        color: #666;
    }

    /* Identifiers Cell */
    .identifiers-cell {
        display: flex;
        align-items: center;
    }

    .no-identifiers {
        display: flex;
        align-items: center;
        color: #999;
    }

    /* Empty State */
    .empty-state-row {
        background: transparent;
    }

    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 48px 24px;
    }

    /* Selection State */
    :deep(.modern-data-table.has-selection .v-data-table-header) {
        background: linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 100%);
        border-bottom: 2px solid rgba(25, 118, 210, 0.2);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
        .person-name-section {
            gap: 8px;
        }

        .action-menu-trigger {
            font-size: 0.8rem;
            padding: 8px 12px;
        }
    }

.orcid-icon-link {
    display: inline-flex;
    align-items: center;
    text-decoration: none;
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    transition: all 0.2s ease;
}

.orcid-icon-link:hover {
    opacity: 0.8;
    transform: scale(1.05);
}

.orcid-icon {
    pointer-events: none;
}

/* ORCID Menu Styling */
.orcid-menu-card {
    min-width: 280px;
    max-width: 320px;
    border-radius: 12px !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
    border: 1px solid rgba(166, 206, 57, 0.2);
    background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
}

.orcid-menu-title {
    background: linear-gradient(135deg, #A6CE39 0%, #8BC34A 100%);
    color: white !important;
    font-weight: 600;
    font-size: 0.9rem;
    padding: 12px 16px;
    border-radius: 12px 12px 0 0;
    display: flex;
    align-items: center;
    gap: 8px;
}

.orcid-menu-icon {
    color: white !important;
    font-size: 1.1rem;
}

.orcid-menu-content {
    padding: 16px !important;
    background: white;
}

.orcid-id-display {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.orcid-label {
    font-size: 0.8rem;
    font-weight: 500;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.orcid-code {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.85rem;
    background: #f5f5f5;
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid #e0e0e0;
    color: #333;
    word-break: break-all;
    line-height: 1.4;
}

.orcid-menu-actions {
    padding: 8px 16px 16px 16px !important;
    background: #fafafa;
    border-radius: 0 0 12px 12px;
    gap: 8px;
    justify-content: space-between;
}

.orcid-copy-btn {
    color: #A6CE39 !important;
    font-weight: 500;
    font-size: 0.8rem;
    text-transform: none;
    min-width: auto;
    padding: 6px 12px !important;
}

.orcid-copy-btn:hover {
    background-color: rgba(166, 206, 57, 0.1) !important;
}

.orcid-view-btn {
    color: #1976d2 !important;
    font-weight: 500;
    font-size: 0.8rem;
    text-transform: none;
    min-width: auto;
    padding: 6px 12px !important;
}

.orcid-view-btn:hover {
    background-color: rgba(25, 118, 210, 0.1) !important;
}

</style>