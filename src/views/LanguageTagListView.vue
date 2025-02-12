<template>
    <v-container>
        <h1>{{ $t("languageTagListLabel") }}</h1>
        <br />
        <br />
        <search-bar-component @search="clearSortAndPerformSearch"></search-bar-component>
        <br />
        <br />
        <br />
        <language-tag-table-component ref="tableRef" :language-tags="languageTags" :total-language-tags="totalCountries" @switch-page="switchPage"></language-tag-table-component>
    </v-container>
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue';
import SearchBarComponent from '@/components/core/SearchBarComponent.vue';
import LanguageService from '@/services/LanguageService';
import LanguageTagTableComponent from '@/components/languageTag/LanguageTagTableComponent.vue';
import { ref } from 'vue';
import type { LanguageTagResponse } from '@/models/Common';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';


export default defineComponent({
    name: "LanguageTagListView",
    components: {SearchBarComponent, LanguageTagTableComponent},
    setup() {
        const searchParams = ref("tokens=");
        const languageTags = ref<LanguageTagResponse[]>([]);
        const totalCountries = ref(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const i18n = useI18n();
        const tableRef = ref<typeof LanguageTagTableComponent>();

        onMounted(() => {
            document.title = i18n.t("languageTagListLabel");
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
            LanguageService.searchLanguageTags(`${tokenParams}&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`).then((response) => {
                languageTags.value = response.data.content;
                totalCountries.value = response.data.totalElements;
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
            search, languageTags, totalCountries, switchPage,
            clearSortAndPerformSearch, tableRef
        };
    }
});
</script>
