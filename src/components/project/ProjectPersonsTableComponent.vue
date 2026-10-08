<template>
    <landing-section-card
        :title="$t('teamLabel')"
        :count="persons.length"
        icon="mdi-account-group-outline"
        icon-class="bg-indigo-50 text-indigo-600"
        padded>
        <template v-if="canEdit || canUnbind" #action>
            <v-btn
                v-if="canEdit"
                variant="outlined"
                size="small"
                class="text-none"
                prepend-icon="mdi-account-plus"
                @click="addDialog = true">
                {{ $t("addTeamMemberLabel") }}
            </v-btn>
            <v-btn
                v-if="canUnbind"
                variant="outlined"
                size="small"
                class="text-none"
                prepend-icon="mdi-link-variant-off"
                @click="displayUnbindDialog = true">
                {{ isResearcher ? $t("removeFromProjectLabel") : $t("removeInstitutionFromProjectLabel") }}
            </v-btn>
        </template>
        <responsive-data-table
            v-model="selectedMembers"
            :items="pagedMembers"
            :headers="headers"
            :items-length="persons.length"
            :show-select="canRemoveMembers"
            :page="tableOptions.page"
            :items-per-page="tableOptions.itemsPerPage"
            :sort-by="tableOptions.sortBy"
            container-class="bg-white"
            item-key="id"
            @update:options="updateTableOptions">
            <template v-if="canRemoveMembers" #selection-menu>
                <v-list-item
                    class="action-menu-item"
                    @click="displayPersistentDialog = true">
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
            <template #compact-item="{ item }">
                <entity-list-card
                    :to="item.personId > 0 ? 'persons/' + item.personId : undefined"
                    @preview="openGlance(item)">
                    <div class="flex items-start gap-3">
                        <v-checkbox
                            v-if="canRemoveMembers"
                            v-model="selectedMembers"
                            :value="item"
                            :aria-label="memberName(item)"
                            density="compact"
                            hide-details />
                        <entity-row-identity
                            :title="memberName(item)"
                            :to="item.personId > 0 ? 'persons/' + item.personId : undefined">
                            <template #icon>
                                <person-avatar :person-id="item.personId" :name="memberName(item)" :size="40" />
                            </template>
                            <p class="mt-1 text-sm text-slate-600 break-words">
                                {{ displayTextOrPlaceholder(getPersonProjectContributionTypeTitleFromValueAutoLocale(item.contributionType)) }}
                            </p>
                            <p class="mt-1 text-xs text-slate-500 break-words">
                                {{ displayTextOrPlaceholder(getPersonProjectInvestigationRoleTitleFromValueAutoLocale(item.investigationRole)) }}
                            </p>
                        </entity-row-identity>
                    </div>
                </entity-list-card>
            </template>
            <template #row="{ item }">
                <tr>
                    <td v-if="canRemoveMembers">
                        <v-checkbox
                            v-model="selectedMembers"
                            :value="item"
                            :aria-label="memberName(item)"
                            class="table-checkbox"
                            hide-details />
                    </td>
                    <td>
                        <entity-row-identity
                            :title="memberName(item)"
                            :to="item.personId > 0 ? 'persons/' + item.personId : undefined"
                            class="py-2">
                            <template #icon>
                                <person-avatar :person-id="item.personId" :name="memberName(item)" :size="40" />
                            </template>
                        </entity-row-identity>
                    </td>
                    <td class="text-sm text-slate-600">
                        {{ displayTextOrPlaceholder(getPersonProjectContributionTypeTitleFromValueAutoLocale(item.contributionType)) }}
                    </td>
                    <td class="text-sm text-slate-600">
                        {{ displayTextOrPlaceholder(getPersonProjectInvestigationRoleTitleFromValueAutoLocale(item.investigationRole)) }}
                    </td>
                    <td class="text-sm text-slate-600">
                        {{ displayTextOrPlaceholder(returnCurrentLocaleContent(item.otherRoleDescription)) }}
                    </td>
                </tr>
            </template>
        </responsive-data-table>
    </landing-section-card>

    <entity-details-sheet
        v-if="glancedMember"
        v-model="glanceOpen"
        :title="memberName(glancedMember)"
        :to="glancedMember.personId > 0 ? 'persons/' + glancedMember.personId : undefined"
        :open-page-label="$t('openPersonPageLabel')">
        <template #icon>
            <person-avatar :person-id="glancedMember.personId" :name="memberName(glancedMember)" :size="40" />
        </template>
        <div class="entity-details-grid">
            <entity-detail-field :label="$t('contributionTypeLabel')">
                {{ displayTextOrPlaceholder(getPersonProjectContributionTypeTitleFromValueAutoLocale(glancedMember.contributionType)) }}
            </entity-detail-field>
            <entity-detail-field :label="$t('investigationRoleLabel')">
                {{ displayTextOrPlaceholder(getPersonProjectInvestigationRoleTitleFromValueAutoLocale(glancedMember.investigationRole)) }}
            </entity-detail-field>
            <entity-detail-field :label="$t('otherRoleDescriptionLabel')" class="entity-details-full-width">
                {{ displayTextOrPlaceholder(returnCurrentLocaleContent(glancedMember.otherRoleDescription)) }}
            </entity-detail-field>
        </div>
    </entity-details-sheet>

    <v-dialog v-model="addDialog" persistent max-width="900">
        <v-card>
            <v-card-title>
                <span class="text-h5">{{ $t("addTeamMemberLabel") }}</span>
            </v-card-title>
            <v-card-text class="dialog-content">
                <v-form v-model="isFormValid" @submit.prevent>
                    <person-project-contribution-form
                        :key="formKey"
                        single
                        allow-external-associate
                        @set-input="pendingMember = $event[0]"
                    />
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn color="blue darken-1" @click="closeAddDialog">
                    {{ $t("closeLabel") }}
                </v-btn>
                <v-btn color="blue darken-1" :disabled="!pendingMember || isFormValid === false" @click="addTeamMember">
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

    <persistent-question-dialog
        v-model="displayUnbindDialog"
        :title="$t('areYouSureLabel')"
        :message="isResearcher ? $t('researcherProjectUnbindWarning') : $t('institutionProjectUnbindWarning')"
        @continue="unbind" />

    <toast v-model="snackbar" :message="snackbarMessage" />
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { AxiosError } from "axios";
import type { ErrorResponse } from "@/models/Common";
import type { PersonProjectContribution } from "@/models/ProjectModel";
import { useI18n } from "vue-i18n";
import ProjectService from "@/services/project/ProjectService";
import PersonProjectContributionForm from "@/components/project/PersonProjectContributionForm.vue";
import PersistentQuestionDialog from "@/components/core/comparators/PersistentQuestionDialog.vue";
import Toast from "@/components/core/Toast.vue";
import LandingSectionCard from "@/components/landing/LandingSectionCard.vue";
import { useLocalTable } from "@/composables/useLocalTable";
import ResponsiveDataTable from "@/components/core/ResponsiveDataTable.vue";
import EntityRowIdentity from "@/components/core/EntityRowIdentity.vue";
import EntityListCard from "@/components/core/EntityListCard.vue";
import EntityDetailsSheet from "@/components/core/EntityDetailsSheet.vue";
import EntityDetailField from "@/components/core/EntityDetailField.vue";
import PersonAvatar from "@/components/person/PersonAvatar.vue";
import { getPersonProjectContributionTypeTitleFromValueAutoLocale } from "@/i18n/personProjectContributionType";
import { getPersonProjectInvestigationRoleTitleFromValueAutoLocale } from "@/i18n/personProjectInvestigationRole";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import { displayTextOrPlaceholder } from "@/utils/StringUtil";
import { useUserRole } from "@/composables/useUserRole";

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
const { isAdmin, isResearcher, isInstitutionalEditor } = useUserRole();

