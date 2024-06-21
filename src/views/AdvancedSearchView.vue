<template>
    <v-container>
        <h1>{{ $t("advancedSearchLabel") }}</h1>
        <br />
        <br />
        <search-bar-component :preset-search-input="searchParams" @search="search"></search-bar-component>
        <br />
        <br />
        <br />
        <v-card>
            <v-tabs
                v-model="currentTab"
                bg-color="blue-grey-lighten-5"
                color="deep-purple-accent-4"
                align-tabs="center"
            >
                <v-tab value="persons" @click="search(searchParams)">
                    {{ $t("personListLabel") }}
                </v-tab>
                <v-tab value="organisationUnits" @click="search(searchParams)">
                    {{ $t("ouListLabel") }}
                </v-tab>
                <v-tab value="publications" @click="search(searchParams)">
                    {{ $t("scientificResultsListLabel") }}
                </v-tab>
            </v-tabs>
  
            <v-card-text>
                <v-window v-model="currentTab">
                    <v-window-item value="persons">
                        <person-table-component :persons="persons" :total-persons="totalPersons" @switch-page="switchPage"></person-table-component>
                    </v-window-item>
  
                    <v-window-item value="organisationUnits">
                        <organisation-unit-table-component :organisation-units="organisationUnits" :total-o-us="totalOUs" @switch-page="switchPage"></organisation-unit-table-component>
                    </v-window-item>
  
                    <v-window-item value="publications">
                        <publication-table-component :publications="publications" :total-publications="totalPublications" @switch-page="switchPage"></publication-table-component>
                    </v-window-item>
                </v-window>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script lang="ts">
import { ref } from "vue";
import { defineComponent } from "vue";
import SearchBarComponent from '@/components/core/SearchBarComponent.vue';
import OrganisationUnitTableComponent from '@/components/organisationUnit/OrganisationUnitTableComponent.vue';
import PersonTableComponent from '@/components/person/PersonTableComponent.vue';
import PublicationTableComponent from '@/components/publication/PublicationTableComponent.vue';
import type { OrganisationUnitIndex } from "@/models/OrganisationUnitModel";
import OrganisationUnitService from "@/services/OrganisationUnitService";
import PersonService from "@/services/PersonService";
import type { PersonIndex } from "@/models/PersonModel";
import type { DocumentPublicationIndex } from "@/models/PublicationModel";
import DocumentPublicationService from "@/services/DocumentPublicationService";
import { useRoute, useRouter } from "vue-router";
import { onMounted } from "vue";


export default defineComponent({
    name: "AdvancedSearchVuew",
    components: {SearchBarComponent, OrganisationUnitTableComponent, PersonTableComponent, PublicationTableComponent},
    setup() {
        const route = useRoute();
        const router = useRouter();
        const currentTab = ref("persons");

        const searchParams = ref(route.query.searchQuery as string);

        const organisationUnits = ref<OrganisationUnitIndex[]>([]);
        const persons = ref<PersonIndex[]>([]);
        const publications = ref<DocumentPublicationIndex[]>([]);

        const totalOUs = ref(0);
        const totalPersons = ref(0);
        const totalPublications = ref(0);
        
        const page = ref(0);
        const size = ref(1);

        const sortPerson = ref("");
        const sortOU = ref("");
        const sortPublication = ref("");
        const direction = ref("");

        onMounted(() => {
            currentTab.value = route.query.tab as string
        });
    
        const search = (tokenParams: string) => {
            searchParams.value = tokenParams;
            
            if (!currentTab.value) {
                currentTab.value = "persons";
            }
            
            if(tokenParams) {
                router.push({name:"advancedSearch", query: { searchQuery: tokenParams.split("=")[1], tab: currentTab.value }});
            }
            
            switch(currentTab.value) {
                case "persons":
                    PersonService.searchResearchers(`${tokenParams}&page=${page.value}&size=${size.value}&sort=${sortPerson.value},${direction.value}`).then((response) => {
                        persons.value = response.data.content;
                        totalPersons.value = response.data.totalElements;
                    });
                    break;
                case "organisationUnits":
                    OrganisationUnitService.searchOUs(`${tokenParams}&page=${page.value}&size=${size.value}&sort=${sortOU.value},${direction.value}`).then((response) => {
                        organisationUnits.value = response.data.content;
                        totalOUs.value = response.data.totalElements;
                    });
                    break;
                case "publications":
                    DocumentPublicationService.searchDocumentPublications(`${tokenParams}&page=${page.value}&size=${size.value}&sort=${sortPublication.value},${direction.value}`).then((response) => {
                        publications.value = response.data.content;
                        totalPublications.value = response.data.totalElements;
                    });
                    break;
            }
        };

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            direction.value = sortDir;
            switch(currentTab.value) {
                case "persons":
                    sortPerson.value = sortField;
                    break;
                case "organisationUnits":
                    sortOU.value = sortField;
                    break;
                case "publications":
                    sortPublication.value = sortField;
                    break;
            }
            search(searchParams.value as string);
        }

        return {currentTab, persons, organisationUnits, publications, totalPersons, totalOUs, totalPublications, search, switchPage, searchParams};
    }
});
</script>
