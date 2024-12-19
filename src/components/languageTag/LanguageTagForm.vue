<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <v-text-field v-model="display" :label="$t('displayLabel') + '*'" :placeholder="$t('displayLabel') + '*'" :rules="requiredFieldRules"></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-text-field v-model="code" :label="$t('codeLabel') + '*'" :placeholder="$t('codeLabel') + '*'" :rules="requiredFieldRules"></v-text-field>
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
import type { LanguageTagResponse } from '@/models/Common';
import { useValidationUtils } from '@/utils/ValidationUtils';
import type { LanguageTag } from '@/models/Common';


export default defineComponent({
    name: "LanguageTagForm",
    props: {
        presetLanguageTag: {
            type: Object as PropType<LanguageTagResponse | undefined>,
            default: undefined
        }
    },
    emits: ["create"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const display = ref<string>(props.presetLanguageTag ? props.presetLanguageTag.display as string : "");
        const code = ref<string>(props.presetLanguageTag ? props.presetLanguageTag.languageCode as string : "");

        const { requiredFieldRules } = useValidationUtils();

        const submit = () => {
            const languageTag: LanguageTag = {
                languageCode: code.value,
                display: display.value
            };

            emit("create", languageTag);
        };

        return {
            isFormValid,
            requiredFieldRules,
            code, display, submit
        };
    }
});
</script>
