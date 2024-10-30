<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="nameRef" v-model="name" :rules="requiredFieldRules" :label="$t('nameLabel') + '*'"
                    :initial-value="toMultilingualTextInput(presetCountry?.name, languageTags)"></multilingual-text-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-text-field v-model="code" :label="$t('countryCodeLabel') + '*'" :placeholder="$t('countryCodeLabel') + '*'" :rules="requiredFieldRules"></v-text-field>
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
import type { LanguageTagResponse } from '@/models/Common';
import { onMounted } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';
import type { Country } from '@/models/Common';


export default defineComponent({
    name: "CountryForm",
    components: {MultilingualTextInput},
    props: {
        presetCountry: {
            type: Object as PropType<Country | undefined>,
            default: undefined
        }
    },
    emits: ["create"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const languageTags = ref<LanguageTagResponse[]>([]);

        onMounted(() => {
            LanguageService.getAllLanguageTags().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                languageTags.value = response.data;
            });
        });

        const nameRef = ref<typeof MultilingualTextInput>();
        const descriptionRef = ref<typeof MultilingualTextInput>();

        const name = ref<any>([]);
        const description = ref<any>([]);
        const code = ref<string>(props.presetCountry ? props.presetCountry.code as string : "");

        const { requiredFieldRules } = useValidationUtils();

        const submit = () => {
            const country: Country = {
                code: code.value,
                name: name.value
            };

            emit("create", country);
        };

        return {
            isFormValid,
            name, description,
            nameRef, descriptionRef,
            toMultilingualTextInput,
            languageTags, requiredFieldRules,
            code, submit
        };
    }
});
</script>