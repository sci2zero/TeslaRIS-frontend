<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col :cols="inModal ? 12 : 10">
                <v-row>
                    <v-col cols="12">
                        <i-d-f-metadata-prepopulator
                            :document-type="PublicationType.MONOGRAPH"
                            @metadata-fetched="popuateMetadata"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
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
                        <v-text-field
                            v-model="publicationYear"
                            :rules="requiredFieldRules"
                            :label="$t('yearOfPublicationLabel') + '*'"
                            :placeholder="$t('yearOfPublicationLabel') + '*'">
                        </v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="10">
                        <v-select
                            v-model="selectedMonographType"
                            :label="$t('monographTypeLabel') + '*'"
                            :items="monographTypes"
                            :rules="requiredSelectionRules"
                            :disabled="inModal"
                            return-object
                        ></v-select>
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

                <v-row>
                    <v-col cols="12">
                        <h2>{{ $t("authorsLabel") }}</h2>
                        <person-publication-contribution
                            ref="contributionsRef"
                            basic
                            :required="false"
                            @set-input="contributions = $event">
                        </person-publication-contribution>
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
                                v-model="selectedResearchArea"
                                :label="$t('researchAreaLabel')"
                                :placeholder="$t('researchAreaLabel')"
                                :items="researchAreasSelectable"
                                return-object
                            ></v-select>
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
                                v-model="volume"
                                :label="$t('volumeLabel')"
                                :placeholder="$t('volumeLabel')">
                            </v-text-field>
                        </v-col>
                        <v-col cols="5">
                            <v-text-field
                                v-model="number"
                                :label="$t('numberLabel')"
                                :placeholder="$t('numberLabel')">
                            </v-text-field>
                        </v-col>
                    </v-row>
                    <!-- <v-row>
                        <v-col cols="10">
                            <event-autocomplete-search
                                ref="eventAutocompleteRef"
                                v-model="selectedEvent">
                            </event-autocomplete-search>
                        </v-col>
                    </v-row> -->
                    <v-row>
                        <v-col cols="10">
                            <publisher-autocomplete-search
                                ref="publisherAutocompleteRef"
                                v-model="selectedPublisher">
                            </publisher-autocomplete-search>
                        </v-col>
                    </v-row>
                </v-container>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="10">
                <p class="required-fields-message">
                    {{ $t("requiredFieldsMessage") }}
                </p>
            </v-col>
        </v-row>
    </v-form>
    
    <toast v-model="snackbar" :message="message" />
</template>

<script lang="ts">
import { defineComponent, nextTick } from 'vue';
import MultilingualTextInput from '../core/MultilingualTextInput.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import type { LanguageTagResponse, MultilingualContent, PrepopulatedMetadata } from '@/models/Common';
import { onMounted } from 'vue';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';
import UriInput from '../core/UriInput.vue';
import JournalAutocompleteSearch from '../journal/JournalAutocompleteSearch.vue';
import { MonographType, type PersonDocumentContribution, PublicationType, type Monograph } from "@/models/PublicationModel";
import BookSeriesAutocompleteSearch from '../bookSeries/BookSeriesAutocompleteSearch.vue';
import { watch } from 'vue';
import type { ExternalValidation } from "@/models/Common";
import { useValidationUtils } from '@/utils/ValidationUtils';
import { getMonographTypesForGivenLocale } from '@/i18n/monographType';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import ResearchAreaService from '@/services/ResearchAreaService';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import type { ResearchArea } from '@/models/OrganisationUnitModel';
import PersonPublicationContribution from './PersonPublicationContribution.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import Toast from '../core/Toast.vue';
import { getMonographTypeTitleFromValueAutoLocale } from '@/i18n/monographType';
import IDFMetadataPrepopulator from '../core/IDFMetadataPrepopulator.vue';
import PublisherAutocompleteSearch from '../publisher/PublisherAutocompleteSearch.vue';
import { useUserRole } from '@/composables/useUserRole';


