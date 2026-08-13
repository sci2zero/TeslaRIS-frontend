<template>
    <v-row class="mt-5 align-center">
        <v-col cols="auto">
            <h2>{{ $t("teamLabel") }}</h2>
        </v-col>
        <v-spacer />
        <v-col v-if="canEdit" cols="auto">
            <v-btn
                density="comfortable"
                color="primary"
                prepend-icon="mdi-account-plus"
                @click="addDialog = true">
                {{ $t("addTeamMemberLabel") }}
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
                    <localized-link v-if="row.item.personId" :to="'persons/' + row.item.personId">
                        {{ memberName(row.item) }}
                    </localized-link>
                    <span v-else>
                        {{ memberName(row.item) }}
                    </span>
                </td>
                <td>
                    {{ displayTextOrPlaceholder(getPersonProjectContributionTypeTitleFromValueAutoLocale(row.item.contributionType)) }}
                </td>
                <td>
                    {{ displayTextOrPlaceholder(getPersonProjectInvestigationRoleTitleFromValueAutoLocale(row.item.investigationRole)) }}
                </td>
                <td>
                    {{ displayTextOrPlaceholder(returnCurrentLocaleContent(row.item.otherRoleDescription)) }}
                </td>
            </tr>
        </template>
    </v-data-table>

    <v-dialog v-model="addDialog" persistent max-width="800">
        <v-card>
            <v-card-title>
                <span class="text-h5">{{ $t("addTeamMemberLabel") }}</span>
            </v-card-title>
            <v-card-text>
                <v-form v-model="isFormValid" @submit.prevent>
                    <v-row>
                        <v-col>
                            <person-autocomplete-search
                                v-model="selectedPerson"
                                required
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-select
                                v-model="selectedContributionType"
                                :items="contributionTypes"
                                :label="$t('contributionTypeLabel') + '*'"
                                :rules="requiredSelectionRules"
                                return-object
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-select
                                v-model="selectedInvestigationRole"
                                :items="investigationRoles"
                                :label="$t('investigationRoleLabel') + '*'"
                                :rules="requiredSelectionRules"
                                return-object
                            />
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn color="blue darken-1" @click="closeAddDialog">
                    {{ $t("closeLabel") }}
                </v-btn>
                <v-btn color="blue darken-1" :disabled="!isFormValid" @click="addTeamMember">
                    {{ $t("saveLabel") }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <persistent-question-dialog
        v-model="displayPersistentDialog"
        :title="$t('areYouSureLabel')"
        :message="$t('confirmDeletionMessage')"
        :entity-names="selectedMembers.map(member => memberName(member))"
        @continue="removeSelected" />

    <toast v-model="snackbar" :message="snackbarMessage" />
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { AxiosError } from "axios";
import type { ErrorResponse } from "@/models/Common";
import type { PersonProjectContribution } from "@/models/ProjectModel";
import { PersonProjectContributionType, PersonProjectInvestigationRole } from "@/models/ProjectModel";
import { useI18n } from "vue-i18n";
import ProjectService from "@/services/project/ProjectService";
import LocalizedLink from "@/components/localization/LocalizedLink.vue";
import PersonAutocompleteSearch from "@/components/person/PersonAutocompleteSearch.vue";
import PersistentQuestionDialog from "@/components/core/comparators/PersistentQuestionDialog.vue";
import Toast from "@/components/core/Toast.vue";
import {
    getPersonProjectContributionTypeTitleFromValueAutoLocale,
    getPersonProjectContributionTypesForGivenLocale
} from "@/i18n/personProjectContributionType";
import {
    getPersonProjectInvestigationRoleTitleFromValueAutoLocale,
    getPersonProjectInvestigationRolesForGivenLocale
} from "@/i18n/personProjectInvestigationRole";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import { displayTextOrPlaceholder } from "@/utils/StringUtil";
import { useValidationUtils } from "@/utils/ValidationUtils";

const props = withDefaults(defineProps<{
    projectId: number;
    persons: PersonProjectContribution[];
    canEdit?: boolean;
}>(), {
    canEdit: false
});

const emit = defineEmits<{
    (e: "refresh"): void;
}>();

const i18n = useI18n();
const { requiredSelectionRules } = useValidationUtils();

const selectedMembers = ref<PersonProjectContribution[]>([]);

const addDialog = ref(false);
const displayPersistentDialog = ref(false);
const isFormValid = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref("");

const searchPlaceholder = { title: "", value: -1 };
const selectedPerson = ref<{ title: string, value: number }>(searchPlaceholder);
const selectedContributionType = ref<{ title: string | undefined, value: PersonProjectContributionType }>();
const selectedInvestigationRole = ref<{ title: string | undefined, value: PersonProjectInvestigationRole }>();

const headers = computed(() => [
    { title: i18n.t("nameLabel"), align: "start", sortable: true, key: "name" },
    { title: i18n.t("contributionTypeLabel"), align: "start", sortable: false, key: "contributionType" },
    { title: i18n.t("investigationRoleLabel"), align: "start", sortable: false, key: "investigationRole" },
    { title: i18n.t("otherRoleDescriptionLabel"), align: "start", sortable: false, key: "otherRoleDescription" }
]);

const contributionTypes = computed(() => getPersonProjectContributionTypesForGivenLocale());
const investigationRoles = computed(() => getPersonProjectInvestigationRolesForGivenLocale());

const sortedMembers = computed(() =>
    [...props.persons].sort((a, b) => a.orderNumber - b.orderNumber)
);

watch(() => props.persons, () => {
    selectedMembers.value = [];
});

const memberName = (member: PersonProjectContribution) => {
    const name = [
        member.personName?.firstname,
        member.personName?.otherName,
        member.personName?.lastname
    ].filter(namePart => namePart && namePart.length > 0).join(" ");

    return displayTextOrPlaceholder(name);
};

const closeAddDialog = () => {
    addDialog.value = false;
    selectedPerson.value = searchPlaceholder;
    selectedContributionType.value = undefined;
    selectedInvestigationRole.value = undefined;
};

const nextOrderNumber = () =>
    props.persons.reduce((highest, member) => Math.max(highest, member.orderNumber ?? 0), 0) + 1;

const addTeamMember = () => {
    if (selectedPerson.value.value <= 0) {
        return;
    }

    const newMember: PersonProjectContribution = {
        personId: selectedPerson.value.value,
        contributionDescription: [],
        displayAffiliationStatement: [],
        orderNumber: nextOrderNumber(),
        contributionType: selectedContributionType.value?.value as PersonProjectContributionType,
        investigationRole: selectedInvestigationRole.value?.value as PersonProjectInvestigationRole,
        otherRoleDescription: [],
        fundingParts: [],
        researchAreasId: []
    };

    ProjectService.addProjectPerson(props.projectId, newMember).then(() => {
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
        ProjectService.removeProjectPerson(props.projectId, contributionId)
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
