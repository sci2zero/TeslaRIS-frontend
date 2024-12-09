<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row v-if="!isUpdate">
            <v-col>
                <multilingual-text-input
                    ref="descriptionRef" v-model="description" :rules="requiredFieldRules" :label="$t('descriptionLabel') + '*'"
                    :initial-value="toMultilingualTextInput(presetCommission?.description, languageTags)"></multilingual-text-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="5">
                <date-picker
                    v-model="dateFrom"
                    :label="$t('fromLabel') + '*'"
                    color="primary"
                    required
                ></date-picker>
            </v-col>
            <v-col cols="5">
                <date-picker
                    v-model="dateTo"
                    :label="$t('toLabel') + '*'"
                    color="primary"
                    required
                ></date-picker>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-text-field v-model="formalDescriptionOfRule" :label="$t('formalDescriptionOfRuleLabel') + '*'" :placeholder="$t('formalDescriptionOfRuleLabel') + '*'" :rules="requiredFieldRules"></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <commission-autocomplete-search v-model="selectedSuperCommission"></commission-autocomplete-search>
            </v-col>
        </v-row>
        <v-row>
            <p class="required-fields-message">
                {{ $t("requiredFieldsMessage") }}
            </p>
        </v-row>
    </v-form>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import { ref } from 'vue';
import type { MultilingualContent, LanguageTagResponse } from '@/models/Common';
import { onMounted } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';
import type { Commission, CommissionResponse } from '@/models/AssessmentModel';
import DatePicker from '@/components/core/DatePicker.vue';
import CommissionAutocompleteSearch from './CommissionAutocompleteSearch.vue';


export default defineComponent({
    name: "CommissionForm",
    components: { MultilingualTextInput, DatePicker, CommissionAutocompleteSearch },
    props: {
        presetCommission: {
            type: Object as PropType<CommissionResponse | undefined>,
            default: undefined
        },
        isUpdate: {
            type: Boolean,
            default: false
        },
    },
    emits: ["create"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const languageTags = ref<LanguageTagResponse[]>([]);

        onMounted(() => {
            LanguageService.getAllLanguageTags().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                languageTags.value = response.data;
            });

            fetchDetails();
        });

        const fetchDetails = () => {
            if(props.presetCommission && props.presetCommission.superCommissionId) {
                selectedSuperCommission.value = {title: returnCurrentLocaleContent(props.presetCommission.superCommissionDescription) as string, value: props.presetCommission.superCommissionId as number};
            }
        };

        const nameRef = ref<typeof MultilingualTextInput>();
        const descriptionRef = ref<typeof MultilingualTextInput>();

        const searchPlaceholder = {title: "", value: -1};
        const selectedSuperCommission = ref<{ title: string, value: number }>(searchPlaceholder);

        const name = ref<any>([]);
        const description = ref<any>([]);
        const dateFrom = ref(props.presetCommission?.assessmentDateFrom ? props.presetCommission.assessmentDateFrom : undefined);
        const dateTo = ref(props.presetCommission?.assessmentDateTo ? props.presetCommission.assessmentDateTo : undefined);

        const { requiredFieldRules, requiredSelectionRules } = useValidationUtils();

        // TODO: update this to fetch rule methods from backend
        const formalDescriptionOfRule = ref<string>(props.presetCommission ? props.presetCommission.formalDescriptionOfRule as string : "");

        const submit = () => {
            const commission: Commission = {
                description: description.value as MultilingualContent[],
                assessmentDateFrom: dateFrom.value as string,
                assessmentDateTo: dateTo.value as string,
                formalDescriptionOfRule: formalDescriptionOfRule.value,
                superCommissionId: selectedSuperCommission.value.value < 1 ? undefined : selectedSuperCommission.value.value as number,
                documentIdsForAssessment: [],
                personIdsForAssessment: [],
                organisationUnitIdsForAssessment: []
            };

            emit("create", commission);
        };

        return {
            isFormValid,
            name, description,
            nameRef, descriptionRef,
            toMultilingualTextInput,
            languageTags, requiredFieldRules,
            requiredSelectionRules, submit,
            dateFrom, dateTo, selectedSuperCommission,
            formalDescriptionOfRule
        };
    }
});
</script>
