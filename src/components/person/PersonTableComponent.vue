<template>
    <v-btn
        v-if="userRole === 'ADMIN'" density="compact" class="bottom-spacer" :disabled="selectedPersons.length === 0"
        @click="deleteSelection">
        {{ $t("deleteLabel") }}
    </v-btn>
    <v-btn
        v-if="userRole === 'ADMIN'" density="compact" class="compare-button" :disabled="selectedPersons.length !== 2"
        @click="startPublicationComparison">
        {{ $t("comparePublicationsLabel") }}
    </v-btn>
    <v-btn
        v-if="userRole === 'ADMIN'" density="compact" class="compare-button" :disabled="selectedPersons.length !== 2"
        @click="startMetadataComparison">
        {{ $t("compareMetadataLabel") }}
    </v-btn>
    <div ref="tableWrapper">
        <v-data-table-server
            v-model="selectedPersons"
            :sort-by="tableOptions.sortBy"
            :items="persons"
            :headers="headers"
            item-value="row"
            :items-length="totalPersons"
            :show-select="userRole === 'ADMIN'"
            return-object
            :items-per-page-text="$t('itemsPerPageLabel')"
            :items-per-page-options="[5, 10, 25, 50]"
            @update:options="refreshTable">
            <template #body="props">
                <draggable
                    :list="props.items"
                    tag="tbody"
                    :disabled="!inComparator"
                    group="persons"
                    @change="onDropCallback"
                >
                    <tr v-for="item in props.items" :key="item.id">
                        <td v-if="userRole === 'ADMIN'">
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
                        <td v-if="$i18n.locale == 'sr'">
                            <span v-if="item.employmentsSr.trim() === ''">
                                {{ displayTextOrPlaceholder(item.employmentsSr) }}
                            </span>
                            <localized-link v-for="(employment, index) in item.employmentsSr.split('; ')" v-else :key="index" :to="'organisation-units/' + item.employmentInstitutionsId[index]">
                                {{ `${employment}; ` }}
                            </localized-link>
                        </td>
                        <td v-else>
                            <span v-if="item.employmentsOther.trim() === ''">
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
import { defineComponent } from 'vue';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { PersonIndex } from '@/models/PersonModel';
import UserService from '@/services/UserService';
import PersonService from '@/services/PersonService';
import LocalizedLink from '../localization/LocalizedLink.vue';
import { displayTextOrPlaceholder } from '@/utils/StringUtil';
import { localiseDate } from '@/i18n/dateLocalisation';
import { useRouter } from 'vue-router';
import { VueDraggableNext } from 'vue-draggable-next';
import { watch } from 'vue';
import IdentifierLink from '../core/IdentifierLink.vue';


export default defineComponent({
    name: "PersonTableComponent",
    components: { LocalizedLink, draggable: VueDraggableNext, IdentifierLink },
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
        }
    },
    emits: ["switchPage", "dragged"],
    setup(_, {emit}) {
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

        const userRole = computed(() => UserService.provideUserRole());

        const employmentColumn = computed(() => i18n.t("employmentColumn"));

        const tableOptions = ref<any>({initialCustomConfiguration: true, page: 1, itemsPerPage: 10, sortBy:[{key: "name",  order: "asc"}]});

        const headers = [
          { title: fullNameLabel, align: "start", sortable: true, key: "name"},
          { title: organisationUnitLabel, align: "start", sortable: true, key: employmentColumn},
          { title: birthdateLabel, align: "start", sortable: true, key: "birthdate"},
          { title: "ORCID", align: "start", sortable: true, key: "orcid"},
        ];

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
                return PersonService.deleteResearcher(person.databaseId)
                    .then(() => {
                        addNotification(i18n.t("deleteSuccessNotification", { name: person.name }));
                    })
                    .catch(() => {
                        addNotification(i18n.t("deleteFailedNotification", { name: person.name }));
                        return person;
                    });
            })).then((failedDeletions) => {
                selectedPersons.value = selectedPersons.value.filter((person) => failedDeletions.includes(person));
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

        const setSortOption = (sortBy: {key: string,  order: string}[]) => {
            tableOptions.value.initialCustomConfiguration = true;
            tableOptions.value.sortBy = sortBy;
        };

        return {selectedPersons, headers, notifications,
            refreshTable, userRole, deleteSelection,
            tableOptions, displayTextOrPlaceholder,
            localiseDate, startPublicationComparison,
            startMetadataComparison, onDropCallback,
            tableWrapper, setSortOption };
    }
});
</script>

