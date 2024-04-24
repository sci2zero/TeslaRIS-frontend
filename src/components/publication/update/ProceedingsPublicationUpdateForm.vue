<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="11">
                <event-autocomplete-search ref="eventAutocompleteRef" v-model="selectedEvent" required></event-autocomplete-search>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="10">
                <v-select
                    v-model="selectedProceedings"
                    :items="availableProceedings"
                    :label="$t('proceedingsLabel') + '*'"
                    :no-data-text="selectedEvent.value === -1 ? $t('selectConferenceMessage') : $t('noAvailableProceedingsMessage')"
                    :rules="requiredSelectionRules"
                    return-object
                ></v-select>
            </v-col>
            <v-col style="margin-top: 15px;">
                <proceedings-submission-modal :conference="selectedEvent" @create="selectNewlyAddedProceedings"></proceedings-submission-modal>
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="titleRef" v-model="title" :rules="requiredFieldRules" :label="$t('titleLabel') + '*'"
                    :initial-value="toMultilingualTextInput(presetProceedingsPublication?.title, languageTags)"></multilingual-text-input>
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
                <v-text-field v-model="doi" label="DOI" placeholder="DOI"></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="10">
                <v-select
                    v-model="selectedpublicationType"
                    :items="publicationTypes"
                    :label="$t('typeOfPublicationLabel') + '*'"
                    :rules="requiredSelectionRules"
                    return-object>
                </v-select>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input ref="subtitleRef" v-model="subtitle" :label="$t('subtitleLabel')" :initial-value="toMultilingualTextInput(presetProceedingsPublication?.subTitle, languageTags)"></multilingual-text-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="10">
                <v-text-field v-model="scopus" label="Scopus ID" placeholder="Scopus ID"></v-text-field>
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
import type { ProceedingsPublication, ProceedingsPublicationType } from '@/models/PublicationModel';
import UriInput from '@/components/core/UriInput.vue';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/TranslationUtil';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';
import type { Conference } from '@/models/EventModel';
import { getTitleFromValueAutoLocale, getTypesForGivenLocale } from '@/i18n/proceedingsPublicationType';
import { useI18n } from 'vue-i18n';
import EventService from '@/services/EventService';
import type { Proceedings, ProceedingsResponse } from '@/models/ProceedingsModel';
import ProceedingsService from '@/services/ProceedingsService';
import EventAutocompleteSearch from '@/components/event/EventAutocompleteSearch.vue';
import ProceedingsSubmissionModal from '@/components/proceedings/ProceedingsSubmissionModal.vue';


