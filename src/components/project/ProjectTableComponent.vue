<template>
    <responsive-data-table
        v-model="selectedProjects"
        :container-class="embedded ? 'bg-white' : undefined"
        :sort-by="tableOptions.sortBy"
        :items="projects"
        :headers="headers"
        :items-length="totalProjects"
        :show-select="allowBulkActions"
        :page="tableOptions.page"
        :items-per-page="tableOptions.itemsPerPage"
        :has-active-filters="hasActiveStatusFilters"
        filter-header-key="status"
        @update:options="refreshTable"
    >
        <template v-if="$slots['top-left']" #top-left>
            <slot name="top-left" />
        </template>
        <template #selection-menu>
            <v-list-item
                v-if="allowUnbinding"
                class="action-menu-item"
                @click="displayUnbindDialog = true"
            >
                <template #prepend>
                    <v-icon color="error" size="18">
                        mdi-link-variant-off
                    </v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                    {{ isInstitutionalEditor ? $t("removeInstitutionFromProjectLabel") : $t("removeFromProjectLabel") }}
                </v-list-item-title>
            </v-list-item>
            <v-list-item
                v-else-if="allowBulkActions"
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
        </template>
        <template #actions>
            <slot name="actions" />
        </template>
        <template v-if="$slots['status-filter-menu']" #filter="scope">
            <slot name="status-filter-menu" v-bind="scope" />
        </template>
        <template #compact-item="{ item }">
            <entity-list-card :to="'project/' + item.databaseId" @preview="openGlance(item)">
                <div class="flex items-start gap-2">
                    <div v-if="allowBulkActions" class="shrink-0" @click.stop>
                        <v-checkbox
                            v-model="selectedProjects" :value="item" hide-details density="compact"
                            :aria-label="$i18n.locale.startsWith('sr') ? item.nameSr : item.nameOther" />
                    </div>
                    <span class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <v-icon icon="mdi-folder-outline" />
                    </span>
                    <div class="min-w-0 flex-1">
                        <localized-link :to="'project/' + item.databaseId" class="font-semibold text-sm text-slate-800 break-words">
                            {{ $i18n.locale.startsWith('sr') ? item.nameSr : item.nameOther }}
                        </localized-link>
                        <project-summary :item="item" class="mt-2" />
                    </div>
                </div>
            </entity-list-card>
        </template>
        <template #row="{ item }">
            <tr>
                <td v-if="allowBulkActions">
                    <v-checkbox
                        v-model="selectedProjects"
                        :value="item"
                        class="table-checkbox"
                        hide-details
                    />
                </td>
                <td>
                    <entity-row-identity
                        :title="$i18n.locale.startsWith('sr') ? item.nameSr : item.nameOther"
                        :to="'project/' + item.databaseId"
                        icon="mdi-folder-outline"
                        class="py-2"
                    />
                </td>
                <td v-if="$i18n.locale.startsWith('sr')">
                    <localized-link v-if="item.coordinatorId" :to="'organisation-units/' + item.coordinatorId">
                        {{ item.coordinatorNameSr }}
                    </localized-link>
                    <span v-else>{{ displayTextOrPlaceholder(item.coordinatorNameSr) }}</span>
                </td>
                <td v-else>
                    <localized-link v-if="item.coordinatorId" :to="'organisation-units/' + item.coordinatorId">
                        {{ item.coordinatorNameOther }}
                    </localized-link>
                    <span v-else>{{ displayTextOrPlaceholder(item.coordinatorNameOther) }}</span>
                </td>
                <td>
                    <v-chip
                        v-if="item.status"
                        size="small"
                        :color="getProjectStatusColor(item.status)"
                        variant="flat"
                    >
                        {{ getProjectStatusTitleFromValueAutoLocale(item.status) }}
                    </v-chip>
                    <span v-else>{{ displayTextOrPlaceholder("") }}</span>
                </td>
                <td>
                    {{ displayTextOrPlaceholder(localiseDate(item.dateFrom)) }}
                </td>
                <td>
                    {{ displayTextOrPlaceholder(localiseDate(item.dateTo)) }}
                </td>
            </tr>
        </template>
    </responsive-data-table>
    <project-quick-glance v-model="glanceOpen" :item="glancedProject" />
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
        :entity-names="selectedProjects.map(entity => $i18n.locale.startsWith('sr') ? entity.nameSr : entity.nameOther)"
        @continue="deleteSelection" />

    <persistent-question-dialog
        v-model="displayUnbindDialog"
        :title="$t('areYouSureLabel')"
        :message="$t('confirmUnbindingMessage')"
        :entity-names="selectedProjects.map(entity => $i18n.locale.startsWith('sr') ? entity.nameSr : entity.nameOther)"
        @continue="unbindSelection" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ProjectIndex } from '@/models/ProjectModel';
import ProjectService from '@/services/project/ProjectService';
import LocalizedLink from '../localization/LocalizedLink.vue';
import ResponsiveDataTable from '@/components/core/ResponsiveDataTable.vue';
import EntityListCard from '@/components/core/EntityListCard.vue';
import EntityRowIdentity from '@/components/core/EntityRowIdentity.vue';
import ProjectQuickGlance from './ProjectQuickGlance.vue';
import ProjectSummary from './ProjectSummary.vue';
import { displayTextOrPlaceholder } from '@/utils/StringUtil';
import { localiseDate } from '@/utils/DateUtil';
import { useUserRole } from '@/composables/useUserRole';
import { isEqual } from 'lodash';
import PersistentQuestionDialog from '../core/comparators/PersistentQuestionDialog.vue';
import { getProjectStatusColor, getProjectStatusTitleFromValueAutoLocale } from '@/i18n/projectStatus';


