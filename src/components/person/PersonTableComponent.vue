<template>
    <v-btn v-if="userRole === 'ADMIN'" density="compact" style="margin-bottom: 20px;" :disabled="selectedPersons.length === 0">
        {{ $t("deleteLabel") }}
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
    <!-- <v-snackbar
        v-model="snackbar"
        :timeout="timeout">
        {{ snackbarText }}
        <template #actions>
            <v-btn
                color="blue"
                variant="text"
                @click="snackbar = false">
                {{ $t("closeLabel") }}
            </v-btn>
        </template>
    </v-snackbar> -->
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ref, computed, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import type { PersonIndex } from '@/models/PersonModel';
import UserService from '@/services/UserService';

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

        const snackbar = ref(false);
        const snackbarText = ref("");
        const timeout = 5000;

        const fullNameLabel = computed(() => i18n.t("fullNameLabel"));
        const organisationUnitLabel = computed(() => i18n.t("organisationUnitLabel"));
        const birthdateLabel = computed(() => i18n.t("birthdateLabel"));

        const userRole = computed(() => UserService.provideUserRole());

        const employmentColumn = computed(() => i18n.t("employmentColumn"));
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
            let sortField: string | undefined = "";
            let sortDir: string | undefined = "";
            if (event.sortBy.length > 0) {
                sortField = headersSortableMappings.get(event.sortBy[0].key);
                sortDir = event.sortBy[0].order.toUpperCase();
            }
            emit("switchPage", event.page - 1, event.itemsPerPage, sortField, sortDir);
        };

        watchEffect(() => {
            console.log(selectedPersons.value)
        });

        return {selectedPersons, headers, snackbar, snackbarText, timeout, refreshTable, userRole};
    }
});
</script>
