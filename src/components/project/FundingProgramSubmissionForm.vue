<template>
    <v-form v-model="isFormValid" class="flex flex-col gap-6" @submit.prevent>
        <form-section
            icon="mdi-file-tree"
            :title="$t('fundingProgramLabel')"
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
            <organisation-unit-autocomplete-search
                ref="funderRef"
                v-model="selectedFunder"
                label="funderLabel"
                required
            />
            <ui-input control="select"
                v-model="selectedFundingTypes"
                :items="fundingTypes"
                :label="$t('fundingTypesLabel') + '*'"
                :rules="requiredMultiSelectionRules"
                multiple
                return-object
            />
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ui-input
                    v-model="dateFrom"
                    :label="$t('dateFromLabel')"
                    type="date"
                />
                <ui-input
                    v-model="dateTo"
                    :label="$t('dateToLabel')"
                    type="date"
                />
            </div>
            <monetary-amount-input
                ref="totalAmountRef"
                v-model="totalAmount"
                :required="false"
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
                />
                <uri-input ref="urisRef" v-model="uris" />
                <div>
                    <div class="mb-2">
                        <b>{{ $t("researchAreasLabel") }}</b>
                    </div>
                    <research-areas-selection
                        ref="researchAreasSelectionRef"
                        :research-areas-hierarchy="[]"
                        submit-on-click
                        @update="researchAreasId = $event"
                    />
                </div>
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
import Toast from '@/components/core/Toast.vue';
import MonetaryAmountInput from '@/components/core/MonetaryAmountInput.vue';
import OrganisationUnitAutocompleteSearch from '@/components/organisationUnit/OrganisationUnitAutocompleteSearch.vue';
import ResearchAreasSelection from '@/components/core/ResearchAreasSelection.vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import FundingProgramService from '@/services/project/FundingProgramService';
import { getFundingTypesForGivenLocale } from '@/i18n/fundingType';
import type { AxiosError } from 'axios';
import type { ErrorResponse, MonetaryAmount } from '@/models/Common';
import type { FundingProgram, FundingType } from '@/models/FundingModel';

const emit = defineEmits<{
  (e: "create", payload: any): void;
}>();

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
const totalAmountRef = ref<InstanceType<typeof MonetaryAmountInput>>();
const funderRef = ref<InstanceType<typeof OrganisationUnitAutocompleteSearch>>();
const researchAreasSelectionRef = ref<InstanceType<typeof ResearchAreasSelection>>();

const name = ref<any[]>([]);
const nameAbbreviation = ref<any[]>([]);
const description = ref<any[]>([]);
const objectives = ref<any[]>([]);
const keywords = ref<any[]>([]);
const uris = ref<string[]>([]);
const dateFrom = ref("");
const dateTo = ref("");
const oaMandated = ref(false);
const oaMandateUrl = ref("");
const totalAmount = ref<MonetaryAmount | undefined>(undefined);
const selectedFundingTypes = ref<{ title: string, value: FundingType }[]>([]);
const selectedFunder = ref<{ title: string, value: number } | undefined>(undefined);
const researchAreasId = ref<number[]>([]);

const fundingTypes = computed(() => getFundingTypesForGivenLocale());

const { requiredFieldRules, requiredMultiSelectionRules } = useValidationUtils();

const submitFundingProgram = (stayOnPage: boolean) => {
    const newFundingProgram: FundingProgram = {
        name: name.value,
        nameAbbreviation: nameAbbreviation.value,
        description: description.value,
        objectives: objectives.value,
        keywords: keywords.value,
        uris: uris.value,
        funderId: selectedFunder.value?.value as number,
        fundingTypes: selectedFundingTypes.value.map(t => t.value),
        dateFrom: dateFrom.value || undefined,
        dateTo: dateTo.value || undefined,
        totalAmount: totalAmount.value,
        oaMandated: oaMandated.value,
        oaMandateUrl: oaMandateUrl.value || undefined,
        researchAreasId: researchAreasId.value,
        fileItems: [],
        researchAreas: [],
        funderName: [],
    };

    FundingProgramService.createFundingProgram(newFundingProgram).then((response) => {
        emit("create", response.data);

        if (stayOnPage) {
            nameRef.value?.clearInput();
            nameAbbreviationRef.value?.clearInput();
            descriptionRef.value?.clearInput();
            objectivesRef.value?.clearInput();
            keywordsRef.value?.clearInput();
            urisRef.value?.clearInput();
            dateFrom.value = "";
            dateTo.value = "";
            totalAmountRef.value?.clearInput();
            totalAmount.value = undefined;
            oaMandated.value = false;
            oaMandateUrl.value = "";
            selectedFundingTypes.value = [];
            funderRef.value?.clearInput();
            selectedFunder.value = { title: "", value: -1 };
            researchAreasSelectionRef.value?.resetForm();
            researchAreasId.value = [];
            error.value = false;
            snackbar.value = true;
        } else {
            router.push({ name: "fundingProgramLandingPage", params: { id: response.data.id } });
        }
    }).catch((axiosError: AxiosError<ErrorResponse>) => {
        const message = i18n.t(axiosError.response?.data.message as string);
        errorMessage.value = message !== axiosError.response?.data.message ? message : i18n.t("genericErrorMessage");
        error.value = true;
        snackbar.value = true;
    });
};

defineExpose({ isFormValid, submit: submitFundingProgram, submitFundingProgram });
</script>
