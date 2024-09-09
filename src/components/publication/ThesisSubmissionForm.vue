<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="12">
                <v-row>
                    <v-col cols="11">
                        <organisation-unit-autocomplete-search ref="ouAutocompleteRef" v-model:model-value="selectedOrganisationUnit" required></organisation-unit-autocomplete-search>
                    </v-col>
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
                    <v-col cols="10">
                        <v-select
                            v-model="selectedThesisType"
                            :label="$t('thesisTypeLabel') + '*'"
                            :items="thesisTypes"
                            :rules="requiredSelectionRules"
                            return-object
                        ></v-select>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="10">
                        <v-text-field
                            v-model="publicationYear" type="number" :label="$t('yearOfPublicationLabel') + '*'" :placeholder="$t('yearOfPublicationLabel') + '*'"
                            :rules="requiredFieldRules"></v-text-field>
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
                        <v-col cols="10">
                            <v-select
                                v-model="selectedResearchArea"
                                :label="$t('researchAreaLabel') + '*'"
                                :items="researchAreasSelectable"
                                return-object
                            ></v-select>
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
                            <v-text-field v-model="numberOfPages" type="number" :label="$t('numberOfPagesLabel')" :placeholder="$t('numberOfPagesLabel')"></v-text-field>
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
                            <publisher-autocomplete-search ref="publisherAutocompleteRef" v-model="selectedPublisher"></publisher-autocomplete-search>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <event-autocomplete-search ref="eventRef" v-model="selectedEvent"></event-autocomplete-search>
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
import PublisherAutocompleteSearch from '../publisher/PublisherAutocompleteSearch.vue';
import UriInput from '../core/UriInput.vue';
import PersonPublicationContribution from './PersonPublicationContribution.vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import type { Thesis, ThesisType } from "@/models/PublicationModel";
import DocumentPublicationService from '@/services/DocumentPublicationService';
import type { AxiosError, AxiosResponse } from 'axios';
import { useI18n } from 'vue-i18n';
import type { ErrorResponse, LanguageTagResponse } from '@/models/Common';
import EventAutocompleteSearch from '../event/EventAutocompleteSearch.vue';
import ResearchAreaService from '@/services/ResearchAreaService';
import LanguageService from '@/services/LanguageService';
import { onMounted } from 'vue';
import type { ResearchArea } from '@/models/OrganisationUnitModel';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import OrganisationUnitAutocompleteSearch from '../organisationUnit/OrganisationUnitAutocompleteSearch.vue';
import { getThesisTypesForGivenLocale } from '@/i18n/thesisType';


