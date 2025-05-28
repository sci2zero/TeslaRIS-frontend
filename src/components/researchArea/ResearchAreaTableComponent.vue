<template>
    <v-row class="align-center">
        <v-col cols="auto">
            <v-btn
                density="compact" class="bottom-spacer" :disabled="selectedResearchAreas.length === 0"
                @click="deleteSelection">
                {{ $t("deleteLabel") }}
            </v-btn>
        </v-col>

        <v-col cols="auto">
            <research-area-modal :preset-research-area="undefined" @submit="createNewResearchArea"></research-area-modal>
            <generic-crud-modal
                :form-component="ResearchAreaForm"
                :form-props="{ presetResearchArea: undefined }"
                entity-name="ResearchArea"
                @create="createNewResearchArea"
            />
        </v-col>
    </v-row>

    <v-data-table-server
        v-model="selectedResearchAreas"
        :sort-by="tableOptions.sortBy"
        :items="researchAreas"
        :headers="headers"
        :items-length="totalResearchAreas"
        :items-per-page-text="$t('itemsPerPageLabel')"
        :items-per-page-options="[5, 25, 50]"
        :items-per-page="25"
        show-select
        return-object
        :no-data-text="$t('noDataInTableMessage')"
        :page="tableOptions.page"
        @update:options="refreshTable">
        <template #item="row">
            <tr>
                <td>
                    <v-checkbox
                        v-model="selectedResearchAreas"
                        :value="row.item"
                        class="table-checkbox"
                        hide-details
                    />
                </td>
                <td>{{ returnCurrentLocaleContent(row.item.name) }}</td>
                <td>{{ displayTextOrPlaceholder(returnCurrentLocaleContent(row.item.description) as string) }}</td>
                <td>{{ displayTextOrPlaceholder(returnCurrentLocaleContent(row.item.superResearchAreaName) as string) }}</td>
                <td>
                    <generic-crud-modal
                        class="mt-2"
                        :form-component="ResearchAreaForm"
                        :form-props="{ presetResearchArea: row.item }"
                        entity-name="ResearchArea"
                        is-update
                        @update="updateResearchArea(row.item.id, $event)"
                    />
                </td>
            </tr>
        </template>
    </v-data-table-server>
    
    <div class="notificationContainer">
        <v-slide-y-transition group>
            <v-alert
                v-for="notification in notifications"
                :key="notification[0]"
                theme="dark"
            >
                {{ notification[1] }}
            </v-alert>
        </v-slide-y-transition>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { displayTextOrPlaceholder } from '@/utils/StringUtil';
import { getTitleFromValueAutoLocale } from '@/i18n/userType';
import type { ResearchAreaRequest, ResearchAreaResponse } from '@/models/Common';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import ResearchAreaService from '@/services/ResearchAreaService';
import GenericCrudModal from '../core/GenericCrudModal.vue';
import ResearchAreaForm from './ResearchAreaForm.vue';
import { isEqual } from 'lodash';


