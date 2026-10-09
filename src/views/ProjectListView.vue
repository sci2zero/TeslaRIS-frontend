<template>
    <entity-list-layout :title="$t('projectsLabel')" icon="mdi-folder-outline">
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
            :allow-unbinding="returnOnlyMyProjects"
            @switch-page="switchPage">
            <template #top-left>
                <search-bar-component
                    :transparent="false"
                    size="small"
                    @search="clearSortAndPerformSearch"
                />
            </template>
            <template #actions>
                <div class="flex flex-wrap items-center gap-2">
                    <v-menu :close-on-content-click="false" location="bottom end">
                        <template #activator="{ props }">
                            <v-btn
                                v-bind="props"
                                variant="outlined"
                                prepend-icon="mdi-tune"
                                class="action-menu-trigger"
                            >
                                {{ $t("optionsLabel") }}
                            </v-btn>
                        </template>
                        <div class="entity-filter-panel">
                            <ui-checkbox
                                v-model="returnOnlyActiveProjects"
                                :label="$t('showOnlyActiveLabel')"
                                hide-details
                            />
                            <ui-checkbox
                                v-if="!returnOnlyMyProjects"
                                v-model="returnOnlyWithoutContributions"
                                :label="$t('showOnlyWithoutContributions')"
                                hide-details
                            />
                            <ui-checkbox
                                v-if="canFilterOwnProjects"
                                v-model="returnOnlyMyProjects"
                                :label="isResearcher ? $t('showOnlyMyProjectsLabel') : $t('showEntitiesForMyInstitutionLabel')"
                                hide-details
                            />
                        </div>
                    </v-menu>
                    <v-btn v-if="canUserAddProjects" prepend-icon="mdi-plus" color="primary" @click="addProject">
                        {{ $t("createNewProjectLabel") }}
                    </v-btn>
                </div>
            </template>
            <template #status-filter-menu>
                <project-status-filter v-model="selectedStatuses" />
            </template>
        </project-table-component>
    </entity-list-layout>
</template>

<script setup lang="ts">
import UiCheckbox from "@/components/ui/checkbox/Checkbox.vue";
import { computed, onMounted, ref, watch } from 'vue';
import EntityListLayout from '@/components/landing/EntityListLayout.vue';
import SearchBarComponent from '@/components/core/SearchBarComponent.vue';
import ProjectService from '@/services/project/ProjectService';
import ProjectTableComponent from '@/components/project/ProjectTableComponent.vue';
import type { ProjectIndex, ProjectStatus } from '@/models/ProjectModel';
import ProjectStatusFilter from '@/components/project/ProjectStatusFilter.vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import TabContentLoader from '@/components/core/TabContentLoader.vue';
import { useUserRole } from '@/composables/useUserRole';

const { canUserAddProjects, isResearcher, isInstitutionalEditor, loggedResearcherId, userInstitutionid } = useUserRole();
const canFilterOwnProjects = computed(() => isResearcher.value || isInstitutionalEditor.value);
const loading = ref(false);
const searchParams = ref("tokens=");
const projects = ref<ProjectIndex[]>([]);
const totalProjects = ref(0);
const page = ref(0);
const size = ref(1);
const sort = ref("");
const direction = ref("");

const selectedStatuses = ref<ProjectStatus[]>([]);

const returnOnlyActiveProjects = ref(false);
const returnOnlyWithoutContributions = ref(false);
const returnOnlyMyProjects = ref(false);
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

watch(returnOnlyWithoutContributions, () => {
  if (!initialLoad.value) {
    search(searchParams.value);
  }
});

watch(returnOnlyMyProjects, () => {
    if (!initialLoad.value) {
        clearSortAndPerformSearch(searchParams.value);
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

    const pageable = `${tokenParams}&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`;
    const statuses = selectedStatuses.value;

    let request;
    if (returnOnlyMyProjects.value && isResearcher.value) {
        if (loggedResearcherId.value <= 0) {
            loading.value = false;
            initialLoad.value = false;
            return;
        }
        request = ProjectService.findProjectsForResearcher(
            loggedResearcherId.value, pageable, returnOnlyActiveProjects.value, statuses);
    } else if (returnOnlyMyProjects.value && isInstitutionalEditor.value) {
        if (!userInstitutionid.value) {
            loading.value = false;
            initialLoad.value = false;
            return;
        }
        request = ProjectService.findProjectsForOrganisationUnit(
            userInstitutionid.value, pageable, returnOnlyActiveProjects.value, statuses);
    } else {
        request = ProjectService.searchProjects(
            pageable, returnOnlyActiveProjects.value, returnOnlyWithoutContributions.value, statuses);
    }

    request.then((response) => {
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

watch(selectedStatuses, () => {
    if (!initialLoad.value) clearSortAndPerformSearch(searchParams.value);
});

const addProject = () => {
    router.push({name: "submitProject"});
};
</script>
