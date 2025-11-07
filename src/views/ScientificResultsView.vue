<template>
    <div class="container py-4 px-4 mx-auto">
        <h1 class="text-2xl font-bold mb-4">
            {{ $t("scientificResultsListLabel") }}
        </h1>
        <!-- <v-tabs
            v-model="currentTab"
            align-tabs="center"
        >
            <v-tab value="simpleSearch">
                {{ $t("simpleSearchLabel") }}
            </v-tab>
            <v-tab value="advancedSearch">
                {{ $t("advancedSearchLabel") }}
            </v-tab>
        </v-tabs> -->

        <v-tabs-window v-model="currentTab">
            <v-tabs-window-item value="simpleSearch">                
            </v-tabs-window-item>
            <v-tabs-window-item value="advancedSearch">
                <v-btn
                    variant="text"
                    prepend-icon="mdi-chevron-left"
                    @click="toggleAdvancedSearch"
                >
                    {{ $t("backToSimpleSearchLabel") }}
                </v-btn>
                <query-input-component
                    :search-fields="searchFields"
                    class="mb-4"
                    @search="clearSortAndPerformSearch($event)"
                    @reset="resetFiltersAndSearch">
                </query-input-component>
            </v-tabs-window-item>
        </v-tabs-window>


        

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
            :has-active-type-filters="selectedPublicationTypes.length > 0"
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
            <template #top-left>
                <div class="flex items-center gap-1">
                    <search-bar-component v-if="currentTab === 'simpleSearch'" :transparent="false" size="small" @search="clearSortAndPerformSearch($event)"></search-bar-component>
                    <v-btn
                        v-if="currentTab === 'simpleSearch'"
                        variant="text"
                        icon="mdi-tune"
                        @click="toggleAdvancedSearch"
                    />
                </div>
            </template>
            <template #actions>
                <div class="flex items-center gap-2">
                    <v-menu>
                        <template #activator="{ props }">
                            <v-btn
                                v-bind="props"
                                color="white"
                                prepend-icon="mdi-dots-vertical"
                                class="action-menu-trigger"
                            >
                                {{ $t("optionsLabel") }}
                            </v-btn>
                        </template>
                        <div class="p-4 border border-gray-200 bg-white rounded-lg shadow-lg">
                            <span class="flex align-center flex-row gap-2">
                                <v-checkbox
                                    v-if="isUserBoundToOU"
                                    v-model="returnOnlyInstitutionRelatedEntities"
                                    :label="$t('showEntitiesForMyInstitutionLabel')"
                                    class=""
                                ></v-checkbox>

                                <v-checkbox
                                    v-if="isCommission"
                                    v-model="returnOnlyUnassessedEntities"
                                    :label="$t('showUnassessedLabel')"
                                    class=""
                                ></v-checkbox>

                                <v-checkbox
                                    v-if="isAdmin"
                                    v-model="returnOnlyUnmanagedPublications"
                                    :label="$t('showOnlyUnmanagedLabel')"
                                    class=""
                                ></v-checkbox>
                            </span>

                            <div class="flex items-center gap-2">
                                <span v-if="isAdmin || isInstitutionalEditor">
                                    <v-btn
                                        color="primary" density="default"
                                        @click="performNavigation('publicationsValidation')">
                                        {{ $t('routeLabel.publicationsValidation') }}
                                    </v-btn>
                                </span>
                                <span v-if="isAdmin || isInstitutionalEditor">
                                    <v-btn
                                        color="primary" density="default"
                                        @click="performNavigation('authorReprints')">
                                        {{ $t('routeLabel.authorReprints') }}
                                    </v-btn>
                                </span>
                            </div>
                        </div>
                    </v-menu>
                    <span
                        v-if="canUserAddPublications"
                        :class="'d-flex align-center ' + (canUserAddPublications ? '' : '')">
                        <add-publication-menu />
                    </span>
                </div>
            </template>
            <template #type-filter-menu>
                <div class="publication-type-filter">
                    <div class="filter-header">
                        <span class="filter-title">{{ $t('typeOfPublicationLabel') }}</span>
                    </div>
                    <v-divider class="my-2"></v-divider>
                    <div class="checkbox-grid">
                        <div 
                            v-for="type in publicationTypes"
                            :key="type.value"
                            class="checkbox-item"
                        >
                            <v-checkbox
                                :model-value="selectedPublicationTypes.some(t => t.value === type.value)"
                                :label="type.title"
                                density="compact"
                                hide-details
                                class="w-full"
                                color="primary"
                                @update:model-value="togglePublicationType(type, !!$event)"
                            ></v-checkbox>
                        </div>
                    </div>
                </div>
            </template>
        </publication-table-component>
    </div>
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

        const initialLoad = ref(true);

        watch([
            loggedInUser, returnOnlyInstitutionRelatedEntities,
            returnOnlyUnassessedEntities, selectedPublicationTypes,
            returnOnlyUnmanagedPublications], () => {
            if (!initialLoad.value) {
                search(searchParams.value);
            }
        });

        const search = (tokenParams: string) => {
            if (returnOnlyInstitutionRelatedEntities.value && !loggedInUser.value?.organisationUnitId) {
                initialLoad.value = false;
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
                initialLoad.value = false;
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

        const togglePublicationType = (type: { title: string, value: PublicationType }, isSelected: boolean) => {
            if (isSelected) {
                selectedPublicationTypes.value.push(type);
            } else {
                const index = selectedPublicationTypes.value.findIndex(t => t.value === type.value);
                if (index > -1) selectedPublicationTypes.value.splice(index, 1);
            }

            search(searchParams.value);
        };

        const toggleAdvancedSearch = () => {
            if (currentTab.value === "simpleSearch") {
                currentTab.value = "advancedSearch";
            } else {
                currentTab.value = "simpleSearch";
            }
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
            performNavigation, returnOnlyUnmanagedPublications,
            togglePublicationType, toggleAdvancedSearch
        };
    }
});
</script>

<style scoped>

.publication-type-filter {
    min-width: 500px;
    max-width: 700px;
    padding: 12px;
    background: #ffffff;
}

.filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
}

.filter-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: #1a1a1a;
    letter-spacing: 0.01em;
}

.filter-actions {
    display: flex;
    gap: 4px;
}

.checkbox-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 8px;
    max-height: 400px;
    overflow-y: auto;
    padding: 4px 0;
}

.checkbox-item {
    padding: 4px 8px;
    border-radius: 6px;
    transition: background-color 0.2s ease;
}

.checkbox-item:hover {
    background-color: #f5f5f5;
}

.checkbox-grid::-webkit-scrollbar {
    width: 8px;
}

.checkbox-grid::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

.checkbox-grid::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
}

.checkbox-grid::-webkit-scrollbar-thumb:hover {
    background: #a1a1a1;
}

</style>

<style>
.checkbox-item .v-label--clickable {
    width: 100%;
}
</style>