<template>
    <v-container>
        <h1>{{ $t("registryBookLabel") }}</h1>
        <br />
        <br />
        <v-tabs
            v-model="currentTab"
            color="deep-purple-accent-4"
            align-tabs="start"
        >
            <v-tab v-show="!isPromotionRegistryAdministrator" value="notYetAdded">
                {{ $t("notYetAddedLabel") }}
            </v-tab>
            <v-tab value="nonPromoted">
                {{ $t("nonPromotedLabel") }}
            </v-tab>
            <v-tab value="forPromotion">
                {{ $t("inPromotionLabel") }}
            </v-tab>
            <v-tab value="promoted">
                {{ $t("promotedLabel") }}
            </v-tab>
            <v-tab v-show="isAdmin || isPromotionRegistryAdministrator" value="scheduledTasks">
                {{ $t("scheduleTasksLabel") }}
            </v-tab>
            <v-tab v-show="isAdmin || isPromotionRegistryAdministrator" value="reports">
                {{ $t("generatedRegistryBooksLabel") }}
            </v-tab>
            <v-tab value="institutionReport">
                {{ $t("institutionReportLabel") }}
            </v-tab>
        </v-tabs>
  
        <v-tabs-window v-model="currentTab">
            <v-window-item value="notYetAdded">
                <v-row class="justify-start mt-3!">
                    <v-col cols="6" md="4" lg="3">
                        <date-picker
                            v-model="fromDateSimple"
                            class="input-component"
                            :label="$t('fromLabel')"
                            color="primary"
                        ></date-picker>
                    </v-col>
                    <v-col cols="6" md="4" lg="3">
                        <date-picker
                            v-model="toDateSimple"
                            :label="$t('toLabel')"
                            color="primary"
                        ></date-picker>
                    </v-col>
                </v-row>
                <v-row class="justify-start mb-5">
                    <v-col
                        v-if="isAdmin"
                        cols="12" sm="6" md="5" lg="3">
                        <organisation-unit-autocomplete-search
                            v-model:model-value="selectedInstitution"
                            :top-level-institution-id="loggedInUser && loggedInUser.organisationUnitId > 0 ? loggedInUser.organisationUnitId : undefined"
                            disable-submission
                            registry-book-relevant
                            required
                        ></organisation-unit-autocomplete-search>
                    </v-col>
                    <v-col cols="12" sm="6" md="5" lg="3">
                        <v-select
                            v-model="selectedThesisTypes"
                            class="no-empty-outline publication-type-select"
                            :items="thesisTypes"
                            :label="$t('thesisTypeLabel')"
                            return-object
                            multiple
                        ></v-select>
                    </v-col>
                </v-row>
                <publication-table-component
                    class="mt-15"
                    :publications="(tableStates.notYetAdded.entries as DocumentPublicationIndex[])"
                    :total-publications="tableStates.notYetAdded.totalEntries"
                    rich-results-view
                    sort-by-date-default
                    @switch-page="(...args) => switchPage('notYetAdded', ...(args as [number, number, string, string]))">
                </publication-table-component>
            </v-window-item>
            <v-window-item value="nonPromoted">
                <registry-book-entry-table
                    :entries="(tableStates.nonPromoted.entries as RegistryBookEntry[])"
                    :total-entries="tableStates.nonPromoted.totalEntries"
                    @switch-page="(args: any[]) => switchPage('nonPromoted', ...(args as [number, number, string, string]))"
                    @entry-added-to-promotion="fetchAllTables"
                />
            </v-window-item>
            <v-window-item value="forPromotion">
                <v-select
                    v-model="selectedPromotion"
                    class="promotion-select mt-3"
                    :items="promotions"
                    :label="$t('promotionLabel')"
                    return-object
                    :no-data-text="$t('noDataInTableMessage')"
                />
                <registry-book-entry-table
                    class="mt-5"
                    :entries="(tableStates.forPromotion.entries as RegistryBookEntry[])"
                    :total-entries="tableStates.forPromotion.totalEntries"
                    disable-bulk-actions
                    @switch-page="(args: any[]) => switchPage('forPromotion', ...(args as [number, number, string, string]))"
                    @entry-not-promoted="fetchAllTables"
                />

                <div
                    v-if="tableStates.forPromotion.totalEntries > 0"
                    class="d-flex flex-row justify-between mb-5 mt-5">
                    <promotion-printed-lists
                        :promotion-id="selectedPromotion.value"
                    />
                    <persistent-table-dialog
                        ref="promotionPreviewRef"
                        :title="$t('promotionPreviewLabel')"
                        :row-data="promotionPreview"
                        :headers="headers"
                        @continue="promoteAll">
                    </persistent-table-dialog>
                    <v-btn
                        v-if="isAdmin || isPromotionRegistryAdministrator"
                        class="ml-3"
                        color="primary"
                        @click="previewPromotion">
                        {{ $t("promoteAllLabel") }}
                    </v-btn>
                </div>
            </v-window-item>
            <v-window-item value="promoted">
                <v-row class="justify-start mt-3">
                    <v-col cols="6" md="4" lg="3">
                        <date-picker-split
                            v-model="fromDate"
                            class="input-component"
                            :label="$t('fromLabel')"
                            color="primary"
                        ></date-picker-split>
                    </v-col>
                    <v-col cols="6" md="4" lg="3">
                        <date-picker-split
                            v-model="toDate"
                            :label="$t('toLabel')"
                            color="primary"
                        ></date-picker-split>
                    </v-col>
                </v-row>
                <v-row class="justify-start mb-5">
                    <v-col cols="12" sm="6" md="5" lg="3">
                        <organisation-unit-autocomplete-search
                            v-model:model-value="selectedInstitution"
                            :top-level-institution-id="loggedInUser && loggedInUser.organisationUnitId > 0 ? loggedInUser.organisationUnitId : undefined"
                            disable-submission
                            registry-book-relevant
                        ></organisation-unit-autocomplete-search>
                    </v-col>
                    <v-col cols="12" sm="6" lg="3">
                        <v-text-field
                            v-model="authorFullName"
                            :label="$t('fullNameLabel')"
                            :placeholder="$t('fullNameLabel')">
                        </v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" lg="3">
                        <v-text-field
                            v-model="authorAcquiredTitle"
                            :label="$t('acquiredTitleLabel')"
                            :placeholder="$t('acquiredTitleLabel')">
                        </v-text-field>
                    </v-col>
                </v-row>
                <v-row v-if="isPromotionRegistryAdministrator || isAdmin" class="justify-start">
                    <v-col
                        v-if="tableStates.promoted.entries.length > 0" cols="6" md="3"
                        lg="2">
                        <v-select
                            v-model="selectedLang"
                            :items="langItems"
                            :label="$t('languageLabel') + '*'"
                            :rules="requiredSelectionRules"
                            return-object>
                        </v-select>
                    </v-col>
                    <v-col
                        v-if="tableStates.promoted.entries.length > 0" 
                        cols="4" md="2">
                        <v-select
                            v-model="selectedRecurrenceType"
                            :items="recurrenceTypes"
                            :label="$t('recurrenceTypeLabel') + '*'"
                            :rules="requiredSelectionRules"
                            return-object>
                        </v-select>
                    </v-col>
                    <v-col v-if="tableStates.promoted.entries.length > 0">
                        <v-btn
                            density="compact" class="mt-3"
                            @click="generateRegistryBookReport">
                            {{ $t("generateRegistryBookLabel") }}
                        </v-btn>
                    </v-col>
                </v-row>
                <v-row
                    v-if="selectedRecurrenceType.value != RecurrenceType.ONCE"
                    class="d-flex flex-row justify-start bg-grey-lighten-5">
                    <v-col cols="12" md="4">
                        <relative-date-preview
                            :start-date="fromDate ? fromDate : (new Date('1000-01-01T00:00:00').toLocaleDateString('sr'))"
                            :end-date="toDate ? toDate : (new Date().toLocaleDateString('sr'))"
                            :recurrence-period="selectedRecurrenceType.value"
                        />
                    </v-col>
                </v-row>
                <v-row class="mb-1">
                    <registry-book-entry-table
                        class="mt-15"
                        :entries="(tableStates.promoted.entries as RegistryBookEntry[])"
                        :total-entries="tableStates.promoted.totalEntries"
                        disable-actions
                        promoted-entries-view
                        disable-bulk-actions
                        @switch-page="(args: any[]) => switchPage('promoted', ...(args as [number, number, string, string]))"
                        @entry-added-to-promotion="fetchAllTables"
                    />
                </v-row>
            </v-window-item>
            <v-window-item value="scheduledTasks">
                <scheduled-tasks-list
                    class="mt-10!"
                    :scheduled-tasks="scheduledTasks"
                    @delete="deleteScheduledTask">
                </scheduled-tasks-list>
            </v-window-item>
            <v-window-item value="reports">
                <v-row class="justify-start mt-3">
                    <v-col cols="6">
                        <registry-book-reports-list></registry-book-reports-list>
                    </v-col>
                </v-row>
            </v-window-item>
            <v-window-item value="institutionReport">
                <v-row class="justify-start mt-3!">
                    <v-col cols="6" md="3" lg="1">
                        <date-picker
                            v-model="fromDate"
                            class="input-component"
                            :label="$t('fromLabel') + '*'"
                            color="primary"
                        ></date-picker>
                    </v-col>
                    <v-col cols="6" md="3" lg="1">
                        <date-picker
                            v-model="toDate"
                            :label="$t('toLabel') + '*'"
                            color="primary"
                        ></date-picker>
                    </v-col>
                </v-row>
                <promotion-count-report
                    v-show="!reportLoading"
                    class="mt-5"
                    :report="reportCounts">
                </promotion-count-report>
                <v-progress-circular
                    v-if="reportLoading"
                    class="ml-2"
                    color="primary"
                    indeterminate
                ></v-progress-circular>
            </v-window-item>
        </v-tabs-window>
        
        <toast v-model="snackbar" :message="message" />
    </v-container>
