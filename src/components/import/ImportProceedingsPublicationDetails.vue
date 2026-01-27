<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <input-with-suggestions
                    :suggestions="getSuggestions('title')"
                    :apply-suggestion="s =>
                        titleRef?.setNewInputValue(
                            toMultilingualTextInput(s, languageTags)
                        )
                    "
                    :suggestion-label="s => (returnCurrentLocaleContent(s) as string)"
                    space-out-suggestions
                    :input-value="title">
                    <multilingual-text-input
                        ref="titleRef"
                        v-model="title"
                        :label="$t('titleLabel')"
                        :initial-value="toMultilingualTextInput(presetMetadata?.title, languageTags)"
                    />
                </input-with-suggestions>
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <input-with-suggestions
                    :suggestions="getSuggestions('subTitle')"
                    :apply-suggestion="s =>
                        subtitleRef?.setNewInputValue(
                            toMultilingualTextInput(s, languageTags)
                        )
                    "
                    :suggestion-label="s => (returnCurrentLocaleContent(s) as string)"
                    space-out-suggestions
                    :input-value="subtitle">
                    <multilingual-text-input
                        ref="subtitleRef"
                        v-model="subtitle"
                        :label="$t('subtitleLabel')"
                        :initial-value="toMultilingualTextInput(presetMetadata?.subTitle, languageTags)"
                    />
                </input-with-suggestions>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="5">
                <input-with-suggestions
                    :suggestions="getSuggestions('startPage')"
                    :apply-suggestion="s => startPage = s"
                    :suggestion-label="s => s"
                    :input-value="startPage">
                    <v-text-field
                        v-model="startPage"
                        :label="$t('startPageLabel')"
                        :placeholder="$t('startPageLabel')"
                    />
                </input-with-suggestions>
            </v-col>
            <v-col cols="5">
                <input-with-suggestions
                    :suggestions="getSuggestions('endPage')"
                    :apply-suggestion="s => endPage = s"
                    :suggestion-label="s => s"
                    :input-value="endPage">
                    <v-text-field
                        v-model="endPage"
                        :label="$t('endPageLabel')"
                        :placeholder="$t('endPageLabel')"
                    />
                </input-with-suggestions>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="10">
                <input-with-suggestions
                    :suggestions="getSuggestions('documentDate')"
                    :apply-suggestion="s => publicationYear = s"
                    :suggestion-label="s => s"
                    :input-value="publicationYear">
                    <v-text-field
                        v-model="publicationYear"
                        :label="$t('yearOfPublicationLabel')"
                        :placeholder="$t('yearOfPublicationLabel')"
                    />
                </input-with-suggestions>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="5">
                <input-with-suggestions
                    :suggestions="getSuggestions('doi')"
                    :apply-suggestion="s => doi = s"
                    :suggestion-label="s => s"
                    :input-value="doi">
                    <v-text-field
                        v-model="doi"
                        label="DOI"
                        placeholder="DOI"
                        :rules="doiValidationRules"
                    />
                </input-with-suggestions>
            </v-col>
            <v-col cols="5">
                <input-with-suggestions
                    :suggestions="getSuggestions('scopusId')"
                    :apply-suggestion="s => scopus = s"
                    :suggestion-label="s => s"
                    :input-value="scopus">
                    <v-text-field
                        v-model="scopus"
                        label="Scopus ID"
                        placeholder="Scopus ID"
                        :rules="scopusIdValidationRules"
                    />
                </input-with-suggestions>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="5">
                <input-with-suggestions
                    :suggestions="getSuggestions('openAlexId')"
                    :apply-suggestion="s => openAlexId = s"
                    :suggestion-label="s => s"
                    :input-value="openAlexId">
                    <v-text-field
                        v-model="openAlexId"
                        label="Open Alex ID"
                        placeholder="Open Alex ID"
                        :rules="workOpenAlexIdValidationRules"
                    />
                </input-with-suggestions>
            </v-col>
            <v-col cols="5">
                <input-with-suggestions
                    :suggestions="getSuggestions('webOfScienceId')"
                    :apply-suggestion="s => webOfScienceId = s"
                    :suggestion-label="s => s"
                    :input-value="webOfScienceId">
                    <v-text-field
                        v-model="webOfScienceId"
                        label="Web of Science ID"
                        placeholder="Web of Science ID"
                        :rules="documentWebOfScienceIdValidationRules"
                    />
                </input-with-suggestions>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="10">
                <input-with-suggestions
                    :suggestions="getSuggestions('proceedingsPublicationType')"
                    :apply-suggestion="s => selectedpublicationType = {title: (getTitleFromValueAutoLocale(s) as string), value: s}"
                    :suggestion-label="s => (getTitleFromValueAutoLocale(s) as string)"
                    :input-value="selectedpublicationType">
                    <v-select
                        v-model="selectedpublicationType"
                        :items="publicationTypes"
                        :label="$t('typeOfPublicationLabel')"
                        return-object
                    />
                </input-with-suggestions>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="5">
                <input-with-suggestions
                    :suggestions="getSuggestions('articleNumber')"
                    :apply-suggestion="s => articleNumber = s"
                    :suggestion-label="s => s"
                    :input-value="articleNumber">
                    <v-text-field
                        v-model="articleNumber"
                        :label="$t('articleNumberLabel')"
                        :placeholder="$t('articleNumberLabel')"
                    />
                </input-with-suggestions>
            </v-col>
            <v-col cols="5">
                <input-with-suggestions
                    :suggestions="getSuggestions('numberOfPages')"
                    :apply-suggestion="s => numberOfPages = s"
                    :suggestion-label="s => s"
                    :input-value="numberOfPages">
                    <v-text-field
                        v-model="numberOfPages"
                        type="number"
                        :min="0"
                        :label="$t('numberOfPagesLabel')"
                        :rules="optionalNumericZeroOrGreaterFieldRules"
                        :placeholder="$t('numberOfPagesLabel')"
                    />
                </input-with-suggestions>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <input-with-suggestions
                    :suggestions="getSuggestions('description')"
                    :apply-suggestion="s =>
                        descriptionRef?.setNewInputValue(
                            toMultilingualTextInput(s, languageTags)
                        )
                    "
                    :suggestion-label="s => (returnCurrentLocaleContent(s) as string)"
                    space-out-suggestions
                    :input-value="description">
                    <multilingual-text-input
                        ref="descriptionRef"
                        v-model="description"
                        is-area
                        :label="$t('abstractLabel')"
                        :initial-value="toMultilingualTextInput(presetMetadata?.description, languageTags)"
                    />
                </input-with-suggestions>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <input-with-suggestions
                    :suggestions="getSuggestions('keywords')"
                    :apply-suggestion="s =>
                        keywordsRef?.setNewInputValue(
                            toMultilingualTextInput(s, languageTags)
                        )
                    "
                    :suggestion-label="s => (returnCurrentLocaleContent(s) as string)"
                    space-out-suggestions
                    :input-value="keywords">
                    <multilingual-text-input
                        ref="keywordsRef"
                        v-model="keywords"
                        is-area
                        :label="$t('keywordsLabel')"
                        :initial-value="toMultilingualTextInput(presetMetadata?.keywords, languageTags)"
                    />
                </input-with-suggestions>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <input-with-suggestions
                    :suggestions="getSuggestions('uris')"
                    :apply-suggestion="s => urisRef?.addUriToModel(s)"
                    :suggestion-label="s => s"
                    :input-value="uris">
                    <uri-input
                        ref="urisRef"
                        v-model="uris"
                    />
                </input-with-suggestions>
            </v-col>
        </v-row>
    </v-form>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from 'vue';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import { ref } from 'vue';
