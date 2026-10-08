<template>
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
        :hide-activation-button="true" />

    <responsive-data-table
        v-model="selectedOUs"
        :container-class="embedded ? 'bg-white' : undefined"
        :sort-by="tableOptions.sortBy"
        :items="organisationUnits"
        :headers="headers"
        :items-length="totalOUs"
        :show-select="isAdmin || enableExport"
        :items-per-page="tableOptions.itemsPerPage"
        :page="tableOptions.page"
        :force-cards="cards"
        item-key="databaseId"
        @update:options="refreshTable">
        <template v-if="$slots['top-left']" #top-left>
            <slot name="top-left" />
        </template>
        <template #actions>
            <slot name="actions" />
        </template>
        <template #selection-menu>
            <!-- Delete Action -->
            <v-list-item
                v-if="(isAdmin || allowComparison)"
                :disabled="selectedOUs.length <= 0"
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
        </template>
        <template #compact-item="{ item }">
            <entity-list-card
                :to="'organisation-units/' + item.databaseId"
                class="h-full bg-white"
                @preview="openGlance(item)"
            >
                <div class="flex items-start gap-3">
                    <v-checkbox
                        v-if="isAdmin || enableExport" v-model="selectedOUs" :value="item" hide-details
                        density="compact" :aria-label="$i18n.locale.startsWith('sr') ? item.nameSr : item.nameOther" />
                    <entity-row-identity
                        :title="$i18n.locale.startsWith('sr') ? item.nameSr : item.nameOther"
                        :to="'organisation-units/' + item.databaseId">
                        <template #icon>
                            <organisation-unit-avatar :organisation-unit-id="item.databaseId" />
                        </template>
                        <template v-if="hasAdditionalInfo(item)" #default>
                            <div class="mt-2 space-y-2">
                                <p v-if="item.superOUId" class="text-xs text-slate-500">
                                    <localized-link :to="'organisation-units/' + item.superOUId">
                                        {{ $i18n.locale.startsWith('sr') ? item.superOUNameSr : item.superOUNameOther }}
                                    </localized-link>
                                </p>
                                <p v-if="researchAreasFor(item)" class="text-sm text-slate-500 whitespace-pre-line break-words">
                                    {{ researchAreasFor(item) }}
                                </p>
                                <div v-if="keywordsFor(item).length" class="flex flex-wrap gap-1">
                                    <localized-link
                                        v-for="keyword in keywordsFor(item)"
                                        :key="keyword"
                                        :to="`advanced-search?searchQuery=${encodeURIComponent(keyword)}&tab=organisationUnits`"
                                        class="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
                                        {{ keyword }}
                                    </localized-link>
                                </div>
                            </div>
                        </template>
                    </entity-row-identity>
                </div>
            </entity-list-card>
        </template>
        <template #row="{ item }">
            <tr>
                <td v-if="isAdmin || enableExport" class="px-2!">
                    <v-checkbox
                        v-model="selectedOUs"
                        :value="item"
                        class="table-checkbox"
                        hide-details
                    />
                </td>
                <td>
                    <entity-row-identity
                        :title="$i18n.locale.startsWith('sr') ? item.nameSr : item.nameOther"
                        :to="'organisation-units/' + item.databaseId"
                        class="py-2">
                        <template #icon>
                            <localized-link :to="'organisation-units/' + item.databaseId">
                                <organisation-unit-avatar :organisation-unit-id="item.databaseId" />
                            </localized-link>
                        </template>
                        <template v-if="item.superOUId" #default>
                            <div class="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                <v-icon size="14" color="grey" icon="mdi-arrow-up-circle" />
                                <localized-link :to="'organisation-units/' + item.superOUId">
                                    {{ displayTextOrPlaceholder($i18n.locale.startsWith('sr') ? item.superOUNameSr : item.superOUNameOther) }}
                                </localized-link>
                            </div>
                        </template>
                    </entity-row-identity>
                </td>
                <!-- <td>
                    <div v-if="item.superOUId" class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <v-icon color="grey" size="16">mdi-office-building</v-icon>
                        </div>
                        <div>
                            <localized-link :to="'organisation-units/' + item.superOUId" class="text-gray-600! hover:text-gray-800! font-medium text-sm">
                                <template v-if="$i18n.locale.startsWith('sr')">
                                    {{ displayTextOrPlaceholder(item.superOUNameSr) }}
                                </template>
                                <template v-else>
                                    {{ displayTextOrPlaceholder(item.superOUNameOther) }}
                                </template>
                            </localized-link>
                        </div>
                    </div>
                </td> -->
                <td>
                    <div v-if="$i18n.locale.startsWith('sr') ? item.keywordsSr : item.keywordsOther" class="flex flex-wrap gap-1">
                        <localized-link
                            v-for="(keyword, index) in ($i18n.locale.startsWith('sr') ? item.keywordsSr : item.keywordsOther).split('\n')"
                            :key="index"
                            :to="`advanced-search?searchQuery=${keyword}&tab=organisationUnits`"
                            class="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full hover:bg-blue-200 transition-colors"
                        >
                            {{ displayTextOrPlaceholder(keyword) }}
                        </localized-link>
                    </div>
                </td>
                <td>
                    <div v-if="$i18n.locale.startsWith('sr') ? item.researchAreasSr : item.researchAreasOther" class="flex flex-wrap gap-1">
                        <span
                            v-for="(area, index) in ($i18n.locale.startsWith('sr') ? item.researchAreasSr : item.researchAreasOther).split('\n')"
                            :key="index"
                            class="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                        >
                            {{ displayTextOrPlaceholder(area) }}
                        </span>
                    </div>
                </td>
            </tr>
        </template>
    </responsive-data-table>

    <organisation-unit-quick-glance v-model="glanceOpen" :item="glancedOU" />

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
        :entity-names="selectedOUs.map(entity => $i18n.locale.startsWith('sr') ? entity.nameSr : entity.nameOther)"
        @continue="deleteSelection" />
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type {OrganisationUnitIndex} from '@/models/OrganisationUnitModel';
import OrganisationUnitService from '@/services/OrganisationUnitService';
import ResponsiveDataTable from '@/components/core/ResponsiveDataTable.vue';
import EntityListCard from '@/components/core/EntityListCard.vue';
import EntityRowIdentity from '@/components/core/EntityRowIdentity.vue';
import OrganisationUnitQuickGlance from './OrganisationUnitQuickGlance.vue';
import OrganisationUnitAvatar from './OrganisationUnitAvatar.vue';
import LocalizedLink from '../localization/LocalizedLink.vue';
import { displayTextOrPlaceholder } from '@/utils/StringUtil';
import { useRouter } from 'vue-router';
import { useUserRole } from '@/composables/useUserRole';
import { ExportableEndpointType, ExportEntity } from '@/models/Common';
import TableExportModal from '../core/TableExportModal.vue';
import { isEqual } from 'lodash';
import PersistentQuestionDialog from '../core/comparators/PersistentQuestionDialog.vue';


