<template>
    <landing-page-layout
        id="project"
        v-model="currentTab"
        :loading="!project"
        :tab-number="8"
    >
        <template #header>
            <entity-landing-header
                :loading="!project"
                :entity-label="$t('projectLabel')"
                :badge="project ? getProjectStatusTitleFromValueAutoLocale(project.status) : ''"
                :year="project?.dateFrom ? project.dateFrom.substring(0, 4) : ''"
                :icon="icon"
                :can-edit="canEdit"
                :edit-label="$t('updateProjectLabel')"
                :entity-type="EntityType.PROJECT"
                :entity-id="project?.id"
                @edit="openModal(updateModalRef)"
            >
                <template #modals>
                    <generic-crud-modal
                        v-if="canEdit"
                        ref="updateModalRef"
                        hide-activator
                        :form-component="ProjectUpdateForm"
                        :form-props="{ presetProject: project }"
                        entity-name="Project"
                        is-update
                        is-section-update
                        :read-only="!canEdit"
                        @update="updateBasicInfo"
                    />
                    <generic-crud-modal
                        v-if="canEdit"
                        ref="nameModalRef"
                        hide-activator
                        :form-component="AlternateNameForm"
                        :form-props="{ presetName: project?.name, presetNameAbbreviation: project?.nameAbbreviation }"
                        entity-name="Name"
                        is-update
                        is-section-update
                        :read-only="!canEdit"
                        @update="updateName"
                    />
                </template>
                <template #title>
                    <rich-title-renderer :title="title" />
                </template>

                <template #meta>
                    <landing-meta-item v-if="project?.dateFrom" :label="$t('dateFromLabel')" icon="mdi-calendar-start" tone="slate">
                        {{ localiseDate(project.dateFrom) }}
                    </landing-meta-item>
                    <landing-meta-item v-if="project?.dateTo" :label="$t('dateToLabel')" icon="mdi-calendar-end" tone="amber">
                        {{ localiseDate(project.dateTo) }}
                    </landing-meta-item>
                    <landing-meta-item v-if="project?.doi" label="DOI" abbrev="DOI" tone="blue">
                        <identifier-link :identifier="project.doi" type="doi" compact />
                    </landing-meta-item>
                    <landing-meta-item v-if="project?.raid" :label="$t('raidLabel')" abbrev="RAiD" tone="indigo">
                        <identifier-link :identifier="project.raid" type="raid" compact />
                    </landing-meta-item>
                    <landing-meta-item v-if="project?.nationalId" :label="$t('nationalIdLabel')" icon="mdi-identifier" tone="violet">
                        {{ project.nationalId }}
                    </landing-meta-item>
                    <landing-meta-item v-if="principleInvestigators.length > 0" :label="$t('principleInvestigatorLabel')" icon="mdi-account" tone="emerald">
                        <div v-for="investigator in principleInvestigators" :key="investigator.id">
                            <localized-link v-if="investigator.personId" :to="'persons/' + investigator.personId" class="underline">
                                {{ personName(investigator) }}
                            </localized-link>
                            <span v-else>
                                {{ personName(investigator) }}
                            </span>
                        </div>
                    </landing-meta-item>
                    <landing-meta-item v-if="institutionCoordinators.length > 0" :label="$t('institutionCoordinatorLabel')" icon="mdi-domain" tone="emerald">
                        <div v-for="coordinator in institutionCoordinators" :key="coordinator.id">
                            <localized-link
                                v-if="coordinator.organisationUnitId"
                                :to="'organisation-units/' + coordinator.organisationUnitId"
                                class="underline"
                            >
                                {{ institutionName(coordinator) }}
                            </localized-link>
                            <span v-else>
                                {{ institutionName(coordinator) }}
                            </span>
                        </div>
                    </landing-meta-item>
                </template>
            </entity-landing-header>
        </template>

        <template #tabs>
            <v-tab v-if="showOverviewTab" value="overview">
                {{ $t("overviewLabel") }}
            </v-tab>
            <v-tab value="team">
                {{ $t("teamLabel") }}
            </v-tab>
            <v-tab value="consortium">
                {{ $t("consortiumLabel") }}
            </v-tab>
            <v-tab value="fundings">
                {{ $t("fundingsLabel") }}
            </v-tab>
            <v-tab value="fundingApplications">
                {{ $t("fundingApplicationsLabel") }}
            </v-tab>
            <v-tab value="documents">
                {{ $t("documentsLabel") }}
            </v-tab>
            <v-tab value="events">
                {{ $t("eventListLabel") }}
            </v-tab>
            <v-tab value="additionalInfo">
                {{ $t("additionalInfoLabel") }}
            </v-tab>
            <v-tab v-show="canReviewDataQuality" value="revisions">
                {{ $t("revisionHistoryLabel") }}
            </v-tab>
        </template>

        <template #default>
            <v-tabs-window-item value="overview">
                <landing-overview-tab
                    v-show="showOverview"
                    :description="project?.description"
                    is-general-description
                    :contributions="project?.persons ?? []"
                    :contributors-label="$t('teamLabel')"
                    contributors-tab="team"
                    @has-content="onOverviewContent"
                    @see-all="currentTab = $event"
                />
            </v-tabs-window-item>

            <v-tabs-window-item value="team">
                <project-persons-table-component
                    v-if="project?.id"
                    :project-id="project.id"
                    :persons="project.persons ?? []"
                    :can-edit="canEdit"
                    @refresh="fetchProject"
                />
            </v-tabs-window-item>

            <v-tabs-window-item value="consortium">
                <project-organisations-table-component
                    v-if="project?.id"
                    :project-id="project.id"
                    :organisations="project.organisations ?? []"
                    :can-edit="canEdit"
                    @refresh="fetchProject"
                />
            </v-tabs-window-item>

            <v-tabs-window-item value="fundings">
                <project-fundings-table-component
                    v-if="project?.id"
                    :project="project"
                    :can-edit="canEdit"
                />
            </v-tabs-window-item>

            <v-tabs-window-item value="fundingApplications">
                <project-funding-applications-table-component
                    v-if="project?.id"
                    :project-id="project.id"
                    :can-edit="canEdit"
                />
            </v-tabs-window-item>

            <v-tabs-window-item value="documents">
                <project-documents-table-component
                    v-if="project?.id"
                    :project-id="project.id"
                    :can-edit="canEdit"
                />
            </v-tabs-window-item>

            <v-tabs-window-item value="events">
                <project-events-table-component
                    v-if="project?.id"
                    :project-id="project.id"
                    :can-edit="canEdit"
                />
            </v-tabs-window-item>

            <v-tabs-window-item value="additionalInfo">
                <landing-additional-info-tab
                    :keywords="project?.keywords ? project.keywords : []"
                    :description="project?.description"
                    :can-edit="canEdit"
                    is-general-description
                    :show-remark="false"
                    @search-keyword="searchKeyword"
                    @update-keywords="updateKeywords"
                    @update-description="updateDescription"
                >
                    <template #details>
                        <landing-detail-field v-if="project" :label="$t('statusLabel')">
                            {{ getProjectStatusTitleFromValueAutoLocale(project.status) }}
                        </landing-detail-field>
                        <landing-detail-field v-if="project" :label="$t('collaborationTypeLabel')">
                            {{ getProjectCollaborationTypeTitleFromValueAutoLocale(project.collaborationType) }}
                        </landing-detail-field>
                        <landing-detail-field v-if="project" :label="$t('researchTypeLabel')">
                            {{ getProjectResearchTypeTitleFromValueAutoLocale(project.researchType) }}
                        </landing-detail-field>
                        <landing-detail-field v-if="project?.costs" :label="$t('costsLabel')">
                            {{ formatAmount(project.costs.amount, locale) }} {{ project.costs.currencyCode }}
                        </landing-detail-field>
                        <landing-detail-field v-if="project?.uris && project.uris.length > 0" :label="$t('urisLabel')">
                            <a
                                v-for="uri in project.uris"
                                :key="uri"
                                :href="uri"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="underline block break-all"
                            >
                                {{ uri }}
                            </a>
                        </landing-detail-field>
                    </template>
                </landing-additional-info-tab>
            </v-tabs-window-item>

            <v-tabs-window-item value="revisions">
                <landing-section-card
                    :title="$t('revisionHistoryLabel')"
                    icon="mdi-history"
                    icon-class="bg-indigo-50 text-indigo-600"
                    padded>
                    <revision-history-table-component
                        :entity-type="EntityType.PROJECT"
                        :entity-id="project?.id"
                        @restored="fetchProject"
                    />
                </landing-section-card>
            </v-tabs-window-item>
        </template>

        <template #footer>
            <toast v-model="snackbar" :message="snackbarMessage" />
        </template>
    </landing-page-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import RichTitleRenderer from "@/components/core/RichTitleRenderer.vue";
