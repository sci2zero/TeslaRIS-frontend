<template>
    <v-container>
        <h1>{{ $t("bookSeriesListLabel") }}</h1>
        <br />
        <br />
        <search-bar-component @search="clearSortAndPerformSearch"></search-bar-component>
        <br />
        <v-btn color="primary" @click="addBookSeries">
            {{ $t("createNewBookSeriesLabel") }}
        </v-btn>
        <br />
        <br />

        <tab-content-loader
            v-if="loading"
            button-header
            tab-number-by-role
            layout="table"
        />
        <book-series-table-component
            v-else
            ref="tableRef"
            :book-series="bookSeries"
            :total-book-series="totalBookSeries"
            @switch-page="switchPage"
        />
    </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SearchBarComponent from '@/components/core/SearchBarComponent.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import BookSeriesService from '@/services/BookSeriesService';
import BookSeriesTableComponent from "@/components/bookSeries/BookSeriesTableComponent.vue";
import type { BookSeriesIndex } from '@/models/BookSeriesModel';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import TabContentLoader from '@/components/core/TabContentLoader.vue';


export default defineComponent({
    name: "BookSeriesListView",
    components: { SearchBarComponent, BookSeriesTableComponent, TabContentLoader },
    setup() {
        const loading = ref(false);

        const searchParams = ref("tokens=");
        const bookSeries = ref<BookSeriesIndex[]>([]);
        const totalBookSeries = ref(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const i18n = useI18n();
        const router = useRouter();
        const tableRef = ref<typeof BookSeriesTableComponent>();

        onMounted(() => {
            document.title = i18n.t("bookSeriesListLabel");
            loading.value = true;
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
            BookSeriesService.searchBookSeries(`${tokenParams}&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`)
            .then((response) => {
                bookSeries.value = response.data.content;
                totalBookSeries.value = response.data.totalElements;
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

        const addBookSeries = () => {
            router.push({name: "submitBookSeries"});
        };

        return {
            search, bookSeries, totalBookSeries,
            switchPage, addBookSeries, tableRef,
            clearSortAndPerformSearch, loading
        };
    }
});
</script>
