<template>
    <v-row class="align-center">
        <v-col cols="auto">
            <v-btn
                density="compact" class="bottom-spacer" :disabled="selectedPromotions.length === 0"
                @click="deleteSelection">
                {{ $t("deleteLabel") }}
            </v-btn>
        </v-col>

        <v-col cols="auto">
            <generic-crud-modal
                :form-component="PromotionForm"
                :form-props="{ presetPromotion: undefined }"
                entity-name="Promotion"
                @create="createNewPromotion"
            />
        </v-col>
    </v-row>

    <v-data-table-server
        v-model="selectedPromotions"
        :sort-by="tableOptions.sortBy"
        :items="promotions"
        :headers="headers"
        :items-length="totalPromotions"
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
                        v-model="selectedPromotions"
                        :value="row.item"
                        class="table-checkbox"
                        hide-details
                    />
                </td>
                <td>{{ localiseDate(row.item.promotionDate) }} {{ $t("inLabel") }} {{ localiseTime(row.item.promotionTime) }}</td>
                <td>{{ row.item.placeOrVenue }}</td>
                <td>{{ returnCurrentLocaleContent(row.item.description) }}</td>
                <td>
                    <v-icon v-if="row.item.finished" icon="mdi-check"></v-icon>
                    <v-icon v-else icon="mdi-cancel"></v-icon>
                </td>
                <td>
                    <generic-crud-modal
                        class="mt-5"
                        :form-component="PromotionForm"
                        :form-props="{ presetPromotion: row.item }"
                        entity-name=""
                        is-update
                        :disabled="row.item.finished"
                        @update="updatePromotion(row.item.id as number, $event)"
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
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import PromotionService from '@/services/thesisLibrary/PromotionService';
import GenericCrudModal from '../core/GenericCrudModal.vue';
import PromotionForm from './PromotionForm.vue';
import type { Promotion } from '@/models/ThesisLibraryModel';
import { localiseDate, localiseTime } from '@/i18n/dateLocalisation';
import { isEqual } from 'lodash';


export default defineComponent({
    name: "PromotionTableComponent",
    components: { GenericCrudModal },
    props: {
        promotions: {
            type: Array<Promotion>,
            required: true
        }, 
        totalPromotions: {
            type: Number,
            required: true
        }},
    emits: ["switchPage"],
    setup(_, {emit}) {
        const selectedPromotions = ref<Promotion[]>([]);
        const notifications = ref<Map<string, string>>(new Map());

        const i18n = useI18n();

        const snackbar = ref(false);
        const snackbarText = ref("");
        const timeout = 5000;

        const dateTimeLabel = computed(() => i18n.t("dateTimeLabel"));
        const placeLabel = computed(() => i18n.t("placeLabel"));
        const descriptionLabel = computed(() => i18n.t("descriptionLabel"));
        const actionLabel = computed(() => i18n.t("actionLabel"));
        const isFinishedLabel = computed(() => i18n.t("isFinishedLabel"));

        const tableOptions = ref<any>({initialCustomConfiguration: true, page: 1, itemsPerPage: 25, sortBy:[{key: "promotionDate", order: "asc"}]});

        const headers = ref<any>([
          { title: dateTimeLabel, align: "start", sortable: true, key: "promotionDate"},
          { title: placeLabel, align: "start", sortable: true, key: "placeOrVenue"},
          { title: descriptionLabel, align: "start", sortable: false, key: "description.content"},
          { title: isFinishedLabel, align: "start", sortable: true, key: "finished"},
          { title: actionLabel},
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
                sortField = event.sortBy[0].key;
                sortDir = event.sortBy[0].order.toUpperCase();
            }
            emit("switchPage", event.page - 1, event.itemsPerPage, sortField, sortDir);
        };

        const deleteSelection = () => {
            Promise.all(selectedPromotions.value.map((promotion: Promotion) => {
                return PromotionService.deletePromotion(promotion.id as number)
                    .then(() => {
                        addNotification(i18n.t("deleteSuccessNotification", { name: localiseDate(promotion.promotionDate) }));
                    })
                    .catch(() => {
                        addNotification(i18n.t("deleteFailedNotification", { name: localiseDate(promotion.promotionDate) }));
                        return promotion;
                    });
            })).then((failedDeletions) => {
                selectedPromotions.value = selectedPromotions.value.filter((promotion) => failedDeletions.includes(promotion));
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

        const createNewPromotion = (promotion: Promotion) => {
            PromotionService.createPromotion(promotion).then(() => {
                if (tableOptions.value.sortBy && tableOptions.value.sortBy.length > 0) {
                    emit("switchPage", tableOptions.value.page - 1, tableOptions.value.itemsPerPage, tableOptions.value.sortBy[0].key, tableOptions.value.sortBy[0].order);
                } else {
                    emit("switchPage", tableOptions.value.page - 1, tableOptions.value.itemsPerPage, "", "");
                }
                
            });
        };

        const updatePromotion = (promotionId: number, promotion: Promotion) => {
            PromotionService.updatePromotion(promotionId, promotion).then(() => {
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
                    isEqual([{key: "promotionDate", order: "asc"}], tableOptions.value.sortBy) ||
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
            selectedPromotions, notifications, createNewPromotion,
            updatePromotion, setSortAndPageOption, PromotionForm,
            localiseDate, localiseTime
        };
    }
});
</script>
