<template>
    <v-container>
        <h1>{{ $t("scientificResultsListLabel") }}</h1>
        <br />
        <br />
        <v-tabs
            v-model="currentTab"
            bg-color="blue-grey-lighten-5"
            color="deep-purple-accent-4"
            align-tabs="center"
        >
            <v-tab value="simpleSearch">
                {{ $t("simpleSearchLabel") }}
            </v-tab>
            <v-tab value="advancedSearch">
                {{ $t("advancedSearchLabel") }}
            </v-tab>
        </v-tabs>

        <v-tabs-window v-model="currentTab">
            <v-tabs-window-item value="simpleSearch">
                <search-bar-component class="mt-4" @search="clearSortAndPerformSearch($event)"></search-bar-component>
            </v-tabs-window-item>
            <v-tabs-window-item value="advancedSearch">
                <query-input-component
                    :search-fields="searchFields"
                    @search="clearSortAndPerformSearch($event)"
                    @reset="resetFiltersAndSearch">
                </query-input-component>
            </v-tabs-window-item>
        </v-tabs-window>
        <div class="d-flex flex-row justify-start mt-10">
            <span
                v-if="canUserAddPublications"
                :class="'d-flex align-center ' + (canUserAddPublications ? 'mb-3' : '')">
                <add-publication-menu></add-publication-menu>
            </span>
            <span v-if="isAdmin || isInstitutionalEditor" class="ml-2">
                <v-btn
                    color="primary" density="default"
                    @click="performNavigation('publicationsValidation')">
                    {{ $t("routeLabel.publicationsValidation") }}
                </v-btn>
            </span>
            <span v-if="isAdmin || isInstitutionalEditor" class="ml-2">
                <v-btn
                    color="primary" density="default"
                    @click="performNavigation('authorReprints')">
                    {{ $t("routeLabel.authorReprints") }}
                </v-btn>
            </span>
        </div>

        <v-select
            v-model="selectedPublicationTypes"
            :items="publicationTypes"
            :label="$t('typeOfPublicationLabel')"
            return-object
            class="publication-type-select no-empty-outline mt-3"
            multiple
        ></v-select>

        <span class="d-flex align-center">
            <v-checkbox
                v-if="isUserBoundToOU"
                v-model="returnOnlyInstitutionRelatedEntities"
                :label="$t('showEntitiesForMyInstitutionLabel')"
                class="ml-4 mt-3"
            ></v-checkbox>

            <v-checkbox
                v-if="isCommission"
                v-model="returnOnlyUnassessedEntities"
                :label="$t('showUnassessedLabel')"
                class="ml-4 mt-3"
            ></v-checkbox>

            <v-checkbox
                v-if="isAdmin"
                v-model="returnOnlyUnmanagedPublications"
                :label="$t('showOnlyUnmanagedLabel')"
                class="ml-4 mt-3"
            ></v-checkbox>
        </span>

        <tab-content-loader
            v-if="loading"
            button-header
            tab-number-by-role
            layout="table"
        />
        <publication-table-component
            v-else
            ref="tableRef"
            :publications="publications"
            :total-publications="totalPublications"
            enable-export
            :allow-comparison="(isInstitutionalEditor as boolean) && (returnOnlyInstitutionRelatedEntities as boolean)"
            :endpoint-type="currentTab === 'simpleSearch' ? ExportableEndpointType.DOCUMENT_SEARCH : ExportableEndpointType.DOCUMENT_ADVANCED_SEARCH"
            :endpoint-token-parameters="searchParams.replaceAll('&tokens=', 'tokens=').split('tokens=').filter(token => token)"
            :endpoint-body-parameters="
                {
                    allowedTypes: selectedPublicationTypes.map(publicationType => publicationType.value),
                    institutionId: returnOnlyInstitutionRelatedEntities ? loggedInUser?.organisationUnitId as number : null,
                    commissionId: isCommission && returnOnlyUnassessedEntities ? loggedInUser?.commissionId as number : null,
                    onlyUnmanaged: returnOnlyUnmanagedPublications
                }"
            @switch-page="switchPage">
        </publication-table-component>
    </v-container>
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue';
import SearchBarComponent from '@/components/core/SearchBarComponent.vue';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import PublicationTableComponent from '@/components/publication/PublicationTableComponent.vue';
import { ref } from 'vue';
import { type DocumentPublicationIndex, PublicationType } from '@/models/PublicationModel';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import { onMounted } from 'vue';
import { useUserRole } from '@/composables/useUserRole';
import { getPublicationTypesForGivenLocale, getPublicationTypeTitleFromValueAutoLocale } from '@/i18n/publicationType';
import { ExportableEndpointType, type SearchFieldsResponse } from '@/models/Common';
import QueryInputComponent from '@/components/core/QueryInputComponent.vue';
import AddPublicationMenu from '@/components/publication/AddPublicationMenu.vue';
import TabContentLoader from '@/components/core/TabContentLoader.vue';
import { useRoute, useRouter } from 'vue-router';


