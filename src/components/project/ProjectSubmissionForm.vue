<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="10">
                <v-row>
                    <v-col cols="12">
                        <i-d-f-project-metadata-prepopulator
                            @metadata-fetched="populateMetadata"
                            @update:doi="(value: string) => doi = value"
                        />
                    </v-col>
                </v-row>

                <!-- RAiD -->
                <v-row>
                    <v-col cols="11">
                        <v-text-field
                            v-model="raid"
                            :label="$t('raidLabel')"
                            :placeholder="$t('raidLabel')"
                        />
                    </v-col>
                </v-row>

                <!-- Name* -->
                <v-row>
                    <v-col>
                        <multilingual-text-input
                            ref="nameRef"
                            v-model="name"
                            :rules="requiredFieldRules"
                            :label="$t('nameLabel') + '*'"
                        />
                    </v-col>
                </v-row>

                <!-- Name Abbreviation -->
                <v-row>
                    <v-col>
                        <multilingual-text-input
                            ref="nameAbbreviationRef"
                            v-model="nameAbbreviation"
                            :label="$t('nameAbbreviationLabel')"
                        />
                    </v-col>
                </v-row>



                <!-- Status* / CollaborationType* / ResearchType* -->
                <v-row>
                    <v-col cols="4">
                        <v-select
                            v-model="status"
                            :label="$t('statusLabel') + '*'"
                            :items="projectStatusOptions"
                            item-title="title"
                            item-value="value"
                            :rules="requiredSelectionValueRules"
                        />
                    </v-col>
                    <v-col cols="4">
                        <v-select
                            v-model="collaborationType"
                            :label="$t('collaborationTypeLabel') + '*'"
                            :items="projectCollaborationTypeOptions"
                            item-title="title"
                            item-value="value"
                            :rules="requiredSelectionValueRules"
                        />
                    </v-col>
                    <v-col cols="4">
                        <v-select
                            v-model="researchType"
                            :label="$t('researchTypeLabel') + '*'"
                            :items="projectResearchTypeOptions"
                            item-title="title"
                            item-value="value"
                            :rules="requiredSelectionValueRules"
                        />
                    </v-col>
                </v-row>

                <!-- Start Date / End Date -->
                <v-row>
                    <v-col cols="6">
                        <date-picker
                            v-model="dateFrom"
                            :label="$t('dateFromLabel')"
                            color="primary"
                        />
                    </v-col>
                    <v-col cols="6">
                        <date-picker
                            v-model="dateTo"
                            :label="$t('dateToLabel')"
                            color="primary"
                        />
                    </v-col>
                </v-row>

                <!-- Team -->
                <v-row>
                    <v-col>
                        <h2>{{ $t("teamLabel") }}</h2>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <person-project-contribution-form
                            ref="personsRef"
                            @set-input="persons = $event"
                        />
                    </v-col>
                </v-row>

                <!-- Consortium -->
                <v-row>
                    <v-col>
                        <h2>{{ $t("consortiumLabel") }}</h2>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <organisation-unit-project-contribution-form
                            ref="organisationsRef"
                            @set-input="organisations = $event"
                        />
                    </v-col>
                </v-row>

                <!-- Related Projects -->
                <v-row>
                    <v-col>
                        <h2>{{ $t("relatedProjectsLabel") }}</h2>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <projects-relation-form
                            ref="relationsRef"
                            @set-input="relations = $event"
                        />
                    </v-col>
                </v-row>

                <!-- Additional Fields Toggle -->
                <v-btn color="blue darken-1" @click="additionalFields = !additionalFields">
                    {{ $t("additionalFieldsLabel") }} {{ additionalFields ? "▲" : "▼" }}
                </v-btn>

                <v-container v-if="additionalFields">
                    <!-- Description -->
                    <v-row>
                        <v-col>
                            <multilingual-text-input
                                ref="descriptionRef"
                                v-model="description"
                                is-area
                                :label="$t('descriptionLabel')"
                            />
                        </v-col>
                    </v-row>

                    <!-- Keywords -->
                    <v-row>
                        <v-col>
                            <multilingual-text-input
                                ref="keywordsRef"
                                v-model="keywords"
                                is-area
                                :label="$t('keywordsLabel')"
                            />
                        </v-col>
                    </v-row>

                    <!-- URIs -->
                    <v-row>
                        <v-col>
                            <uri-input ref="urisRef" v-model="uris" />
                        </v-col>
                    </v-row>

                    <!-- Not Funded / Costs -->
                    <v-row>
                        <v-col cols="6">
                            <v-checkbox
                                v-model="notFunded"
                                :label="$t('noCostsLabel')"
                            />
                        </v-col>
                    </v-row>

                    <v-row v-if="!notFunded">
                        <v-col>
                            <monetary-amount-input
                                ref="costsRef"
                                v-model="costs"
                                :amount-label="$t('costsLabel')"
                            />
                        </v-col>
                    </v-row>
                </v-container>
            </v-col>
        </v-row>

        <v-row>
            <p class="required-fields-message">
                {{ $t("requiredFieldsMessage") }}
            </p>
        </v-row>
    </v-form>

    <toast v-model="snackbar" :message="!error ? $t('savedMessage') : errorMessage" />
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import UriInput from '@/components/core/UriInput.vue';
import DatePicker from '@/components/core/DatePicker.vue';
import MonetaryAmountInput from '@/components/core/MonetaryAmountInput.vue';
import Toast from '@/components/core/Toast.vue';
import IDFProjectMetadataPrepopulator from '@/components/project/IDFProjectMetadataPrepopulator.vue';
import ProjectsRelationForm from '@/components/project/ProjectsRelationForm.vue';
import PersonProjectContributionForm from '@/components/project/PersonProjectContributionForm.vue';
import OrganisationUnitProjectContributionForm from '@/components/project/OrganisationUnitProjectContributionForm.vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { sanitizeUri } from '@/utils/StringUtil';
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import { useLanguageTags } from '@/composables/useLanguageTags';
import ProjectService from '@/services/project/ProjectService';
import { ProjectCollaborationType, ProjectResearchType, ProjectStatus, type Project, type PrepopulatedProjectMetadata, type ProjectsRelation, type PersonProjectContribution, type OrganisationUnitProjectContribution } from '@/models/ProjectModel';
import { getProjectStatusesForGivenLocale } from '@/i18n/projectStatus';
import { getProjectCollaborationTypesForGivenLocale } from '@/i18n/projectCollaborationType';
import { getProjectResearchTypesForGivenLocale } from '@/i18n/projectResearchType';
import type { AxiosError } from 'axios';
import type { ErrorResponse, MonetaryAmount, MultilingualContent } from '@/models/Common';

