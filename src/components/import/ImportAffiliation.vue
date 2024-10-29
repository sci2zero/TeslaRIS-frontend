<template>
    <v-container>
        <h1>{{ $t("authorAffiliationsLabel") }} - {{ returnCurrentLocaleContent(ouForLoading.name) }}</h1>

        <h2 v-if="affiliationBinded && !hadToBeCreated">
            {{ $t("foundAsLabel", [$i18n.locale == 'sr' ? selectedAffiliation?.nameSr as string : selectedAffiliation?.nameOther as string]) }}
        </h2>

        <h2 v-if="affiliationBinded && hadToBeCreated">
            {{ $t("createdNewEntityLabel", [$i18n.locale == 'sr' ? selectedAffiliation?.nameSr as string : selectedAffiliation?.nameOther as string]) }}
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
            @update:options="refreshTable">
            <template #item="row">
                <tr>
                    <td v-if="$i18n.locale == 'sr'">
                        {{ displayTextOrPlaceholder(row.item.nameSr) }}
                    </td>
                    <td v-else>
                        {{ displayTextOrPlaceholder(row.item.nameOther) }}
                    </td>
                    <td v-if="$i18n.locale == 'sr'">
                        {{ displayTextOrPlaceholder(row.item.superOUNameSr) }}
                    </td>
                    <td v-else>
                        {{ displayTextOrPlaceholder(row.item.superOUNameOther) }}
                    </td>
                    <td v-if="$i18n.locale == 'sr'">
                        {{ displayTextOrPlaceholder(row.item.keywordsSr) }}
                    </td>
                    <td v-else>
                        {{ displayTextOrPlaceholder(row.item.keywordsOther) }}
                    </td>
                    <td v-if="$i18n.locale == 'sr'">
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
                {{ $t("addOULabel") }}
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
import ImportService from "@/services/ImportService";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";


export default defineComponent({
    name: "ImportAffiliationComponent",
    props: {
        ouForLoading: {
            type: Object as PropType<OrganisationUnitLoad>,
            required: true
        }
    },
    setup(props) {
        const affiliationBinded = ref(false);
        const automaticProcessCompleted = ref(false);
        const selectedAffiliation = ref<OrganisationUnitIndex>();

        const showTable = ref(false);
        const potentialMatches = ref<OrganisationUnitIndex[]>([]);
        const hadToBeCreated = ref(false);

        const i18n = useI18n();

        const totalOUs = ref(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");
        const tableOptions = ref<any>({initialCustomConfiguration: true, page: 1, itemsPerPage: 10, sortBy:[{key: "name",  order: "asc"}]});
        
        onMounted(() => {
            startLoadProcess();
        });

        watch(() => props.ouForLoading, () => {
            setFlagsToDefault();
            startLoadProcess();
        });

        const startLoadProcess = () => {
            OrganisationUnitService.findOUByScopusAfid(props.ouForLoading.scopusAfid).then(response => {
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
        };

        const searchPotentialMatches = () => {
            OrganisationUnitService.searchOUs(`tokens=${props.ouForLoading.name[0].content}&tokens=${props.ouForLoading.nameAbbreviation}&page=0&size=10`).then(response => {
                potentialMatches.value = response.data.content;
                totalOUs.value = response.data.totalElements;
                if (totalOUs.value === 0) {
                    showTable.value = false;
                    addNew();
                } else {
                    automaticProcessCompleted.value = true;
                }
            });
        };

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            sort.value = sortField;
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

        const headers = [
          { title: nameLabel, align: "start", sortable: true, key: nameColumn},
          { title: superOULabel, align: "start", sortable: true, key: superOUColumn},
          { title: keywordsLabel, align: "start", sortable: true, key: keywordsColumn},
          { title: researchAreasLabel, align: "start", sortable: true, key: researchAreasColumn}
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
            affiliationBinded.value = true;
            showTable.value = false;
        };

        const addNew = async () => {
            await new Promise(r => setTimeout(r, Math.floor(Math.random() * (500 - 10 + 1)) + 10));

            ImportService.createNewInstitution(props.ouForLoading.scopusAfid, idempotencyKey).then((response) => {
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
            }).catch(() => {
                OrganisationUnitService.findOUByScopusAfid(props.ouForLoading.scopusAfid).then(response => {
                    selectedAffiliation.value = response.data;
                    hadToBeCreated.value = true;
                    affiliationBinded.value = true;
                    automaticProcessCompleted.value = true;
                });
                
            });
        };

        const generateIdempotencyKey = (): string => {
            function s4(): string {
                return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
            }

            return (
                s4() +
                s4() +
                '-' +
                s4() +
                '-' +
                s4() +
                '-' +
                s4() +
                '-' +
                s4() +
                s4() +
                s4()
            );
        };
        const idempotencyKey = generateIdempotencyKey();

        return {
            potentialMatches, switchPage, 
            tableOptions, headers, refreshTable,
            displayTextOrPlaceholder, totalOUs,
            selectedAffiliation, automaticProcessCompleted, 
            showTable, selectManually, addNew, affiliationBinded,
            hadToBeCreated, returnCurrentLocaleContent
        };
    },
});
</script>
