<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <v-select
                    v-model="selectedResultCalculationMethod"
                    :items="resultCalculationMethods"
                    :label="$t('classificationsLabel') + '*'"
                    :rules="requiredSelectionRules"
                    return-object>
                </v-select>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <commission-autocomplete-search v-model="selectedCommissions" required multiple></commission-autocomplete-search>
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
import { defineComponent, watch, type PropType } from 'vue';
import { ref } from 'vue';
import { onMounted } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import { type CommissionRelationResponse, ResultCalculationMethod, type CommissionRelation } from '@/models/AssessmentModel';
import CommissionAutocompleteSearch from '../commission/CommissionAutocompleteSearch.vue';
import { getResultCalculationMethodsForGivenLocale, getResultCalculationMethodTitleFromValueAutoLocale } from '@/i18n/resultCalculationMethod';


export default defineComponent({
    name: "CommissionRelationForm",
    components: { CommissionAutocompleteSearch },
    props: {
        presetRelation: {
            type: Object as PropType<CommissionRelationResponse | undefined>,
            default: undefined
        },
        sourceCommissionId: {
            type: Number,
            required: true
        },
        priority: {
            type: Number,
            required: true
        }
    },
    emits: ["create"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        onMounted(() => {
            populateFields();
        });

        watch(() => props.presetRelation, () => {
            populateFields();
        });

        const populateFields= () => {
            if (props.presetRelation) {
                selectedCommissions.value.splice(0);
                props.presetRelation.targetCommissions.forEach(commission => {
                    selectedCommissions.value.push({ title: returnCurrentLocaleContent(commission.description) as string, value: commission.id });
                });

                selectedResultCalculationMethod.value = { title: getResultCalculationMethodTitleFromValueAutoLocale(props.presetRelation.resultCalculationMethod) as string, value: props.presetRelation.resultCalculationMethod };
            }
        };

        const selectedCommissions = ref<{ title: string, value: number }[]>([]);

        const resultCalculationMethods = getResultCalculationMethodsForGivenLocale();
        const selectedResultCalculationMethod = ref<{ title: string, value: ResultCalculationMethod }>({ title: getResultCalculationMethodTitleFromValueAutoLocale(ResultCalculationMethod.BEST_VALUE) as string, value: ResultCalculationMethod.BEST_VALUE });

        const { requiredSelectionRules, requiredNumericFieldRules } = useValidationUtils();

        const submit = () => {
            const commissionRelation: CommissionRelation = {
                sourceCommissionId: props.sourceCommissionId,
                resultCalculationMethod: selectedResultCalculationMethod.value.value,
                targetCommissionIds: selectedCommissions.value.map(commission => commission.value),
                priority: props.priority
            };

            emit("create", commissionRelation);
        };

        return {
            isFormValid, submit,
            requiredSelectionRules,
            requiredNumericFieldRules,
            selectedCommissions,
            resultCalculationMethods,
            selectedResultCalculationMethod
        };
    }
});
</script>
