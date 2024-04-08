<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="12">
                <v-row>
                    <v-col>
                        <multilingual-text-input
                            ref="titleRef" v-model="title" :rules="requiredFieldRules" :label="$t('titleLabel') + '*'"
                            :initial-value="toMultilingualTextInput(presetPublicationSeries?.title, languageTags)"></multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input ref="abbreviationsRef" v-model="nameAbbreviations" :label="$t('nameAbbreviationLabel')" :initial-value="toMultilingualTextInput(presetPublicationSeries?.nameAbbreviation, languageTags)"></multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="6">
                        <v-text-field v-model="eIssn" label="E-ISSN" placeholder="E-ISSN"></v-text-field>
                    </v-col>
                    <v-col cols="6">
                        <v-text-field v-model="printIssn" label="Print ISSN" placeholder="Print ISSN"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-select
                            v-model="selectedLanguages"
                            :label="$t('languageLabel')"
                            :items="languageList"
                            multiple
                        ></v-select>
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
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import { ref } from 'vue';
import type { LanguageTagResponse } from '@/models/Common';
import { onMounted } from 'vue';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { toMultilingualTextInput } from '@/i18n/TranslationUtil';
import type { PublicationSeries } from '@/models/PublicationSeriesModel';

export default defineComponent({
    name: "PublicationSeriesUpdateForm",
    components: {MultilingualTextInput},
    props: {
        presetPublicationSeries: {
            type: Object as PropType<PublicationSeries | undefined>,
            required: true
        },
        inputType: {
            type: String,
            required: true
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const languageList = ref<{title: string, value: number}[]>([]);
        const selectedLanguages = ref<number[]>(props.presetPublicationSeries?.languageTagIds as number[]);

        const languageTags = ref<LanguageTagResponse[]>([]);

        onMounted(() => {
            LanguageService.getAllLanguageTags().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                languageTags.value = response.data;
                
                response.data.forEach((languageTag: LanguageTagResponse) => {
                    languageList.value.push({title: `${languageTag.display} (${languageTag.languageCode})`, value: languageTag.id});
                })
            });
        });

        const titleRef = ref<typeof MultilingualTextInput>();
        const abbreviationsRef = ref<typeof MultilingualTextInput>();

        const title = ref([]);
        const nameAbbreviations = ref([]);
        const eIssn = ref(props.presetPublicationSeries?.eissn);
        const printIssn = ref(props.presetPublicationSeries?.printISSN);

        const { requiredFieldRules } = useValidationUtils();

        const updatePublicationSeries = () => {
            const updatedPublicationSeries: PublicationSeries = {
                title: title.value,
                eissn: eIssn.value as string,
                printISSN: printIssn.value,
                languageTagIds: selectedLanguages.value,
                nameAbbreviation: nameAbbreviations.value,
                contributions: []
            };

            emit("update", updatedPublicationSeries);
        };

        return {
            isFormValid,
            titleRef, abbreviationsRef,
            title, nameAbbreviations,
            eIssn, printIssn,
            requiredFieldRules,
            updatePublicationSeries,
            languageList, languageTags,
            selectedLanguages,
            toMultilingualTextInput
        };
    }
});
</script>
