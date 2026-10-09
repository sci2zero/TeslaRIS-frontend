<template>
    <entity-list-layout :title="$t('personListLabel')" icon="mdi-account-group-outline">
        <tab-content-loader
            v-if="loading"
            button-header
            tab-number-by-role
            layout="table"
        />
        <div v-else data-tutorial="persons-table">
            <person-table-component
                ref="tableRef"
                :persons="persons"
                :total-persons="totalPersons"
                enable-export
                :allow-comparison="isInstitutionalEditor && (returnOnlyInstitutionRelatedEntities as boolean)"
                :endpoint-type="ExportableEndpointType.PERSON_SEARCH"
                :endpoint-token-parameters="searchParams.replaceAll('&tokens=', 'tokens=').split('tokens=').filter(token => token)"
                @switch-page="switchPage">
                <template #top-left>
                    <search-bar-component :transparent="false" size="small" @search="clearSortAndPerformSearch($event)" />
                </template>
                <template #actions>
                    <v-menu v-if="hasInstitution || isAdmin" :close-on-content-click="false" location="bottom end">
                        <template #activator="{ props }">
                            <v-btn v-bind="props" variant="outlined" prepend-icon="mdi-tune" class="text-none">
                                {{ $t('optionsLabel') }}
                            </v-btn>
                        </template>
                        <div class="entity-filter-panel">
                            <v-checkbox
                                v-if="hasInstitution"
                                v-model="returnOnlyInstitutionRelatedEntities"
                                :label="$t('showEntitiesForMyInstitutionLabel')"
                                density="compact" hide-details color="primary"
                            />
                            <v-checkbox
                                v-if="isAdmin"
                                v-model="withNoInvolvements"
                                :label="$t('showPersonsWithNoInvolvementsLabel')"
                                density="compact" hide-details color="primary"
                            />
                            <v-checkbox
                                v-if="isAdmin"
                                v-model="withNoContributions"
                                :label="$t('showPersonsWithNoContributionsLabel')"
                                density="compact" hide-details color="primary"
                            />
                        </div>
                    </v-menu>

                    <v-btn
                        v-if="isAdmin || isInstitutionalEditor"
                        data-tutorial="add-person"
                        color="primary"
                        prepend-icon="mdi-plus"
                        @click="addPerson"
                    >
                        {{ $t("createNewPersonLabel") }}
                    </v-btn>
                </template>
            </person-table-component>
        </div>
    </entity-list-layout>
</template>

<script lang="ts">
import { defineComponent, onMounted, watch } from 'vue';
import EntityListLayout from '@/components/landing/EntityListLayout.vue';
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
    components: { EntityListLayout, SearchBarComponent, PersonTableComponent, TabContentLoader },
    setup() {
        const loading = ref(false);

        const searchParams = ref("tokens=");
        const persons = ref<PersonIndex[]>([]);
        const totalPersons = ref(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const withNoInvolvements = ref(false);
        const withNoContributions = ref(false);

        const i18n = useI18n();
        const router = useRouter();

        const tableRef = ref<typeof PersonTableComponent>();

        const { isAdmin, isInstitutionalEditor, isUserBoundToOU, hasInstitution, returnOnlyInstitutionRelatedEntities, loggedInUser } = useUserRole();

        onMounted(() => {
            document.title = i18n.t("personListLabel");
            loading.value = true;
        });

        const initialLoad = ref(true);

        watch([
            loggedInUser, returnOnlyInstitutionRelatedEntities,
            withNoInvolvements, withNoContributions
        ], () => {
            if (!initialLoad.value) {
                search(searchParams.value);
            }
        });

        const search = (tokenParams: string) => {
            searchParams.value = tokenParams;

            if (returnOnlyInstitutionRelatedEntities.value && !loggedInUser.value?.organisationUnitId) {
                initialLoad.value = false;
                return;
            }

            PersonService.searchResearchers(
                `${tokenParams}&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`,
                false,
                returnOnlyInstitutionRelatedEntities.value ? loggedInUser.value?.organisationUnitId as number : null,
                withNoInvolvements.value, withNoContributions.value)
            .then((response) => {
                persons.value = response.data.content;
                totalPersons.value = response.data.totalElements;
            })
            .finally(() => {
                loading.value = false;
                initialLoad.value = false;
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
            isInstitutionalEditor, isUserBoundToOU, hasInstitution,
            returnOnlyInstitutionRelatedEntities,
            ExportableEndpointType, searchParams,
            loading, withNoInvolvements,
            withNoContributions
        };
    }
});
</script>
