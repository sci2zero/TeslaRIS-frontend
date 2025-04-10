<template>
    <v-data-table-server
        v-model="selectedEntries"
        :sort-by="tableOptions.sortBy"
        :items="entries"
        :headers="headers"
        :items-length="totalEntries"
        :items-per-page-text="$t('itemsPerPageLabel')"
        :items-per-page-options="[5, 25, 50]"
        :items-per-page="25"
        show-select
        return-object
        :no-data-text="$t('noDataInTableMessage')"
        :page="tableOptions.page"
        @update:options="refreshTable"
    >
        <template #item="{ item }">
            <tr>
                <td>
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
                <td>{{ item.dissertationInformation.organisationUnitId }}</td>
                <td>{{ item.previousTitleInformation.academicTitle }}</td>
                <td>{{ localiseDate(item.dissertationInformation.defenceDate) }}</td>
                <td>{{ item.dissertationInformation.diplomaNumber }}</td>
                <td>{{ displayTextOrPlaceholder(localiseDate(item.dissertationInformation.diplomaIssueDate)) }}</td>
                <td>
                    <v-btn
                        v-if="item.inPromotion"
                        density="compact"
                        color="error"
                        @click="notPromoted(item.id)">
                        {{ $t('notPromotedLabel') }}
                    </v-btn>
                    <generic-crud-modal
                        v-else
                        :form-component="PromotionSelectorForm"
                        :form-props="{}"
                        entity-name=""
                        @create="addToPromotion($event, (item.id as number))"
                    />
                </td>
            </tr>
        </template>
    </v-data-table-server>
</template>
  
<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { RegistryBookEntry } from '@/models/ThesisLibraryModel';
import { localiseDate } from '@/i18n/dateLocalisation';
import { displayTextOrPlaceholder } from '@/utils/StringUtil';
import PromotionSelectorForm from './PromotionSelectorForm.vue';
import RegistryBookService from '@/services/thesisLibrary/RegistryBookService';
import GenericCrudModal from '../core/GenericCrudModal.vue';
import LocalizedLink from '../localization/LocalizedLink.vue';
  

export default defineComponent({
    name: "RegistryBookTableComponent",
    components: { GenericCrudModal, LocalizedLink },
    props: {
      entries: {
        type: Array as () => RegistryBookEntry[],
        required: true,
      },
      totalEntries: {
        type: Number,
        required: true,
      },
    },
    emits: ["switchPage", "entryNotPromoted", "entryAddedToPromotion"],
    setup(_, { emit }) {
        const i18n = useI18n();
        const selectedEntries = ref<RegistryBookEntry[]>([]);
        const tableOptions = ref({
            initialCustomConfiguration: true,
            page: 1,
            itemsPerPage: 25,
            sortBy: [{ key: "dissertationInformation.defenceDate", order: "asc" }],
        });
    
        const headers = computed<any>(() => [
            { title: i18n.t("fullNameLabel"), align: "start", key: "personalInformation.fullName" },
            { title: i18n.t("institutionLabel"), align: "start", key: "dissertationInformation.institutionName" },
            { title: i18n.t("acquiredTitleLabel"), align: "start", key: "previousTitleInformation.acquiredTitle" },
            { title: i18n.t("defenceDateLabel"), align: "start", key: "dissertationInformation.defenceDate" },
            { title: i18n.t("diplomaNumberLabel"), align: "start", key: "dissertationInformation.diplomaNumber" },
            { title: i18n.t("diplomaIssueDateLabel"), align: "start", key: "dissertationInformation.diplomaIssueDate" },
            { title: i18n.t("actionLabel"), align: "center" },
        ]);
    
        const refreshTable = (options: any) => {
            if (tableOptions.value.initialCustomConfiguration) {
                tableOptions.value.initialCustomConfiguration = false;
                options = tableOptions.value;
            }
            tableOptions.value = options;
            const sort = options.sortBy?.[0] || {};
            emit("switchPage", options.page - 1, options.itemsPerPage, sort.key, sort.order);
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
    
        return {
            selectedEntries, tableOptions,
            headers, refreshTable,
            notPromoted, localiseDate,
            displayTextOrPlaceholder,
            PromotionSelectorForm,
            addToPromotion
        };
        },
    });
</script>
  
  <style scoped>
  .table-checkbox {
    margin: 0;
  }
  </style>