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
            :has-active-type-filters="selectedFundingTypes.length > 0"
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
                                v-model="returnOnlyActiveFundingCalls"
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
                    <v-btn color="primary" @click="addFundingCall">
                        {{ $t("createNewFundingCallLabel") }}
                    </v-btn>
                </div>
            </template>
            <template #type-filter-menu>
                <div class="funding-type-filter">
                    <div class="filter-header">
                        <span class="filter-title">{{ $t('fundingTypesLabel') }}</span>
                    </div>
                    <v-divider class="my-2"></v-divider>
                    <div class="checkbox-grid">
                        <div
                            v-for="type in fundingTypes"
                            :key="type.value"
                            class="checkbox-item"
                        >
                            <v-checkbox
                                :model-value="selectedFundingTypes.some(t => t.value === type.value)"
                                :label="type.title"
                                density="compact"
                                hide-details
                                class="w-full"
                                color="primary"
                                @update:model-value="toggleFundingType(type, !!$event)"
                            />
                        </div>
                    </div>
                </div>
            </template>
        </funding-call-table-component>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import SearchBarComponent from '@/components/core/SearchBarComponent.vue';
import FundingCallService from '@/services/project/FundingCallService';
import FundingCallTableComponent from '@/components/project/FundingCallTableComponent.vue';
import type { FundingCallIndex } from '@/models/FundingCallModel';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import TabContentLoader from '@/components/core/TabContentLoader.vue';
import { getFundingTypesForGivenLocale } from '@/i18n/fundingType';
import type { FundingType } from '@/models/FundingModel';


const loading = ref(false);

const searchParams = ref("tokens=");
const fundingCalls = ref<FundingCallIndex[]>([]);
const totalFundingCalls = ref(0);
const page = ref(0);
const size = ref(1);
const sort = ref("");
const direction = ref("");

const fundingTypes = computed(() => getFundingTypesForGivenLocale() ?? []);
const selectedFundingTypes = ref<{ title: string, value: FundingType }[]>([]);

const returnOnlyActiveFundingCalls = ref(false);
// TODO: Implement the remainder of the functionality when Funder role is added
const returnOnlyMyFundingPrograms = ref(false);
const initialLoad = ref(true);

const i18n = useI18n();
const router = useRouter();
const tableRef = ref<InstanceType<typeof FundingCallTableComponent>>();

onMounted(() => {
    document.title = i18n.t("fundingCallsLabel");
    loading.value = true;
    search(searchParams.value);
});

watch(returnOnlyActiveFundingCalls, () => {
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
    FundingCallService.searchFundingCalls(
        `${tokenParams}&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`,
        null,
        returnOnlyActiveFundingCalls.value,
        selectedFundingTypes.value.map(fundingType => fundingType.value)
    ).then((response) => {
        fundingCalls.value = response.data.content;
        totalFundingCalls.value = response.data.totalElements;
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

const toggleFundingType = (type: { title: string, value: FundingType }, isSelected: boolean) => {
    if (isSelected) {
        selectedFundingTypes.value.push(type);
    } else {
        const index = selectedFundingTypes.value.findIndex(t => t.value === type.value);
        if (index > -1) {
            selectedFundingTypes.value.splice(index, 1);
        }
    }

    search(searchParams.value);
};

const addFundingCall = () => {
    router.push({name: "submitFundingCall"});
};
</script>

<style scoped>
.funding-type-filter {
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
