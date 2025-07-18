<template>
    <v-container>
        <h1>{{ personForLoading.firstName }} {{ personForLoading.lastName }}</h1>

        <h2 v-if="researcherBinded && !hadToBeCreated">
            {{ $t("foundAsLabel", [selectedResearcher?.name as string]) }}
        </h2>

        <h2 v-if="researcherBinded && hadToBeCreated">
            {{ $t(importAsUnmanaged ? "bindedUnmanagedEntityLabel" : "createdNewEntityLabel", [selectedResearcher?.name as string]) }}
        </h2>

        <h2 v-if="showTable" class="can-not-find-message">
            {{ $t("canNotAutoFindResearcherMessage") }}
        </h2>

        <v-data-table-server
            v-if="showTable"
            :sort-by="tableOptions.sortBy"
            :items="potentialMatches"
            :headers="headers"
            item-value="row"
            :items-length="totalPersons"
            return-object
            :items-per-page-text="$t('itemsPerPageLabel')"
            :items-per-page-options="[10, 25, 50]"
            :no-data-text="$t('noDataInTableMessage')"
            @update:options="refreshTable">
            <template #item="row">
                <tr>
                    <td>
                        {{ row.item.name }}
                    </td>
                    <td v-if="$i18n.locale == 'sr'">
                        {{ displayTextOrPlaceholder(row.item.employmentsSr) }}
                    </td>
                    <td v-else>
                        {{ displayTextOrPlaceholder(row.item.employmentsOther) }}
                    </td>
                    <td>{{ displayTextOrPlaceholder(row.item.birthdate) }}</td>
                    <td>{{ displayTextOrPlaceholder(row.item.orcid) }}</td>
                    <td>
                        <publications-dialog
                            :button-text="$t('viewPublicationsLabel')"
                            :id-for-fetching="row.item.databaseId"
                            icon="mdi-note"
                            :title="$t('publicationsLabel')">
                        </publications-dialog>
                        <v-btn size="small" color="primary" @click="selectManually(row.item)">
                            {{ $t("selectLabel") }}
                        </v-btn>
                    </td>
                </tr>
            </template>
        </v-data-table-server>

        <h3 v-if="showTable">
            {{ $t("canCreateNewResearcherLabel") }} 
            <v-btn size="small" color="primary" @click="addNew">
                {{ importAsUnmanaged ? $t("addExternalAssociateLabel") : $t("createNewPersonLabel") }}
            </v-btn>
        </h3>

        <import-affiliation
            v-for="(institution, index) in institutionsForLoading"
            :ref="(el) => (importAffiliationsRef[index] = el)"
            :key="institution.scopusAfid"
            :ou-for-loading="institution"
            :top-level-institution-id="topLevelInstitutionId"
            :import-as-unmanaged="importAsUnmanaged"
            @user-action-complete="notifyParentIfAllHandled">
        </import-affiliation>
    </v-container>
</template>

<script lang="ts">
import type { OrganisationUnitLoad, PersonLoad } from "@/models/LoadModel";
import type { PersonIndex } from "@/models/PersonModel";
import PersonService from "@/services/PersonService";
import { displayTextOrPlaceholder } from "@/utils/StringUtil";
import type { PropType } from "vue";
import { computed } from "vue";
import { ref } from "vue";
import { onMounted } from "vue";
import { defineComponent } from "vue";
import { useI18n } from "vue-i18n";
import PublicationsDialog from "@/components/core/PublicationsDialog.vue"
import { watch } from "vue";
import ImportAffiliation from "./ImportAffiliation.vue";
import ImportService from "@/services/importer/ImportService";
import { useUserRole } from "@/composables/useUserRole";


