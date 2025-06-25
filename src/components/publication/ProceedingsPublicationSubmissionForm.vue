<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col :cols="inModal ? 12 : 10">
                <v-row>
                    <v-col cols="10">
                        <i-d-f-metadata-prepopulator
                            :document-type="PublicationType.PROCEEDINGS_PUBLICATION"
                            @metadata-fetched="popuateMetadata"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="11">
                        <event-autocomplete-search ref="eventAutocompleteRef" v-model="selectedEvent" required></event-autocomplete-search>
                    </v-col>
                </v-row>
                <v-row v-if="selectedEvent && selectedEvent.value != -1 && myPublications.length > 0">
                    <v-col>
                        <h3>{{ $t("recentPublicationsLabel") }}</h3>
                        <p
                            v-for="(publication) in myPublications"
                            :key="publication.id"
                            :value="publication"
                        >
                            {{ returnCurrentLocaleContent(publication.title) + ` ${$t("inLabel")} ` + returnCurrentLocaleContent(publication.proceedingsTitle) }}
                        </p>
                    </v-col>
                </v-row>
                <v-row v-if="selectedEvent && selectedEvent.value > 0 && myPublications.length == 0 && isResearcher">
                    <v-col><h3>{{ $t("noRecentPublicationsConferenceLabel") }}</h3></v-col>
                </v-row>
                <v-row>
                    <v-col cols="10">
                        <v-select
                            v-model="selectedProceedings"
                            :items="availableProceedings"
                            :label="$t('proceedingsLabel') + '*'"
                            :no-data-text="(selectedEvent && selectedEvent.value === -1) ? $t('selectConferenceMessage') : $t('noAvailableProceedingsMessage')"
                            :rules="requiredSelectionRules"
                            return-object
                        ></v-select>
                    </v-col>
                    <v-col>
                        <generic-crud-modal
                            :form-component="ProceedingsSubmissionForm"
                            :form-props="{conference: selectedEvent ? selectedEvent : searchPlaceholder}"
                            entity-name="Proceedings"
                            is-submission
                            :read-only="!selectedEvent || selectedEvent.value === -1"
                            @create="selectNewlyAddedProceedings"
                        />
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
                        <v-select
                            v-model="selectedpublicationType"
                            :items="publicationTypes"
                            :label="$t('concretePublicationTypeLabel') + '*'"
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
                        <v-col cols="5">
                            <v-text-field
                                v-model="openAlexId"
                                label="Open Alex ID"
                                placeholder="Open Alex ID"
                                :rules="workOpenAlexIdValidationRules">
                            </v-text-field>
                        </v-col>
                        <v-col cols="5">
                            <v-text-field
                                v-model="scopus"
                                label="Scopus ID"
                                placeholder="Scopus ID"
                                :rules="scopusIdValidationRules"
                            />
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
                            <multilingual-text-input ref="descriptionRef" v-model="description" is-area :label="$t('abstractLabel')"></multilingual-text-input>
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
                </v-container>
            </v-col>
        </v-row>
        <v-row>
            <p class="required-fields-message">
                {{ $t("requiredFieldsMessage") }}
            </p>
        </v-row>
    </v-form>
    
    <toast v-model="snackbar" :message="!error ? $t('savedMessage') : errorMessage" />
</template>

<script lang="ts">
import { defineComponent, nextTick } from 'vue';
import MultilingualTextInput from '../core/MultilingualTextInput.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import EventAutocompleteSearch from '../event/EventAutocompleteSearch.vue';
import { PublicationType, type ProceedingsPublicationResponse, type ProceedingsPublicationType } from "@/models/PublicationModel";
import UriInput from '../core/UriInput.vue';
import PersonPublicationContribution from './PersonPublicationContribution.vue';
import { watch } from 'vue';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import type { PersonDocumentContribution, ProceedingsPublication } from "@/models/PublicationModel";
import ProceedingsService from '@/services/ProceedingsService';
import type { Proceedings, ProceedingsResponse } from '@/models/ProceedingsModel';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { proceedingsPublicationTypeSr, proceedingsPublicationTypeEn } from "@/i18n/proceedingsPublicationType";
import type { ErrorResponse, PrepopulatedMetadata } from '@/models/Common';
import type { AxiosError } from 'axios';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import Toast from '../core/Toast.vue';
import GenericCrudModal from '../core/GenericCrudModal.vue';
import ProceedingsSubmissionForm from '../proceedings/ProceedingsSubmissionForm.vue';
import { useUserRole } from '@/composables/useUserRole';
import IDFMetadataPrepopulator from '../core/IDFMetadataPrepopulator.vue';
import { useLanguageTags } from '@/composables/useLanguageTags';


