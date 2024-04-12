<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="10">
                <journal-autocomplete-search ref="journalAutocompleteRef" v-model="selectedJournal" required></journal-autocomplete-search>
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="titleRef" v-model="title" :rules="requiredFieldRules" :label="$t('titleLabel') + '*'"
                    :initial-value="toMultilingualTextInput(presetJournalPublication?.title, languageTags)"></multilingual-text-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input ref="subtitleRef" v-model="subtitle" :label="$t('subtitleLabel')" :initial-value="toMultilingualTextInput(presetJournalPublication?.subTitle, languageTags)"></multilingual-text-input>
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
                <uri-input ref="urisRef" v-model="uris"></uri-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="10">
                <event-autocomplete-search ref="eventAutocompleteRef" v-model="selectedEvent"></event-autocomplete-search>
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
import { computed, defineComponent, type PropType } from 'vue';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import { ref } from 'vue';
import type { LanguageTagResponse, MultilingualContent } from '@/models/Common';
import { onMounted } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import type { JournalPublication, JournalPublicationType } from '@/models/PublicationModel';
import UriInput from '@/components/core/UriInput.vue';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/TranslationUtil';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';
import JournalService from '@/services/JournalService';
import type { Journal } from '@/models/JournalModel';
import type { Conference } from '@/models/EventModel';
import { getTitleFromValueAutoLocale, getTypesForGivenLocale } from '@/i18n/journalPublicationType';
import { useI18n } from 'vue-i18n';


export default defineComponent({
    name: "JournalPublicationUpdateForm",
    components: {MultilingualTextInput, UriInput},
    props: {
        presetJournalPublication: {
            type: Object as PropType<JournalPublication | undefined>,
            required: true
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const journal = ref<Journal>();
        const event = ref<Conference>();

        const languageTags = ref<LanguageTagResponse[]>([]);

        onMounted(() => {
            if(props.presetJournalPublication?.journalId) {
                JournalService.readJournal(props.presetJournalPublication.journalId).then((response) => {
                    journal.value = response.data;
                    selectedJournal.value = {title: returnCurrentLocaleContent(journal.value.title) as string, value: journal.value.id as number};
                });
            }

            LanguageService.getAllLanguageTags().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                languageTags.value = response.data;
            });
        });

        const titleRef = ref<typeof MultilingualTextInput>();
        const subtitleRef = ref<typeof MultilingualTextInput>();
        const descriptionRef = ref<typeof MultilingualTextInput>();
        const urisRef = ref<typeof UriInput>();

        const searchPlaceholderJournal = {title: returnCurrentLocaleContent(journal.value?.title) as string, value: journal.value?.id as number};
        const selectedJournal = ref<{ title: string, value: number }>(searchPlaceholderJournal);

        const searchPlaceholderEvent = {title: returnCurrentLocaleContent(event.value?.name) as string, value: event.value?.id as number};
        const selectedEvent = ref<{ title: string, value: number }>(searchPlaceholderEvent);

        const title = ref([]);
        const subtitle = ref([]);
        const volume = ref(props.presetJournalPublication?.volume);
        const issue = ref(props.presetJournalPublication?.issue);
        const startPage = ref(props.presetJournalPublication?.startPage);
        const endPage = ref(props.presetJournalPublication?.endPage);
        const publicationYear = ref(props.presetJournalPublication?.documentDate);
        const doi = ref(props.presetJournalPublication?.doi);
        const scopus = ref(props.presetJournalPublication?.scopusId);
        const articleNumber = ref(props.presetJournalPublication?.articleNumber);
        const numberOfPages = ref(props.presetJournalPublication?.numberOfPages);
        const uris = ref<string[]>(props.presetJournalPublication?.uris as string[]);

        const { requiredFieldRules } = useValidationUtils();
        
        const i18n = useI18n();
        const publicationTypes = computed(() => getTypesForGivenLocale(i18n.locale.value));
        const selectedpublicationType = ref<{ title: string, value: JournalPublicationType }>({title: props.presetJournalPublication?.journalPublicationType ? getTitleFromValueAutoLocale(props.presetJournalPublication?.journalPublicationType as JournalPublicationType, i18n.locale.value) as string : "", value: props.presetJournalPublication?.journalPublicationType as JournalPublicationType});

        const updateJournalPublication = () => {
            const updatedJournalPublication: JournalPublication = {
                title: title.value as MultilingualContent[],
                startPage: startPage.value as string,
                endPage: endPage.value as string,
                volume: volume.value as string,
                issue: issue.value as string,
                numberOfPages: numberOfPages.value as number,
                articleNumber: articleNumber.value as string,
                description: props.presetJournalPublication?.description as MultilingualContent[],
                keywords: props.presetJournalPublication?.keywords as MultilingualContent[],
                subTitle: subtitle.value as MultilingualContent[],
                uris: uris.value,
                contributions: props.presetJournalPublication?.contributions,
                documentDate: publicationYear.value,
                scopusId: scopus.value,
                doi: doi.value,
                journalId: selectedJournal.value.value,
                eventId: selectedEvent.value.value,
                journalPublicationType: selectedpublicationType.value.value as JournalPublicationType,
                fileItems: [],
                proofs: [],
            };

            emit("update", updatedJournalPublication);
        };

        return {
            isFormValid,
            title, titleRef,
            subtitle, subtitleRef,
            publicationYear, doi, scopus,
            selectedJournal, articleNumber,
            descriptionRef, uris, numberOfPages,
            urisRef, requiredFieldRules, selectedEvent,
            updateJournalPublication, toMultilingualTextInput,
            languageTags, volume, issue, startPage, endPage,
            publicationTypes, selectedpublicationType
        };
    }
});
</script>
