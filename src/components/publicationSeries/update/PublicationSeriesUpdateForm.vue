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
                <v-row>
                    <v-col>
                        <uri-input ref="urisRef" v-model="uris"></uri-input>
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

    <toast v-model="snackbar" :message="message" />
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
import UriInput from '@/components/core/UriInput.vue';
import JournalService from '@/services/JournalService';
import { useI18n } from 'vue-i18n';
import Toast from '@/components/core/Toast.vue';
import BookSeriesService from '@/services/BookSeriesService';


export default defineComponent({
    name: "PublicationSeriesUpdateForm",
    components: { MultilingualTextInput, UriInput, Toast },
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

        const snackbar = ref(false);
        const message = ref("");
        const i18n = useI18n();

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

        const urisRef = ref<typeof UriInput>();

        const title = ref<any[]>([]);
        const nameAbbreviations = ref<any[]>([]);
        const eIssn = ref(props.presetPublicationSeries?.eissn);
        const printIssn = ref(props.presetPublicationSeries?.printISSN);
        const uris = ref<string[]>(props.presetPublicationSeries?.uris as string[]);

        const { requiredFieldRules, eIssnValidationRules, printIssnValidationRules } = useValidationUtils();

        const submit = async () => {
            const publicationSeriesId = props.presetPublicationSeries?.id as number;
            const identifiers = [
                { value: eIssn.value, error: "eissnExistsError" },
                { value: printIssn.value, error: "printIssnExistsError" }
            ].filter(id => id.value);

            const results = await Promise.all(
                identifiers.map(id => {
                    if (props.inputType === "JOURNAL") {
                        return JournalService.checkIdentifierUsage(id.value as string, publicationSeriesId)
                    } else {
                        return BookSeriesService.checkIdentifierUsage(id.value as string, publicationSeriesId)
                    }
                })
            );

            const firstDuplicate = identifiers.find((_, index) => results[index].data);
            if (firstDuplicate) {
                message.value = i18n.t(firstDuplicate.error);
                snackbar.value = true;
                return;
            }

            const updatedPublicationSeries: PublicationSeries = {
                title: title.value,
                eissn: eIssn.value as string,
                printISSN: printIssn.value,
                languageTagIds: selectedLanguages.value,
                nameAbbreviation: nameAbbreviations.value,
                contributions: [],
                uris: uris.value
            };

            emit("update", updatedPublicationSeries);
        };

        const refreshForm = () => {
            titleRef.value?.clearInput();
            title.value = props.presetPublicationSeries?.title as MultilingualContent[];

            abbreviationsRef.value?.clearInput();
            nameAbbreviations.value = props.presetPublicationSeries?.nameAbbreviation as MultilingualContent[];

            uris.value = props.presetPublicationSeries?.uris as string[];
            selectedLanguages.value = props.presetPublicationSeries?.languageTagIds as number[];
            eIssn.value = props.presetPublicationSeries?.eissn;
            printIssn.value = props.presetPublicationSeries?.printISSN;
            urisRef.value?.refreshModelValue(uris.value);

            titleRef.value?.forceRefreshModelValue(toMultilingualTextInput(title.value, languageTags.value));
            abbreviationsRef.value?.forceRefreshModelValue(toMultilingualTextInput(nameAbbreviations.value, languageTags.value));
        };

        return {
            isFormValid,
            title, nameAbbreviations,
            eIssn, printIssn,
            requiredFieldRules,
            languageList, languageTags,
            selectedLanguages,
            toMultilingualTextInput,
            eIssnValidationRules,
            printIssnValidationRules,
            titleRef, abbreviationsRef,
            refreshForm, uris, urisRef,
            submit, snackbar, message
        };
    }
});
</script>
