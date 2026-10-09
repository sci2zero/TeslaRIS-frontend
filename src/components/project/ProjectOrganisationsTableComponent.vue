<template>
    <landing-section-card
        :title="$t('consortiumLabel')"
        :count="organisations.length"
        icon="mdi-office-building-outline"
        icon-class="bg-indigo-50 text-indigo-600"
        padded>
        <template v-if="canEdit" #action>
            <v-btn
                v-if="canEdit"
                variant="outlined"
                size="small"
                class="text-none"
                prepend-icon="mdi-domain-plus"
                @click="addDialog = true">
                {{ $t("addInstitutionLabel") }}
            </v-btn>
        </template>
        <responsive-data-table
            v-model="selectedMembers"
            :headers="headers"
            :show-select="canRemoveMembers"
            container-class="bg-white"
            item-key="id"
            :items="pagedItems"
            :items-length="organisations.length"
            :page="tableOptions.page"
            :items-per-page="tableOptions.itemsPerPage"
            :sort-by="tableOptions.sortBy"
            @update:options="updateTableOptions">
            <template v-if="canRemoveMembers" #selection-menu>
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
            <template #compact-item="{ item }">
                <entity-list-card :to="recordLink(item)" @preview="openGlance(item)">
                    <div class="flex items-start gap-3">
                        <v-checkbox
                            v-if="canRemoveMembers"
                            v-model="selectedMembers"
                            :value="item"
                            :aria-label="institutionName(item)"
                            density="compact"
                            hide-details />
                        <entity-row-identity
                            :title="institutionName(item)"
                            :to="recordLink(item)">
                            <template #icon>
                                <organisation-unit-avatar :organisation-unit-id="item.organisationUnitId" />
                            </template>
                            <p class="mt-1 text-sm text-slate-600 break-words">
                                {{ displayTextOrPlaceholder(getOrganisationUnitProjectContributionTypeTitleFromValueAutoLocale(item.contributionType)) }}
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
                            class="table-checkbox"
                            hide-details
                        />
                    </td>
                    <td>
                        <entity-row-identity
                            :title="institutionName(item)"
                            :to="recordLink(item)"
                            class="py-2">
                            <template #icon>
                                <organisation-unit-avatar :organisation-unit-id="item.organisationUnitId" />
                            </template>
                        </entity-row-identity>
                    </td>
                    <td class="text-sm text-slate-600">
                        {{ displayTextOrPlaceholder(getOrganisationUnitProjectContributionTypeTitleFromValueAutoLocale(item.contributionType)) }}
                    </td>
                    <td class="text-sm text-slate-600">
                        {{ displayTextOrPlaceholder(localiseDate(item.dateFrom)) }}
                    </td>
                    <td class="text-sm text-slate-600">
                        {{ displayTextOrPlaceholder(localiseDate(item.dateTo)) }}
                    </td>
                </tr>
            </template>
        </responsive-data-table>
    </landing-section-card>

    <project-relation-glance
        v-if="glancedRecord"
        v-model="glanceOpen"
        :title="institutionName(glancedRecord)"
        :to="recordLink(glancedRecord)"
        :fields="glanceFields(glancedRecord)"
        icon="mdi-office-building-outline"
        organisation
        :organisation-unit-id="glancedRecord.organisationUnitId" />

    <v-dialog v-model="addDialog" persistent max-width="900">
        <v-card>
            <v-card-title>
                <span class="text-h5">{{ $t("addInstitutionLabel") }}</span>
            </v-card-title>
            <v-card-text class="dialog-content">
                <v-form v-model="isFormValid" @submit.prevent>
                    <organisation-unit-project-contribution-form
                        :key="formKey"
                        single
                        @set-input="pendingOrganisation = $event[0]"
                    />
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn color="blue darken-1" @click="closeAddDialog">
                    {{ $t("closeLabel") }}
                </v-btn>
                <v-btn color="blue darken-1" :disabled="!pendingOrganisation || isFormValid === false" @click="addInstitution">
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
import type { ErrorResponse } from "@/models/Common";
import type { OrganisationUnitProjectContribution } from "@/models/ProjectModel";
import ProjectService from "@/services/project/ProjectService";
import OrganisationUnitProjectContributionForm from "@/components/project/OrganisationUnitProjectContributionForm.vue";
import PersistentQuestionDialog from "@/components/core/comparators/PersistentQuestionDialog.vue";
import Toast from "@/components/core/Toast.vue";
import LandingSectionCard from "@/components/landing/LandingSectionCard.vue";
import OrganisationUnitAvatar from "@/components/organisationUnit/OrganisationUnitAvatar.vue";
import { useLocalTable } from "@/composables/useLocalTable";
import ResponsiveDataTable from "@/components/core/ResponsiveDataTable.vue";
import EntityRowIdentity from "@/components/core/EntityRowIdentity.vue";
import EntityListCard from "@/components/core/EntityListCard.vue";
import ProjectRelationGlance from "./ProjectRelationGlance.vue";
import { getOrganisationUnitProjectContributionTypeTitleFromValueAutoLocale } from "@/i18n/organisationUnitProjectContributionType";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import { displayTextOrPlaceholder } from "@/utils/StringUtil";
import { localiseDate } from "@/utils/DateUtil";
import { useUserRole } from "@/composables/useUserRole";

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
const { isAdmin } = useUserRole();

