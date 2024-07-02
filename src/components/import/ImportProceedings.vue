<template>
    <v-container>
        <h1>{{ $t("conferenceLabel") }} - {{ returnCurrentLocaleContent(publicationForLoading.conferenceName) }}</h1>

        <h2 v-if="eventBinded && !hadToBeCreated">
            {{ $t("foundAsLabel", [$i18n.locale == 'sr' ? selectedEvent?.nameSr as string : selectedEvent?.nameOther as string]) }}
        </h2>

        <h2 v-if="eventBinded && hadToBeCreated">
            {{ $t("createdNewEntityLabel", [$i18n.locale == 'sr' ? selectedEvent?.nameSr as string : selectedEvent?.nameOther as string]) }}
        </h2>

        <h2 v-if="showTable" class="can-not-find-message">
            {{ $t("canNotAutoFindEventMessage") }}
        </h2>

        <v-data-table-server
            v-if="showTable"
            :sort-by="tableOptions.sortBy"
            :items="potentialMatches"
            :headers="headers"
            item-value="row"
            :items-length="totalEvents"
            return-object
            :items-per-page-text="$t('itemsPerPageLabel')"
            :items-per-page-options="[10, 25, 50]"
            @update:options="refreshTable">
            <template #item="row">
                <tr>
                    <td v-if="$i18n.locale == 'sr'">
                        {{ row.item.nameSr }}
                    </td>
                    <td v-else>
                        {{ row.item.nameOther }}
                    </td>
                    <td>
                        {{ displayTextOrPlaceholder(row.item.dateFromTo) }}
                    </td>
                    <td v-if="$i18n.locale == 'sr'">
                        {{ displayTextOrPlaceholder(row.item.stateSr) }}
                    </td>
                    <td v-else>
                        {{ displayTextOrPlaceholder(row.item.stateOther) }}
                    </td>
                </tr>
            </template>
        </v-data-table-server>

        <h3 v-if="showTable">
            {{ $t("canCreateNewEventLabel") }} <v-btn size="small" color="primary" @click="addNew">
                {{ $t("addConferenceLabel") }}
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
import type { ProceedingsPublicationLoad } from "@/models/LoadModel";
import { returnCurrentLocaleContent } from "@/i18n/TranslationUtil";
import type { EventIndex } from "@/models/EventModel";
import EventService from "@/services/EventService";


export default defineComponent({
    name: "ImportProceedingsComponent",
    props: {
        publicationForLoading: {
            type: Object as PropType<ProceedingsPublicationLoad>,
            required: true
        }
    },
    setup(props) {
        const eventBinded = ref(false);
        const automaticProcessCompleted = ref(false);
        const selectedEvent = ref<EventIndex>();

        const showTable = ref(false);
        const potentialMatches = ref<EventIndex[]>([]);
        const hadToBeCreated = ref(false);

        const i18n = useI18n();

        const totalEvents = ref(0);
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
            let parameters = "";
            props.publicationForLoading.conferenceName.forEach(name => {
                parameters += `names=${name.content}&`;
            });
            parameters += `dateFrom=${props.publicationForLoading.eventDateFrom}&dateTo=${props.publicationForLoading.eventDateTo}`;

            EventService.searchConferencesForImport(parameters).then(response => {
                if(response.data) {
                    if (response.data.totalElements === 1) {
                        selectedEvent.value = response.data.content[0];
                        eventBinded.value = true;
                        automaticProcessCompleted.value = true;
                    } else {
                        showTable.value = true;
                        searchPotentialMatches();
                    }   
                }
            });
        };

        const setFlagsToDefault = () => {
            eventBinded.value = false;
            showTable.value = false;
            hadToBeCreated.value = false;
        };

        const searchPotentialMatches = () => {
            // JournalService.searchJournals(`tokens=${props.publicationForLoading.journalName[0].content}&page=0&size=10`).then(response => {
            //     potentialMatches.value = response.data.content;
            //     totalJournals.value = response.data.totalElements;
            //     if (totalJournals.value === 0) {
            //         addNew();
            //     } else {
            //         automaticProcessCompleted.value = true;
            //     }
            // });
        };

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            sort.value = sortField;
            direction.value = sortDir;
            searchPotentialMatches();
        };

        const nameLabel = computed(() => i18n.t("nameLabel"));
        const eventDateLabel = computed(() => i18n.t("eventDateLabel"));
        const stateLabel = computed(() => i18n.t("stateLabel"));
        const nameColumn = computed(() => i18n.t("nameColumn"));
        const stateColumn = computed(() => i18n.t("stateColumn"));
        
        const headers = [
          { title: nameLabel, align: "start", sortable: true, key: nameColumn},
          { title: eventDateLabel, align: "start", sortable: true, key: "dateFromTo"},
          { title: stateLabel, align: "start", sortable: true, key: stateColumn},
        ];

        const headersSortableMappings: Map<string, string> = new Map([
            ["nameSr", "name_sr_sortable"],
            ["nameOther", "name_other_sortable"],
            ["dateFromTo", "date_sortable"],
            ["stateSr", "state_sr_sortable"],
            ["stateOther", "state_other_sortable"],
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

        const selectManually = (conference: EventIndex) => {
            selectedEvent.value = conference;
            eventBinded.value = true;
            showTable.value = false;
        };

        const addNew = () => {
            // ImportService.createNewJournal(props.publicationForLoading.journalEIssn, props.publicationForLoading.journalPrintIssn, idempotencyKey).then((response) => {
            //     selectedEvent.value = {
            //         titleSr: returnCurrentLocaleContent(response.data.title) as string,
            //         titleOther: returnCurrentLocaleContent(response.data.title) as string,
            //         databaseId: response.data.id as number,
            //         eISSN: response.data.eissn,
            //         printISSN: response.data.printISSN as string,
            //         titleOtherSortable: "",
            //         titleSrSortable: "",
            //         id: ""
            //     };

            //     hadToBeCreated.value = true;
            //     eventBinded.value = true;
            //     automaticProcessCompleted.value = true;
            //     showTable.value = false;
            // });
        };

        // const generateIdempotencyKey = (): string => {
        //     function s4(): string {
        //         return Math.floor((1 + Math.random()) * 0x10000)
        //         .toString(16)
        //         .substring(1);
        //     }

        //     return (
        //         s4() +
        //         s4() +
        //         '-' +
        //         s4() +
        //         '-' +
        //         s4() +
        //         '-' +
        //         s4() +
        //         '-' +
        //         s4() +
        //         s4() +
        //         s4()
        //     );
        // };
        // const idempotencyKey = generateIdempotencyKey();

        return {
            potentialMatches, switchPage, 
            tableOptions, headers, refreshTable,
            displayTextOrPlaceholder, totalEvents,
            selectedEvent, automaticProcessCompleted, 
            showTable, selectManually, addNew, eventBinded,
            hadToBeCreated, returnCurrentLocaleContent
        };
    },
});
</script>
