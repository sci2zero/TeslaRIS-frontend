<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="titleRef" v-model="title" :rules="requiredFieldRules" :label="$t('titleLabel') + '*'"
                    :initial-value="toMultilingualTextInput(presetClassification?.title, languageTags)"></multilingual-text-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-text-field v-model="code" :label="$t('codeLabel') + '*'" :placeholder="$t('codeLabel') + '*'" :rules="requiredFieldRules"></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-text-field v-model="formalDescriptionOfRule" :label="$t('classificationRuleLabel') + '*'" :placeholder="$t('classificationRuleLabel') + '*'" :rules="requiredFieldRules"></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-select
                    v-model="selectedApplicableTypes"
                    :items="applicableTypes"
                    :label="$t('applicableTypeLabel') + '*'"
                    :rules="requiredMultiSelectionRules"
                    return-object
                    multiple>
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
import { ApplicableEntityType } from '@/models/Common';
import { onMounted } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import type { AssessmentClassification } from '@/models/AssessmentModel';
import { getApplicableEntityTypesForGivenLocale, getApplicableEntityTypeTitleFromValueAutoLocale } from '@/i18n/applicableEntityType';
import { useLanguageTags } from '@/composables/useLanguageTags';


export default defineComponent({
    name: "ClassificationForm",
    components: {MultilingualTextInput},
    props: {
        presetClassification: {
            type: Object as PropType<AssessmentClassification | undefined>,
            default: undefined
        }
    },
    emits: ["create"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const { languageTags } = useLanguageTags();

        onMounted(() => {
            fetchDetails();
        });

        const fetchDetails = () => {
            if(props.presetClassification) {
                selectedApplicableTypes.value = [];
                props.presetClassification.applicableTypes.forEach(applicableType => {
                    selectedApplicableTypes.value.push({title: getApplicableEntityTypeTitleFromValueAutoLocale(applicableType) as string, value: applicableType});
                });
            }
        };

        const titleRef = ref<typeof MultilingualTextInput>();

        const applicableTypes = getApplicableEntityTypesForGivenLocale();
        const selectedApplicableTypes = ref<{ title: string, value: ApplicableEntityType }[]>([{title: getApplicableEntityTypeTitleFromValueAutoLocale(ApplicableEntityType.ALL) as string, value: ApplicableEntityType.ALL}]);

        const title = ref<any>([]);
        const code = ref<string>(props.presetClassification ? props.presetClassification.code as string : "");
        const formalDescriptionOfRule = ref<string>(props.presetClassification ? props.presetClassification.formalDescriptionOfRule as string : "");

        const { requiredFieldRules, requiredMultiSelectionRules } = useValidationUtils();

        const submit = () => {
            const classification: AssessmentClassification = {
                code: code.value,
                formalDescriptionOfRule: formalDescriptionOfRule.value,
                title: title.value,
                applicableTypes: selectedApplicableTypes.value.map(applicableTypeObject => applicableTypeObject.value),
            };

            emit("create", classification);
        };

        return {
            isFormValid,
            title, titleRef,
            formalDescriptionOfRule,
            toMultilingualTextInput,
            languageTags, requiredFieldRules,
            code, submit, requiredMultiSelectionRules,
            applicableTypes, selectedApplicableTypes
        };
    }
});
</script>
