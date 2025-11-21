<template>
    <v-btn
        v-if="!disableBulkActions && (isAdmin || isPromotionRegistryAdministrator)"
        density="compact" class="bottom-spacer mt-3" :disabled="selectedEntries.length === 0"
        @click="startDeletionProcess">
        {{ $t("deleteLabel") }}
    </v-btn>
    <v-data-table-server
        v-model="selectedEntries"
        :sort-by="tableOptions.sortBy"
        :items="entries"
        :headers="headers"
        :items-length="totalEntries"
        :items-per-page-text="$t('itemsPerPageLabel')"
        :items-per-page-options="[5, 25, 50]"
        :items-per-page="25"
        :show-select="!disableBulkActions && (isAdmin || isPromotionRegistryAdministrator)"
        return-object
        :no-data-text="$t('noDataInTableMessage')"
        :page="tableOptions.page"
        @update:options="refreshTable"
    >
        <template #item="{ item }">
            <tr>
                <td v-if="!disableBulkActions && (isAdmin || isPromotionRegistryAdministrator)">
                    <v-checkbox
                        v-model="selectedEntries"
                        :value="item"
                        class="table-checkbox"
                        hide-details
                    />
                </td>
                <td>
                    <localized-link :to="'registry-book/' + item.id">
                        {{ item.personalInformation.authorName.firstname }} {{ item.personalInformation.authorName.lastname }}
                    </localized-link>
                </td>
                <td>
                    <localized-link :to="'organisation-units/' + item.dissertationInformation.organisationUnitId">
                        {{ returnCurrentLocaleContent(item.dissertationInformation.institutionName) }}
                    </localized-link>
                </td>
                <td>{{ item.dissertationInformation.acquiredTitle }}</td>
                <td>{{ localiseDate(item.dissertationInformation.defenceDate) }}</td>
                <td>{{ item.dissertationInformation.diplomaNumber }}</td>
                <td>{{ displayTextOrPlaceholder(localiseDate(item.dissertationInformation.diplomaIssueDate)) }}</td>
                <td v-if="promotedEntriesView">
                    {{ item.promotionSchoolYear }}
                </td>
                <td v-if="promotedEntriesView">
                    {{ item.registryBookNumber }}
                </td>
                <td v-if="promotedEntriesView">
                    {{ item.schoolYearOrdinalNumber }}
                </td>
                <td v-if="!disableActions && (isAdmin || isPromotionRegistryAdministrator)">
                    <v-btn
                        v-if="item.inPromotion && !item.promoted"
                        density="compact"
                        color="error"
                        @click="notPromoted(item.id)">
                        {{ $t('notPromotedLabel') }}
                    </v-btn>
                    <generic-crud-modal
                        v-if="!item.inPromotion"
                        class="mt-5"
                        :form-component="PromotionSelectorForm"
                        :form-props="{}"
                        entity-name="Entry"
                        @create="addToPromotion($event, (item.id as number))"
                    />
                </td>
            </tr>
        </template>
    </v-data-table-server>

    <persistent-question-dialog
        v-model="displayPersistentDialog"
        :title="$t('areYouSureLabel')"
        :message="$t('confirmDeletionMessage')"
        :entity-names="selectedEntries.map(entity => `${entity.personalInformation.authorName.firstname} ${entity.personalInformation.authorName.lastname}`)"
        @continue="deleteSelection">
    </persistent-question-dialog>
</template>
  
<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { RegistryBookEntry } from '@/models/ThesisLibraryModel';
import { localiseDate } from '@/utils/DateUtil';
import { displayTextOrPlaceholder } from '@/utils/StringUtil';
import PromotionSelectorForm from './PromotionSelectorForm.vue';
import RegistryBookService from '@/services/thesisLibrary/RegistryBookService';
import GenericCrudModal from '../core/GenericCrudModal.vue';
import LocalizedLink from '../localization/LocalizedLink.vue';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import PersistentQuestionDialog from '../core/comparators/PersistentQuestionDialog.vue';
import { useUserRole } from '@/composables/useUserRole';
  

