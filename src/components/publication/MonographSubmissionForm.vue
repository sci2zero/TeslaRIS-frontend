<template>
    <v-form v-model="isFormValid" class="flex flex-col gap-6" @submit.prevent>
        <form-section
            icon="mdi-file-document-outline"
            :title="$t('publicationDetailsLabel')"
        >
            <i-d-f-metadata-prepopulator
                :document-type="PublicationType.MONOGRAPH"
                @metadata-fetched="popuateMetadata"
            />
            <multilingual-text-input
                ref="titleRef"
                v-model="title"
                :rules="requiredFieldRules"
                :label="$t('titleLabel') + '*'"
            />
            <publication-deduplication-table
                ref="deduplicationTableRef"
                :title="title"
                :doi="doi"
                :scopus-id="scopus"
                :web-of-science-id="webOfScienceId"
                :open-alex-id="openAlexId"
            />
            <flexible-date-picker
                v-model="publicationDate"
                :label="$t('yearOfPublicationLabel') + '*'"
                required
            />
            <ui-input control="select"
                v-model="selectedMonographType"
                :label="$t('monographTypeLabel') + '*'"
                :items="monographTypes"
                :rules="requiredSelectionRules"
                :disabled="inModal"
                return-object
            />
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ui-input
                    v-model="eIsbn"
                    label="E-ISBN"
                    placeholder="E-ISBN"
                    :rules="isbnValidationRules"
                />
                <ui-input
                    v-model="printIsbn"
                    label="Print ISBN"
                    placeholder="Print ISBN"
                    :rules="isbnValidationRules"
                />
            </div>
        </form-section>

        <form-section
            icon="mdi-account-multiple-outline"
            :title="$t('authorsLabel')"
            :description="$t('contributionAccordionHint')"
        >
            <person-publication-contribution
                ref="contributionsRef"
                basic
                :required="false"
                @set-input="contributions = $event"
            />
        </form-section>

        <form-section :title="$t('additionalFieldsLabel')">
            <ui-button variant="outline" type="button" @click="additionalFields = !additionalFields">
                {{ $t("additionalFieldsLabel") }} {{ additionalFields ? "▲" : "▼" }}
            </ui-button>
            <template v-if="additionalFields">
                <multilingual-text-input
                    ref="subtitleRef"
                    v-model="subtitle"
                    :label="$t('subtitleLabel')"
                />
                <multilingual-text-input
                    ref="descriptionRef"
                    v-model="description"
                    is-area
                    :label="$t('abstractLabel')"
                />
                <multilingual-text-input
                    ref="keywordsRef"
                    v-model="keywords"
                    :label="$t('keywordsLabel')"
                    is-area
                />
                <uri-input ref="urisRef" v-model="uris" />
                <ui-input control="select"
                    v-model="selectedResearchArea"
                    :label="$t('researchAreaLabel')"
                    :placeholder="$t('researchAreaLabel')"
                    :items="researchAreasSelectable"
                    return-object
                />
                <ui-input control="select"
                    v-model="selectedLanguages"
                    :label="$t('languageLabel')"
                    :items="languageList"
                    multiple
                />
                <ui-input
                    v-model="numberOfPages"
                    type="number"
                    :label="$t('numberOfPagesLabel')"
                    :rules="optionalNumericZeroOrGreaterFieldRules"
                    :placeholder="$t('numberOfPagesLabel')"
                />
                <journal-autocomplete-search
                    ref="journalAutocompleteRef"
                    v-model="selectedJournal"
                    allow-manual-clearing
                    :external-validation="publicationSeriesExternalValidation"
                />
                <book-series-autocomplete-search
                    ref="bookSeriesAutocompleteRef"
                    v-model="selectedBookSeries"
                    allow-manual-clearing
                    :external-validation="publicationSeriesExternalValidation"
                />
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ui-input
                        v-model="volume"
                        :label="$t('volumeLabel')"
                        :placeholder="$t('volumeLabel')"
                    />
                    <ui-input
                        v-model="number"
                        :label="$t('issueLabel')"
                        :placeholder="$t('issueLabel')"
                    />
                </div>
                <!-- <event-autocomplete-search
                    ref="eventAutocompleteRef"
                    v-model="selectedEvent">
                </event-autocomplete-search> -->
                <publisher-autocomplete-search
                    ref="publisherAutocompleteRef"
                    v-model="selectedPublisher"
                    allow-author-reprint
                />
                <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <ui-input
                        v-model="scopus"
                        label="Scopus ID"
                        placeholder="Scopus ID"
                        :rules="scopusIdValidationRules"
                    />
                    <ui-input
                        v-model="openAlexId"
                        label="Open Alex ID"
                        placeholder="Open Alex ID"
                        :rules="workOpenAlexIdValidationRules"
                    />
                    <ui-input
                        v-model="webOfScienceId"
                        label="Web of Science ID"
                        placeholder="Web of Science ID"
                        :rules="documentWebOfScienceIdValidationRules"
                    />
                </div>
                <ui-input
                    v-model="udc"
                    :label="$t('udcLabel')"
                    :placeholder="$t('udcLabel')"
                    :rules="udcValidationRules"
                />
                <document-common-fields
                    ref="commonFieldsRef"
                    v-model="commonFieldsData"
                    :preset-data="presetCommonFieldsData"
                />
            </template>
        </form-section>

        <p class="text-sm text-slate-500">
            {{ $t("requiredFieldsMessage") }}
        </p>
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
import type { FlexibleDate, LanguageTagResponse, MultilingualContent, PrepopulatedMetadata } from '@/models/Common';
import { onMounted } from 'vue';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';
import UriInput from '../core/UriInput.vue';
import JournalAutocompleteSearch from '../journal/JournalAutocompleteSearch.vue';
import { MonographType, type PersonDocumentContribution, PublicationType, type Monograph, type CommonFieldsData } from "@/models/PublicationModel";
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
import PublicationDeduplicationTable from './PublicationDeduplicationTable.vue';
import DocumentCommonFields from './DocumentCommonFields.vue';
import { detectLanguage } from '@/utils/LanguageDetector.js';
import FlexibleDatePicker from '../core/FlexibleDatePicker.vue';


