<template>
    <v-row class="align-center">
        <v-col cols="auto">
            <v-btn
                density="compact" class="bottom-spacer" :disabled="selectedLanguageTags.length === 0"
                @click="deleteSelection">
                {{ $t("deleteLabel") }}
            </v-btn>
        </v-col>

        <v-col cols="auto">
            <generic-crud-modal
                :form-component="LanguageTagForm"
                :form-props="{ presetLanguageTag: undefined }"
                entity-name="LanguageTag"
                @create="createNewLanguageTag"
            />
        </v-col>
    </v-row>

    <v-data-table-server
        v-model="selectedLanguageTags"
        :sort-by="tableOptions.sortBy"
        :items="languageTags"
        :headers="headers"
        :items-length="totalLanguageTags"
        :items-per-page-text="$t('itemsPerPageLabel')"
        :items-per-page-options="[5, 25, 50]"
        :items-per-page="25"
        show-select
        return-object
        :no-data-text="$t('noDataInTableMessage')"
        @update:options="refreshTable">
        <template #item="row">
            <tr>
                <td>
                    <v-checkbox
                        v-model="selectedLanguageTags"
                        :value="row.item"
                        class="table-checkbox"
                        hide-details
                    />
                </td>
                <td>{{ row.item.display }}</td>
                <td>{{ row.item.languageCode }}</td>
                <td>
                    <generic-crud-modal
                        class="mt-2"
                        :form-component="LanguageTagForm"
                        :form-props="{ presetLanguageTag: row.item }"
                        entity-name=""
                        is-update
                        @update="updateLanguageTag(row.item.id, $event)"
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
import { getTitleFromValueAutoLocale } from '@/i18n/userTypes';
import type { LanguageTag, LanguageTagResponse } from '@/models/Common';
import GenericCrudModal from '../core/GenericCrudModal.vue';
import LanguageTagForm from './LanguageTagForm.vue';
import LanguageService from '@/services/LanguageService';


export default defineComponent({
    name: "LanguageTagTableComponent",
    components: { GenericCrudModal },
    props: {
        languageTags: {
            type: Array<LanguageTagResponse>,
            required: true
        }, 
        totalLanguageTags: {
            type: Number,
            required: true
        }},
    emits: ["switchPage"],
    setup(_, {emit}) {
        const selectedLanguageTags = ref<LanguageTagResponse[]>([]);
        const notifications = ref<Map<string, string>>(new Map());

        const i18n = useI18n();

        const snackbar = ref(false);
        const snackbarText = ref("");
        const timeout = 5000;

        const displayLabel = computed(() => i18n.t("displayLabel"));
        const codeLabel = computed(() => i18n.t("codeLabel"));
        const actionLabel = computed(() => i18n.t("actionLabel"));

        const tableOptions = ref<any>({initialCustomConfiguration: true, page: 1, itemsPerPage: 25, sortBy:[{key: "display", order: "asc"}]});

        const headers = [
          { title: displayLabel, align: "start", sortable: true, key: "display"},
          { title: codeLabel, align: "start", sortable: true, key: "languageTag"},
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
            Promise.all(selectedLanguageTags.value.map((languageTag: LanguageTagResponse) => {
                return LanguageService.deleteLanguageTag(languageTag.id as number)
                    .then(() => {
                        addNotification(i18n.t("deleteSuccessNotification", { name: languageTag.display }));
                    })
                    .catch(() => {
                        addNotification(i18n.t("deleteFailedNotification", { name: languageTag.display }));
                        return languageTag;
                    });
            })).then((failedDeletions) => {
                selectedLanguageTags.value = selectedLanguageTags.value.filter((languageTag) => failedDeletions.includes(languageTag));
                LanguageService.invalidateLanguageTagCaches();
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

        const createNewLanguageTag = (languageTag: LanguageTag) => {
            LanguageService.createLanguageTag(languageTag).then(() => {
                LanguageService.invalidateLanguageTagCaches();
                if (tableOptions.value.sortBy && tableOptions.value.sortBy.length > 0) {
                    emit("switchPage", tableOptions.value.page - 1, tableOptions.value.itemsPerPage, tableOptions.value.sortBy[0].key, tableOptions.value.sortBy[0].order);
                } else {
                    emit("switchPage", tableOptions.value.page - 1, tableOptions.value.itemsPerPage, "", "");
                }
                
            });
        };

        const updateLanguageTag = (languageTagId: number, languageTag: LanguageTag) => {
            LanguageService.updateLanguageTag(languageTagId, languageTag).then(() => {
                addNotification(i18n.t("updatedSuccessMessage"));
                LanguageService.invalidateLanguageTagCaches();
                if (tableOptions.value.sortBy && tableOptions.value.sortBy.length > 0) {
                    emit("switchPage", tableOptions.value.page - 1, tableOptions.value.itemsPerPage, tableOptions.value.sortBy[0].key, tableOptions.value.sortBy[0].order);
                } else {
                    emit("switchPage", tableOptions.value.page - 1, tableOptions.value.itemsPerPage, "", "");
                }
            });
        };

        const setSortOption = (sortBy: {key: string,  order: string}[]) => {
            tableOptions.value.initialCustomConfiguration = true;
            tableOptions.value.sortBy = sortBy;
        };

        return {headers, snackbar, snackbarText, timeout, refreshTable,
            tableOptions, deleteSelection, displayTextOrPlaceholder,
            getTitleFromValueAutoLocale, LanguageTagForm,
            selectedLanguageTags, notifications, createNewLanguageTag,
            updateLanguageTag, setSortOption
        };
    }
});
</script>
