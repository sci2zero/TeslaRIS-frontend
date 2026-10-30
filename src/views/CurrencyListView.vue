<template>
    <v-container>
        <h1>{{ $t("currencyListLabel") }}</h1>
        <br>
        <br>
        <search-bar-component @search="clearSortAndPerformSearch" />
        <br>
        <br>
        <br>
        <tab-content-loader
            v-if="loading"
            button-header
            :tab-number="2"
            layout="table"
        />
        <currency-table-component
            v-else
            ref="tableRef"
            :currencies="currencies"
            :total-currencies="totalCurrencies"
            @switch-page="switchPage" />
    </v-container>
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue';
import SearchBarComponent from '@/components/core/SearchBarComponent.vue';
import CurrencyService from '@/services/CurrencyService';
import CurrencyTableComponent from '@/components/currency/CurrencyTableComponent.vue';
import { ref } from 'vue';
import type { Currency } from '@/models/Common';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import TabContentLoader from '@/components/core/TabContentLoader.vue';


export default defineComponent({
    name: "CurrencyListView",
    components: { SearchBarComponent, CurrencyTableComponent, TabContentLoader },
    setup() {
        const loading = ref(false);

        const searchParams = ref("tokens=");
        const currencies = ref<Currency[]>([]);
        const totalCurrencies = ref(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const i18n = useI18n();
        const tableRef = ref<typeof CurrencyTableComponent>();

        onMounted(() => {
            document.title = i18n.t("currencyListLabel");
            loading.value = true;
        });

        watch(i18n.locale, () => {
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
            CurrencyService.searchCurrencies(`${tokenParams}&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`)
            .then((response) => {
                currencies.value = response.data.content;
                totalCurrencies.value = response.data.totalElements;
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

        return {
            search, currencies, totalCurrencies, switchPage,
            clearSortAndPerformSearch, tableRef, loading
        };
    }
});
</script>