export default defineComponent({
    name: "ProceedingsPublicationUpdateForm",
    components: {MultilingualTextInput, UriInput, EventAutocompleteSearch, ProceedingsSubmissionModal},
    props: {
        presetProceedingsPublication: {
            type: Object as PropType<ProceedingsPublication | undefined>,
            required: true
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const availableProceedings = ref<{title: string, value: number}[]>([]);
        const proceedings = ref<Proceedings>();
        const event = ref<Conference>();

        const languageTags = ref<LanguageTagResponse[]>([]);

        onMounted(() => {
            if(props.presetProceedingsPublication?.eventId && props.presetProceedingsPublication?.proceedingsId) {
                EventService.readConference(props.presetProceedingsPublication.eventId).then((response) => {
                    event.value = response.data;
                    selectedEvent.value = {title: returnCurrentLocaleContent(event.value.name) as string, value: event.value.id as number};

                    fetchProceedings(selectedEvent.value);
                });

                ProceedingsService.readProceedings(props.presetProceedingsPublication.proceedingsId).then((response) => {
                    proceedings.value = response.data;
                    selectedProceedings.value = {title: returnCurrentLocaleContent(proceedings.value.title) as string, value: proceedings.value.id as number};
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

        const searchPlaceholderProceedings = {title: returnCurrentLocaleContent(proceedings.value?.title) as string, value: proceedings.value?.id as number};
        const selectedProceedings = ref<{ title: string, value: number }>(searchPlaceholderProceedings);

        const searchPlaceholderEvent = {title: returnCurrentLocaleContent(event.value?.name) as string, value: event.value?.id as number};
        const selectedEvent = ref<{ title: string, value: number }>(searchPlaceholderEvent);

        const title = ref([]);
        const subtitle = ref([]);
        const startPage = ref(props.presetProceedingsPublication?.startPage);
        const endPage = ref(props.presetProceedingsPublication?.endPage);
        const publicationYear = ref(props.presetProceedingsPublication?.documentDate);
        const doi = ref(props.presetProceedingsPublication?.doi);
        const scopus = ref(props.presetProceedingsPublication?.scopusId);
        const articleNumber = ref(props.presetProceedingsPublication?.articleNumber);
        const numberOfPages = ref(props.presetProceedingsPublication?.numberOfPages);
        const uris = ref<string[]>(props.presetProceedingsPublication?.uris as string[]);

        const { requiredFieldRules, requiredSelectionRules } = useValidationUtils();
        
        const i18n = useI18n();
        const publicationTypes = computed(() => getTypesForGivenLocale());
        const selectedpublicationType = ref<{ title: string, value: ProceedingsPublicationType }>({title: props.presetProceedingsPublication?.proceedingsPublicationType ? getTitleFromValueAutoLocale(props.presetProceedingsPublication?.proceedingsPublicationType as ProceedingsPublicationType) as string : "", value: props.presetProceedingsPublication?.proceedingsPublicationType as ProceedingsPublicationType});

        const selectNewlyAddedProceedings = (proceedings: Proceedings) => {
            let title: string | undefined;
            proceedings.title.forEach(multilingualContent => {
                if(multilingualContent.languageTag === i18n.locale.value.toUpperCase()) {
                    title = multilingualContent.content;
                    return;
                }
            });
            if (!title && proceedings.title.length > 0) {
                title = proceedings.title[0].content;
            }
            const toSelect = {title: `${title} | ${proceedings.documentDate}`, value: proceedings.id as number};
            availableProceedings.value.push(toSelect);
            selectedProceedings.value = toSelect;
        };

        const fetchProceedings = (event: { title: string, value: number }) => {
            ProceedingsService.readProceedingsForEvent(event.value).then((response) => {
                response.data.forEach((proceedingsResponse: ProceedingsResponse) => {
                    let title: string | undefined;
                    proceedingsResponse.title.forEach(multilingualContent => {
                        if(multilingualContent.languageTag === i18n.locale.value.toUpperCase()) {
                            title = multilingualContent.content;
                            return;
                        }
                    });
                    if (!title && proceedingsResponse.title.length > 0) {
                        title = proceedingsResponse.title[0].content;
                    }

                    availableProceedings.value.push({title: `${title} | ${proceedingsResponse.documentDate}`, value: proceedingsResponse.id as number })
                });
            });
        };

        const updateProceedingsPublication = () => {
            const updatedProceedingsPublication: ProceedingsPublication = {
                title: title.value as MultilingualContent[],
                startPage: startPage.value as string,
                endPage: endPage.value as string,
                numberOfPages: numberOfPages.value as number,
                articleNumber: articleNumber.value as string,
                description: props.presetProceedingsPublication?.description as MultilingualContent[],
                keywords: props.presetProceedingsPublication?.keywords as MultilingualContent[],
                subTitle: subtitle.value as MultilingualContent[],
                uris: uris.value,
                contributions: props.presetProceedingsPublication?.contributions,
                documentDate: publicationYear.value,
                scopusId: scopus.value,
                doi: doi.value,
                eventId: selectedEvent.value.value,
                proceedingsPublicationType: selectedpublicationType.value.value as ProceedingsPublicationType,
                proceedingsId: selectedProceedings.value.value,
                fileItems: [],
                proofs: [],
            };

            emit("update", updatedProceedingsPublication);
        };

        return {
            isFormValid,
            title, titleRef,
            subtitle, subtitleRef,
            publicationYear, doi, scopus,
            selectedProceedings, articleNumber,
            descriptionRef, uris, numberOfPages,
            urisRef, requiredFieldRules, selectedEvent,
            updateProceedingsPublication, toMultilingualTextInput,
            languageTags, startPage, endPage, requiredSelectionRules,
            publicationTypes, selectedpublicationType, availableProceedings,
            selectNewlyAddedProceedings
        };
    }
});
</script>
