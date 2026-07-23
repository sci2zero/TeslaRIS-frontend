<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="10">
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

                <!-- DOI / RAiD -->
                <v-row>
                    <v-col cols="6">
                        <v-text-field
                            v-model="doi"
                            label="DOI"
                            placeholder="DOI"
                            :rules="doiValidationRules"
                        />
                    </v-col>
                    <v-col cols="6">
                        <v-text-field
                            v-model="raid"
                            :label="$t('raidLabel')"
                            :placeholder="$t('raidLabel')"
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
                            <v-switch
                                v-model="notFunded"
                                :label="$t('notFundedLabel')"
                                color="primary"
                                hide-details
                            />
                        </v-col>
                    </v-row>

                    <v-row v-if="!notFunded">
                        <v-col>
                            <monetary-amount-input
                                ref="costsRef"
                                v-model="costs"
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
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import UriInput from '@/components/core/UriInput.vue';
import DatePicker from '@/components/core/DatePicker.vue';
import MonetaryAmountInput from '@/components/core/MonetaryAmountInput.vue';
import Toast from '@/components/core/Toast.vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import ProjectService from '@/services/project/ProjectService';
import { ProjectCollaborationType, ProjectResearchType, ProjectStatus, type Project } from '@/models/ProjectModel';
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

const status = ref<ProjectStatus>();
const collaborationType = ref<ProjectCollaborationType>();
const researchType = ref<ProjectResearchType>();

const projectStatusOptions = computed(() => getProjectStatusesForGivenLocale());
const projectCollaborationTypeOptions = computed(() => getProjectCollaborationTypesForGivenLocale());
const projectResearchTypeOptions = computed(() => getProjectResearchTypesForGivenLocale());

const {
    requiredFieldRules,
    doiValidationRules
} = useValidationUtils();

const requiredSelectionValueRules = [(v: any) => (v !== undefined && v !== null) || i18n.t("requiredFieldMessage")];

const submitProject = (stayOnPage: boolean) => {
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
        consortiumIds: [],
        team: [],
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

defineExpose({ isFormValid, submitProject });
</script>
