<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="10">
                <v-row>
                    <v-col cols="10">
                        <event-autocomplete-search ref="eventAutocompleteRef" v-model="selectedEvent" required></event-autocomplete-search>
                    </v-col>
                </v-row>
                <v-row v-if="selectedEvent.value != -1 && myPublications.length > 0">
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
                <v-row v-if="selectedEvent.value != -1 && myPublications.length == 0">
                    <v-col><h3>{{ $t("noRecentPublicationsconferenceLabel") }}</h3></v-col>
                </v-row>
                <v-row>
                    <v-col cols="10">
                        <v-select
                            v-model="selectedProceedings"
                            :items="availableProceedings"
                            :label="$t('proceedingsLabel') + '*'"
                            :no-data-text="$t('selectConferenceMessage')"
                            :rules="requiredSelectionRules"
                            return-object
                        ></v-select>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input ref="titleRef" v-model="title" :rules="requiredFieldRules" :label="$t('titleLabel') + '*'"></multilingual-text-input>
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
                        <h2>{{ $t("authorsLabel") }}</h2>
                        <person-publication-contribution ref="contributionsRef" basic @set-input="contributions = $event"></person-publication-contribution>
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
                            <multilingual-text-input ref="descriptionRef" v-model="description" is-area :label="$t('descriptionLabel')"></multilingual-text-input>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <multilingual-text-input ref="keywordsRef" v-model="keywords" :label="$t('keywordsLabel')"></multilingual-text-input>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <uri-input ref="urisRef" v-model="uris"></uri-input>
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
import { ProceedingsPublicationType } from "@/models/PublicationModel";
import EventAutocompleteSearch from '../event/EventAutocompleteSearch.vue';
import type { DocumentPublicationIndex } from "@/models/PublicationModel";
import UriInput from '../core/UriInput.vue';
import PersonPublicationContribution from './PersonPublicationContribution.vue';
import { watch } from 'vue';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import type { ProceedingsPublicationResponse, ProceedingsPublication } from "@/models/PublicationModel";


export default defineComponent({
    name: "SubmitProceedingsPublication",
    components: {MultilingualTextInput, UriInput, PersonPublicationContribution, EventAutocompleteSearch},
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

        const searchPlaceholder = {title: "", value: -1};
        const selectedEvent = ref<{ title: string, value: number }>(searchPlaceholder);

        const myPublications = ref<DocumentPublicationIndex[]>([]);

        const title = ref([]);
        const subtitle = ref([]);
        const description = ref([]);
        const keywords = ref([]);
        const contributions = ref([]);
        const availableProceedings = ref<{title: string, value: number}[]>([]);
        const selectedProceedings = ref({title: "", value: -1});
        const startPage = ref("");
        const endPage = ref("");
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
        const requiredSelectionRules = [
            (value: { title: string, value: number } | number) => {
                if (!value || (value as { title: string, value: number }).value === -1 || (value as { title: string, value: number }).value === null) return requiredFieldMessage.value;
                return true;
            }
        ];

        const proceedingsPublicationTypeEn = [
            { title: "Regular Full Article", value: ProceedingsPublicationType.REGULAR_FULL_ARTICLE },
            { title: "Invited Full Article", value: ProceedingsPublicationType.INVITED_FULL_ARTICLE },
            { title: "Invited Abstract Article", value: ProceedingsPublicationType.INVITED_ABSTRACT_ARTICLE },
            { title: "Regular Abstract Article", value: ProceedingsPublicationType.REGULAR_ABSTRACT_ARTICLE },
            { title: "Preface", value: ProceedingsPublicationType.PREFACE },
            { title: "Lexicographic Unit", value: ProceedingsPublicationType.LEXICOGRAPHIC_UNIT },
            { title: "Polemics", value: ProceedingsPublicationType.POLEMICS },
            { title: "Scientific Critic", value: ProceedingsPublicationType.SCIENTIFIC_CRITIC },
        ];

        const proceedingsPublicationTypeSr = [
            { title: "Saopštenje sa skupa štampano u celini", value: ProceedingsPublicationType.REGULAR_FULL_ARTICLE },
            { title: "Predavanje po pozivu štampano u celini", value: ProceedingsPublicationType.INVITED_FULL_ARTICLE },
            { title: "Predavanje po pozivu štampano u izvodu", value: ProceedingsPublicationType.INVITED_ABSTRACT_ARTICLE },
            { title: "Saopštenje sa skupa štampano u izvodu", value: ProceedingsPublicationType.REGULAR_ABSTRACT_ARTICLE },
            { title: "Predgovor", value: ProceedingsPublicationType.PREFACE },
            { title: "Leksikografska jedinica", value: ProceedingsPublicationType.LEXICOGRAPHIC_UNIT },
            { title: "Polemika", value: ProceedingsPublicationType.POLEMICS },
            { title: "Naučna kritika", value: ProceedingsPublicationType.SCIENTIFIC_CRITIC },
        ];

        const publicationTypes = computed((): { title: string, value: ProceedingsPublicationType | null }[] => i18n.locale.value === "sr" ? proceedingsPublicationTypeSr : proceedingsPublicationTypeEn);
        const selectedpublicationType = ref<{ title: string, value: ProceedingsPublicationType | null }>({title: "", value: null});

        const listPublications = (event: { title: string, value: number }) => {
            DocumentPublicationService.findMyPublicationsInEvent(event.value).then((response) => {
                myPublications.value = response.data;
            });
        };

        const fetchProceedings = (event: { title: string, value: number }) => {
            DocumentPublicationService.readProceedingsForEvent(event.value).then((response) => {
                response.data.forEach((proceedingsResponse: ProceedingsPublicationResponse) => {
                    availableProceedings.value.push({title: `${proceedingsResponse.proceedingsTitle} | ${proceedingsResponse.title} | ${proceedingsResponse.documentDate}`, 
                                                    value: proceedingsResponse.id })
                });
            });
        };

        watch(selectedEvent, (newValue) => {
            listPublications(newValue);
            fetchProceedings(newValue);
        });

        const submitProceedingsPublication = (stayOnPage: boolean) => {
            const newProceedingsPublication: ProceedingsPublication = {
                articleNumber: articleNumber.value,
                description: description.value,
                endPage: endPage.value,
                keywords: keywords.value,
                numberOfPages: numberOfPages.value,
                proceedingsId: selectedProceedings.value.value,
                proceedingsPublicationType: selectedpublicationType.value.value as ProceedingsPublicationType,
                startPage: startPage.value,
                subTitle: subtitle.value,
                title: title.value,
                uris: uris.value,
                contributions: contributions.value,
                doi: doi.value,
                scopusId: scopus.value
            };

            console.log(newProceedingsPublication, stayOnPage, router)
        };

        return {
            isFormValid, 
            additionalFields,
            snackbar, error,
            title, titleRef,
            subtitle, subtitleRef,
            startPage, endPage,
            doi, scopus,
            articleNumber, numberOfPages,
            description, descriptionRef,
            keywords, keywordsRef,
            placeRef, uris, urisRef,
            myPublications,
            selectedEvent, eventAutocompleteRef, listPublications,
            publicationTypes, selectedpublicationType,
            contributions, contributionsRef,
            requiredFieldRules, requiredSelectionRules, submitProceedingsPublication,
            availableProceedings, selectedProceedings
        };
    }
});
</script>
