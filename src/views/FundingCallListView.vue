<template>
    <div class="container py-4 px-4 mx-auto">
        <h1 class="text-2xl font-bold mb-4">
            {{ $t("fundingCallsLabel") }}
        </h1>

        <tab-content-loader
            v-if="loading"
            button-header
            :tab-number="3"
            layout="table"
        />
        <funding-call-table-component
            v-else
            ref="tableRef"
            :funding-calls="fundingCalls"
            :total-funding-calls="totalFundingCalls"
            @switch-page="switchPage">
            <template #top-left>
                <search-bar-component
                    :transparent="false"
                    size="small"
                    @search="clearSortAndPerformSearch"
                />
            </template>
            <template #actions>
                <v-btn color="primary" @click="addFundingCall">
                    {{ $t("createNewFundingCallLabel") }}
                </v-btn>
            </template>
        </funding-call-table-component>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import SearchBarComponent from '@/components/core/SearchBarComponent.vue';
import FundingCallService from '@/services/project/FundingCallService';
import FundingCallTableComponent from '@/components/project/FundingCallTableComponent.vue';
import type { FundingCallIndex } from '@/models/FundingCallModel';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import TabContentLoader from '@/components/core/TabContentLoader.vue';


const loading = ref(false);

const searchParams = ref("tokens=");
const fundingCalls = ref<FundingCallIndex[]>([]);
const totalFundingCalls = ref(0);
const page = ref(0);
const size = ref(1);
const sort = ref("");
const direction = ref("");

const i18n = useI18n();
const router = useRouter();
const tableRef = ref<InstanceType<typeof FundingCallTableComponent>>();

onMounted(() => {
    document.title = i18n.t("fundingCallsLabel");
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
    FundingCallService.searchFundingCalls(
        `${tokenParams}&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`
    ).then((response) => {
        fundingCalls.value = response.data.content;
        totalFundingCalls.value = response.data.totalElements;
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

const addFundingCall = () => {
    router.push({name: "submitFundingCall"});
};
</script>
