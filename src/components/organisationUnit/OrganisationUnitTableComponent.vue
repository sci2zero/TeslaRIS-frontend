<template>
    <!-- Action Menu for Selected Items -->
    <div class="flex justify-between mb-2">
        <div class="flex items-center gap-2">
            <div v-if="selectedOUs.length > 0" class="action-menu-container">
                <v-menu offset-y>
                    <template #activator="{ props }">
                        <v-btn
                            v-bind="props"
                            color="white"
                            height="48"
                            variant="elevated"
                            prepend-icon="mdi-dots-vertical"
                            class="action-menu-trigger"
                        >
                            {{ $t("actions") }} <template v-if="selectedOUs.length > 0">
                                ({{ selectedOUs.length }})
                            </template>
                        </v-btn>
                    </template>
                    
                    <v-list class="action-menu-list" density="compact">
                        <!-- Delete Action -->
                        <v-list-item
                            v-if="(isAdmin || allowComparison)"
                            :disabled="selectedOUs.length <= 0"
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
                        
                        <!-- Compare Employees -->
                        <v-list-item
                            v-if="(isAdmin || allowComparison)"
                            :disabled="selectedOUs.length !== 2"
                            class="action-menu-item"
                            @click="startEmploymentComparison"
                        >
                            <template #prepend>
                                <v-icon color="info" size="18">
                                    mdi-account-group
                                </v-icon>
                            </template>
                            <v-list-item-title class="text-body-2">
                                {{ $t("compareEmployeesLabel") }}
                                <span class="selection-indicator">({{ selectedOUs.length }}/2)</span>
                            </v-list-item-title>
                        </v-list-item>
                        
                        <!-- Compare Metadata -->
                        <v-list-item
                            v-if="(isAdmin || allowComparison)"
                            :disabled="selectedOUs.length !== 2"
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
                                <span class="selection-indicator">({{ selectedOUs.length }}/2)</span>
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
            <div :class="[selectedOUs.length > 0 ? 'w-64' : 'w-96']">
                <slot name="top-left"></slot>
            </div>
        </div>
        <div class="flex items-center gap-2">
            <add-sub-unit-modal 
                v-if="topLevelInstitutionId > 0 && (isAdmin || isInstitutionalEditor)"
                class="mb-4"
                :institution-id="topLevelInstitutionId"
                @update="notifyUserAndRefreshTable">
            </add-sub-unit-modal>
            <slot name="actions"></slot>
        </div>
    </div>

    
    <!-- Table Export Modal -->
    <table-export-modal
        v-if="enableExport"
        ref="exportModal"
        :export-entity="ExportEntity.ORGANISATION_UNIT"
        :export-ids="(selectedOUs.map(orgUnit => orgUnit.databaseId) as number[])"
        :disabled="selectedOUs.length === 0"
        :potential-max-amount-requested="selectedOUs.length >= tableOptions.itemsPerPage"
        :total-results="totalOUs"
        :endpoint-type="endpointType"
        :endpoint-token-parameters="endpointTokenParameters"
        :hide-activation-button="true">
    </table-export-modal>
    
    <div ref="tableWrapper" class="modern-table-container">
        <v-data-table-server
            v-model="selectedOUs"
            :sort-by="tableOptions.sortBy"
            :items="organisationUnits"
            :headers="headers"
            item-value="row"
            :items-length="totalOUs"
            :show-select="isAdmin || enableExport"
            return-object
            :items-per-page-text="$t('itemsPerPageLabel')"
            :items-per-page-options="[5, 10, 25, 50]"
            :no-data-text="$t('noDataInTableMessage')"
            :page="tableOptions.page"
            @update:options="refreshTable">
            <template #item="row">
                <tr>
                    <td v-if="isAdmin || enableExport" class="px-2!">
                        <v-checkbox
                            v-model="selectedOUs"
                            :value="row.item"
                            class="table-checkbox"
                            hide-details
                        />
                    </td>
                    <td>
                        <div class="flex items-center gap-2">
                            <localized-link :to="'organisation-units/' + row.item.databaseId" class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition-colors">
                                <v-icon color="primary" size="20">
                                    mdi-office-building
                                </v-icon>
                            </localized-link>
                            <div>
                                <localized-link :to="'organisation-units/' + row.item.databaseId" class="text-gray-800! hover:text-blue-900! font-semibold text-base">
                                    <template v-if="$i18n.locale.startsWith('sr')">
                                        {{ row.item.nameSr }}
                                    </template>
                                    <template v-else>
                                        {{ row.item.nameOther }}
                                    </template>
                                </localized-link>
                                <div v-if="row.item.superOUId" class="text-gray-500 font-normal text-xs flex items-center gap-1 mt-1">
                                    <v-icon size="14" color="grey">
                                        mdi-arrow-up-circle
                                    </v-icon>
                                    <localized-link :to="'organisation-units/' + row.item.superOUId">
                                        <template v-if="$i18n.locale.startsWith('sr')">
                                            {{ displayTextOrPlaceholder(row.item.superOUNameSr) }}
                                        </template>
                                        <template v-else>
                                            {{ displayTextOrPlaceholder(row.item.superOUNameOther) }}
                                        </template>
                                    </localized-link>
                                </div>
                            </div>
                        </div>
                    </td>
                    <!-- <td>
                    <div v-if="row.item.superOUId" class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <v-icon color="grey" size="16">mdi-office-building</v-icon>
                        </div>
                        <div>
                            <localized-link :to="'organisation-units/' + row.item.superOUId" class="text-gray-600! hover:text-gray-800! font-medium text-sm">
                                <template v-if="$i18n.locale.startsWith('sr')">
                                    {{ displayTextOrPlaceholder(row.item.superOUNameSr) }}
                                </template>
                                <template v-else>
                                    {{ displayTextOrPlaceholder(row.item.superOUNameOther) }}
                                </template>
                            </localized-link>
                        </div>
                    </div>
                </td> -->
                    <td>
                        <div v-if="$i18n.locale.startsWith('sr') ? row.item.keywordsSr : row.item.keywordsOther" class="flex flex-wrap gap-1">
                            <localized-link 
                                v-for="(keyword, index) in ($i18n.locale.startsWith('sr') ? row.item.keywordsSr : row.item.keywordsOther).split('\n')" 
                                :key="index" 
                                :to="`advanced-search?searchQuery=${keyword}&tab=organisationUnits`"
                                class="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full hover:bg-blue-200 transition-colors"
                            >
                                {{ displayTextOrPlaceholder(keyword) }}
                            </localized-link>
                        </div>
                    </td>
                    <td>
                        <div v-if="$i18n.locale.startsWith('sr') ? row.item.researchAreasSr : row.item.researchAreasOther" class="flex flex-wrap gap-1">
                            <span 
                                v-for="(area, index) in ($i18n.locale.startsWith('sr') ? row.item.researchAreasSr : row.item.researchAreasOther).split('\n')" 
                                :key="index"
                                class="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                            >
                                {{ displayTextOrPlaceholder(area) }}
                            </span>
                        </div>
                    </td>
                </tr>
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
import type {OrganisationUnitIndex} from '@/models/OrganisationUnitModel';
import OrganisationUnitService from '@/services/OrganisationUnitService';
import LocalizedLink from '../localization/LocalizedLink.vue';
import { displayTextOrPlaceholder } from '@/utils/StringUtil';
import { useRouter } from 'vue-router';
import { useUserRole } from '@/composables/useUserRole';
import { ExportableEndpointType, ExportEntity } from '@/models/Common';
import TableExportModal from '../core/TableExportModal.vue';
import { isEqual } from 'lodash';
import AddSubUnitModal from './AddSubUnitModal.vue';


