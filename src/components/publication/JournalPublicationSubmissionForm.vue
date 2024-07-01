<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col :cols="inModal ? 12 : 10">
                <v-row>
                    <v-col cols="10">
                        <journal-autocomplete-search ref="journalAutocompleteRef" v-model="selectedJournal" required></journal-autocomplete-search>
                    </v-col>
                </v-row>

                <v-row v-if="selectedJournal.value != -1 && myPublications.length > 0">
                    <v-col>
                        <h3>{{ $t("recentPublicationsLabel") }}</h3>
                        <p
                            v-for="(publicationIndex, i) in myPublications"
                            :key="i"
                            :value="publicationIndex"
                        >
                            {{ $i18n.locale === "sr" ? publicationIndex.titleSr : publicationIndex.titleOther }}
                        </p>
                    </v-col>
                </v-row>
                <v-row v-if="selectedJournal.value != -1 && myPublications.length == 0">
                    <v-col><h3>{{ $t("noRecentPublicationsJournalLabel") }}</h3></v-col>
                </v-row>

                <v-row>
                    <v-col>
                        <multilingual-text-input ref="titleRef" v-model="title" :rules="requiredFieldRules" :label="$t('titleLabel') + '*'"></multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input ref="subtitleRef" v-model="subtitle" :label="$t('subtitleLabel')"></multilingual-text-input>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col>
                        <h2>{{ $t("authorsLabel") }}</h2>
                        <person-publication-contribution ref="contributionsRef" basic @set-input="contributions = $event"></person-publication-contribution>
                    </v-col>
                </v-row>

                <v-btn color="blue darken-1" @click="additionalFields = !additionalFields">
                    {{ $t("additionalFieldsLabel") }} {{ additionalFields ? "▲" : "▼" }}
                </v-btn>
                <v-container v-if="additionalFields">
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
                            <v-text-field v-model="doi" label="DOI" placeholder="DOI" :rules="doiValidationRules"></v-text-field>
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
                        <v-col cols="10">
                            <event-autocomplete-search ref="eventAutocompleteRef" v-model="selectedEvent"></event-autocomplete-search>
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
        {{ !error ? $t("savedMessage") : errorMessage }}
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
import JournalAutocompleteSearch from '../journal/JournalAutocompleteSearch.vue';
import EventAutocompleteSearch from '../event/EventAutocompleteSearch.vue';
import type { DocumentPublicationIndex, JournalPublication, JournalPublicationType } from "@/models/PublicationModel";
import DocumentPublicationService from "@/services/DocumentPublicationService";
import UriInput from '../core/UriInput.vue';
import PersonPublicationContribution from './PersonPublicationContribution.vue';
import { watch } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import type { AxiosError } from 'axios';
import type { ErrorResponse } from '@/models/Common';
import { getTypesForGivenLocale } from '@/i18n/journalPublicationType';


