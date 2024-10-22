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
                <v-text-field
                    v-model="value" type="number" :label="$t('valueLabel') + '*'" :placeholder="$t('valueLabel') + '*'"
                    :rules="requiredNumericFieldRules"></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-text-field v-model="code" :label="$t('codeLabel') + '*'" :placeholder="$t('codeLabel') + '*'" :rules="requiredFieldRules"></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-text-field v-model="formalDescriptionOfRule" :label="$t('formalDescriptionOfRuleLabel') + '*'" :placeholder="$t('formalDescriptionOfRuleLabel') + '*'" :rules="requiredFieldRules"></v-text-field>
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
import { AccessLevel, type LanguageTagResponse } from '@/models/Common';
import { onMounted } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';
import type { AssessmentMeasure } from '@/models/AssessmentModel';
import { getAccessLevelForGivenLocale, getTitleFromValueAutoLocale } from '@/i18n/accessLevel';


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

        onMounted(() => {
            LanguageService.getAllLanguageTags().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                languageTags.value = response.data;
            });
        });

        const titleRef = ref<typeof MultilingualTextInput>();

        const accessLevels = getAccessLevelForGivenLocale();
        const selectedAccessLevel = ref<{ title: string, value: AccessLevel }>({title: getTitleFromValueAutoLocale(AccessLevel.OPEN) as string, value: AccessLevel.OPEN});

        const title = ref<any>([]);
        const value = ref<number>(props.presetAssessmentMeasure ? props.presetAssessmentMeasure.value as number : 0);
        const code = ref<string>(props.presetAssessmentMeasure ? props.presetAssessmentMeasure.code as string : "");

        // TODO: update this to fetch rule methods from backend
        const formalDescriptionOfRule = ref<string>(props.presetAssessmentMeasure ? props.presetAssessmentMeasure.formalDescriptionOfRule as string : "");

        const { requiredFieldRules, requiredNumericFieldRules, requiredSelectionRules } = useValidationUtils();

        const submit = () => {
            const assessmentMeasure: AssessmentMeasure = {
                code: code.value,
                title: title.value,
                value: value.value,
                formalDescriptionOfRule: formalDescriptionOfRule.value,
                assessmentRulebookId: props.presetAssessmentMeasure?.assessmentRulebookId as number
            };

            emit("create", assessmentMeasure);
        };

        return {
            isFormValid,
            title, titleRef, formalDescriptionOfRule,
            toMultilingualTextInput, value,
            languageTags, selectedAccessLevel,
            requiredFieldRules, code, submit,
            accessLevels, requiredSelectionRules,
            requiredNumericFieldRules
        };
    }
});
</script>
