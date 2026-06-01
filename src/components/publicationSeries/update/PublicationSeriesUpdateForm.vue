<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="12">
                <v-row>
                    <v-col>
                        <multilingual-text-input
                            ref="titleRef"
                            v-model="title"
                            :rules="requiredFieldRules"
                            :label="$t('titleLabel') + '*'"
                            :initial-value="toMultilingualTextInput(presetPublicationSeries?.title, languageTags)"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input 
                            ref="abbreviationsRef"
                            v-model="nameAbbreviations"
                            :label="$t('nameAbbreviationLabel')"
                            :initial-value="toMultilingualTextInput(presetPublicationSeries?.nameAbbreviation, languageTags)"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input
                            ref="subtitleRef"
                            v-model="subtitle"
                            :label="$t('subtitleLabel')"
                            :initial-value="toMultilingualTextInput(presetPublicationSeries?.subtitle, languageTags)"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="5">
                        <v-text-field 
                            v-model="eIssn" 
                            label="E-ISSN" 
                            placeholder="E-ISSN" 
                            :rules="eIssnValidationRules"
                        />
                    </v-col>
                    
                    <v-col cols="2" class="text-center">
                        <v-btn 
                            icon 
                            class="mx-2"
                            @click="[printIssn, eIssn] = [eIssn, printIssn]"
                        >
                            <v-icon>mdi-swap-horizontal</v-icon>
                        </v-btn>
                    </v-col>
                    
                    <v-col cols="5">
                        <v-text-field 
                            v-model="printIssn" 
                            label="Print ISSN" 
                            placeholder="Print ISSN" 
                            :rules="printIssnValidationRules"
                        />
                    </v-col>
                </v-row>
                <v-row v-if="inputType === 'JOURNAL' || inputType === PublicationSeriesType.JOURNAL.toString()">
                    <v-col>
                        <v-select
                            v-model="selectedArticleCollectionSeriesType"
                            :label="$t('articleCollectionSeriesTypeLabel')"
                            :items="articleCollectionSeriesTypes"
                            return-object
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-text-field
                            v-model="openAlexId"
                            label="Open Alex ID"
                            placeholder="Open Alex ID"
                            :rules="sourceOpenAlexIdValidationRules"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-select
                            v-model="selectedLanguages"
                            :label="$t('languageLabel')"
                            :items="languageList"
                            multiple
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <uri-input ref="urisRef" v-model="uris" />
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
import { computed, defineComponent, type PropType } from 'vue';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import { ref } from 'vue';
import type { LanguageResponse, LanguageTagResponse, MultilingualContent } from '@/models/Common';
import { onMounted } from 'vue';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import { PublicationSeriesType, type PublicationSeries } from '@/models/PublicationSeriesModel';
import { watch } from 'vue';
import UriInput from '@/components/core/UriInput.vue';
import JournalService from '@/services/JournalService';
import { useI18n } from 'vue-i18n';
import Toast from '@/components/core/Toast.vue';
import BookSeriesService from '@/services/BookSeriesService';
import { getArticleCollectionSeriesTypesForGivenLocale, getArticleCollectionSeriesTypeTitleFromValueAutoLocale } from '@/i18n/articleCollectionSeriesType';
import { ArticleCollectionSeriesType, type Journal } from '@/models/JournalModel';


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
        },
        inModal: {
            type: Boolean,
            default: true
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
        const subtitleRef = ref<typeof MultilingualTextInput>();
        const urisRef = ref<typeof UriInput>();

        const languageList = ref<{title: string, value: number}[]>([]);
        const selectedLanguages = ref<number[]>(props.presetPublicationSeries?.languageIds as number[]);

        const articleCollectionSeriesTypes = computed(() => getArticleCollectionSeriesTypesForGivenLocale());
        const selectedArticleCollectionSeriesType = ref<{title: string, value: ArticleCollectionSeriesType}>(
            {
                title: getArticleCollectionSeriesTypeTitleFromValueAutoLocale(
                    (props.inputType === 'JOURNAL' || props.inputType === PublicationSeriesType.JOURNAL.toString()) ? 
                        (props.presetPublicationSeries as Journal).type : ArticleCollectionSeriesType.JOURNAL
                    ) as string,
                value: (props.inputType === 'JOURNAL' || props.inputType === PublicationSeriesType.JOURNAL.toString()) ? 
                    (props.presetPublicationSeries as Journal).type : ArticleCollectionSeriesType.JOURNAL
            }
        );

        const languageTags = ref<LanguageTagResponse[]>([]);

        onMounted(() => {
            LanguageService.getAllLanguages().then((response: AxiosResponse<LanguageResponse[]>) => {
                response.data.forEach((language: LanguageResponse) => {
                    languageList.value.push(
                        {title: `${returnCurrentLocaleContent(language.name)} (${language.languageCode})`, value: language.id}
                    );
                });
            });

            LanguageService.getAllLanguageTags().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                languageTags.value = response.data;
            });
        });

        watch(() => props.presetPublicationSeries, () => {
            if (props.presetPublicationSeries) {
                refreshForm();
            }
        });

        const title = ref<any[]>([]);
        const subtitle = ref<any[]>([]);
        const nameAbbreviations = ref<any[]>([]);
        const eIssn = ref(props.presetPublicationSeries?.eissn);
        const printIssn = ref(props.presetPublicationSeries?.printISSN);
        const openAlexId = ref(props.presetPublicationSeries?.openAlexId);
        const uris = ref<string[]>(props.presetPublicationSeries?.uris as string[]);

        const {
            requiredFieldRules, eIssnValidationRules,
            printIssnValidationRules, sourceOpenAlexIdValidationRules
        } = useValidationUtils();

        const submit = async () => {
            if (props.inModal) {
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
            }

            const updatedPublicationSeries: PublicationSeries = {
                title: title.value,
                eissn: eIssn.value as string,
                printISSN: printIssn.value,
                languageIds: selectedLanguages.value,
                nameAbbreviation: nameAbbreviations.value,
                contributions: [],
                openAlexId: openAlexId.value,
                uris: uris.value,
                subtitle: subtitle.value
            };

            if (props.inputType === 'JOURNAL' || props.inputType === PublicationSeriesType.JOURNAL.toString()) {
                const updatedJournal: Journal = {
                    ...updatedPublicationSeries,
                    type: selectedArticleCollectionSeriesType.value.value
                };

                emit("update", updatedJournal);
            } else {
                emit("update", updatedPublicationSeries);
            }
        };

        const refreshForm = () => {
            titleRef.value?.clearInput();
            title.value = props.presetPublicationSeries?.title as MultilingualContent[];

            subtitleRef.value?.clearInput();
            subtitle.value = props.presetPublicationSeries?.subtitle as MultilingualContent[];

            abbreviationsRef.value?.clearInput();
            nameAbbreviations.value = props.presetPublicationSeries?.nameAbbreviation as MultilingualContent[];

            uris.value = props.presetPublicationSeries?.uris as string[];
            selectedLanguages.value = props.presetPublicationSeries?.languageIds as number[];
            eIssn.value = props.presetPublicationSeries?.eissn;
            printIssn.value = props.presetPublicationSeries?.printISSN;
            openAlexId.value = props.presetPublicationSeries?.openAlexId;
            urisRef.value?.refreshModelValue(uris.value);

            titleRef.value?.forceRefreshModelValue(toMultilingualTextInput(title.value, languageTags.value));
            abbreviationsRef.value?.forceRefreshModelValue(toMultilingualTextInput(nameAbbreviations.value, languageTags.value));

            if (props.inputType === 'JOURNAL' || props.inputType === PublicationSeriesType.JOURNAL.toString()) {
                selectedArticleCollectionSeriesType.value = 
                {
                    title: getArticleCollectionSeriesTypeTitleFromValueAutoLocale((props.presetPublicationSeries as Journal).type) as string,
                    value: (props.presetPublicationSeries as Journal).type
                }
            }
        };

        return {
            isFormValid, openAlexId,
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
            submit, snackbar, message,
            sourceOpenAlexIdValidationRules,
            subtitleRef, subtitle,
            PublicationSeriesType,
            articleCollectionSeriesTypes,
            selectedArticleCollectionSeriesType
        };
    }
});
</script>
