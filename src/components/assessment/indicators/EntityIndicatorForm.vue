<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <v-select
                    v-model="selectedIndicator"
                    :items="applicableIndicators"
                    :label="$t('indicatorLabel') + '*'"
                    :rules="requiredSelectionRules"
                    return-object
                    :readonly="presetDocumentIndicator !== undefined">
                </v-select>
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
                <v-btn-toggle
                    v-if="typeSelectionEnebled"
                    v-model="inputType"
                    color="deep-purple-accent-3"
                    rounded="0"
                    group
                    mandatory>
                    <v-btn :value="IndicatorContentType.TEXT">
                        {{ $t("textLabel") }}
                    </v-btn>

                    <v-btn :value="IndicatorContentType.NUMBER">
                        {{ $t("numericLabel") }}
                    </v-btn>

                    <v-btn :value="IndicatorContentType.BOOL">
                        {{ $t("boolLabel") }}
                    </v-btn>
                </v-btn-toggle>
            </v-col>
        </v-row>

        <v-row v-if="selectedIndicator?.value > 0">
            <v-col v-if="inputType === IndicatorContentType.BOOL">
                <v-checkbox v-model="booleanValue" :label="$t('valueLabel')" />
            </v-col>
            <v-col v-if="inputType === IndicatorContentType.NUMBER">
                <v-text-field
                    v-model="numericValue" type="number"
                    :label="$t('valueLabel') + '*'"
                    :placeholder="$t('valueLabel') + '*'"
                    :rules="requiredNumericFieldRules">
                </v-text-field>
            </v-col>
            <v-col v-if="inputType === IndicatorContentType.TEXT">
                <v-text-field
                    v-model="textualValue"
                    :label="$t('valueLabel') + '*'"
                    :placeholder="$t('valueLabel') + '*'"
                    :rules="requiredFieldRules">
                </v-text-field>
            </v-col>
        </v-row>
        <v-row v-if="!presetDocumentIndicator">
            <v-col>
                <v-file-upload
                    v-model="files"
                    :title="$t('dragDropFilesLabel')"
                    density="compact"
                    multiple>
                </v-file-upload>
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
import { ApplicableEntityType } from '@/models/Common';
import { onMounted } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import { IndicatorContentType, type IndicatorResponse, type DocumentIndicator, type EntityIndicatorResponse, type EntityIndicator, type EventIndicator } from '@/models/AssessmentModel';
import IndicatorService from '@/services/assessment/IndicatorService';
import DatePicker from '@/components/core/DatePicker.vue';


export default defineComponent({
    name: "EntityIndicatorForm",
    components: { DatePicker },
    props: {
        presetDocumentIndicator: {
            type: Object as PropType<EntityIndicatorResponse | undefined>,
            default: undefined
        },
        applicableTypes: {
            type: Array<ApplicableEntityType>,
            required: true
        },
        entityId: {
            type: Object as PropType<number | undefined>,
            required: true
        },
        entityType: {
            type: Object as PropType<ApplicableEntityType>,
            required: true
        }
    },
    emits: ["create"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const typeSelectionEnebled = ref(false);

        const inputType = ref<IndicatorContentType>(IndicatorContentType.TEXT);

        const files = ref<File[]>([]);

        const applicableIndicatorsRaw = ref<IndicatorResponse[]>([]);
        const applicableIndicators = ref<{title: string, value: number}[]>([]);

        onMounted(() => {
            fetchDetails();
        });

        const fetchDetails = () => {
            IndicatorService.fetchIndicatorsForApplicableTypes(props.applicableTypes).then(response => {
                applicableIndicators.value.splice(0);
                applicableIndicatorsRaw.value.splice(0);

                response.data.forEach(indicator => {
                    applicableIndicatorsRaw.value.push(indicator);
                    applicableIndicators.value.push({title: returnCurrentLocaleContent(indicator.title) as string, value: indicator.id});
                });

                if(props.presetDocumentIndicator) {
                    selectedIndicator.value = 
                        {
                            title: returnCurrentLocaleContent(props.presetDocumentIndicator.indicatorResponse.title) as string,
                            value: props.presetDocumentIndicator.indicatorResponse.id
                        };
                }
            });
        };

        const selectedIndicator = ref<{ title: string, value: number }>({title: "", value: -1});

        watch(selectedIndicator, () => {
            typeSelectionEnebled.value = false;
            const indicator = applicableIndicatorsRaw.value.find(indicator => indicator.id === selectedIndicator.value?.value);
            
            if (indicator && indicator.contentType !== IndicatorContentType.ANYTHING) {
                inputType.value = indicator.contentType as IndicatorContentType;
            } else {
                typeSelectionEnebled.value = true;
                deduceStartingType();
            }
        });

        const deduceStartingType = () => {
            if (props.presetDocumentIndicator) {
                if (props.presetDocumentIndicator.textualValue) {
                    inputType.value = IndicatorContentType.TEXT;
                } else if (props.presetDocumentIndicator.numericValue !== null) {
                    inputType.value = IndicatorContentType.NUMBER;
                } else {
                    inputType.value = IndicatorContentType.BOOL;
                }
            }
        };

        const numericValue = ref<number>(props.presetDocumentIndicator?.numericValue as number);
        const booleanValue = ref<boolean>(props.presetDocumentIndicator?.booleanValue as boolean);
        const textualValue = ref<string>(props.presetDocumentIndicator?.textualValue as string);
        const fromDate = ref<string | undefined>(props.presetDocumentIndicator?.fromDate ? props.presetDocumentIndicator.fromDate : undefined);
        const toDate = ref<string | undefined>(props.presetDocumentIndicator?.toDate ? props.presetDocumentIndicator.toDate : undefined);

        const { requiredFieldRules, requiredSelectionRules, requiredNumericFieldRules } = useValidationUtils();

        const submit = () => {
            const entityIndicator: EntityIndicator = {
                numericValue: numericValue.value,
                booleanValue: booleanValue.value,
                textualValue: textualValue.value,
                fromDate: fromDate.value,
                toDate: toDate.value,
                indicatorId: selectedIndicator.value?.value as number,
            };

            if (props.entityType === ApplicableEntityType.DOCUMENT) {
                (entityIndicator as DocumentIndicator).documentId = props.entityId as number
            } else if (props.entityType === ApplicableEntityType.EVENT) {
                (entityIndicator as EventIndicator).eventId = props.entityId as number
            }

            emit("create", { indicator: entityIndicator, files: files.value});
        };

        return {
            isFormValid, inputType,
            numericValue, booleanValue,
            textualValue, fromDate,
            toDate, requiredFieldRules,
            requiredSelectionRules, submit,
            applicableIndicators, selectedIndicator,
            IndicatorContentType, typeSelectionEnebled,
            requiredNumericFieldRules, files
        };
    }
});
</script>
