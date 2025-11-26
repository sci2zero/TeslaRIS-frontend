<template>
    <v-container>
        <h1>{{ $t("authorAffiliationsLabel") }} - {{ returnCurrentLocaleContent(ouForLoading.name) }}</h1>

        <h2 v-if="affiliationBinded && !hadToBeCreated">
            {{ $t("foundAsLabel", [$i18n.locale.startsWith('sr') ? selectedAffiliation?.nameSr as string : selectedAffiliation?.nameOther as string]) }}
        </h2>

        <h2 v-if="affiliationBinded && hadToBeCreated">
            {{ $t(importAsUnmanaged ? "bindedUnmanagedEntityLabel" : "createdNewEntityLabel", [$i18n.locale.startsWith('sr') ? selectedAffiliation?.nameSr as string : selectedAffiliation?.nameOther as string]) }}
        </h2>

        <h2 v-if="showTable" class="can-not-find-message">
            {{ $t("canNotAutoFindOUMessage") }}
        </h2>

        <v-data-table-server
            v-if="showTable"
            :sort-by="tableOptions.sortBy"
            :items="potentialMatches"
            :headers="headers"
            item-value="row"
            :items-length="totalOUs"
            return-object
            :items-per-page-text="$t('itemsPerPageLabel')"
            :items-per-page-options="[10, 25, 50]"
            :no-data-text="$t('noDataInTableMessage')"
            @update:options="refreshTable">
            <template #item="row">
                <tr>
                    <td v-if="$i18n.locale.startsWith('sr')">
                        {{ displayTextOrPlaceholder(row.item.nameSr) }}
                    </td>
                    <td v-else>
                        {{ displayTextOrPlaceholder(row.item.nameOther) }}
                    </td>
                    <td v-if="$i18n.locale.startsWith('sr')">
                        {{ displayTextOrPlaceholder(row.item.superOUNameSr) }}
                    </td>
                    <td v-else>
                        {{ displayTextOrPlaceholder(row.item.superOUNameOther) }}
                    </td>
                    <td v-if="$i18n.locale.startsWith('sr')">
                        {{ displayTextOrPlaceholder(row.item.keywordsSr) }}
                    </td>
                    <td v-else>
                        {{ displayTextOrPlaceholder(row.item.keywordsOther) }}
                    </td>
                    <td v-if="$i18n.locale.startsWith('sr')">
                        {{ displayTextOrPlaceholder(row.item.researchAreasSr) }}
                    </td>
                    <td v-else>
                        {{ displayTextOrPlaceholder(row.item.researchAreasOther) }}
                    </td>
                    <td>
                        <v-btn size="small" color="primary" @click="selectManually(row.item)">
                            {{ $t("selectLabel") }}
                        </v-btn>
                    </td>
                </tr>
            </template>
        </v-data-table-server>

        <h3 v-if="showTable">
            {{ $t("canCreateNewOULabel") }} <v-btn size="small" color="primary" @click="addNew">
                {{ importAsUnmanaged ? $t("addExternalOULabel") : $t("createNewOULabel") }}
            </v-btn>
        </h3>
    </v-container>
</template>

<script lang="ts">
import { displayTextOrPlaceholder } from "@/utils/StringUtil";
import type { PropType } from "vue";
import { computed } from "vue";
import { ref } from "vue";
import { onMounted } from "vue";
import { defineComponent } from "vue";
import { useI18n } from "vue-i18n";
import { watch } from "vue";
import type { OrganisationUnitLoad } from "@/models/LoadModel";
import type { OrganisationUnitIndex } from "@/models/OrganisationUnitModel";
import OrganisationUnitService from "@/services/OrganisationUnitService";
import ImportService from "@/services/importer/ImportService";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";


