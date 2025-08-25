<template>
    <v-row>
        <v-col :cols="allowManualClearing && selectedAssessmentMeasure.value !== -1 ? 10 : 11">
            <v-autocomplete
                v-model="selectedAssessmentMeasure"
                :readonly="readOnly"
                :label="$t('assessmentMeasureLabel') + (required ? '*' : '')"
                :items="readOnly ? [] : assessmentMeasures"
                :custom-filter="((): boolean => true)"
                :rules="required ? requiredSelectionRules : []"
                :auto-select-first="true"
                :no-data-text="$t('noDataMessage')"
                return-object
                @update:search="searchAssessmentMeasures"
                @update:model-value="sendContentToParent"
            ></v-autocomplete>
        </v-col>
        <v-col cols="1">
            <v-btn v-show="allowManualClearing && selectedAssessmentMeasure.value !== -1" icon @click="clearInput()">
                <v-icon>mdi-delete</v-icon>
            </v-btn>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent, watch, type PropType } from 'vue';
import { ref } from 'vue';
import lodash from "lodash";
import AssessmentMeasureService from '@/services/assessment/AssessmentMeasureService';
import type { AssessmentMeasure } from '@/models/AssessmentModel';
import type { MultilingualContent } from '@/models/Common';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';


export default defineComponent({
    name: "AssessmentMeasureAutocompleteSearch",
    props: {
        required: {
            type: Boolean,
            default: false
        },
        readOnly: {
            type: Boolean,
            default: false
        },
        allowManualClearing: {
            type: Boolean,
            default: false
        },
        modelValue: {
            type: Object as PropType<{ title: string, value: number } | undefined>,
            required: true,
        },
    },
    emits: ["update:modelValue"],
    setup(props, {emit}) {
        const i18n = useI18n();
        const searchPlaceholder = {title: "", value: -1};

        const assessmentMeasures = ref<{ title: string; value: number; date?: string }[]>([]);
        const selectedAssessmentMeasure = ref<{ title: string, value: number }>(searchPlaceholder);

        onMounted(() => {
            if(props.modelValue && props.modelValue.value !== -1) {
                selectedAssessmentMeasure.value = props.modelValue;
            }
            sendContentToParent();
        });
        
        const { requiredSelectionRules } = useValidationUtils();

        const searchAssessmentMeasures = lodash.debounce((input: string) => {
            if (input.includes("|")) {
                return;
            }
            if (input.length >= 3) {
                const params = `searchExpression=${input}&page=0&size=5`;
                AssessmentMeasureService.searchAssessmentMeasures(params).then((response) => {
                    const listOfAssessmentMeasures: { title: string, value: number, date?: string }[] = [];
                    response.data.content.forEach((assessmentMeasure: AssessmentMeasure) => {
                        listOfAssessmentMeasures.push({title: `${returnCurrentLocaleContent(assessmentMeasure.title)} | ${assessmentMeasure.code}`, value: assessmentMeasure.id});
                    })
                    assessmentMeasures.value = listOfAssessmentMeasures;
                });
            }
        }, 300);

        const sendContentToParent = () => {
            emit("update:modelValue", selectedAssessmentMeasure.value);
        };

        watch(() => props.modelValue, () => {
            if(props.modelValue && props.modelValue.value !== -1) {
                selectedAssessmentMeasure.value = props.modelValue;
            }
        });

        const clearInput = () => {
            selectedAssessmentMeasure.value = searchPlaceholder;
            sendContentToParent();
        };

        const selectNewlyAddedAssessmentMeasure = (assessmentMeasure: AssessmentMeasure) => {
            let title: string | undefined;
            assessmentMeasure.title.forEach((multilingualContent: MultilingualContent) => {
                if(multilingualContent.languageTag === i18n.locale.value.toUpperCase()) {
                    title = multilingualContent.content;
                    return;
                }
            });

            if (!title && assessmentMeasure.title.length > 0) {
                title = assessmentMeasure.title[0].content;
            }
            
            const toSelect = {title: `${title} | ${assessmentMeasure.code}`, value: assessmentMeasure.id as number};
            assessmentMeasures.value.push(toSelect);
            selectedAssessmentMeasure.value = toSelect;
            sendContentToParent();
        };

        return {
            assessmentMeasures, selectedAssessmentMeasure, searchAssessmentMeasures,
            requiredSelectionRules,
            sendContentToParent, clearInput,
            selectNewlyAddedAssessmentMeasure
        };
    }
});
</script>
