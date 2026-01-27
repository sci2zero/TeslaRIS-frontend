<template>
    <slot name="top-left"></slot>

    <v-btn
        v-if="isAdmin"
        density="compact"
        class="bottom-spacer"
        :disabled="selectedPrizes.length === 0"
        @click="startDeletionProcess">
        {{ $t("deleteLabel") }}
    </v-btn>

    <v-data-table-server
        v-model="selectedPrizes"
        :sort-by="tableOptions.sortBy"
        :items="prizes"
        :headers="headers"
        item-value="row"
        :items-length="totalPrizes"
        :show-select="isAdmin"
        return-object
        :items-per-page-text="$t('itemsPerPageLabel')"
        :items-per-page-options="[5, 10, 25, 50]"
        :no-data-text="$t('noDataInTableMessage')"
        :page="tableOptions.page"
        @update:options="refreshTable">
        <template #item="row">
            <tr>
                <td v-if="isAdmin">
                    <v-checkbox
                        v-model="selectedPrizes"
                        :value="row.item"
                        class="table-checkbox"
                        hide-details
                    />
                </td>
                <td v-if="$i18n.locale.startsWith('sr')">
                    {{ row.item.titleSr }}
                </td>
                <td v-else>
                    {{ row.item.titleOther }}
                </td>
                <td>
                    <localized-link :to="'persons/' + row.item.personId">
                        {{ row.item.personName }}    
                    </localized-link>
                </td>
                <td>
                    <span>
                        {{ displayDescription(row.item) }}
                        <a
                            v-if="isLongDescription(row.item)"
                            class="ml-1 text-primary cursor-pointer"
                            @click="toggleRow(row.item)">
                            {{ isExpanded(row.item) ? $t("showLessLabel") : "..." }}
                        </a>
                    </span>
                </td>
                <td>
                    {{ displayTextOrPlaceholder(localiseDate(row.item.dateOfAcquisition)) }}
                </td>
                <td>
                    <entity-classification-modal-content
                        :entity-id="row.item.databaseId"
                        :entity-type="ApplicableEntityType.PUBLICATION_SERIES"
                        :applicable-type="ApplicableEntityType.PUBLICATION_SERIES"
                        @classified="prizeClassified(row.item)"
                        @update="refreshTable(tableOptions)"
                    />
                </td>
                <td v-if="isCommission">
                    <v-icon
                        v-if="row.item.assessedBy?.includes(loggedInUser?.commissionId as number)"
                        icon="mdi-check"
                    />
                    <v-icon v-else icon="mdi-cancel" />
                </td>
            </tr>
        </template>
    </v-data-table-server>
    <div class="notificationContainer">
        <v-slide-y-transition group>
            <v-alert
                v-for="notification in notifications"
                :key="notification[0]"
                theme="dark">
                {{ notification[1] }}
            </v-alert>
        </v-slide-y-transition>
    </div>

    <persistent-question-dialog
        v-model="displayPersistentDialog"
        :title="$t('areYouSureLabel')"
        :message="$t('confirmDeletionMessage')"
        :entity-names="selectedPrizes.map(entity => $i18n.locale.startsWith('sr') ? entity.titleSr : entity.titleOther)"
        @continue="deleteSelection">
    </persistent-question-dialog>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type {PrizeIndex} from '@/models/PersonModel';
import PrizeService from '@/services/PrizeService';
import { displayTextOrPlaceholder } from '@/utils/StringUtil';
import { useUserRole } from '@/composables/useUserRole';
import { isEqual } from 'lodash';
import { ApplicableEntityType } from '@/models/Common';
import EntityClassificationModalContent from '@/components/assessment/classifications/EntityClassificationModalContent.vue';
import PersistentQuestionDialog from '@/components/core/comparators/PersistentQuestionDialog.vue';
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import { localiseDate } from '@/utils/DateUtil';


