<template>
    <v-container>
        <h1>{{ $t("countryListLabel") }}</h1>
        <br />
        <br />
        <search-bar-component @search="clearSortAndPerformSearch"></search-bar-component>
        <br />
        <br />
        <br />
        <tab-content-loader
            v-if="loading"
            button-header
            :tab-number="2"
            layout="table"
        />
        <country-table-component
            v-else
            ref="tableRef"
            :countries="countries"
            :total-countrys="totalCountries"
            @switch-page="switchPage">
        </country-table-component>
    </v-container>
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue';
import SearchBarComponent from '@/components/core/SearchBarComponent.vue';
import CountryService from '@/services/CountryService';
import CountryTableComponent from '@/components/country/CountryTableComponent.vue';
import { ref } from 'vue';
import type { Country } from '@/models/Common';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import TabContentLoader from '@/components/core/TabContentLoader.vue';


export default defineComponent({
    name: "CountryListView",
    components: { SearchBarComponent, CountryTableComponent, TabContentLoader },
    setup() {
        const loading = ref(false);

        const searchParams = ref("tokens=");
        const countries = ref<Country[]>([]);
        const totalCountries = ref(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const i18n = useI18n();
        const tableRef = ref<typeof CountryTableComponent>();

        onMounted(() => {
            document.title = i18n.t("countryListLabel");
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
            CountryService.searchCountries(`${tokenParams}&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`)
            .then((response) => {
                countries.value = response.data.content;
                totalCountries.value = response.data.totalElements;
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
            search, countries, totalCountries, switchPage,
            clearSortAndPerformSearch, tableRef, loading
        };
    }
});
</script>
