<template>
    <h1>{{ $t("journalListLabel") }}</h1>
    <br />
    <br />
    <search-bar-component @search="search"></search-bar-component>
    <br />
    <v-btn color="primary" @click="addJournal">
        {{ $t("addJournalLabel") }}
    </v-btn>
    <br />
    <br />
    <journal-table-component :journals="journals" :total-journals="totalJournals" @switch-page="switchPage"></journal-table-component>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SearchBarComponent from '@/components/core/SearchBarComponent.vue';
import JournalService from '@/services/JournalService';
import JournalTableComponent from '@/components/journal/JournalTableComponent.vue';
import { ref } from 'vue';
import type { JournalIndex } from '@/models/JournalModel';
import { useRouter } from 'vue-router';

export default defineComponent({
    name: "JournalListView",
    components: {SearchBarComponent, JournalTableComponent},
    setup() {
        const searchParams = ref("tokens=");
        const journals = ref<JournalIndex[]>([]);
        const totalJournals = ref(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const router = useRouter();

        const search = (tokenParams: string) => {
            searchParams.value = tokenParams;
            JournalService.searchJournals(`${tokenParams}&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`).then((response) => {
                journals.value = response.data.content;
                totalJournals.value = response.data.totalElements;
            });
        };

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            sort.value = sortField;
            direction.value = sortDir;
            search(searchParams.value);
        }

        const addJournal = () => {
            router.push({name: "submitJournal"});
        }

        return {search, journals, totalJournals, switchPage, addJournal};
    }
});
</script>
