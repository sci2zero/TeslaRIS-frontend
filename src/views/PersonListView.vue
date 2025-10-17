<template>
    <div class="container py-4 px-4 mx-auto">
        <h1 class="text-2xl font-bold mb-4">
            {{ $t("personListLabel") }}
        </h1>
        
        <span :class="'d-flex align-center ' + (isAdmin || isInstitutionalEditor ? 'mb-3' : '')">
            <v-checkbox
                v-if="isUserBoundToOU"
                v-model="returnOnlyInstitutionRelatedEntities"
                :label="$t('showEntitiesForMyInstitutionLabel')"
                class="ml-4 mt-5"
            ></v-checkbox>
        </span>

        <tab-content-loader
            v-if="loading"
            button-header
            tab-number-by-role
            layout="table"
        />
        <person-table-component
            v-else
            ref="tableRef"
            :persons="persons"
            :total-persons="totalPersons"
            enable-export
            :allow-comparison="isInstitutionalEditor && (returnOnlyInstitutionRelatedEntities as boolean)"
            :endpoint-type="ExportableEndpointType.PERSON_SEARCH"
            :endpoint-token-parameters="searchParams.replaceAll('&tokens=', 'tokens=').split('tokens=').filter(token => token)"
            @switch-page="switchPage">
            <template #top-left>
                <search-bar-component :transparent="false" size="small" @search="clearSortAndPerformSearch($event)"></search-bar-component>
            </template>
            <template #actions>
                <v-btn v-if="isAdmin || isInstitutionalEditor" color="primary" prepend-icon="mdi-plus" @click="addPerson">
                    {{ $t("createNewPersonLabel") }}
                </v-btn>
            </template>
        </person-table-component>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, watch } from 'vue';
import SearchBarComponent from '@/components/core/SearchBarComponent.vue';
import PersonService from '@/services/PersonService';
import PersonTableComponent from '@/components/person/PersonTableComponent.vue';
import { ref } from 'vue';
import type { PersonIndex } from '@/models/PersonModel';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useUserRole } from '@/composables/useUserRole';
import { ExportableEndpointType } from '@/models/Common';
import TabContentLoader from '@/components/core/TabContentLoader.vue';


export default defineComponent({
    name: "PersonListView",
    components: { SearchBarComponent, PersonTableComponent, TabContentLoader },
    setup() {
        const loading = ref(false);

        const searchParams = ref("tokens=");
        const persons = ref<PersonIndex[]>([]);
        const totalPersons = ref(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const i18n = useI18n();
        const router = useRouter();

        const tableRef = ref<typeof PersonTableComponent>();

        const { isAdmin, isInstitutionalEditor, isUserBoundToOU, returnOnlyInstitutionRelatedEntities, loggedInUser } = useUserRole();

        onMounted(() => {
            document.title = i18n.t("personListLabel");
            loading.value = true;
        });

        watch([loggedInUser, returnOnlyInstitutionRelatedEntities], () => {
            search(searchParams.value);
        });

        const search = (tokenParams: string) => {
            searchParams.value = tokenParams;

            if (returnOnlyInstitutionRelatedEntities.value && !loggedInUser.value?.organisationUnitId) {
                return;
            }

            PersonService.searchResearchers(
                `${tokenParams}&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`,
                false,
                returnOnlyInstitutionRelatedEntities.value ? loggedInUser.value?.organisationUnitId as number : null)
            .then((response) => {
                persons.value = response.data.content;
                totalPersons.value = response.data.totalElements;
            })
            .finally(() => {
                loading.value = false;
            });
        };

        const clearSortAndPerformSearch = (tokenParams: string) => {
            tableRef.value?.setSortAndPageOption([], 1);
            page.value = 0;
            sort.value = "";
            direction.value = "";
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
            switchPage, addPerson, isAdmin,
            tableRef, clearSortAndPerformSearch,
            isInstitutionalEditor, isUserBoundToOU,
            returnOnlyInstitutionRelatedEntities,
            ExportableEndpointType, searchParams,
            loading
        };
    }
});
</script>
