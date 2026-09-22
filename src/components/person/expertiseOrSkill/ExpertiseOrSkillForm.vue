<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="12">
                <v-row>
                    <v-col>
                        <multilingual-text-input
                            v-model="name"
                            :initial-value="toMultilingualTextInput(presetExpertiseOrSkill?.name, languageTags)"
                            :label="$t('titleLabel') + '*'"
                            :rules="requiredFieldRules"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input
                            v-model="description"
                            :initial-value="toMultilingualTextInput(presetExpertiseOrSkill?.description, languageTags)"
                            :label="$t('abstractLabel')"
                            is-area
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input
                            v-model="keywords"
                            :initial-value="toMultilingualTextInput(presetExpertiseOrSkill?.keywords, languageTags)"
                            :label="$t('abstractLabel')"
                            is-area
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-checkbox
                            v-model="favorite"
                            :label="$t('favoriteLabel')"
                        />
                    </v-col>
                </v-row>
            </v-col>
        </v-row>

        <div>
            <h2
                class="mt-5!">
                {{ $t("researchAreasLabel") }}
            </h2>
            <v-row>
                <v-col cols="12">
                    <research-areas-selection
                        ref="researchAreasSelectionRef"
                        :research-areas-hierarchy="presetResearchAreas"
                        submit-on-click
                        @update="saveResearchAreas"
                    />
                </v-col>
            </v-row>
        </div>

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
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import type { ExpertiseOrSkillResponse } from '@/models/PersonModel';
import type { ExpertiseOrSkill } from '@/models/PersonModel';
import { useLanguageTags } from '@/composables/useLanguageTags';
import { type ResearchArea } from '@/models/OrganisationUnitModel';
import ResearchAreasSelection from '@/components/core/ResearchAreasSelection.vue';


export default defineComponent({
    name: "ExpertiseOrSkillForm",
    components: { MultilingualTextInput, ResearchAreasSelection },
    props: {
        edit: {
            type: Boolean,
            default: false
        },
        readOnly: {
            type: Boolean,
            default: false
        },
        presetExpertiseOrSkill: {
            type: Object as PropType<ExpertiseOrSkillResponse | undefined>,
            required: true
        }
    },
    emits: ["update", "create"],
    setup(props, { emit }) {
        const isFormValid = ref(false);
        const { languageTags } = useLanguageTags();

        const { requiredFieldRules } = useValidationUtils();

        const name = ref([]);
        const description = ref([]);
        const keywords = ref([]);
        const favorite = ref(props.presetExpertiseOrSkill?.favorite ?? false);

        const presetResearchAreas = ref<ResearchArea[]>(props.presetExpertiseOrSkill?.researchAreas as ResearchArea[]);
        const researchAreaIds = ref<number[]>(props.presetExpertiseOrSkill?.researchAreas?.map(researchArea => researchArea.id) as number[]);

        const saveExpertiseOrSkill = () => {
            const expertiseOrSkill: ExpertiseOrSkill = {
                name: name.value,
                description: description.value,
                keywords: keywords.value,
                favorite: favorite.value,
                researchAreasId: researchAreaIds.value
            };

            if(props.edit) {
                expertiseOrSkill.id = props.presetExpertiseOrSkill?.id;
                emit("update", expertiseOrSkill);
            } else {
                emit("create", expertiseOrSkill);
            }  
        };

        const saveResearchAreas = (newResearchAreaIds: number[]) => {
            researchAreaIds.value = newResearchAreaIds;
        };

        return {
            isFormValid, toMultilingualTextInput, saveExpertiseOrSkill,
            languageTags, name, requiredFieldRules, description,
            keywords, favorite, saveResearchAreas, presetResearchAreas
        };
    }
});
</script>
