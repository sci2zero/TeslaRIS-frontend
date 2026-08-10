<template>
    <v-container id="project">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center edit-pen-container">
                        <v-skeleton-loader
                            :loading="!project"
                            type="heading"
                            color="blue-lighten-3"
                            class="text-center"
                        >
                            <rich-title-renderer :title="title" />
                            <div>
                                <generic-crud-modal
                                    class="mb-6"
                                    :form-component="AlternateNameForm"
                                    :form-props="{ presetName: project?.name, presetNameAbbreviation: project?.nameAbbreviation }"
                                    entity-name="Name"
                                    is-update
                                    is-section-update
                                    :read-only="!canEdit"
                                    @update="updateName"
                                />
                            </div>
                        </v-skeleton-loader>
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ $t("projectLabel") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- Basic Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon size="x-large" class="large-project-icon">
                    {{ icon }}
                </v-icon>
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="secondary">
                    <v-card-text class="edit-pen-container">
                        <generic-crud-modal
                            :form-component="ProjectUpdateForm"
                            :form-props="{ presetProject: project }"
                            entity-name="Project"
                            is-update
                            is-section-update
                            :read-only="!canEdit"
                            @update="updateBasicInfo"
                        />

                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>

                        <basic-info-loader v-if="!project" />
                        <div v-else class="info-columns">
                            <div v-if="project.doi" class="info-item">
                                <div>DOI:</div>
                                <div class="response">
                                    {{ project.doi }}
                                </div>
                            </div>

                            <div v-if="project.raid" class="info-item">
                                <div>{{ $t("raidLabel") }}:</div>
                                <div class="response">
                                    {{ project.raid }}
                                </div>
                            </div>

                            <div v-if="project.dateFrom" class="info-item">
                                <div>{{ $t("dateFromLabel") }}:</div>
                                <div class="response">
                                    {{ localiseDate(project.dateFrom) }}
                                </div>
                            </div>

                            <div v-if="project.dateTo" class="info-item">
                                <div>{{ $t("dateToLabel") }}:</div>
                                <div class="response">
                                    {{ localiseDate(project.dateTo) }}
                                </div>
                            </div>

                            <div v-if="principleInvestigators.length > 0" class="info-item">
                                <div>{{ $t("principleInvestigatorLabel") }}:</div>
                                <div class="response">
                                    <div v-for="investigator in principleInvestigators" :key="investigator.id">
                                        <localized-link v-if="investigator.personId" :to="'persons/' + investigator.personId">
                                            {{ personName(investigator) }}
                                        </localized-link>
                                        <span v-else>
                                            {{ personName(investigator) }}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div v-if="institutionCoordinators.length > 0" class="info-item">
                                <div>{{ $t("institutionCoordinatorLabel") }}:</div>
                                <div class="response">
                                    <div v-for="coordinator in institutionCoordinators" :key="coordinator.id">
                                        <localized-link
                                            v-if="coordinator.organisationUnitId"
                                            :to="'organisation-units/' + coordinator.organisationUnitId">
                                            {{ institutionName(coordinator) }}
                                        </localized-link>
                                        <span v-else>
                                            {{ institutionName(coordinator) }}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div class="info-item">
                                <div>{{ $t("statusLabel") }}:</div>
                                <div class="response">
                                    {{ getProjectStatusTitleFromValueAutoLocale(project.status) }}
                                </div>
                            </div>

                            <div class="info-item">
                                <div>{{ $t("collaborationTypeLabel") }}:</div>
                                <div class="response">
                                    {{ getProjectCollaborationTypeTitleFromValueAutoLocale(project.collaborationType) }}
                                </div>
                            </div>

                            <div class="info-item">
                                <div>{{ $t("researchTypeLabel") }}:</div>
                                <div class="response">
                                    {{ getProjectResearchTypeTitleFromValueAutoLocale(project.researchType) }}
                                </div>
                            </div>

                            <div v-if="project.notFunded !== undefined && project.notFunded !== null" class="info-item">
                                <div>{{ $t("notFundedLabel") }}:</div>
                                <div class="response">
                                    {{ project.notFunded ? $t("yesLabel") : $t("noLabel") }}
                                </div>
                            </div>

                            <div v-if="project.costs" class="info-item">
                                <div>{{ $t("costsLabel") }}:</div>
                                <div class="response">
                                    {{ formatAmount(project.costs.amount, locale) }} {{ project.costs.currencyCode }}
                                </div>
                            </div>

                            <div v-if="project.uris && project.uris.length > 0" class="info-item">
                                <div>{{ $t("urisLabel") }}:</div>
                                <div class="response">
                                    <div v-for="uri in project.uris" :key="uri">
                                        <a :href="uri" target="_blank">{{ uri }}</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Tabs -->
        <tab-content-loader v-if="!project" layout="sections" />
        <v-tabs
            v-show="project"
            v-model="currentTab"
            color="deep-purple-accent-4"
            align-tabs="start"
        >
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
        </v-tabs>

        <v-tabs-window v-show="project" v-model="currentTab">
            <v-tabs-window-item value="team">
                <v-row class="mt-10">
                    <v-col cols="12">
                        <project-team-tab
                            v-if="project"
                            :team="project.persons ?? []"
                            :can-edit="canEdit"
                            @update="updateTeam"
                        />
                    </v-col>
                </v-row>
            </v-tabs-window-item>

            <v-tabs-window-item value="consortium">
                <v-row class="mt-10">
                    <v-col cols="12">
                        <project-consortium-tab
                            v-if="project"
                            :consortium="project.consortium ?? []"
                            :can-edit="canEdit"
                            @update="updateConsortium"
                        />
                    </v-col>
                </v-row>
            </v-tabs-window-item>

            <v-tabs-window-item value="fundings">
                <v-row class="mt-10">
                    <v-col cols="12">
                        <project-fundings-tab
                            v-if="project?.id"
                            :project="project"
                            :can-edit="canEdit"
                        />
                    </v-col>
                </v-row>
            </v-tabs-window-item>

            <v-tabs-window-item value="fundingApplications">
                <v-row class="mt-10">
                    <v-col cols="12">
                        <project-funding-applications-tab
                            v-if="project?.id"
                            :project-id="project.id"
                            :can-edit="canEdit"
                        />
                    </v-col>
                </v-row>
            </v-tabs-window-item>

            <v-tabs-window-item value="documents">
                <v-row class="mt-10">
                    <v-col cols="12">
                        <project-documents-tab
                            v-if="project?.id"
                            :project-id="project.id"
                            :can-edit="canEdit"
                        />
                    </v-col>
                </v-row>
            </v-tabs-window-item>

            <v-tabs-window-item value="events">
                <v-row class="mt-10">
                    <v-col cols="12">
                        <project-events-tab
                            v-if="project?.id"
                            :project-id="project.id"
                            :can-edit="canEdit"
                        />
                    </v-col>
                </v-row>
            </v-tabs-window-item>

            <v-tabs-window-item value="additionalInfo">
                <!-- Keywords -->
                <keyword-list
                    :keywords="project?.keywords ? project.keywords : []"
                    :can-edit="canEdit"
                    @search-keyword="searchKeyword($event)"
                    @update="updateKeywords"
                />

                <!-- Description -->
                <description-section
                    is-general-description
                    :description="project?.description"
                    :can-edit="canEdit"
                    @update="updateDescription"
                />
            </v-tabs-window-item>
        </v-tabs-window>
        <toast v-model="snackbar" :message="snackbarMessage" />
    </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import RichTitleRenderer from "@/components/core/RichTitleRenderer.vue";
