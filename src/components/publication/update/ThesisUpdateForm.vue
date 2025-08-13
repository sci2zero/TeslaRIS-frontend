<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col v-if="!enterExternalOU" cols="11">
                <organisation-unit-autocomplete-search ref="ouAutocompleteRef" v-model:model-value="selectedOrganisationUnit" :readonly="isInstitutionalLibrarian" required></organisation-unit-autocomplete-search>
            </v-col>
            <v-col v-else>
                <multilingual-text-input
                    ref="externalOUNameRef" v-model="externalOUName" :rules="requiredFieldRules" :label="$t('externalOUNameLabel') + '*'"
                    :initial-value="toMultilingualTextInput(presetThesis?.externalOrganisationUnitName, languageTags)"></multilingual-text-input>
            </v-col>
        </v-row>
        <v-row v-if="!isInstitutionalLibrarian">
            <v-col>
                <v-btn color="blue darken-1" compact @click="enterExternalOU = !enterExternalOU">
                    {{ enterExternalOU ? $t("searchInSystemLabel") : $t("enterExternalOULabel") }}
                </v-btn>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="titleRef" v-model="title" :rules="requiredFieldRules" :label="$t('titleLabel') + '*'"
                    :initial-value="toMultilingualTextInput(presetThesis?.title, languageTags)"></multilingual-text-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="subtitleRef"
                    v-model="subtitle"
                    :label="$t('subtitleLabel')"
                    :initial-value="toMultilingualTextInput(presetThesis?.subTitle, languageTags)">
                </multilingual-text-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-select
                    v-model="selectedThesisType"
                    :label="$t('thesisTypeLabel') + '*'"
                    :items="publicationTypes"
                    :rules="requiredSelectionRules"
                    return-object
                ></v-select>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-text-field
                    v-model="publicationYear" type="number" 
                    :label="$t('yearOfPublicationLabel') + (canAddAsNonReference ? '' : '*')"
                    :placeholder="$t('yearOfPublicationLabel') + (canAddAsNonReference ? '' : '*')"
                    :rules="(canAddAsNonReference) ? [] : requiredFieldRules">
                </v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6">
                <date-picker
                    v-model="topicAcceptanceDate"
                    :label="$t('topicAcceptanceDateLabel')"
                    color="primary"
                ></date-picker>
            </v-col>
            <v-col v-show="presetThesis?.publicReviewCompleted" cols="6">
                <date-picker
                    v-model="thesisDefenceDate"
                    :label="$t('defenceDateLabel')"
                    color="primary"
                ></date-picker>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="scientificAreaRef"
                    v-model="scientificArea"
                    :label="$t('scientificAreaLabel')"
                    :initial-value="toMultilingualTextInput(presetThesis?.scientificArea, languageTags)">
                </multilingual-text-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="scientificSubAreaRef"
                    v-model="scientificSubArea"
                    :label="$t('scientificSubAreaLabel')"
                    :initial-value="toMultilingualTextInput(presetThesis?.scientificSubArea, languageTags)">
                </multilingual-text-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6">
                <v-text-field v-model="doi" label="DOI" placeholder="DOI" :rules="doiValidationRules"></v-text-field>
            </v-col>
            <v-col cols="6">
                <v-text-field
                    v-model="openAlexId"
                    label="Open Alex ID"
                    placeholder="Open Alex ID"
                    :rules="workOpenAlexIdValidationRules">
                </v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="4">
                <v-text-field
                    v-model="numberOfPages" type="number"
                    :label="$t('numberOfPagesLabel')"
                    :placeholder="$t('numberOfPagesLabel')">
                </v-text-field>
            </v-col>
            <v-col cols="4">
                <v-text-field
                    v-model="numberOfChapters" type="number"
                    :label="$t('numberOfChaptersLabel')"
                    :placeholder="$t('numberOfChaptersLabel')">
                </v-text-field>
            </v-col>
            <v-col cols="4">
                <v-text-field
                    v-model="numberOfReferences" type="number"
                    :label="$t('numberOfReferencesLabel')"
                    :placeholder="$t('numberOfReferencesLabel')">
                </v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6">
                <v-text-field
                    v-model="numberOfGraphs" type="number"
                    :label="$t('numberOfGraphsLabel')"
                    :placeholder="$t('numberOfGraphsLabel')">
                </v-text-field>
            </v-col>
            <v-col cols="6">
                <v-text-field
                    v-model="numberOfIllustrations" type="number"
                    :label="$t('numberOfIllustrationsLabel')"
                    :placeholder="$t('numberOfIllustrationsLabel')">
                </v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6">
                <v-text-field
                    v-model="numberOfTables" type="number"
                    :label="$t('numberOfTablesLabel')"
                    :placeholder="$t('numberOfTablesLabel')">
                </v-text-field>
            </v-col>
            <v-col cols="6">
                <v-text-field
                    v-model="numberOfAppendices" type="number"
                    :label="$t('numberOfAppendicesLabel')"
                    :placeholder="$t('numberOfAppendicesLabel')">
                </v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6">
                <v-text-field
                    v-model="eIsbn"
                    label="E-ISBN"
                    placeholder="E-ISBN"
                    :rules="isbnValidationRules">
                </v-text-field>
            </v-col>
            <v-col cols="6">
                <v-text-field
                    v-model="printIsbn"
                    label="Print ISBN"
                    placeholder="Print ISBN"
                    :rules="isbnValidationRules">
                </v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="placeOfKeepRef"
                    v-model="placeOfKeep"
                    :label="$t('placeOfKeepLabel')"
                    :initial-value="toMultilingualTextInput(presetThesis?.placeOfKeep, languageTags)">
                </multilingual-text-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-text-field
                    v-model="udc"
                    :label="$t('udcLabel')"
                    :placeholder="$t('udcLabel')"
                    :rules="udcValidationRules">
                </v-text-field>
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
                    v-model="selectedLanguage"
                    :label="$t('languageLabel')"
                    :items="languageList"
                ></v-select>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-select
                    v-model="selectedWritingLanguage"
                    :label="$t('writingLanguageLabel')"
                    :items="languageTagsList"
                    return-object
                ></v-select>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="typeOfTitleRef"
                    v-model="typeOfTitle"
                    :label="$t('typeOfTitleLabel')"
                    :initial-value="toMultilingualTextInput(presetThesis?.typeOfTitle, languageTags)">
                </multilingual-text-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="10">
                <publisher-autocomplete-search ref="publisherAutocompleteRef" v-model="selectedPublisher"></publisher-autocomplete-search>
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
import type { LanguageResponse, MultilingualContent } from '@/models/Common';
import { onMounted } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import type { Thesis, ThesisType } from '@/models/PublicationModel';
import UriInput from '@/components/core/UriInput.vue';
import PublisherAutocompleteSearch from '@/components/publisher/PublisherAutocompleteSearch.vue';
import PublisherService from '@/services/PublisherService';
import type { Publisher } from '@/models/PublisherModel';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';
import { getThesisTypesForGivenLocale, getThesisTitleFromValueAutoLocale } from '@/i18n/thesisType';
import { computed } from 'vue';
import OrganisationUnitAutocompleteSearch from '@/components/organisationUnit/OrganisationUnitAutocompleteSearch.vue';
import OrganisationUnitService from '@/services/OrganisationUnitService';
import { watch } from 'vue';
import Toast from '@/components/core/Toast.vue';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import { useIdentifierCheck } from '@/composables/useIdentifierCheck';
import { useLanguageTags } from '@/composables/useLanguageTags';
import { useUserRole } from '@/composables/useUserRole';
import DatePicker from '@/components/core/DatePicker.vue';


