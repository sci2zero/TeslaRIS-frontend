<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="8">
                <v-row>
                    <v-col>
                        <multilingual-text-input ref="titleRef" :rules="requiredFieldRules" :label="$t('titleLabel') + '*'" @set-input="title = $event"></multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input ref="subtitleRef" :label="$t('subtitleLabel')" @set-input="subtitle = $event"></multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input ref="placeRef" :label="$t('placeLabel')" @set-input="place = $event"></multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="10">
                        <event-autocomplete-search ref="eventAutocompleteRef" @set-input="selectedEvent = $event"></event-autocomplete-search>
                    </v-col>
                </v-row>
                <v-btn color="blue darken-1" @click="additionalFields = !additionalFields">
                    {{ $t("additionalFieldsLabel") }} {{ additionalFields ? "▲" : "▼" }}
                </v-btn>
                <v-container v-if="additionalFields">
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
                        <v-col>
                            <multilingual-text-input ref="descriptionRef" is-area :label="$t('descriptionLabel')" @set-input="description = $event"></multilingual-text-input>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <multilingual-text-input ref="keywordsRef" :label="$t('keywordsLabel')" @set-input="keywords = $event"></multilingual-text-input>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <uri-input ref="urisRef" @set-input="uris = $event"></uri-input>
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
                        <v-col cols="6">
                            <v-text-field v-model="eIsbn" label="E-ISBN" placeholder="E-ISBN"></v-text-field>
                        </v-col>
                        <v-col cols="6">
                            <v-text-field v-model="printIsbn" label="Print ISBN" placeholder="Print ISBN"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="6">
                            <v-text-field v-model="numberOfPages" :label="$t('numberOfPagesLabel')" :placeholder="$t('numberOfPagesLabel')"></v-text-field>
                        </v-col>
                        <v-col cols="6">
                            <v-text-field v-model="articleNumber" :label="$t('articleNumberLabel')" :placeholder="$t('articleNumberLabel')"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field v-model="publicationYear" :label="$t('yearOfPublicationLabel')" :placeholder="$t('yearOfPublicationLabel')"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="6">
                            <v-text-field v-model="doi" label="DOI" placeholder="DOI"></v-text-field>
                        </v-col>
                        <v-col cols="6">
                            <v-text-field v-model="scopus" label="Scopus ID" placeholder="Scopus ID"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <journal-autocomplete-search ref="journalAutocompleteRef" @set-input="selectedJournal = $event"></journal-autocomplete-search>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <publisher-autocomplete-search ref="publisherAutocompleteRef" @set-input="selectedPublisher = $event"></publisher-autocomplete-search>
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
            <p style="margin-left: 20px;">
                {{ $t("requiredFieldsMessage") }}
            </p>
        </v-row>
    </v-form>
    <v-snackbar
        v-model="snackbar"
        :timeout="5000">
        {{ !error ? $t("savedMessage") : $t("genericErrorMessage") }}
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
import { ProceedingsPublicationType } from "@/models/ProceedingsModel";
import type { Proceedings } from "@/models/ProceedingsModel";