export default defineComponent({
    name: "RegistryBookTableComponent",
    components: { GenericCrudModal, LocalizedLink, PersistentQuestionDialog },
    props: {
        entries: {
          type: Array as () => RegistryBookEntry[],
          required: true,
        },
        totalEntries: {
          type: Number,
          required: true,
        },
        disableActions: {
          type: Boolean,
          default: false
        },
        disableBulkActions: {
          type: Boolean,
          default: false
        },
        promotedEntriesView: {
          type: Boolean,
          default: false
        }
    },
    emits: ["switchPage", "entryNotPromoted", "entryAddedToPromotion"],
    setup(props, { emit }) {
        const i18n = useI18n();

        const selectedEntries = ref<RegistryBookEntry[]>([]);
        const notifications = ref<Map<string, string>>(new Map());

        const { isAdmin, isPromotionRegistryAdministrator } = useUserRole();

        const tableOptions = ref({
            initialCustomConfiguration: true,
            page: 1,
            itemsPerPage: 25,
            sortBy: [{ key: "dissertationInformation.defenceDate", order: "asc" }],
        });

        const fullNameLabel = computed(() => i18n.t("fullNameLabel"));
        const institutionNameLabel = computed(() => i18n.t("institutionNameLabel"));
        const acquiredTitleLabel = computed(() => i18n.t("acquiredTitleLabel"));
        const defenceDateLabel = computed(() => i18n.t("defenceDateLabel"));
        const diplomaNumberLabel = computed(() => i18n.t("diplomaNumberLabel"));
        const diplomaIssueDateLabel = computed(() => i18n.t("diplomaIssueDateLabel"));

        const headers = ref<any[]>([
            { title: fullNameLabel, align: "start", sortable: false, key: "personalInformation.fullName" },
            { title: institutionNameLabel, align: "start", sortable: false, key: "dissertationInformation.institutionName" },
            { title: acquiredTitleLabel, align: "start", sortable: false, key: "previousTitleInformation.acquiredTitle" },
            { title: defenceDateLabel, align: "start", key: "dissertationInformation.defenceDate" },
            { title: diplomaNumberLabel, align: "start", key: "dissertationInformation.diplomaNumber" },
            { title: diplomaIssueDateLabel, align: "start", key: "dissertationInformation.diplomaIssueDate" }
        ]);

        onMounted(() => {
            if (props.promotedEntriesView) {
                headers.value.push({ title: i18n.t("schoolYearLabel"), sortable: true, align: "start", key: "promotionSchoolYear" });
                headers.value.push({ title: i18n.t("registryBookNumberLabel"), align: "start" });
                headers.value.push({ title: i18n.t("schoolYearNumberLabel"), align: "start" });
            }
            
            if (!props.disableActions && (isAdmin.value || isPromotionRegistryAdministrator.value)) {
                headers.value.push({ title: i18n.t("actionLabel"), align: "start" });
            }
        });
    
        const refreshTable = (options: any) => {
            if (tableOptions.value.initialCustomConfiguration) {
                tableOptions.value.initialCustomConfiguration = false;
                options = tableOptions.value;
            }
            tableOptions.value = options;
            const sort = options.sortBy?.[0] || {};
            emit("switchPage", [options.page - 1, options.itemsPerPage, sort.key, sort.order]);
        };
    
        const notPromoted = (entryId?: number) => {
            if (entryId != null) {
                RegistryBookService.removeFromPromotion(entryId)
                .then(() => {
                    emit("entryNotPromoted", entryId);
                });
            }
        };

        const addToPromotion = (promotionId: number, entryId: number) => {
            RegistryBookService.addToPromotion(entryId, promotionId)
            .then(() => {
                emit("entryAddedToPromotion", entryId);
            });
        };

        const deleteSelection = () => {
            Promise.all(selectedEntries.value.map((entry: RegistryBookEntry) => {
                return RegistryBookService.deleteRegistryBookEntry(entry.id as number)
                    .then(() => {
                        addNotification(i18n.t("deleteSuccessNotification", { name: `${entry.personalInformation.authorName.firstname} ${entry.personalInformation.authorName.lastname}` }));
                    })
                    .catch(() => {
                        addNotification(i18n.t("deleteFailedNotification", { name: `${entry.personalInformation.authorName.firstname} ${entry.personalInformation.authorName.lastname}` }));
                        return entry;
                    });
            })).then((failedDeletions) => {
                selectedEntries.value = selectedEntries.value.filter((entry) => failedDeletions.includes(entry));
                refreshTable(tableOptions.value);
            });
        };

        const addNotification = (message: string) => {
            const notificationId = self.crypto.randomUUID();

            notifications.value.set(notificationId, message);
            setTimeout(() => removeNotification(notificationId), 2000);
        };

        const removeNotification = (notificationId: string) => {
            notifications.value.delete(notificationId);
        };

        const displayPersistentDialog = ref(false);
        const startDeletionProcess = () => {
            displayPersistentDialog.value = true;
        };
    
        return {
            selectedEntries, tableOptions,
            headers, refreshTable,
            notPromoted, localiseDate,
            displayTextOrPlaceholder,
            PromotionSelectorForm,
            addToPromotion, deleteSelection,
            returnCurrentLocaleContent,
            displayPersistentDialog,
            startDeletionProcess, isAdmin,
            isPromotionRegistryAdministrator
        };
    },
});
</script>
  
  <style scoped>
  .table-checkbox {
    margin: 0;
  }
  </style>