<template>
    <v-form v-model="isFormValid" class="flex flex-col gap-6" @submit.prevent>
        <form-section
            icon="mdi-book-multiple"
            :title="$t('publicationSeriesLabel')"
        >
            <multilingual-text-input
                ref="titleRef"
                v-model="title"
                :rules="requiredFieldRules"
                :label="$t('titleLabel') + '*'"
            />
            <multilingual-text-input
                ref="abbreviationsRef"
                v-model="nameAbbreviations"
                :label="$t('nameAbbreviationLabel')"
            />
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ui-input
                    v-model="eIssn"
                    label="E-ISSN"
                    placeholder="E-ISSN"
                    :rules="eIssnValidationRules"
                />
                <ui-input
                    v-model="printIssn"
                    label="Print ISSN"
                    placeholder="Print ISSN"
                    :rules="printIssnValidationRules"
                />
            </div>
            <ui-input
                v-if="inputType === PublicationSeriesType.JOURNAL.toString()"
                v-model="selectedArticleCollectionSeriesType"
                control="select"
                :label="$t('articleCollectionSeriesTypeLabel')"
                :items="articleCollectionSeriesTypes"
                return-object
            />
        </form-section>

        <form-section :title="$t('additionalFieldsLabel')">
            <ui-button variant="outline" type="button" @click="additionalFields = !additionalFields">
                {{ $t("additionalFieldsLabel") }} {{ additionalFields ? "▲" : "▼" }}
            </ui-button>
            <template v-if="additionalFields">
                <multilingual-text-input
                    ref="subtitleRef"
                    v-model="subtitle"
                    :label="$t('subtitleLabel')"
                />
                <ui-input
                    v-model="openAlexId"
                    label="Open Alex ID"
                    placeholder="Open Alex ID"
                    :rules="sourceOpenAlexIdValidationRules"
                />
                <ui-input
                    v-model="selectedLanguages"
                    control="select"
                    :label="$t('languageLabel')"
                    :items="languageList"
                    multiple
                />
                <uri-input ref="urisRef" v-model="uris" />
            </template>
        </form-section>

        <p class="text-sm text-slate-500">
            {{ $t("requiredFieldsMessage") }}
        </p>
    </v-form>
    
    <toast v-model="snackbar" :message="message" />
</template>

<script lang="ts">
import { computed, defineComponent, watch } from 'vue';
import MultilingualTextInput from '../core/MultilingualTextInput.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type { LanguageResponse, MultilingualContent } from '@/models/Common';
import { onMounted } from 'vue';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';
import JournalService from '@/services/JournalService';
import { PublicationSeriesType, type PublicationSeries } from '@/models/PublicationSeriesModel';
import BookSeriesService from '@/services/BookSeriesService';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { getErrorMessageForErrorKey } from '@/i18n';
import UriInput from '@/components/core/UriInput.vue';
import Toast from '../core/Toast.vue';
import { useLanguageTags } from '@/composables/useLanguageTags';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import { getArticleCollectionSeriesTypesForGivenLocale, getArticleCollectionSeriesTypeTitleFromValueAutoLocale } from '@/i18n/articleCollectionSeriesType.js';
import { ArticleCollectionSeriesType, type Journal } from '@/models/JournalModel.js';
import { detectLanguage } from '@/utils/LanguageDetector.js';


import UiInput from '@/components/ui/input/Input.vue';
import FormSection from '@/components/ui/form-section/FormSection.vue';
import { UiButton } from '@/components/ui/button';

