<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <v-btn-toggle
                    v-model="inputType"
                    color="deep-purple-accent-3"
                    rounded="0"
                    group>
                    <v-btn value="text">
                        Text
                    </v-btn>

                    <v-btn value="number">
                        Number
                    </v-btn>

                    <v-btn value="bool">
                        Bool
                    </v-btn>
                </v-btn-toggle>
            </v-col>
        </v-row>
        <v-row v-if="inputType === 'bool'">
            <v-col>
                <v-checkbox v-model="booleanValue" :label="$t('valueLabel')" />
            </v-col>
        </v-row>
        <v-row v-if="inputType === 'number'">
            <v-col>
                <v-text-field
                    v-model="numericValue" type="number" :label="$t('valueLabel') + '*'" :placeholder="$t('valueLabel') + '*'"
                    :rules="requiredFieldRules"></v-text-field>
            </v-col>
        </v-row>
        <v-row v-if="inputType === 'text'">
            <v-col>
                <v-text-field v-model="textualValue" :label="$t('valueLabel') + '*'" :placeholder="$t('valueLabel') + '*'" :rules="requiredFieldRules"></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6">
                <date-picker
                    v-model="fromDate"
                    :label="$t('startDateLabel')"
                    color="primary"
                ></date-picker>
            </v-col>
            <v-col cols="6">
                <date-picker
                    v-model="toDate"
                    :label="$t('endDateLabel')"
                    color="primary"
                ></date-picker>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-select
                    v-model="selectedIndicator"
                    :items="applicableIndicators"
                    :label="$t('indicatorLabel') + '*'"
                    :rules="requiredSelectionRules"
                    return-object>
                </v-select>
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
import { ref } from 'vue';
import { ApplicableEntityType } from '@/models/Common';
import { onMounted } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { DocumentIndicator, EntityIndicatorResponse } from '@/models/AssessmentModel';
import IndicatorService from '@/services/assessment/IndicatorService';
import DatePicker from '@/components/core/DatePicker.vue';


export default defineComponent({
    name: "DocumentIndicatorForm",
    components: { DatePicker },
    props: {
        presetDocumentIndicators: {
            type: Object as PropType<EntityIndicatorResponse | undefined>,
            default: undefined
        },
        applicableTypes: {
            type: Array<ApplicableEntityType>,
            required: true
        },
        entityId: {
            type: Number,
            required: true
        }
    },
    emits: ["create"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const inputType = ref<string>("text");

        const applicableIndicators = ref<{title: string, value: number}[]>([]);

        onMounted(() => {
            fetchDetails();
        });

        const fetchDetails = () => {
            if(props.presetDocumentIndicators) {
                selectedIndicator.value = {title: returnCurrentLocaleContent(props.presetDocumentIndicators.indicatorResponse.title) as string, value: props.presetDocumentIndicators.indicatorResponse.id};
            }

            IndicatorService.fetchIndicatorsForApplicableTypes(props.applicableTypes).then(response => {
                applicableIndicators.value.splice(0);
                response.data.forEach(indicator => {
                    applicableIndicators.value.push({title: returnCurrentLocaleContent(indicator.title) as string, value: indicator.id});
                });
            });
        };

        const selectedIndicator = ref<{ title: string, value: number }>();

        const numericValue = ref<number>(props.presetDocumentIndicators?.numericValue as number);
        const booleanValue = ref<boolean>(props.presetDocumentIndicators?.booleanValue as boolean);
        const textualValue = ref<string>(props.presetDocumentIndicators?.textualValue as string);
        const fromDate = ref<string | undefined>(props.presetDocumentIndicators?.fromDate ? props.presetDocumentIndicators.fromDate : undefined);
        const toDate = ref<string | undefined>(props.presetDocumentIndicators?.toDate ? props.presetDocumentIndicators.toDate : undefined);

        const { requiredFieldRules, requiredSelectionRules } = useValidationUtils();

        const submit = () => {
            const documentIndicator: DocumentIndicator = {
                numericValue: numericValue.value,
                booleanValue: booleanValue.value,
                textualValue: textualValue.value,
                fromDate: fromDate.value,
                toDate: toDate.value,
                indicatorId: selectedIndicator.value?.value as number,
                documentId: props.entityId
            };

            emit("create", documentIndicator);
        };

        return {
            isFormValid, inputType,
            numericValue, booleanValue,
            textualValue, fromDate,
            toDate, requiredFieldRules,
            requiredSelectionRules, submit,
            applicableIndicators, selectedIndicator
        };
    }
});
</script>
