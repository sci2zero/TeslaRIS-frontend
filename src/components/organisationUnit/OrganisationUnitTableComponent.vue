<template>
    <v-btn
        v-if="userRole === 'ADMIN'" density="compact" class="bottom-spacer" :disabled="selectedOUs.length === 0"
        @click="deleteSelection">
        {{ $t("deleteLabel") }}
    </v-btn>
    <v-btn
        v-if="userRole === 'ADMIN'" density="compact" class="compare-button" :disabled="selectedOUs.length !== 2"
        @click="startEmploymentComparison">
        {{ $t("compareEmployeesLabel") }}
    </v-btn>
    <v-btn
        v-if="userRole === 'ADMIN'" density="compact" class="compare-button" :disabled="selectedOUs.length !== 2"
        @click="startMetadataComparison">
        {{ $t("compareMetadataLabel") }}
    </v-btn>
    <v-data-table-server
        v-model="selectedOUs"
        :sort-by="tableOptions.sortBy"
        :items="organisationUnits"
        :headers="headers"
        item-value="row"
        :items-length="totalOUs"
        :show-select="userRole === 'ADMIN'"
        return-object
        :items-per-page-text="$t('itemsPerPageLabel')"
        :items-per-page-options="[5, 10, 25, 50]"
        :no-data-text="$t('noDataInTableMessage')"
        :page="tableOptions.page"
        @update:options="refreshTable">
        <template #item="row">
            <tr>
                <td v-if="userRole === 'ADMIN'">
                    <v-checkbox
                        v-model="selectedOUs"
                        :value="row.item"
                        class="table-checkbox"
                        hide-details
                    />
                </td>
                <td v-if="$i18n.locale == 'sr'">
                    <localized-link :to="'organisation-units/' + row.item.databaseId">
                        {{ row.item.nameSr }}
                    </localized-link>
                </td>
                <td v-else>
                    <localized-link :to="'organisation-units/' + row.item.databaseId">
                        {{ row.item.nameOther }}
                    </localized-link>
                </td>
                <td v-if="$i18n.locale == 'sr'">
                    <localized-link v-if="row.item.superOUId" :to="'organisation-units/' + row.item.superOUId">
                        {{ displayTextOrPlaceholder(row.item.superOUNameSr) }}
                    </localized-link>
                    <span v-else>
                        {{ displayTextOrPlaceholder(row.item.superOUNameSr) }}
                    </span>
                </td>
                <td v-else>
                    <localized-link v-if="row.item.superOUId" :to="'organisation-units/' + row.item.superOUId">
                        {{ displayTextOrPlaceholder(row.item.superOUNameOther) }}
                    </localized-link>
                    <span v-else>
                        {{ displayTextOrPlaceholder(row.item.superOUNameOther) }}
                    </span>
                </td>
                <td v-if="$i18n.locale == 'sr'">
                    <span v-if="row.item.keywordsSr">
                        <localized-link v-for="(keyword, index) in row.item.keywordsSr.split('\n')" :key="index" :to="`advanced-search?searchQuery=${keyword}&tab=organisationUnits`">
                            {{ `${displayTextOrPlaceholder(keyword)}; ` }}
                        </localized-link>
                    </span>
                    <span v-else>
                        {{ displayTextOrPlaceholder(row.item.keywordsSr) }}
                    </span>
                </td>
                <td v-else>
                    <span v-if="row.item.keywordsOther">
                        <localized-link v-for="(keyword, index) in row.item.keywordsOther.split('\n')" :key="index" :to="`advanced-search?searchQuery=${keyword}&tab=organisationUnits`">
                            {{ `${displayTextOrPlaceholder(keyword)}; ` }}
                        </localized-link>
                    </span>
                    <span v-else>
                        {{ displayTextOrPlaceholder(row.item.keywordsOther) }}
                    </span>
                </td>
                <td v-if="$i18n.locale == 'sr'">
                    {{ displayTextOrPlaceholder(row.item.researchAreasSr) }}
                </td>
                <td v-else>
                    {{ displayTextOrPlaceholder(row.item.researchAreasOther) }}
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
import UserService from '@/services/UserService';
import type {OrganisationUnitIndex} from '@/models/OrganisationUnitModel';
import OrganisationUnitService from '@/services/OrganisationUnitService';
import LocalizedLink from '../localization/LocalizedLink.vue';
import { displayTextOrPlaceholder } from '@/utils/StringUtil';
import { useRouter } from 'vue-router';

