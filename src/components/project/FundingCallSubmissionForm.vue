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

                <!-- Funding Types* -->
                <v-row>
                    <v-col cols="10">
                        <v-select
                            v-model="selectedFundingTypes"
                            :items="fundingTypeOptions"
                            item-title="title"
                            item-value="value"
                            :label="$t('fundingTypesLabel') + '*'"
                            :rules="requiredMultiSelectionRules"
                            multiple
                            chips
                            closable-chips
                        />
                    </v-col>
                </v-row>

                <!-- Start Date / End Date -->
                <v-row>
                    <v-col cols="5">
                        <date-picker
                            v-model="dateFrom"
                            :label="$t('dateFromLabel')"
                            color="primary"
                        />
                    </v-col>
                    <v-col cols="5">
                        <date-picker
                            v-model="dateTo"
                            :label="$t('dateToLabel')"
                            color="primary"
                        />
                    </v-col>
                </v-row>

                <!-- Funder -->
                <v-row>
                    <v-col cols="10">
                        <organisation-unit-autocomplete-search
                            v-model:model-value="selectedFunder"
                            :label="$t('funderLabel')"
                            allow-manual-clearing
                        />
                    </v-col>
                </v-row>

                <!-- Funding Program -->
                <v-row v-if="!presetFundingProgramId">
                    <v-col cols="10">
                        <funding-program-autocomplete-search v-model="selectedFundingProgram" />
                    </v-col>
                </v-row>

                <!-- Monetary Amount -->
                <monetary-amount-input
                    ref="monetaryAmountRef"
                    @update:model-value="monetaryAmount = $event"
                />

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

                    <!-- Objectives -->
                    <v-row>
                        <v-col>
                            <multilingual-text-input
                                ref="objectivesRef"
                                v-model="objectives"
                                is-area
                                :label="$t('objectivesLabel')"
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
                                :initial-value="toMultilingualTextInput(presetKeywords, languageTags)"
                            />
                        </v-col>
                    </v-row>

                    <!-- URIs -->
                    <v-row>
                        <v-col>
                            <uri-input ref="urisRef" v-model="uris" />
                        </v-col>
                    </v-row>

                    <!-- OA mandated -->
                    <v-row>
                        <v-col cols="4">
                            <v-checkbox v-model="oaMandated" :label="$t('oaMandatedLabel')" />
                        </v-col>
                    </v-row>

                    <!-- OA Mandate URL -->
                    <v-row v-if="oaMandated">
                        <v-col cols="10">
                            <v-text-field
                                v-model="oaMandateUrl"
                                :label="$t('oaMandateUrlLabel')"
                                :placeholder="$t('oaMandateUrlLabel')"
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
import OrganisationUnitAutocompleteSearch from '@/components/organisationUnit/OrganisationUnitAutocompleteSearch.vue';
import FundingProgramAutocompleteSearch from '@/components/project/FundingProgramAutocompleteSearch.vue';
import Toast from '@/components/core/Toast.vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import FundingCallService from '@/services/project/FundingCallService';
import { getFundingTypesForGivenLocale } from '@/i18n/fundingType';
import type { AxiosError } from 'axios';
import type { ErrorResponse, MonetaryAmount } from '@/models/Common';
import type { FundingCall } from '@/models/FundingCallModel';
import type { MultilingualContent } from '@/models/Common';
import { FundingType } from '@/models/FundingModel';
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import { useLanguageTags } from '@/composables/useLanguageTags';

const props = withDefaults(defineProps<{
    presetFundingProgramId?: number;
    presetKeywords?: MultilingualContent[];
    presetDateFrom?: string;
    presetDateTo?: string;
}>(), {
    presetFundingProgramId: undefined,
    presetKeywords: () => [],
    presetDateFrom: "",
    presetDateTo: ""
});

const emit = defineEmits<{
  (e: "create", payload: any): void;
}>();

const { languageTags } = useLanguageTags();

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
const objectivesRef = ref<InstanceType<typeof MultilingualTextInput>>();
const keywordsRef = ref<InstanceType<typeof MultilingualTextInput>>();
const urisRef = ref<InstanceType<typeof UriInput>>();
const monetaryAmountRef = ref<InstanceType<typeof MonetaryAmountInput>>();

const name = ref<any[]>([]);
const nameAbbreviation = ref<any[]>([]);
const description = ref<any[]>([]);
const objectives = ref<any[]>([]);
const keywords = ref<any[]>(props.presetKeywords);
const uris = ref<string[]>([]);
const dateFrom = ref(props.presetDateFrom);
const dateTo = ref(props.presetDateTo);
const oaMandated = ref(false);
const oaMandateUrl = ref("");
const selectedFundingProgram = ref<{ title: string, value: number }>({ title: "", value: -1 });
const monetaryAmount = ref<MonetaryAmount | undefined>(undefined);
const selectedFundingTypes = ref<FundingType[]>([]);
const selectedFunder = ref<{ title: string, value: number }>({ title: "", value: -1 });

const fundingTypeOptions = computed(() => getFundingTypesForGivenLocale());

const { requiredFieldRules } = useValidationUtils();

const requiredMultiSelectionRules = [(v: any[]) => v.length > 0 || i18n.t("requiredFieldMessage")];

const submitFundingCall = (stayOnPage: boolean) => {
    const newFundingCall: FundingCall = {
        name: name.value,
        nameAbbreviation: nameAbbreviation.value,
        description: description.value,
        objectives: objectives.value,
        keywords: keywords.value,
        uris: uris.value,
        researchAreasId: [],
        researchAreas: [],
        fundingTypes: selectedFundingTypes.value,
        dateFrom: dateFrom.value || undefined,
        dateTo: dateTo.value || undefined,
        funderId: selectedFunder.value.value > 0 ? selectedFunder.value.value : undefined,
        fundingProgramId: props.presetFundingProgramId ?? (selectedFundingProgram.value.value > 0 ? selectedFundingProgram.value.value : undefined),
        fundingProgramName: [],
        monetaryAmount: monetaryAmount.value,
        oaMandated: oaMandated.value,
        oaMandateUrl: oaMandateUrl.value || undefined,
        contributors: [],
        fileItems: [],
    };

    FundingCallService.createFundingCall(newFundingCall).then((response) => {
        emit("create", response.data);

        if (stayOnPage) {
            nameRef.value?.clearInput();
            nameAbbreviationRef.value?.clearInput();
            descriptionRef.value?.clearInput();
            objectivesRef.value?.clearInput();
            keywordsRef.value?.clearInput();
            keywords.value = props.presetKeywords;
            urisRef.value?.clearInput();
            dateFrom.value = props.presetDateFrom;
            dateTo.value = props.presetDateTo;
            oaMandated.value = false;
            oaMandateUrl.value = "";
            selectedFundingProgram.value = { title: "", value: -1 };
            monetaryAmountRef.value?.clearInput();
            selectedFundingTypes.value = [];
            selectedFunder.value = { title: "", value: -1 };
            error.value = false;
            snackbar.value = true;
        } else {
            router.push({ name: "fundingCallLandingPage", params: { id: response.data.id } });
        }
    }).catch((axiosError: AxiosError<ErrorResponse>) => {
        const message = i18n.t(axiosError.response?.data.message as string);
        errorMessage.value = message !== axiosError.response?.data.message ? message : i18n.t("genericErrorMessage");
        error.value = true;
        snackbar.value = true;
    });
};

defineExpose({ isFormValid, submit: submitFundingCall, submitFundingCall });
</script>
