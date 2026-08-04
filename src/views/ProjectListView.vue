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
            @switch-page="switchPage">
            <template #top-left>
                <search-bar-component
                    :transparent="false"
                    size="small"
                    @search="clearSortAndPerformSearch"
                />
            </template>
            <template #actions>
                <v-btn color="primary" @click="addProject">
                    {{ $t("createNewProjectLabel") }}
                </v-btn>
            </template>
        </project-table-component>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import SearchBarComponent from '@/components/core/SearchBarComponent.vue';
import ProjectService from '@/services/project/ProjectService';
import ProjectTableComponent from '@/components/project/ProjectTableComponent.vue';
import type { ProjectIndex } from '@/models/ProjectModel';
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

const i18n = useI18n();
const router = useRouter();
const tableRef = ref<InstanceType<typeof ProjectTableComponent>>();

onMounted(() => {
    document.title = i18n.t("projectsLabel");
    loading.value = true;
    search(searchParams.value);
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
        `${tokenParams}&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`
    ).then((response) => {
        projects.value = response.data.content;
        totalProjects.value = response.data.totalElements;
    })
    .finally(() => {
        loading.value = false;
    });
};

const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
    page.value = nextPage;
    size.value = pageSize;
    sort.value = sortField;
    direction.value = sortDir;
    search(searchParams.value);
};

const addProject = () => {
    router.push({name: "submitProject"});
};
</script>