import IdentifierLink from "@/components/core/IdentifierLink.vue";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import ProjectService from "@/services/project/ProjectService";
import type { OrganisationUnitProjectContribution, PersonProjectContribution, Project } from "@/models/ProjectModel";
import { OrganisationUnitProjectContributionType, PersonProjectContributionType } from "@/models/ProjectModel";
import LocalizedLink from "@/components/localization/LocalizedLink.vue";
import { getProjectStatusTitleFromValueAutoLocale } from "@/i18n/projectStatus";
import { getProjectCollaborationTypeTitleFromValueAutoLocale } from "@/i18n/projectCollaborationType";
import { getProjectResearchTypeTitleFromValueAutoLocale } from "@/i18n/projectResearchType";
import { formatAmount } from "@/utils/MonetaryUtil";
import { localiseDate } from "@/utils/DateUtil";
import GenericCrudModal from "@/components/core/GenericCrudModal.vue";
import AlternateNameForm from "@/components/project/AlternateNameForm.vue";
import ProjectUpdateForm from "@/components/project/ProjectUpdateForm.vue";
import ProjectFundingsTableComponent from "@/components/project/ProjectFundingsTableComponent.vue";
import ProjectFundingApplicationsTableComponent from "@/components/project/ProjectFundingApplicationsTableComponent.vue";
import ProjectPersonsTableComponent from "@/components/project/ProjectPersonsTableComponent.vue";
import ProjectOrganisationsTableComponent from "@/components/project/ProjectOrganisationsTableComponent.vue";
import ProjectDocumentsTableComponent from "@/components/project/ProjectDocumentsTableComponent.vue";
import ProjectEventsTableComponent from "@/components/project/ProjectEventsTableComponent.vue";
import RevisionHistoryTableComponent from "@/components/core/revisions/RevisionHistoryTableComponent.vue";
import Toast from "@/components/core/Toast.vue";
import { EntityType } from "@/models/MergeModel";
import { useUserRole } from "@/composables/useUserRole";
import type { MultilingualContent } from "@/models/Common";
import { useLoginStore } from "@/stores/loginStore";
import EntityLandingHeader from "@/components/landing/EntityLandingHeader.vue";
import LandingMetaItem from "@/components/landing/LandingMetaItem.vue";
import LandingDetailField from "@/components/landing/LandingDetailField.vue";
import LandingAdditionalInfoTab from "@/components/landing/LandingAdditionalInfoTab.vue";
import LandingOverviewTab from "@/components/landing/LandingOverviewTab.vue";
import LandingSectionCard from "@/components/landing/LandingSectionCard.vue";
import LandingPageLayout from "@/components/landing/LandingPageLayout.vue";
import { useLandingOverview } from "@/composables/useLandingOverview";

