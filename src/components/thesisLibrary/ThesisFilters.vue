<template>
    <v-row>
        <v-col cols="12" md="4">
            <organisation-unit-autocomplete-search
                v-model="selectedOUs"
                multiple
                disable-submission
                label="institutionsLabel"
            ></organisation-unit-autocomplete-search>
        </v-col>
        <v-col cols="12" md="4">
            <v-select
                v-model="selectedThesisTypes"
                :label="$t('thesisTypeLabel')"
                :items="thesisTypes"
                return-object
                multiple
            ></v-select>
        </v-col>
        <v-col cols="12" md="4">
            <person-autocomplete-search
                v-model="selectedBoardPresidents"
                multiple
                disable-submission
                label="boardPresidentsLabel"
            ></person-autocomplete-search>
        </v-col>
    </v-row>
    <v-row>
        <v-col cols="12" md="4">
            <person-autocomplete-search
                v-model="selectedAuthors"
                multiple
                disable-submission
                label="authorsLabel"
            ></person-autocomplete-search>
        </v-col>
        <v-col cols="12" md="4">
            <person-autocomplete-search
                v-model="selectedAdvisors"
                multiple
                disable-submission
                label="advisorsLabel"
            ></person-autocomplete-search>
        </v-col>
        <v-col cols="12" md="4">
            <person-autocomplete-search
                v-model="selectedBoardMembers"
                multiple
                disable-submission
                label="boardMembersLabel"
            ></person-autocomplete-search>
        </v-col>
    </v-row>
    <v-row>
        <v-col cols="12" md="4">
            <date-picker
                v-model="fromDate"
                :label="$t('fromLabel')"
                color="primary"
            ></date-picker>
        </v-col>
        <v-col cols="12" md="4">
            <date-picker
                v-model="toDate"
                :label="$t('toLabel')"
                color="primary"
            ></date-picker>
        </v-col>
        <v-col cols="12" md="4">
            <v-checkbox 
                v-model="showOnlyOpenAccess"
                :label="$t('onlyOpenAccessLabel')">
            </v-checkbox>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import OrganisationUnitAutocompleteSearch from "../organisationUnit/OrganisationUnitAutocompleteSearch.vue";
import PersonAutocompleteSearch from "../person/PersonAutocompleteSearch.vue";
import DatePicker from "../core/DatePicker.vue";
import { getThesisTypesForGivenLocale } from "@/i18n/thesisType";
import { ThesisType } from "@/models/PublicationModel";


export default defineComponent({
  name: "ThesisFilters",
  components: { OrganisationUnitAutocompleteSearch, PersonAutocompleteSearch, DatePicker },
  setup() {
    const isExpanded = ref(false);

    const selectedOUs = ref<{title: string, value: number}[]>([]);
    const selectedAuthors = ref<{title: string, value: number}[]>([]);
    const selectedAdvisors = ref<{title: string, value: number}[]>([]);
    const selectedBoardMembers = ref<{title: string, value: number}[]>([]);
    const selectedBoardPresidents = ref<{title: string, value: number}[]>([]);

    const thesisTypes = computed(() => getThesisTypesForGivenLocale());
    const selectedThesisTypes = ref<{title: string, value: ThesisType}[]>([]);

    const fromDate = ref("");
    const toDate = ref("");
    const showOnlyOpenAccess = ref(false);

    const getFilterValues = () => {
        return {
            authorIds: selectedAuthors.value.map(selection => selection.value),
            advisorIds: selectedAdvisors.value.map(selection => selection.value),
            boardMemberIds: selectedBoardMembers.value.map(selection => selection.value),
            boardPresidentIds: selectedBoardPresidents.value.map(selection => selection.value),
            thesisTypes: selectedThesisTypes.value.map(selection => selection.value),
            dateFrom: fromDate.value,
            dateTo: toDate.value,
            facultyIds: selectedOUs.value.map(selection => selection.value),
            showOnlyOpenAccess: showOnlyOpenAccess.value,
            tokens: [] // is not set here
        };
    };

    return {
        isExpanded, selectedOUs,
        selectedAuthors, selectedAdvisors,
        selectedBoardMembers, fromDate,
        selectedBoardPresidents, toDate,
        showOnlyOpenAccess, thesisTypes,
        selectedThesisTypes, getFilterValues
    };
  },
});
</script>