export default defineComponent({
    name: "OrganisationUnitTableComponent",
    components: { EntityListCard, EntityRowIdentity, OrganisationUnitQuickGlance, OrganisationUnitAvatar, ResponsiveDataTable, LocalizedLink, TableExportModal, PersistentQuestionDialog },
    props: {
        embedded: { type: Boolean, default: false },
        cards: { type: Boolean, default: false },
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
        const glanceOpen = ref(false);
        const glancedOU = ref<OrganisationUnitIndex | null>(null);
        const openGlance = (item: OrganisationUnitIndex) => {
            glancedOU.value = item;
            glanceOpen.value = true;
        };

        const i18n = useI18n();
        const router = useRouter();
        const researchAreasFor = (item: OrganisationUnitIndex) =>
            ((i18n.locale.value.startsWith('sr') ? item.researchAreasSr : item.researchAreasOther) || '').trim();
        const keywordsFor = (item: OrganisationUnitIndex) =>
            ((i18n.locale.value.startsWith('sr') ? item.keywordsSr : item.keywordsOther) || '')
                .split('\n').map(keyword => keyword.trim()).filter(Boolean);
        const hasAdditionalInfo = (item: OrganisationUnitIndex) =>
            Boolean(item.superOUId || researchAreasFor(item) || keywordsFor(item).length);

        const notifications = ref<Map<string, string>>(new Map());

        const nameLabel = computed(() => i18n.t("nameLabel"));
        const keywordsLabel = computed(() => i18n.t("keywordsLabel"));
        const researchAreasLabel = computed(() => i18n.t("researchAreasLabel"));

        const { isAdmin, isUserLoggedIn } = useUserRole();

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

        return {
            glanceOpen, glancedOU, openGlance, researchAreasFor, keywordsFor, hasAdditionalInfo,
            selectedOUs, headers, notifications,
            refreshTable, isAdmin, deleteSelection,
            tableOptions, displayTextOrPlaceholder,
            startEmploymentComparison, setSortAndPageOption,
            startMetadataComparison, ExportEntity,
            isUserLoggedIn,
            openExportModal, exportModal,
            displayPersistentDialog, startDeletionProcess
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