export default defineComponent({
    name: "ResearchAreaTableComponent",
    components: { GenericCrudModal },
    props: {
        researchAreas: {
            type: Array<ResearchAreaResponse>,
            required: true
        }, 
        totalResearchAreas: {
            type: Number,
            required: true
        }},
    emits: ["switchPage"],
    setup(_, {emit}) {
        const selectedResearchAreas = ref<ResearchAreaResponse[]>([]);
        const notifications = ref<Map<string, string>>(new Map());

        const i18n = useI18n();

        const snackbar = ref(false);
        const snackbarText = ref("");
        const timeout = 5000;

        const nameLabel = computed(() => i18n.t("nameLabel"));
        const abstractLabel = computed(() => i18n.t("descriptionLabel"));
        const superAreaLabel = computed(() => i18n.t("superResearchAreaLabel"));
        const actionLabel = computed(() => i18n.t("actionLabel"));

        const tableOptions = ref<any>({initialCustomConfiguration: true, page: 1, itemsPerPage: 25, sortBy:[{key: "name", order: "asc"}]});

        const headers = [
          { title: nameLabel, align: "start", sortable: true, key: "name.content"},
          { title: abstractLabel, align: "start", sortable: true, key: "description"},
          { title: superAreaLabel, align: "start", sortable: false, key: "superResearchAreaName"},
          { title: actionLabel},
        ];

        const refreshTable = (event: any) => {
            if (tableOptions.value.initialCustomConfiguration) {
                tableOptions.value.initialCustomConfiguration = false;
                event = tableOptions.value;
            }
            tableOptions.value = event;
            let sortField: string | undefined = "";
            let sortDir: string | undefined = "";
            if (event.sortBy.length > 0) {
                sortField = event.sortBy[0].key;
                sortDir = event.sortBy[0].order.toUpperCase();
            }
            emit("switchPage", event.page - 1, event.itemsPerPage, sortField, sortDir);
        };

        const deleteSelection = () => {
            Promise.all(selectedResearchAreas.value.map((researchArea: ResearchAreaResponse) => {
                return ResearchAreaService.deleteResearchArea(researchArea.id as number)
                    .then(() => {
                        addNotification(i18n.t("deleteSuccessNotification", { name: returnCurrentLocaleContent(researchArea.name) }));
                    })
                    .catch(() => {
                        addNotification(i18n.t("deleteFailedNotification", { name: returnCurrentLocaleContent(researchArea.name) }));
                        return researchArea;
                    });
            })).then((failedDeletions) => {
                selectedResearchAreas.value = selectedResearchAreas.value.filter((researchArea) => failedDeletions.includes(researchArea));
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

        const createNewResearchArea = (researchArea: ResearchAreaRequest) => {
            ResearchAreaService.createResearchArea(researchArea).then(() => {
                if (tableOptions.value.sortBy && tableOptions.value.sortBy.length > 0) {
                    emit("switchPage", tableOptions.value.page - 1, tableOptions.value.itemsPerPage, tableOptions.value.sortBy[0].key, tableOptions.value.sortBy[0].order);
                } else {
                    emit("switchPage", tableOptions.value.page - 1, tableOptions.value.itemsPerPage, "", "");
                }
            });
        };

        const updateResearchArea = (researchAreaId: number, researchArea: ResearchAreaRequest) => {
            ResearchAreaService.updateResearchArea(researchAreaId, researchArea).then(() => {
                addNotification(i18n.t("updatedSuccessMessage"));
                if (tableOptions.value.sortBy && tableOptions.value.sortBy.length > 0) {
                    emit("switchPage", tableOptions.value.page - 1, tableOptions.value.itemsPerPage, tableOptions.value.sortBy[0].key, tableOptions.value.sortBy[0].order);
                } else {
                    emit("switchPage", tableOptions.value.page - 1, tableOptions.value.itemsPerPage, "", "");
                }
            });
        };

        const setSortAndPageOption = (sortBy: {key: string,  order: string}[], page: number) => {
            if (
                (
                    isEqual([{key: "name", order: "asc"}], tableOptions.value.sortBy) ||
                    tableOptions.value.sortBy.length === 0
                ) &&
                page == tableOptions.value.page
            ) {
                return
            }

            tableOptions.value.initialCustomConfiguration = true;
            if (sortBy.length === 0) {
                tableOptions.value.sortBy.splice(0);
            } else {
                tableOptions.value.sortBy = sortBy;
            }
            tableOptions.value.page = page;
        };

        return {headers, snackbar, snackbarText, timeout, refreshTable,
            tableOptions, deleteSelection, displayTextOrPlaceholder,
            getTitleFromValueAutoLocale, returnCurrentLocaleContent,
            selectedResearchAreas, notifications, createNewResearchArea,
            updateResearchArea, setSortAndPageOption, ResearchAreaForm
        };
    }
});
</script>