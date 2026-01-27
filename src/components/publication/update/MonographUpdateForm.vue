<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <multilingual-text-input
                    v-model="title"
                    :rules="requiredFieldRules"
                    :label="$t('titleLabel') + '*'"
                    :initial-value="toMultilingualTextInput(presetMonograph?.title, languageTags)">
                </multilingual-text-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-text-field
                    v-model="publicationYear"
                    :rules="requiredFieldRules"
                    :label="$t('yearOfPublicationLabel') + '*'"
                    :placeholder="$t('yearOfPublicationLabel') + '*'">
                </v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-select
                    v-model="selectedMonographType"
                    :label="$t('monographTypeLabel') + '*'"
                    :items="monographTypes"
                    :rules="requiredSelectionRules"
                ></v-select>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input
                    v-model="subtitle"
                    :label="$t('subtitleLabel')"
                    :initial-value="toMultilingualTextInput(presetMonograph?.subTitle, languageTags)">
                </multilingual-text-input>
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
                    v-model="selectedResearchArea"
                    :label="$t('researchAreaLabel')"
                    :items="researchAreasSelectable"
                    return-object
                ></v-select>
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
                    :rules="optionalNumericZeroOrGreaterFieldRules"
                    :placeholder="$t('numberOfPagesLabel')">
                </v-text-field>
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
            <v-col cols="2" class="text-center">
                <v-btn 
                    icon 
                    class="mx-2"
                    @click="[printIsbn, eIsbn] = [eIsbn, printIsbn]"
                >
                    <v-icon>mdi-swap-horizontal</v-icon>
                </v-btn>
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
                <v-text-field v-model="doi" label="DOI" placeholder="DOI" :rules="doiValidationRules"></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <journal-autocomplete-search
                    v-model="selectedJournal"
                    allow-manual-clearing
                    :external-validation="publicationSeriesExternalValidation"
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <book-series-autocomplete-search
                    v-model="selectedBookSeries"
                    allow-manual-clearing
                    :external-validation="publicationSeriesExternalValidation"
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6">
                <v-text-field v-model="volume" :label="$t('volumeLabel')" :placeholder="$t('volumeLabel')"></v-text-field>
            </v-col>
            <v-col cols="6">
                <v-text-field v-model="number" :label="$t('issueLabel')" :placeholder="$t('issueLabel')"></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <publisher-autocomplete-search
                    ref="publisherAutocompleteRef"
                    v-model="selectedPublisher"
                    allow-author-reprint>
                </publisher-autocomplete-search>
            </v-col>
        </v-row>
        <!-- <v-row>
            <v-col cols="12">
                <event-autocomplete-search v-model="selectedEvent"></event-autocomplete-search>
            </v-col>
        </v-row> -->
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
import type { ExternalValidation, LanguageResponse, LanguageTagResponse, MultilingualContent } from '@/models/Common';
import { onMounted } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import type { MonographType, Monograph } from '@/models/PublicationModel';
import UriInput from '@/components/core/UriInput.vue';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';
import ResearchAreaService from '@/services/ResearchAreaService';
import { getMonographTypesForGivenLocale, getMonographTypeTitleFromValueAutoLocale } from '@/i18n/monographType';
import type { ResearchArea } from '@/models/OrganisationUnitModel';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import JournalAutocompleteSearch from '@/components/journal/JournalAutocompleteSearch.vue';
import BookSeriesAutocompleteSearch from '@/components/bookSeries/BookSeriesAutocompleteSearch.vue';
import { watch } from 'vue';
import EventService from '@/services/EventService';
import JournalService from '@/services/JournalService';
import BookSeriesService from '@/services/BookSeriesService';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import Toast from '@/components/core/Toast.vue';
import { useIdentifierCheck } from '@/composables/useIdentifierCheck';
import PublisherService from '@/services/PublisherService';
import PublisherAutocompleteSearch from '@/components/publisher/PublisherAutocompleteSearch.vue';


