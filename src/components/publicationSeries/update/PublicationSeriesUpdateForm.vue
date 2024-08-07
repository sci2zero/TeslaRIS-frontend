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
                        <v-text-field v-model="eIssn" label="E-ISSN" placeholder="E-ISSN" :rules="eIssnValidationRules"></v-text-field>
                    </v-col>
                    <v-col cols="6">
                        <v-text-field v-model="printIssn" label="Print ISSN" placeholder="Print ISSN" :rules="printIssnValidationRules"></v-text-field>
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
import type { LanguageTagResponse, MultilingualContent } from '@/models/Common';
import { onMounted } from 'vue';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import type { PublicationSeries } from '@/models/PublicationSeriesModel';
import { watch } from 'vue';

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

        const titleRef = ref<typeof MultilingualTextInput>();
        const abbreviationsRef = ref<typeof MultilingualTextInput>();

        const languageList = ref<{title: string, value: number}[]>([]);
        const selectedLanguages = ref<number[]>(props.presetPublicationSeries?.languageTagIds as number[]);

        const languageTags = ref<LanguageTagResponse[]>([]);

        onMounted(() => {
            LanguageService.getAllLanguageTags().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                languageTags.value = response.data;
                
                response.data.forEach((languageTag: LanguageTagResponse) => {
                    languageList.value.push({title: `${languageTag.display} (${languageTag.languageCode})`, value: languageTag.id});
                });
            });
        });

        watch(() => props.presetPublicationSeries, () => {
            if (props.presetPublicationSeries) {
                refreshForm();
            }
        });

        const title = ref<any[]>([]);
        const nameAbbreviations = ref<any[]>([]);
        const eIssn = ref(props.presetPublicationSeries?.eissn);
        const printIssn = ref(props.presetPublicationSeries?.printISSN);

        const { requiredFieldRules, eIssnValidationRules, printIssnValidationRules } = useValidationUtils();

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

        const refreshForm = () => {
            titleRef.value?.clearInput();
            title.value = props.presetPublicationSeries?.title as MultilingualContent[];

            abbreviationsRef.value?.clearInput();
            nameAbbreviations.value = props.presetPublicationSeries?.nameAbbreviation as MultilingualContent[];

            selectedLanguages.value = props.presetPublicationSeries?.languageTagIds as number[];
            eIssn.value = props.presetPublicationSeries?.eissn;
            printIssn.value = props.presetPublicationSeries?.printISSN;

            titleRef.value?.forceRefreshModelValue(toMultilingualTextInput(title.value, languageTags.value));
            abbreviationsRef.value?.forceRefreshModelValue(toMultilingualTextInput(nameAbbreviations.value, languageTags.value));
        };

        return {
            isFormValid,
            title, nameAbbreviations,
            eIssn, printIssn,
            requiredFieldRules,
            updatePublicationSeries,
            languageList, languageTags,
            selectedLanguages,
            toMultilingualTextInput,
            eIssnValidationRules,
            printIssnValidationRules,
            titleRef, abbreviationsRef,
            refreshForm
        };
    }
});
</script>
