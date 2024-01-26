<template>
    <h1>{{ $t("scientificResultsListLabel") }}</h1>
    <br />
    <br />
    <search-bar-component @search="search"></search-bar-component>
    <br />
    <v-btn color="primary" @click="addJournalPublication">
        {{ $t("addJournalPublicationLabel") }}
    </v-btn>
    <br />
    <br />
    <publication-table-component :publications="publications" :total-publications="totalPublications" @switch-page="switchPage"></publication-table-component>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SearchBarComponent from '@/components/core/SearchBarComponent.vue';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import PublicationTableComponent from '@/components/publication/PublicationTableComponent.vue';
import { ref } from 'vue';
import type { DocumentPublicationIndex } from '@/models/PublicationModel';
import { useRouter } from 'vue-router';

export default defineComponent({
    name: "ScientificResultsListView",
    components: {SearchBarComponent, PublicationTableComponent},
    setup() {
        const searchParams = ref("tokens=");
        const publications = ref<DocumentPublicationIndex[]>([]);
        const totalPublications = ref(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const router = useRouter();

        const search = (tokenParams: string) => {
            searchParams.value = tokenParams;
            DocumentPublicationService.searchDocumentPublications(`${tokenParams}&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`).then((response) => {
                publications.value = response.data.content;
                totalPublications.value = response.data.totalElements;
            });
        };

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            sort.value = sortField;
            direction.value = sortDir;
            search(searchParams.value);
        }

        const addJournalPublication = () => {
            router.push({name: "submitJournalPublication"});
        }

        return {search, publications, totalPublications, switchPage, addJournalPublication};
    }
});
</script>