const canRemoveMembers = computed(() => props.canEdit && isAdmin.value);
const canUnbind = computed(() => props.canEdit && (isResearcher.value || isInstitutionalEditor.value));

const selectedMembers = ref<PersonProjectContribution[]>([]);
const glanceOpen = ref(false);
const glancedMember = ref<PersonProjectContribution | null>(null);
const openGlance = (member: PersonProjectContribution) => {
    glancedMember.value = member;
    glanceOpen.value = true;
};

const { tableOptions, pagedItems: pagedMembers, updateTableOptions } = useLocalTable(
    computed(() => props.persons), i18n.locale,
    (member) => memberName(member),
    (a, b) => a.orderNumber - b.orderNumber
);

const addDialog = ref(false);
const displayPersistentDialog = ref(false);
const displayUnbindDialog = ref(false);
const isFormValid = ref<boolean | null>(null);
const snackbar = ref(false);
const snackbarMessage = ref("");

const pendingMember = ref<PersonProjectContribution | undefined>();
const formKey = ref(0);

const headers = computed(() => [
    {
        title: i18n.t("fullNameLabel"), align: "start", sortable: true, key: "name",
        value: (member: PersonProjectContribution) => memberName(member)
    },
    { title: i18n.t("contributionTypeLabel"), align: "start", sortable: false, key: "contributionType" },
    { title: i18n.t("investigationRoleLabel"), align: "start", sortable: false, key: "investigationRole" },
    { title: i18n.t("otherRoleDescriptionLabel"), align: "start", sortable: false, key: "otherRoleDescription" }
]);

watch(() => props.persons, () => {
    selectedMembers.value = [];
    tableOptions.value.page = 1;
    glancedMember.value = null;
    glanceOpen.value = false;
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
    pendingMember.value = undefined;
    formKey.value++;
};

const nextOrderNumber = () =>
    props.persons.reduce((highest, member) => Math.max(highest, member.orderNumber ?? 0), 0) + 1;

const addTeamMember = () => {
    if (!pendingMember.value) {
        return;
    }

    const newMember: PersonProjectContribution = {
        ...pendingMember.value,
        orderNumber: nextOrderNumber()
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

const unbind = () => {
    const request = isResearcher.value ?
        ProjectService.unbindResearcherFromProject(props.projectId) :
        ProjectService.unbindInstitutionResearchersFromProject(props.projectId);

    request.then(() => {
        notify(isResearcher.value ?
            i18n.t("projectUnbindSuccessMessage") :
            i18n.t("institutionProjectUnbindSuccessMessage"));
        emit("refresh");
    }).catch((error: AxiosError<ErrorResponse>) => {
        notifyError(error);
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

<style scoped>

.dialog-content {
    max-height: 70vh;
    overflow-y: auto;
}

</style>
