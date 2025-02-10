<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="titleRef" v-model="title" :rules="requiredFieldRules" :label="$t('titleLabel') + '*'"
                    :initial-value="toMultilingualTextInput(presetAssessmentMeasure?.title, languageTags)"></multilingual-text-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-select
                    v-model="selectedPointRule"
                    :items="pointRules"
                    :label="$t('pointRuleLabel') + '*'"
                    :rules="requiredSelectionRules">
                </v-select>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-select
                    v-model="selectedScalingRule"
                    :items="scalingRules"
                    :label="$t('pointRuleLabel') + '*'"
                    :rules="requiredSelectionRules">
                </v-select>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-select
                    v-model="selectedAssessmentClassification"
                    :items="assessmentClassifications"
                    :label="$t('classificationLabel') + '*'"
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
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import { ref } from 'vue';
import { AccessLevel, ApplicableEntityType, type LanguageTagResponse } from '@/models/Common';
import { onMounted } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';
import type { AssessmentMeasure } from '@/models/AssessmentModel';
import { getAccessLevelForGivenLocale, getTitleFromValueAutoLocale } from '@/i18n/accessLevel';
import AssessmentMeasureService from '@/services/assessment/AssessmentMeasureService';
import AssessmentClassificationService from '@/services/assessment/AssessmentClassificationService';


export default defineComponent({
    name: "AssessmentMeasureForm",
    components: {MultilingualTextInput},
    props: {
        presetAssessmentMeasure: {
            type: Object as PropType<AssessmentMeasure | undefined>,
            default: undefined
        }
    },
    emits: ["create"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const languageTags = ref<LanguageTagResponse[]>([]);
        const pointRules = ref<string[]>([]);
        const scalingRules = ref<string[]>([]);

        const searchPlaceholder = {title: "", value: ""};
        const assessmentClassifications = ref<{ title: string, value: string }[]>([]);
        const selectedAssessmentClassification = ref<{ title: string, value: string }>(searchPlaceholder);

        onMounted(() => {
            LanguageService.getAllLanguageTags().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                languageTags.value = response.data;
            });

            AssessmentMeasureService.fetchPointRules().then(response => {
                pointRules.value = response.data;
            });

            AssessmentMeasureService.fetchScalingRules().then(response => {
                scalingRules.value = response.data;
            });

            AssessmentClassificationService.fetchAllAssessmentClassificationsForApplicableType([ApplicableEntityType.DOCUMENT, ApplicableEntityType.ALL]).then((response) => {
                assessmentClassifications.value.splice(0);
                response.data.forEach((classification) => {
                    assessmentClassifications.value.push({title: returnCurrentLocaleContent(classification.title) as string, value: classification.code});
                });

                if (props.presetAssessmentMeasure?.code) {
                    selectedAssessmentClassification.value = {title: returnCurrentLocaleContent(response.data.find(classification => classification.code === props.presetAssessmentMeasure?.code)?.title) as string, value: props.presetAssessmentMeasure.code}
                }
            });
        });

        const titleRef = ref<typeof MultilingualTextInput>();

        const accessLevels = getAccessLevelForGivenLocale();
        const selectedAccessLevel = ref<{ title: string, value: AccessLevel }>({title: getTitleFromValueAutoLocale(AccessLevel.OPEN) as string, value: AccessLevel.OPEN});

        const title = ref<any>([]);
        const selectedPointRule = ref<string>(props.presetAssessmentMeasure?.pointRule ? props.presetAssessmentMeasure.pointRule : "");
        const selectedScalingRule = ref<string>(props.presetAssessmentMeasure?.scalingRule ? props.presetAssessmentMeasure.scalingRule : "");

        const { requiredFieldRules, requiredNumericFieldRules, requiredSelectionRules } = useValidationUtils();

        const submit = () => {
            const assessmentMeasure: AssessmentMeasure = {
                title: title.value,
                pointRule: selectedPointRule.value,
                scalingRule: selectedScalingRule.value,
                code: selectedAssessmentClassification.value.value,
                assessmentRulebookId: props.presetAssessmentMeasure?.assessmentRulebookId as number
            };

            emit("create", assessmentMeasure);
        };

        return {
            isFormValid, title, titleRef,
            toMultilingualTextInput, pointRules,
            scalingRules, selectedPointRule,
            selectedScalingRule,
            languageTags, selectedAccessLevel,
            requiredFieldRules, submit,
            accessLevels, requiredSelectionRules,
            requiredNumericFieldRules,
            assessmentClassifications,
            selectedAssessmentClassification
        };
    }
});
</script>