export default defineComponent({
    name: "SubmitProceedings",
    components: {MultilingualTextInput, UriInput, EventAutocompleteSearch, JournalAutocompleteSearch, PublisherAutocompleteSearch},
    setup() {
        const isFormValid = ref(false);
        const additionalFields = ref(false);

        const snackbar = ref(false);
        const error = ref(false);

        const router = useRouter();
        const i18n = useI18n();
        const requiredFieldMessage = computed(() => i18n.t("mandatoryFieldError"));

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
        })

        const titleRef = ref<typeof MultilingualTextInput>();
        const subtitleRef = ref<typeof MultilingualTextInput>();
        const placeRef = ref<typeof MultilingualTextInput>();
        const urisRef = ref<typeof MultilingualTextInput>();
        const descriptionRef = ref<typeof MultilingualTextInput>();
        const keywordsRef = ref<typeof MultilingualTextInput>();

        const eventAutocompleteRef = ref<typeof EventAutocompleteSearch>();
        const journalAutocompleteRef = ref<typeof JournalAutocompleteSearch>();
        const publisherAutocompleteRef = ref<typeof PublisherAutocompleteSearch>();
        const selectedEvent = ref<{ title: string, value: number }>();
        const selectedJournal = ref<{ title: string, value: number }>();
        const selectedPublisher = ref<{ title: string, value: number }>();

        const title = ref([]);
        const subtitle = ref([]);
        const place = ref([]);
        const uris = ref([]);
        const keywords = ref([]);
        const description = ref([]);
        const eIsbn = ref("");
        const printIsbn = ref("");
        const articleNumber = ref("");
        const numberOfPages = ref();
        const publicationYear = ref("");
        const doi = ref("");
        const scopus = ref("");
        const publicationSeriesVolume = ref("");
        const publicationSeriesIssue = ref("");

        const requiredFieldRules = [
            (value: string) => {
                if (!value) return requiredFieldMessage.value;
                return true;
            }
        ];

        const publicationTypeSr = [
            { title: "Redovan članak - pun tekst", value: ProceedingsPublicationType.REGULAR_FULL_ARTICLE },
            { title: "Pozvani članak - pun tekst", value: ProceedingsPublicationType.INVITED_FULL_ARTICLE },
            { title: "Pozvani članak - sažetak", value: ProceedingsPublicationType.INVITED_ABSTRACT_ARTICLE },
            { title: "Redovan članak - sažetak", value: ProceedingsPublicationType.REGULAR_ABSTRACT_ARTICLE },
            { title: "Predgovor", value: ProceedingsPublicationType.PREFACE },
            { title: "Leksikografska jedinica", value: ProceedingsPublicationType.LEXICOGRAPHIC_UNIT },
            { title: "Polemika", value: ProceedingsPublicationType.POLEMICS },
            { title: "Naučna kritika", value: ProceedingsPublicationType.SCIENTIFIC_CRITIC },
        ];

        const publicationTypeEn = [
            { title: "Regular Full Article", value: ProceedingsPublicationType.REGULAR_FULL_ARTICLE },
            { title: "Invited Full Article", value: ProceedingsPublicationType.INVITED_FULL_ARTICLE },
            { title: "Invited Abstract Article", value: ProceedingsPublicationType.INVITED_ABSTRACT_ARTICLE },
            { title: "Regular Abstract Article", value: ProceedingsPublicationType.REGULAR_ABSTRACT_ARTICLE },
            { title: "Preface", value: ProceedingsPublicationType.PREFACE },
            { title: "Lexicographic Unit", value: ProceedingsPublicationType.LEXICOGRAPHIC_UNIT },
            { title: "Polemics", value: ProceedingsPublicationType.POLEMICS },
            { title: "Scientific Critic", value: ProceedingsPublicationType.SCIENTIFIC_CRITIC },
        ];

        const publicationTypes = computed((): { title: string, value: ProceedingsPublicationType | null }[] => i18n.locale.value === "sr" ? publicationTypeSr : publicationTypeEn);
        const selectedpublicationType = ref<{ title: string, value: ProceedingsPublicationType | null }>({title: "", value: null});

        const submitProceedings = (stayOnPage: boolean) => {
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
                publicationSeriesId: undefined,
                publicationSeriesIssue: publicationSeriesIssue.value,
                publicationSeriesVolume: publicationSeriesVolume.value,
                publisherId: selectedPublisher.value?.value,
                scopusId: scopus.value,
                // TODO: treba li journal ???
            };

            console.log(newProceedings, stayOnPage, router);

            // JournalService.createJournal(newJournal).then(() => {
            //     if (stayOnPage) {
            //         titleRef.value?.clearInput();
            //         abbreviationsRef.value?.clearInput();
            //         eIssn.value = "";
            //         printIssn.value = "";
            //         selectedLanguages.value = [defaultLanguage.value];

            //         error.value = false;
            //         snackbar.value = true;
            //     } else {
            //         router.push({ name: "journals" });
            //     }
            // }).catch(() => {
            //     error.value = true;
            //     snackbar.value = true;
            // });
        };

        return {
            isFormValid, additionalFields,
            snackbar, error,
            title, titleRef, subtitle, subtitleRef,
            eventAutocompleteRef, selectedEvent,
            journalAutocompleteRef, selectedJournal,
            place, placeRef, uris, urisRef,
            eIsbn, printIsbn, languageList, selectedLanguages,
            description, descriptionRef,
            publicationYear, doi, scopus,
            articleNumber, numberOfPages,
            keywords, keywordsRef,
            publicationSeriesVolume, publicationSeriesIssue,
            publisherAutocompleteRef, selectedPublisher,
            publicationTypes, selectedpublicationType,
            requiredFieldRules, submitProceedings
        };
    }
});
</script>
