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
                    :label="$t('scalingRuleLabel') + '*'"
                    :rules="requiredSelectionRules">
                </v-select>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-select
                    v-model="selectedAssessmentClassificationGroup"
                    :items="assessmentClassificationGroups"
                    :label="$t('classificationLabel') + '*'"
                    :rules="requiredSelectionRules">
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
import { AccessLevel } from '@/models/Common';
import { onMounted } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import type { AssessmentMeasure } from '@/models/AssessmentModel';
import { getAccessLevelForGivenLocale, getTitleFromValueAutoLocale } from '@/i18n/accessLevel';
import AssessmentMeasureService from '@/services/assessment/AssessmentMeasureService';
import { useLanguageTags } from '@/composables/useLanguageTags';


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

        const { languageTags } = useLanguageTags();
        const pointRules = ref<string[]>([]);
        const scalingRules = ref<string[]>([]);
        const assessmentClassificationGroups = ref<string[]>([]);

        onMounted(() => {
            AssessmentMeasureService.fetchPointRules().then(response => {
                pointRules.value = response.data;
            });

            AssessmentMeasureService.fetchScalingRules().then(response => {
                scalingRules.value = response.data;
            });

            AssessmentMeasureService.fetchAssessmentGroups().then(response => {
                assessmentClassificationGroups.value = response.data;
            });
        });

        const titleRef = ref<typeof MultilingualTextInput>();

        const accessLevels = getAccessLevelForGivenLocale();
        const selectedAccessLevel = ref<{ title: string, value: AccessLevel }>({title: getTitleFromValueAutoLocale(AccessLevel.OPEN) as string, value: AccessLevel.OPEN});

        const title = ref<any>([]);
        const selectedPointRule = ref<string>(props.presetAssessmentMeasure?.pointRule ? props.presetAssessmentMeasure.pointRule : "");
        const selectedScalingRule = ref<string>(props.presetAssessmentMeasure?.scalingRule ? props.presetAssessmentMeasure.scalingRule : "");
        const selectedAssessmentClassificationGroup = ref<string>(props.presetAssessmentMeasure?.code ? props.presetAssessmentMeasure.code : "");

        const { requiredFieldRules, requiredNumericFieldRules, requiredSelectionRules } = useValidationUtils();

        const submit = () => {
            const assessmentMeasure: AssessmentMeasure = {
                title: title.value,
                pointRule: selectedPointRule.value,
                scalingRule: selectedScalingRule.value,
                code: selectedAssessmentClassificationGroup.value,
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
            assessmentClassificationGroups,
            selectedAssessmentClassificationGroup
        };
    }
});
</script>
