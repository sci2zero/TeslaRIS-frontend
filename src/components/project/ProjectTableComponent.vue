<template>
    <div class="flex justify-between mb-2">
        <div class="flex items-center gap-2">
            <div v-if="isAdmin && selectedProjects.length > 0" class="action-menu-container">
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
                            {{ $t("actions") }} ({{ selectedProjects.length }})
                        </v-btn>
                    </template>

                    <v-list class="action-menu-list" density="compact">
                        <v-list-item
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
                    </v-list>
                </v-menu>
            </div>
            <div :class="[selectedProjects.length > 0 ? 'w-[19.25rem]' : 'w-[28rem]']">
                <slot name="top-left" />
            </div>
        </div>
        <div class="flex items-center gap-2">
            <slot name="actions" />
        </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <v-data-table-server
            v-model="selectedProjects"
            :sort-by="tableOptions.sortBy"
            :items="projects"
            :headers="headers"
            item-value="row"
            :items-length="totalProjects"
            :show-select="isAdmin"
            return-object
            :items-per-page-text="$t('itemsPerPageLabel')"
            :items-per-page-options="[5, 10, 25, 50]"
            :no-data-text="$t('noDataInTableMessage')"
            :page="tableOptions.page"
            @update:options="refreshTable">
            <template #item="row">
                <tr>
                    <td v-if="isAdmin">
                        <v-checkbox
                            v-model="selectedProjects"
                            :value="row.item"
                            class="table-checkbox"
                            hide-details
                        />
                    </td>
                    <td v-if="$i18n.locale.startsWith('sr')">
                        <localized-link :to="'project/' + row.item.databaseId">
                            {{ row.item.nameSr }}
                        </localized-link>
                    </td>
                    <td v-else>
                        <localized-link :to="'project/' + row.item.databaseId">
                            {{ row.item.nameOther }}
                        </localized-link>
                    </td>
                    <td>
                        {{ displayTextOrPlaceholder(localiseDate(row.item.dateFrom)) }}
                    </td>
                    <td>
                        {{ displayTextOrPlaceholder(localiseDate(row.item.dateTo)) }}
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

    <persistent-question-dialog
        v-model="displayPersistentDialog"
        :title="$t('areYouSureLabel')"
        :message="$t('confirmDeletionMessage')"
        :entity-names="selectedProjects.map(entity => $i18n.locale.startsWith('sr') ? entity.nameSr : entity.nameOther)"
        @continue="deleteSelection" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ProjectIndex } from '@/models/ProjectModel';
import ProjectService from '@/services/project/ProjectService';
import LocalizedLink from '../localization/LocalizedLink.vue';
import { displayTextOrPlaceholder } from '@/utils/StringUtil';
import { localiseDate } from '@/utils/DateUtil';
import { useUserRole } from '@/composables/useUserRole';
import { isEqual } from 'lodash';
import PersistentQuestionDialog from '../core/comparators/PersistentQuestionDialog.vue';


defineProps<{
    projects: ProjectIndex[];
    totalProjects: number;
}>();

const emit = defineEmits<{
    (e: "switchPage", page: number, size: number, sort: string | undefined, direction: string | undefined): void;
}>();

const selectedProjects = ref<ProjectIndex[]>([]);

const i18n = useI18n();

const notifications = ref<Map<string, string>>(new Map());

const nameLabel = computed(() => i18n.t("nameLabel"));
const dateFromLabel = computed(() => i18n.t("dateFromLabel"));
const dateToLabel = computed(() => i18n.t("dateToLabel"));

const { isAdmin } = useUserRole();

const nameColumn = computed(() => i18n.t("nameColumn"));

const tableOptions = ref<any>({initialCustomConfiguration: true, page: 1, itemsPerPage: 10, sortBy:[{key: nameColumn, order: "asc"}]});

const headers = [
    { title: nameLabel, align: "start", sortable: true, key: nameColumn},
    { title: dateFromLabel, align: "start", sortable: true, key: "dateFrom"},
    { title: dateToLabel, align: "start", sortable: true, key: "dateTo"}
];

const headersSortableMappings: Map<string, string> = new Map([
    ["nameSr", "name_sr_sortable"],
    ["nameOther", "name_other_sortable"],
    ["dateFrom", "date_from"],
    ["dateTo", "date_to"]
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
const startDeletionProcess = () => {
    displayPersistentDialog.value = true;
};

defineExpose({
    setSortAndPageOption
});
</script>

<style scoped>
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
</style>
