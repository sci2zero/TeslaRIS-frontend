<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="10">
                <v-row>
                    <v-col cols="12">
                        <i-d-f-funding-metadata-prepopulator
                            @metadata-fetched="populateMetadata"
                            @update:doi="(value: string) => doi = value"
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

                <!-- Grant Agreement ID -->
                <v-row>
                    <v-col cols="10">
                        <v-text-field
                            v-model="grantAgreementId"
                            :label="$t('grantAgreementIdLabel')"
                            :placeholder="$t('grantAgreementIdLabel')"
                        />
                    </v-col>
                </v-row>

                <!-- Funding Types -->
                <v-row>
                    <v-col cols="10">
                        <v-select
                            v-model="selectedFundingTypes"
                            :items="fundingTypes"
                            :label="$t('fundingTypesLabel') + '*'"
                            :rules="requiredSelectionRules"
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
                    ref="monetaryAmountRef"
                    v-model="amount"
                    :required="false"
                />

                <!-- Funding Call (text) -->
                <v-row>
                    <v-col cols="10">
                        <!-- TODO: Linked entity autocomplete or plain text -->
                        <v-text-field
                            v-model="fundingCallText"
                            :label="$t('fundingCallLabel')"
                            :placeholder="$t('fundingCallLabel')"
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

                    <!-- Submitted On / Awarded On -->
                    <v-row>
                        <v-col cols="5">
                            <v-text-field
                                v-model="dateSubmitted"
                                :label="$t('dateSubmittedLabel')"
                                type="date"
                            />
                        </v-col>
                        <v-col cols="5">
                            <v-text-field
                                v-model="dateAwarded"
                                :label="$t('dateAwardedLabel')"
                                type="date"
                            />
                        </v-col>
                    </v-row>

                    <!-- Boolean flags -->
                    <v-row>
                        <v-col cols="4">
                            <v-checkbox v-model="competitive" :label="$t('competitiveLabel')" />
                        </v-col>
                        <v-col cols="4">
                            <v-checkbox v-model="renewable" :label="$t('renewableLabel')" />
                        </v-col>
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
import {ref, computed, nextTick} from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import UriInput from '@/components/core/UriInput.vue';
import Toast from '@/components/core/Toast.vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import FundingService from '@/services/project/FundingService';
import { getFundingTypesForGivenLocale } from '@/i18n/fundingType';
import type { AxiosError } from 'axios';
import type { ErrorResponse } from '@/models/Common';
import type {Funding, FundingType, PrepopulatedFundingMetadata} from "@/models/FundingModel";
import MonetaryAmountInput from "@/components/core/MonetaryAmountInput.vue";
import type { MonetaryAmount } from "@/models/Common";
import IDFFundingMetadataPrepopulator from "@/components/project/IDFFundingMetadataPrepopulator.vue";

const props = defineProps({
    presetFundingCallId: {
        type: Number,
        default: undefined
    }
});

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

const name = ref<any[]>([]);
const nameAbbreviation = ref<any[]>([]);
const description = ref<any[]>([]);
const keywords = ref<any[]>([]);
const uris = ref<string[]>([]);
const doi = ref("");
const grantAgreementId = ref("");
const fundingCallText = ref("");
const dateFrom = ref("");
const dateTo = ref("");
const dateSubmitted = ref("");
const dateAwarded = ref("");
const competitive = ref(false);
const renewable = ref(false);
const oaMandated = ref(false);
const oaMandateUrl = ref("");
const amount = ref<MonetaryAmount | undefined>(undefined);
const selectedFundingTypes = ref<{ title: string, value: FundingType }[]>([]);
const displayFunder = ref<any[]>([]);

const monetaryAmountRef = ref<InstanceType<typeof MonetaryAmountInput>>();

const fundingTypes = computed(() => getFundingTypesForGivenLocale());

const {
    requiredFieldRules,
} = useValidationUtils();

const requiredSelectionRules = [(v: any[]) => v.length > 0 || i18n.t("requiredFieldMessage")];


import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import { useLanguageTags } from '@/composables/useLanguageTags';

const { languageTags } = useLanguageTags();