export default defineComponent({
    name: "PrizeTableComponent",
    components: { LocalizedLink, EntityClassificationModalContent, PersistentQuestionDialog },
    props: {
        prizes: {
            type: Array<PrizeIndex>,
            required: true
        }, 
        totalPrizes: {
            type: Number,
            required: true
        }
    },
    emits: ["switchPage"],
    setup(_, {emit}) {
        const selectedPrizes = ref<PrizeIndex[]>([]);

        const i18n = useI18n();

        const notifications = ref<Map<string, string>>(new Map());

        const titleLabel = computed(() => i18n.t("titleLabel"));
        const descriptionLabel = computed(() => i18n.t("descriptionLabel"));
        const dateOfAcquisitionLabel = computed(() => i18n.t("dateOfAcquisitionLabel"));

        const { isAdmin, isCommission, loggedInUser } = useUserRole();

        const titleColumn = computed(() => i18n.t("titleColumn"));
        const descriptionColumn = computed(() => i18n.t("descriptionColumn"));

        const tableOptions = ref<any>({initialCustomConfiguration: true, page: 1, itemsPerPage: 10, sortBy:[{key: titleColumn, order: "asc"}]});


        const actionLabel = computed(() => i18n.t("actionLabel"));
        const classifiedByMeLabel = computed(() => i18n.t("classifiedByMeLabel"));
        const researcherLabel = computed(() => i18n.t("researcherLabel"));

        onMounted(() => {
            if (isAdmin.value || isCommission.value) {
                headers.value.push({ title: actionLabel, align: "start", sortable: false, key: "action"});
            }

            if (isCommission.value) {
                headers.value.push({ title: classifiedByMeLabel, align: "start", sortable: false, key: "classifiedBy"});
            }
        });

        const headers = ref<any[]>([
          { title: titleLabel, align: "start", sortable: true, key: titleColumn},
          { title: researcherLabel, align: "start", sortable: true, key: "name"},
          { title: descriptionLabel, align: "start", sortable: false, key: descriptionColumn},
          { title: dateOfAcquisitionLabel, align: "start", sortable: true, key: "dateOfAcquisition"},
        ]);

        const headersSortableMappings: Map<string, string> = new Map([
            ["titleSr", "title_sr_sortable"],
            ["titleOther", "title_other_sortable"],
            ["name", "person_name_sortable"]
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
            emit("switchPage", event.page - 1, event.itemsPerPage, sortField, sortDir);
        };

        const deleteSelection = () => {
            Promise.all(selectedPrizes.value.map((prize: PrizeIndex) => {
                return PrizeService.deletePrize(prize.personId, prize.databaseId)
                    .then(() => {
                        if (i18n.locale.value.startsWith("sr")) {
                            addNotification(i18n.t("deleteSuccessNotification", { name: prize.titleSr }));
                        } else {
                            addNotification(i18n.t("deleteSuccessNotification", { name: prize.titleOther }));
                        }
                    })
                    .catch(() => {
                        if (i18n.locale.value.startsWith("sr")) {
                            addNotification(i18n.t("deleteFailedNotification", { name: prize.titleSr }));
                        } else {
                            addNotification(i18n.t("deleteFailedNotification", { name: prize.titleOther }));
                        }
                        return prize;
                    });
            })).then((failedDeletions) => {
                selectedPrizes.value = selectedPrizes.value.filter((prize) => failedDeletions.includes(prize));
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

        const setSortAndPageOption = (sortBy: {key: string,  order: string}[], page: number) => {
            if (
                (
                    isEqual([{key: titleColumn.value, order: "asc"}], tableOptions.value.sortBy) ||
                    tableOptions.value.sortBy.length === 0
                ) &&
                page == tableOptions.value.page
            ) {
                tableOptions.value.sortBy.splice(0);
                return;
            }

            tableOptions.value.initialCustomConfiguration = true;
            if (sortBy.length === 0) {
                tableOptions.value.sortBy.splice(0);
            } else {
                tableOptions.value.sortBy = sortBy;
            }
            tableOptions.value.page = page;
        };

        const prizeClassified = (prize: PrizeIndex) => {
            const commissionId = loggedInUser.value?.commissionId as number;
            if (prize.assessedBy) {
                if (!prize.assessedBy.includes(commissionId)) {
                    prize.assessedBy.push(commissionId);
                }
            } else {
                prize.assessedBy = [commissionId];
            }
        };

        const displayPersistentDialog = ref(false);
        const startDeletionProcess = () => {
            displayPersistentDialog.value = true;
        };

        const expandedRows = ref(new Set())

        const getDescription = (row: PrizeIndex) => {
            return i18n.locale.value.startsWith('sr')
            ? row.descriptionSr
            : row.descriptionOther;
        };
        

        const isExpanded = (row: PrizeIndex) => {
            return expandedRows.value.has(row.id)
        };

        const toggleRow = (row: PrizeIndex) => {
            const id = row.id
            if (expandedRows.value.has(id)) {
                expandedRows.value.delete(id)
            } else {
                expandedRows.value.add(id)
            }
        };

        const isLongDescription = (row: PrizeIndex) => {
            return getDescription(row)?.length > 100
        };

        const displayDescription = (row: PrizeIndex) => {
            const desc = getDescription(row) || ''
            if (isExpanded(row) || desc.length <= 100) {
                return desc
            }
            return desc.slice(0, 100)
        };

        return {
            selectedPrizes, headers, notifications,
            refreshTable, isAdmin, deleteSelection,
            tableOptions, displayTextOrPlaceholder,
            setSortAndPageOption, isCommission, loggedInUser,
            ApplicableEntityType, prizeClassified,
            displayPersistentDialog, startDeletionProcess,
            localiseDate, isLongDescription, isExpanded,
            displayDescription, toggleRow
        };
    }
});
</script>
