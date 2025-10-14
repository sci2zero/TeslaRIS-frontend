<template>
    <v-container>
        <div class="d-flex flex-row justify-center">
            <organisation-unit-autocomplete-search
                v-if="isAdmin"
                ref="ouAutocompleteRef"
                v-model:model-value="selectedOrganisationUnit"
                class="entity-select"
                disable-submission
                required
            />
        </div>

        <div
            v-if="(isAdmin && selectedOrganisationUnit && selectedOrganisationUnit.value > 0) || isInstitutionalEditor"
            class="mt-15">
            <v-select
                v-model="selectedPublicationTypes"
                :items="publicationTypes"
                :label="$t('typeOfPublicationLabel')"
                return-object
                class="entity-select mt-3"
                multiple
            ></v-select>

            <span class="d-flex align-center">
                <v-checkbox
                    v-model="nonValidMetadata"
                    :label="$t('showNonValidatedMetadataLabel')"
                    class="ml-4 mt-3"
                ></v-checkbox>

                <v-checkbox
                    v-model="nonValidFiles"
                    :label="$t('showNonValidatedFilesLabel')"
                    class="ml-4 mt-3"
                ></v-checkbox>
            </span>

            <publication-table-component
                ref="tableRef"
                :publications="publications"
                :total-publications="totalPublications"
                :allow-comparison="isInstitutionalEditor"
                validation-view
                allow-selection
                @switch-page="switchPage">
            </publication-table-component>
        </div>
    </v-container>
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue';
import PublicationTableComponent from '@/components/publication/PublicationTableComponent.vue';
import { ref } from 'vue';
import { type DocumentPublicationIndex, PublicationType } from '@/models/PublicationModel';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import { onMounted } from 'vue';
import { useUserRole } from '@/composables/useUserRole';
import { getPublicationTypesForGivenLocale } from '@/i18n/publicationType';
import { ExportableEndpointType } from '@/models/Common';
import OrganisationUnitTrustConfigurationService from '@/services/OrganisationUnitTrustConfigurationService';
import OrganisationUnitAutocompleteSearch from '@/components/organisationUnit/OrganisationUnitAutocompleteSearch.vue';


export default defineComponent({
    name: "PublicationsValidationView",
    components: { PublicationTableComponent, OrganisationUnitAutocompleteSearch },
    setup() {
        const loading = ref(false);

        const searchParams = ref("tokens=");

        const publications = ref<DocumentPublicationIndex[]>([]);
        const totalPublications = ref(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const i18n = useI18n();
        const tableRef = ref<typeof PublicationTableComponent>();
        
        const publicationTypes = computed(() => getPublicationTypesForGivenLocale()?.filter(type => type.value !== PublicationType.PROCEEDINGS));
        const selectedPublicationTypes = ref<{ title: string, value: PublicationType }[]>([]);
        const nonValidMetadata = ref(true);
        const nonValidFiles = ref(true);
        const selectedOrganisationUnit = ref<{title: string, value: number}>({title: "", value: -1});

        const { isInstitutionalEditor, loggedInUser, isAdmin } = useUserRole();

        const previousFilterValues = ref<{publicationTypes: string[], metadata: boolean, files: boolean}>(
            {publicationTypes: [], metadata: true, files: true}
        );

        onMounted(() => {
            loading.value = true;
            document.title = i18n.t("routeLabel.publicationsValidation");

            selectedPublicationTypes.value.splice(0);
        });

        watch([
            selectedPublicationTypes,
            nonValidMetadata,
            nonValidFiles,
            loggedInUser
        ], () => {
            search(searchParams.value);
        });

        const search = (tokenParams: string) => {
            if ((isAdmin.value && selectedOrganisationUnit.value.value <= 0) ||
                (isInstitutionalEditor.value && !loggedInUser.value)) {
                return;
            }

            const publicationTypes = selectedPublicationTypes.value.map(publicationType => publicationType.value);

            searchParams.value = tokenParams;
            previousFilterValues.value.publicationTypes = publicationTypes;
            previousFilterValues.value.metadata = nonValidMetadata.value;
            previousFilterValues.value.files = nonValidFiles.value;

            const organisationUnitId = isInstitutionalEditor.value
                ? (loggedInUser.value?.organisationUnitId as number)
                : selectedOrganisationUnit.value.value;

            OrganisationUnitTrustConfigurationService.fetchNonValidatedDocuments(
                organisationUnitId,
                `metadata=${nonValidMetadata.value}&files=${nonValidFiles.value}&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`,
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

        return {
            search, publications, totalPublications,
            switchPage, isInstitutionalEditor,
            tableRef, clearSortAndPerformSearch,
            publicationTypes, selectedPublicationTypes,
            ExportableEndpointType, searchParams,
            resetFiltersAndSearch, loggedInUser, loading,
            nonValidMetadata, nonValidFiles, isAdmin,
            selectedOrganisationUnit
        };
    }
});
</script>

<style scoped>

.entity-select {
    max-width: 700px;
}

</style>