export default defineComponent({
    name: "ImportAffiliationComponent",
    props: {
        ouForLoading: {
            type: Object as PropType<OrganisationUnitLoad>,
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

        const affiliationBinded = ref(false);
        const automaticProcessCompleted = ref(false);
        const selectedAffiliation = ref<OrganisationUnitIndex>();
        const waitingOnUserInput = ref(false);

        const showTable = ref(false);
        const potentialMatches = ref<OrganisationUnitIndex[]>([]);
        const hadToBeCreated = ref(false);

        const i18n = useI18n();

        const totalOUs = ref(0);
        const page = ref(0);
        const size = ref(5);
        const sort = ref("");
        const direction = ref("");
        const tableOptions = ref<any>({initialCustomConfiguration: true, page: 1, itemsPerPage: 10, sortBy:[]});
        
        onMounted(() => {
            startLoadProcess();
        });

        watch(() => props.ouForLoading, () => {
            setFlagsToDefault();
            startLoadProcess();
        });

        const startLoadProcess = () => {
            OrganisationUnitService.findOUByImportId(props.ouForLoading.importId).then(response => {
                if(response.data) {
                    selectedAffiliation.value = response.data;
                    affiliationBinded.value = true;
                    automaticProcessCompleted.value = true;
                } else {
                    showTable.value = true;
                    searchPotentialMatches();
                }
            });
        };

        const setFlagsToDefault = () => {
            affiliationBinded.value = false;
            showTable.value = false;
            hadToBeCreated.value = false;
            waitingOnUserInput.value = false;
            automaticProcessCompleted.value = false;
        };

        const searchPotentialMatches = () => {
            let namePartsQuery = "";
            props.ouForLoading.name[0].content.split(" ").forEach(namePart => {
                namePartsQuery += `tokens=${namePart}&`;
            });

            OrganisationUnitService.searchOUs(
                `${namePartsQuery}${props.ouForLoading.nameAbbreviation ? ("tokens=" + props.ouForLoading.nameAbbreviation) : ""}&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`,
                null, null
            )
            .then(response => {
                potentialMatches.value = response.data.content;
                totalOUs.value = response.data.totalElements;
                if (page.value === 0 && !automaticProcessCompleted.value) {
                    if (totalOUs.value === 0) {
                        showTable.value = false;
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

        const nameLabel = computed(() => i18n.t("nameLabel"));
        const keywordsLabel = computed(() => i18n.t("keywordsLabel"));
        const researchAreasLabel = computed(() => i18n.t("researchAreasLabel"));
        const superOULabel = computed(() => i18n.t("superOULabel"));
        
        const nameColumn = computed(() => i18n.t("nameColumn"));
        const keywordsColumn = computed(() => i18n.t("keywordsColumn"));
        const researchAreasColumn = computed(() => i18n.t("researchAreasColumn"));
        const superOUColumn = computed(() => i18n.t("superOUColumn"));
        const actionLabel = computed(() => i18n.t("actionLabel"));

        const headers = [
          { title: nameLabel, align: "start", sortable: true, key: nameColumn},
          { title: superOULabel, align: "start", sortable: true, key: superOUColumn},
          { title: keywordsLabel, align: "start", sortable: true, key: keywordsColumn},
          { title: researchAreasLabel, align: "start", sortable: true, key: researchAreasColumn},
          { title: actionLabel, align: "start", sortable: false, key: "actions"},
        ];

        const headersSortableMappings: Map<string, string> = new Map([
            ["nameSr", "name_sr_sortable"],
            ["nameOther", "name_other_sortable"],
            ["keywordsSr", "keywords_sr"],
            ["keywordsOther", "keywords_other"],
            ["researchAreasSr", "research_areas_sr_sortable"],
            ["researchAreasOther", "research_areas_other_sortable"],
            ["superOUNameSr", "super_ou_name_sr_sortable"],
            ["superOUNameOther", "super_ou_name_other_sortable"],
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

        const selectManually = (organisationUnit: OrganisationUnitIndex) => {
            selectedAffiliation.value = organisationUnit;
            ImportService.enrichInstitutionIdentifiers(
                props.ouForLoading.importId,
                organisationUnit.databaseId,
                self.crypto.randomUUID(),
                props.topLevelInstitutionId > 0 ? props.topLevelInstitutionId : null
            ).then(() => {
                affiliationBinded.value = true;
                showTable.value = false;
            });
        };

        const addNew = async () => {
            if (creationInProgress.value) {
                return;
            }
            creationInProgress.value = true;

            await new Promise(r => setTimeout(r, Math.floor(Math.random() * (500 - 10 + 1)) + 10));

            ImportService.createNewInstitution(
                props.ouForLoading.importId,
                self.crypto.randomUUID(),
                props.topLevelInstitutionId > 0 ? props.topLevelInstitutionId : null
            ).then((response) => {
                selectedAffiliation.value = {
                    nameSr: response.data.name[0].content,
                    nameOther: response.data.name[0].content,
                    databaseId: response.data.id,
                    keywordsSr: "",
                    keywordsOther: "",
                    nameSrSortable: "",
                    nameOtherSortable: "",
                    researchAreasSr: "",
                    researchAreasSrSortable: "",
                    researchAreasOther: "",
                    researchAreasOtherSortable: "",
                    superOUNameSr: "",
                    superOUNameSrSortable: "",
                    superOUNameOther: "",
                    superOUNameOtherSortable: "",
                    id: "",
                    superOUId: -1
                };

                hadToBeCreated.value = true;
                affiliationBinded.value = true;
                automaticProcessCompleted.value = true;
                showTable.value = false;
                creationInProgress.value = false;
            }).catch(() => {
                OrganisationUnitService.findOUByImportId(props.ouForLoading.scopusAfid).then(response => {
                    selectedAffiliation.value = response.data;
                    hadToBeCreated.value = true;
                    affiliationBinded.value = true;
                    automaticProcessCompleted.value = true;
                    creationInProgress.value = false;
                });
            });
        };

        watch(affiliationBinded, () => {
            if (affiliationBinded.value && waitingOnUserInput.value) {
                emit("userActionComplete");
            }
        });

        return {
            potentialMatches, switchPage, 
            tableOptions, headers, refreshTable,
            displayTextOrPlaceholder, totalOUs,
            selectedAffiliation, automaticProcessCompleted, 
            showTable, selectManually, addNew, affiliationBinded,
            hadToBeCreated, returnCurrentLocaleContent,
            waitingOnUserInput
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
