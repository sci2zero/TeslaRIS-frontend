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
            <v-tab value="nonPromoted">
                {{ $t("nonPromotedLabel") }}
            </v-tab>
            <v-tab value="forPromotion">
                {{ $t("inPromotionLabel") }}
            </v-tab>
            <v-tab value="promoted">
                {{ $t("promotedLabel") }}
            </v-tab>
            <v-tab value="scheduledTasks">
                {{ $t("scheduledLabel") }}
            </v-tab>
            <v-tab value="reports">
                {{ $t("generatedRegistryBooksLabel") }}
            </v-tab>
            <v-tab value="institutionReport">
                {{ $t("institutionReportLabel") }}
            </v-tab>
        </v-tabs>
  
        <v-tabs-window v-model="currentTab">
            <v-window-item value="nonPromoted">
                <registry-book-entry-table
                    class="mt-3"
                    :entries="tableStates.nonPromoted.entries"
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
                    :entries="tableStates.forPromotion.entries"
                    :total-entries="tableStates.forPromotion.totalEntries"
                    disable-bulk-actions
                    @switch-page="(args: any[]) => switchPage('forPromotion', ...(args as [number, number, string, string]))"
                    @entry-not-promoted="fetchAllTables"
                />

                <div
                    v-if="tableStates.forPromotion.totalEntries > 0"
                    class="d-flex flex-row justify-between mb-5">
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
                        class="ml-3"
                        color="primary"
                        @click="previewPromotion">
                        {{ $t("promoteAllLabel") }}
                    </v-btn>
                </div>
            </v-window-item>
            <v-window-item value="promoted">
                <v-row class="justify-start mt-3">
                    <v-col cols="6" md="3" lg="1">
                        <date-picker
                            v-model="fromDate"
                            class="input-component"
                            :label="$t('fromLabel')"
                            color="primary"
                        ></date-picker>
                    </v-col>
                    <v-col cols="6" md="3" lg="1">
                        <date-picker
                            v-model="toDate"
                            :label="$t('toLabel')"
                            color="primary"
                        ></date-picker>
                    </v-col>
                    <v-col cols="12" sm="6" md="5" lg="3">
                        <organisation-unit-autocomplete-search
                            v-model:model-value="selectedInstitution"
                            :top-level-institution-id="loggedInUser && loggedInUser.organisationUnitId > 0 ? loggedInUser.organisationUnitId : undefined"
                            disable-submission
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
                <v-row class="justify-start">
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
                <registry-book-entry-table
                    class="mt-10"
                    :entries="tableStates.promoted.entries"
                    :total-entries="tableStates.promoted.totalEntries"
                    disable-actions
                    promoted-entries-view
                    disable-bulk-actions
                    @switch-page="(args: any[]) => switchPage('promoted', ...(args as [number, number, string, string]))"
                    @entry-added-to-promotion="fetchAllTables"
                />
            </v-window-item>
            <v-window-item value="scheduledTasks">
                <scheduled-tasks-list
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
                <v-row class="justify-start mt-3">
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
                <promotion-count-report class="mt-5" :report="reportCounts"></promotion-count-report>
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
import type { InstitutionPromotionCountsReport, RegistryBookEntry } from '@/models/ThesisLibraryModel';
import { localiseDate } from '@/i18n/dateLocalisation';
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
import { ScheduledTaskResponse } from '@/models/Common';
  

type TabKey = "nonPromoted" | "forPromotion" | "promoted";

interface EntryTableState {
    entries: RegistryBookEntry[];
    totalEntries: number;
    page: number;
    size: number;
    sort: string;
    direction: string;
    fetchFn: (() => Promise<void>) | (DebouncedFunc<() => Promise<void>>);
}
  
