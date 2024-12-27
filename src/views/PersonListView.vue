<template>
    <v-container>
        <h1>{{ $t("personListLabel") }}</h1>
        <br />
        <br />
        <search-bar-component @search="clearSortAndPerformSearch($event)"></search-bar-component>
        <br />
        <v-btn v-if="userRole === 'ADMIN' || userRole === 'INSTITUTIONAL_EDITOR'" color="primary" @click="addPerson">
            {{ $t("addPersonLabel") }}
        </v-btn>
        <br />
        <br />
        <person-table-component ref="tableRef" :persons="persons" :total-persons="totalPersons" @switch-page="switchPage"></person-table-component>
    </v-container>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from 'vue';
import SearchBarComponent from '@/components/core/SearchBarComponent.vue';
import PersonService from '@/services/PersonService';
import PersonTableComponent from '@/components/person/PersonTableComponent.vue';
import { ref } from 'vue';
import type { PersonIndex } from '@/models/PersonModel';
import { useRouter } from 'vue-router';
import UserService from '@/services/UserService';
import { useI18n } from 'vue-i18n';

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

        const i18n = useI18n();
        const router = useRouter();

        const userRole = computed(() => UserService.provideUserRole());
        const tableRef = ref<typeof PersonTableComponent>();

        onMounted(() => {
            document.title = i18n.t("personListLabel");
        });

        const search = (tokenParams: string) => {
            searchParams.value = tokenParams;
            PersonService.searchResearchers(`${tokenParams}&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`, false).then((response) => {
                persons.value = response.data.content;
                totalPersons.value = response.data.totalElements;
            });
        };

        const clearSortAndPerformSearch = (tokenParams: string) => {
            tableRef.value?.setSortOption([]);
            search(tokenParams); 
        };

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            sort.value = sortField;
            direction.value = sortDir;
            search(searchParams.value);
        };

        const addPerson = () => {
            router.push({name: "submitPerson"});
        };

        return {
            search, persons, totalPersons,
            switchPage, addPerson, userRole,
            tableRef, clearSortAndPerformSearch
        };
    }
});
</script>
