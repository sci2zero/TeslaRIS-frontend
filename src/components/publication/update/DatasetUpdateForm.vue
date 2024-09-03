<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="titleRef" v-model="title" :rules="requiredFieldRules" :label="$t('titleLabel') + '*'"
                    :initial-value="toMultilingualTextInput(presetDataset?.title, languageTags)"></multilingual-text-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input ref="subtitleRef" v-model="subtitle" :label="$t('subtitleLabel')" :initial-value="toMultilingualTextInput(presetDataset?.subTitle, languageTags)"></multilingual-text-input>
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
                <v-text-field v-model="datasetNumber" :label="$t('internalNumberLabel')" :placeholder="$t('internalNumberLabel')"></v-text-field>
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
import { defineComponent, type PropType } from 'vue';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import { ref } from 'vue';
import type { LanguageTagResponse, MultilingualContent } from '@/models/Common';
import { onMounted } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import type { Dataset } from '@/models/PublicationModel';
import UriInput from '@/components/core/UriInput.vue';
import PublisherAutocompleteSearch from '@/components/publisher/PublisherAutocompleteSearch.vue';
import PublisherService from '@/services/PublisherService';
import type { Publisher } from '@/models/PublisherModel';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';
import EventAutocompleteSearch from '@/components/event/EventAutocompleteSearch.vue';


export default defineComponent({
    name: "DatasetUpdateForm",
    components: {MultilingualTextInput, UriInput, PublisherAutocompleteSearch, EventAutocompleteSearch},
    props: {
        presetDataset: {
            type: Object as PropType<Dataset | undefined>,
            required: true
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const publisher = ref<Publisher>();

        const languageTags = ref<LanguageTagResponse[]>([]);

        onMounted(() => {
            if(props.presetDataset?.publisherId) {
                PublisherService.readPublisher(props.presetDataset.publisherId).then((response) => {
                    publisher.value = response.data;
                    selectedPublisher.value = {title: returnCurrentLocaleContent(publisher.value.name) as string, value: publisher.value.id as number};
                });
            }

            LanguageService.getAllLanguageTags().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                languageTags.value = response.data;
            });
        });

        const searchPlaceholder = {title: returnCurrentLocaleContent(publisher.value?.name) as string, value: publisher.value?.id as number};
        const selectedPublisher = ref<{ title: string, value: number }>(searchPlaceholder);
        const selectedEvent = ref<{ title: string, value: number }>(searchPlaceholder);

        const title = ref([]);
        const subtitle = ref([]);
        const publicationYear = ref(props.presetDataset?.documentDate);
        const doi = ref(props.presetDataset?.doi);
        const scopus = ref(props.presetDataset?.scopusId);
        const datasetNumber = ref(props.presetDataset?.internalNumber);
        const uris = ref<string[]>(props.presetDataset?.uris as string[]);

        const { requiredFieldRules, doiValidationRules, scopusIdValidationRules } = useValidationUtils();

        const updateDataset = () => {
            const updatedDataset: Dataset = {
                title: title.value as MultilingualContent[],
                internalNumber: datasetNumber.value as string,
                description: props.presetDataset?.description as MultilingualContent[],
                keywords: props.presetDataset?.keywords as MultilingualContent[],
                subTitle: subtitle.value as MultilingualContent[],
                uris: uris.value,
                contributions: props.presetDataset?.contributions,
                documentDate: publicationYear.value,
                scopusId: scopus.value,
                doi: doi.value,
                publisherId: selectedPublisher.value.value === -1 ? undefined : selectedPublisher.value.value,
                eventId: selectedEvent.value.value === -1 ? undefined : selectedEvent.value.value,
                fileItems: [],
                proofs: []
            };

            emit("update", updatedDataset);
        };

        return {
            isFormValid,
            title, subtitle,
            publicationYear, doi, scopus,
            selectedPublisher, datasetNumber,
            uris, requiredFieldRules, doiValidationRules,
            updateDataset, toMultilingualTextInput,
            languageTags, selectedEvent, scopusIdValidationRules
        };
    }
});
</script>