const populateMetadata = async (metadata: PrepopulatedFundingMetadata) => {
    if (name.value.length === 0 && metadata.name.length > 0) {
        name.value = metadata.name;
        nameRef.value?.forceRefreshModelValue(toMultilingualTextInput(name.value, languageTags.value));
    }

    if (nameAbbreviation.value.length === 0 && metadata.nameAbbreviation.length > 0) {
        nameAbbreviation.value = metadata.nameAbbreviation;
        nameAbbreviationRef.value?.forceRefreshModelValue(toMultilingualTextInput(nameAbbreviation.value, languageTags.value));
    }

    doi.value = doi.value ? doi.value : metadata.doi;
    grantAgreementId.value = grantAgreementId.value ? grantAgreementId.value : metadata.grantAgreementId;

    metadata.uris.forEach(uri => {
        if (uri && !uris.value.includes(uri)) {
            uris.value.push(uri);
        }
    });

    dateFrom.value = dateFrom.value ? dateFrom.value : (metadata.dateFrom ?? "");
    dateTo.value = dateTo.value ? dateTo.value : (metadata.dateTo ?? "");
    dateAwarded.value = dateAwarded.value ? dateAwarded.value : (metadata.dateAwarded ?? "");

    if (!amount.value && metadata.monetaryAmount) {
        monetaryAmountRef.value?.setValue(metadata.monetaryAmount);
        amount.value = metadata.monetaryAmount;
    }

    if (description.value.length === 0 && metadata.description.length > 0) {
        additionalFields.value = true;
        await nextTick();

        description.value = metadata.description;
        descriptionRef.value?.forceRefreshModelValue(toMultilingualTextInput(description.value, languageTags.value));
    }

    if (displayFunder.value.length === 0 && metadata.displayFunder.length > 0) {
        displayFunder.value = metadata.displayFunder;
    }
};

const submitFunding = (stayOnPage: boolean) => {
    const newFunding: Funding = {
        name: name.value,
        nameAbbreviation: nameAbbreviation.value,
        description: description.value,
        keywords: keywords.value,
        uris: uris.value,
        doi: doi.value || undefined,
        grantAgreementId: grantAgreementId.value || undefined,
        fundingTypes: selectedFundingTypes.value.map(t => t.value),
        dateFrom: dateFrom.value || undefined,
        dateTo: dateTo.value || undefined,
        dateSubmitted: dateSubmitted.value || undefined,
        dateAwarded: dateAwarded.value || undefined,
        amount: amount.value,
        competitive: competitive.value,
        renewable: renewable.value,
        oaMandated: oaMandated.value,
        oaMandateUrl: oaMandateUrl.value || undefined,
        projectId: 1, // TODO: Project autocomplete
        fundingCallId: props.presetFundingCallId,
        internalIdentifiers: [],
        oldIds: [],
        mergedIds: [],
        agreements: [],
        fundingParts: [],
        researchAreasId: [],
        displayCall: [],
        displayProgram: [],
        displayFunder: [],
    };

    FundingService.createFunding(newFunding).then((response) => {
        emit("create", response.data);

        if (stayOnPage) {
            nameRef.value?.clearInput();
            nameAbbreviationRef.value?.clearInput();
            descriptionRef.value?.clearInput();
            keywordsRef.value?.clearInput();
            urisRef.value?.clearInput();
            doi.value = "";
            grantAgreementId.value = "";
            fundingCallText.value = "";
            dateFrom.value = "";
            dateTo.value = "";
            dateSubmitted.value = "";
            dateAwarded.value = "";
            amount.value = undefined;
            competitive.value = false;
            renewable.value = false;
            oaMandated.value = false;
            oaMandateUrl.value = "";
            selectedFundingTypes.value = [];
            error.value = false;
            snackbar.value = true;
        } else {
            router.push({ name: "fundingLandingPage", params: { id: response.data.id } });
        }
    }).catch((axiosError: AxiosError<ErrorResponse>) => {
        const message = i18n.t(axiosError.response?.data.message as string);
        errorMessage.value = message !== axiosError.response?.data.message ? message : i18n.t("genericErrorMessage");
        error.value = true;
        snackbar.value = true;
    });
};

defineExpose({ isFormValid, submit: submitFunding, submitFunding });
</script>