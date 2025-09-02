<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="nameRef" v-model="name" :rules="requiredFieldRules" :label="$t('nameLabel') + '*'"
                    :initial-value="toMultilingualTextInput(presetResearchArea?.name, languageTags)">
                </multilingual-text-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="descriptionRef"
                    v-model="description"
                    :label="$t('descriptionLabel')"
                    :initial-value="toMultilingualTextInput(presetResearchArea?.description, languageTags)"
                    is-rich is-area>
                </multilingual-text-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <research-area-autocomplete-search
                    v-model="selectedResearchArea"
                    :label="$t('superResearchAreaLabel')"
                    allow-manual-clearing
                />
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
import type { ResearchAreaResponse, ResearchAreaRequest } from '@/models/Common';
import { onMounted } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import ResearchAreaAutocompleteSearch from './ResearchAreaAutocompleteSearch.vue';
import { useLanguageTags } from '@/composables/useLanguageTags';


export default defineComponent({
    name: "ResearchAreaForm",
    components: { MultilingualTextInput, ResearchAreaAutocompleteSearch },
    props: {
        presetResearchArea: {
            type: Object as PropType<ResearchAreaResponse | undefined>,
            default: undefined
        }
    },
    emits: ["create"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const { languageTags } = useLanguageTags();

        onMounted(() => {
            setDetails();
        });

        const setDetails = () => {
            if(props.presetResearchArea?.superResearchAreaId) {
                selectedResearchArea.value = {title: returnCurrentLocaleContent(props.presetResearchArea.superResearchAreaName) as string, value: props.presetResearchArea.superResearchAreaId};
            }
        };

        const nameRef = ref<typeof MultilingualTextInput>();
        const descriptionRef = ref<typeof MultilingualTextInput>();

        const name = ref<any>([]);
        const description = ref<any>([]);

        const searchPlaceholder = {title: "", value: -1};
        const selectedResearchArea = ref<{ title: string, value: number }>(searchPlaceholder);

        const { requiredFieldRules } = useValidationUtils();

        const submit = () => {
            const researchArea: ResearchAreaRequest = {
                name: name.value,
                description: description.value,
                superResearchAreaId: selectedResearchArea.value.value > 0 ? selectedResearchArea.value.value : undefined
            };

            emit("create", researchArea);
        };

        return {
            isFormValid,
            name, description,
            nameRef, descriptionRef,
            toMultilingualTextInput,
            languageTags, requiredFieldRules,
            selectedResearchArea, submit
        };
    }
});
</script>