import BasicInfoLoader from "@/components/core/BasicInfoLoader.vue";
import TabContentLoader from "@/components/core/TabContentLoader.vue";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import ProjectService from "@/services/project/ProjectService";
import type { OrganisationUnitProjectContribution, PersonProjectContribution, Project } from "@/models/ProjectModel";
import { OrganisationUnitProjectContributionType, PersonProjectContributionType } from "@/models/ProjectModel";
import LocalizedLink from "@/components/localization/LocalizedLink.vue";
import { getProjectStatusTitleFromValueAutoLocale } from "@/i18n/projectStatus";
import { getProjectCollaborationTypeTitleFromValueAutoLocale } from "@/i18n/projectCollaborationType";
import { getProjectResearchTypeTitleFromValueAutoLocale } from "@/i18n/projectResearchType";
import KeywordList from "@/components/core/KeywordList.vue";
import DescriptionSection from "@/components/core/DescriptionSection.vue";
import { formatAmount } from "@/utils/MonetaryUtil";
import { localiseDate } from "@/utils/DateUtil";
import GenericCrudModal from "@/components/core/GenericCrudModal.vue";
import AlternateNameForm from "@/components/project/AlternateNameForm.vue";
import ProjectUpdateForm from "@/components/project/ProjectUpdateForm.vue";
import ProjectFundingsTab from "@/components/project/ProjectFundingsTab.vue";
import ProjectFundingApplicationsTab from "@/components/project/ProjectFundingApplicationsTab.vue";
import ProjectTeamTab from "@/components/project/ProjectTeamTab.vue";
import ProjectConsortiumTab from "@/components/project/ProjectConsortiumTab.vue";
import ProjectDocumentsTab from "@/components/project/ProjectDocumentsTab.vue";
import ProjectEventsTab from "@/components/project/ProjectEventsTab.vue";
import Toast from "@/components/core/Toast.vue";
import type { MultilingualContent } from "@/models/Common";
import { useLoginStore } from "@/stores/loginStore";

const route = useRoute();
const router = useRouter();
const i18n = useI18n();
const { locale } = useI18n();

const project = ref<Project>();
const currentTab = ref("team");
const icon = ref("mdi-folder-star");

const canEdit = ref(false);
const loginStore = useLoginStore();

const snackbar = ref(false);
const snackbarMessage = ref("");

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
    project.value?.consortium?.filter(
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

const updateTeam = (team: PersonProjectContribution[]) => {
    project.value!.persons = team;
    performUpdate(true);
};

const updateConsortium = (consortium: OrganisationUnitProjectContribution[]) => {
    project.value!.consortium = consortium;
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

<style scoped>
#project .large-project-icon {
    font-size: 10em;
}

#project .response {
    font-size: 1.2rem;
    margin-bottom: 10px;
    font-weight: bold;
}

#project .info-columns {
    columns: 2;
    column-gap: 40px;
}

#project .info-item {
    break-inside: avoid;
}

@media (max-width: 959px) {
    #project .info-columns {
        columns: 1;
    }
}

.edit-pen-container {
    position: relative;
}
</style>
