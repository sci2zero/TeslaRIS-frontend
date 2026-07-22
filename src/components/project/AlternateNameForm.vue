<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <multilingual-text-input
                    v-model="name"
                    :rules="requiredFieldRules"
                    :label="$t('nameLabel') + '*'"
                    :initial-value="toMultilingualTextInput(presetName, languageTags)"
                    is-area />
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input
                    v-model="nameAbbreviation"
                    :label="$t('nameAbbreviationLabel')"
                    :initial-value="toMultilingualTextInput(presetNameAbbreviation, languageTags)"
                    is-area />
            </v-col>
        </v-row>

        <v-row>
            <p class="required-fields-message">
                {{ $t("requiredFieldsMessage") }}
            </p>
        </v-row>
    </v-form>
</template>

<script setup lang="ts">
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import { ref } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import { useLanguageTags } from '@/composables/useLanguageTags';
import type { MultilingualContent } from '@/models/Common';

const props = defineProps<{
    presetName: MultilingualContent[];
    presetNameAbbreviation: MultilingualContent[];
}>();

const emit = defineEmits<{
    (e: "create", payload: { name: MultilingualContent[]; nameAbbreviation: MultilingualContent[] }): void;
}>();

const isFormValid = ref(false);

const { languageTags } = useLanguageTags();

const name = ref<MultilingualContent[]>([]);
const nameAbbreviation = ref<MultilingualContent[]>([]);

const { requiredFieldRules } = useValidationUtils();

const submit = () => {
    emit("create", {
        name: name.value,
        nameAbbreviation: nameAbbreviation.value
    });
};

defineExpose({
    submit,
    isFormValid
});
</script>