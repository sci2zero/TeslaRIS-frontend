<template>
    <div class="container py-4 px-4 mx-auto">
        <h1 class="text-2xl font-bold mb-4">
            {{ $t("projectsLabel") }}
        </h1>

        <tab-content-loader
            v-if="loading"
            button-header
            :tab-number="3"
            layout="table"
        />
        <project-table-component
            v-else
            ref="tableRef"
            :projects="projects"
            :total-projects="totalProjects"
            :has-active-status-filters="selectedStatuses.length > 0"
            @switch-page="switchPage">
            <template #top-left>
                <search-bar-component
                    :transparent="false"
                    size="small"
                    @search="clearSortAndPerformSearch"
                />
            </template>
            <template #actions>
                <div class="flex items-center gap-2">
                    <v-menu>
                        <template #activator="{ props }">
                            <v-btn
                                v-bind="props"
                                color="white"
                                prepend-icon="mdi-dots-vertical"
                                class="action-menu-trigger"
                            >
                                {{ $t("optionsLabel") }}
                            </v-btn>
                        </template>
                        <div class="p-4 border border-gray-200 bg-white rounded-lg shadow-lg">
                            <v-checkbox
                                v-model="returnOnlyActiveProjects"
                                :label="$t('showOnlyActiveLabel')"
                                hide-details
                            />
                        </div>
                    </v-menu>
                    <v-btn color="primary" @click="addProject">
                        {{ $t("createNewProjectLabel") }}
                    </v-btn>
                </div>
            </template>
            <template #status-filter-menu>
                <div class="status-filter">
                    <div class="filter-header">
                        <span class="filter-title">{{ $t('statusLabel') }}</span>
                    </div>
                    <v-divider class="my-2"></v-divider>
                    <div class="checkbox-grid">
                        <div
                            v-for="status in projectStatuses"
                            :key="status.value"
                            class="checkbox-item"
                        >
                            <v-checkbox
                                :model-value="selectedStatuses.some(s => s.value === status.value)"
                                :label="status.title"
                                density="compact"
                                hide-details
                                class="w-full"
                                color="primary"
                                @update:model-value="toggleStatus(status, !!$event)"
                            />
                        </div>
                    </div>
                </div>
            </template>
        </project-table-component>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import SearchBarComponent from '@/components/core/SearchBarComponent.vue';
import ProjectService from '@/services/project/ProjectService';
import ProjectTableComponent from '@/components/project/ProjectTableComponent.vue';
import type { ProjectIndex, ProjectStatus } from '@/models/ProjectModel';
import { getProjectStatusesForGivenLocale } from '@/i18n/projectStatus';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import TabContentLoader from '@/components/core/TabContentLoader.vue';


const loading = ref(false);

const searchParams = ref("tokens=");
const projects = ref<ProjectIndex[]>([]);
const totalProjects = ref(0);
const page = ref(0);
const size = ref(1);
const sort = ref("");
const direction = ref("");

const projectStatuses = computed(() => getProjectStatusesForGivenLocale() ?? []);
const selectedStatuses = ref<{ title: string, value: ProjectStatus }[]>([]);

const returnOnlyActiveProjects = ref(false);
const initialLoad = ref(true);

const i18n = useI18n();
const router = useRouter();
const tableRef = ref<InstanceType<typeof ProjectTableComponent>>();

onMounted(() => {
    document.title = i18n.t("projectsLabel");
    loading.value = true;
    search(searchParams.value);
});

watch(returnOnlyActiveProjects, () => {
    if (!initialLoad.value) {
        search(searchParams.value);
    }
});

const clearSortAndPerformSearch = (tokenParams: string) => {
    tableRef.value?.setSortAndPageOption([], 1);
    page.value = 0;
    sort.value = "";
    direction.value = "";
    search(tokenParams);
};

const search = (tokenParams: string) => {
    searchParams.value = tokenParams;
    ProjectService.searchProjects(
        `${tokenParams}&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`,
        returnOnlyActiveProjects.value,
        selectedStatuses.value.map(status => status.value)
    ).then((response) => {
        projects.value = response.data.content;
        totalProjects.value = response.data.totalElements;
    })
    .finally(() => {
        loading.value = false;
        initialLoad.value = false;
    });
};

const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
    page.value = nextPage;
    size.value = pageSize;
    sort.value = sortField;
    direction.value = sortDir;
    search(searchParams.value);
};

const toggleStatus = (status: { title: string, value: ProjectStatus }, isSelected: boolean) => {
    if (isSelected) {
        selectedStatuses.value.push(status);
    } else {
        const index = selectedStatuses.value.findIndex(s => s.value === status.value);
        if (index > -1) {
            selectedStatuses.value.splice(index, 1);
        }
    }

    search(searchParams.value);
};

const addProject = () => {
    router.push({name: "submitProject"});
};
</script>

<style scoped>
.status-filter {
    min-width: 280px;
    padding: 12px;
    background: #ffffff;
}

.filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
}

.filter-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: #1a1a1a;
    letter-spacing: 0.01em;
}

.checkbox-grid {
    display: grid;
    gap: 8px;
    padding: 4px 0;
}

.checkbox-item {
    padding: 4px 8px;
    border-radius: 6px;
    transition: background-color 0.2s ease;
}

.checkbox-item:hover {
    background-color: #f5f5f5;
}
</style>

<style>
.checkbox-item .v-label--clickable {
    width: 100%;
}
</style>