import type { MultilingualContent } from '@/models/Common';
import type { ProceedingsPublication, ProceedingsPublicationType } from '@/models/PublicationModel';
import UriInput from '@/components/core/UriInput.vue';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import { getTitleFromValueAutoLocale, getTypesForGivenLocale } from '@/i18n/proceedingsPublicationType';
import type { ProceedingsPublicationLoad } from '@/models/LoadModel';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { useLanguageTags } from '@/composables/useLanguageTags';
import InputWithSuggestions from '../core/InputWithSuggestions.vue';


export default defineComponent({
    name: "ImportProceedingsPublicationDetails",
    components: { MultilingualTextInput, UriInput, InputWithSuggestions },
    props: {
        presetMetadata: {
            type: Object as PropType<ProceedingsPublicationLoad>,
            required: true
        },
        metadataEnrichment: {
            type: Array<ProceedingsPublication>,
            default: []
        },
        displayEnrichmentSetIndex: {
            type: Number,
            default: 0
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const { languageTags } = useLanguageTags();

        const titleRef = ref<typeof MultilingualTextInput>();
        const subtitleRef = ref<typeof MultilingualTextInput>();
        const descriptionRef = ref<typeof MultilingualTextInput>();
        const keywordsRef = ref<typeof MultilingualTextInput>();
        const urisRef = ref<typeof UriInput>();

        const title = ref([]);
        const subtitle = ref([]);
        const description = ref([]);
        const keywords = ref([]);
        const startPage = ref(props.presetMetadata?.startPage);
        const endPage = ref(props.presetMetadata?.endPage);
        const publicationYear = ref(props.presetMetadata?.documentDate);
        const doi = ref(props.presetMetadata?.doi);
        const scopus = ref(props.presetMetadata?.scopusId);
        const openAlexId = ref(props.presetMetadata?.openAlexId);
        const webOfScienceId = ref(props.presetMetadata?.webOfScienceId);
        const articleNumber = ref(props.presetMetadata?.articleNumber);
        const numberOfPages = ref(props.presetMetadata?.numberOfPages);
        const uris = ref<string[]>(props.presetMetadata?.uris as string[]);
        
        const publicationTypes = computed(() => getTypesForGivenLocale());
        const selectedpublicationType = ref<{ title: string, value: ProceedingsPublicationType }>({title: props.presetMetadata?.proceedingsPublicationType ? getTitleFromValueAutoLocale(props.presetMetadata?.proceedingsPublicationType as ProceedingsPublicationType) as string : "", value: props.presetMetadata?.proceedingsPublicationType as ProceedingsPublicationType});

        const updateProceedingsPublication = () => {
            const updatedProceeedingsPublication: ProceedingsPublication = {
                title: title.value as MultilingualContent[],
                startPage: startPage.value as string,
                endPage: endPage.value as string,
                numberOfPages: numberOfPages.value as number,
                articleNumber: articleNumber.value as string,
                description: description.value,
                keywords: keywords.value,
                subTitle: subtitle.value as MultilingualContent[],
                uris: uris.value,
                contributions: [],
                documentDate: publicationYear.value,
                scopusId: scopus.value,
                doi: doi.value,
                eventId: -1,
                proceedingsId: -1,
                proceedingsPublicationType: selectedpublicationType.value.value as ProceedingsPublicationType,
                fileItems: [],
                proofs: [],
            };

            emit("update", updatedProceeedingsPublication);
        };

        const {
            doiValidationRules, scopusIdValidationRules,
            optionalNumericZeroOrGreaterFieldRules,
            workOpenAlexIdValidationRules,
            documentWebOfScienceIdValidationRules
        } = useValidationUtils();

        const getSuggestions = (fieldName: string): any[] => {
            if (!props.metadataEnrichment || 
                props.displayEnrichmentSetIndex >= props.metadataEnrichment.length ||
                props.displayEnrichmentSetIndex < 0) {
                return [];
            }

            const metadataSet = props.metadataEnrichment[props.displayEnrichmentSetIndex];
            if (!metadataSet) {
                return [];
            }

            if (fieldName in metadataSet && metadataSet[fieldName as keyof ProceedingsPublication] !== undefined) {
                const suggestions = metadataSet[fieldName as keyof ProceedingsPublication];
                
                if (Array.isArray(suggestions) && suggestions.every(item => typeof item === "string")) {
                    return suggestions;
                }

                return [suggestions];
            }
            
            return [];
        };

        return {
            isFormValid, subtitle, title,
            publicationYear, doi, scopus,
            articleNumber, uris, numberOfPages,
            updateProceedingsPublication,
            languageTags, startPage, endPage,
            publicationTypes, selectedpublicationType,
            description, keywords, doiValidationRules,
            scopusIdValidationRules, toMultilingualTextInput,
            optionalNumericZeroOrGreaterFieldRules,
            openAlexId, webOfScienceId, getSuggestions,
            workOpenAlexIdValidationRules, urisRef,
            documentWebOfScienceIdValidationRules,
            returnCurrentLocaleContent, titleRef, subtitleRef,
            keywordsRef, descriptionRef, getTitleFromValueAutoLocale
        };
    }
});
</script>
