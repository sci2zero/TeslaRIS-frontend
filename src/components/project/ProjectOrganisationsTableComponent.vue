<template>
    <table-toolbar
        :title="$t('consortiumLabel')"
        :selected-count="selectedMembers.length"
        :can-act="canEdit"
    >
        <template #action-items>
            <v-list-item
                class="action-menu-item"
                @click="displayPersistentDialog = true"
            >
                <template #prepend>
                    <v-icon color="error" size="18">
                        mdi-delete
                    </v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                    {{ $t("removeLabel") }}
                </v-list-item-title>
            </v-list-item>
        </template>
        <template #actions>
            <v-btn
                v-if="canEdit"
                color="primary"
                prepend-icon="mdi-domain-plus"
                @click="addDialog = true">
                {{ $t("addInstitutionLabel") }}
            </v-btn>
        </template>
    </table-toolbar>

    <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <v-data-table
            v-model="selectedMembers"
            v-model:sort-by="sortBy"
            :items="sortedMembers"
            :headers="headers"
            item-value="id"
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
    </div>

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

    <toast v-model="snackbar" :message="snackbarMessage" />
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { AxiosError } from "axios";
import type { ErrorResponse, MultilingualContent } from "@/models/Common";
import type { OrganisationUnitProjectContribution } from "@/models/ProjectModel";
import { OrganisationUnitProjectContributionType } from "@/models/ProjectModel";
import ProjectService from "@/services/project/ProjectService";
import LocalizedLink from "@/components/localization/LocalizedLink.vue";
import MultilingualTextInput from "@/components/core/MultilingualTextInput.vue";
import DatePicker from "@/components/core/DatePicker.vue";
import UriInput from "@/components/core/UriInput.vue";
import OrganisationUnitAutocompleteSearch from "@/components/organisationUnit/OrganisationUnitAutocompleteSearch.vue";
import PersistentQuestionDialog from "@/components/core/comparators/PersistentQuestionDialog.vue";
import Toast from "@/components/core/Toast.vue";
import TableToolbar from "@/components/core/TableToolbar.vue";
import {
    getOrganisationUnitProjectContributionTypeTitleFromValueAutoLocale,
    getOrganisationUnitProjectContributionTypesForGivenLocale
} from "@/i18n/organisationUnitProjectContributionType";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import { displayTextOrPlaceholder } from "@/utils/StringUtil";
import { localiseDate } from "@/utils/DateUtil";
import { useValidationUtils } from "@/utils/ValidationUtils";

const props = withDefaults(defineProps<{
    projectId: number;
    organisations: OrganisationUnitProjectContribution[];
    canEdit?: boolean;
}>(), {
    canEdit: false
});

const emit = defineEmits<{
    (e: "refresh"): void;
}>();

const i18n = useI18n();
const { requiredFieldRules, requiredSelectionRules } = useValidationUtils();

const selectedMembers = ref<OrganisationUnitProjectContribution[]>([]);

const addDialog = ref(false);
const displayPersistentDialog = ref(false);
const isFormValid = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref("");

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

const sortBy = ref<{ key: string, order?: boolean | "asc" | "desc" }[]>([]);

// Rows with no date always belong at the bottom, whichever direction is active. A custom comparator
// cannot do that: for descending order Vuetify swaps the comparator's arguments instead of negating
// its result, so the comparator never learns the direction. What works is sorting on a stand-in
// value -- a date later than any real one while ascending, earlier than any while descending -- so
// the empty rows sink either way. The cell itself still renders the raw value.
const emptyDateSortValue = (key: string) =>
    sortBy.value.find(entry => entry.key === key)?.order === "desc" ? "0000-01-01" : "9999-12-31";

const headers = computed(() => {
    const emptyDateFrom = emptyDateSortValue("dateFrom");
    const emptyDateTo = emptyDateSortValue("dateTo");

    return [
        {
            title: i18n.t("institutionLabel"), align: "start", sortable: true, key: "name",
            value: (member: OrganisationUnitProjectContribution) => institutionName(member)
        },
        { title: i18n.t("contributionTypeLabel"), align: "start", sortable: false, key: "contributionType" },
        {
            title: i18n.t("dateFromLabel"), align: "start", sortable: true, key: "dateFrom",
            value: (member: OrganisationUnitProjectContribution) => member.dateFrom || emptyDateFrom
        },
        {
            title: i18n.t("dateToLabel"), align: "start", sortable: true, key: "dateTo",
            value: (member: OrganisationUnitProjectContribution) => member.dateTo || emptyDateTo
        }
    ];
});

const contributionTypes = computed(() => getOrganisationUnitProjectContributionTypesForGivenLocale());

const sortedMembers = computed(() =>
    [...props.organisations].sort((a, b) => a.orderNumber - b.orderNumber)
);

watch(() => props.organisations, () => {
    selectedMembers.value = [];
});

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

const nextOrderNumber = () =>
    props.organisations.reduce((highest, member) => Math.max(highest, member.orderNumber ?? 0), 0) + 1;

const addInstitution = () => {
    if (!enterExternalOU.value && selectedOrganisationUnit.value.value <= 0) {
        return;
    }

    const newMember: OrganisationUnitProjectContribution = {
        organisationUnitId: enterExternalOU.value ? undefined : selectedOrganisationUnit.value.value,
        displayOrganisationUnit: enterExternalOU.value ? externalOUName.value : [],
        contributionDescription: contributionDescription.value,
        contributionType: selectedContributionType.value?.value as OrganisationUnitProjectContributionType,
        orderNumber: nextOrderNumber(),
        dateFrom: dateFrom.value ? dateFrom.value : undefined,
        dateTo: dateTo.value ? dateTo.value : undefined,
        uris: uris.value,
        fundingParts: []
    };

    ProjectService.addProjectOrganisation(props.projectId, newMember).then(() => {
        notify(i18n.t("savedMessage"));
        closeAddDialog();
        emit("refresh");
    }).catch((error: AxiosError<ErrorResponse>) => {
        notifyError(error);
    });
};

const removeSelected = () => {
    const removedIds = selectedMembers.value
        .map(member => member.id)
        .filter((contributionId): contributionId is number => contributionId !== undefined);

    Promise.all(removedIds.map(contributionId =>
        ProjectService.removeProjectOrganisation(props.projectId, contributionId)
    )).then(() => {
        selectedMembers.value = [];
        notify(i18n.t("updatedSuccessMessage"));
        emit("refresh");
    }).catch((error: AxiosError<ErrorResponse>) => {
        selectedMembers.value = [];
        notifyError(error);
        emit("refresh");
    });
};

const notify = (message: string) => {
    snackbarMessage.value = message;
    snackbar.value = true;
};

const notifyError = (error: AxiosError<ErrorResponse>) => {
    const backendMessage = error.response?.data.message as string;
    const translated = backendMessage ? i18n.t(backendMessage) : "";
    notify(translated && translated !== backendMessage ? translated : i18n.t("genericErrorMessage"));
};
</script>
