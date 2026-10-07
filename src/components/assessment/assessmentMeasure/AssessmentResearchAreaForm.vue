<template>
    <v-form v-model="formValid" @submit.prevent>
        <template v-if="isAssessmentModuleEnabled">
            <v-row>
                <v-col>
                    <v-select
                        v-model="selectedResearchArea"
                        :items="researchAreas"
                        :label="$t('researchAreaLabel') + (assessmentAreaRequired ? '*' : '')"
                        :rules="assessmentAreaRequired ? requiredStringSelectionRules : []"
                        return-object>
                        <template v-if="showAssessmentAreaHint" #append-inner>
                            <v-icon color="info" icon="mdi-information-outline">
                                <v-tooltip activator="parent" location="bottom" max-width="300">
                                    {{ $t("assessmentResearchAreaNeededForPointsInfo") }}
                                </v-tooltip>
                            </v-icon>
                        </template>
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
        </template>

        <h2 v-show="showResearchAreas">
            {{ isAssessmentModuleEnabled ? $t("selectSubAreasLabel") : $t("researchAreasLabel") }}
        </h2>
        <v-row v-show="showResearchAreas">
            <v-col>
                <research-areas-selection
                    ref="researchAreasSelectionRef"
                    :research-areas-hierarchy="researchAreasHierarchy"
                    submit-on-click
                    @update="saveSubAreas"
                />
            </v-col>
        </v-row>

        <v-row v-if="assessmentAreaRequired">
            <p class="required-fields-message">
                {{ $t("requiredFieldsMessage") }}
            </p>
        </v-row>
    </v-form>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from 'vue';
import { ref } from 'vue';
import { onMounted } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { AssessmentResearchArea } from '@/models/AssessmentModel';
import AssessmentResearchAreaService from '@/services/assessment/AssessmentResearchAreaService';
import { type ResearchArea } from '@/models/OrganisationUnitModel';
import ResearchAreasSelection from '@/components/core/ResearchAreasSelection.vue';
import { useCrisContextInformation } from '@/composables/useCrisContextInformation';


export default defineComponent({
    name: "AssessmentResearchAreaForm",
    components: { ResearchAreasSelection },
    props: {
        personId: {
            type: Number,
            required: true
        },
        presetResearchArea: {
            type: Object as PropType<AssessmentResearchArea | undefined>,
            default: undefined
        },
        researchAreasHierarchy: {
            type: Object as PropType<ResearchArea[] | undefined>,
            required: true
        }
    },
    emits: ["create"],
    setup(props, { emit }) {
        const formValid = ref(false);

        const assessmentResearchAreas = ref<AssessmentResearchArea[]>([]);
        const researchAreas = ref<{title: string, value: string}[]>([]);
        const selectedResearchArea = ref<{title: string, value: string}>({title: "", value: ""});
        const selectedResearchAreaIds = ref<number[]>(
            props.researchAreasHierarchy?.map(researchArea => researchArea.id as number) ?? []
        );

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

        const { isAssessmentModuleEnabled } = useCrisContextInformation();

        // With the module off there is no assessment area to pick, so the hierarchy stands on its
        // own and is always offered. With it on, areas already chosen stay visible even before an
        // assessment area is picked, hiding them would make them look lost.
        const showResearchAreas = computed(() =>
            !isAssessmentModuleEnabled.value || Boolean(selectedResearchArea.value.value) ||
            selectedResearchAreaIds.value.length > 0
        );

        // Insisting on an assessment area would leave someone who only wants to record research
        // areas unable to save at all, so it is only demanded when nothing else was entered.
        const assessmentAreaRequired = computed(() =>
            isAssessmentModuleEnabled.value && selectedResearchAreaIds.value.length === 0
        );

        // Research areas without an assessment area above them are kept, but no points come out of
        // them, which is worth saying where the gap is.
        const showAssessmentAreaHint = computed(() =>
            isAssessmentModuleEnabled.value && !selectedResearchArea.value.value &&
            selectedResearchAreaIds.value.length > 0
        );

        // With the module off nothing in this form is a validatable input, so v-form never reports
        // a verdict and the save button would stay disabled on an empty form model.
        const isFormValid = computed(() => !isAssessmentModuleEnabled.value || formValid.value);

        const submit = () => {
            // Nothing to write on the assessment side without a code: the areas belong to the
            // person, and the assessment copy is kept in step from there.
            if (!isAssessmentModuleEnabled.value || !selectedResearchArea.value.value) {
                emit("create", { researchAreaIds: selectedResearchAreaIds.value });
                return;
            }

            AssessmentResearchAreaService.setPersonAssessmentResearchArea(
                props.personId, selectedResearchArea.value.value,
                selectedResearchAreaIds.value
            ).then(() => {
                emit("create", { researchAreaIds: selectedResearchAreaIds.value });
            });
        };

        const removeResearchArea = () => {
            AssessmentResearchAreaService.deletePersonAssessmentResearchArea(
                props.personId
            ).then(() => {
                emit("create");
            });
        };

        const saveSubAreas = (researchAreaIds: number[]) => {
            selectedResearchAreaIds.value = researchAreaIds;
        };

        return {
            isFormValid, formValid, researchAreas,
            requiredStringSelectionRules,
            selectedResearchArea, submit,
            removeResearchArea, saveSubAreas,
            isAssessmentModuleEnabled, showResearchAreas,
            assessmentAreaRequired, showAssessmentAreaHint
        };
    }
});
</script>