const canRemoveMembers = computed(() => props.canEdit && isAdmin.value);

const selectedMembers = ref<OrganisationUnitProjectContribution[]>([]);

const glanceOpen = ref(false);
const glancedRecord = ref<OrganisationUnitProjectContribution | null>(null);
const openGlance = (item: OrganisationUnitProjectContribution) => {
    glancedRecord.value = item;
    glanceOpen.value = true;
};
const recordLink = (item: OrganisationUnitProjectContribution) => item.organisationUnitId && item.organisationUnitId > 0 ? 'organisation-units/' + item.organisationUnitId : undefined;
const glanceFields = (item: OrganisationUnitProjectContribution) => [
    { label: i18n.t("contributionTypeLabel"), value: getOrganisationUnitProjectContributionTypeTitleFromValueAutoLocale(item.contributionType) },
    { label: i18n.t("dateFromLabel"), value: localiseDate(item.dateFrom) },
    { label: i18n.t("dateToLabel"), value: localiseDate(item.dateTo) },
    { label: i18n.t("descriptionLabel"), value: returnCurrentLocaleContent(item.contributionDescription) }
];

const { tableOptions, pagedItems, updateTableOptions } = useLocalTable(
    computed(() => props.organisations), i18n.locale,
    (item, key) => key === "name" ? institutionName(item) : key === "dateFrom" ? item.dateFrom : item.dateTo,
    (a, b) => a.orderNumber - b.orderNumber
);

const addDialog = ref(false);
const displayPersistentDialog = ref(false);
const isFormValid = ref<boolean | null>(null);
const snackbar = ref(false);
const snackbarMessage = ref("");

const pendingOrganisation = ref<OrganisationUnitProjectContribution | undefined>();
const formKey = ref(0);

const headers = computed(() => [
    { title: i18n.t("institutionLabel"), align: "start", sortable: true, key: "name" },
    { title: i18n.t("contributionTypeLabel"), align: "start", sortable: false, key: "contributionType" },
    { title: i18n.t("dateFromLabel"), align: "start", sortable: true, key: "dateFrom" },
    { title: i18n.t("dateToLabel"), align: "start", sortable: true, key: "dateTo" }
]);

watch(() => props.organisations, () => {
    selectedMembers.value = [];
});

const institutionName = (member: OrganisationUnitProjectContribution) => {
    const name = member.organisationUnitId ?
        returnCurrentLocaleContent(member.organisationUnitName) :
        returnCurrentLocaleContent(member.displayOrganisationUnit);

    return displayTextOrPlaceholder(name);
};

const closeAddDialog = () => {
    addDialog.value = false;
    pendingOrganisation.value = undefined;
    formKey.value++;
};

const nextOrderNumber = () =>
    props.organisations.reduce((highest, member) => Math.max(highest, member.orderNumber ?? 0), 0) + 1;

const addInstitution = () => {
    if (!pendingOrganisation.value) {
        return;
    }

    const newMember: OrganisationUnitProjectContribution = {
        ...pendingOrganisation.value,
        orderNumber: nextOrderNumber()
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

<style scoped>

.dialog-content {
    max-height: 70vh;
    overflow-y: auto;
}

</style>