import UiInput from '@/components/ui/input/Input.vue';
import FormSection from '@/components/ui/form-section/FormSection.vue';
import { UiButton } from '@/components/ui/button';

export default defineComponent({
    name: "SubmitMonograph",
    components: {MultilingualTextInput, UriInput, JournalAutocompleteSearch, BookSeriesAutocompleteSearch, PersonPublicationContribution, Toast, IDFMetadataPrepopulator, PublisherAutocompleteSearch, PublicationDeduplicationTable, DocumentCommonFields, FlexibleDatePicker, UiInput, FormSection, UiButton},
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

        onMounted(() => {
            LanguageService.getAllLanguageTags().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                languageTags.value = response.data;

                presetName();
            });

            LanguageService.getAllLanguages().then(response => {
                response.data.forEach(language => {
                    languageList.value.push(
                        {title: `${returnCurrentLocaleContent(language.name)} (${language.languageCode})`, value: language.id}
                    );

                    if (i18n.locale.value.toUpperCase().startsWith(language.languageCode)) {
                        selectedLanguages.value.push(language.id);
                    }
                });
            })

            ResearchAreaService.listAllResearchAreas().then(response => {
                allResearchAreas.value = response.data;
                populateSelectionData();
            });

            selectedResearchArea.value.title = noDataMessage.value;

            if (props.inModal) {
                selectedMonographType.value = {
                    title: getMonographTypeTitleFromValueAutoLocale(MonographType.EDITED_BOOK) as string,
                    value: MonographType.EDITED_BOOK
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
                const detectedLocale = await detectLanguage(props.presetName);
                const tag = languageTags.value.find(
                    lt => lt.languageCode === detectedLocale
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
        const deduplicationTableRef = ref<typeof PublicationDeduplicationTable>();

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
        const keywords = ref<any[]>([]);
        const description = ref([]);
        const eIsbn = ref("");
        const printIsbn = ref("");
        const numberOfPages = ref();
        const publicationDate = ref<FlexibleDate>();
        const doi = ref("");
        const scopus = ref("");
        const number = ref("");
        const volume = ref("");
        const openAlexId = ref("");
        const webOfScienceId = ref("");
        const udc = ref("");

        const setPublicationYear = (date: string) => {
            const year = /\d{4}/.exec(date);
            if (year) {
                publicationDate.value = {year: Number.parseInt(year[0])};
            }
        };

        const commonFieldsRef = ref<typeof DocumentCommonFields>();
        const commonFieldsData = ref<CommonFieldsData>({});
        const presetCommonFieldsData = ref<CommonFieldsData | undefined>(undefined);

        const { 
            requiredFieldRules, requiredSelectionRules, doiValidationRules,
            isbnValidationRules, scopusIdValidationRules, workOpenAlexIdValidationRules,
            documentWebOfScienceIdValidationRules, optionalNumericZeroOrGreaterFieldRules,
            udcValidationRules
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
                documentDate: publicationDate.value,
                doi: doi.value,
                eisbn: eIsbn.value,
                eventId: selectedEvent.value?.value > 0 ? selectedEvent.value?.value : undefined,
                languageIds: selectedLanguages.value,
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
                publisherId: (!selectedPublisher.value || selectedPublisher.value.value < 0) ? undefined : selectedPublisher.value.value,
                authorReprint: selectedPublisher.value.value === -2,
                fileItems: [],
                proofs: [],
                udc: udc.value,
                ...commonFieldsData.value
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
                    udc.value = "";
                    printIsbn.value = "";
                    publicationDate.value = undefined;
                    contributionsRef.value?.clearInput();
                    publisherAutocompleteRef.value?.clearInput();
                    deduplicationTableRef.value?.resetTable();
                    commonFieldsRef.value?.clearInputs();
                    commonFieldsData.value = {};

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

            if (metadata.year > 0) {
                publicationDate.value = { year: metadata.year };
            }

            if (metadata.publishedInName && selectedJournal.value.value <= 0) {
                selectedJournal.value = {title: metadata.publishedInName, value: metadata.publishEntityId};
            }

            if (contributions.value.length === 0 && metadata.contributions.length !== 0) {
                contributions.value = metadata.contributions;
                contributionsRef.value?.fillDummyAuthors(contributions.value.length);

                await nextTick();

                contributionsRef.value?.fillInputs(contributions.value, true);
            }

            if (keywords.value.length === 0 && metadata.keywords.length !== 0) {
                additionalFields.value = true;
                await nextTick();
                
                keywords.value = metadata.keywords;
                keywordsRef.value?.forceRefreshModelValue(toMultilingualTextInput(keywords.value, languageTags.value));
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
            publicationDate, doi, scopus, numberOfPages,
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
            publisherAutocompleteRef, selectedPublisher,
            optionalNumericZeroOrGreaterFieldRules,
            deduplicationTableRef, udc, udcValidationRules,
            commonFieldsRef, commonFieldsData,
            presetCommonFieldsData
        };
    }
});
</script>
