<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="12">
                <v-row>
                    <v-col>
                        <multilingual-text-input v-model="name" :initial-value="toMultilingualTextInput(presetExpertiseOrSkill?.name, languageTags)" :label="$t('titleLabel') + '*'" :rules="requiredFieldRules"></multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input v-model="description" :initial-value="toMultilingualTextInput(presetExpertiseOrSkill?.description, languageTags)" :label="$t('abstractLabel')" is-area></multilingual-text-input>
                    </v-col>
                </v-row>
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
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import type { ExpertiseOrSkillResponse } from '@/models/PersonModel';
import type { ExpertiseOrSkill } from '@/models/PersonModel';
import { useLanguageTags } from '@/composables/useLanguageTags';


export default defineComponent({
    name: "ExpertiseOrSkillForm",
    components: { MultilingualTextInput },
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

        const saveExpertiseOrSkill = () => {
            const expertiseOrSkill: ExpertiseOrSkill = {
                name: name.value,
                description: description.value,
            };

            if(props.edit) {
                expertiseOrSkill.id = props.presetExpertiseOrSkill?.id;
                emit("update", expertiseOrSkill);
            } else {
                emit("create", expertiseOrSkill);
            }
            
        };

        return {
            isFormValid, toMultilingualTextInput, saveExpertiseOrSkill,
            languageTags, name, requiredFieldRules, description
        };
    }
});
</script>
