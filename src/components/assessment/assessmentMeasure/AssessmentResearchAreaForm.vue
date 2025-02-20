<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <v-select
                    v-model="selectedResearchArea"
                    :items="researchAreas"
                    :label="$t('researchAreaLabel') + '*'"
                    :rules="requiredStringSelectionRules"
                    return-object>
                </v-select>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-btn
                    density="compact" class="bottom-spacer" :disabled="!selectedResearchArea.value"
                    @click="removeResearchArea">
                    {{ $t("deleteLabel") }}
                </v-btn>
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
import { onMounted } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { AssessmentResearchArea } from '@/models/AssessmentModel';
import AssessmentResearchAreaService from '@/services/assessment/AssessmentResearchAreaService';


export default defineComponent({
    name: "AssessmentResearchAreaForm",
    props: {
        personId: {
            type: Number,
            required: true
        },
        presetResearchArea: {
            type: Object as PropType<AssessmentResearchArea | undefined>,
            default: undefined
        }
    },
    emits: ["create"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const assessmentResearchAreas = ref<AssessmentResearchArea[]>([]);
        const researchAreas = ref<{title: string, value: string}[]>([]);
        const selectedResearchArea = ref<{title: string, value: string}>({title: "", value: ""});

        onMounted(() => {
            AssessmentResearchAreaService.readAssessmentResearchAreas().then(response => {
                assessmentResearchAreas.value = response.data;

                assessmentResearchAreas.value.forEach(researchArea => {
                    researchAreas.value.push({title: returnCurrentLocaleContent(researchArea.name) as string, value: researchArea.code});
                });

                if (props.presetResearchArea) {
                    selectedResearchArea.value = {title: returnCurrentLocaleContent(props.presetResearchArea.name) as string, value: props.presetResearchArea.code};
                }
            });
        });

        const { requiredStringSelectionRules } = useValidationUtils();

        const submit = () => {
            AssessmentResearchAreaService.setPersonAssessmentResearchArea(props.personId, selectedResearchArea.value.value).then(() => {
                emit("create");
            });
        };

        const removeResearchArea = () => {
            AssessmentResearchAreaService.deletePersonAssessmentResearchArea(props.personId).then(() => {
                emit("create");
            });
        };

        return {
            isFormValid,
            researchAreas, submit,
            requiredStringSelectionRules,
            selectedResearchArea,
            removeResearchArea
        };
    }
});
</script>