export default defineComponent({
    name: "ScientificResultsListView",
    components: { SearchBarComponent, PublicationTableComponent, QueryInputComponent, AddPublicationMenu, TabContentLoader },
    setup() {
        const currentTab = ref("simpleSearch");
        const loading = ref(false);

        const router = useRouter();
        const route = useRoute();

        const searchParams = ref("tokens=");
        const previousFilterValues = ref<{publicationTypes: string[], selectOnlyUnassessed: boolean}>({publicationTypes: [], selectOnlyUnassessed: false});

        const publications = ref<DocumentPublicationIndex[]>([]);
        const totalPublications = ref(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const i18n = useI18n();
        const tableRef = ref<typeof PublicationTableComponent>();
        
        const returnOnlyUnassessedEntities = ref(true);
        const publicationTypes = computed(() => getPublicationTypesForGivenLocale()?.filter(type => type.value !== PublicationType.PROCEEDINGS));
        const selectedPublicationTypes = ref<{ title: string, value: PublicationType }[]>([]);
        const returnOnlyUnmanagedPublications = ref(false);

        const {
            isCommission, isAdmin, isInstitutionalEditor,
            canUserAddPublications, isUserBoundToOU,
            returnOnlyInstitutionRelatedEntities, loggedInUser,
            isInstitutionalLibrarian, isHeadOfLibrary
        } = useUserRole();

        const searchFields = ref<SearchFieldsResponse[]>([]);

        onMounted(() => {
            loading.value = true;
            document.title = i18n.t("scientificResultsListLabel");

            selectedPublicationTypes.value.splice(0);
            if (isInstitutionalLibrarian.value || isHeadOfLibrary.value) {
                selectedPublicationTypes.value.push({title: getPublicationTypeTitleFromValueAutoLocale(PublicationType.THESIS) as string, value: PublicationType.THESIS});
            }

            DocumentPublicationService.getSearchFields(false).then(response => {
                searchFields.value = response.data;
            });

            if ((route.query.unmanaged as string) === "true") {
                returnOnlyUnmanagedPublications.value = true;
            }
        });

        watch([
            loggedInUser, returnOnlyInstitutionRelatedEntities,
            returnOnlyUnassessedEntities, selectedPublicationTypes,
            returnOnlyUnmanagedPublications], () => {
            search(searchParams.value);
        });

        const search = (tokenParams: string) => {
            if (returnOnlyInstitutionRelatedEntities.value && !loggedInUser.value?.organisationUnitId) {
                return;
            }

            const publicationTypes = selectedPublicationTypes.value.map(publicationType => publicationType.value);
            const selectOnlyUnassessed = isCommission.value && returnOnlyUnassessedEntities.value;

            searchParams.value = tokenParams;
            previousFilterValues.value.publicationTypes = publicationTypes;
            previousFilterValues.value.selectOnlyUnassessed = !!selectOnlyUnassessed; 

            const isSimpleSearch = currentTab.value === "simpleSearch" || tokenParams === "tokens=*";
            const serviceMethod = isSimpleSearch
                ? (tokens: string, institutionId: number | null, returnOnlyUnclassifiedEntities: boolean, allowedTypes: PublicationType[]) =>
                    DocumentPublicationService.searchDocumentPublications(tokens, institutionId, returnOnlyUnclassifiedEntities, allowedTypes, null, returnOnlyUnmanagedPublications.value)
                : (tokens: string, institutionId: number | null, returnOnlyUnclassifiedEntities: boolean, allowedTypes: PublicationType[]) =>
                    DocumentPublicationService.performAdvancedSearch(tokens, institutionId, returnOnlyUnclassifiedEntities, allowedTypes);

            const organisationUnitId = returnOnlyInstitutionRelatedEntities.value
                ? (loggedInUser.value?.organisationUnitId as number)
                : null;

            serviceMethod(
                `${tokenParams}&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`,
                organisationUnitId,
                !!selectOnlyUnassessed,
                publicationTypes
            ).then((response) => {
                publications.value = response.data.content;
                totalPublications.value = response.data.totalElements;
            }).finally(() => {
                loading.value = false;
            });
        };

        const clearSortAndPerformSearch = (tokenParams: string | string[]) => {
            if (typeof tokenParams !== "string") {
                tokenParams = "tokens=" + tokenParams.join("&tokens=");
            }

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

        const resetFiltersAndSearch = () => {
            clearSortAndPerformSearch("tokens=*");
        };

        const performNavigation = (pageName: string) => {
            router.push({name: pageName});
        };

        return {
            search, publications, totalPublications,
            switchPage, isInstitutionalEditor, isAdmin,
            tableRef, clearSortAndPerformSearch, searchFields,
            canUserAddPublications, isUserBoundToOU,
            returnOnlyInstitutionRelatedEntities,
            isCommission, returnOnlyUnassessedEntities,
            publicationTypes, selectedPublicationTypes,
            ExportableEndpointType, searchParams, currentTab,
            resetFiltersAndSearch, loggedInUser, loading,
            performNavigation, returnOnlyUnmanagedPublications
        };
    }
});
</script>

<style scoped>

.publication-type-select {
    max-width: 700px;
}

.no-empty-outline :deep(.v-field__outline) {
  opacity: 0;
}

.no-empty-outline:deep(.v-select--focused .v-field__outline) {
  opacity: 1;
}

</style>
