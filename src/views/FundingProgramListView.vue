<template>
    <div class="container py-4 px-4 mx-auto">
        <h1 class="text-2xl font-bold mb-4">
            {{ $t("fundingProgramsLabel") }}
        </h1>

        <tab-content-loader
            v-if="loading"
            button-header
            :tab-number="3"
            layout="table"
        />
        <funding-program-table-component
            v-else
            ref="tableRef"
            :funding-programs="fundingPrograms"
            :total-funding-programs="totalFundingPrograms"
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
                                v-model="returnOnlyActiveFundingPrograms"
                                :label="$t('showOnlyActiveLabel')"
                                hide-details
                            />
<!--                            TODO: Uncomment when the Funder role is added -->
<!--                            <v-checkbox-->
<!--                                v-model="returnOnlyMyFundingPrograms"-->
<!--                                :label="$t('showOnlyMyLabel')"-->
<!--                                hide-details-->
<!--                            />-->
                        </div>
                    </v-menu>
                    <v-btn color="primary" @click="addFundingProgram">
                        {{ $t("createNewFundingProgramLabel") }}
                    </v-btn>
                </div>
            </template>
        </funding-program-table-component>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import SearchBarComponent from '@/components/core/SearchBarComponent.vue';
import FundingProgramService from '@/services/project/FundingProgramService';
import FundingProgramTableComponent from '@/components/project/FundingProgramTableComponent.vue';
import type { FundingProgramIndex } from '@/models/FundingModel';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import TabContentLoader from '@/components/core/TabContentLoader.vue';
import AddPublicationMenu from "@/components/publication/AddPublicationMenu.vue";


const loading = ref(false);

const searchParams = ref("tokens=");
const fundingPrograms = ref<FundingProgramIndex[]>([]);
const totalFundingPrograms = ref(0);
const page = ref(0);
const size = ref(1);
const sort = ref("");
const direction = ref("");

const returnOnlyActiveFundingPrograms = ref(false);
// TODO: Implement the remainder of the functionality when Funder role is added
const returnOnlyMyFundingPrograms = ref(false);
const initialLoad = ref(true);

const i18n = useI18n();
const router = useRouter();
const tableRef = ref<InstanceType<typeof FundingProgramTableComponent>>();

onMounted(() => {
    document.title = i18n.t("fundingProgramsLabel");
    loading.value = true;
    search(searchParams.value);
});

watch(returnOnlyActiveFundingPrograms, () => {
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
    FundingProgramService.searchFundingPrograms(
        `${tokenParams}&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`,
        null,
        returnOnlyActiveFundingPrograms.value
    ).then((response) => {
        fundingPrograms.value = response.data.content;
        totalFundingPrograms.value = response.data.totalElements;
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

const addFundingProgram = () => {
    router.push({name: "submitFundingProgram"});
};
</script>