export default defineComponent({
    name: "SubmitMonograph",
    components: {MultilingualTextInput, UriInput, JournalAutocompleteSearch, BookSeriesAutocompleteSearch, PersonPublicationContribution, Toast, IDFMetadataPrepopulator, PublisherAutocompleteSearch},
    props: {
        inModal: {
            type: Boolean,
            default: false
        },
        presetName: {
            type: String,
            default: ""
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
        const noDataMessage = computed(() => i18n.t("noDataMessage"));

        const languageTags = ref<LanguageTagResponse[]>([]);
        const languageList = ref<{title: string, value: number}[]>([]);
        const selectedLanguages = ref<number[]>([]);

        const { loggedInUser } = useUserRole();

        onMounted(() => {
            LanguageService.getAllLanguageTags().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                response.data.forEach((languageTag: LanguageTagResponse) => {
                    languageTags.value.push(languageTag);
                    languageList.value.push({title: `${languageTag.display} (${languageTag.languageCode})`, value: languageTag.id});
                    if (i18n.locale.value.toUpperCase() === languageTag.languageCode) {
                        selectedLanguages.value.push(languageTag.id);
                    }
                })

                presetName();
            });

            ResearchAreaService.listAllResearchAreas().then(response => {
                allResearchAreas.value = response.data;
                populateSelectionData();
            });

            selectedResearchArea.value.title = noDataMessage.value;

            if (props.inModal) {
                selectedMonographType.value = {
                    title: getMonographTypeTitleFromValueAutoLocale(MonographType.BOOK) as string,
                    value: MonographType.BOOK
                };
            } else {
                selectedMonographType.value = {
                    title: getMonographTypeTitleFromValueAutoLocale(MonographType.RESEARCH_MONOGRAPH) as string,
                    value: MonographType.RESEARCH_MONOGRAPH
                };
            }
        });

        watch(() => props.presetName, () => {
            presetName();
        });

        const presetName = async () => {
            if (props.presetName) {
                const tag = languageTags.value.find(
                    lt => lt.languageCode === loggedInUser.value?.preferredReferenceCataloguingLanguage.toUpperCase()
                );
                if (tag) {
                    const mc: MultilingualContent[] = [
                        {content: props.presetName, languageTag: tag.languageCode, languageTagId: tag.id, priority: 1}
                    ];
                    title.value = mc;
                    titleRef.value?.forceRefreshModelValue(toMultilingualTextInput(mc, languageTags.value));
                }
            }
        };

        const populateSelectionData = () => {
            researchAreasSelectable.value = [];
            allResearchAreas.value.forEach(researchArea => {
                researchAreasSelectable.value.push({title: returnCurrentLocaleContent(researchArea.name) as string, value: researchArea.id as number});
            });
        };

        const titleRef = ref<typeof MultilingualTextInput>();
        const subtitleRef = ref<typeof MultilingualTextInput>();
        const contributionsRef = ref<typeof PersonPublicationContribution>();
        const urisRef = ref<typeof MultilingualTextInput>();
        const descriptionRef = ref<typeof MultilingualTextInput>();
        const keywordsRef = ref<typeof MultilingualTextInput>();
        const publisherAutocompleteRef = ref<typeof PublisherAutocompleteSearch>();

        const journalAutocompleteRef = ref<typeof JournalAutocompleteSearch>();
        const bookSeriesAutocompleteRef = ref<typeof BookSeriesAutocompleteSearch>();

        const searchPlaceholder = {title: "", value: -1};
        const selectedEvent = ref<{ title: string, value: number }>(searchPlaceholder);
        const selectedJournal = ref<{ title: string, value: number }>(searchPlaceholder);
        const selectedBookSeries = ref<{ title: string, value: number }>(searchPlaceholder);

        const monographTypes = getMonographTypesForGivenLocale();
        const selectedMonographType = ref<{title: string, value: MonographType | null}>({ title: "", value: null });

        const allResearchAreas = ref<ResearchArea[]>([]);
        const researchAreasSelectable = ref<{ title: string, value: number }[]>([]);

        const selectedResearchArea = ref<{ title: string, value: number | null}>({ title: "", value: null });
        const selectedPublisher = ref<{ title: string, value: number }>(searchPlaceholder);

        const title = ref<any[]>([]);
        const subtitle = ref([]);
        const contributions = ref<PersonDocumentContribution[]>([]);
        const uris = ref<string[]>([]);
        const keywords = ref([]);
        const description = ref([]);
        const eIsbn = ref("");
        const printIsbn = ref("");
        const numberOfPages = ref();
        const publicationYear = ref("");
        const doi = ref("");
        const scopus = ref("");
        const number = ref("");
        const volume = ref("");
        const openAlexId = ref("");
        const webOfScienceId = ref("");

        const setPublicationYear = (date: string) => {
            const year = /\d{4}/.exec(date);
            if (year) {
                publicationYear.value = year[0];
            }
        };

        const { 
            requiredFieldRules, requiredSelectionRules, doiValidationRules,
            isbnValidationRules, scopusIdValidationRules, workOpenAlexIdValidationRules,
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

        watch(i18n.locale, () => {
            populateSelectionData();
        });

        const submit = (stayOnPage: boolean) => {
            let publicationSeriesId: number | undefined = selectedBookSeries.value?.value !== -1 ? selectedBookSeries.value?.value : selectedJournal.value?.value;
            if (publicationSeriesId === -1) {
                publicationSeriesId = undefined;
            }

            const newMonograph: Monograph = {
                description: description.value,
                keywords: keywords.value,
                subTitle: subtitle.value,
                title: title.value,
                uris: uris.value,
                contributions: contributions.value,
                documentDate: publicationYear.value,
                doi: doi.value,
                eisbn: eIsbn.value,
                eventId: selectedEvent.value?.value > 0 ? selectedEvent.value?.value : undefined,
                languageTagIds: selectedLanguages.value,
                numberOfPages: numberOfPages.value,
                printISBN: printIsbn.value,
                publicationSeriesId: publicationSeriesId as number,
                scopusId: scopus.value,
                openAlexId: openAlexId.value,
                webOfScienceId: webOfScienceId.value,
                monographType: selectedMonographType.value.value as MonographType,
                number: number.value,
                volume: volume.value,
                researchAreaId: selectedResearchArea.value?.value as number,
                publisherId: selectedPublisher.value.value === -1 ? undefined : selectedPublisher.value.value,
                fileItems: [],
                proofs: []
            };

            DocumentPublicationService.createMonograph(newMonograph).then((response) => {
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
                    doi.value = "";
                    scopus.value = "";
                    openAlexId.value = "";
                    webOfScienceId.value = "";
                    numberOfPages.value = null;
                    selectedResearchArea.value = { title: "", value: null };
                    selectedMonographType.value = { title: "", value: null };
                    eIsbn.value = "";
                    printIsbn.value = "";
                    publicationYear.value = "";
                    contributionsRef.value?.clearInput();
                    publisherAutocompleteRef.value?.clearInput();

                    message.value = i18n.t("savedMessage");
                    snackbar.value = true;
                } else {
                    router.push({ name: "monographLandingPage", params: {id: response.data.id} });
                }
            }).catch((error) => {
                message.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
            });
        };

        const popuateMetadata = async (metadata: PrepopulatedMetadata) => {
            if (title.value.length === 0) {
                title.value = metadata.title;
                titleRef.value?.forceRefreshModelValue(toMultilingualTextInput(title.value, languageTags.value));
            }
            
            volume.value = volume.value ? volume.value : metadata.volume;
            number.value = number.value ? number.value : metadata.issue;
            uris.value.push(metadata.url);
            doi.value = doi.value ? doi.value : metadata.doi;

            if (metadata.publishedInName && selectedJournal.value.value <= 0) {
                selectedJournal.value = {title: metadata.publishedInName, value: metadata.publishEntityId};
            }

            if (contributions.value.length === 0) {
                contributions.value = metadata.contributions;
                contributionsRef.value?.fillDummyAuthors(contributions.value.length);

                await nextTick();

                contributionsRef.value?.fillInputs(contributions.value, true);
            }
        };

        return {
            isFormValid, additionalFields, PublicationType,
            snackbar, message, researchAreasSelectable,
            title, titleRef, subtitle, subtitleRef,
            selectedEvent, doiValidationRules, openAlexId,
            journalAutocompleteRef, selectedJournal, uris, urisRef,
            eIsbn, printIsbn, languageList, selectedLanguages,
            description, descriptionRef, requiredSelectionRules,
            publicationYear, doi, scopus, numberOfPages,
            keywords, keywordsRef, setPublicationYear,
            volume, number, monographTypes, selectedMonographType,
            bookSeriesAutocompleteRef, selectedBookSeries,
            requiredFieldRules, validatePublicationSeriesSelection, 
            publicationSeriesExternalValidation, submit,
            selectedResearchArea, toMultilingualTextInput,
            languageTags, contributionsRef, contributions,
            isbnValidationRules, scopusIdValidationRules,
            workOpenAlexIdValidationRules, popuateMetadata,
            documentWebOfScienceIdValidationRules, webOfScienceId,
            publisherAutocompleteRef, selectedPublisher
        };
    }
});
</script>
