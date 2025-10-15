<template>
    <!-- Action Menu for Selected Items -->
    <div class="flex justify-between mb-2">
        <div class="flex items-center gap-2">
            <div v-if="selectedPersons.length > 0" class="action-menu-container">
                <v-menu offset-y>
                    <template #activator="{ props }">
                        <v-btn
                            v-bind="props"
                            color="white"
                            variant="elevated"
                            height="48"
                            prepend-icon="mdi-dots-vertical"
                            class="action-menu-trigger"
                        >
                            {{ $t("actions") }} <template v-if="selectedPersons.length > 0">
                                ({{ selectedPersons.length }})
                            </template>
                        </v-btn>
                    </template>
                    
                    <v-list class="action-menu-list" density="compact">
                        <!-- Delete Action -->
                        <v-list-item
                            v-if="(isAdmin || allowComparison) && !isAlumniTable && !isCommissionResearchersTable"
                            :disabled="selectedPersons.length <= 0"
                            class="action-menu-item"
                            @click="deleteSelection"
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
                        
                        <!-- Remove Action -->
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
                        
                        <!-- Compare Publications -->
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
                                {{ $t("comparePublicationsLabel") }}
                                <span class="selection-indicator">({{ selectedPersons.length }}/2)</span>
                            </v-list-item-title>
                        </v-list-item>
                        
                        <!-- Compare Metadata -->
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
                        
                        <!-- Export Action -->
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
                    </v-list>
                </v-menu>
            </div>
            <div :class="[selectedPersons.length > 0 ? 'w-64' : 'w-96']">
                <slot name="top-left"></slot>
            </div>
        </div>
        <div class="flex items-center gap-2">
            <add-employment-modal 
                v-if="employmentInstitutionId > 0 && (isAdmin || isInstitutionalEditor)"
                class="mb-4"
                :institution-id="employmentInstitutionId"
                @update="notifyUserAndRefreshTable">
            </add-employment-modal>
            <slot name="actions"></slot>
        </div>
    </div>

    
    <!-- Table Export Modal -->
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
        :hide-activation-button="true">
    </table-export-modal>
    
    <div ref="tableWrapper" class="modern-table-container">
        <v-data-table-server
            v-model="selectedPersons"
            :sort-by="tableOptions.sortBy"
            :items="persons"
            :headers="headers"
            item-value="row"
            :items-length="totalPersons"
            :show-select="isAdmin || enableExport"
            return-object
            :items-per-page-text="$t('itemsPerPageLabel')"
            :items-per-page-options="[5, 10, 25, 50]"
            :page="tableOptions.page"
            class="modern-data-table"
            :class="{ 'has-selection': selectedPersons.length > 0 }"
            @update:options="refreshTable">
            <template #body="props">
                <draggable
                    :list="props.items as any"
                    tag="tbody"
                    :disabled="!inComparator"
                    group="persons"
                    handle=".handle"
                    @change="onDropCallback"
                >
                    <tr v-if="props.items?.length === 0" class="empty-state-row">
                        <td colspan="10" class="text-center py-12">
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
                        </td>
                    </tr>
                    <tr v-for="item in props.items" :key="item.id" class="handle">
                        <td v-if="isAdmin || enableExport" class="checkbox-column px-2!">
                            <v-checkbox
                                v-model="selectedPersons"
                                :value="item"
                                class="table-checkbox"
                                hide-details
                                color="primary"
                            />
                        </td>
                        <td class="py-2!">
                            <div class="person-info">
                                <div class="person-name-section">
                                    <localized-link :to="'persons/' + item.databaseId" class="person-name">
                                        <v-avatar size="40" class="profile-avatar modern-avatar">
                                            <v-icon color="primary">
                                                mdi-account
                                            </v-icon>
                                        </v-avatar>
                                    </localized-link>
                                    <div class="flex items-center gap-2">
                                        <span>

                                            <localized-link :to="'persons/' + item.databaseId" class="person-name">
                                                {{ item.name }}
                                            </localized-link>
                                            <span>,</span>
                                        </span>
                                        <span v-if="item.birthdate" class="person-year">{{ extractYear(item.birthdate) }}</span>
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td class="py-4">
                            <div v-if="hasEmployment(item)" class="person-employment">
                                <div v-if="$i18n.locale.startsWith('sr')" class="employment-item">
                                    <template v-if="item.employmentsSr.trim() !== '' && item.employmentInstitutionsId && item.employmentInstitutionsId.length > 0">
                                        <div v-for="(employment, index) in item.employmentsSr.split('; ')" :key="index" class="employment-entry">
                                            <v-icon size="16" class="employment-icon">
                                                mdi-domain
                                            </v-icon>
                                            <localized-link
                                                v-if="item.employmentInstitutionsId[index] !== -1"
                                                :to="'organisation-units/' + item.employmentInstitutionsId[index]"
                                                class="employment-link">
                                                {{ employment.trim() }}
                                            </localized-link>
                                            <span v-else class="employment-text">{{ employment.trim() }}</span>
                                        </div>
                                    </template>
                                </div>
                                <div v-else class="employment-item">
                                    <template v-if="item.employmentsOther.trim() !== '' && item.employmentInstitutionsId && item.employmentInstitutionsId.length > 0">
                                        <div v-for="(employment, index) in item.employmentsOther.split('; ')" :key="index" class="employment-entry">
                                            <v-icon size="16" class="employment-icon">
                                                mdi-domain
                                            </v-icon>
                                            <localized-link
                                                v-if="item.employmentInstitutionsId[index] !== -1"
                                                :to="'organisation-units/' + item.employmentInstitutionsId[index]"
                                                class="employment-link">
                                                {{ employment.trim() }}
                                            </localized-link>
                                            <span v-else class="employment-text">{{ employment.trim() }}</span>
                                        </div>
                                    </template>
                                </div>
                            </div>
                            <!-- <div class="date-cell">
                                <v-icon size="16" color="grey-darken-1" class="mr-2">mdi-calendar</v-icon>
                                <span class="text-body-2">{{ item.birthdate ? localiseDate(item.birthdate) : displayTextOrPlaceholder(item.birthdate) }}</span>
                            </div> -->
                        </td>
                        <td class="py-4">
                            <div v-if="item.orcid || item.scopusAuthorId || item.openAlexId || item.webOfScienceResearcherId" class="identifiers-cell">
                                <div class="flex flex-wrap gap-2">
                                    <identifier-menu v-if="item.orcid" :identifier="item.orcid" type="orcid"></identifier-menu>
                                    <identifier-menu v-if="item.scopusAuthorId" :identifier="item.scopusAuthorId" type="scopus"></identifier-menu>
                                    <identifier-menu v-if="item.openAlexId" :identifier="item.openAlexId" type="openalex"></identifier-menu>
                                    <identifier-menu v-if="item.webOfScienceResearcherId" :identifier="item.webOfScienceResearcherId" type="webofscience"></identifier-menu>
                                </div>
                            </div>
                            <div v-else class="no-identifiers">
                                <v-icon size="16" color="grey-lighten-1" class="mr-2">
                                    mdi-identifier
                                </v-icon>
                                <span class="text-body-2 text-grey">{{ displayTextOrPlaceholder(item.orcid) }}</span>
                            </div>
                        </td>
                    </tr>
                </draggable>
            </template>
        </v-data-table-server>
    </div>
    
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
import { defineComponent, type PropType } from 'vue';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { PersonIndex } from '@/models/PersonModel';
import PersonService from '@/services/PersonService';
import LocalizedLink from '../localization/LocalizedLink.vue';
import { displayTextOrPlaceholder } from '@/utils/StringUtil';
import { localiseDate } from '@/utils/DateUtil';
import { useRouter } from 'vue-router';
import { VueDraggableNext } from 'vue-draggable-next';
import { watch } from 'vue';
import IdentifierMenu from '../core/IdentifierMenu.vue';
import InvolvementService from '@/services/InvolvementService';
import AddEmploymentModal from './involvement/AddEmploymentModal.vue';
import { useUserRole } from '@/composables/useUserRole';
import { ExportableEndpointType, ExportEntity } from '@/models/Common';
import TableExportModal from '../core/TableExportModal.vue';
import { isEqual } from 'lodash';


