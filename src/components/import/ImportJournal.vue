<template>
    <v-container>
        <h1>{{ $t("journalLabel") }} - {{ returnCurrentLocaleContent(publicationForLoading.journalName) }}</h1>

        <h2 v-if="journalBinded && !hadToBeCreated">
            {{ $t("foundAsLabel", [$i18n.locale.startsWith('sr') ? selectedJournal?.titleSr as string : selectedJournal?.titleOther as string]) }}
        </h2>

        <h2 v-if="journalBinded && hadToBeCreated">
            {{ $t("createdNewEntityLabel", [$i18n.locale.startsWith('sr') ? selectedJournal?.titleSr as string : selectedJournal?.titleOther as string]) }}
        </h2>

        <h2 v-if="showTable" class="can-not-find-message">
            {{ $t("canNotAutoFindJournalMessage") }}
        </h2>

        <v-data-table-server
            v-if="showTable"
            :sort-by="tableOptions.sortBy"
            :items="potentialMatches"
            :headers="headers"
            item-value="row"
            :items-length="totalJournals"
            return-object
            :items-per-page-text="$t('itemsPerPageLabel')"
            :items-per-page-options="[10, 25, 50]"
            :no-data-text="$t('noDataInTableMessage')"
            @update:options="refreshTable">
            <template #item="row">
                <tr>
                    <td v-if="$i18n.locale.startsWith('sr')">
                        {{ row.item.titleSr }}
                    </td>
                    <td v-else>
                        {{ row.item.titleOther }}
                    </td>
                    <td>
                        {{ displayTextOrPlaceholder(row.item.eissn) }}
                    </td>
                    <td>
                        {{ displayTextOrPlaceholder(row.item.printISSN) }}
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
            {{ $t("canCreateNewJournalLabel") }} <v-btn size="small" color="primary" @click="addNew">
                {{ $t("createNewJournalLabel") }}
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
import type { JournalPublicationLoad } from "@/models/LoadModel";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import type { JournalIndex } from "@/models/JournalModel";
import JournalService from "@/services/JournalService";
import ImportService from "@/services/importer/ImportService";


export default defineComponent({
    name: "ImportJournalComponent",
    props: {
        publicationForLoading: {
            type: Object as PropType<JournalPublicationLoad>,
            required: true
        },
        topLevelInstitutionId: {
            type: Number,
            required: true
        }
    },
    emits: ["userActionComplete"],
    setup(props, {emit}) {
        const creationInProgress = ref(false);
        const journalBinded = ref(false);
        const automaticProcessCompleted = ref(false);
        const selectedJournal = ref<JournalIndex>();
        const waitingOnUserInput = ref(false);

        const showTable = ref(false);
        const potentialMatches = ref<JournalIndex[]>([]);
        const hadToBeCreated = ref(false);

        const i18n = useI18n();

        const totalJournals = ref(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");
        const tableOptions = ref<any>({initialCustomConfiguration: true, page: 1, itemsPerPage: 10, sortBy:[{key: "name",  order: "asc"}]});
        
        onMounted(() => {
            startLoadProcess();
        });

        watch(() => props.publicationForLoading, () => {
            setFlagsToDefault();
            startLoadProcess();
        });

        const startLoadProcess = () => {
            JournalService.findJournalByIdentifiers(
                props.publicationForLoading.journalEIssn,
                props.publicationForLoading.journalPrintIssn,
                props.publicationForLoading.journalOpenAlexId
            ).then(response => {
                if(response.data) {
                    selectedJournal.value = response.data;
                    journalBinded.value = true;
                    automaticProcessCompleted.value = true;
                } else {
                    showTable.value = true;
                    searchPotentialMatches();
                }
            });
        };

        const setFlagsToDefault = () => {
            journalBinded.value = false;
            showTable.value = false;
            hadToBeCreated.value = false;
            waitingOnUserInput.value = false;
        };

        const searchPotentialMatches = () => {
            let journalNameTokens = "";
            props.publicationForLoading.journalName[0].content.split(" ").forEach(namePart => {
                journalNameTokens += `tokens=${encodeURIComponent(namePart)}&`;
            });

            JournalService.searchJournals(
                `${journalNameTokens}page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`,
                null
            ).then(response => {
                potentialMatches.value = response.data.content;
                totalJournals.value = response.data.totalElements;
                if (page.value === 0 && !automaticProcessCompleted.value) {
                    if (totalJournals.value === 0) {
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

        const titleLabel = computed(() => i18n.t("titleLabel"));
        const actionLabel = computed(() => i18n.t("actionLabel"));

        const titleColumn = computed(() => i18n.t("titleColumn"));

        const headers = [
          { title: titleLabel, align: "start", sortable: true, key: titleColumn},
          { title: "eISSN", align: "start", sortable: true, key: "eISSN"},
          { title: "Print ISSN", align: "start", sortable: true, key: "printISSN"},
          { title: actionLabel, align: "start", sortable: false, key: "actions"}
        ];

        const headersSortableMappings: Map<string, string> = new Map([
            ["titleSr", "title_sr_sortable"],
            ["titleOther", "title_other_sortable"],
            ["eISSN", "e_issn"],
            ["printISSN", "print_issn"]
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

        const selectManually = (journal: JournalIndex) => {
            selectedJournal.value = journal;
            journalBinded.value = true;
            showTable.value = false;
            ImportService.enrichPublicationSeriesIdentifiers(
                props.publicationForLoading.journalEIssn ? props.publicationForLoading.journalEIssn : "NONE",
                props.publicationForLoading.journalPrintIssn ? props.publicationForLoading.journalPrintIssn : "NONE",
                journal.databaseId,
                self.crypto.randomUUID(),
                props.topLevelInstitutionId > 0 ? props.topLevelInstitutionId : null
            );
        };

        const addNew = () => {
            if (creationInProgress.value) {
                return;
            }

            creationInProgress.value = true;

            ImportService.createNewJournal(
                props.publicationForLoading.journalEIssn ? props.publicationForLoading.journalEIssn : "NONE",
                props.publicationForLoading.journalPrintIssn ? props.publicationForLoading.journalPrintIssn : "NONE",
                idempotencyKey,
                props.topLevelInstitutionId > 0 ? props.topLevelInstitutionId : null
            ).then((response) => {
                selectedJournal.value = {
                    titleSr: returnCurrentLocaleContent(response.data.title) as string,
                    titleOther: returnCurrentLocaleContent(response.data.title) as string,
                    databaseId: response.data.id as number,
                    eissn: response.data.eissn,
                    printISSN: response.data.printISSN as string,
                    titleOtherSortable: "",
                    titleSrSortable: "",
                    id: ""
                };

                hadToBeCreated.value = true;
                journalBinded.value = true;
                automaticProcessCompleted.value = true;
                showTable.value = false;
                creationInProgress.value = false;
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

        watch(journalBinded, () => {
            if (journalBinded.value && waitingOnUserInput.value) {
                emit("userActionComplete");
            }
        });

        return {
            potentialMatches, switchPage, 
            tableOptions, headers, refreshTable,
            displayTextOrPlaceholder, totalJournals,
            selectedJournal, automaticProcessCompleted, 
            showTable, selectManually, addNew, journalBinded,
            hadToBeCreated, returnCurrentLocaleContent
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
