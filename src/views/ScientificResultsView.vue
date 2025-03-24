<template>
    <v-container>
        <h1>{{ $t("scientificResultsListLabel") }}</h1>
        <br />
        <br />
        <search-bar-component @search="clearSortAndPerformSearch"></search-bar-component>
        <br />
        <span :class="'d-flex align-center ' + (canUserAddPublications ? 'mb-3' : '')">
            <v-menu v-if="canUserAddPublications" open-on-hover>
                <template #activator="{ props }">
                    <v-btn color="primary" v-bind="props">
                        {{ $t("addNewEntityLabel") }}
                    </v-btn>
                </template>

                <v-list>
                    <v-list-item
                        v-for="(item, index) in submissionMenuItems"
                        :key="index"
                        @click="navigateToPage(item.value)"
                    >
                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
        </span>

        <v-select
            v-model="selectedPublicationTypes"
            :items="publicationTypes"
            :label="$t('typeOfPublicationLabel')"
            return-object
            class="publication-type-select mt-3"
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
        </span>
        <publication-table-component ref="tableRef" :publications="publications" :total-publications="totalPublications" @switch-page="switchPage"></publication-table-component>
    </v-container>
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue';
import SearchBarComponent from '@/components/core/SearchBarComponent.vue';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import PublicationTableComponent from '@/components/publication/PublicationTableComponent.vue';
import { ref } from 'vue';
import { type DocumentPublicationIndex, PublicationType } from '@/models/PublicationModel';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import { onMounted } from 'vue';
import { useUserRole } from '@/composables/useUserRole';
import { getPublicationTypesForGivenLocale, getPublicationTypeTitleFromValueAutoLocale } from '@/i18n/publicationType';


export default defineComponent({
    name: "ScientificResultsListView",
    components: {SearchBarComponent, PublicationTableComponent},
    setup() {
        const searchParams = ref("tokens=");
        const publications = ref<DocumentPublicationIndex[]>([]);
        const totalPublications = ref(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const router = useRouter();
        const tableRef = ref<typeof PublicationTableComponent>();
        
        const returnOnlyUnassessedEntities = ref(true);
        const publicationTypes = computed(() => getPublicationTypesForGivenLocale());
        const selectedPublicationTypes = ref<{ title: string, value: PublicationType }[]>([]);

        const { isCommission, canUserAddPublications, isUserBoundToOU, returnOnlyInstitutionRelatedEntities, loggedInUser, isInstitutionalLibrarian, isHeadOfLibrary } = useUserRole();

        onMounted(() => {
            document.title = i18n.t("scientificResultsListLabel");

            selectedPublicationTypes.value.splice(0);
            if (isInstitutionalLibrarian.value || isHeadOfLibrary.value) {
                selectedPublicationTypes.value.push({title: getPublicationTypeTitleFromValueAutoLocale(PublicationType.THESIS) as string, value: PublicationType.THESIS});
            } else {
                publicationTypes.value?.forEach(publicationType => {
                    selectedPublicationTypes.value.push({title: publicationType.title, value: publicationType.value});
                });
            }

            if (isInstitutionalLibrarian.value) {
                submissionMenuItems.value = submissionMenuItems.value.filter(item => item.value === "submitThesis");
            }
        });

        watch([loggedInUser, returnOnlyInstitutionRelatedEntities, returnOnlyUnassessedEntities, selectedPublicationTypes], () => {
            search(searchParams.value);
        });

        const search = (tokenParams: string) => {
            searchParams.value = tokenParams;

            if (returnOnlyInstitutionRelatedEntities.value && !loggedInUser.value?.organisationUnitId) {
                return;
            }

            DocumentPublicationService.searchDocumentPublications(
                `${tokenParams}&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`,
                returnOnlyInstitutionRelatedEntities.value ? loggedInUser.value?.organisationUnitId as number : null,
                isCommission.value && returnOnlyUnassessedEntities.value,
                selectedPublicationTypes.value.map(publicationType => publicationType.value))
            .then((response) => {
                publications.value = response.data.content;
                totalPublications.value = response.data.totalElements;
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

        const navigateToPage = (name: string) => {
            router.push({name: name});
        };

        const i18n = useI18n();
        const addJournalPublicationLabel = computed(() => i18n.t("addJournalPublicationLabel"));
        const addProceedingsPublicationLabel = computed(() => i18n.t("addProceedingsPublicationLabel"));
        const addPatentLabel = computed(() => i18n.t("addPatentLabel"));
        const addSoftwareLabel = computed(() => i18n.t("addSoftwareLabel"));
        const addDatasetLabel = computed(() => i18n.t("addDatasetLabel"));
        const createNewMonographLabel = computed(() => i18n.t("createNewMonographLabel"));
        const addMonographPublicationLabel = computed(() => i18n.t("addMonographPublicationLabel"));
        const addThesisLabel = computed(() => i18n.t("addThesisLabel"));

        const submissionMenuItems = ref([
            { title: addJournalPublicationLabel, value: "submitJournalPublication" },
            { title: addProceedingsPublicationLabel, value: "submitProceedingsPublication" },
            { title: addPatentLabel, value: "submitPatent" },
            { title: addSoftwareLabel, value: "submitSoftware" },
            { title: addDatasetLabel, value: "submitDataset" },
            { title: createNewMonographLabel, value: "submitMonograph" },
            { title: addMonographPublicationLabel, value: "submitMonographPublication" },
            { title: addThesisLabel, value: "submitThesis" },
        ]);

        return {
            search, publications, totalPublications,
            switchPage, submissionMenuItems, navigateToPage,
            tableRef, clearSortAndPerformSearch,
            canUserAddPublications, isUserBoundToOU,
            returnOnlyInstitutionRelatedEntities,
            isCommission, returnOnlyUnassessedEntities,
            publicationTypes, selectedPublicationTypes
        };
    }
});
</script>

<style scoped>

.publication-type-select {
    max-width: 700px;
}

</style>
