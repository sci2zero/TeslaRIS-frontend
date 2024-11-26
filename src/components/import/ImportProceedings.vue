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

        <h1>{{ $t("proceedingsLabel") }} - {{ returnCurrentLocaleContent(publicationForLoading.proceedingsName) }}</h1>

        <h2 v-if="proceedingsBinded && !hadToBeCreated">
            {{ $t("foundAsLabel", [returnCurrentLocaleContent(selectedProceedings?.title)]) }}
        </h2>

        <h2 v-if="proceedingsBinded && hadToBeCreated">
            {{ $t("createdNewEntityLabel", [returnCurrentLocaleContent(selectedProceedings?.title)]) }}
        </h2>

        <h2 v-if="proceedingsBinded && selectedProceedings?.publicationSeriesId">
            {{ $t("publishedInLabel", [returnCurrentLocaleContent(selectedPublicationSeries?.title)]) }}
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
            hide-default-footer
            :no-data-text="$t('noDataInTableMessage')">
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
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import { EventType, type EventIndex } from "@/models/EventModel";
import EventService from "@/services/EventService";
import ImportService from "@/services/ImportService";
import type { ProceedingsResponse } from "@/models/ProceedingsModel";
import ProceedingsService from "@/services/ProceedingsService";
import JournalService from "@/services/JournalService";
import type { PublicationSeries } from "@/models/PublicationSeriesModel";
import BookSeriesService from "@/services/BookSeriesService";


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
        const proceedingsBinded = ref(false);
        const automaticProcessCompleted = ref(false);

        const selectedEvent = ref<EventIndex>();
        const selectedProceedings = ref<ProceedingsResponse>();

        const showTable = ref(false);
        const potentialMatches = ref<EventIndex[]>([]);
        const hadToBeCreated = ref(false);

        const i18n = useI18n();

        const totalEvents = ref(0);
        const tableOptions = ref<any>({initialCustomConfiguration: true, page: 1, itemsPerPage: 10, sortBy:[{key: "name",  order: "asc"}]});
        
        const selectedPublicationSeries = ref<PublicationSeries>();

        onMounted(() => {
            startLoadProcess();
        });

        watch(() => props.publicationForLoading, () => {
            setFlagsToDefault();
            startLoadProcess();
        });

        const startLoadProcess = () => {
            searchPotentialMatches();
        };

        const setFlagsToDefault = () => {
            eventBinded.value = false;
            proceedingsBinded.value = false;
            showTable.value = false;
            hadToBeCreated.value = false;
        };

        const searchPotentialMatches = () => {
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
                        selectProceedingsFromConference();
                        automaticProcessCompleted.value = true;
                    } else if (response.data.totalElements === 0) {
                        addNew();
                    } else {
                        potentialMatches.value = response.data.content;
                        showTable.value = true;
                    }   
                }
            });
        };

        const nameLabel = computed(() => i18n.t("nameLabel"));
        const eventDateLabel = computed(() => i18n.t("eventDateLabel"));
        const stateLabel = computed(() => i18n.t("stateLabel"));
        const actionLabel = computed(() => i18n.t("actionLabel"));
        
        const nameColumn = computed(() => i18n.t("nameColumn"));
        const stateColumn = computed(() => i18n.t("stateColumn"));
        
        const headers = [
          { title: nameLabel, align: "start", sortable: false, key: nameColumn},
          { title: eventDateLabel, align: "start", sortable: false, key: "dateFromTo"},
          { title: stateLabel, align: "start", sortable: false, key: stateColumn},
          { title: actionLabel, align: "start", sortable: false, key: "actions"}
        ];

        const selectManually = (conference: EventIndex) => {
            selectedEvent.value = conference;
            eventBinded.value = true;
            showTable.value = false;
            selectProceedingsFromConference();
        };

        const selectProceedingsFromConference = () => {
            ProceedingsService.readProceedingsForEvent(selectedEvent.value?.databaseId as number).then(response => {
                if (response.data.length === 0) {
                    createNewProceedings();
                    return;
                }

                for (const proceedings of response.data) {
                    if (proceedings.eISBN === props.publicationForLoading.isbn) {
                        selectedProceedings.value = proceedings;
                        proceedingsBinded.value = true;
                        automaticProcessCompleted.value = true;
                        return;
                    }
                }

                for (const proceedings of response.data) {
                    for (const title of proceedings.title) {
                        if (title.content === returnCurrentLocaleContent(props.publicationForLoading.proceedingsName)) {
                            selectedProceedings.value = proceedings;
                            proceedingsBinded.value = true;
                            automaticProcessCompleted.value = true;
                            return;
                        }
                    }
                }

                createNewProceedings();
            });
        };

        const addNew = () => {
            ImportService.createNewProceedings(idempotencyKey).then((response) => {
                selectedEvent.value = {
                    nameSr: returnCurrentLocaleContent(response.data.eventName) as string,
                    nameOther: returnCurrentLocaleContent(response.data.eventName) as string,
                    databaseId: response.data.eventId as number,
                    nameOtherSortable: "",
                    nameSrSortable: "",
                    id: "",
                    dateFromTo: "",
                    dateSortable: "",
                    descriptionSr: "",
                    descriptionOther: "",
                    eventType: EventType.CONFERENCE,
                    keywordsOther: "",
                    keywordsSr: "",
                    placeSr: "",
                    placeOther: "",
                    stateSr: "",
                    stateOther: "",
                    stateSrSortable: "",
                    stateOtherSortable: "",
                    serialEvent: false
                };

                selectedProceedings.value = response.data;

                hadToBeCreated.value = true;
                eventBinded.value = true;
                proceedingsBinded.value = true;
                automaticProcessCompleted.value = true;
                showTable.value = false;
            });
        };

        const createNewProceedings = () => {
            ProceedingsService.createProceedings({
                title: props.publicationForLoading.proceedingsName,
                eventId: selectedEvent.value?.databaseId,
                description: [],
                fileItems: [],
                keywords: [],
                proofs: [],
                subTitle: [],
                uris: [],
                contributions: [],
                languageTagIds: [],
                eISBN: props.publicationForLoading.isbn
            }).then(() => {
                hadToBeCreated.value = true;
                proceedingsBinded.value = true;
                automaticProcessCompleted.value = true;
                showTable.value = false;
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

        watch(selectedProceedings, () => {
            if(selectedProceedings.value && selectedProceedings.value.publicationSeriesId) {
                JournalService.readJournal(selectedProceedings.value.publicationSeriesId).then((journalResponse) => {
                    selectedPublicationSeries.value = journalResponse.data;
                }).catch(() => {
                    BookSeriesService.readBookSeries(selectedProceedings.value?.publicationSeriesId as number).then((bookSeriesResponse) => {
                        selectedPublicationSeries.value = bookSeriesResponse.data;
                    });
                });
            }
        });

        return {
            potentialMatches, tableOptions, headers,
            displayTextOrPlaceholder, totalEvents,
            selectedEvent, automaticProcessCompleted, 
            showTable, selectManually, addNew, eventBinded,
            hadToBeCreated, returnCurrentLocaleContent,
            proceedingsBinded, selectedProceedings,
            selectedPublicationSeries
        };
    },
});
</script>