export default defineComponent({
    name: "SubmitThesis",
    components: {MultilingualTextInput, UriInput, PersonPublicationContribution, PublisherAutocompleteSearch, EventAutocompleteSearch, OrganisationUnitAutocompleteSearch},
    setup() {
        const isFormValid = ref(false);
        const additionalFields = ref(false);

        const snackbar = ref(false);
        const error = ref(false);

        const i18n = useI18n();
        const errorMessage = ref(i18n.t("genericErrorMessage"));

        const router = useRouter();

        const languageTags = ref<LanguageTagResponse[]>([]);
        const languageList = ref<{title: string, value: number}[]>([]);
        const selectedLanguages = ref<number[]>([]);

        onMounted(() => {
            LanguageService.getAllLanguageTags().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                response.data.forEach((languageTag: LanguageTagResponse) => {
                    languageTags.value.push(languageTag);
                    languageList.value.push({title: `${languageTag.display} (${languageTag.languageCode})`, value: languageTag.id});
                    if (i18n.locale.value.toUpperCase() === languageTag.languageCode) {
                        selectedLanguages.value.push(languageTag.id);
                    }
                })
            });

            ResearchAreaService.listAllResearchAreas().then(response => {
                allResearchAreas.value = response.data;
                populateSelectionData();
            });
        });

        const populateSelectionData = () => {
            researchAreasSelectable.value = [];
            allResearchAreas.value.forEach(researchArea => {
                researchAreasSelectable.value.push({title: returnCurrentLocaleContent(researchArea.name) as string, value: researchArea.id as number});
            });
        };

        const allResearchAreas = ref<ResearchArea[]>([]);
        const researchAreasSelectable = ref<{ title: string, value: number }[]>([]);
        const selectedResearchArea = ref<{ title: string, value: number | null}>({ title: "", value: null });

        const titleRef = ref<typeof MultilingualTextInput>();
        const subtitleRef = ref<typeof MultilingualTextInput>();
        const descriptionRef = ref<typeof MultilingualTextInput>();
        const keywordsRef = ref<typeof MultilingualTextInput>();
        const contributionsRef = ref<typeof PersonPublicationContribution>();
        const urisRef = ref<typeof UriInput>();
        const eventRef = ref<typeof EventAutocompleteSearch>();
        const publisherAutocompleteRef = ref<typeof PublisherAutocompleteSearch>();

        const searchPlaceholder = {title: "", value: -1};
        const selectedPublisher = ref<{ title: string, value: number }>(searchPlaceholder);
        const selectedEvent = ref<{ title: string, value: number }>(searchPlaceholder);

        const title = ref([]);
        const subtitle = ref([]);
        const description = ref([]);
        const keywords = ref([]);
        const contributions = ref([]);
        const publicationYear = ref("");
        const doi = ref("");
        const scopus = ref("");
        const numberOfPages = ref<number|null>();
        const uris = ref<string[]>([]);

        const thesisTypes = getThesisTypesForGivenLocale();
        const selectedThesisType = ref<{title: string, value: ThesisType | null}>({ title: "", value: null });

        const ouAutocompleteRef = ref<typeof OrganisationUnitAutocompleteSearch>();
        const selectedOrganisationUnit = ref<{ title: string, value: number }>({title: "", value: -1});

        const { requiredFieldRules, requiredSelectionRules, doiValidationRules, scopusIdValidationRules } = useValidationUtils();

        const submitThesis = (stayOnPage: boolean) => {
            const newThesis: Thesis = {
                title: title.value,
                thesisType: selectedThesisType.value.value as ThesisType,
                languageTagIds: selectedLanguages.value,
                numberOfPages: numberOfPages.value as number,
                organisationUnitId: selectedOrganisationUnit.value.value,
                description: description.value,
                keywords: keywords.value,
                subTitle: subtitle.value,
                uris: uris.value,
                contributions: contributions.value,
                documentDate: publicationYear.value,
                scopusId: scopus.value,
                doi: doi.value,
                publisherId: selectedPublisher.value.value === -1 ? undefined : selectedPublisher.value.value,
                eventId: selectedEvent.value.value === -1 ? undefined : selectedEvent.value.value,
                fileItems: [],
                proofs: []
            };

            DocumentPublicationService.createThesis(newThesis).then((response) => {
                if (stayOnPage) {
                    titleRef.value?.clearInput();
                    subtitleRef.value?.clearInput();
                    descriptionRef.value?.clearInput();
                    keywordsRef.value?.clearInput();
                    urisRef.value?.clearInput();
                    contributionsRef.value?.clearInput();
                    publisherAutocompleteRef.value?.clearInput();
                    eventRef.value?.clearInput();
                    ouAutocompleteRef.value?.clearInput();
                    publicationYear.value = "";
                    doi.value = "";
                    scopus.value = "";
                    numberOfPages.value = null;
                    selectedThesisType.value = { title: "", value: null };
                    selectedResearchArea.value = { title: "", value: null };
                    ouAutocompleteRef.value?.clearInput();

                    error.value = false;
                    snackbar.value = true;
                } else {
                    router.push({ name: "thesisLandingPage", params: {id: response.data.id} });
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
            publicationYear, doi, scopus,
            publisherAutocompleteRef,
            selectedPublisher, numberOfPages,
            description, descriptionRef, doiValidationRules,
            keywords, keywordsRef, uris, urisRef,
            contributions, contributionsRef, eventRef, selectedEvent,
            requiredFieldRules, submitThesis, errorMessage,
            scopusIdValidationRules, requiredSelectionRules,
            researchAreasSelectable, selectedResearchArea,
            selectedThesisType, thesisTypes, selectedOrganisationUnit
        };
    }
});
</script>
