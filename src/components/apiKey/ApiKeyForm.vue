<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <multilingual-text-input
                    v-model="name" :rules="requiredFieldRules" :label="$t('nameLabel') + '*'"
                    :initial-value="toMultilingualTextInput(presetApiKey?.name, languageTags)"></multilingual-text-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-select
                    v-model="selectedApiKeyType"
                    :items="apiKeyTypes"
                    :label="$t('apiKeyTypeLabel') + '*'"
                    :rules="requiredMultiSelectionRules"
                    return-object
                    :readonly="presetApiKey !== undefined">
                </v-select>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <date-picker
                    v-model="validUntil"
                    :label="$t('validUntilLabel') + '*'"
                    color="primary"
                    required
                    in-future
                ></date-picker>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-text-field
                    v-model="clientEmail" :readonly="presetApiKey !== undefined" :label="$t('clientEmailLabel') + '*'" :placeholder="$t('clientEmailLabel') + '*'"
                    :rules="emailFieldRules"></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-select
                    v-model="selectedLanguage"
                    :label="$t('clientPreferredLanguageLabel') + '*'"
                    :items="languages"
                    return-object
                ></v-select>
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
import { computed, defineComponent, onMounted, type PropType } from 'vue';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import { ref } from 'vue';
import { type ApiKeyRequest, type ApiKeyResponse, ApiKeyType, type LanguageResponse } from '@/models/Common';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import { useLanguageTags } from '@/composables/useLanguageTags';
import { getApiKeyTypesForGivenLocale, getApiKeyTypeTitleFromValueAutoLocale } from '@/i18n/apiKeyType';
import DatePicker from '../core/DatePicker.vue';
import LanguageService from '@/services/LanguageService';
import { type AxiosResponse } from 'axios';


export default defineComponent({
    name: "ApiKeyForm",
    components: { MultilingualTextInput, DatePicker },
    props: {
        presetApiKey: {
            type: Object as PropType<ApiKeyResponse | undefined>,
            default: undefined
        }
    },
    emits: ["create"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const { languageTags } = useLanguageTags();

        const languages = ref<{ title: string, value: number }[]>([]);
        const selectedLanguage = ref<{ title: string, value: number }>({title: "SR", value: -1});

        onMounted(() => {
            if (props.presetApiKey) {
                selectedApiKeyType.value = {title: getApiKeyTypeTitleFromValueAutoLocale(props.presetApiKey.type) as string, value: props.presetApiKey.type};
            } else {
                populateLanguageData();
            }
        });

        const populateLanguageData = () => {
            LanguageService.getAllLanguages().then((response: AxiosResponse<LanguageResponse[]>) => {
                languages.value.splice(0);
                response.data.forEach((language: LanguageResponse) => {
                    languages.value.push({title: language.languageCode, value: language.id});
                    
                    if (language.languageCode === selectedLanguage.value.title) {
                        selectedLanguage.value.value = language.id;
                    }
                })
            })
        };

        const apiKeyTypes = computed(() => getApiKeyTypesForGivenLocale());
        const selectedApiKeyType = ref<{ title: string, value: ApiKeyType }>({title: getApiKeyTypeTitleFromValueAutoLocale(ApiKeyType.M_SERVICE) as string, value: ApiKeyType.M_SERVICE});

        const name = ref<any>([]);
        const validUntil = ref(props.presetApiKey?.validUntil ? props.presetApiKey.validUntil : undefined);
        const clientEmail = ref(props.presetApiKey?.clientEmail ? props.presetApiKey.clientEmail : "");
        
        const { requiredFieldRules, requiredMultiSelectionRules, emailFieldRules } = useValidationUtils();

        const submit = () => {
            const apiKeyRequest: ApiKeyRequest = {
                name: name.value,
                type: selectedApiKeyType.value.value,
                validUntil: validUntil.value as string,
                clientEmail: clientEmail.value,
                clientPreferredLanguageId: selectedLanguage.value.value
            };

            emit("create", apiKeyRequest);
        };

        return {
            isFormValid, validUntil,
            selectedApiKeyType, emailFieldRules,
            name, apiKeyTypes, clientEmail,
            toMultilingualTextInput,
            languageTags, requiredFieldRules,
            submit, requiredMultiSelectionRules,
            selectedLanguage, languages
        };
    }
});
</script>
