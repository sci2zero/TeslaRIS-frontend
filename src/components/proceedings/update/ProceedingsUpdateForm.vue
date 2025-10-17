<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="12">
                <v-row>
                    <v-col>
                        <multilingual-text-input
                            ref="titleRef" v-model="title" :rules="requiredFieldRules" :label="$t('titleLabel') + '*'"
                            :initial-value="toMultilingualTextInput(presetProceedings?.title, languageTags)"></multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <event-autocomplete-search ref="eventAutocompleteRef" v-model="selectedEvent" required :read-only="inComparator"></event-autocomplete-search>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-text-field v-model="publicationYear" :rules="requiredFieldRules" :label="$t('yearOfPublicationLabel') + '*'" :placeholder="$t('yearOfPublicationLabel')"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <publisher-autocomplete-search
                            ref="publisherAutocompleteRef"
                            v-model="selectedPublisher"
                            allow-author-reprint>
                        </publisher-autocomplete-search>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input ref="subtitleRef" v-model="subtitle" :label="$t('subtitleLabel')" :initial-value="toMultilingualTextInput(presetProceedings?.subTitle, languageTags)"></multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input ref="acronymRef" v-model="acronym" :label="$t('nameAbbreviationLabel')" :initial-value="toMultilingualTextInput(presetProceedings?.acronym, languageTags)"></multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <uri-input ref="urisRef" v-model="uris"></uri-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-select
                            v-model="selectedLanguages"
                            :label="$t('languageLabel')"
                            :items="languageList"
                            multiple
                        ></v-select>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-text-field
                            v-model="numberOfPages"
                            type="number"
                            :label="$t('numberOfPagesLabel')"
                            :placeholder="$t('numberOfPagesLabel')"
                            :rules="optionalNumericZeroOrGreaterFieldRules">
                        </v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="6">
                        <v-text-field v-model="eIsbn" label="E-ISBN" placeholder="E-ISBN" :rules="isbnValidationRules"></v-text-field>
                    </v-col>
                    <v-col cols="6">
                        <v-text-field v-model="printIsbn" label="Print ISBN" placeholder="Print ISBN" :rules="isbnValidationRules"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-text-field v-model="doi" label="DOI" placeholder="DOI" :rules="doiValidationRules"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <journal-autocomplete-search ref="journalAutocompleteRef" v-model="selectedJournal" allow-manual-clearing :external-validation="publicationSeriesExternalValidation"></journal-autocomplete-search>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <book-series-autocomplete-search ref="bookSeriesAutocompleteRef" v-model="selectedBookSeries" allow-manual-clearing :external-validation="publicationSeriesExternalValidation"></book-series-autocomplete-search>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="6">
                        <v-text-field v-model="publicationSeriesVolume" :label="$t('publicationSeriesVolumeLabel')" :placeholder="$t('publicationSeriesVolumeLabel')"></v-text-field>
                    </v-col>
                    <v-col cols="6">
                        <v-text-field v-model="publicationSeriesIssue" :label="$t('publicationSeriesIssueLabel')" :placeholder="$t('publicationSeriesIssueLabel')"></v-text-field>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="4">
                <v-text-field
                    v-model="scopus"
                    label="Scopus ID"
                    placeholder="Scopus ID"
                    :rules="scopusIdValidationRules">
                </v-text-field>
            </v-col>
            <v-col cols="4">
                <v-text-field
                    v-model="openAlexId"
                    label="Open Alex ID"
                    placeholder="Open Alex ID"
                    :rules="workOpenAlexIdValidationRules">
                </v-text-field>
            </v-col>
            <v-col cols="4">
                <v-text-field
                    v-model="webOfScienceId"
                    label="Web of Science ID"
                    placeholder="Web of Science ID"
                    :rules="documentWebOfScienceIdValidationRules">
                </v-text-field>
            </v-col>
        </v-row>

        <v-row>
            <p class="required-fields-message">
                {{ $t("requiredFieldsMessage") }}
            </p>
        </v-row>
    </v-form>

    <toast v-model="snackbar" :message="message" />
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import { ref } from 'vue';
import type { ExternalValidation, LanguageTagResponse, MultilingualContent } from '@/models/Common';
import { onMounted } from 'vue';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';
import { useValidationUtils } from '@/utils/ValidationUtils';
import type { Proceedings } from '@/models/ProceedingsModel';
import EventAutocompleteSearch from '@/components/event/EventAutocompleteSearch.vue';
import JournalAutocompleteSearch from '@/components/journal/JournalAutocompleteSearch.vue';
import PublisherAutocompleteSearch from '@/components/publisher/PublisherAutocompleteSearch.vue';
import BookSeriesAutocompleteSearch from '@/components/bookSeries/BookSeriesAutocompleteSearch.vue';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import UriInput from '@/components/core/UriInput.vue';
import JournalService from '@/services/JournalService';
import BookSeriesService from '@/services/BookSeriesService';
import EventService from '@/services/EventService';
import PublisherService from '@/services/PublisherService';
import { watch } from 'vue';
import ProceedingsService from '@/services/ProceedingsService';
import Toast from '@/components/core/Toast.vue';