const emit = defineEmits(["create"]);

const router = useRouter();
const i18n = useI18n();

const isFormValid = ref(false);
const additionalFields = ref(false);
const snackbar = ref(false);
const error = ref(false);
const errorMessage = ref(i18n.t("genericErrorMessage"));

const nameRef = ref<InstanceType<typeof MultilingualTextInput>>();
const nameAbbreviationRef = ref<InstanceType<typeof MultilingualTextInput>>();
const descriptionRef = ref<InstanceType<typeof MultilingualTextInput>>();
const keywordsRef = ref<InstanceType<typeof MultilingualTextInput>>();
const urisRef = ref<InstanceType<typeof UriInput>>();
const costsRef = ref<InstanceType<typeof MonetaryAmountInput>>();
const relationsRef = ref<InstanceType<typeof ProjectsRelationForm>>();
const personsRef = ref<InstanceType<typeof PersonProjectContributionForm>>();
const organisationsRef = ref<InstanceType<typeof OrganisationUnitProjectContributionForm>>();

const name = ref<MultilingualContent[]>([]);
const nameAbbreviation = ref<MultilingualContent[]>([]);
const description = ref<MultilingualContent[]>([]);
const keywords = ref<MultilingualContent[]>([]);
const uris = ref<string[]>([]);
const doi = ref("");
const raid = ref("");
const dateFrom = ref("");
const dateTo = ref("");
const notFunded = ref(false);
const costs = ref<MonetaryAmount | undefined>(undefined);
const relations = ref<ProjectsRelation[]>([]);
const persons = ref<PersonProjectContribution[]>([]);
const organisations = ref<OrganisationUnitProjectContribution[]>([]);

const status = ref<ProjectStatus>();
const collaborationType = ref<ProjectCollaborationType>();
const researchType = ref<ProjectResearchType>();

const projectStatusOptions = computed(() => getProjectStatusesForGivenLocale());
const projectCollaborationTypeOptions = computed(() => getProjectCollaborationTypesForGivenLocale());
const projectResearchTypeOptions = computed(() => getProjectResearchTypesForGivenLocale());

const {
    requiredFieldRules,
    uriValidationRules
} = useValidationUtils();

const { languageTags } = useLanguageTags();

const requiredSelectionValueRules = [(v: any) => (v !== undefined && v !== null) || i18n.t("requiredFieldMessage")];

