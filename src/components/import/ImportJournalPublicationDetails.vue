<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <multilingual-text-input ref="subtitleRef" v-model="subtitle" :label="$t('subtitleLabel')" :initial-value="toMultilingualTextInput(presetMetadata?.subTitle, languageTags)"></multilingual-text-input>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="5">
                <v-text-field v-model="volume" :label="$t('volumeLabel')" :placeholder="$t('volumeLabel')"></v-text-field>
            </v-col>
            <v-col cols="5">
                <v-text-field v-model="issue" :label="$t('issueLabel')" :placeholder="$t('issueLabel')"></v-text-field>
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
                <v-text-field v-model="doi" label="DOI" placeholder="DOI" :rules="doiValidationRules"></v-text-field>
            </v-col>
            <v-col cols="5">
                <v-text-field v-model="scopus" label="Scopus ID" placeholder="Scopus ID" :rules="scopusIdValidationRules"></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="10">
                <v-select
                    v-model="selectedpublicationType"
                    :items="publicationTypes"
                    :label="$t('concretePublicationTypeLabel')"
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
                    ref="descriptionRef" v-model="description" is-area :label="$t('abstractLabel')"
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
import type { MultilingualContent } from '@/models/Common';
import type { JournalPublication, JournalPublicationType } from '@/models/PublicationModel';
import UriInput from '@/components/core/UriInput.vue';
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import { getTitleFromValueAutoLocale, getTypesForGivenLocale } from '@/i18n/journalPublicationType';
import type { JournalPublicationLoad } from '@/models/LoadModel';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { useLanguageTags } from '@/composables/useLanguageTags';


export default defineComponent({
    name: "ImportJournalPublicationDetails",
    components: {MultilingualTextInput, UriInput},
    props: {
        presetMetadata: {
            type: Object as PropType<JournalPublicationLoad>,
            required: true
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const { languageTags } = useLanguageTags();

        const subtitle = ref([]);
        const description = ref([]);
        const keywords = ref([]);
        const volume = ref(props.presetMetadata?.volume);
        const issue = ref(props.presetMetadata?.issue);
        const startPage = ref(props.presetMetadata?.startPage);
        const endPage = ref(props.presetMetadata?.endPage);
        const publicationYear = ref(props.presetMetadata?.documentDate);
        const doi = ref(props.presetMetadata?.doi);
        const scopus = ref(props.presetMetadata?.scopusId);
        const articleNumber = ref(props.presetMetadata?.articleNumber);
        const numberOfPages = ref(props.presetMetadata?.numberOfPages);
        const uris = ref<string[]>(props.presetMetadata?.uris as string[]);
        
        const publicationTypes = computed(() => getTypesForGivenLocale());
        const selectedpublicationType = ref<{ title: string, value: JournalPublicationType }>({title: props.presetMetadata?.journalPublicationType ? getTitleFromValueAutoLocale(props.presetMetadata?.journalPublicationType as JournalPublicationType) as string : "", value: props.presetMetadata?.journalPublicationType as JournalPublicationType});

        const updateJournalPublication = () => {
            const updatedJournalPublication: JournalPublication = {
                title: [],
                startPage: startPage.value as string,
                endPage: endPage.value as string,
                volume: volume.value as string,
                issue: issue.value as string,
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
                journalId: -1,
                eventId: -1,
                journalPublicationType: selectedpublicationType.value.value as JournalPublicationType,
                fileItems: [],
                proofs: [],
            };

            emit("update", updatedJournalPublication);
        };

        const { doiValidationRules, scopusIdValidationRules } = useValidationUtils();

        return {
            isFormValid,
            subtitle,
            publicationYear, doi, scopus,
            articleNumber, uris, numberOfPages,
            updateJournalPublication, toMultilingualTextInput,
            languageTags, volume, issue, startPage, endPage,
            publicationTypes, selectedpublicationType,
            description, keywords, doiValidationRules,
            scopusIdValidationRules
        };
    }
});
</script>
