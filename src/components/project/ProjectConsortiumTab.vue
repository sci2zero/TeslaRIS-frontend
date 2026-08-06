<template>
    <v-row class="mt-5 align-center">
        <v-col cols="auto">
            <h2>{{ $t("consortiumLabel") }}</h2>
        </v-col>
        <v-spacer />
        <v-col v-if="canEdit" cols="auto">
            <v-btn
                density="comfortable"
                color="primary"
                prepend-icon="mdi-domain-plus"
                @click="addDialog = true">
                {{ $t("addInstitutionLabel") }}
            </v-btn>
            <v-btn
                density="comfortable"
                class="ml-2"
                color="error"
                variant="outlined"
                prepend-icon="mdi-delete"
                :disabled="selectedMembers.length === 0"
                @click="displayPersistentDialog = true">
                {{ $t("removeLabel") }}
            </v-btn>
        </v-col>
    </v-row>

    <v-data-table
        v-model="selectedMembers"
        :items="sortedMembers"
        :headers="headers"
        item-value="orderNumber"
        :show-select="canEdit"
        return-object
        :items-per-page-text="$t('itemsPerPageLabel')"
        :items-per-page-options="[5, 10, 25, 50]"
        :no-data-text="$t('noDataInTableMessage')">
        <template #item="row">
            <tr>
                <td v-if="canEdit">
                    <v-checkbox
                        v-model="selectedMembers"
                        :value="row.item"
                        class="table-checkbox"
                        hide-details
                    />
                </td>
                <td>
                    <localized-link
                        v-if="row.item.organisationUnitId"
                        :to="'organisation-units/' + row.item.organisationUnitId">
                        {{ institutionName(row.item) }}
                    </localized-link>
                    <span v-else>
                        {{ institutionName(row.item) }}
                    </span>
                </td>
                <td>
                    {{ displayTextOrPlaceholder(getOrganisationUnitProjectContributionTypeTitleFromValueAutoLocale(row.item.contributionType)) }}
                </td>
                <td>
                    {{ displayTextOrPlaceholder(localiseDate(row.item.dateFrom)) }}
                </td>
                <td>
                    {{ displayTextOrPlaceholder(localiseDate(row.item.dateTo)) }}
                </td>
            </tr>
        </template>
    </v-data-table>

    <v-dialog v-model="addDialog" persistent max-width="900">
        <v-card>
            <v-card-title>
                <span class="text-h5">{{ $t("addInstitutionLabel") }}</span>
            </v-card-title>
            <v-card-text>
                <v-form v-model="isFormValid" @submit.prevent>
                    <v-row v-if="!enterExternalOU">
                        <v-col cols="12">
                            <organisation-unit-autocomplete-search
                                v-model="selectedOrganisationUnit"
                                only-independent-institutions
                                required
                            />
                        </v-col>
                    </v-row>
                    <v-row v-if="enterExternalOU">
                        <v-col cols="12">
                            <multilingual-text-input
                                ref="externalOUNameRef"
                                v-model="externalOUName"
                                :rules="requiredFieldRules"
                                :label="$t('externalOUNameLabel') + '*'"
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-btn
                                color="blue darken-1"
                                compact
                                @click="toggleExternalOU">
                                {{ enterExternalOU ? $t("searchInSystemLabel") : $t("enterExternalOULabel") }}
                            </v-btn>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <v-select
                                v-model="selectedContributionType"
                                :items="contributionTypes"
                                :label="$t('contributionTypeLabel') + '*'"
                                :rules="requiredSelectionRules"
                                return-object
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" md="6">
                            <date-picker
                                v-model="dateFrom"
                                :label="$t('fromLabel')"
                                color="primary"
                                persistent
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <date-picker
                                v-model="dateTo"
                                :label="$t('toLabel')"
                                color="primary"
                                persistent
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <multilingual-text-input
                                ref="contributionDescriptionRef"
                                v-model="contributionDescription"
                                :label="$t('descriptionLabel')"
                                is-area
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <uri-input v-model="uris" />
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn color="blue darken-1" @click="closeAddDialog">
                    {{ $t("closeLabel") }}
                </v-btn>
                <v-btn color="blue darken-1" :disabled="!isFormValid" @click="addInstitution">
                    {{ $t("saveLabel") }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <persistent-question-dialog
        v-model="displayPersistentDialog"
        :title="$t('areYouSureLabel')"
        :message="$t('confirmDeletionMessage')"
        :entity-names="selectedMembers.map(member => institutionName(member))"
        @continue="removeSelected" />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import type { MultilingualContent } from "@/models/Common";
import type { OrganisationUnitProjectContribution } from "@/models/ProjectModel";
import { OrganisationUnitProjectContributionType } from "@/models/ProjectModel";
import LocalizedLink from "@/components/localization/LocalizedLink.vue";
import MultilingualTextInput from "@/components/core/MultilingualTextInput.vue";
import DatePicker from "@/components/core/DatePicker.vue";
import UriInput from "@/components/core/UriInput.vue";
import OrganisationUnitAutocompleteSearch from "@/components/organisationUnit/OrganisationUnitAutocompleteSearch.vue";
import PersistentQuestionDialog from "@/components/core/comparators/PersistentQuestionDialog.vue";
import {
    getOrganisationUnitProjectContributionTypeTitleFromValueAutoLocale,
    getOrganisationUnitProjectContributionTypesForGivenLocale
} from "@/i18n/organisationUnitProjectContributionType";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import { displayTextOrPlaceholder } from "@/utils/StringUtil";
import { localiseDate } from "@/utils/DateUtil";
import { useValidationUtils } from "@/utils/ValidationUtils";

const props = withDefaults(defineProps<{
    consortium: OrganisationUnitProjectContribution[];
    canEdit?: boolean;
}>(), {
    canEdit: false
});

const emit = defineEmits<{
    (e: "update", payload: OrganisationUnitProjectContribution[]): void;
}>();

const i18n = useI18n();
const { requiredFieldRules, requiredSelectionRules } = useValidationUtils();

const selectedMembers = ref<OrganisationUnitProjectContribution[]>([]);

const addDialog = ref(false);
const displayPersistentDialog = ref(false);
const isFormValid = ref(false);

const externalOUNameRef = ref<typeof MultilingualTextInput>();
const contributionDescriptionRef = ref<typeof MultilingualTextInput>();

const searchPlaceholder = { title: "", value: -1 };
const enterExternalOU = ref(false);
const selectedOrganisationUnit = ref<{ title: string, value: number }>(searchPlaceholder);
const externalOUName = ref<MultilingualContent[]>([]);
const selectedContributionType = ref<{ title: string | undefined, value: OrganisationUnitProjectContributionType }>();
const contributionDescription = ref<MultilingualContent[]>([]);
const dateFrom = ref("");
const dateTo = ref("");
const uris = ref<string[]>([]);

const headers = computed(() => [
    { title: i18n.t("institutionLabel"), align: "start", sortable: true, key: "name" },
    { title: i18n.t("contributionTypeLabel"), align: "start", sortable: false, key: "contributionType" },
    { title: i18n.t("dateFromLabel"), align: "start", sortable: true, key: "dateFrom" },
    { title: i18n.t("dateToLabel"), align: "start", sortable: true, key: "dateTo" }
]);

const contributionTypes = computed(() => getOrganisationUnitProjectContributionTypesForGivenLocale());

const sortedMembers = computed(() =>
    [...props.consortium].sort((a, b) => a.orderNumber - b.orderNumber)
);

const institutionName = (member: OrganisationUnitProjectContribution) => {
    const name = member.organisationUnitId ?
        returnCurrentLocaleContent(member.organisationUnitName) :
        returnCurrentLocaleContent(member.displayOrganisationUnit);

    return displayTextOrPlaceholder(name);
};

const toggleExternalOU = () => {
    enterExternalOU.value = !enterExternalOU.value;
    selectedOrganisationUnit.value = searchPlaceholder;
    externalOUName.value = [];
    externalOUNameRef.value?.clearInput();
};

const closeAddDialog = () => {
    addDialog.value = false;
    enterExternalOU.value = false;
    selectedOrganisationUnit.value = searchPlaceholder;
    externalOUName.value = [];
    selectedContributionType.value = undefined;
    contributionDescription.value = [];
    dateFrom.value = "";
    dateTo.value = "";
    uris.value = [];
    externalOUNameRef.value?.clearInput();
    contributionDescriptionRef.value?.clearInput();
};

const addInstitution = () => {
    const newMember: OrganisationUnitProjectContribution = {
        organisationUnitId: enterExternalOU.value ? undefined : selectedOrganisationUnit.value.value,
        displayOrganisationUnit: enterExternalOU.value ? externalOUName.value : [],
        contributionDescription: contributionDescription.value,
        contributionType: selectedContributionType.value?.value as OrganisationUnitProjectContributionType,
        orderNumber: props.consortium.length + 1,
        dateFrom: dateFrom.value ? dateFrom.value : undefined,
        dateTo: dateTo.value ? dateTo.value : undefined,
        uris: uris.value,
        fundingParts: []
    };

    emit("update", [...props.consortium, newMember]);
    closeAddDialog();
};

const removeSelected = () => {
    const remaining = props.consortium.filter(member => !selectedMembers.value.includes(member));
    selectedMembers.value = [];
    emit("update", remaining.map((member, index) => ({ ...member, orderNumber: index + 1 })));
};
</script>
