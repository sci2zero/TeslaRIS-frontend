<template>
    <v-form v-model="isFormValid" class="flex flex-col gap-6" @submit.prevent>
        <form-section
            icon="mdi-bullhorn"
            :title="$t('fundingCallLabel')"
        >
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
            <ui-input control="select"
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
            <organisation-unit-autocomplete-search
                v-model:model-value="selectedFunder"
                :label="$t('funderLabel')"
                allow-manual-clearing
            />
            <funding-program-autocomplete-search v-if="!presetFundingProgramId" v-model="selectedFundingProgram" />
            <monetary-amount-input
                ref="monetaryAmountRef"
                @update:model-value="monetaryAmount = $event"
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
                    ref="objectivesRef"
                    v-model="objectives"
                    is-area
                    :label="$t('objectivesLabel')"
                />
                <multilingual-text-input
                    ref="keywordsRef"
                    v-model="keywords"
                    is-area
                    :label="$t('keywordsLabel')"
                    :initial-value="toMultilingualTextInput(presetKeywords, languageTags)"
                />
                <uri-input ref="urisRef" v-model="uris" />
                <choice-cards
                    :model-value="oaMandated ? 'yes' : 'no'"
                    :options="[
                        { value: 'no', title: $t('noOaMandateLabel') },
                        { value: 'yes', title: $t('oaMandatedLabel') },
                    ]"
                    @update:model-value="oaMandated = $event === 'yes'"
                />
                <ui-input
                    v-if="oaMandated"
                    v-model="oaMandateUrl"
                    :label="$t('oaMandateUrlLabel')"
                    :placeholder="$t('oaMandateUrlLabel')"
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