export default defineComponent({
    name: "MonographUpdateForm",
    components: {MultilingualTextInput, UriInput, JournalAutocompleteSearch, BookSeriesAutocompleteSearch, Toast, PublisherAutocompleteSearch},
    props: {
        presetMonograph: {
            type: Object as PropType<Monograph | undefined>,
            required: true
        },
        inModal: {
            type: Boolean,
            default: true
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const languageTags = ref<LanguageTagResponse[]>([]);
        const languageList = ref<{title: string, value: number}[]>([]);

        const { checkIdentifiers, message, snackbar } = useIdentifierCheck();
        const i18n = useI18n();

        const selectOneMessage = computed(() => i18n.t("selectOnePublicationSeriesMessage"));
        const noDataMessage = computed(() => i18n.t("noDataMessage"));

        const selectedLanguages = ref<number[]>(props.presetMonograph?.languageIds as number[]);

        onMounted(() => {
            LanguageService.getAllLanguageTags().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                languageTags.value = response.data;
            });

            LanguageService.getAllLanguages().then((response: AxiosResponse<LanguageResponse[]>) => {
                response.data.forEach(language => {
                    languageList.value.push({title: `${returnCurrentLocaleContent(language.name)} (${language.languageCode})`, value: language.id});
                })
            });

            ResearchAreaService.listAllResearchAreas().then(response => {
                allResearchAreas.value = response.data;
                populateSelectionData();
            });

            fetchDetails();
        });

        const fetchDetails = () => {
            if (props.presetMonograph) {
                if (props.presetMonograph.researchAreaId) {
                    ResearchAreaService.readResearchAreaHierarchy(props.presetMonograph.researchAreaId).then((response) => {
                        selectedResearchArea.value = {title: returnCurrentLocaleContent(response.data.name) as string, value: response.data.id as number};
                    });
                } else {
                    selectedResearchArea.value.title = noDataMessage.value;
                }

                if (props.presetMonograph.eventId) {
                    EventService.readConference(props.presetMonograph.eventId).then(response => {
                        selectedEvent.value = {title: returnCurrentLocaleContent(response.data.name) as string, value: response.data.id as number};
                    });
                }

                if(props.presetMonograph?.publicationSeriesId) {
                    JournalService.readJournal(props.presetMonograph?.publicationSeriesId).then((journalResponse) => {
                        selectedJournal.value = {title: returnCurrentLocaleContent(journalResponse.data.title) as string, value: journalResponse.data.id as number};
                    }).catch(() => {
                        BookSeriesService.readBookSeries(props.presetMonograph?.publicationSeriesId as number).then((bookSeriesResponse) => {
                            selectedBookSeries.value = {title: returnCurrentLocaleContent(bookSeriesResponse.data.title) as string, value: bookSeriesResponse.data.id as number};
                        });
                    });
                }
                
                if(props.presetMonograph?.publisherId) {
                    PublisherService.readPublisher(props.presetMonograph.publisherId).then((response) => {
                        const publisher = response.data;
                        selectedPublisher.value = {
                            title: returnCurrentLocaleContent(publisher.name) as string, value: publisher.id as number
                        };
                    });
                } else if (props.presetMonograph?.authorReprint) {
                    selectedPublisher.value = {title: "", value: -2};
                }
            }
        };

        watch(() => props.presetMonograph, () => {
            if (props.presetMonograph) {
                refreshForm();
            }
        });

        const populateSelectionData = () => {
            researchAreasSelectable.value = [];
            allResearchAreas.value.forEach(researchArea => {
                researchAreasSelectable.value.push({title: returnCurrentLocaleContent(researchArea.name) as string, value: researchArea.id as number});
            });
        };

        const titleRef = ref<typeof MultilingualTextInput>();
        const subtitleRef = ref<typeof MultilingualTextInput>();
        const urisRef = ref<typeof UriInput>();

        const searchPlaceholder = {title: "", value: -1};
        const selectedEvent = ref<{ title: string, value: number }>(searchPlaceholder);
        const selectedJournal = ref<{ title: string, value: number }>(searchPlaceholder);
        const selectedBookSeries = ref<{ title: string, value: number }>(searchPlaceholder);

        const monographTypes = getMonographTypesForGivenLocale();
        const selectedMonographType = ref<{title: string, value: MonographType | null}>({ title: getMonographTypeTitleFromValueAutoLocale(props.presetMonograph?.monographType as MonographType) as string, value: props.presetMonograph?.monographType as MonographType });

        const allResearchAreas = ref<ResearchArea[]>([]);
        const researchAreasSelectable = ref<{ title: string, value: number }[]>([]);
        const selectedResearchArea = ref<{ title: string, value: number | null}>({ title: "", value: null });
        const selectedPublisher = ref<{ title: string, value: number }>(searchPlaceholder);
        
        const title = ref<any>([]);
        const subtitle = ref<any>([]);
        const contributions = ref([]);
        const uris = ref<string[]>(props.presetMonograph?.uris as string[]);
        const eIsbn = ref(props.presetMonograph?.eisbn);
        const printIsbn = ref(props.presetMonograph?.printISBN);
        const numberOfPages = ref(props.presetMonograph?.numberOfPages);
        const publicationYear = ref(props.presetMonograph?.documentDate);
        const doi = ref(props.presetMonograph?.doi);
        const scopus = ref(props.presetMonograph?.scopusId);
        const openAlexId = ref(props.presetMonograph?.openAlexId);
        const webOfScienceId = ref(props.presetMonograph?.webOfScienceId);
        const number = ref(props.presetMonograph?.number);
        const volume = ref(props.presetMonograph?.volume);

        const {
            requiredFieldRules, requiredSelectionRules,
            doiValidationRules, scopusIdValidationRules,
            isbnValidationRules, workOpenAlexIdValidationRules,
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
                const { duplicateFound } = await checkIdentifiers(
                    [
                        { value: eIsbn.value as string, error: "eisbnExistsError" },
                        { value: printIsbn.value as string, error: "printIsbnExistsError" },
                        { value: doi.value as string, error: "doiExistsError" },
                        { value: scopus.value as string, error: "scopusIdExistsError" },
                        { value: openAlexId.value as string, error: "openAlexIdExistsError"},
                        { value: webOfScienceId.value as string, error: "webOfScienceIdExistsError"}
                    ],
                    props.presetMonograph?.id as number,
                    (id, docId) => DocumentPublicationService.checkMonographIdentifierUsage(id, docId)
                );

                if (duplicateFound) {
                    return;
                }
            }

            let publicationSeriesId: number | undefined = selectedBookSeries.value?.value !== -1 ? selectedBookSeries.value?.value : selectedJournal.value?.value;
            if (publicationSeriesId === -1) {
                publicationSeriesId = undefined;
            }

            const updatedMonograph: Monograph = {
                description: props.presetMonograph?.description as MultilingualContent[],
                keywords: props.presetMonograph?.keywords as MultilingualContent[],
                subTitle: subtitle.value,
                title: title.value,
                uris: uris.value as string[],
                contributions: contributions.value,
                documentDate: publicationYear.value,
                doi: doi.value,
                openAlexId: openAlexId.value,
                webOfScienceId: webOfScienceId.value,
                eisbn: eIsbn.value,
                eventId: selectedEvent.value?.value > 0 ? selectedEvent.value?.value : undefined,
                languageIds: selectedLanguages.value,
                numberOfPages: numberOfPages.value,
                printISBN: printIsbn.value,
                publicationSeriesId: publicationSeriesId as number,
                scopusId: scopus.value,
                monographType: selectedMonographType.value.value as MonographType,
                number: number.value,
                volume: volume.value,
                researchAreaId: selectedResearchArea.value?.value as number,
                publisherId: (!selectedPublisher.value || selectedPublisher.value.value < 0) ? undefined : selectedPublisher.value.value,
                authorReprint: selectedPublisher.value?.value === -2,
                fileItems: [],
                proofs: []
            };

            emit("update", updatedMonograph);
        };

        const refreshForm = () => {
            titleRef.value?.clearInput();
            title.value = props.presetMonograph?.title as MultilingualContent[];

            subtitleRef.value?.clearInput();
            subtitle.value = props.presetMonograph?.subTitle as MultilingualContent[];

            selectedLanguages.value = props.presetMonograph?.languageIds as number[];
            uris.value = props.presetMonograph?.uris as string[];
            eIsbn.value = props.presetMonograph?.eisbn;
            printIsbn.value = props.presetMonograph?.printISBN;
            numberOfPages.value = props.presetMonograph?.numberOfPages;
            publicationYear.value = props.presetMonograph?.documentDate;
            doi.value = props.presetMonograph?.doi;
            scopus.value = props.presetMonograph?.scopusId;
            openAlexId.value = props.presetMonograph?.openAlexId;
            webOfScienceId.value = props.presetMonograph?.webOfScienceId;
            volume.value = props.presetMonograph?.volume;
            number.value = props.presetMonograph?.number;
            selectedMonographType.value = {title: props.presetMonograph?.monographType ? getMonographTypeTitleFromValueAutoLocale(props.presetMonograph?.monographType as MonographType) as string : "", value: props.presetMonograph?.monographType ? props.presetMonograph?.monographType as MonographType : null};

            titleRef.value?.forceRefreshModelValue(toMultilingualTextInput(title.value, languageTags.value));
            subtitleRef.value?.forceRefreshModelValue(toMultilingualTextInput(subtitle.value, languageTags.value));
            urisRef.value?.refreshModelValue(uris.value);

            fetchDetails();
        };

        return {
            isFormValid, title, subtitle,
            publicationYear, doi, scopus,
            requiredFieldRules, submit, 
            toMultilingualTextInput, languageTags,
            number, volume, selectedJournal,
            selectedBookSeries, monographTypes,
            selectedMonographType, allResearchAreas,
            researchAreasSelectable, selectedEvent,
            publicationSeriesExternalValidation,
            eIsbn, printIsbn, numberOfPages,
            selectedLanguages, languageList,
            requiredSelectionRules, uris,
            selectedResearchArea, doiValidationRules,
            scopusIdValidationRules, titleRef,
            subtitleRef, refreshForm, urisRef,
            isbnValidationRules, snackbar, message,
            openAlexId, workOpenAlexIdValidationRules,
            webOfScienceId, documentWebOfScienceIdValidationRules,
            selectedPublisher, optionalNumericZeroOrGreaterFieldRules
        };
    }
});
</script>
