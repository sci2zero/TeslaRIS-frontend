<template>
    <v-btn
        v-if="(isAdmin || allowComparison) && !isAlumniTable && !isCommissionResearchersTable" density="compact" class="bottom-spacer" :disabled="selectedPersons.length === 0"
        @click="deleteSelection">
        {{ $t("deleteLabel") }}
    </v-btn>
    <v-btn
        v-if="(isAdmin || isCommission) && isCommissionResearchersTable" density="compact" class="bottom-spacer" :disabled="selectedPersons.length === 0"
        @click="removeSelection">
        {{ $t("removeResearcherLabel") }}
    </v-btn>
    <v-btn
        v-if="(isAdmin || allowComparison) && !isAlumniTable && !isCommissionResearchersTable" density="compact" class="compare-button" :disabled="selectedPersons.length !== 2"
        @click="startPublicationComparison">
        {{ $t("comparePublicationsLabel") }}
    </v-btn>
    <v-btn
        v-if="(isAdmin || allowComparison) && !isAlumniTable && !isCommissionResearchersTable" density="compact" class="compare-button" :disabled="selectedPersons.length !== 2"
        @click="startMetadataComparison">
        {{ $t("compareMetadataLabel") }}
    </v-btn>

    <add-employment-modal 
        v-if="employmentInstitutionId > 0 && (isAdmin || isInstitutionalEditor)"
        class="mt-3 mb-1"
        :institution-id="employmentInstitutionId"
        @update="notifyUserAndRefreshTable">
    </add-employment-modal>
    
    <table-export-modal
        v-if="enableExport"
        :export-entity="ExportEntity.PERSON"
        :export-ids="(selectedPersons.map(person => person.databaseId) as number[])"
        :disabled="selectedPersons.length === 0"
        :potential-max-amount-requested="selectedPersons.length >= tableOptions.itemsPerPage"
        :total-results="totalPersons"
        :endpoint-type="endpointType"
        :endpoint-token-parameters="endpointTokenParameters">
    </table-export-modal>
    
    <div ref="tableWrapper">
        <v-data-table-server
            v-model="selectedPersons"
            :sort-by="tableOptions.sortBy"
            :items="persons"
            :headers="headers"
            item-value="row"
            :items-length="totalPersons"
            :show-select="isAdmin || enableExport"
            return-object
            :items-per-page-text="$t('itemsPerPageLabel')"
            :items-per-page-options="[5, 10, 25, 50]"
            :page="tableOptions.page"
            @update:options="refreshTable">
            <template #body="props">
                <draggable
                    :list="props.items"
                    tag="tbody"
                    :disabled="!inComparator"
                    group="persons"
                    handle=".handle"
                    @change="onDropCallback"
                >
                    <tr v-if="props.items?.length === 0">
                        <td colspan="10" class="text-center">
                            <p>{{ $t("noDataInTableMessage") }}</p>
                        </td>
                    </tr>
                    <tr v-for="item in props.items" :key="item.id" class="handle">
                        <td v-if="isAdmin || enableExport">
                            <v-checkbox
                                v-model="selectedPersons"
                                :value="item"
                                class="table-checkbox"
                                hide-details
                            />
                        </td>
                        <td>
                            <localized-link :to="'persons/' + item.databaseId">
                                {{ item.name }}
                            </localized-link>
                        </td>
                        <td v-if="$i18n.locale.startsWith('sr')">
                            <span v-if="item.employmentsSr.trim() === '' || !item.employmentInstitutionsId || item.employmentInstitutionsId.length === 0">
                                {{ displayTextOrPlaceholder(item.employmentsSr) }}
                            </span>
                            <span v-for="(employment, index) in item.employmentsSr.split('; ')" v-else :key="index">
                                <localized-link
                                    v-if="item.employmentInstitutionsId[index] !== -1"
                                    :to="'organisation-units/' + item.employmentInstitutionsId[index]">
                                    {{ `🏢${employment.trim()}; ` }}
                                </localized-link>
                                <span v-else>{{ `${employment.trim()};` }}</span>
                            </span>
                        </td>
                        <td v-else>
                            <span v-if="item.employmentsOther.trim() === '' || !item.employmentInstitutionsId || item.employmentInstitutionsId.length === 0">
                                {{ displayTextOrPlaceholder(item.employmentsOther) }}
                            </span>
                            <localized-link v-for="(employment, index) in item.employmentsOther.split('; ')" v-else :key="index" :to="'organisation-units/' + item.employmentInstitutionsId[index]">
                                {{ `${employment}; ` }}
                            </localized-link>
                        </td>
                        <td>{{ item.birthdate ? localiseDate(item.birthdate) : displayTextOrPlaceholder(item.birthdate) }}</td>
                        <td v-if="item.orcid">
                            <identifier-link :identifier="item.orcid" type="orcid"></identifier-link>
                        </td>
                        <td v-else>
                            {{ displayTextOrPlaceholder(item.orcid) }}
                        </td>
                    </tr>
                </draggable>
            </template>
        </v-data-table-server>
    </div>
    
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
import { defineComponent, type PropType } from 'vue';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { PersonIndex } from '@/models/PersonModel';
import PersonService from '@/services/PersonService';
import LocalizedLink from '../localization/LocalizedLink.vue';
import { displayTextOrPlaceholder } from '@/utils/StringUtil';
import { localiseDate } from '@/utils/DateUtil';
import { useRouter } from 'vue-router';
import { VueDraggableNext } from 'vue-draggable-next';
import { watch } from 'vue';
import IdentifierLink from '../core/IdentifierLink.vue';
import InvolvementService from '@/services/InvolvementService';
import AddEmploymentModal from './involvement/AddEmploymentModal.vue';
import { useUserRole } from '@/composables/useUserRole';
import { ExportableEndpointType, ExportEntity } from '@/models/Common';
import TableExportModal from '../core/TableExportModal.vue';
import { isEqual } from 'lodash';


