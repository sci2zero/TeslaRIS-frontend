<template>
    <v-container>
        <h1>{{ $t("authorReprintResultsListLabel") }}</h1>
        
        <div class="d-flex flex-row justify-space-between mt-15 mb-15">
            <search-bar-component
                class="search-bar"
                @search="clearSortAndPerformSearch($event)">
            </search-bar-component>
        </div>

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
        </span>

        <v-select
            v-model="selectedPublicationTypes"
            :items="publicationTypes"
            :label="$t('typeOfPublicationLabel')"
            return-object
            class="publication-type-select no-empty-outline mt-3"
            multiple
        ></v-select>

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
            :endpoint-type="ExportableEndpointType.AUTHOR_REPRINT_DOCUMENTS_SEARCH"
            :endpoint-token-parameters="searchParams.replaceAll('&tokens=', 'tokens=').split('tokens=').filter(token => token)"
            :endpoint-body-parameters="
                {
                    allowedTypes: selectedPublicationTypes.map(publicationType => publicationType.value),
                    institutionId: null,
                    commissionId: null
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
import { ExportableEndpointType } from '@/models/Common';
import TabContentLoader from '@/components/core/TabContentLoader.vue';
import { useRouter } from 'vue-router';


export default defineComponent({
    name: "ScientificResultsListView",
    components: { SearchBarComponent, PublicationTableComponent, TabContentLoader },
    setup() {
        const loading = ref(false);

        const router = useRouter();

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

        const {
            isAdmin, isInstitutionalEditor, isCommission,
            isUserBoundToOU, loggedInUser,
            returnOnlyInstitutionRelatedEntities,
            isInstitutionalLibrarian, isHeadOfLibrary
        } = useUserRole();

        onMounted(() => {
            loading.value = true;
            document.title = i18n.t("scientificResultsListLabel");

            selectedPublicationTypes.value.splice(0);
            if (isInstitutionalLibrarian.value || isHeadOfLibrary.value) {
                selectedPublicationTypes.value.push({title: getPublicationTypeTitleFromValueAutoLocale(PublicationType.THESIS) as string, value: PublicationType.THESIS});
            }
        });

        watch([loggedInUser, returnOnlyInstitutionRelatedEntities, returnOnlyUnassessedEntities, selectedPublicationTypes], () => {
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

            const organisationUnitId = returnOnlyInstitutionRelatedEntities.value
                ? (loggedInUser.value?.organisationUnitId as number)
                : null;

            DocumentPublicationService.searchDocumentPublications(
                `${tokenParams}&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`,
                organisationUnitId,
                !!selectOnlyUnassessed,
                publicationTypes,
                true
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

        const navigateToValidationPage = () => {
            router.push({name: "publicationsValidation"});
        };

        return {
            search, publications, searchParams,
            switchPage, isAdmin, totalPublications,
            tableRef, clearSortAndPerformSearch,
            isUserBoundToOU, isCommission,
            publicationTypes, selectedPublicationTypes,
            ExportableEndpointType, loggedInUser,
            loading, navigateToValidationPage,
            returnOnlyInstitutionRelatedEntities,
            returnOnlyUnassessedEntities,
            isInstitutionalEditor
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

.search-bar {
    min-width: 450px;
}

</style>