export default defineComponent({
    name: "SubmitProceedingsPublication",
    components: {MultilingualTextInput, UriInput, PersonPublicationContribution, EventAutocompleteSearch, GenericCrudModal, Toast, IDFMetadataPrepopulator},
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
        const placeRef = ref<typeof MultilingualTextInput>();
        const contributionsRef = ref<typeof PersonPublicationContribution>();
        const urisRef = ref<typeof UriInput>();

        const eventAutocompleteRef = ref<typeof EventAutocompleteSearch>();

        const searchPlaceholder = {title: "", value: -1};
        const selectedEvent = ref<{ title: string, value: number }>(searchPlaceholder);

        const myPublications = ref<ProceedingsPublicationResponse[]>([]);

        const title = ref<any[]>([]);
        const subtitle = ref([]);
        const description = ref([]);
        const keywords = ref([]);
        const contributions = ref<PersonDocumentContribution[]>([]);
        const availableProceedings = ref<{title: string, value: number}[]>([]);
        const selectedProceedings = ref(searchPlaceholder);
        const startPage = ref("");
        const endPage = ref("");
        const doi = ref("");
        const openAlexId = ref("");
        const scopus = ref("");
        const articleNumber = ref("");
        const numberOfPages = ref();
        const uris = ref<string[]>([]);

        const i18n = useI18n();
        const errorMessage = ref(i18n.t("genericErrorMessage"));

        const {
            requiredFieldRules, requiredSelectionRules,
            doiValidationRules, scopusIdValidationRules,
            workOpenAlexIdValidationRules
        } = useValidationUtils();

        const publicationTypes = computed((): { title: string, value: ProceedingsPublicationType | null }[] => i18n.locale.value === "sr" ? proceedingsPublicationTypeSr : proceedingsPublicationTypeEn);
        const selectedpublicationType = ref<{ title: string, value: ProceedingsPublicationType | null }>({title: "", value: null});

        const listPublications = (event: { title: string, value: number }) => {
            if (event.value > 0) {
                DocumentPublicationService.findMyPublicationsInEvent(event.value).then((response) => {
                    myPublications.value = response.data;
                });
            }
        };

        const fetchProceedings = (event: { title: string, value: number }) => {
            if (event.value <= 0) {
                return;
            }

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

                    if (proceedingsResponse.documentDate) {
                        availableProceedings.value.push({title: `${title} | ${proceedingsResponse.documentDate}`, value: proceedingsResponse.id as number });
                    } else {
                        availableProceedings.value.push({title: title as string, value: proceedingsResponse.id as number });
                    }
                });
            });
        };

        const { isResearcher } = useUserRole();

        watch(selectedEvent, (newValue) => {
            if (newValue) {
                if (isResearcher.value) {
                    listPublications(newValue);
                }
                availableProceedings.value = [];
                selectedProceedings.value = searchPlaceholder;
                fetchProceedings(newValue);
            }
        });

        const { languageTags } = useLanguageTags();
        const popuateMetadata = async (metadata: PrepopulatedMetadata) => {
            if (title.value.length === 0) {
                title.value = metadata.title;
                titleRef.value?.forceRefreshModelValue(toMultilingualTextInput(title.value, languageTags.value));
            }
            
            startPage.value = startPage.value ? startPage.value : metadata.startPage;
            endPage.value = endPage.value ? endPage.value : metadata.endPage;
            uris.value.push(metadata.url);
            doi.value = doi.value ? doi.value : metadata.doi;

            if (metadata.publishedInName && selectedEvent.value.value <= 0) {
                selectedEvent.value = {title: metadata.publishedInName, value: metadata.publishEntityId};
            }

            if (contributions.value.length === 0) {
                contributions.value = metadata.contributions;
                contributionsRef.value?.fillDummyAuthors(contributions.value.length);

                await nextTick();

                contributionsRef.value?.fillInputs(contributions.value, true);
            }
        };

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
                openAlexId: openAlexId.value,
                scopusId: scopus.value,
                eventId: selectedEvent.value.value,
                fileItems: [],
                proofs: []
            };

            DocumentPublicationService.createProceedingsPublication(newProceedingsPublication).then((response) => {
                if (stayOnPage) {
                    titleRef.value?.clearInput();
                    subtitleRef.value?.clearInput();
                    descriptionRef.value?.clearInput();
                    keywordsRef.value?.clearInput();
                    placeRef.value?.clearInput();
                    urisRef.value?.clearInput();
                    eventAutocompleteRef.value!.clearInput();
                    availableProceedings.value = [];
                    selectedProceedings.value = searchPlaceholder;
                    selectedpublicationType.value = {title: "", value: null};
                    startPage.value = "";
                    endPage.value = "";
                    doi.value = "";
                    openAlexId.value = "";
                    scopus.value = "";
                    articleNumber.value = "";
                    numberOfPages.value = null;
                    myPublications.value = [];
                    contributionsRef.value?.clearInput();

                    error.value = false;
                    snackbar.value = true;
                } else {
                    router.push({ name: "proceedingsPublicationLandingPage", params: {id: response.data.id} });
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
            isFormValid, additionalFields, snackbar, error, title,
            subtitle, subtitleRef, startPage, endPage, doi, scopus,
            articleNumber, numberOfPages, description, descriptionRef,
            keywords, keywordsRef, placeRef, uris, urisRef, titleRef,
            myPublications, doiValidationRules, selectNewlyAddedProceedings,
            selectedEvent, eventAutocompleteRef, listPublications, PublicationType,
            publicationTypes, selectedpublicationType, errorMessage, openAlexId,
            contributions, contributionsRef, scopusIdValidationRules, isResearcher,
            requiredFieldRules, requiredSelectionRules, submitProceedingsPublication,
            availableProceedings, selectedProceedings, returnCurrentLocaleContent,
            searchPlaceholder, ProceedingsSubmissionForm, workOpenAlexIdValidationRules,
            popuateMetadata
        };
    }
});
</script>
