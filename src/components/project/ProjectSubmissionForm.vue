<template>
    <v-form v-model="isFormValid" class="flex flex-col gap-6" @submit.prevent>
        <form-section
            icon="mdi-folder-star"
            :title="$t('projectLabel')"
        >
            <i-d-f-project-metadata-prepopulator
                @metadata-fetched="populateMetadata"
                @update:doi="(value: string) => doi = value"
            />
            <ui-input
                v-model="raid"
                :label="$t('raidLabel')"
                :placeholder="$t('raidLabel')"
            />
            <multilingual-text-input
                ref="nameRef"
                v-model="name"
                :rules="requiredFieldRules"
                :label="$t('nameLabel') + '*'"
            />
            <multilingual-text-input
                ref="nameAbbreviationRef"
                v-model="nameAbbreviation"
                :label="$t('nameAbbreviationLabel')"
            />
            <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                <ui-input control="select"
                    v-model="status"
                    :label="$t('statusLabel') + '*'"
                    :items="projectStatusOptions"
                    item-title="title"
                    item-value="value"
                    :rules="requiredSelectionValueRules"
                />
                <ui-input control="select"
                    v-model="collaborationType"
                    :label="$t('collaborationTypeLabel') + '*'"
                    :items="projectCollaborationTypeOptions"
                    item-title="title"
                    item-value="value"
                    :rules="requiredSelectionValueRules"
                />
                <ui-input control="select"
                    v-model="researchType"
                    :label="$t('researchTypeLabel') + '*'"
                    :items="projectResearchTypeOptions"
                    item-title="title"
                    item-value="value"
                    :rules="requiredSelectionValueRules"
                />
            </div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <date-picker
                    v-model="dateFrom"
                    :label="$t('dateFromLabel')"
                    color="primary"
                />
                <date-picker
                    v-model="dateTo"
                    :label="$t('dateToLabel')"
                    color="primary"
                />
            </div>
        </form-section>

        <form-section
            icon="mdi-account-multiple-outline"
            :title="$t('teamLabel')"
        >
            <person-project-contribution-form
                ref="personsRef"
                allow-external-associate
                @set-input="persons = $event"
            />
        </form-section>

        <form-section
            icon="mdi-domain"
            :title="$t('consortiumLabel')"
        >
            <organisation-unit-project-contribution-form
                ref="organisationsRef"
                @set-input="organisations = $event"
            />
        </form-section>

        <form-section :title="$t('additionalFieldsLabel')">
            <ui-button variant="outline" type="button" @click="additionalFields = !additionalFields">
                {{ $t("additionalFieldsLabel") }} {{ additionalFields ? "▲" : "▼" }}
            </ui-button>
            <template v-if="additionalFields">
                <multilingual-text-input
                    ref="descriptionRef"
                    v-model="description"
                    is-area
                    :label="$t('descriptionLabel')"
                />
                <multilingual-text-input
                    ref="keywordsRef"
                    v-model="keywords"
                    is-area
                    :label="$t('keywordsLabel')"
                />
                <uri-input ref="urisRef" v-model="uris" />
                <ui-input
                    v-model="nationalId"
                    :label="$t('nationalIdLabel')"
                    :placeholder="$t('nationalIdLabel')"
                    :rules="projectNationalIdValidationRules"
                />
                <choice-cards
                    :model-value="notFunded ? 'none' : 'costs'"
                    :options="[
                        { value: 'costs', title: $t('hasCostsLabel') },
                        { value: 'none', title: $t('noCostsLabel') },
                    ]"
                    @update:model-value="notFunded = $event === 'none'"
                />
                <monetary-amount-input
                    v-if="!notFunded"
                    ref="costsRef"
                    v-model="costs"
                    :amount-label="$t('costsLabel')"
                />
                <p class="text-sm font-semibold text-slate-800">
                    {{ $t("relatedProjectsLabel") }}
                </p>
                <projects-relation-form
                    ref="relationsRef"
                    @set-input="relations = $event"
                />
            </template>
        </form-section>

        <p class="text-sm text-slate-500">
            {{ $t("requiredFieldsMessage") }}
        </p>
    </v-form>

    <toast v-model="snackbar" :message="!error ? $t('savedMessage') : errorMessage" />
</template>

<script setup lang="ts">
import UiInput from '@/components/ui/input/Input.vue';
import ChoiceCards from '@/components/ui/choice-cards/ChoiceCards.vue';
import FormSection from '@/components/ui/form-section/FormSection.vue';
import { UiButton } from '@/components/ui/button';
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
import { FundingType, type Funding, type PrepopulatedFundingMetadata } from '@/models/FundingModel';
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
const nationalId = ref("");
const dateFrom = ref("");
const dateTo = ref("");
const notFunded = ref(false);
const costs = ref<MonetaryAmount | undefined>(undefined);
const relations = ref<ProjectsRelation[]>([]);
const persons = ref<PersonProjectContribution[]>([]);
const organisations = ref<OrganisationUnitProjectContribution[]>([]);
const harvestedFunding = ref<Funding>();

const status = ref<ProjectStatus>();
const collaborationType = ref<ProjectCollaborationType>();
const researchType = ref<ProjectResearchType>();

const projectStatusOptions = computed(() => getProjectStatusesForGivenLocale());
const projectCollaborationTypeOptions = computed(() => getProjectCollaborationTypesForGivenLocale());
const projectResearchTypeOptions = computed(() => getProjectResearchTypesForGivenLocale());

const {
    requiredFieldRules,
    uriValidationRules,
    projectNationalIdValidationRules
} = useValidationUtils();

const { languageTags } = useLanguageTags();

const requiredSelectionValueRules = [(v: any) => (v !== undefined && v !== null) || i18n.t("requiredFieldMessage")];

const buildFundingFromMetadata = (metadata: PrepopulatedFundingMetadata): Funding => {
    const uris: string[] = [];
    metadata.uris.forEach(uri => {
        const sanitizedUri = sanitizeUri(uri);
        if (sanitizedUri && uriValidationRules[0](sanitizedUri) === true && !uris.includes(sanitizedUri)) {
            uris.push(sanitizedUri);
        }
    });

    const invertedRange = !!metadata.dateFrom && !!metadata.dateTo && metadata.dateTo < metadata.dateFrom;

    return {
        name: metadata.name,
        nameAbbreviation: metadata.nameAbbreviation,
        description: metadata.description,
        keywords: metadata.keywords,
        uris: uris,
        doi: metadata.doi || undefined,
        grantAgreementId: metadata.grantAgreementId || undefined,
        fundingTypes: [FundingType.GRANT],
        dateFrom: invertedRange ? undefined : (metadata.dateFrom || undefined),
        dateTo: invertedRange ? undefined : (metadata.dateTo || undefined),
        dateAwarded: metadata.dateAwarded || undefined,
        amount: metadata.monetaryAmount,
        displayCall: metadata.displayCall,
        displayProgram: metadata.displayProgram,
        displayFunder: metadata.displayFunder,
        internalIdentifiers: [],
        oldIds: [],
        mergedIds: [],
        agreements: [],
        fundingParts: [],
        researchAreasId: []
    };
};

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

    if (!harvestedFunding.value && metadata.funding) {
        harvestedFunding.value = buildFundingFromMetadata(metadata.funding);
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
        nationalId: nationalId.value || undefined,
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
        funding: harvestedFunding.value,
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
            nationalId.value = "";
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
            harvestedFunding.value = undefined;
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
