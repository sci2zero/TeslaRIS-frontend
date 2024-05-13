<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="12">
                <v-row>
                    <v-col>
                        <multilingual-text-input v-model="name" :initial-value="toMultilingualTextInput(presetExpertiseOrSkill?.name, languageList)" :label="$t('titleLabel') + '*'" :rules="requiredFieldRules"></multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input v-model="description" :initial-value="toMultilingualTextInput(presetExpertiseOrSkill?.description, languageList)" :label="$t('descriptionLabel')" is-area></multilingual-text-input>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
        <v-row>
            <p style="margin-left: 20px;">
                {{ $t("requiredFieldsMessage") }}
            </p>
        </v-row>
    </v-form>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { ref } from 'vue';
import type { LanguageTagResponse } from '@/models/Common';
import { onMounted } from 'vue';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';
import { toMultilingualTextInput } from '@/i18n/TranslationUtil';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import type { ExpertiseOrSkillResponse } from '@/models/PersonModel';
import type { ExpertiseOrSkill } from '@/models/PersonModel';


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
        const languageList = ref<LanguageTagResponse[]>([]);

        onMounted(() => {
            LanguageService.getAllLanguageTags().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                languageList.value = response.data;
            });
        });

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
            languageList, name, requiredFieldRules, description
        };
    }
});
</script>