export default defineComponent({
    name: "SubmitJournalPublication",
    components: {MultilingualTextInput, UriInput, PersonPublicationContribution, EventAutocompleteSearch, JournalAutocompleteSearch},
    props: {
        inModal: {
            type: Boolean,
            default: false
        }
    },
    setup() {
        const isFormValid = ref(false);
        const additionalFields = ref(false);

        const snackbar = ref(false);
        const error = ref(false);

        const router = useRouter();

        const titleRef = ref<typeof MultilingualTextInput>();
        const subtitleRef = ref<typeof MultilingualTextInput>();
        const descriptionRef = ref<typeof MultilingualTextInput>();
        const keywordsRef = ref<typeof MultilingualTextInput>();
        const contributionsRef = ref<typeof PersonPublicationContribution>();
        const urisRef = ref<typeof UriInput>();

        const eventAutocompleteRef = ref<typeof EventAutocompleteSearch>();
        const journalAutocompleteRef = ref<typeof JournalAutocompleteSearch>();

        const searchPlaceholder = {title: "", value: -1};
        const selectedJournal = ref<{ title: string, value: number }>(searchPlaceholder);
        const selectedEvent = ref<{ title: string, value: number }>(searchPlaceholder);

        const myPublications = ref<DocumentPublicationIndex[]>([]);

        const title = ref([]);
        const subtitle = ref([]);
        const description = ref([]);
        const keywords = ref([]);
        const contributions = ref([]);
        const volume = ref("");
        const issue = ref("");
        const startPage = ref("");
        const endPage = ref("");
        const publicationYear = ref("");
        const doi = ref("");
        const scopus = ref("");
        const articleNumber = ref("");
        const numberOfPages = ref();
        const uris = ref<string[]>([]);

        const i18n = useI18n();
        const errorMessage = ref(i18n.t("genericErrorMessage"));

        const { requiredFieldRules, doiValidationRules } = useValidationUtils();

        const publicationTypes = computed(() => getTypesForGivenLocale());
        const selectedpublicationType = ref<{ title: string, value: JournalPublicationType | null }>({title: "", value: null});

        const listPublications = (journal: { title: string, value: number }) => {
            DocumentPublicationService.findMyPublicationsInJournal(journal.value).then((response) => {
                myPublications.value = response.data;
            });
        };

        watch(selectedJournal, (newValue) => {
            listPublications(newValue);
        });

        const submitJournalPublication = (stayOnPage: boolean) => {
            const newJournalPublication: JournalPublication = {
                title: title.value,
                articleNumber: articleNumber.value,
                description: description.value,
                endPage: endPage.value,
                issue: issue.value,
                journalId: selectedJournal.value.value,
                journalPublicationType: selectedpublicationType.value.value as JournalPublicationType,
                keywords: keywords.value,
                numberOfPages: numberOfPages.value,
                startPage: startPage.value,
                subTitle: subtitle.value,
                uris: uris.value,
                volume: volume.value,
                contributions: contributions.value,
                documentDate: publicationYear.value,
                scopusId: scopus.value,
                doi: doi.value,
                eventId: selectedEvent.value.value === -1 ? undefined : selectedEvent.value.value,
                fileItems: [],
                proofs: []
            };

            DocumentPublicationService.createJournalPublication(newJournalPublication).then((response) => {
                if (stayOnPage) {
                    titleRef.value?.clearInput();
                    subtitleRef.value?.clearInput();
                    descriptionRef.value?.clearInput();
                    keywordsRef.value?.clearInput();
                    urisRef.value?.clearInput();
                    contributionsRef.value?.clearInput();
                    eventAutocompleteRef.value?.clearInput();
                    journalAutocompleteRef.value?.clearInput();
                    selectedpublicationType.value = {title: "", value: null};
                    volume.value = "";
                    issue.value = "";
                    startPage.value = "";
                    endPage.value = "";
                    publicationYear.value = "";
                    doi.value = "";
                    scopus.value = "";
                    articleNumber.value = "";
                    numberOfPages.value = null;

                    error.value = false;
                    snackbar.value = true;
                } else {
                    router.push({ name: "journalPublicationLandingPage", params: {id: response.data.id} });
                }
            }).catch((axiosError: AxiosError<ErrorResponse>) => {
                const message = i18n.t(axiosError.response?.data.message as string);
                if (message !== axiosError.response?.data.message) {
                    errorMessage.value = message;
                } else {
                    errorMessage.value = i18n.t("genericErrorMessage");
                }
                error.value = true;
                snackbar.value = true;
            });
        };

        return {
            isFormValid, 
            additionalFields,
            snackbar, error,
            title, titleRef,
            subtitle, subtitleRef,
            volume, issue, startPage, endPage,
            publicationYear, doi, scopus,
            articleNumber, numberOfPages,
            description, descriptionRef,
            keywords, keywordsRef,
            uris, urisRef, doiValidationRules,
            selectedJournal, journalAutocompleteRef, myPublications,
            selectedEvent, eventAutocompleteRef, listPublications,
            publicationTypes, selectedpublicationType,
            contributions, contributionsRef,
            requiredFieldRules, submitJournalPublication, errorMessage
        };
    }
});
</script>
