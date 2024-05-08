<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="12">
                <v-row>
                    <v-col>
                        <multilingual-text-input v-model="title" :initial-value="toMultilingualTextInput(presetPrize?.title, languageList)" :label="$t('titleLabel') + '*'" :rules="requiredFieldRules"></multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input v-model="description" :initial-value="toMultilingualTextInput(presetPrize?.description, languageList)" :label="$t('descriptionLabel')" is-area></multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-text-field v-model="dateOfAcquisition" type="date" :label="$t('dateOfAcquisitionLabel')"></v-text-field>
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
import type { PrizeResponse } from '@/models/PersonModel';
import type { Prize } from '@/models/PersonModel';


export default defineComponent({
    name: "PrizeForm",
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
        presetPrize: {
            type: Object as PropType<PrizeResponse | undefined>,
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

        const dateOfAcquisition = ref(props.presetPrize?.date);
        const title = ref([]);
        const description = ref([]);

        const savePrize = () => {
            const prize: Prize = {
                title: title.value,
                description: description.value,
                date: dateOfAcquisition.value as string
            };

            if(props.edit) {
                prize.id = props.presetPrize?.id;
                emit("update", prize);
            } else {
                emit("create", prize);
            }
            
        };

        return {
            isFormValid, toMultilingualTextInput, savePrize,
            languageList, title, requiredFieldRules,
            dateOfAcquisition, description
        };
    }
});
</script>