export default defineComponent({
    name: "PersonTableComponent",
    components: { LocalizedLink, draggable: VueDraggableNext, IdentifierLink, AddEmploymentModal, TableExportModal },
    props: {
        persons: {
            type: Array<PersonIndex>,
            required: true
        }, 
        totalPersons: {
            type: Number,
            required: true
        },
        inComparator: {
            type: Boolean,
            default: false
        },
        employmentInstitutionId: {
            type: Number,
            default: -1
        },
        isAlumniTable: {
            type: Boolean,
            default: false
        },
        isCommissionResearchersTable: {
            type: Boolean,
            default: false
        },
        enableExport: {
            type: Boolean,
            default: false
        },
        endpointType: {
            type: Object as PropType<ExportableEndpointType | undefined>,
            default: undefined
        },
        endpointTokenParameters: {
            type: Array<string>,
            default: []
        },
        allowComparison: {
            type: Boolean,
            default: false
        }
    },
    emits: ["switchPage", "dragged", "delete"],
    setup(props, {emit}) {
        const selectedPersons = ref<PersonIndex[]>([]);

        const i18n = useI18n();
        const router = useRouter();

        const notifications = ref<Map<string, string>>(new Map());

        const tableWrapper = ref<any>(null);

        watch(tableWrapper, () => {
            if (tableWrapper.value) {
                const table = tableWrapper.value;
                const sortableTbody = table.querySelector('.v-table__wrapper > table > tbody > tbody')
                const tbody = table.querySelector('.v-table__wrapper > table > tbody')
                tbody!.parentNode!.append(sortableTbody!)
                tbody!.remove()
            }
        });

        const fullNameLabel = computed(() => i18n.t("fullNameLabel"));
        const organisationUnitLabel = computed(() => i18n.t("organisationUnitLabel"));
        const birthdateLabel = computed(() => i18n.t("birthdateLabel"));

        const { isAdmin, isInstitutionalEditor, isCommission, isUserLoggedIn } = useUserRole();

        const employmentColumn = computed(() => i18n.t("employmentColumn"));

        const tableOptions = ref<any>({initialCustomConfiguration: true, page: 1, itemsPerPage: 10, sortBy:[{key: "name",  order: "asc"}]});

        const headers = ref<any>([
          { title: fullNameLabel, align: "start", sortable: true, key: "name"},
          { title: organisationUnitLabel, align: "start", sortable: true, key: employmentColumn},
          { title: birthdateLabel, align: "start", sortable: true, key: "birthdate"},
          { title: "ORCID", align: "start", sortable: true, key: "orcid"},
        ]);

        const headersSortableMappings: Map<string, string> = new Map([
            ["name", "name_sortable"],
            ["employmentsSr", "employments_sr_sortable"],
            ["employmentsOther", "employments_other_sortable"],
            ["birthdate", "birthdate_sortable"],
            ["orcid", "orcid"],
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
            Promise.all(selectedPersons.value.map((person: PersonIndex) => {
                if (props.employmentInstitutionId > 0) {
                    return InvolvementService.terminateEmployment(person.databaseId, props.employmentInstitutionId)
                        .then(() => {
                            addNotification(i18n.t("terminationSuccessNotification", { name: person.name }));
                        })
                        .catch(() => {
                            addNotification(i18n.t("terminationFailedNotification", { name: person.name }));
                            return person;
                        });
                } else {
                    return PersonService.deleteResearcher(person.databaseId)
                        .then(() => {
                            addNotification(i18n.t("deleteSuccessNotification", { name: person.name }));
                        })
                        .catch(() => {
                            addNotification(i18n.t("deleteFailedNotification", { name: person.name }));
                            return person;
                        });
                }
            })).then((failedDeletions) => {
                selectedPersons.value = selectedPersons.value.filter((person) => failedDeletions.includes(person));
                refreshTable(tableOptions.value);
                if (props.employmentInstitutionId > 0) {
                    emit("delete");
                }
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

        const startPublicationComparison = () => {
            router.push({name: "personPublicationsComparator", params: {
                leftId: selectedPersons.value[0].databaseId, rightId: selectedPersons.value[1].databaseId
            }});
        };

        const startMetadataComparison = () => {
            router.push({name: "personMetadataComparator", params: {
                leftId: selectedPersons.value[0].databaseId, rightId: selectedPersons.value[1].databaseId
            }});
        };

        const onDropCallback = (event: any) => {
            emit("dragged", event);
        };

        const setSortAndPageOption = (sortBy: {key: string,  order: string}[], page: number) => {
            if (
                (
                    isEqual([{key: "name", order: "asc"}], tableOptions.value.sortBy) ||
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

        const notifyUserAndRefreshTable = (success: boolean) => {
            if (success) {
                addNotification(i18n.t("savedMessage"));
            } else {
                addNotification(i18n.t("genericErrorMessage"));
            }

            refreshTable(tableOptions.value);
        };

        const removeSelection = () => {
            emit("delete", selectedPersons.value.map(person => person.databaseId));
        };

        return {
            selectedPersons, headers, notifications, isUserLoggedIn,
            refreshTable, isAdmin, deleteSelection, ExportEntity,
            tableOptions, displayTextOrPlaceholder, isInstitutionalEditor,
            localiseDate, startPublicationComparison, isCommission,
            startMetadataComparison, onDropCallback, removeSelection,
            tableWrapper, setSortAndPageOption, notifyUserAndRefreshTable
        };
    }
});
</script>

