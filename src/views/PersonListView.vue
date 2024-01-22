<template>
    <h1>{{ $t("personListLabel") }}</h1>
    <br />
    <br />
    <search-bar-component @search="search"></search-bar-component>
    <br />
    <v-btn color="primary" @click="addPerson">
        {{ $t("addPersonLabel") }}
    </v-btn>
    <br />
    <br />
    <person-table-component :persons="persons" :total-persons="totalPersons" @switch-page="switchPage"></person-table-component>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SearchBarComponent from '@/components/core/SearchBarComponent.vue';
import PersonService from '@/services/PersonService';
import PersonTableComponent from '@/components/person/PersonTableComponent.vue';
import { ref } from 'vue';
import type { PersonIndex } from '@/models/PersonModel';
import { useRouter } from 'vue-router';

export default defineComponent({
    name: "PersonListView",
    components: {SearchBarComponent, PersonTableComponent},
    setup() {
        const searchParams = ref("tokens=");
        const persons = ref<PersonIndex[]>([]);
        const totalPersons = ref(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const router = useRouter();

        const search = (tokenParams: string) => {
            searchParams.value = tokenParams;
            PersonService.searchResearchers(`${tokenParams}&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`).then((response) => {
                persons.value = response.data.content;
                totalPersons.value = response.data.totalElements;
            });
        };

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            sort.value = sortField;
            direction.value = sortDir;
            search(searchParams.value);
        }

        const addPerson = () => {
            router.push({name: "submitPerson"});
        }

        return {search, persons, totalPersons, switchPage, addPerson};
    }
});
</script>
