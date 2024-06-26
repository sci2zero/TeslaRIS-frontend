<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <multilingual-text-input ref="subtitleRef" v-model="subtitle" :label="$t('subtitleLabel')" :initial-value="toMultilingualTextInput(presetMetadata?.subTitle, languageTags)"></multilingual-text-input>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="5">
                <v-text-field v-model="startPage" :label="$t('startPageLabel')" :placeholder="$t('startPageLabel')"></v-text-field>
            </v-col>
            <v-col cols="5">
                <v-text-field v-model="endPage" :label="$t('endPageLabel')" :placeholder="$t('endPageLabel')"></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="10">
                <v-text-field v-model="publicationYear" :label="$t('yearOfPublicationLabel')" :placeholder="$t('yearOfPublicationLabel')"></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="5">
                <v-text-field v-model="doi" label="DOI" placeholder="DOI"></v-text-field>
            </v-col>
            <v-col cols="5">
                <v-text-field v-model="scopus" label="Scopus ID" placeholder="Scopus ID"></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="10">
                <v-select
                    v-model="selectedpublicationType"
                    :items="publicationTypes"
                    :label="$t('typeOfPublicationLabel')"
                    return-object>
                </v-select>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="5">
                <v-text-field v-model="articleNumber" :label="$t('articleNumberLabel')" :placeholder="$t('articleNumberLabel')"></v-text-field>
            </v-col>
            <v-col cols="5">
                <v-text-field
                    v-model="numberOfPages" type="number" :min="0" :label="$t('numberOfPagesLabel')"
                    :placeholder="$t('numberOfPagesLabel')"></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="descriptionRef" v-model="description" is-area :label="$t('descriptionLabel')"
                    :initial-value="toMultilingualTextInput(presetMetadata?.description, languageTags)"></multilingual-text-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="keywordsRef" v-model="keywords" is-area :label="$t('keywordsLabel')"
                    :initial-value="toMultilingualTextInput(presetMetadata?.keywords, languageTags)"></multilingual-text-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <uri-input ref="urisRef" v-model="uris"></uri-input>
            </v-col>
        </v-row>
    </v-form>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from 'vue';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import { ref } from 'vue';
import type { LanguageTagResponse, MultilingualContent } from '@/models/Common';
import { onMounted } from 'vue';
import type { ProceedingsPublication, ProceedingsPublicationType } from '@/models/PublicationModel';
import UriInput from '@/components/core/UriInput.vue';
import { toMultilingualTextInput } from '@/i18n/TranslationUtil';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';
import { getTitleFromValueAutoLocale, getTypesForGivenLocale } from '@/i18n/proceedingsPublicationType';
import type { ProceedingsPublicationLoad } from '@/models/LoadModel';


export default defineComponent({
    name: "ImportProceedingsPublicationDetails",
    components: {MultilingualTextInput, UriInput},
    props: {
        presetMetadata: {
            type: Object as PropType<ProceedingsPublicationLoad>,
            required: true
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const languageTags = ref<LanguageTagResponse[]>([]);

        onMounted(() => {
            LanguageService.getAllLanguageTags().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                languageTags.value = response.data;
            });
        });

        const subtitle = ref([]);
        const description = ref([]);
        const keywords = ref([]);
        const startPage = ref(props.presetMetadata?.startPage);
        const endPage = ref(props.presetMetadata?.endPage);
        const publicationYear = ref(props.presetMetadata?.documentDate);
        const doi = ref(props.presetMetadata?.doi);
        const scopus = ref(props.presetMetadata?.scopusId);
        const articleNumber = ref(props.presetMetadata?.articleNumber);
        const numberOfPages = ref(props.presetMetadata?.numberOfPages);
        const uris = ref<string[]>(props.presetMetadata?.uris as string[]);
        
        const publicationTypes = computed(() => getTypesForGivenLocale());
        const selectedpublicationType = ref<{ title: string, value: ProceedingsPublicationType }>({title: props.presetMetadata?.proceedingsPublicationType ? getTitleFromValueAutoLocale(props.presetMetadata?.proceedingsPublicationType as ProceedingsPublicationType) as string : "", value: props.presetMetadata?.proceedingsPublicationType as ProceedingsPublicationType});

        const updateProceedingsPublication = () => {
            const updatedProceeedingsPublication: ProceedingsPublication = {
                title: [],
                startPage: startPage.value as string,
                endPage: endPage.value as string,
                numberOfPages: numberOfPages.value as number,
                articleNumber: articleNumber.value as string,
                description: props.presetMetadata?.description as MultilingualContent[],
                keywords: props.presetMetadata?.keywords as MultilingualContent[],
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

        return {
            isFormValid,
            subtitle,
            publicationYear, doi, scopus,
            articleNumber, uris, numberOfPages,
            updateProceedingsPublication, toMultilingualTextInput,
            languageTags, startPage, endPage,
            publicationTypes, selectedpublicationType,
            description, keywords
        };
    }
});
</script>
