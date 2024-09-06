<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="titleRef" v-model="title" :rules="requiredFieldRules" :label="$t('titleLabel') + '*'"
                    :initial-value="toMultilingualTextInput(presetPatent?.title, languageTags)"></multilingual-text-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input ref="subtitleRef" v-model="subtitle" :label="$t('subtitleLabel')" :initial-value="toMultilingualTextInput(presetPatent?.subTitle, languageTags)"></multilingual-text-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="10">
                <v-text-field v-model="publicationYear" type="number" :label="$t('yearOfPublicationLabel')" :placeholder="$t('yearOfPublicationLabel')"></v-text-field>
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
                <v-text-field v-model="patentNumber" :label="$t('internalNumberLabel')" :placeholder="$t('internalNumberLabel')"></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <uri-input ref="urisRef" v-model="uris"></uri-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="10">
                <publisher-autocomplete-search ref="publisherAutocompleteRef" v-model="selectedPublisher"></publisher-autocomplete-search>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="10">
                <event-autocomplete-search v-model="selectedEvent"></event-autocomplete-search>
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
import { defineComponent, watch, type PropType } from 'vue';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import { ref } from 'vue';
import type { LanguageTagResponse, MultilingualContent } from '@/models/Common';
import { onMounted } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import type { Patent } from '@/models/PublicationModel';
import UriInput from '@/components/core/UriInput.vue';
import PublisherAutocompleteSearch from '@/components/publisher/PublisherAutocompleteSearch.vue';
import PublisherService from '@/services/PublisherService';
import type { Publisher } from '@/models/PublisherModel';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';
import EventAutocompleteSearch from '@/components/event/EventAutocompleteSearch.vue';


export default defineComponent({
    name: "PatentUpdateForm",
    components: {MultilingualTextInput, UriInput, PublisherAutocompleteSearch, EventAutocompleteSearch},
    props: {
        presetPatent: {
            type: Object as PropType<Patent | undefined>,
            required: true
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const publisher = ref<Publisher>();

        const languageTags = ref<LanguageTagResponse[]>([]);

        onMounted(() => {
            LanguageService.getAllLanguageTags().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                languageTags.value = response.data;
            });

            fetchDetails();
        });

        const fetchDetails = () => {
            if(props.presetPatent?.publisherId) {
                PublisherService.readPublisher(props.presetPatent.publisherId).then((response) => {
                    publisher.value = response.data;
                    selectedPublisher.value = {title: returnCurrentLocaleContent(publisher.value.name) as string, value: publisher.value.id as number};
                });
            }
        };

        watch(() => props.presetPatent, () => {
            if (props.presetPatent) {
                refreshForm();
            }
        });

        const titleRef = ref<typeof MultilingualTextInput>();
        const subtitleRef = ref<typeof MultilingualTextInput>();

        const searchPlaceholder = {title: returnCurrentLocaleContent(publisher.value?.name) as string, value: publisher.value?.id as number};
        const selectedPublisher = ref<{ title: string, value: number }>(searchPlaceholder);
        const selectedEvent = ref<{ title: string, value: number }>(searchPlaceholder);

        const title = ref<any>([]);
        const subtitle = ref<any>([]);
        const publicationYear = ref(props.presetPatent?.documentDate);
        const doi = ref(props.presetPatent?.doi);
        const scopus = ref(props.presetPatent?.scopusId);
        const patentNumber = ref(props.presetPatent?.number);
        const uris = ref<string[]>(props.presetPatent?.uris as string[]);

        const { requiredFieldRules, doiValidationRules, scopusIdValidationRules } = useValidationUtils();

        const updatePatent = () => {
            const updatedPatent: Patent = {
                title: title.value as MultilingualContent[],
                number: patentNumber.value as string,
                description: props.presetPatent?.description as MultilingualContent[],
                keywords: props.presetPatent?.keywords as MultilingualContent[],
                subTitle: subtitle.value as MultilingualContent[],
                uris: uris.value,
                contributions: props.presetPatent?.contributions,
                documentDate: publicationYear.value,
                scopusId: scopus.value,
                doi: doi.value,
                publisherId: selectedPublisher.value.value === -1 ? undefined : selectedPublisher.value.value,
                eventId: selectedEvent.value.value === -1 ? undefined : selectedEvent.value.value,
                fileItems: [],
                proofs: []
            };

            emit("update", updatedPatent);
        };

        const refreshForm = () => {
            titleRef.value?.clearInput();
            title.value = props.presetPatent?.title as MultilingualContent[];

            subtitleRef.value?.clearInput();
            subtitle.value = props.presetPatent?.subTitle as MultilingualContent[];

            uris.value = props.presetPatent?.uris as string[];
            patentNumber.value = props.presetPatent?.number;
            publicationYear.value = props.presetPatent?.documentDate;
            doi.value = props.presetPatent?.doi;
            scopus.value = props.presetPatent?.scopusId;

            titleRef.value?.forceRefreshModelValue(toMultilingualTextInput(title.value, languageTags.value));
            subtitleRef.value?.forceRefreshModelValue(toMultilingualTextInput(subtitle.value, languageTags.value));

            fetchDetails();
        };

        return {
            isFormValid,
            title,
            subtitle,
            publicationYear, 
            doi, scopus,
            selectedPublisher, 
            patentNumber, uris, 
            requiredFieldRules,
            updatePatent,
            toMultilingualTextInput,
            languageTags,
            selectedEvent,
            doiValidationRules,
            scopusIdValidationRules,
            titleRef, subtitleRef,
            refreshForm
        };
    }
});
</script>