export default defineComponent({
    name: "ThesisUpdateForm",
    components: {MultilingualTextInput, UriInput, PublisherAutocompleteSearch, OrganisationUnitAutocompleteSearch, Toast, DatePicker},
    props: {
        presetThesis: {
            type: Object as PropType<Thesis | undefined>,
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
        const enterExternalOU = ref(false);

        const publisher = ref<Publisher>();

        const { checkIdentifiers, message, snackbar } = useIdentifierCheck();
        const { isAdmin, isInstitutionalLibrarian } = useUserRole();
        const canAddAsNonReference = computed(() => isAdmin.value || isInstitutionalLibrarian.value);

        const { languageTags } = useLanguageTags();
        const languageTagsList = ref<any[]>([]);
        const languageList = ref<{title: string, value: number}[]>([]);
        const selectedLanguage = ref<number>(props.presetThesis?.languageId as number);
        const selectedWritingLanguage = ref<{title: string, value: number}>();
        const languages = ref<LanguageResponse[]>();

        onMounted(() => {
            LanguageService.getAllLanguages().then((response: AxiosResponse<LanguageResponse[]>) => {
                languages.value = response.data;
                response.data.forEach((language: LanguageResponse) => {
                    languageList.value.push({title: `${returnCurrentLocaleContent(language.name)} (${language.languageCode})`, value: language.id});
                });
            });
            
            fetchDetails();
        });

        const fetchDetails = () => {
            if(props.presetThesis) {
                if (props.presetThesis.organisationUnitId) {
                    OrganisationUnitService.readOU(props.presetThesis.organisationUnitId).then((response) => {
                        selectedOrganisationUnit.value = {title: returnCurrentLocaleContent(response.data.name) as string, value: response.data.id as number}
                    });
                } else {
                    externalOUName.value = props.presetThesis?.externalOrganisationUnitName as MultilingualContent[];
                    enterExternalOU.value = true;
                }

                if (props.presetThesis?.publisherId) {
                    PublisherService.readPublisher(props.presetThesis.publisherId).then((response) => {
                        publisher.value = response.data;
                        selectedPublisher.value = {title: returnCurrentLocaleContent(publisher.value.name) as string, value: publisher.value.id as number};
                    });
                }
            }
        };

        watch(() => props.presetThesis, () => {
            if (props.presetThesis) {
                refreshForm();
            }
        });

        watch([selectedLanguage, languageTags], () => {
            if (!selectedLanguage.value || !languageTags.value || languageTags.value.length === 0) {
                return;
            }

            const language = languages.value?.find(lang => lang.id === selectedLanguage.value);
            if (language) {
                languageTagsList.value = languageTags.value
                    .filter(tag => tag.languageCode.startsWith(language.languageCode))
                    .map(tag => ({ title: tag.display, value: tag.id }));
            } else {
                languageTagsList.value = languageTags.value
                    .map(tag => ({ title: tag.display, value: tag.id }));
            }

            if (!selectedWritingLanguage.value && props.presetThesis?.writingLanguageTagId) {
                selectedWritingLanguage.value = languageTagsList.value.find(tag => tag.value === props.presetThesis?.writingLanguageTagId);
            }
        });

        const titleRef = ref<typeof MultilingualTextInput>();
        const externalOUNameRef = ref<typeof MultilingualTextInput>();
        const subtitleRef = ref<typeof MultilingualTextInput>();
        const urisRef = ref<typeof UriInput>();
        const scientificAreaRef = ref<typeof MultilingualTextInput>();
        const scientificSubAreaRef = ref<typeof MultilingualTextInput>();
        const typeOfTitleRef = ref<typeof MultilingualTextInput>();
        const placeOfKeepRef = ref<typeof MultilingualTextInput>();

        const selectedPublisher = ref<{ title: string, value: number }>({title: returnCurrentLocaleContent(publisher.value?.name) as string, value: publisher.value?.id as number});
        const selectedOrganisationUnit = ref<{ title: string, value: number }>();

        const title = ref<any>([]);
        const externalOUName = ref<any>([]);
        const subtitle = ref<any>([]);
        const publicationYear = ref(props.presetThesis?.documentDate);
        const doi = ref(props.presetThesis?.doi);
        const openAlexId = ref(props.presetThesis?.openAlexId);
        const numberOfPages = ref(props.presetThesis?.numberOfPages);
        const uris = ref<string[]>(props.presetThesis?.uris as string[]);
        const topicAcceptanceDate = ref(props.presetThesis?.topicAcceptanceDate as string);
        const thesisDefenceDate = ref(props.presetThesis?.thesisDefenceDate as string);

        const scientificArea = ref<any>([]);
        const scientificSubArea = ref<any>([]);
        const numberOfChapters = ref(props.presetThesis?.numberOfChapters as number);
        const numberOfReferences = ref(props.presetThesis?.numberOfReferences as number);
        const numberOfGraphs = ref(props.presetThesis?.numberOfGraphs as number);
        const numberOfIllustrations = ref(props.presetThesis?.numberOfIllustrations as number);
        const numberOfTables = ref(props.presetThesis?.numberOfTables as number);
        const numberOfAppendices = ref(props.presetThesis?.numberOfAppendices);
        const eIsbn = ref(props.presetThesis?.eisbn as string);
        const printIsbn = ref(props.presetThesis?.printISBN as string);
        const placeOfKeep = ref<any>([]);
        const udc = ref(props.presetThesis?.udc as string);
        const typeOfTitle = ref<any>([]);

        const {
            requiredFieldRules, requiredSelectionRules,
            doiValidationRules, scopusIdValidationRules,
            workOpenAlexIdValidationRules, isbnValidationRules,
            udcValidationRules
        } = useValidationUtils();

        const publicationTypes = computed(() => getThesisTypesForGivenLocale());
        const selectedThesisType = ref<{ title: string, value: ThesisType | undefined }>({title: getThesisTitleFromValueAutoLocale(props.presetThesis?.thesisType as ThesisType) as string, value: props.presetThesis?.thesisType as ThesisType});

        const submit = async () => {
            if (props.inModal) {
                const { duplicateFound } = await checkIdentifiers(
                    [
                        { value: doi.value as string, error: "doiExistsError" },
                        { value: openAlexId.value as string, error: "openAlexIdExistsError"}
                    ],
                    props.presetThesis?.id as number,
                    (id, docId) => DocumentPublicationService.checkIdentifierUsage(id, docId)
                );

                if (duplicateFound) {
                    return;
                }
            }
            
            const updatedThesis: Thesis = {
                organisationUnitId: enterExternalOU.value ? undefined : selectedOrganisationUnit.value?.value as number,
                externalOrganisationUnitName: externalOUName.value,
                scientificArea: scientificArea.value,
                scientificSubArea: scientificSubArea.value,
                thesisType: selectedThesisType.value.value as ThesisType,
                title: title.value as MultilingualContent[],
                numberOfPages: numberOfPages.value as number,
                numberOfChapters: numberOfChapters.value as number,
                numberOfReferences: numberOfReferences.value as number,
                numberOfIllustrations: numberOfIllustrations.value as number,
                numberOfGraphs: numberOfGraphs.value as number,
                numberOfTables: numberOfTables.value as number,
                numberOfAppendices: numberOfAppendices.value as number,
                description: props.presetThesis?.description as MultilingualContent[],
                keywords: props.presetThesis?.keywords as MultilingualContent[],
                subTitle: subtitle.value as MultilingualContent[],
                uris: uris.value,
                contributions: props.presetThesis?.contributions,
                documentDate: publicationYear.value,
                doi: doi.value,
                openAlexId: openAlexId.value,
                publisherId: selectedPublisher.value.value === -1 ? undefined : selectedPublisher.value.value,
                languageId: selectedLanguage.value,
                writingLanguageTagId: selectedWritingLanguage.value?.value as number,
                fileItems: [],
                proofs: [],
                topicAcceptanceDate: topicAcceptanceDate.value,
                thesisDefenceDate: thesisDefenceDate.value,
                printISBN: printIsbn.value,
                eisbn: eIsbn.value,
                udc: udc.value,
                placeOfKeep: placeOfKeep.value,
                typeOfTitle: typeOfTitle.value
            };

            emit("update", updatedThesis);
        };

        const refreshForm = () => {
            titleRef.value?.clearInput();
            title.value = props.presetThesis?.title as MultilingualContent[];

            externalOUNameRef.value?.clearInput();
            externalOUName.value = props.presetThesis?.externalOrganisationUnitName as MultilingualContent[];

            subtitleRef.value?.clearInput();
            subtitle.value = props.presetThesis?.subTitle as MultilingualContent[];

            scientificAreaRef.value?.clearInput();
            scientificArea.value = props.presetThesis?.scientificArea as MultilingualContent[];

            scientificSubAreaRef.value?.clearInput();
            scientificSubArea.value = props.presetThesis?.scientificSubArea as MultilingualContent[];

            placeOfKeepRef.value?.clearInput();
            placeOfKeep.value = props.presetThesis?.placeOfKeep as MultilingualContent[];

            typeOfTitleRef.value?.clearInput();
            typeOfTitle.value = props.presetThesis?.typeOfTitle as MultilingualContent[];

            selectedLanguage.value = props.presetThesis?.languageId as number;
            uris.value = props.presetThesis?.uris as string[];
            numberOfPages.value = props.presetThesis?.numberOfPages;
            numberOfChapters.value = props.presetThesis?.numberOfChapters as number;
            numberOfReferences.value = props.presetThesis?.numberOfReferences as number;
            numberOfTables.value = props.presetThesis?.numberOfTables as number;
            numberOfIllustrations.value = props.presetThesis?.numberOfIllustrations as number;
            numberOfGraphs.value = props.presetThesis?.numberOfGraphs as number;
            numberOfAppendices.value = props.presetThesis?.numberOfAppendices as number;
            publicationYear.value = props.presetThesis?.documentDate;
            doi.value = props.presetThesis?.doi;
            openAlexId.value = props.presetThesis?.openAlexId;
            topicAcceptanceDate.value = props.presetThesis?.topicAcceptanceDate as string;
            thesisDefenceDate.value = props.presetThesis?.thesisDefenceDate as string;
            printIsbn.value = props.presetThesis?.printISBN as string;
            eIsbn.value = props.presetThesis?.eisbn as string;
            udc.value = props.presetThesis?.udc as string;

            titleRef.value?.forceRefreshModelValue(toMultilingualTextInput(title.value, languageTags.value));
            subtitleRef.value?.forceRefreshModelValue(toMultilingualTextInput(subtitle.value, languageTags.value));
            urisRef.value?.refreshModelValue(uris.value);

            selectedThesisType.value = {
                title: 
                    props.presetThesis?.thesisType ? 
                        getThesisTitleFromValueAutoLocale(props.presetThesis?.thesisType as ThesisType) as string : "", 
                value: 
                    props.presetThesis?.thesisType ? props.presetThesis?.thesisType as ThesisType : undefined
            };

            fetchDetails();
        };

        return {
            isFormValid, title, subtitle, urisRef,
            publicationYear, doi, message, snackbar,
            numberOfPages, selectedPublisher, languageTagsList,
            uris, requiredFieldRules, requiredSelectionRules,
            submit, toMultilingualTextInput, selectedWritingLanguage,
            languageTags, doiValidationRules, enterExternalOU,
            scopusIdValidationRules, selectedOrganisationUnit,
            selectedLanguage, publicationTypes, selectedThesisType,
            languageList, titleRef, subtitleRef, refreshForm,
            externalOUName, externalOUNameRef, isInstitutionalLibrarian,
            topicAcceptanceDate, thesisDefenceDate, canAddAsNonReference,
            openAlexId, workOpenAlexIdValidationRules, isbnValidationRules,
            udcValidationRules, printIsbn, eIsbn, placeOfKeep, udc,
            numberOfChapters, numberOfReferences, numberOfTables,
            numberOfIllustrations, numberOfGraphs, numberOfAppendices,
            scientificArea, scientificSubArea, typeOfTitle, scientificAreaRef,
            scientificSubAreaRef, placeOfKeepRef, typeOfTitleRef
        };
    }
});
</script>
