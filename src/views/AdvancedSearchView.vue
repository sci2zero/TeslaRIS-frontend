<template>
    <v-container>
        <h1>{{ $t("simpleSearchLabel") }}</h1>
        <br />
        <br />
        <search-bar-component
            :preset-search-input="searchParams"
            focus-automatically
            @search="clearSortAndPerformSearch"
        />
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
                    <v-window-item value="persons" eager>
                        <person-table-component
                            ref="parsonTableRef"
                            :persons="persons"
                            :total-persons="totalPersons"
                            enable-export
                            :endpoint-type="ExportableEndpointType.PERSON_SEARCH"
                            :endpoint-token-parameters="searchParams.replaceAll('tokens=', '').split('&')"
                            @switch-page="switchPage">
                        </person-table-component>
                    </v-window-item>
  
                    <v-window-item value="organisationUnits" eager>
                        <organisation-unit-table-component
                            ref="ouTableRef"
                            :organisation-units="organisationUnits"
                            :total-o-us="totalOUs"
                            enable-export
                            :endpoint-type="ExportableEndpointType.ORGANISATION_UNIT_SEARCH"
                            :endpoint-token-parameters="[searchParams, 'null']"
                            @switch-page="switchPage">
                        </organisation-unit-table-component>
                    </v-window-item>
  
                    <v-window-item value="publications" eager>
                        <publication-table-component
                            ref="docTableRef"
                            :publications="publications"
                            :total-publications="totalPublications"
                            enable-export
                            :endpoint-type="currentTab === 'simpleSearch' ? ExportableEndpointType.DOCUMENT_SEARCH : ExportableEndpointType.DOCUMENT_ADVANCED_SEARCH"
                            :endpoint-token-parameters="searchParams.replaceAll('tokens=', '').split('&')"
                            :endpoint-body-parameters="
                                {
                                    allowedTypes: [],
                                    institutionId: null,
                                    commissionId: null
                                }"
                            @switch-page="switchPage">
                        </publication-table-component>
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
import { useI18n } from "vue-i18n";
import { ExportableEndpointType } from "@/models/Common";


export default defineComponent({
    name: "AdvancedSearchVuew",
    components: {SearchBarComponent, OrganisationUnitTableComponent, PersonTableComponent, PublicationTableComponent},
    setup() {
        const i18n = useI18n();
        const route = useRoute();
        const router = useRouter();
        const currentTab = ref("persons");

        const searchParams = ref(route.query.searchQuery ? route.query.searchQuery as string : "");

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

        const parsonTableRef = ref<typeof PersonTableComponent>();
        const ouTableRef = ref<typeof OrganisationUnitTableComponent>();
        const docTableRef = ref<typeof PublicationTableComponent>();

        onMounted(() => {
            currentTab.value = route.query.tab as string;
            document.title = i18n.t("simpleSearchLabel");
        });
    
        const search = (tokenParams: string) => {
            tokenParams = decodeURIComponent(tokenParams);

            if (!tokenParams || !tokenParams.includes("tokens")) {
                return;
            }

            if (!currentTab.value) {
                currentTab.value = "persons";
            }
            
            if(tokenParams) {
                searchParams.value = tokenParams;
                router.replace({name:"advancedSearch", query: { searchQuery: tokenParams.replaceAll("&", "").split("tokens=").filter(el => el).join(" "), tab: currentTab.value }});
            }
            
            switch(currentTab.value) {
                case "persons":
                    PersonService.searchResearchers(
                        `${tokenParams}&page=${page.value}&size=${size.value}&sort=${sortPerson.value},${direction.value}`,
                        false,
                        null
                    ).then((response) => {
                        persons.value = response.data.content;
                        totalPersons.value = response.data.totalElements;
                    });
                    break;
                case "organisationUnits":
                    OrganisationUnitService.searchOUs(
                        `${tokenParams}&page=${page.value}&size=${size.value}&sort=${sortOU.value},${direction.value}`,
                        null,
                        null
                    ).then((response) => {
                        organisationUnits.value = response.data.content;
                        totalOUs.value = response.data.totalElements;
                    });
                    break;
                case "publications":
                    DocumentPublicationService.searchDocumentPublications(
                        `${tokenParams}&page=${page.value}&size=${size.value}&sort=${sortPublication.value},${direction.value}`,
                        null,
                        false,
                        []
                    ).then((response) => {
                        publications.value = response.data.content;
                        totalPublications.value = response.data.totalElements;
                    });
                    break;
            }
        };

        const clearSortAndPerformSearch = (tokenParams: string) => {
            parsonTableRef.value?.setSortAndPageOption([], 1);
            ouTableRef.value?.setSortAndPageOption([], 1);
            docTableRef.value?.setSortAndPageOption([], 1);
            
            page.value = 0;

            sortPerson.value = "";
            sortOU.value = "";
            sortPublication.value = "";
            
            direction.value = "";
            search(tokenParams);
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
        };

        return {
            currentTab, persons, organisationUnits,
            publications, totalPersons, totalOUs,
            totalPublications, search, switchPage,
            searchParams, ExportableEndpointType,
            clearSortAndPerformSearch, ouTableRef,
            parsonTableRef, docTableRef
        };
    }
});
</script>