</template>
  
<script lang="ts">
import { defineComponent, ref, reactive, onMounted, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import RegistryBookService from '@/services/thesisLibrary/RegistryBookService';
import PromotionService from '@/services/thesisLibrary/PromotionService';
import RegistryBookEntryTable from '@/components/thesisLibrary/RegistryBookEntryTable.vue';
import PromotionPrintedLists from '@/components/thesisLibrary/PromotionPrintedLists.vue';
import type { InstitutionPromotionCountsReport, NotAddedToPromotionThesesRequest, RegistryBookEntry } from '@/models/ThesisLibraryModel';
import { computeRelativeDate, localiseDate } from '@/utils/DateUtil';
import Toast from '@/components/core/Toast.vue';
import OrganisationUnitAutocompleteSearch from '@/components/organisationUnit/OrganisationUnitAutocompleteSearch.vue';
import DatePicker from '@/components/core/DatePicker.vue';
import { useUserRole } from '@/composables/useUserRole';
import PromotionCountReport from '@/components/thesisLibrary/PromotionCountReport.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import RegistryBookReportService from '@/services/thesisLibrary/RegistryBookReportService';
import RegistryBookReportsList from '@/components/thesisLibrary/RegistryBookReportsList.vue';
import { getLangItems } from '@/i18n/languages';
import { useValidationUtils } from '@/utils/ValidationUtils';
import PersistentTableDialog from './PersistentTableDialog.vue';
import lodash, { type DebouncedFunc } from 'lodash';
import { getRecurrenceTypesForGivenLocale, getRecurrenceTypeTitleFromValueAutoLocale } from '@/i18n/recurrenceType';
import { RecurrenceType } from '@/models/LoadModel';
import TaskManagerService from '@/services/TaskManagerService';
import { type ScheduledTaskResponse } from '@/models/Common';
import ScheduledTasksList from '@/components/core/ScheduledTasksList.vue';
import DatePickerSplit from '@/components/core/DatePickerSplit.vue';
import RelativeDatePreview from '@/components/core/RelativeDatePreview.vue';
import OrganisationUnitService from '@/services/OrganisationUnitService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import { ThesisType, type DocumentPublicationIndex } from '@/models/PublicationModel';
import PublicationTableComponent from '@/components/publication/PublicationTableComponent.vue';
import ThesisLibraryReportingService from '@/services/thesisLibrary/ThesisLibraryReportingService';
import { getThesisTypesForGivenLocale } from '@/i18n/thesisType';
  

type TabKey = "notYetAdded" | "nonPromoted" | "forPromotion" | "promoted";

interface EntryTableState {
    entries: RegistryBookEntry[] | DocumentPublicationIndex[];
    totalEntries: number;
    page: number;
    size: number;
    sort: string;
    direction: string;
    fetchFn: (() => Promise<void>) | (DebouncedFunc<() => Promise<void>>);
}
  
export default defineComponent({
    name: "RegistryBookListView",
    components: { RegistryBookEntryTable, PromotionPrintedLists, Toast, OrganisationUnitAutocompleteSearch, DatePicker, PromotionCountReport, RegistryBookReportsList, PersistentTableDialog, ScheduledTasksList, DatePickerSplit, RelativeDatePreview, PublicationTableComponent },
    setup() {
        const message = ref("");
        const snackbar = ref(false);

        const currentTab = ref("nonPromoted");

        const reportLoading = ref(false);

        const langItems = getLangItems();
        const selectedLang = ref<{title: string, value: string}>({title: "Srpski", value: "sr"});
        const { requiredSelectionRules } = useValidationUtils();
    
        const i18n = useI18n();
        const { loggedInUser, isPromotionRegistryAdministrator, isAdmin } = useUserRole();
    
        const promotions = ref<{ title: string; value: number }[]>([]);
        const selectedPromotion = ref<{ title: string; value: number }>({
            title: "",
            value: -1
        });

        const fromDate = ref(new Date(new Date().setFullYear(new Date().getFullYear() - 10)).toISOString().split("T")[0]);
        const toDate = ref((new Date()).toISOString().split("T")[0]);
        const fromDateSimple = ref(new Date(new Date().setFullYear(new Date().getFullYear() - 10)).toISOString().split("T")[0]);
        
        const toDateSimple = ref((new Date()).toISOString().split("T")[0]);
        const selectedInstitution = ref<{ title: string; value: number }>({
            title: "",
            value: -1
        });
        const thesisTypes =
            computed(() => getThesisTypesForGivenLocale()?.filter(el => el.value === ThesisType.PHD || el.value === ThesisType.PHD_ART_PROJECT));
        const selectedThesisTypes = ref<{ title: string, value: ThesisType }[]>([]);
        
        const authorFullName = ref("");
        const authorAcquiredTitle = ref("");
        const reportCounts = ref<InstitutionPromotionCountsReport[]>([]);

        const recurrenceTypes = computed(() => getRecurrenceTypesForGivenLocale());
        const selectedRecurrenceType = ref<{title: string, value: RecurrenceType}>(
            {title: getRecurrenceTypeTitleFromValueAutoLocale(RecurrenceType.ONCE) as string, value: RecurrenceType.ONCE}
        );

        watch(
            [
                fromDate, toDate,
                fromDateSimple,
                toDateSimple,
                selectedInstitution,
                authorFullName,
                authorAcquiredTitle,
                selectedPromotion,
                selectedThesisTypes,
                currentTab
            ], () => {
            if (currentTab.value === "promoted" && selectedInstitution.value.value > 0) {
                tableStates.promoted.fetchFn();
            } else if (currentTab.value === "institutionReport" && fromDate.value && toDate.value) {
                reportLoading.value = true;
                RegistryBookService.getPromotedCounts(
                    fromDate.value.split("T")[0],
                    toDate.value.split("T")[0]
                ).then(response => {
                    reportCounts.value.splice(0);
                    reportCounts.value = response.data;

                    reportLoading.value = false;
                });
            } else if (currentTab.value === "forPromotion" && selectedPromotion.value.value > 0) {
                tableStates.forPromotion.fetchFn();
            } else if(currentTab.value === "notYetAdded") {
                tableStates.notYetAdded.fetchFn();
            }
        });
    
        const tableStates = reactive<Record<TabKey, EntryTableState>>({
            notYetAdded: {
                entries: [],
                totalEntries: 0,
                page: 0,
                size: 10,
                sort: "",
                direction: "",
                fetchFn: async () => {
                    if (isPromotionRegistryAdministrator.value ||
                        (isAdmin.value && (!selectedInstitution.value || selectedInstitution.value.value <= 0))
                    ) {
                        return;
                    }

                    const pageable = 
                        `page=${tableStates.notYetAdded.page}&size=${tableStates.notYetAdded.size}${tableStates.notYetAdded.sort ? `&sort=${tableStates.notYetAdded.sort},${tableStates.notYetAdded.direction}` : ""}`;
                    const reportRequest: NotAddedToPromotionThesesRequest = {
                        topLevelInstitutionIds: selectedInstitution.value.value > 0 ? [selectedInstitution.value.value] : [],
                        thesisTypes: selectedThesisTypes.value.map(selection => selection.value),
                        fromDate: fromDate.value.split("T")[0],
                        toDate: toDate.value.split("T")[0]
                    };

                    const response = await ThesisLibraryReportingService.getEntriesNotAddedToRegBook(reportRequest, pageable);
                    tableStates.notYetAdded.entries = response.data.content;
                    tableStates.notYetAdded.totalEntries = response.data.totalElements;
                }
            },
            nonPromoted: {
                entries: [],
                totalEntries: 0,
                page: 0,
                size: 1,
                sort: "",
                direction: "",
                fetchFn: async () => {
                    const query = `page=${tableStates.nonPromoted.page}&size=${tableStates.nonPromoted.size}${tableStates.nonPromoted.sort ? `&sort=${tableStates.nonPromoted.sort},${tableStates.nonPromoted.direction}` : ""}`;
                    const response = await RegistryBookService.getNonPromotedEntries(query);
                    tableStates.nonPromoted.entries = response.data.content;
                    tableStates.nonPromoted.totalEntries = response.data.totalElements;
                }
            },
            forPromotion: {
                entries: [],
                totalEntries: 0,
                page: 0,
                size: 1,
                sort: "",
                direction: "",
                fetchFn: async () => {
                    const query = `page=${tableStates.forPromotion.page}&size=${tableStates.forPromotion.size}${tableStates.forPromotion.sort ? `&sort=${tableStates.forPromotion.sort},${tableStates.forPromotion.direction}` : ""}`;
                    const response = await RegistryBookService.getForPromotion(
                        selectedPromotion.value.value,
                        query
                    );
                    tableStates.forPromotion.entries = response.data.content;
                    tableStates.forPromotion.totalEntries = response.data.totalElements;
                }
            },
            promoted: {
                entries: [],
                totalEntries: 0,
                page: 0,
                size: 1,
                sort: "",
                direction: "",
                fetchFn: lodash.debounce(async () => {
                    if (selectedInstitution.value.value <= 0) {
                        return;
                    }

                    let dateFrom = fromDate.value
                    let dateTo = toDate.value;
                    if (fromDate.value.includes("%7C")) {
                        dateFrom = computeRelativeDate(dateFrom);
                    } else if (toDate.value.includes("%7C")) {
                        dateTo = computeRelativeDate(dateTo);
                    }

                    const query = `page=${tableStates.promoted.page}&size=${tableStates.promoted.size}${tableStates.promoted.sort ? `&sort=${tableStates.promoted.sort},${tableStates.promoted.direction}` : ""}`;
                    const response = await RegistryBookService.getPromoted(
                        selectedInstitution.value.value,
                        dateFrom ? dateFrom.split("T")[0] : "",
                        dateTo ? dateTo.split("T")[0] : "",
                        authorFullName.value, authorAcquiredTitle.value,
                        query
                    );
                    tableStates.promoted.entries = response.data.content;
                    tableStates.promoted.totalEntries = response.data.totalElements;

                    selectedRecurrenceType.value = {
                        title: getRecurrenceTypeTitleFromValueAutoLocale(RecurrenceType.ONCE) as string,
                        value: RecurrenceType.ONCE
                    };
                }, 300)
            }
        });
    
        const fetchAllTables = () => {
            Object.values(tableStates).forEach(state => state.fetchFn());
        };
    
        const switchPage = (
            tab: TabKey,
            nextPage: number,
            pageSize: number,
            sortField: string,
            sortDir: string
        ) => {
            const state = tableStates[tab];
            if (!state) {
                return;
            }

            state.page = nextPage;
            state.size = pageSize;
            state.sort = sortField;
            state.direction = sortDir;
            state.fetchFn();
        };
    
        const fetchPromotions = () => {
            PromotionService.getNonFinishedPromotions().then(response => {
                promotions.value.splice(0);
                response.data.forEach(promotion => {
                    promotions.value.push({
                    title: localiseDate(promotion.promotionDate) as string,
                    value: promotion.id as number
                    });
                });
        
                if (promotions.value.length > 0) {
                    selectedPromotion.value = promotions.value[0];
                }
        
                fetchAllTables();
            });
        };
    
        watch(i18n.locale, () => {
            fetchAllTables();
        });

        watch(loggedInUser, () => {
            if (loggedInUser.value && isPromotionRegistryAdministrator.value) {
                OrganisationUnitService.readOU(loggedInUser.value?.organisationUnitId as number).then(response => {
                    selectedInstitution.value = {
                        title: returnCurrentLocaleContent(response.data.name) as string,
                        value: response.data.id
                    };
                });
            }
        });
    
        onMounted(() => {
            document.title = i18n.t("registryBookLabel");
            fetchPromotions();

            if (isAdmin.value || isPromotionRegistryAdministrator.value) {
                fetchScheduledTasks();
            }
        });

        const promotionPreviewRef = ref<typeof PersistentTableDialog>();
        const promotionPreview = ref<string[][]>([]);
        const headers = [
            "registryBookHeaders.index",
            "registryBookHeaders.name",
            "registryBookHeaders.birthPlace",
            "registryBookHeaders.parents",
            "registryBookHeaders.studyInfo",
            "registryBookHeaders.previousTitle",
            "registryBookHeaders.faculty",
            "registryBookHeaders.dissertation",
            "registryBookHeaders.commission",
            "registryBookHeaders.defendedOn",
            "registryBookHeaders.newTitle",
            "registryBookHeaders.diploma",
            "registryBookHeaders.promotionDate"
        ];
        const previewPromotion = () => {
            RegistryBookService.previewPromoteAll(selectedPromotion.value.value).then(response => {
                promotionPreview.value = response.data;
                promotionPreviewRef.value?.toggle();
            }).catch((error) => {
                message.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
            });
        };

        const promoteAll = () => {
            RegistryBookService.promoteAll(selectedPromotion.value.value)
            .then(() => {
                tableStates.forPromotion.fetchFn();
                fetchPromotions();
                message.value = i18n.t("promotedSuccessfullyMessage");
                snackbar.value = true;
            }).catch((error) => {
                message.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
            });
        };

        const generateRegistryBookReport = () => {
            if (fromDate.value.includes("%7C")) {
                fromDate.value = computeRelativeDate(fromDate.value);
            } else if (toDate.value.includes("%7C")) {
                toDate.value = computeRelativeDate(toDate.value);
            }

            const from = fromDate.value ? 
                fromDate.value.split("T")[0] : (new Date('1000-01-01T00:00:00').toISOString()).split("T")[0];
            const to = toDate.value ?
                toDate.value.split("T")[0] : (new Date().toISOString()).split("T")[0];

            RegistryBookReportService.scheduleReportGeneration(
                `from=${from}&to=${to}&institutionId=${selectedInstitution.value.value}&authorName=${authorFullName.value}&authorTitle=${authorAcquiredTitle.value}&lang=${selectedLang.value.value}`,
                selectedRecurrenceType.value.value
            ).then((response) => {
                message.value = i18n.t("reportGenerationScheduledMessage", [response.data]);
                snackbar.value = true;
                fetchScheduledTasks();
            }).catch((error) => {
                message.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
            });
        };

        const scheduledTasks = ref<ScheduledTaskResponse[]>([]);
        const fetchScheduledTasks = () => {
            TaskManagerService.listScheduledRegistryBookGenerationTasks().then((response) => {
                scheduledTasks.value = response.data;
                scheduledTasks.value.sort((a, b) => {
                    if(!a.executionTime) {
                        return 1;
                    }

                    return a.executionTime.localeCompare(b.executionTime);
                });
            });
        };

        const deleteScheduledTask = (taskId: string) => {
            TaskManagerService.canceltask(taskId).then(() => {
                message.value = i18n.t("cancelSuccessMessage");
                snackbar.value = true;
                fetchScheduledTasks();
            }).catch(() => {
                message.value = i18n.t("genericErrorMessage");
                snackbar.value = true;
            });
        };
    
        return {
            currentTab, fromDate, toDate,
            tableStates, switchPage, headers,
            promotions, selectedPromotion,
            fetchAllTables, promoteAll, isAdmin,
            snackbar, message, loggedInUser,
            selectedInstitution, reportCounts,
            generateRegistryBookReport, langItems,
            selectedLang, requiredSelectionRules,
            promotionPreview, previewPromotion,
            promotionPreviewRef, authorFullName,
            authorAcquiredTitle, recurrenceTypes,
            selectedRecurrenceType, deleteScheduledTask,
            scheduledTasks, RecurrenceType, reportLoading,
            isPromotionRegistryAdministrator, fromDateSimple,
            toDateSimple, selectedThesisTypes, thesisTypes
        };
    }
});
</script>

<style scoped>

.promotion-select {
    max-width: 200px;
    margin-top: 10px;
}

.institution-select {
    max-width: 400px;
    margin-top: 10px;
}

</style>
