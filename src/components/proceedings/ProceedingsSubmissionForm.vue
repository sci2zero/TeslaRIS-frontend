<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col :cols="inModal ? 12 : 8">
                <v-row>
                    <v-col cols="11">
                        <i-d-f-metadata-prepopulator
                            :document-type="PublicationType.PROCEEDINGS"
                            @metadata-fetched="popuateMetadata"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input
                            ref="titleRef"
                            v-model="title"
                            :rules="requiredFieldRules"
                            :label="$t('titleLabel') + '*'">
                        </multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="10">
                        <event-autocomplete-search
                            ref="eventAutocompleteRef"
                            v-model="selectedEvent"
                            required
                            :read-only="conference.value > 0">
                        </event-autocomplete-search>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="10">
                        <v-text-field
                            v-model="publicationYear"
                            :rules="requiredFieldRules"
                            :label="$t('yearOfPublicationLabel') + '*'"
                            :placeholder="$t('yearOfPublicationLabel')">
                        </v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="10">
                        <publisher-autocomplete-search
                            ref="publisherAutocompleteRef"
                            v-model="selectedPublisher"
                            allow-author-reprint>
                        </publisher-autocomplete-search>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="5">
                        <v-text-field
                            v-model="eIsbn"
                            label="E-ISBN"
                            placeholder="E-ISBN"
                            :rules="isbnValidationRules">
                        </v-text-field>
                    </v-col>
                    <v-col cols="5">
                        <v-text-field
                            v-model="printIsbn"
                            label="Print ISBN"
                            placeholder="Print ISBN"
                            :rules="isbnValidationRules">
                        </v-text-field>
                    </v-col>
                </v-row>

                <v-btn color="blue darken-1" @click="additionalFields = !additionalFields">
                    {{ $t("additionalFieldsLabel") }} {{ additionalFields ? "▲" : "▼" }}
                </v-btn>
                <v-container v-if="additionalFields">
                    <v-row>
                        <v-col>
                            <multilingual-text-input
                                ref="subtitleRef"
                                v-model="subtitle"
                                :label="$t('subtitleLabel')">
                            </multilingual-text-input>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <multilingual-text-input
                                ref="acronymRef"
                                v-model="acronym"
                                :label="$t('nameAbbreviationLabel')">
                            </multilingual-text-input>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <multilingual-text-input
                                ref="descriptionRef"
                                v-model="description"
                                is-area
                                :label="$t('abstractLabel')">
                            </multilingual-text-input>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <multilingual-text-input
                                ref="keywordsRef"
                                v-model="keywords"
                                :label="$t('keywordsLabel')"
                                is-area>
                            </multilingual-text-input>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <uri-input ref="urisRef" v-model="uris"></uri-input>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="10">
                            <v-select
                                v-model="selectedLanguages"
                                :label="$t('languageLabel')"
                                :items="languageList"
                                multiple
                            ></v-select>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="10">
                            <v-text-field
                                v-model="numberOfPages"
                                type="number"
                                :label="$t('numberOfPagesLabel')"
                                :placeholder="$t('numberOfPagesLabel')">
                            </v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="10">
                            <journal-autocomplete-search
                                ref="journalAutocompleteRef"
                                v-model="selectedJournal"
                                allow-manual-clearing
                                :external-validation="publicationSeriesExternalValidation">
                            </journal-autocomplete-search>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="10">
                            <book-series-autocomplete-search
                                ref="bookSeriesAutocompleteRef"
                                v-model="selectedBookSeries"
                                allow-manual-clearing
                                :external-validation="publicationSeriesExternalValidation">
                            </book-series-autocomplete-search>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="5">
                            <v-text-field
                                v-model="publicationSeriesVolume"
                                :label="$t('publicationSeriesVolumeLabel')"
                                :placeholder="$t('publicationSeriesVolumeLabel')">
                            </v-text-field>
                        </v-col>
                        <v-col cols="5">
                            <v-text-field
                                v-model="publicationSeriesIssue"
                                :label="$t('publicationSeriesIssueLabel')"
                                :placeholder="$t('publicationSeriesIssueLabel')">
                            </v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="3">
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
                        <v-col cols="3">
                            <v-text-field
                                v-model="webOfScienceId"
                                label="Web of Science ID"
                                placeholder="Web of Science ID"
                                :rules="documentWebOfScienceIdValidationRules">
                            </v-text-field>
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
    
    <toast v-model="snackbar" :message="message" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MultilingualTextInput from '../core/MultilingualTextInput.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import type { LanguageTagResponse, PrepopulatedMetadata } from '@/models/Common';
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
import Toast from '../core/Toast.vue';
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import { useLanguageTags } from '@/composables/useLanguageTags';
import { PublicationType } from '@/models/PublicationModel';


