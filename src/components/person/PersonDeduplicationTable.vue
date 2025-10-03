<template>
    <v-data-table-server
        v-if="totalPersons > 0"
        :sort-by="tableOptions.sortBy"
        :items="potentialMatches"
        :headers="headers"
        item-value="row"
        :items-length="totalPersons"
        return-object
        :items-per-page-text="$t('itemsPerPageLabel')"
        :items-per-page-options="[10, 25, 50]"
        :no-data-text="$t('noDataInTableMessage')"
        @update:options="refreshTable">
        <template #item="row">
            <tr>
                <td>
                    {{ row.item.name }}
                </td>
                <td v-if="$i18n.locale.startsWith('sr')">
                    {{ displayTextOrPlaceholder(row.item.employmentsSr) }}
                </td>
                <td v-else>
                    {{ displayTextOrPlaceholder(row.item.employmentsOther) }}
                </td>
                <td>{{ displayTextOrPlaceholder(row.item.birthdate) }}</td>
                <td>{{ displayTextOrPlaceholder(row.item.orcid) }}</td>
                <td>
                    <publications-dialog :button-text="$t('viewPublicationsLabel')" :id-for-fetching="row.item.databaseId" icon="mdi-note" :title="$t('publicationsLabel')"></publications-dialog>
                    <v-btn size="small" color="primary" @click="returnSelected ? navigateToLandingPage(row.item.databaseId) : returnToParent(row.item)">
                        {{ $t("selectLabel") }}
                    </v-btn>
                </td>
            </tr>
        </template>
    </v-data-table-server>
</template>

<script lang="ts">
import type { PersonIndex } from '@/models/PersonModel';
import PersonService from '@/services/PersonService';
import { displayTextOrPlaceholder } from '@/utils/StringUtil';
import { computed, defineComponent, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import lodash from "lodash";


export default defineComponent({
    name: "PersonDeduplicationTable",
    props: {
        personFirstName: {
            type: String,
            required: true
        },
        personLastName: {
            type: String,
            required: true
        },
        returnSelected: {
            type: Boolean,
            default: false
        }
    },
    emits: ["selected"],
    setup(props, {emit}) {
        const i18n = useI18n();
        const router = useRouter();

        const potentialMatches = ref<PersonIndex[]>([]);

        const totalPersons = ref(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");
        const tableOptions = ref<any>({initialCustomConfiguration: true, page: 1, itemsPerPage: 10, sortBy:[{key: "name",  order: "asc"}]});

        watch(() => [props.personFirstName, props.personLastName], () => {
            if (props.personFirstName && props.personLastName) {
                searchPotentialMatches();
            }
        });

        const searchPotentialMatches = lodash.debounce(() => {
            PersonService.searchResearchers(
                `tokens=${props.personFirstName}&tokens=${props.personLastName}&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`,
                true,
                null)
            .then(response => {
                potentialMatches.value = response.data.content;
                totalPersons.value = response.data.totalElements;
            });
        }, 300);

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            sort.value = sortField;
            direction.value = sortDir;
            searchPotentialMatches();
        };

        const fullNameLabel = computed(() => i18n.t("fullNameLabel"));
        const organisationUnitLabel = computed(() => i18n.t("organisationUnitLabel"));
        const birthdateLabel = computed(() => i18n.t("birthdateLabel"));
        const actionLabel = computed(() => i18n.t("actionLabel"));

        const employmentColumn = computed(() => i18n.t("employmentColumn"));

        const headers = [
          { title: fullNameLabel, align: "start", sortable: true, key: "name"},
          { title: organisationUnitLabel, align: "start", sortable: true, key: employmentColumn},
          { title: birthdateLabel, align: "start", sortable: true, key: "birthdate"},
          { title: "ORCID", align: "start", sortable: true, key: "orcid"},
          { title: actionLabel, align: "start", sortable: false, key: "actions"},
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
            
            switchPage(event.page - 1, event.itemsPerPage, sortField as string, sortDir as string);
        };

        const navigateToLandingPage = (personId: number) => {
            router.push({ name: "researcherLandingPage", params: {id: personId} });
        };

        const resetTable = () => {
            page.value = 0;
            potentialMatches.value = [];
            totalPersons.value = 0;
        };

        const returnToParent = (item: PersonIndex) => {
            emit("selected", item)
        };

        return {
            displayTextOrPlaceholder,
            refreshTable, headers,
            totalPersons, potentialMatches,
            tableOptions, navigateToLandingPage,
            resetTable, returnToParent
        };
    },
});
</script>