const route = useRoute();
const router = useRouter();
const i18n = useI18n();
const { locale } = useI18n();

const project = ref<Project>();
const currentTab = ref("overview");
const { showOverview, showOverviewTab, onOverviewContent } = useLandingOverview(
    project,
    currentTab,
    "team",
);
const icon = ref("mdi-folder-star");

const canEdit = ref(false);
const loginStore = useLoginStore();
const { canReviewDataQuality } = useUserRole();

const snackbar = ref(false);
const snackbarMessage = ref("");

const updateModalRef = ref<{ dialog: boolean } | null>(null);
const nameModalRef = ref<{ dialog: boolean } | null>(null);

const openModal = (modal: { dialog: boolean } | null) => {
    if (modal) {
        modal.dialog = true;
    }
};

const title = computed(() => {
    const name = returnCurrentLocaleContent(project.value?.name) ?? "";
    const abbr = returnCurrentLocaleContent(project.value?.nameAbbreviation);
    return abbr ? `${name} (${abbr})` : name;
});

const principleInvestigators = computed(() =>
    project.value?.persons?.filter(
        person => person.contributionType === PersonProjectContributionType.PRINCIPLE_INVESTIGATOR
    ) ?? []
);

const institutionCoordinators = computed(() =>
    project.value?.organisations?.filter(
        institution => institution.contributionType === OrganisationUnitProjectContributionType.COORDINATOR
    ) ?? []
);

const personName = (person: PersonProjectContribution) => {
    return [
        person.personName?.firstname,
        person.personName?.otherName,
        person.personName?.lastname
    ].filter(namePart => namePart && namePart.length > 0).join(" ");
};

const institutionName = (institution: OrganisationUnitProjectContribution) => {
    return institution.organisationUnitId ?
        returnCurrentLocaleContent(institution.organisationUnitName) :
        returnCurrentLocaleContent(institution.displayOrganisationUnit);
};

onMounted(() => {
    fetchProject();
});

const fetchProject = async () => {
    try {
        const response = await ProjectService.readProject(
            parseInt(route.params.id as string)
        );
        project.value = response.data;

        if (loginStore.userLoggedIn) {
            checkIfUserCanEdit();
        }
    } catch (error) {
        console.error("Error fetching project:", error);
        await router.push({ name: "notFound" });
    }
};

const checkIfUserCanEdit = () => {
    ProjectService.canEdit(parseInt(route.params.id as string)).then((response) => {
        canEdit.value = response.data;
    }).catch(() => canEdit.value = false);
};

const searchKeyword = (keyword: string) => {
    router.push({ name: "advancedSearch", query: { searchQuery: keyword.trim(), tab: "publications", search: "simple" } });
};

const updateName = (nameInformation: {name: MultilingualContent[], nameAbbreviation: MultilingualContent[]}) => {
    project.value!.name = nameInformation.name;
    project.value!.nameAbbreviation = nameInformation.nameAbbreviation;
    performUpdate(true);
};

const updateKeywords = (keywords: MultilingualContent[]) => {
    project.value!.keywords = keywords;
    performUpdate(true);
};

const updateDescription = (description: MultilingualContent[]) => {
    project.value!.description = description;
    performUpdate(true);
};

const updateBasicInfo = (basicInfo: Project) => {
    project.value = { ...project.value, ...basicInfo };
    performUpdate(true);
};

const performUpdate = (reload: boolean) => {
    ProjectService.updateProject(project.value?.id as number, project.value as Project).then(() => {
        snackbarMessage.value = i18n.t("updatedSuccessMessage");
        snackbar.value = true;
        if (reload) {
            fetchProject();
        }
    }).catch(() => {
        snackbarMessage.value = i18n.t("genericErrorMessage");
        snackbar.value = true;
        fetchProject();
    });
};
</script>
