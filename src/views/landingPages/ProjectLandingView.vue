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
                        <v-row v-else>
                            <!-- Left column -->
                            <v-col cols="6">
                                <div v-if="project.doi">
                                    DOI:
                                </div>
                                <div v-if="project.doi" class="response">
                                    {{ project.doi }}
                                </div>

                                <div v-if="project.raid">
                                    {{ $t("raidLabel") }}:
                                </div>
                                <div v-if="project.raid" class="response">
                                    {{ project.raid }}
                                </div>

                                <div>{{ $t("statusLabel") }}:</div>
                                <div class="response">
                                    {{ getProjectStatusTitleFromValueAutoLocale(project.status) }}
                                </div>

                                <div>{{ $t("collaborationTypeLabel") }}:</div>
                                <div class="response">
                                    {{ getProjectCollaborationTypeTitleFromValueAutoLocale(project.collaborationType) }}
                                </div>

                                <div>{{ $t("researchTypeLabel") }}:</div>
                                <div class="response">
                                    {{ getProjectResearchTypeTitleFromValueAutoLocale(project.researchType) }}
                                </div>
                            </v-col>

                            <!-- Right column -->
                            <v-col cols="6">
                                <div v-if="project.dateFrom">
                                    {{ $t("dateFromLabel") }}:
                                </div>
                                <div v-if="project.dateFrom" class="response">
                                    {{ localiseDate(project.dateFrom) }}
                                </div>

                                <div v-if="project.dateTo">
                                    {{ $t("dateToLabel") }}:
                                </div>
                                <div v-if="project.dateTo" class="response">
                                    {{ localiseDate(project.dateTo) }}
                                </div>

                                <div v-if="project.costs">
                                    {{ $t("costsLabel") }}:
                                </div>
                                <div v-if="project.costs" class="response">
                                    {{ formatAmount(project.costs.amount, locale) }} {{ project.costs.currencyCode }}
                                </div>

                                <div v-if="project.notFunded !== undefined && project.notFunded !== null">
                                    {{ $t("notFundedLabel") }}:
                                </div>
                                <div v-if="project.notFunded !== undefined && project.notFunded !== null" class="response">
                                    {{ project.notFunded ? $t("yesLabel") : $t("noLabel") }}
                                </div>

                                <div v-if="project.uris && project.uris.length > 0">
                                    {{ $t("urisLabel") }}:
                                </div>
                                <div v-if="project.uris && project.uris.length > 0" class="response">
                                    <div v-for="uri in project.uris" :key="uri">
                                        <a :href="uri" target="_blank">{{ uri }}</a>
                                    </div>
                                </div>
                            </v-col>
                        </v-row>
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
            <v-tab value="additionalInfo">
                {{ $t("additionalInfoLabel") }}
            </v-tab>
        </v-tabs>

        <v-tabs-window v-show="project" v-model="currentTab">
            <v-tabs-window-item value="team">
                <v-row class="mt-10">
                    <v-col cols="12">
                        <strong v-if="!project?.team || project.team.length === 0">{{ $t("notYetSetMessage") }}</strong>
                        <div v-for="(contribution, index) in sortedTeam" :key="contribution.id ?? index" class="py-5">
                            <h4>
                                <strong>
                                    {{ contribution.personName?.firstname }}
                                    {{ contribution.personName?.otherName ? ' ' + contribution.personName.otherName : '' }}
                                    {{ ' ' + contribution.personName?.lastname }}
                                    - {{ getPersonProjectContributionTypeTitleFromValueAutoLocale(contribution.contributionType) }}
                                </strong>
                            </h4>
                            <div>
                                {{ $t("investigationRoleLabel") }}: {{ getPersonProjectInvestigationRoleTitleFromValueAutoLocale(contribution.investigationRole) }}
                            </div>
                            <div v-if="contribution.otherRoleDescription && contribution.otherRoleDescription.length > 0">
                                {{ $t("otherRoleDescriptionLabel") }}: {{ returnCurrentLocaleContent(contribution.otherRoleDescription) }}
                            </div>
                            <v-divider v-if="index < sortedTeam.length - 1" class="mt-10" />
                        </div>
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
import type { Project } from "@/models/ProjectModel";
import { getProjectStatusTitleFromValueAutoLocale } from "@/i18n/projectStatus";
import { getProjectCollaborationTypeTitleFromValueAutoLocale } from "@/i18n/projectCollaborationType";
import { getProjectResearchTypeTitleFromValueAutoLocale } from "@/i18n/projectResearchType";
import { getPersonProjectContributionTypeTitleFromValueAutoLocale } from "@/i18n/personProjectContributionType";
import { getPersonProjectInvestigationRoleTitleFromValueAutoLocale } from "@/i18n/personProjectInvestigationRole";
import KeywordList from "@/components/core/KeywordList.vue";
import DescriptionSection from "@/components/core/DescriptionSection.vue";
import { formatAmount } from "@/utils/MonetaryUtil";
import { localiseDate } from "@/utils/DateUtil";
import GenericCrudModal from "@/components/core/GenericCrudModal.vue";
import AlternateNameForm from "@/components/project/AlternateNameForm.vue";
import ProjectUpdateForm from "@/components/project/ProjectUpdateForm.vue";
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

const sortedTeam = computed(() => {
    return [...(project.value?.team ?? [])].sort((a, b) => a.orderNumber - b.orderNumber);
});

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
    const updatePayload: Project = {
        ...(project.value as Project),
        team: project.value?.team?.map(contribution => ({ ...contribution, fundingParts: [] })) ?? []
    };

    ProjectService.updateProject(project.value?.id as number, updatePayload).then(() => {
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

.edit-pen-container {
    position: relative;
}
</style>
