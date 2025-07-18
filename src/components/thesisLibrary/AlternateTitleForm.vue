<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <multilingual-text-input
                    v-model="title"
                    :rules="requiredFieldRules"
                    :label="$t('titleLabel') + '*'"
                    :initial-value="toMultilingualTextInput(presetTitle, languageTags)"
                    is-area>
                </multilingual-text-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input
                    v-model="alternateTitle"
                    :label="$t('alternateTitleLabel')"
                    :initial-value="toMultilingualTextInput(presetAlternateTitle, languageTags)"
                    is-area>
                </multilingual-text-input>
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
import { defineComponent } from 'vue';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import { ref } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import { useLanguageTags } from '@/composables/useLanguageTags';
import type { MultilingualContent } from '@/models/Common';


export default defineComponent({
    name: "AlternateTitleForm",
    components: { MultilingualTextInput},
    props: {
        presetTitle: {
            type: Array<MultilingualContent>,
            required: true
        },
        presetAlternateTitle: {
            type: Array<MultilingualContent>,
            required: true
        }
    },
    emits: ["create"],
    setup(_, { emit }) {
        const isFormValid = ref(false);

        const { languageTags } = useLanguageTags();

        const title = ref<any>([]);
        const alternateTitle = ref<any>([]);

        const { requiredFieldRules } = useValidationUtils();

        const submit = () => {
            const titleInformation: {title: MultilingualContent[], alternateTitle: MultilingualContent[]} = {
                title: title.value,
                alternateTitle: alternateTitle.value
            };

            emit("create", titleInformation);
        };

        return {
            isFormValid, title, alternateTitle,
            toMultilingualTextInput, submit,
            languageTags, requiredFieldRules
        };
    }
});
</script>