export default defineComponent({
    name: "PersonTableComponent",
    components: { LocalizedLink, draggable: VueDraggableNext, AddEmploymentModal, TableExportModal, IdentifierMenu },
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

        const i18n = useI18n();
        const router = useRouter();

        const notifications = ref<Map<string, string>>(new Map());

        const tableWrapper = ref<any>(null);

        watch(tableWrapper, () => {
            if (tableWrapper.value) {
                const table = tableWrapper.value;
                const sortableTbody = table.querySelector('.v-table__wrapper > table > tbody > tbody')
                const tbody = table.querySelector('.v-table__wrapper > table > tbody')
                tbody!.parentNode!.append(sortableTbody!)
                tbody!.remove()
            }
        });

        const fullNameLabel = computed(() => i18n.t("fullNameLabel"));
        const organisationUnitLabel = computed(() => i18n.t("organisationUnitLabel"));
        // const birthdateLabel = computed(() => i18n.t("birthdateLabel"));
        const identifiers = computed(() => i18n.t("identifiersLabel"));

        const { isAdmin, isInstitutionalEditor, isCommission, isUserLoggedIn } = useUserRole();

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

        const hasEmployment = (item: PersonIndex) => {
            if (i18n.locale.value.startsWith('sr')) {
                return item.employmentsSr.trim() !== '' && item.employmentInstitutionsId && item.employmentInstitutionsId.length > 0;
            } else {
                return item.employmentsOther.trim() !== '' && item.employmentInstitutionsId && item.employmentInstitutionsId.length > 0;
            }
        };


        const extractYear = (dateString: string) => {
            const d = new Date(dateString);
            if (isNaN(d.getTime())) {
                return '';
            }
            return d.getFullYear();
        };

        const exportModal = ref<any>(null);

        const openExportModal = () => {
            if (exportModal.value) {
                exportModal.value.openModal();
            }
        };

        return {
            selectedPersons, headers, notifications, isUserLoggedIn,
            refreshTable, isAdmin, deleteSelection, ExportEntity,
            tableOptions, displayTextOrPlaceholder, isInstitutionalEditor,
            localiseDate, startPublicationComparison, isCommission,
            startMetadataComparison, onDropCallback, removeSelection,
            tableWrapper, setSortAndPageOption, notifyUserAndRefreshTable, hasEmployment, extractYear, openExportModal, exportModal
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

    /* Table Container */
    .modern-table-container {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        overflow: hidden;
        border: 1px solid rgba(0, 0, 0, 0.06);
    }

    /* Modern Data Table */
    .modern-data-table {
        background: transparent;
    }

    .modern-data-table :deep(.v-data-table__wrapper) {
        border-radius: 12px;
    }

    .modern-data-table :deep(.v-table) {
        background: transparent;
    }

    .modern-data-table :deep(.v-table__wrapper) {
        border-radius: 12px;
    }

    .modern-data-table :deep(.v-data-table-header) {
        background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
        border-bottom: 2px solid rgba(25, 118, 210, 0.1);
    }

    .modern-data-table :deep(.v-data-table-header th) {
        font-weight: 600;
        color: #424242;
        font-size: 0.9rem;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        padding: 16px 12px;
        border-bottom: 2px solid rgba(25, 118, 210, 0.1);
    }

    .modern-data-table :deep(.v-data-table-header .v-checkbox) {
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

    .modern-avatar {
        background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
        color: #1976d2;
        box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);
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
    .modern-data-table.has-selection :deep(.v-data-table-header) {
        background: linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 100%);
        border-bottom: 2px solid rgba(25, 118, 210, 0.2);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
        .person-name-section {
            gap: 8px;
        }
        
        .modern-avatar {
            width: 32px !important;
            height: 32px !important;
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