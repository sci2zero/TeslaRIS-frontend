<template>
    <v-container>
        <h1>{{ $t("ouListLabel") }}</h1>
        <br />
        <br />
        <search-bar-component @search="clearSortAndPerformSearch"></search-bar-component>
        <br />
        <v-btn v-if="userRole && userRole !== 'RESEARCHER'" color="primary" @click="addOU">
            {{ $t("addOULabel") }}
        </v-btn>
        <br />
        <br />
        <organisation-unit-table-component ref="tableRef" :organisation-units="organisationUnits" :total-o-us="totalOUs" @switch-page="switchPage"></organisation-unit-table-component>
    </v-container>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import SearchBarComponent from '@/components/core/SearchBarComponent.vue';
import OrganisationUnitService from '@/services/OrganisationUnitService';
import OrganisationUnitTableComponent from '@/components/organisationUnit/OrganisationUnitTableComponent.vue';
import { ref } from 'vue';
import type { OrganisationUnitIndex } from '@/models/OrganisationUnitModel';
import { useRouter } from 'vue-router';
import UserService from '@/services/UserService';
import { useI18n } from 'vue-i18n';

export default defineComponent({
    name: "OrganisationUnitListView",
    components: {SearchBarComponent, OrganisationUnitTableComponent},
    setup() {
        const searchParams = ref("tokens=");
        const organisationUnits = ref<OrganisationUnitIndex[]>([]);
        const totalOUs = ref(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const i18n = useI18n();
        const router = useRouter();
        const userRole = UserService.provideUserRole();
        const tableRef = ref<typeof OrganisationUnitTableComponent>();

        onMounted(() => {
            document.title = i18n.t("ouListLabel");
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
            OrganisationUnitService.searchOUs(`${tokenParams}&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`).then((response) => {
                organisationUnits.value = response.data.content;
                totalOUs.value = response.data.totalElements;
            });
        };

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            sort.value = sortField;
            direction.value = sortDir;
            search(searchParams.value);
        }

        const addOU = () => {
            router.push({name: "submitOrganisationUnit"});
        }

        return {
            search, organisationUnits, totalOUs,
            switchPage, addOU, userRole,
            clearSortAndPerformSearch, tableRef
        };
    }
});
</script>