export default defineComponent({
    name: "SubmitPublicationSeries",
    components: {MultilingualTextInput, UriInput, Toast, UiInput, FormSection, UiButton},
    props: {
        inputType: {
            type: String,
            required: true
        },
        inModal: {
            type: Boolean,
            default: false
        },
        presetName: {
            type: String,
            default: ""
        }
    },
    emits: ["create"],
    setup(props, { emit }) {
        const isFormValid = ref(false);
        const additionalFields = ref(false);

        const snackbar = ref(false);
        const message = ref("");

        const router = useRouter();
        const i18n = useI18n();

        const languageList = ref<{title: string, value: number}[]>([]);
        const selectedLanguages = ref<number[]>([]);
        const defaultLanguage = ref(-1);

        const articleCollectionSeriesTypes = computed(() => getArticleCollectionSeriesTypesForGivenLocale());
        const selectedArticleCollectionSeriesType = ref<{title: string, value: ArticleCollectionSeriesType}>(
            {
                title: getArticleCollectionSeriesTypeTitleFromValueAutoLocale(ArticleCollectionSeriesType.JOURNAL) as string,
                value: ArticleCollectionSeriesType.JOURNAL
            }
        );

        onMounted(() => {
            LanguageService.getAllLanguages().then((response: AxiosResponse<LanguageResponse[]>) => {
                response.data.forEach((languageTag: LanguageResponse) => {
                    languageList.value.push({title: `${returnCurrentLocaleContent(languageTag.name)} (${languageTag.languageCode})`, value: languageTag.id});
                    if (i18n.locale.value.toUpperCase().startsWith(languageTag.languageCode)) {
                        selectedLanguages.value.push(languageTag.id);
                        defaultLanguage.value = languageTag.id;
                    }
                })
            });
        });

        const { languageTags } = useLanguageTags();
        watch(() => languageTags.value, () => {
            presetName();
        });

        const presetName = async () => {
            if (props.presetName) {
                const detectedLocale = await detectLanguage(props.presetName);
                const tag = languageTags.value.find(
                    lt => lt.languageCode === detectedLocale
                );

                if (tag) {
                    const mc: MultilingualContent[] = [
                        {content: props.presetName, languageTag: tag.languageCode, languageTagId: tag.id, priority: 1}
                    ];
                    title.value = mc;
                    titleRef.value?.forceRefreshModelValue(toMultilingualTextInput(mc, languageTags.value));
                }
            }
        };

        const titleRef = ref<typeof MultilingualTextInput>();
        const subtitleRef = ref<typeof MultilingualTextInput>();
        const abbreviationsRef = ref<typeof MultilingualTextInput>();
        const urisRef = ref<typeof MultilingualTextInput>();

        const title = ref<any[]>([]);
        const nameAbbreviations = ref([]);
        const subtitle = ref<any[]>([]);
        const eIssn = ref("");
        const printIssn = ref("");
        const openAlexId = ref("");
        const uris = ref<string[]>([]);

        const {
            requiredFieldRules, eIssnValidationRules,
            printIssnValidationRules, sourceOpenAlexIdValidationRules
        } = useValidationUtils();

        const submit = (stayOnPage: boolean) => {
            const newPublicationSeries: PublicationSeries = {
                title: title.value,
                eissn: eIssn.value,
                printISSN: printIssn.value,
                languageIds: selectedLanguages.value,
                nameAbbreviation: nameAbbreviations.value,
                contributions: [],
                openAlexId: openAlexId.value,
                uris: uris.value,
                subtitle: subtitle.value
            };

            switch(props.inputType) {
                case PublicationSeriesType.JOURNAL.toString(): {
                    const newJournal: Journal = {
                        ...newPublicationSeries,
                        type: selectedArticleCollectionSeriesType.value.value
                    };

                    JournalService.createJournal(newJournal).then((response) => {
                        if (props.inModal) {
                            emit("create", response.data);
                            return;
                        }

                        if (stayOnPage) {
                            titleRef.value?.clearInput();
                            subtitleRef.value?.clearInput();
                            abbreviationsRef.value?.clearInput();
                            eIssn.value = "";
                            printIssn.value = "";
                            openAlexId.value = "";
                            selectedLanguages.value = [defaultLanguage.value];
                            selectedArticleCollectionSeriesType.value = 
                                {
                                    title: getArticleCollectionSeriesTypeTitleFromValueAutoLocale(ArticleCollectionSeriesType.JOURNAL) as string,
                                    value: ArticleCollectionSeriesType.JOURNAL
                                };

                            message.value = i18n.t("savedMessage");
                            snackbar.value = true;
                        } else {
                            router.push({ name: "journalLandingPage", params: {id: response.data.id} });
                        }
                    }).catch((error) => {
                        message.value = getErrorMessageForErrorKey(error.response.data.message);
                        snackbar.value = true;
                    });
                    break;
                }
                case PublicationSeriesType.BOOK_SERIES.toString():
                    BookSeriesService.createBookSeries(newPublicationSeries).then((response) => {
                        if (props.inModal) {
                            emit("create", response.data);
                            return;
                        }
                        
                        if (stayOnPage) {
                            titleRef.value?.clearInput();
                            subtitleRef.value?.clearInput();
                            abbreviationsRef.value?.clearInput();
                            eIssn.value = "";
                            printIssn.value = "";
                            selectedLanguages.value = [defaultLanguage.value];

                            message.value = i18n.t("savedMessage");
                            snackbar.value = true;
                        } else {
                            router.push({ name: "bookSeriesLandingPage", params: {id: response.data.id} });
                        }
                    }).catch((error) => {
                        message.value = getErrorMessageForErrorKey(error.response.data.message);
                        snackbar.value = true;
                    });
                    break;
            }
        };

        return {
            isFormValid, additionalFields, submit,
            snackbar, message, printIssnValidationRules,
            title, titleRef, eIssnValidationRules,
            eIssn, printIssn, languageList, selectedLanguages,
            nameAbbreviations, abbreviationsRef, subtitle,
            requiredFieldRules, uris, urisRef, openAlexId,
            sourceOpenAlexIdValidationRules, subtitleRef,
            articleCollectionSeriesTypes, PublicationSeriesType,
            selectedArticleCollectionSeriesType
        };
    }
});
</script>