export default defineComponent({
    name: "ImportAuthorComponent",
    components: {PublicationsDialog, ImportAffiliation},
    props: {
        personForLoading: {
            type: Object as PropType<PersonLoad>,
            required: true
        },
        institutionsForLoading: {
            type: Object as PropType<OrganisationUnitLoad[]>,
            required: true
        },
        topLevelInstitutionId: {
            type: Number,
            required: true
        },
        importAsUnmanaged: {
            type: Boolean,
            required: true
        }
    },
    emits: ["userActionComplete"],
    setup(props, {emit}) {
        const creationInProgress = ref(false);
        const importAffiliationsRef = ref<any[]>([]);
        const automaticProcessCompleted = ref(false);
        const waitingOnUserInput = ref(false);

        const researcherBinded = ref(false);
        const selectedResearcher = ref<PersonIndex>();

        const showTable = ref(false);
        const potentialMatches = ref<PersonIndex[]>([]);
        const hadToBeCreated = ref(false);

        const i18n = useI18n();
        const { loggedResearcherId } = useUserRole();

        const totalPersons = ref(0);
        const page = ref(0);
        const size = ref(5);
        const sort = ref("");
        const direction = ref("");
        const tableOptions = ref<any>({initialCustomConfiguration: true, page: 1, itemsPerPage: 10, sortBy:[{key: "name",  order: "asc"}]});
        
        onMounted(() => {
            startLoadProcess();
        });

        watch(() => props.personForLoading, () => {
            setFlagsToDefault();
            startLoadProcess();
        });

        const startLoadProcess = () => {
            if (props.personForLoading.scopusAuthorId || props.personForLoading.openAlexId) {
                PersonService.findResearcherByImportIdentifier(props.personForLoading.importId)
                .then(response => {
                    if(response.data) {
                        selectedResearcher.value = response.data;
                        researcherBinded.value = true;
                        automaticProcessCompleted.value = true;
                    } else {
                        showTable.value = true;
                        searchPotentialMatches();
                    }
                });
            } else {
                showTable.value = true;
                searchPotentialMatches();
            }
        };

        const setFlagsToDefault = () => {
            researcherBinded.value = false;
            showTable.value = false;
            hadToBeCreated.value = false;
            waitingOnUserInput.value = false;
            automaticProcessCompleted.value = false;
        };

        const searchPotentialMatches = () => {
            PersonService.searchResearchers(
                `tokens=${props.personForLoading.firstName}&tokens=${props.personForLoading.lastName}&tokens=${props.personForLoading.middleName}&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`,
                false,
                null)
            .then(response => {
                potentialMatches.value = response.data.content;
                totalPersons.value = response.data.totalElements;
                if (page.value === 0 && !automaticProcessCompleted.value) {
                    if (loggedResearcherId.value > 0) {
                        const currentResearcherContribution =
                            potentialMatches.value.find(
                                person => person.databaseId === loggedResearcherId.value &&
                                    !props.personForLoading.scopusAuthorId
                            );
                            
                        if (currentResearcherContribution) {
                            selectedResearcher.value = currentResearcherContribution;
                            researcherBinded.value = true;
                            automaticProcessCompleted.value = true;
                            showTable.value = false;
                            return;
                        }
                    }

                    if (totalPersons.value === 0) {
                        addNew();
                    } else {
                        automaticProcessCompleted.value = true;
                        waitingOnUserInput.value = true;
                    }
                }
            });
        };

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            sort.value = sortField ? sortField : "";
            direction.value = sortDir;
            searchPotentialMatches();
        };

        const fullNameLabel = computed(() => i18n.t("fullNameLabel"));
        const organisationUnitLabel = computed(() => i18n.t("organisationUnitLabel"));
        const birthdateLabel = computed(() => i18n.t("birthdateLabel"));
        const actionLabel = computed(() => i18n.t("actionLabel"));

        const employmentColumn = computed(() => i18n.t("employmentColumn"));

        const headers = [
          { title: fullNameLabel, align: "start", sortable: true, key: "name"},
          { title: organisationUnitLabel, align: "start", sortable: true, key: employmentColumn},
          { title: birthdateLabel, align: "start", sortable: true, key: "birthdate"},
          { title: "ORCID", align: "start", sortable: true, key: "orcid"},
          { title: actionLabel, align: "start", sortable: false, key: "actions"}
        ];

        const headersSortableMappings: Map<string, string> = new Map([
            ["name", "name_sortable"],
            ["employmentsSr", "employments_sr_sortable"],
            ["employmentsOther", "employments_other_sortable"],
            ["birthdate", "birthdate_sortable"],
            ["orcid", "orcid"],
        ]);

        const refreshTable = (event: any) => {
            if (tableOptions.value.initialCustomConfiguration) {
                tableOptions.value.initialCustomConfiguration = false;
                event = tableOptions.value;
            }

            tableOptions.value = event;
            let sortField: string | undefined = "";
            let sortDir: string | undefined = "";
            if (event.sortBy.length > 0) {
                sortField = headersSortableMappings.get(event.sortBy[0].key);
                sortDir = event.sortBy[0].order.toUpperCase();
            }
            
            switchPage(event.page - 1, event.itemsPerPage, sortField as string, sortDir as string);
        };

        const selectManually = (researcher: PersonIndex) => {
            selectedResearcher.value = researcher;
            researcherBinded.value = true;
            showTable.value = false;
            ImportService.enrichPersonIdentifiers(
                props.personForLoading.importId,
                researcher.databaseId,
                self.crypto.randomUUID(),
                props.topLevelInstitutionId > 0 ? props.topLevelInstitutionId : null
            );
        };

        const waitForImportAffiliations = (): Promise<void> => {
            return new Promise(resolve => {
                const intervalId = setInterval(() => {
                    const allAffiliationsBinded = importAffiliationsRef.value
                        .filter(importAffiliationRef => importAffiliationRef !== null)
                        .every(importAffiliationRef => importAffiliationRef.affiliationBinded === true);
                if (allAffiliationsBinded) {
                    clearInterval(intervalId);
                    resolve();
                }
                }, 200); // Check every 200 milliseconds
            });
        };

        const addNew = async () => {
            if (creationInProgress.value) {
                return;
            }

            creationInProgress.value = true;
            await waitForImportAffiliations();

            ImportService.createNewPerson(
                props.personForLoading.importId,
                self.crypto.randomUUID(),
                props.topLevelInstitutionId > 0 ? props.topLevelInstitutionId : null
            ).then(response => {
                selectedResearcher.value = {
                    name: `${props.personForLoading.firstName} ${props.personForLoading.lastName}`,
                    birthdate: "",
                    birthdateSortable: "",
                    databaseId: response.data.id as number,
                    employmentInstitutionsId: [],
                    employmentsOther: "",
                    employmentsOtherSortable: "",
                    employmentsSr: "",
                    employmentsSrSortable: "",
                    id: "",
                    nameSortable: "",
                    orcid: "",
                    openAlexId: "",
                    scopusAuthorId: ""
                };

                hadToBeCreated.value = true;
                researcherBinded.value = true;
                automaticProcessCompleted.value = true;
                showTable.value = false;
                creationInProgress.value = false;
            });
        };

        const isHandled = () => {
            const allAffiliationsBinded = importAffiliationsRef.value
                .filter(importAffiliationRef => importAffiliationRef !== null)
                .every(importAffiliationRef => importAffiliationRef.affiliationBinded === true);
            return researcherBinded.value && allAffiliationsBinded;
        };

        const isReady = () => {
            const allAffiliationProcessesCompleted = importAffiliationsRef.value
                .filter(importAffiliationRef => importAffiliationRef !== null)
                .every(importAffiliationRef => importAffiliationRef.automaticProcessCompleted === true);

            return automaticProcessCompleted.value && allAffiliationProcessesCompleted;
        };

        watch(researcherBinded, () => {
            notifyParentIfAllHandled();
        });

        const notifyParentIfAllHandled = () => {
            const waitingOnAffiliationUserInput = importAffiliationsRef.value
                .filter(importAffiliationRef => importAffiliationRef !== null)
                .some(importAffiliationRef => importAffiliationRef.waitingOnUserInput === true);

            if (isHandled() && (waitingOnUserInput.value || waitingOnAffiliationUserInput)) {
                emit("userActionComplete");
            }
        };

        return {
            potentialMatches, switchPage, 
            tableOptions, headers, refreshTable,
            displayTextOrPlaceholder, totalPersons,
            selectedResearcher, researcherBinded, 
            showTable, selectManually, addNew,
            hadToBeCreated, importAffiliationsRef,
            isHandled, isReady,
            notifyParentIfAllHandled
        };
    },
});
</script>

<style lang="css" scoped>

h1 {
    color: #222;
    font-weight: 700;
    font-size: 1.5em;
}


h2 {
    color: #555;
    font-weight: 500;
    font-size: 1em;
    line-height: 1em;
}

</style>