export default defineComponent({
    name: "OrganisationUnitTableComponent",
    components: { LocalizedLink, TableExportModal, AddSubUnitModal },
    props: {
        organisationUnits: {
            type: Array<OrganisationUnitIndex>,
            required: true
        }, 
        totalOUs: {
            type: Number,
            required: true
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
        topLevelInstitutionId: {
            type: Number,
            default: -1
        },
        allowComparison: {
            type: Boolean,
            default: false
        }
    },
    emits: ["switchPage"],
    setup(props, {emit}) {
        const selectedOUs = ref<OrganisationUnitIndex[]>([]);

        const i18n = useI18n();
        const router = useRouter();

        const notifications = ref<Map<string, string>>(new Map());

        const nameLabel = computed(() => i18n.t("nameLabel"));
        const keywordsLabel = computed(() => i18n.t("keywordsLabel"));
        const researchAreasLabel = computed(() => i18n.t("researchAreasLabel"));

        const { isAdmin, isInstitutionalEditor, isUserLoggedIn } = useUserRole();

        const nameColumn = computed(() => i18n.t("nameColumn"));
        const keywordsColumn = computed(() => i18n.t("keywordsColumn"));
        const researchAreasColumn = computed(() => i18n.t("researchAreasColumn"));

        const tableOptions = ref<any>({initialCustomConfiguration: true, page: 1, itemsPerPage: 10, sortBy:[{key: nameColumn, order: "asc"}]});

        const headers = computed(() => [
          { title: nameLabel.value, align: "start" as const, sortable: true, key: nameColumn.value},
        //   { title: superOULabel.value, align: "start" as const, sortable: true, key: superOUColumn.value},
          { title: keywordsLabel.value, align: "start" as const, sortable: true, key: keywordsColumn.value},
          { title: researchAreasLabel.value, align: "start" as const, sortable: true, key: researchAreasColumn.value}
        ]);

        const headersSortableMappings: Map<string, string> = new Map([
            ["nameSr", "name_sr_sortable"],
            ["nameOther", "name_other_sortable"],
            ["keywordsSr", "keywords_sr"],
            ["keywordsOther", "keywords_other"],
            ["researchAreasSr", "research_areas_sr_sortable"],
            ["researchAreasOther", "research_areas_other_sortable"],
            ["superOUNameSr", "super_ou_name_sr_sortable"],
            ["superOUNameOther", "super_ou_name_other_sortable"],
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
            Promise.all(selectedOUs.value.map((organisationUnit: OrganisationUnitIndex) => {
                if (props.topLevelInstitutionId > 0) {
                    return OrganisationUnitService.deleteOURelationByIdPair(organisationUnit.databaseId, props.topLevelInstitutionId)
                        .then(() => {
                            if (i18n.locale.value.startsWith("sr")) {
                                addNotification(i18n.t("ouTerminationSuccessNotification", { name: organisationUnit.nameSr }));
                            } else {
                                addNotification(i18n.t("ouTerminationSuccessNotification", { name: organisationUnit.nameOther }));
                            }
                        })
                        .catch(() => {
                            if (i18n.locale.value.startsWith("sr")) {
                                addNotification(i18n.t("ouTerminationFailedNotification", { name: organisationUnit.nameSr }));
                            } else {
                                addNotification(i18n.t("ouTerminationFailedNotification", { name: organisationUnit.nameOther }));
                            }
                            return organisationUnit;
                        });
                } else {
                    return OrganisationUnitService.deleteOrganisationUnit(organisationUnit.databaseId)
                        .then(() => {
                            if (i18n.locale.value.startsWith("sr")) {
                                addNotification(i18n.t("deleteSuccessNotification", { name: organisationUnit.nameSr }));
                            } else {
                                addNotification(i18n.t("deleteSuccessNotification", { name: organisationUnit.nameOther }));
                            }
                        })
                        .catch(() => {
                            if (i18n.locale.value.startsWith("sr")) {
                                addNotification(i18n.t("deleteFailedNotification", { name: organisationUnit.nameSr }));
                            } else {
                                addNotification(i18n.t("deleteFailedNotification", { name: organisationUnit.nameOther }));
                            }
                            return organisationUnit;
                        });
                }
            })).then((failedDeletions) => {
                selectedOUs.value = selectedOUs.value.filter((organisationUnit) => failedDeletions.includes(organisationUnit));
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

        const startEmploymentComparison = () => {
            router.push({name: "organisationUnitEmploymentsComparator", params: {
                leftId: selectedOUs.value[0].databaseId, rightId: selectedOUs.value[1].databaseId
            }});
        };

        const startMetadataComparison = () => {
            router.push({name: "organisationUnitMetadataComparator", params: {
                leftId: selectedOUs.value[0].databaseId, rightId: selectedOUs.value[1].databaseId
            }});
        };

        const setSortAndPageOption = (sortBy: {key: string,  order: string}[], page: number) => {
            if (
                (
                    isEqual([{key: nameColumn.value, order: "asc"}], tableOptions.value.sortBy) ||
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

        const exportModal = ref<any>(null);

        const openExportModal = () => {
            if (exportModal.value) {
                exportModal.value.openModal();
            }
        };

        return {
            selectedOUs, headers, notifications,
            refreshTable, isAdmin, deleteSelection,
            tableOptions, displayTextOrPlaceholder,
            startEmploymentComparison, setSortAndPageOption,
            startMetadataComparison, ExportEntity,
            isUserLoggedIn, isInstitutionalEditor,
            notifyUserAndRefreshTable, openExportModal, exportModal
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

    /* Organisation Info */
    .organisation-info {
        display: flex;
        flex-direction: column;
    }

    .organisation-name-section {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .modern-avatar {
        background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
        color: #2e7d32;
        box-shadow: 0 2px 8px rgba(46, 125, 50, 0.2);
    }

    .organisation-name {
        font-weight: 600;
        color: #424242;
        text-decoration: none;
        font-size: 1rem;
        transition: all 0.2s ease;
    }

    .organisation-name:hover {
        color: #2e7d32;
        text-decoration: underline;
    }

    /* Super OU Info */
    .super-ou-info {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .super-ou-link {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #666;
        text-decoration: none;
        font-size: 0.85rem;
        transition: all 0.2s ease;
    }

    .super-ou-link:hover {
        color: #2e7d32;
        text-decoration: underline;
    }

    .super-ou-text {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #666;
        font-size: 0.85rem;
    }

    .super-ou-icon {
        color: #999;
        flex-shrink: 0;
    }

    /* Keywords Cell */
    .keywords-cell {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
    }

    .keyword-link {
        color: #666;
        text-decoration: none;
        font-size: 0.85rem;
        transition: all 0.2s ease;
    }

    .keyword-link:hover {
        color: #2e7d32;
        text-decoration: underline;
    }

    .no-keywords {
        display: flex;
        align-items: center;
        color: #999;
    }

    /* Research Areas Cell */
    .research-areas-cell {
        display: flex;
        align-items: center;
        color: #666;
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
        background: linear-gradient(135deg, #e8f5e8 0%, #f8f9fa 100%);
        border-bottom: 2px solid rgba(46, 125, 50, 0.2);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
        .organisation-name-section {
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

</style>