export default defineComponent({
    name: "SubmitProceedings",
    components: {MultilingualTextInput, UriInput, EventAutocompleteSearch, JournalAutocompleteSearch, PublisherAutocompleteSearch, BookSeriesAutocompleteSearch, Toast},
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
        const acronymRef = ref<typeof MultilingualTextInput>();

        const eventAutocompleteRef = ref<typeof EventAutocompleteSearch>();
        const journalAutocompleteRef = ref<typeof JournalAutocompleteSearch>();
        const publisherAutocompleteRef = ref<typeof PublisherAutocompleteSearch>();
        const bookSeriesAutocompleteRef = ref<typeof BookSeriesAutocompleteSearch>();

        const searchPlaceholder = {title: "", value: -1};
        const selectedEvent = ref<{ title: string, value: number }>(props.conference);
        const selectedJournal = ref<{ title: string, value: number }>(searchPlaceholder);
        const selectedPublisher = ref<{ title: string, value: number }>(searchPlaceholder);
        const selectedBookSeries = ref<{ title: string, value: number }>(searchPlaceholder);

        const title = ref<any[]>([]);
        const subtitle = ref([]);
        const acronym = ref([]);
        const uris = ref<string[]>([]);
        const keywords = ref([]);
        const description = ref([]);
        const eIsbn = ref("");
        const printIsbn = ref("");
        const numberOfPages = ref();
        const publicationYear = ref("");
        const doi = ref("");
        const scopus = ref("");
        const openAlexId = ref("");
        const webOfScienceId = ref("");
        const publicationSeriesVolume = ref("");
        const publicationSeriesIssue = ref("");

        const setPublicationYear = (date: string) => {
            const year = /\d{4}/.exec(date);
            if (year) {
                publicationYear.value = year[0];
            }
        };

        const {
            requiredFieldRules, doiValidationRules,
            isbnValidationRules, scopusIdValidationRules,
            workOpenAlexIdValidationRules,
            documentWebOfScienceIdValidationRules
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

        watch(selectedEvent, (newValue: any) => {
            setPublicationYear(newValue.date);
        });

        const submit = (stayOnPage: boolean) => {
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
                authorReprint: selectedPublisher.value.value === -2,
                scopusId: scopus.value,
                acronym: acronym.value,
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
                    openAlexId.value = "";
                    webOfScienceId.value = "";
                    numberOfPages.value = null;
                    eIsbn.value = "";
                    printIsbn.value = "";
                    publicationYear.value = "";
                    acronymRef.value?.clearInput();

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

        const { languageTags } = useLanguageTags();
        const popuateMetadata = async (metadata: PrepopulatedMetadata) => {
            if (title.value.length === 0) {
                title.value = metadata.title;
                titleRef.value?.forceRefreshModelValue(toMultilingualTextInput(title.value, languageTags.value));
            }
            
            publicationSeriesVolume.value = publicationSeriesVolume.value ? publicationSeriesVolume.value : metadata.volume;
            publicationSeriesIssue.value = publicationSeriesIssue.value ? publicationSeriesIssue.value : metadata.issue;
            uris.value.push(metadata.url);
            doi.value = doi.value ? doi.value : metadata.doi;

            if (metadata.publishedInName && selectedJournal.value.value <= 0) {
                selectedJournal.value = {title: metadata.publishedInName, value: metadata.publishEntityId};
            }
        };

        return {
            isFormValid, additionalFields, popuateMetadata,
            snackbar, message, isbnValidationRules, acronym,
            title, titleRef, subtitle, subtitleRef, PublicationType,
            eventAutocompleteRef, selectedEvent, openAlexId,
            journalAutocompleteRef, selectedJournal, uris, urisRef,
            eIsbn, printIsbn, languageList, selectedLanguages,
            description, descriptionRef, doiValidationRules,
            publicationYear, doi, scopus, numberOfPages,
            keywords, keywordsRef, setPublicationYear,
            publicationSeriesVolume, publicationSeriesIssue,
            publisherAutocompleteRef, selectedPublisher,
            bookSeriesAutocompleteRef, selectedBookSeries,
            requiredFieldRules, validatePublicationSeriesSelection, 
            publicationSeriesExternalValidation, submit, acronymRef,
            scopusIdValidationRules, workOpenAlexIdValidationRules,
            documentWebOfScienceIdValidationRules, webOfScienceId
        };
    }
});
</script>