export default defineComponent({
    name: "OrganisationUnitTableComponent",
    components: { LocalizedLink },
    props: {
        organisationUnits: {
            type: Array<OrganisationUnitIndex>,
            required: true
        }, 
        totalOUs: {
            type: Number,
            required: true
        }},
    emits: ["switchPage"],
    setup(_, {emit}) {
        const selectedOUs = ref<OrganisationUnitIndex[]>([]);

        const i18n = useI18n();
        const router = useRouter();

        const notifications = ref<Map<string, string>>(new Map());

        const nameLabel = computed(() => i18n.t("nameLabel"));
        const keywordsLabel = computed(() => i18n.t("keywordsLabel"));
        const researchAreasLabel = computed(() => i18n.t("researchAreasLabel"));
        const superOULabel = computed(() => i18n.t("superOULabel"));

        const userRole = computed(() => UserService.provideUserRole());

        const nameColumn = computed(() => i18n.t("nameColumn"));
        const keywordsColumn = computed(() => i18n.t("keywordsColumn"));
        const researchAreasColumn = computed(() => i18n.t("researchAreasColumn"));
        const superOUColumn = computed(() => i18n.t("superOUColumn"));

        const tableOptions = ref<any>({initialCustomConfiguration: true, page: 1, itemsPerPage: 10, sortBy:[{key: nameColumn, order: "asc"}]});

        const headers = [
          { title: nameLabel, align: "start", sortable: true, key: nameColumn},
          { title: superOULabel, align: "start", sortable: true, key: superOUColumn},
          { title: keywordsLabel, align: "start", sortable: true, key: keywordsColumn},
          { title: researchAreasLabel, align: "start", sortable: true, key: researchAreasColumn}
        ];

        const headersSortableMappings: Map<string, string> = new Map([
            ["nameSr", "name_sr_sortable"],
            ["nameOther", "name_other_sortable"],
            ["keywordsSr", "keywords_sr"],
            ["keywordsOther", "keywords_other"],
            ["researchAreasSr", "research_areas_sr_sortable"],
            ["researchAreasOther", "research_areas_other_sortable"],
            ["superOUNameSr", "super_ou_name_sr_sortable"],
            ["superOUNameOther", "super_ou_name_other_sortable"],
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
            Promise.all(selectedOUs.value.map((organisationUnit: OrganisationUnitIndex) => {
                return OrganisationUnitService.deleteOrganisationUnit(organisationUnit.databaseId)
                    .then(() => {
                        if (i18n.locale.value === "sr") {
                            addNotification(i18n.t("deleteSuccessNotification", { name: organisationUnit.nameSr }));
                        } else {
                            addNotification(i18n.t("deleteSuccessNotification", { name: organisationUnit.nameOther }));
                        }
                    })
                    .catch(() => {
                        if (i18n.locale.value === "sr") {
                            addNotification(i18n.t("deleteFailedNotification", { name: organisationUnit.nameSr }));
                        } else {
                            addNotification(i18n.t("deleteFailedNotification", { name: organisationUnit.nameOther }));
                        }
                        return organisationUnit;
                    });
            })).then((failedDeletions) => {
                selectedOUs.value = selectedOUs.value.filter((organisationUnit) => failedDeletions.includes(organisationUnit));
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

        const startEmploymentComparison = () => {
            router.push({name: "organisationUnitEmploymentsComparator", params: {
                leftId: selectedOUs.value[0].databaseId, rightId: selectedOUs.value[1].databaseId
            }});
        };

        const startMetadataComparison = () => {
            router.push({name: "organisationUnitMetadataComparator", params: {
                leftId: selectedOUs.value[0].databaseId, rightId: selectedOUs.value[1].databaseId
            }});
        };

        const setSortAndPageOption = (sortBy: {key: string,  order: string}[], page: number) => {
            tableOptions.value.initialCustomConfiguration = true;
            if (sortBy.length === 0) {
                tableOptions.value.sortBy.splice(0);
            } else {
                tableOptions.value.sortBy = sortBy;
            }
            tableOptions.value.page = page;
        };

        return {selectedOUs, headers, notifications,
            refreshTable, userRole, deleteSelection,
            tableOptions, displayTextOrPlaceholder,
            startEmploymentComparison, setSortAndPageOption,
            startMetadataComparison};
    }
});
</script>

