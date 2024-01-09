<template>
    <v-btn
        v-if="userRole === 'ADMIN'" density="compact" style="margin-bottom: 20px;" :disabled="selectedPersons.length === 0"
        @click="deleteSelection">
        {{ $t("deleteLabel") }}
    </v-btn>
    <v-btn
        density="compact" style="margin-bottom: 20px; margin-left: 10px;" :disabled="selectedPersons.length !== 2">
        {{ $t("compareLabel") }}
    </v-btn>
    <v-data-table-server
        v-model="selectedPersons"
        :items="persons"
        :headers="headers"
        item-value="row"
        :items-length="totalPersons"
        show-select
        return-object
        @update:options="refreshTable">
        <template #item="row">
            <tr>
                <td>
                    <v-checkbox
                        v-model="selectedPersons"
                        :value="row.item"
                        style="margin:0px;padding:0px"
                        hide-details
                    />
                </td>
                <td>{{ row.item.name }}</td>
                <td v-if="$i18n.locale == 'sr'">
                    {{ row.item.employmentsSr }}
                </td>
                <td v-if="$i18n.locale == 'en'">
                    {{ row.item.employmentsOther }}
                </td>
                <td>{{ row.item.birthdate }}</td>
                <td>{{ row.item.orcid }}</td>
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
import type { PersonIndex } from '@/models/PersonModel';
import UserService from '@/services/UserService';
import PersonService from '@/services/PersonService';

export default defineComponent({
    name: "PersonTableComponent",
    props: {
        persons: {
            type: Array<PersonIndex>,
            required: true
        }, 
        totalPersons: {
            type: Number,
            required: true
        }},
    emits: ["switchPage"],
    setup(props, {emit}) {
        const selectedPersons = ref([]);

        const i18n = useI18n();

        const notifications = ref<Map<string, string>>(new Map());

        const fullNameLabel = computed(() => i18n.t("fullNameLabel"));
        const organisationUnitLabel = computed(() => i18n.t("organisationUnitLabel"));
        const birthdateLabel = computed(() => i18n.t("birthdateLabel"));

        const userRole = computed(() => UserService.provideUserRole());

        const employmentColumn = computed(() => i18n.t("employmentColumn"));

        const tableOptions = ref({initialCustomConfiguration: true, page: 0, itemsPerPage: 10, sortBy:[{key: "name",  order: "asc"}]});

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
        }

        const removeNotification = (notificationId: string) => {
            notifications.value.delete(notificationId);
        }

        return {selectedPersons, headers, notifications, refreshTable, userRole, deleteSelection};
    }
});
</script>

<style scoped>
  .notificationContainer {
    position: fixed;
    top: 10px;
    right: 10px;
    display: grid;
    grid-gap: 0.5em;
    z-index: 99;
  }
</style>

