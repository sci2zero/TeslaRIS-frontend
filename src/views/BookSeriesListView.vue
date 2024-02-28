<template>
    <v-container>
        <h1>{{ $t("bookSeriesListLabel") }}</h1>
        <br />
        <br />
        <search-bar-component @search="search"></search-bar-component>
        <br />
        <v-btn color="primary" @click="addBookSeries">
            {{ $t("addBookSeriesLabel") }}
        </v-btn>
        <br />
        <br />
        <book-series-table-component :book-series="bookSeries" :total-book-series="totalBookSeries" @switch-page="switchPage"></book-series-table-component>
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

export default defineComponent({
    name: "BookSeriesListView",
    components: {SearchBarComponent, BookSeriesTableComponent},
    setup() {
        const searchParams = ref("tokens=");
        const bookSeries = ref<BookSeriesIndex[]>([]);
        const totalBookSeries = ref(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const router = useRouter();

        const search = (tokenParams: string) => {
            searchParams.value = tokenParams;
            BookSeriesService.searchBookSeries(`${tokenParams}&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`).then((response) => {
                bookSeries.value = response.data.content;
                totalBookSeries.value = response.data.totalElements;
            });
        };

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            sort.value = sortField;
            direction.value = sortDir;
            search(searchParams.value);
        }

        const addBookSeries = () => {
            router.push({name: "submitBookSeries"});
        }

        return {search, bookSeries, totalBookSeries, switchPage, addBookSeries};
    }
});
</script>
