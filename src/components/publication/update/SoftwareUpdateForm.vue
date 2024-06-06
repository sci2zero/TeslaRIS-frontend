<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="titleRef" v-model="title" :rules="requiredFieldRules" :label="$t('titleLabel') + '*'"
                    :initial-value="toMultilingualTextInput(presetSoftware?.title, languageTags)"></multilingual-text-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input ref="subtitleRef" v-model="subtitle" :label="$t('subtitleLabel')" :initial-value="toMultilingualTextInput(presetSoftware?.subTitle, languageTags)"></multilingual-text-input>
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
                <v-text-field v-model="softwareNumber" :label="$t('internalNumberLabel')" :placeholder="$t('internalNumberLabel')"></v-text-field>
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
            <p style="margin-left: 20px;">
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
import type { Software } from '@/models/PublicationModel';
import UriInput from '@/components/core/UriInput.vue';
import PublisherAutocompleteSearch from '@/components/publisher/PublisherAutocompleteSearch.vue';
import PublisherService from '@/services/PublisherService';
import type { Publisher } from '@/models/PublisherModel';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/TranslationUtil';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';
import EventAutocompleteSearch from '@/components/event/EventAutocompleteSearch.vue';


export default defineComponent({
    name: "SoftwareUpdateForm",
    components: {MultilingualTextInput, UriInput, PublisherAutocompleteSearch, EventAutocompleteSearch},
    props: {
        presetSoftware: {
            type: Object as PropType<Software | undefined>,
            required: true
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const publisher = ref<Publisher>();

        const languageTags = ref<LanguageTagResponse[]>([]);

        onMounted(() => {
            if(props.presetSoftware?.publisherId) {
                PublisherService.readPublisher(props.presetSoftware.publisherId).then((response) => {
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
        const publicationYear = ref(props.presetSoftware?.documentDate);
        const doi = ref(props.presetSoftware?.doi);
        const scopus = ref(props.presetSoftware?.scopusId);
        const softwareNumber = ref(props.presetSoftware?.internalNumber);
        const uris = ref<string[]>(props.presetSoftware?.uris as string[]);

        const { requiredFieldRules } = useValidationUtils();

        const updateSoftware = () => {
            const updatedSoftware: Software = {
                title: title.value as MultilingualContent[],
                internalNumber: softwareNumber.value as string,
                description: props.presetSoftware?.description as MultilingualContent[],
                keywords: props.presetSoftware?.keywords as MultilingualContent[],
                subTitle: subtitle.value as MultilingualContent[],
                uris: uris.value,
                contributions: props.presetSoftware?.contributions,
                documentDate: publicationYear.value,
                scopusId: scopus.value,
                doi: doi.value,
                publisherId: selectedPublisher.value.value === -1 ? undefined : selectedPublisher.value.value,
                eventId: selectedEvent.value.value === -1 ? undefined : selectedEvent.value.value,
                fileItems: [],
                proofs: []
            };

            emit("update", updatedSoftware);
        };

        return {
            isFormValid,
            title, subtitle,
            publicationYear, doi, scopus,
            selectedPublisher, softwareNumber,
            uris, requiredFieldRules,
            updateSoftware, toMultilingualTextInput,
            languageTags, selectedEvent
        };
    }
});
</script>
