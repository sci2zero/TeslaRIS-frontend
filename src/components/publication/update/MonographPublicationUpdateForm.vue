<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="10">
                <monograph-autocomplete-search ref="monographAutocompleteRef" v-model="selectedMonograph" required></monograph-autocomplete-search>
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="titleRef" v-model="title" :rules="requiredFieldRules" :label="$t('titleLabel') + '*'"
                    :initial-value="toMultilingualTextInput(presetMonographPublication?.title, languageTags)"></multilingual-text-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input ref="subtitleRef" v-model="subtitle" :label="$t('subtitleLabel')" :initial-value="toMultilingualTextInput(presetMonographPublication?.subTitle, languageTags)"></multilingual-text-input>
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
            <p class="required-fields-message">
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
import type { MonographPublication, MonographPublicationType } from '@/models/PublicationModel';
import UriInput from '@/components/core/UriInput.vue';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';
import MonographService from '@/services/DocumentPublicationService';
import type { Monograph } from '@/models/PublicationModel';
import type { Conference } from '@/models/EventModel';
import { getTitleFromValueAutoLocale, getMonographPublicationTypesForGivenLocale } from '@/i18n/monographPublicationType';
import MonographAutocompleteSearch from '../MonographAutocompleteSearch.vue';


export default defineComponent({
    name: "MonographPublicationUpdateForm",
    components: {MultilingualTextInput, UriInput, MonographAutocompleteSearch},
    props: {
        presetMonographPublication: {
            type: Object as PropType<MonographPublication | undefined>,
            required: true
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const monograph = ref<Monograph>();
        const event = ref<Conference>();

        const languageTags = ref<LanguageTagResponse[]>([]);

        onMounted(() => {
            if(props.presetMonographPublication?.monographId) {
                MonographService.readMonograph(props.presetMonographPublication.monographId).then((response) => {
                    monograph.value = response.data;
                    selectedMonograph.value = {title: returnCurrentLocaleContent(monograph.value.title) as string, value: monograph.value.id as number};
                });
            }

            LanguageService.getAllLanguageTags().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                languageTags.value = response.data;
            });
        });

        const searchPlaceholderMonograph = {title: returnCurrentLocaleContent(monograph.value?.title) as string, value: monograph.value?.id as number};
        const selectedMonograph = ref<{ title: string, value: number }>(searchPlaceholderMonograph);

        const searchPlaceholderEvent = {title: returnCurrentLocaleContent(event.value?.name) as string, value: event.value?.id as number};
        const selectedEvent = ref<{ title: string, value: number }>(searchPlaceholderEvent);

        const title = ref([]);
        const subtitle = ref([]);
        const startPage = ref(props.presetMonographPublication?.startPage);
        const endPage = ref(props.presetMonographPublication?.endPage);
        const publicationYear = ref(props.presetMonographPublication?.documentDate);
        const doi = ref(props.presetMonographPublication?.doi);
        const scopus = ref(props.presetMonographPublication?.scopusId);
        const articleNumber = ref(props.presetMonographPublication?.articleNumber);
        const numberOfPages = ref(props.presetMonographPublication?.numberOfPages);
        const uris = ref<string[]>(props.presetMonographPublication?.uris as string[]);

        const { requiredFieldRules, doiValidationRules, scopusIdValidationRules } = useValidationUtils();
        
        const publicationTypes = computed(() => getMonographPublicationTypesForGivenLocale());
        const selectedpublicationType = ref<{ title: string, value: MonographPublicationType }>({title: props.presetMonographPublication?.monographPublicationType ? getTitleFromValueAutoLocale(props.presetMonographPublication?.monographPublicationType as MonographPublicationType) as string : "", value: props.presetMonographPublication?.monographPublicationType as MonographPublicationType});

        const updateMonographPublication = () => {
            const updatedMonographPublication: MonographPublication = {
                title: title.value as MultilingualContent[],
                startPage: startPage.value as string,
                endPage: endPage.value as string,
                numberOfPages: numberOfPages.value as number,
                articleNumber: articleNumber.value as string,
                description: props.presetMonographPublication?.description as MultilingualContent[],
                keywords: props.presetMonographPublication?.keywords as MultilingualContent[],
                subTitle: subtitle.value as MultilingualContent[],
                uris: uris.value,
                contributions: props.presetMonographPublication?.contributions,
                documentDate: publicationYear.value,
                scopusId: scopus.value,
                doi: doi.value,
                monographId: selectedMonograph.value.value,
                eventId: selectedEvent.value.value,
                monographPublicationType: selectedpublicationType.value.value as MonographPublicationType,
                fileItems: [],
                proofs: [],
            };

            emit("update", updatedMonographPublication);
        };

        return {
            isFormValid,
            title, subtitle,
            publicationYear, doi, scopus,
            selectedMonograph, articleNumber,
            uris, numberOfPages, doiValidationRules,
            requiredFieldRules, selectedEvent,
            updateMonographPublication, toMultilingualTextInput,
            languageTags, startPage, endPage,
            publicationTypes, selectedpublicationType,
            scopusIdValidationRules
        };
    }
});
</script>
