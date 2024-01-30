<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="10">
                <v-row>
                    <v-col cols="10">
                        <journal-autocomplete-search ref="journalAutocompleteRef" required @set-input="selectedJournal = $event; listPublications($event);"></journal-autocomplete-search>
                    </v-col>
                </v-row>

                <v-row v-if="selectedJournal.value != -1 && myPublications.length > 0">
                    <v-col>
                        <h3>{{ $t("recentPublicationsLabel") }}</h3>
                        <p
                            v-for="(journalIndex, i) in myPublications"
                            :key="i"
                            :value="journalIndex"
                        >
                            {{ $i18n.locale === "sr" ? journalIndex.titleSr : journalIndex.titleOther }}
                        </p>
                    </v-col>
                </v-row>
                <v-row v-if="selectedJournal.value != -1 && myPublications.length == 0">
                    <v-col><h3>{{ $t("noRecentPublicationsLabel") }}</h3></v-col>
                </v-row>

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
                        <h2>{{ $t("authorsLabel") }}</h2>
                        <person-publication-contribution ref="contributionsRef" @set-input="contributions = $event"></person-publication-contribution>
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
                            <v-text-field v-model="doi" label="DOI" placeholder="DOI"></v-text-field>
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
                            <multilingual-text-input ref="placeRef" :label="$t('placeLabel')" @set-input="place = $event"></multilingual-text-input>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="10">
                            <event-autocomplete-search ref="eventAutocompleteRef" @set-input="selectedEvent = $event"></event-autocomplete-search>
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
import { JournalPublicationType } from "@/models/PublicationModel";
import JournalAutocompleteSearch from '../journal/JournalAutocompleteSearch.vue';
import EventAutocompleteSearch from '../event/EventAutocompleteSearch.vue';
import type { DocumentPublicationIndex, JournalPublication } from "@/models/PublicationModel";
import DocumentPublicationService from "@/services/DocumentPublicationService";
import UriInput from '../core/UriInput.vue';
import PersonPublicationContribution from './PersonPublicationContribution.vue';


export default defineComponent({
    name: "SubmitJournal",
    components: {MultilingualTextInput, UriInput, PersonPublicationContribution, EventAutocompleteSearch, JournalAutocompleteSearch},
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
        const placeRef = ref<typeof MultilingualTextInput>();
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
        const place = ref([]);
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
        const requiredFieldMessage = computed(() => i18n.t("mandatoryFieldError"));
        const requiredFieldRules = [
            (value: string) => {
                if (!value) return requiredFieldMessage.value;
                return true;
            }
        ];

        const journalPublicationTypeEn = [
            { title: "Review Article", value: JournalPublicationType.REVIEW_ARTICLE },
            { title: "Research Article", value: JournalPublicationType.RESEARCH_ARTICLE },
            { title: "Preface", value: JournalPublicationType.PREFACE },
            { title: "Comment", value: JournalPublicationType.COMMENT },
            { title: "Correction", value: JournalPublicationType.CORRECTION },
            { title: "Lexicographic Unit", value: JournalPublicationType.LEXICOGRAPHIC_UNIT },
            { title: "Polemics", value: JournalPublicationType.POLEMICS },
            { title: "Scientific Critic", value: JournalPublicationType.SCIENTIFIC_CRITIC },
        ];

        const journalPublicationTypeSr = [
            { title: "Pregledni članak", value: JournalPublicationType.REVIEW_ARTICLE },
            { title: "Istraživački članak", value: JournalPublicationType.RESEARCH_ARTICLE },
            { title: "Predgovor", value: JournalPublicationType.PREFACE },
            { title: "Komentar", value: JournalPublicationType.COMMENT },
            { title: "Ispravka", value: JournalPublicationType.CORRECTION },
            { title: "Leksikografska jedinica", value: JournalPublicationType.LEXICOGRAPHIC_UNIT },
            { title: "Polemika", value: JournalPublicationType.POLEMICS },
            { title: "Naučna kritika", value: JournalPublicationType.SCIENTIFIC_CRITIC },
        ];

        const publicationTypes = computed((): { title: string, value: JournalPublicationType | null }[] => i18n.locale.value === "sr" ? journalPublicationTypeSr : journalPublicationTypeEn);
        const selectedpublicationType = ref<{ title: string, value: JournalPublicationType | null }>({title: "", value: null});

        const listPublications = (journal: { title: string, value: number }) => {
            DocumentPublicationService.findMyPublicationsInJournal(journal.value).then((response) => {
                myPublications.value = response.data;
            });
        };

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
                eventId: selectedEvent.value.value === -1 ? undefined : selectedEvent.value.value
            };

            DocumentPublicationService.createJournalPublication(newJournalPublication).then(() => {
                if (stayOnPage) {
                    titleRef.value?.clearInput();
                    subtitleRef.value?.clearInput();
                    descriptionRef.value?.clearInput();
                    keywordsRef.value?.clearInput();
                    placeRef.value?.clearInput();
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
                    router.push({ name: "scientificResults" });
                }
            }).catch(() => {
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
            place, placeRef, uris, urisRef,
            selectedJournal, journalAutocompleteRef, myPublications,
            selectedEvent, eventAutocompleteRef, listPublications,
            publicationTypes, selectedpublicationType,
            contributions, contributionsRef,
            requiredFieldRules, submitJournalPublication
        };
    }
});
</script>