const populateMetadata = async (metadata: PrepopulatedProjectMetadata) => {
    if (name.value.length === 0 && metadata.name.length > 0) {
        name.value = metadata.name;
        nameRef.value?.forceRefreshModelValue(toMultilingualTextInput(name.value, languageTags.value));
    }

    if (nameAbbreviation.value.length === 0 && metadata.nameAbbreviation.length > 0) {
        nameAbbreviation.value = metadata.nameAbbreviation;
        nameAbbreviationRef.value?.forceRefreshModelValue(toMultilingualTextInput(nameAbbreviation.value, languageTags.value));
    }

    doi.value = doi.value ? doi.value : metadata.doi;

    // Harvested metadata carries unencoded URLs (Crossref hands out landing pages with spaces and
    // quotes in the query), and an invalid one silently blocks the whole form - Vuetify validates it
    // on mount without rendering the message. Repair what can be repaired, drop the rest.
    metadata.uris.forEach(uri => {
        const sanitizedUri = sanitizeUri(uri);
        if (
            sanitizedUri && uriValidationRules[0](sanitizedUri) === true &&
            !uris.value.includes(sanitizedUri)
        ) {
            uris.value.push(sanitizedUri);
        }
    });

    dateFrom.value = dateFrom.value ? dateFrom.value : (metadata.dateFrom ?? "");
    dateTo.value = dateTo.value ? dateTo.value : (metadata.dateTo ?? "");

    status.value = status.value ? status.value : metadata.status;

    if (description.value.length === 0 && metadata.description.length > 0) {
        additionalFields.value = true;
        await nextTick();

        description.value = metadata.description;
        descriptionRef.value?.forceRefreshModelValue(toMultilingualTextInput(description.value, languageTags.value));
    }

    if (keywords.value.length === 0 && metadata.keywords.length > 0) {
      additionalFields.value = true;
      await nextTick();

      keywords.value = metadata.keywords;
      keywordsRef.value?.forceRefreshModelValue(toMultilingualTextInput(keywords.value, languageTags.value));
    }

    if (!costs.value && metadata.costs) {
        notFunded.value = false;
        additionalFields.value = true;
        await nextTick();

        costsRef.value?.setValue(metadata.costs);
        costs.value = metadata.costs;
    }

    if (persons.value.length === 0) {
        await personsRef.value?.seedFromMetadata(metadata.persons);
    }

    if (organisations.value.length === 0) {
        await organisationsRef.value?.seedFromMetadata(metadata.organisations);
    }
};

const submitProject = (stayOnPage: boolean) => {
    if (relations.value.some(relation => !relation.dateFrom || !relation.dateTo)) {
        errorMessage.value = i18n.t("requiredFieldsMessage");
        error.value = true;
        snackbar.value = true;
        return;
    }

    const newProject: Project = {
        name: name.value,
        nameAbbreviation: nameAbbreviation.value,
        description: description.value,
        keywords: keywords.value,
        uris: uris.value,
        doi: doi.value || undefined,
        raid: raid.value || undefined,
        status: status.value as ProjectStatus,
        collaborationType: collaborationType.value as ProjectCollaborationType,
        researchType: researchType.value as ProjectResearchType,
        dateFrom: dateFrom.value || undefined,
        dateTo: dateTo.value || undefined,
        notFunded: notFunded.value,
        costs: notFunded.value ? undefined : costs.value,
        internalIdentifiers: [],
        oldIds: [],
        mergedIds: [],
        researchAreasId: [],
        organisations: organisations.value,
        persons: persons.value,
        relations: relations.value,
    };

    ProjectService.createProject(newProject).then((response) => {
        emit("create", response.data);

        if (stayOnPage) {
            nameRef.value?.clearInput();
            nameAbbreviationRef.value?.clearInput();
            descriptionRef.value?.clearInput();
            keywordsRef.value?.clearInput();
            urisRef.value?.clearInput();
            doi.value = "";
            raid.value = "";
            dateFrom.value = "";
            dateTo.value = "";
            notFunded.value = false;
            costs.value = undefined;
            costsRef.value?.clearInput();
            relations.value = [];
            relationsRef.value?.clearInput();
            persons.value = [];
            personsRef.value?.clearInput();
            organisations.value = [];
            organisationsRef.value?.clearInput();
            status.value = undefined;
            collaborationType.value = undefined;
            researchType.value = undefined;
            error.value = false;
            snackbar.value = true;
        } else {
            router.push({ name: "projectLandingPage", params: { id: response.data.id } });
        }
    }).catch((axiosError: AxiosError<ErrorResponse>) => {
        const message = i18n.t(axiosError.response?.data.message as string);
        errorMessage.value = message !== axiosError.response?.data.message ? message : i18n.t("genericErrorMessage");
        error.value = true;
        snackbar.value = true;
    });
};

defineExpose({ isFormValid, submit: submitProject, submitProject });
</script>
