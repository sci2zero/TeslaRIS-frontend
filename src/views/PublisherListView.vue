<template>
    <h1>{{ $t("publisherListLabel") }}</h1>
    <br />
    <br />
    <search-bar-component @search="search"></search-bar-component>
    <br />
    <v-btn color="primary" @click="addPublisher">
        {{ $t("addPublisherLabel") }}
    </v-btn>
    <br />
    <br />
    <publisher-table-component :publishers="publishers" :total-publishers="totalPublishers" @switch-page="switchPage"></publisher-table-component>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SearchBarComponent from '@/components/core/SearchBarComponent.vue';
import PublisherService from '@/services/PublisherService';
import PublisherTableComponent from '@/components/publisher/PublisherTableComponent.vue';
import { ref } from 'vue';
import type { PublisherIndex } from '@/models/PublisherModel';
import { useRouter } from 'vue-router';

export default defineComponent({
    name: "PublisherListView",
    components: {SearchBarComponent, PublisherTableComponent},
    setup() {
        const searchParams = ref("tokens=");
        const publishers = ref<PublisherIndex[]>([]);
        const totalPublishers = ref(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const router = useRouter();

        const search = (tokenParams: string) => {
            searchParams.value = tokenParams;
            PublisherService.searchPublishers(`${tokenParams}&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`).then((response) => {
                publishers.value = response.data.content;
                totalPublishers.value = response.data.totalElements;
            });
        };

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            sort.value = sortField;
            direction.value = sortDir;
            search(searchParams.value);
        }

        const addPublisher = () => {
            router.push({name: "submitPublisher"});
        }

        return {search, publishers, totalPublishers, switchPage, addPublisher};
    }
});
</script>