const tableProps = withDefaults(defineProps<{
    embedded?: boolean;
    projects: ProjectIndex[];
    totalProjects: number;
    hasActiveStatusFilters?: boolean;
    hideBulkActions?: boolean;
    allowUnbinding?: boolean;
}>(), {
    embedded: false,
    hasActiveStatusFilters: false,
    hideBulkActions: false,
    allowUnbinding: false
});

const emit = defineEmits<{
    (e: "switchPage", page: number, size: number, sort: string | undefined, direction: string | undefined): void;
}>();

const selectedProjects = ref<ProjectIndex[]>([]);
const glanceOpen = ref(false);
const glancedProject = ref<ProjectIndex | null>(null);
const openGlance = (item: ProjectIndex) => {
    glancedProject.value = item;
    glanceOpen.value = true;
};

const i18n = useI18n();

const notifications = ref<Map<string, string>>(new Map());

const nameLabel = computed(() => i18n.t("nameLabel"));
const coordinatorLabel = computed(() => i18n.t("coordinatorLabel"));
const statusLabel = computed(() => i18n.t("statusLabel"));
const dateFromLabel = computed(() => i18n.t("dateFromLabel"));
const dateToLabel = computed(() => i18n.t("dateToLabel"));

const { isAdmin, isResearcher, isInstitutionalEditor } = useUserRole();

const allowUnbinding = computed(() =>
    tableProps.allowUnbinding && (isResearcher.value || isInstitutionalEditor.value));
const allowBulkActions = computed(() =>
    (isAdmin.value && !tableProps.hideBulkActions) || allowUnbinding.value);

const nameColumn = computed(() => i18n.t("nameColumn"));
const coordinatorNameColumn = computed(() => i18n.t("coordinatorNameColumn"));

const tableOptions = ref<any>({initialCustomConfiguration: true, page: 1, itemsPerPage: 10, sortBy:[{key: nameColumn, order: "asc"}]});

const headers = ref<any>([
    { title: nameLabel, align: "start", sortable: true, key: nameColumn},
    { title: coordinatorLabel, align: "start", sortable: true, key: coordinatorNameColumn},
    { title: statusLabel, align: "start", sortable: true, key: "status"},
    { title: dateFromLabel, align: "start", sortable: true, key: "dateFrom"},
    { title: dateToLabel, align: "start", sortable: true, key: "dateTo"}
]);

const headersSortableMappings: Map<string, string> = new Map([
    ["nameSr", "name_sr_sortable"],
    ["nameOther", "name_other_sortable"],
    ["coordinatorNameSr", "coordinator_name_sr_sortable"],
    ["coordinatorNameOther", "coordinator_name_other_sortable"],
    ["dateFrom", "date_from"],
    ["dateTo", "date_to"],
    ["status", "status"]
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

const addNotification = (message: string) => {
    const notificationId = self.crypto.randomUUID();

    notifications.value.set(notificationId, message);
    setTimeout(() => removeNotification(notificationId), 2000);
};

const removeNotification = (notificationId: string) => {
    notifications.value.delete(notificationId);
};

const deleteSelection = () => {
    Promise.all(selectedProjects.value.map((project: ProjectIndex) => {
        return ProjectService.deleteProject(project.databaseId)
            .then(() => {
                if (i18n.locale.value.startsWith("sr")) {
                    addNotification(i18n.t("deleteSuccessNotification", { name: project.nameSr }));
                } else {
                    addNotification(i18n.t("deleteSuccessNotification", { name: project.nameOther }));
                }
            })
            .catch(() => {
                if (i18n.locale.value.startsWith("sr")) {
                    addNotification(i18n.t("deleteFailedNotification", { name: project.nameSr }));
                } else {
                    addNotification(i18n.t("deleteFailedNotification", { name: project.nameOther }));
                }
                return project;
            });
    })).then((failedDeletions) => {
        selectedProjects.value = selectedProjects.value.filter((project) => failedDeletions.includes(project));
        refreshTable(tableOptions.value);
    });
};

const unbindSelection = () => {
    const unbind = isInstitutionalEditor.value ?
        (projectId: number) => ProjectService.unbindInstitutionResearchersFromProject(projectId) :
        (projectId: number) => ProjectService.unbindResearcherFromProject(projectId);

    const successMessage = isInstitutionalEditor.value ?
        "massInstitutionProjectUnbindSuccessMessage" : "massProjectUnbindSuccessMessage";

    Promise.all(selectedProjects.value.map((project: ProjectIndex) => {
        const name = i18n.locale.value.startsWith("sr") ? project.nameSr : project.nameOther;

        return unbind(project.databaseId)
            .then(() => {
                addNotification(i18n.t(successMessage, { name }));
            })
            .catch(() => {
                addNotification(i18n.t("projectUnbindFailedMessage", { name }));
                return project;
            });
    })).then((failedUnbindings) => {
        selectedProjects.value = selectedProjects.value.filter((project) => failedUnbindings.includes(project));
        refreshTable(tableOptions.value);
    });
};

const setSortAndPageOption = (sortBy: {key: string, order: string}[], page: number) => {
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

const displayPersistentDialog = ref(false);
const displayUnbindDialog = ref(false);
const startDeletionProcess = () => {
    displayPersistentDialog.value = true;
};

defineExpose({
    setSortAndPageOption
});
</script>

<style scoped>
</style>
