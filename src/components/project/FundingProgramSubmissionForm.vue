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

                <!-- Funder* -->
                <v-row>
                    <v-col cols="10">
                        <organisation-unit-autocomplete-search
                            ref="funderRef"
                            v-model="selectedFunder"
                            label="funderLabel"
                            required>
                        </organisation-unit-autocomplete-search>
                    </v-col>
                </v-row>

                <!-- Funding Types* -->
                <v-row>
                    <v-col cols="10">
                        <v-select
                            v-model="selectedFundingTypes"
                            :items="fundingTypes"
                            :label="$t('fundingTypesLabel') + '*'"
                            :rules="requiredMultiSelectionRules"
                            multiple
                            return-object
                        />
                    </v-col>
                </v-row>

                <!-- Start Date / End Date -->
                <v-row>
                    <v-col cols="5">
                        <v-text-field
                            v-model="dateFrom"
                            :label="$t('dateFromLabel')"
                            type="date"
                        />
                    </v-col>
                    <v-col cols="5">
                        <v-text-field
                            v-model="dateTo"
                            :label="$t('dateToLabel')"
                            type="date"
                        />
                    </v-col>
                </v-row>

                <!-- Monetary Amount -->
                <monetary-amount-input
                    ref="totalAmountRef"
                    v-model="totalAmount"
                    :required="false"
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
                            />
                        </v-col>
                    </v-row>

                    <!-- URIs -->
                    <v-row>
                        <v-col>
                            <uri-input ref="urisRef" v-model="uris" />
                        </v-col>
                    </v-row>

                    <!-- Research Areas -->
                    <v-row>
                        <v-col>
                            <div class="mb-2">
                                <b>{{ $t("researchAreasLabel") }}</b>
                            </div>
                            <research-areas-selection
                                ref="researchAreasSelectionRef"
                                :research-areas-hierarchy="[]"
                                submit-on-click
                                @update="researchAreasId = $event"
                            />
                        </v-col>
                    </v-row>

                    <!-- OA Mandated -->
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

defineExpose({ isFormValid, submitFundingProgram });
</script>
