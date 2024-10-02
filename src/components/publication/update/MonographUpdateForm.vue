<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <multilingual-text-input v-model="title" :rules="requiredFieldRules" :label="$t('titleLabel') + '*'" :initial-value="toMultilingualTextInput(presetMonograph?.title, languageTags)"></multilingual-text-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-text-field v-model="publicationYear" :rules="requiredFieldRules" :label="$t('yearOfPublicationLabel') + '*'" :placeholder="$t('yearOfPublicationLabel')"></v-text-field>
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
                <multilingual-text-input v-model="subtitle" :label="$t('subtitleLabel')" :initial-value="toMultilingualTextInput(presetMonograph?.subTitle, languageTags)"></multilingual-text-input>
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
                    v-model="selectedLanguages"
                    :label="$t('languageLabel')"
                    :items="languageList"
                    multiple
                ></v-select>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-text-field v-model="numberOfPages" type="number" :label="$t('numberOfPagesLabel')" :placeholder="$t('numberOfPagesLabel')"></v-text-field>
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
                <v-text-field v-model="doi" label="DOI" placeholder="DOI" :rules="doiValidationRules"></v-text-field>
            </v-col>
            <v-col cols="6">
                <v-text-field v-model="scopus" label="Scopus ID" placeholder="Scopus ID" :rules="scopusIdValidationRules"></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <journal-autocomplete-search v-model="selectedJournal" allow-manual-clearing :external-validation="publicationSeriesExternalValidation"></journal-autocomplete-search>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <book-series-autocomplete-search v-model="selectedBookSeries" allow-manual-clearing :external-validation="publicationSeriesExternalValidation"></book-series-autocomplete-search>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6">
                <v-text-field v-model="number" :label="$t('numberLabel')" :placeholder="$t('numberLabel')"></v-text-field>
            </v-col>
            <v-col cols="6">
                <v-text-field v-model="volume" :label="$t('volumeLabel')" :placeholder="$t('volumeLabel')"></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <event-autocomplete-search v-model="selectedEvent"></event-autocomplete-search>
            </v-col>
        </v-row>

        <v-row>
            <p class="required-fields-message">
                {{ $t("requiredFieldsMessage") }}
            </p>
        </v-row>
    </v-form>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import { ref } from 'vue';
import type { ExternalValidation, LanguageTagResponse, MultilingualContent } from '@/models/Common';
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
import EventAutocompleteSearch from '@/components/event/EventAutocompleteSearch.vue';
import { watch } from 'vue';
import EventService from '@/services/EventService';
import JournalService from '@/services/JournalService';
import BookSeriesService from '@/services/BookSeriesService';


export default defineComponent({
    name: "MonographUpdateForm",
    components: {MultilingualTextInput, UriInput, JournalAutocompleteSearch, BookSeriesAutocompleteSearch, EventAutocompleteSearch},
    props: {
        presetMonograph: {
            type: Object as PropType<Monograph | undefined>,
            required: true
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const languageTags = ref<LanguageTagResponse[]>([]);
        const languageList = ref<{title: string, value: number}[]>([]);

        const i18n = useI18n();
        const selectOneMessage = computed(() => i18n.t("selectOnePublicationSeriesMessage"));

        const selectedLanguages = ref<number[]>([]);

        onMounted(() => {
            LanguageService.getAllLanguageTags().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                languageTags.value = response.data;
                response.data.forEach(languageTag => {
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

            fetchDetails();
        });

        const fetchDetails = () => {
            if (props.presetMonograph) {
                if (props.presetMonograph.researchAreaId) {
                    ResearchAreaService.readResearchAreaHierarchy(props.presetMonograph.researchAreaId).then((response) => {
                        selectedResearchArea.value = {title: returnCurrentLocaleContent(response.data.name) as string, value: response.data.id as number};
                    });
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

        const title = ref<any>([]);
        const subtitle = ref<any>([]);
        const contributions = ref([]);
        const uris = ref(props.presetMonograph?.uris);
        const eIsbn = ref(props.presetMonograph?.eisbn);
        const printIsbn = ref(props.presetMonograph?.printISBN);
        const numberOfPages = ref(props.presetMonograph?.numberOfPages);
        const publicationYear = ref(props.presetMonograph?.documentDate);
        const doi = ref(props.presetMonograph?.doi);
        const scopus = ref(props.presetMonograph?.scopusId);
        const number = ref(props.presetMonograph?.number);
        const volume = ref(props.presetMonograph?.volume);

        const { requiredFieldRules, requiredSelectionRules,
            doiValidationRules, scopusIdValidationRules } = useValidationUtils();

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

        const updateMonograph = () => {
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
                eisbn: eIsbn.value,
                eventId: selectedEvent.value?.value > 0 ? selectedEvent.value?.value : undefined,
                languageTagIds: selectedLanguages.value,
                numberOfPages: numberOfPages.value,
                printISBN: printIsbn.value,
                publicationSeriesId: publicationSeriesId as number,
                scopusId: scopus.value,
                monographType: selectedMonographType.value.value as MonographType,
                number: number.value,
                volume: volume.value,
                researchAreaId: selectedResearchArea.value?.value as number,
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

            selectedLanguages.value = props.presetMonograph?.languageTagIds as number[];
            uris.value = props.presetMonograph?.uris as string[];
            eIsbn.value = props.presetMonograph?.eisbn;
            printIsbn.value = props.presetMonograph?.printISBN;
            numberOfPages.value = props.presetMonograph?.numberOfPages;
            publicationYear.value = props.presetMonograph?.documentDate;
            doi.value = props.presetMonograph?.doi;
            scopus.value = props.presetMonograph?.scopusId;
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
            requiredFieldRules, updateMonograph, 
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
            subtitleRef, refreshForm, urisRef
        };
    }
});
</script>
