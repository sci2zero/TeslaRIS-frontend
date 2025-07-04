<template>
    <v-container>
        <h1>{{ $t("ouListLabel") }}</h1>
        <br />
        <br />
        <search-bar-component @search="clearSortAndPerformSearch"></search-bar-component>
        <br />
        <span :class="'d-flex align-center ' + (isAdmin ? 'mb-3' : '')">
            <v-btn v-if="isAdmin" color="primary" @click="addOU">
                {{ $t("createNewOULabel") }}
            </v-btn>
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
        <organisation-unit-table-component
            v-else
            ref="tableRef"
            :organisation-units="organisationUnits"
            :total-o-us="totalOUs"
            enable-export
            :allow-comparison="isInstitutionalEditor && (returnOnlyInstitutionRelatedEntities as boolean)"
            :endpoint-type="ExportableEndpointType.ORGANISATION_UNIT_SEARCH"
            :endpoint-token-parameters="[searchParams, returnOnlyInstitutionRelatedEntities ? String(loggedInUser?.organisationUnitId) : 'null']"
            @switch-page="switchPage">
        </organisation-unit-table-component>
    </v-container>
</template>

<script lang="ts">
import { defineComponent, onMounted, watch } from 'vue';
import SearchBarComponent from '@/components/core/SearchBarComponent.vue';
import OrganisationUnitService from '@/services/OrganisationUnitService';
import OrganisationUnitTableComponent from '@/components/organisationUnit/OrganisationUnitTableComponent.vue';
import { ref } from 'vue';
import type { OrganisationUnitIndex } from '@/models/OrganisationUnitModel';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useUserRole } from '@/composables/useUserRole';
import { ExportableEndpointType } from '@/models/Common';
import TabContentLoader from '@/components/core/TabContentLoader.vue';


export default defineComponent({
    name: "OrganisationUnitListView",
    components: { SearchBarComponent, OrganisationUnitTableComponent, TabContentLoader },
    setup() {
        const loading = ref(false);

        const searchParams = ref("tokens=");
        const organisationUnits = ref<OrganisationUnitIndex[]>([]);
        const totalOUs = ref(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const i18n = useI18n();
        const router = useRouter();
        const tableRef = ref<typeof OrganisationUnitTableComponent>();

        const { isAdmin, isInstitutionalEditor, isUserBoundToOU, returnOnlyInstitutionRelatedEntities, loggedInUser } = useUserRole();

        onMounted(() => {
            document.title = i18n.t("ouListLabel");
            loading.value = true;
        });

        watch([loggedInUser, returnOnlyInstitutionRelatedEntities], () => {
            search(searchParams.value);
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
            if (returnOnlyInstitutionRelatedEntities.value && !loggedInUser.value?.organisationUnitId) {
                return;
            }

            OrganisationUnitService.searchOUs(
                `${tokenParams}&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`,
                null,
                returnOnlyInstitutionRelatedEntities.value ? loggedInUser.value?.organisationUnitId as number : null)
            .then((response) => {
                organisationUnits.value = response.data.content;
                totalOUs.value = response.data.totalElements;
            })
            .finally(() => {
                loading.value = false;
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
            switchPage, addOU, isAdmin, searchParams,
            clearSortAndPerformSearch, tableRef,
            returnOnlyInstitutionRelatedEntities,
            isUserBoundToOU, ExportableEndpointType,
            loading, isInstitutionalEditor, loggedInUser
        };
    }
});
</script>