export default defineComponent({
    name: "RegistryBookListView",
    components: { RegistryBookEntryTable, PromotionPrintedLists, Toast, OrganisationUnitAutocompleteSearch, DatePicker, PromotionCountReport, RegistryBookReportsList, PersistentTableDialog },
    setup() {
        const message = ref("");
        const snackbar = ref(false);

        const currentTab = ref("nonPromoted");

        const langItems = getLangItems();
        const selectedLang = ref<{title: string, value: string}>({title: "Srpski", value: "sr"});
        const { requiredSelectionRules } = useValidationUtils();
    
        const i18n = useI18n();
        const { loggedInUser } = useUserRole();
    
        const promotions = ref<{ title: string; value: number }[]>([]);
        const selectedPromotion = ref<{ title: string; value: number }>({
            title: "",
            value: -1
        });

        const fromDate = ref("");
        const toDate = ref("");
        const selectedInstitution = ref<{ title: string; value: number }>({
            title: "",
            value: -1
        });
        const authorFullName = ref("");
        const authorAcquiredTitle = ref("");
        const reportCounts = ref<InstitutionPromotionCountsReport[]>([]);

        const recurrenceTypes = computed(() => getRecurrenceTypesForGivenLocale());
        const selectedRecurrenceType = ref<{title: string, value: RecurrenceType}>(
            {title: getRecurrenceTypeTitleFromValueAutoLocale(RecurrenceType.ONCE) as string, value: RecurrenceType.ONCE}
        );

        watch([fromDate, toDate, selectedInstitution, authorFullName, authorAcquiredTitle, selectedPromotion], () => {
            if (currentTab.value === "promoted" && selectedInstitution.value.value > 0) {
                tableStates.promoted.fetchFn();
            } else if (currentTab.value === "institutionReport" && fromDate.value && toDate.value) {
                RegistryBookService.getPromotedCounts(
                    fromDate.value.split("T")[0],
                    toDate.value.split("T")[0]
                ).then(response => {
                    reportCounts.value.splice(0);
                    reportCounts.value = response.data;
                });
            } else if (currentTab.value === "forPromotion" && selectedPromotion.value.value > 0) {
                tableStates.forPromotion.fetchFn();
            }
        });
    
        const tableStates = reactive<Record<TabKey, EntryTableState>>({
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

                    const query = `page=${tableStates.promoted.page}&size=${tableStates.promoted.size}${tableStates.promoted.sort ? `&sort=${tableStates.promoted.sort},${tableStates.promoted.direction}` : ""}`;
                    const response = await RegistryBookService.getPromoted(
                        selectedInstitution.value.value,
                        fromDate.value ? fromDate.value.split("T")[0] : "",
                        toDate.value ? toDate.value.split("T")[0] : "",
                        authorFullName.value, authorAcquiredTitle.value,
                        query
                    );
                    tableStates.promoted.entries = response.data.content;
                    tableStates.promoted.totalEntries = response.data.totalElements;
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
    
        onMounted(() => {
            document.title = i18n.t("registryBookLabel");
            fetchPromotions();
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
            const from = fromDate.value ? fromDate.value.split("T")[0] : "";
            const to = toDate.value ? toDate.value.split("T")[0] : "";

            RegistryBookReportService.scheduleReportGeneration(
                `from=${from}&to=${to}&institutionId=${selectedInstitution.value.value}&authorName=${authorFullName.value}&authorTitle=${authorAcquiredTitle.value}&lang=${selectedLang.value.value}`,
                selectedRecurrenceType.value.value
            ).then((response) => {
                message.value = i18n.t("reportGenerationScheduledMessage", [response.data]);
                snackbar.value = true;
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
            fetchAllTables, promoteAll,
            snackbar, message, loggedInUser,
            selectedInstitution, reportCounts,
            generateRegistryBookReport, langItems,
            selectedLang, requiredSelectionRules,
            promotionPreview, previewPromotion,
            promotionPreviewRef, authorFullName,
            authorAcquiredTitle, recurrenceTypes,
            selectedRecurrenceType, deleteScheduledTask,
            scheduledTasks
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
