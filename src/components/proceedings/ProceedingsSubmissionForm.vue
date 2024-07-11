<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col :cols="inModal ? 12 : 8">
                <v-row>
                    <v-col>
                        <multilingual-text-input ref="titleRef" v-model="title" :rules="requiredFieldRules" :label="$t('titleLabel') + '*'"></multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <event-autocomplete-search ref="eventAutocompleteRef" v-model="selectedEvent" required :read-only="conference.value > 0"></event-autocomplete-search>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-text-field v-model="publicationYear" :rules="requiredFieldRules" :label="$t('yearOfPublicationLabel') + '*'" :placeholder="$t('yearOfPublicationLabel')"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <publisher-autocomplete-search ref="publisherAutocompleteRef" v-model="selectedPublisher"></publisher-autocomplete-search>
                    </v-col>
                </v-row>
                <v-btn color="blue darken-1" @click="additionalFields = !additionalFields">
                    {{ $t("additionalFieldsLabel") }} {{ additionalFields ? "▲" : "▼" }}
                </v-btn>
                <v-container v-if="additionalFields">
                    <v-row>
                        <v-col>
                            <multilingual-text-input ref="subtitleRef" v-model="subtitle" :label="$t('subtitleLabel')"></multilingual-text-input>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <multilingual-text-input ref="descriptionRef" v-model="description" is-area :label="$t('descriptionLabel')"></multilingual-text-input>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <multilingual-text-input ref="keywordsRef" v-model="keywords" :label="$t('keywordsLabel')" is-area></multilingual-text-input>
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
                            <v-text-field v-model="numberOfPages" type="number" :label="$t('numberOfPagesLabel')" :placeholder="$t('numberOfPagesLabel')"></v-text-field>
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
                        <v-col cols="6">
                            <v-text-field v-model="doi" label="DOI" placeholder="DOI" :rules="doiValidationRules"></v-text-field>
                        </v-col>
                        <v-col cols="6">
                            <v-text-field v-model="scopus" label="Scopus ID" placeholder="Scopus ID" :rules="scopusIdValidationRules"></v-text-field>
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
                </v-container>
            </v-col>
        </v-row>

        <v-row>
            <p class="required-fields-message">
                {{ $t("requiredFieldsMessage") }}
            </p>
        </v-row>
    </v-form>
    <v-snackbar
        v-model="snackbar"
        :timeout="5000">
        {{ message }}
        <template #actions>
            <v-btn
                color="blue"
                variant="text"
                @click="snackbar = false">
                {{ $t("closeLabel") }}
            </v-btn>
        </template>
    </v-snackbar>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MultilingualTextInput from '../core/MultilingualTextInput.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import type { LanguageTagResponse } from '@/models/Common';
import { onMounted } from 'vue';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';
import UriInput from '../core/UriInput.vue';
import EventAutocompleteSearch from '../event/EventAutocompleteSearch.vue';
import JournalAutocompleteSearch from '../journal/JournalAutocompleteSearch.vue';
import PublisherAutocompleteSearch from '../publisher/PublisherAutocompleteSearch.vue';
import type { Proceedings } from "@/models/ProceedingsModel";
import BookSeriesAutocompleteSearch from '../bookSeries/BookSeriesAutocompleteSearch.vue';
import { watch } from 'vue';
import type { ExternalValidation } from "@/models/Common";
import ProceedingsService from '@/services/ProceedingsService';
import { useValidationUtils } from '@/utils/ValidationUtils';
import type { PropType } from 'vue';
import { getErrorMessageForErrorKey } from '@/i18n';


