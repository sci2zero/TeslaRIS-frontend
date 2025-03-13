<template>
    <h1 class="d-flex flex-row justify-center">
        {{ $t("massInstitutionAssignmentLabel") }}
    </h1>

    <div class="d-flex flex-row flex-grow-1 justify-center mt-10">
        <div class="institution-search">
            <organisation-unit-autocomplete-search
                v-model="selectedOU" disable-submission required
                :label="$t('organisationUnitLabel')" :for-person-id="currentPersonId">
            </organisation-unit-autocomplete-search>
        </div>
    </div>

    <div class="d-flex flex-row flex-grow-1 justify-center">
        <div>
            <v-btn
                density="compact" class="bottom-spacer" :disabled="selectedPublications.length === 0"
                @click="updateAffiliations(false)">
                {{ $t("addAffiliationLabel") }}
            </v-btn>
            <v-btn
                density="compact" class="bottom-spacer ml-5" :disabled="selectedPublications.length === 0"
                @click="updateAffiliations(true)">
                {{ $t("removeOthersAndAddAffiliationLabel") }}
            </v-btn>
        </div>
    </div>

    <v-row class="d-flex flex-row justify-center mt-5">
        <v-col cols="12" lg="10">
            <publication-table-component
                :publications="publications" :total-publications="totalPublications" allow-selection @switch-page="switchPage"
                @selection-updated="updateSelection"></publication-table-component>
        </v-col>
    </v-row>

    <toast v-model="snackbar" :message="message" />
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue';
import PublicationTableComponent from '@/components/publication/PublicationTableComponent.vue';
import { type DocumentPublicationIndex } from '@/models/PublicationModel';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import OrganisationUnitAutocompleteSearch from '@/components/organisationUnit/OrganisationUnitAutocompleteSearch.vue';
import Toast from '@/components/core/Toast.vue';
import { useI18n } from 'vue-i18n';
import PersonService from '@/services/PersonService';


export default defineComponent({
    name: "MassInstitutionAssignmentComponent",
    components: { PublicationTableComponent, OrganisationUnitAutocompleteSearch, Toast },
    setup() {
        const snackbar = ref(false);
        const message = ref("");
        const i18n = useI18n();

        const currentPersonId = ref(0);

        const publications = ref<DocumentPublicationIndex[]>([]);
        const totalPublications = ref(0);

        const selectedPublications = ref<DocumentPublicationIndex[]>([]);

        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const selectedOU = ref<{title: string, value: number}>();

        onMounted(() => {
            PersonService.getPersonId().then(response => {
                if(response.data) {
                    currentPersonId.value = response.data;
                }
            });
        });

        watch(selectedOU, () => {
            if (selectedOU.value?.value && selectedOU.value.value > 0) {
                selectedPublications.value.splice(0);
                fetchPublications();
            }
        });

        const fetchPublications = () => {
            DocumentPublicationService.fetchNonAffiliatedDocuments(selectedOU.value?.value as number, `page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`).then((response) => {
                publications.value = response.data.content;
                totalPublications.value = response.data.totalElements;
            });
        };

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            direction.value = sortDir;
            sort.value = sortField;

            fetchPublications();
        };

        const updateSelection = (selection: DocumentPublicationIndex[]) => {
            selectedPublications.value = selection;
        };

        const updateAffiliations = (deleteOthers: boolean) => {
            DocumentPublicationService.updateDocumentAffiliations(
                selectedOU.value?.value as number,
                {
                    documentIds: selectedPublications.value.map(publicationIndex => publicationIndex.databaseId) as number[], 
                    deleteOthers: deleteOthers
                })
            .then(() => {
                fetchPublications();
                message.value = i18n.t("savedMessage");
                snackbar.value = true;
            });
        };

        return {
            publications,
            totalPublications,
            fetchPublications,
            switchPage,
            selectedOU,
            updateSelection,
            updateAffiliations,
            selectedPublications,
            snackbar, message,
            currentPersonId
        };
    }
});
</script>

<style scoped>

.institution-search {
    width: 450px;
}

</style>