export default defineComponent({
    name: "ProceedingsUpdateForm",
    components: {MultilingualTextInput, UriInput, EventAutocompleteSearch, JournalAutocompleteSearch, PublisherAutocompleteSearch, BookSeriesAutocompleteSearch, Toast},
    props: {
        presetProceedings: {
            type: Object as PropType<Proceedings | undefined>,
            required: true
        },
        inComparator: {
            type: Boolean,
            default: false
        },
        inModal: {
            type: Boolean,
            default: true
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const snackbar = ref(false);
        const message = ref("");
        const i18n = useI18n();

        const selectOneMessage = computed(() => i18n.t("selectOnePublicationSeriesMessage"));

        const languageList = ref<{title: string, value: number}[]>([]);
        const selectedLanguages = ref<number[]>(props.presetProceedings?.languageTagIds as number[]);
        const languageTags = ref<LanguageTagResponse[]>([]);

        onMounted(() => {
            LanguageService.getAllLanguageTags().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                languageTags.value = response.data;
                
                response.data.forEach((languageTag: LanguageTagResponse) => {
                    languageList.value.push({title: `${languageTag.display} (${languageTag.languageCode})`, value: languageTag.id});
                })
            });
            
            fetchDetails();
        });

        const fetchDetails = () => {
            if (props.presetProceedings?.eventId) {
                EventService.readConference(props.presetProceedings?.eventId as number).then((response) => {
                    selectedEvent.value = {title: returnCurrentLocaleContent(response.data.name) as string, value: props.presetProceedings?.eventId as number};
                });
            }

            if(props.presetProceedings?.publisherId) {
                PublisherService.readPublisher(props.presetProceedings.publisherId).then((response) => {
                    selectedPublisher.value = {title: returnCurrentLocaleContent(response.data.name) as string, value: props.presetProceedings?.publisherId as number};
                });
            } else if (props.presetProceedings?.authorReprint) {
                selectedPublisher.value = {title: "", value: -2};
            }

            if(props.presetProceedings?.publicationSeriesId) {
                JournalService.readJournal(props.presetProceedings?.publicationSeriesId).then((journalResponse) => {
                    selectedJournal.value = {title: returnCurrentLocaleContent(journalResponse.data.title) as string, value: journalResponse.data.id as number};
                }).catch(() => {
                    BookSeriesService.readBookSeries(props.presetProceedings?.publicationSeriesId as number).then((bookSeriesResponse) => {
                        selectedBookSeries.value = {title: returnCurrentLocaleContent(bookSeriesResponse.data.title) as string, value: bookSeriesResponse.data.id as number};
                    });
                });
            }
        };

        watch(() => props.presetProceedings, () => {
            if (props.presetProceedings) {
                refreshForm();
            }
        });

        const searchPlaceholder = {title: "", value: -1};
        const selectedEvent = ref<{ title: string, value: number }>(searchPlaceholder);
        const selectedJournal = ref<{ title: string, value: number }>(searchPlaceholder);
        const selectedPublisher = ref<{ title: string, value: number }>(searchPlaceholder);
        const selectedBookSeries = ref<{ title: string, value: number }>(searchPlaceholder);

        const titleRef = ref<typeof MultilingualTextInput>();
        const subtitleRef = ref<typeof MultilingualTextInput>();
        const acronymRef = ref<typeof MultilingualTextInput>();

        const title = ref<any>([]);
        const subtitle = ref<any>([]);
        const acronym = ref<any>([]);
        const uris = ref(props.presetProceedings?.uris as string[]);
        const eIsbn = ref(props.presetProceedings?.eISBN);
        const printIsbn = ref(props.presetProceedings?.printISBN);
        const numberOfPages = ref(props.presetProceedings?.numberOfPages);
        const publicationYear = ref(props.presetProceedings?.documentDate);
        const doi = ref(props.presetProceedings?.doi);
        const openAlexId = ref(props.presetProceedings?.openAlexId);
        const webOfScienceId = ref(props.presetProceedings?.webOfScienceId);
        const scopus = ref(props.presetProceedings?.scopusId);
        const publicationSeriesVolume = ref(props.presetProceedings?.publicationSeriesVolume);
        const publicationSeriesIssue = ref(props.presetProceedings?.publicationSeriesIssue);

        const {
            requiredFieldRules, doiValidationRules,
            isbnValidationRules, scopusIdValidationRules,
            workOpenAlexIdValidationRules,
            documentWebOfScienceIdValidationRules,
            optionalNumericZeroOrGreaterFieldRules
        } = useValidationUtils();

        const publicationSeriesExternalValidation = ref<ExternalValidation>({ passed: true, message: "" });
        const validatePublicationSeriesSelection = (): void => {
            if (selectedBookSeries.value.value !== -1 && selectedJournal.value.value !== -1) {
                publicationSeriesExternalValidation.value = { passed: false, message: selectOneMessage.value };
            } else {
                publicationSeriesExternalValidation.value = { passed: true, message: "" };
            }
        };

        watch([selectedJournal, selectedBookSeries], () => {
            validatePublicationSeriesSelection();
        });
        
        const submit = async () => {
            if (props.inModal) {
                const proceedingsId = props.presetProceedings?.id as number;
                const identifiers = [
                    { value: eIsbn.value, error: "eisbnExistsError" },
                    { value: printIsbn.value, error: "printIsbnExistsError" },
                    { value: doi.value, error: "doiExistsError" },
                    { value: scopus.value, error: "scopusIdExistsError" },
                    { value: webOfScienceId.value as string, error: "webOfScienceIdExistsError"}
                ].filter(id => id.value);

                const results = await Promise.all(
                    identifiers.map(id => ProceedingsService.checkProceedingsIdentifierUsage(id.value as string, proceedingsId))
                );

                const firstDuplicate = identifiers.find((_, index) => results[index].data);
                if (firstDuplicate) {
                    message.value = i18n.t(firstDuplicate.error);
                    snackbar.value = true;
                    return;
                }

                let publicationSeriesId: number | undefined = selectedBookSeries.value?.value !== -1 ? selectedBookSeries.value?.value : selectedJournal.value?.value;
                if (publicationSeriesId === -1) {
                    publicationSeriesId = undefined;
                }
            }

            let publicationSeriesId: number | undefined = selectedBookSeries.value?.value !== -1 ? selectedBookSeries.value?.value : selectedJournal.value?.value;
            if (publicationSeriesId === -1) {
                publicationSeriesId = undefined;
            }

            const updatedProceedings: Proceedings = {
                description: props.presetProceedings?.description as MultilingualContent[],
                keywords: props.presetProceedings?.keywords as MultilingualContent[],
                subTitle: subtitle.value,
                title: title.value,
                uris: uris.value as string[],
                contributions: props.presetProceedings?.contributions,
                documentDate: publicationYear.value,
                doi: doi.value,
                openAlexId: openAlexId.value,
                webOfScienceId: webOfScienceId.value,
                eISBN: eIsbn.value,
                eventId: selectedEvent.value?.value,
                languageTagIds: selectedLanguages.value,
                numberOfPages: numberOfPages.value,
                printISBN: printIsbn.value,
                publicationSeriesId: publicationSeriesId,
                publicationSeriesIssue: publicationSeriesIssue.value,
                publicationSeriesVolume: publicationSeriesVolume.value,
                publisherId: (!selectedPublisher.value || selectedPublisher.value.value < 0) ? undefined : selectedPublisher.value.value,
                authorReprint: selectedPublisher.value?.value === -2,
                scopusId: scopus.value,
                fileItems: [],
                proofs: []
            };

            emit("update", updatedProceedings);
        };

        const refreshForm = () => {
            titleRef.value?.clearInput();
            title.value = props.presetProceedings?.title as MultilingualContent[];

            subtitleRef.value?.clearInput();
            subtitle.value = props.presetProceedings?.subTitle as MultilingualContent[];

            acronymRef.value?.clearInput();
            acronym.value = props.presetProceedings?.acronym as MultilingualContent[];

            selectedLanguages.value = props.presetProceedings?.languageTagIds as number[];
            uris.value = props.presetProceedings?.uris as string[];
            eIsbn.value = props.presetProceedings?.eISBN;
            printIsbn.value = props.presetProceedings?.printISBN;
            numberOfPages.value = props.presetProceedings?.numberOfPages;
            publicationYear.value = props.presetProceedings?.documentDate;
            doi.value = props.presetProceedings?.doi;
            openAlexId.value = props.presetProceedings?.openAlexId;
            webOfScienceId.value = props.presetProceedings?.webOfScienceId;
            scopus.value = props.presetProceedings?.scopusId;
            publicationSeriesVolume.value = props.presetProceedings?.publicationSeriesVolume;
            publicationSeriesIssue.value = props.presetProceedings?.publicationSeriesIssue;

            titleRef.value?.forceRefreshModelValue(toMultilingualTextInput(title.value, languageTags.value));
            subtitleRef.value?.forceRefreshModelValue(toMultilingualTextInput(subtitle.value, languageTags.value));

            fetchDetails();
        };

        return {
            isFormValid, isbnValidationRules, openAlexId,
            title, subtitle, selectedEvent, selectedJournal, uris,
            eIsbn, printIsbn, languageList, selectedLanguages,
            languageTags, publicationYear, doi, scopus, numberOfPages, acronymRef,
            toMultilingualTextInput, publicationSeriesVolume, publicationSeriesIssue,
            selectedPublisher, selectedBookSeries, doiValidationRules, acronym,
            requiredFieldRules, validatePublicationSeriesSelection, webOfScienceId,
            publicationSeriesExternalValidation, submit, snackbar, message,
            scopusIdValidationRules, refreshForm, titleRef, subtitleRef,
            workOpenAlexIdValidationRules, documentWebOfScienceIdValidationRules,
            optionalNumericZeroOrGreaterFieldRules
        };
    }
});
</script>