export default defineComponent({
    name: "SubmitProceedings",
    components: {MultilingualTextInput, UriInput, EventAutocompleteSearch, JournalAutocompleteSearch, PublisherAutocompleteSearch, BookSeriesAutocompleteSearch},
    props: {
        inModal: {
            type: Boolean,
            default: false
        },
        conference: {
            type: Object as PropType<{title: string, value: number}>,
            default: () => ({ title: "", value: -1 })
        }
    },
    emits: ["create"],
    setup(props, {emit}) {
        const isFormValid = ref(false);
        const additionalFields = ref(false);

        const snackbar = ref(false);
        const message = ref("");

        const router = useRouter();
        const i18n = useI18n();
        const selectOneMessage = computed(() => i18n.t("selectOnePublicationSeriesMessage"));

        const languageList = ref<{title: string, value: number}[]>([]);
        const selectedLanguages = ref<number[]>([]);
        const defaultLanguage = ref(-1);

        onMounted(() => {
            LanguageService.getAllLanguageTags().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                response.data.forEach((languageTag: LanguageTagResponse) => {
                    languageList.value.push({title: `${languageTag.display} (${languageTag.languageCode})`, value: languageTag.id});
                    if (i18n.locale.value.toUpperCase() === languageTag.languageCode) {
                        selectedLanguages.value.push(languageTag.id);
                        defaultLanguage.value = languageTag.id;
                    }
                })
            });
        });

        const titleRef = ref<typeof MultilingualTextInput>();
        const subtitleRef = ref<typeof MultilingualTextInput>();
        const urisRef = ref<typeof MultilingualTextInput>();
        const descriptionRef = ref<typeof MultilingualTextInput>();
        const keywordsRef = ref<typeof MultilingualTextInput>();

        const eventAutocompleteRef = ref<typeof EventAutocompleteSearch>();
        const journalAutocompleteRef = ref<typeof JournalAutocompleteSearch>();
        const publisherAutocompleteRef = ref<typeof PublisherAutocompleteSearch>();
        const bookSeriesAutocompleteRef = ref<typeof BookSeriesAutocompleteSearch>();

        const searchPlaceholder = {title: "", value: -1};
        const selectedEvent = ref<{ title: string, value: number }>(props.conference);
        const selectedJournal = ref<{ title: string, value: number }>(searchPlaceholder);
        const selectedPublisher = ref<{ title: string, value: number }>(searchPlaceholder);
        const selectedBookSeries = ref<{ title: string, value: number }>(searchPlaceholder);

        const title = ref([]);
        const subtitle = ref([]);
        const uris = ref([]);
        const keywords = ref([]);
        const description = ref([]);
        const eIsbn = ref("");
        const printIsbn = ref("");
        const numberOfPages = ref();
        const publicationYear = ref("");
        const doi = ref("");
        const scopus = ref("");
        const publicationSeriesVolume = ref("");
        const publicationSeriesIssue = ref("");

        const setPublicationYear = (date: string) => {
            const year = /\d{4}/.exec(date);
            if (year) {
                publicationYear.value = year[0];
            }
        };

        const { requiredFieldRules, doiValidationRules, isbnValidationRules, scopusIdValidationRules } = useValidationUtils();

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

        watch(selectedEvent, (newValue: any) => {
            setPublicationYear(newValue.date);
        });

        const submitProceedings = (stayOnPage: boolean) => {
            let publicationSeriesId: number | undefined = selectedBookSeries.value?.value !== -1 ? selectedBookSeries.value?.value : selectedJournal.value?.value;
            if (publicationSeriesId === -1) {
                publicationSeriesId = undefined;
            }

            const newProceedings: Proceedings = {
                description: description.value,
                keywords: keywords.value,
                subTitle: subtitle.value,
                title: title.value,
                uris: uris.value,
                contributions: [],
                documentDate: publicationYear.value,
                doi: doi.value,
                eISBN: eIsbn.value,
                eventId: selectedEvent.value?.value,
                languageTagIds: selectedLanguages.value,
                numberOfPages: numberOfPages.value,
                printISBN: printIsbn.value,
                publicationSeriesId: publicationSeriesId,
                publicationSeriesIssue: publicationSeriesIssue.value,
                publicationSeriesVolume: publicationSeriesVolume.value,
                publisherId: selectedPublisher.value?.value !== -1 ? selectedPublisher.value?.value : undefined,
                scopusId: scopus.value,
                fileItems: [],
                proofs: []
            };

            ProceedingsService.createProceedings(newProceedings).then((response) => {
                if (props.inModal) {
                    emit("create", response.data);
                    return;
                }

                if (stayOnPage) {
                    titleRef.value?.clearInput();
                    subtitleRef.value?.clearInput();
                    descriptionRef.value?.clearInput();
                    keywordsRef.value?.clearInput();
                    urisRef.value?.clearInput();
                    eventAutocompleteRef.value?.clearInput();
                    doi.value = "";
                    scopus.value = "";
                    numberOfPages.value = null;
                    eIsbn.value = "";
                    printIsbn.value = "";
                    publicationYear.value = "";

                    message.value = i18n.t("savedMessage")
                    snackbar.value = true;
                } else {
                    router.push({ name: "proceedingsLandingPage", params: {id: response.data.id} });
                }
            }).catch((error) => {
                message.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
            });
        };

        return {
            isFormValid, additionalFields,
            snackbar, message, isbnValidationRules,
            title, titleRef, subtitle, subtitleRef,
            eventAutocompleteRef, selectedEvent,
            journalAutocompleteRef, selectedJournal, uris, urisRef,
            eIsbn, printIsbn, languageList, selectedLanguages,
            description, descriptionRef, doiValidationRules,
            publicationYear, doi, scopus, numberOfPages,
            keywords, keywordsRef, setPublicationYear,
            publicationSeriesVolume, publicationSeriesIssue,
            publisherAutocompleteRef, selectedPublisher,
            bookSeriesAutocompleteRef, selectedBookSeries,
            requiredFieldRules, validatePublicationSeriesSelection, 
            publicationSeriesExternalValidation, submitProceedings,
            scopusIdValidationRules
        };
    }
});
</script>
