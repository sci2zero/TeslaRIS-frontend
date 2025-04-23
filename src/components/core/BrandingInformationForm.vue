<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="titleRef" v-model="title" :rules="requiredFieldRules" :label="$t('titleLabel') + '*'"
                    :initial-value="toMultilingualTextInput(presetInformation?.title, languageTags)"></multilingual-text-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="descriptionRef" v-model="description" :rules="requiredFieldRules" :label="$t('descriptionLabel') + '*'"
                    :initial-value="toMultilingualTextInput(presetInformation?.description, languageTags)" is-area></multilingual-text-input>
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
import { type BrandingInformation } from '@/models/Common';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import { useLanguageTags } from '@/composables/useLanguageTags';


export default defineComponent({
    name: "AssessmentMeasureForm",
    components: {MultilingualTextInput},
    props: {
        presetInformation: {
            type: Object as PropType<BrandingInformation | undefined>,
            default: undefined
        }
    },
    emits: ["update"],
    setup(_, { emit }) {
        const isFormValid = ref(false);

        const { languageTags } = useLanguageTags();

        const titleRef = ref<typeof MultilingualTextInput>();
        const descriptionRef = ref<typeof MultilingualTextInput>();

        const title = ref<any>([]);
        const description = ref<any>([]);

        const { requiredFieldRules } = useValidationUtils();

        const submit = () => {
            const brandingInformation: BrandingInformation = {
                title: title.value,
                description: description.value
            };

            emit("update", brandingInformation);
        };

        return {
            isFormValid, title, titleRef,
            description, descriptionRef,
            toMultilingualTextInput,
            requiredFieldRules,
            languageTags, submit
        };
    }
});
</script>
