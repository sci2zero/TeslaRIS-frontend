<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="8">
                <v-row>
                    <v-col cols="12">
                        <i-d-f-metadata-prepopulator
                            :document-type="PublicationType.THESIS"
                            @metadata-fetched="popuateMetadata"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="11">
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
                    <v-col v-if="!enterExternalOU" cols="12">
                        <organisation-unit-autocomplete-search
                            ref="ouAutocompleteRef"
                            v-model:model-value="selectedOrganisationUnit"
                            :top-level-institution-id="topLevelInstitutionId"
                            required
                            :allowed-thesis-type="selectedThesisType.value">
                        </organisation-unit-autocomplete-search>
                    </v-col>
                </v-row>
                <v-row v-if="enterExternalOU">
                    <v-col>
                        <multilingual-text-input
                            ref="externalOUNameRef"
                            v-model="externalOUName" :rules="requiredFieldRules"
                            :label="$t('externalOUNameLabel') + '*'">
                        </multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row v-if="!isInstitutionalLibrarian && !isHeadOfLibrary">
                    <v-col>
                        <v-btn color="blue darken-1" compact @click="enterExternalOU = !enterExternalOU">
                            {{ enterExternalOU ? $t("searchInSystemLabel") : $t("enterExternalThesisOULabel") }}
                        </v-btn>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input
                            ref="titleRef"
                            v-model="title"
                            :rules="requiredFieldRules"
                            :label="$t('titleLabel') + '*'">
                        </multilingual-text-input>
                    </v-col>
                </v-row>

                <v-row>
                    <v-row>
                        <v-col cols="12">
                            <publication-deduplication-table
                                ref="deduplicationTableRef"
                                :title="title"
                                :doi="doi"
                                :scopus-id="scopus"
                                :web-of-science-id="webOfScienceId"
                                :open-alex-id="openAlexId"
                            ></publication-deduplication-table>
                        </v-col>
                    </v-row>
                </v-row>

                <v-row>
                    <v-col cols="12">
                        <v-text-field
                            v-model="publicationYear" type="number" 
                            :label="$t('yearOfPublicationLabel') + (canAddAsNonReference ? '' : '*')"
                            :placeholder="$t('yearOfPublicationLabel') + (canAddAsNonReference ? '' : '*')"
                            :rules="(canAddAsNonReference) ? [] : requiredFieldRules">
                        </v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <multilingual-text-input
                            ref="scientificAreaRef"
                            v-model="scientificArea"
                            :label="$t((selectedThesisType.value == ThesisType.PHD_ART_PROJECT) ? 'artAreaLabel' : 'scientificAreaLabel')">
                        </multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <h2>{{ $t("authorLabel") }}</h2>
                        <person-publication-contribution
                            ref="contributionsRef"
                            limit-one basic
                            :lock-search-field="isResearcher"
                            :allow-external-associate="false"
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
                                ref="alternateTitleRef"
                                v-model="alternateTitle"
                                :label="$t('alternateTitleLabel')">
                            </multilingual-text-input>
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
                        <v-col
                            v-if="!isOrganisationUnitDLClient || isAdmin || isHeadOfLibrary"
                            cols="6">
                            <date-picker
                                v-model="thesisDefenceDate"
                                :label="$t('defenceDateLabel')"
                                color="primary"
                            ></date-picker>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-select
                                v-model="selectedLanguage"
                                :label="$t('languageLabel')"
                                :items="languageList"
                            ></v-select>
                        </v-col>
                        <v-col v-if="languagesWithMoreWritingSystems.includes(selectedLanguage as number)" cols="12" md="6">
                            <v-select
                                v-model="selectedWritingLanguage"
                                :label="$t('writingLanguageLabel')"
                                :items="languageTagsList"
                                return-object
                            ></v-select>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <multilingual-text-input
                                ref="scientificSubAreaRef"
                                v-model="scientificSubArea"
                                :label="$t((selectedThesisType.value == ThesisType.PHD_ART_PROJECT) ? 'artSubAreaLabel' : 'scientificSubAreaLabel')">
                            </multilingual-text-input>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="4">
                            <v-text-field
                                v-model="numberOfPages" type="number"
                                :label="$t('numberOfPagesLabel')"
                                :rules="optionalNumericZeroOrGreaterFieldRules"
                                :placeholder="$t('numberOfPagesLabel')">
                            </v-text-field>
                        </v-col>
                        <v-col cols="4">
                            <v-text-field
                                v-model="numberOfChapters" type="number"
                                :label="$t('numberOfChaptersLabel')"
                                :rules="optionalNumericZeroOrGreaterFieldRules"
                                :placeholder="$t('numberOfChaptersLabel')">
                            </v-text-field>
                        </v-col>
                        <v-col cols="4">
                            <v-text-field
                                v-model="numberOfReferences" type="number"
                                :label="$t('numberOfReferencesLabel')"
                                :rules="optionalNumericZeroOrGreaterFieldRules"
                                :placeholder="$t('numberOfReferencesLabel')">
                            </v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="3">
                            <v-text-field
                                v-model="numberOfGraphs" type="number"
                                :label="$t('numberOfGraphsLabel')"
                                :rules="optionalNumericZeroOrGreaterFieldRules"
                                :placeholder="$t('numberOfGraphsLabel')">
                            </v-text-field>
                        </v-col>
                        <v-col cols="3">
                            <v-text-field
                                v-model="numberOfIllustrations" type="number"
                                :label="$t('numberOfIllustrationsLabel')"
                                :rules="optionalNumericZeroOrGreaterFieldRules"
                                :placeholder="$t('numberOfIllustrationsLabel')">
                            </v-text-field>
                        </v-col>
                        <v-col cols="3">
                            <v-text-field
                                v-model="numberOfTables" type="number"
                                :label="$t('numberOfTablesLabel')"
                                :rules="optionalNumericZeroOrGreaterFieldRules"
                                :placeholder="$t('numberOfTablesLabel')">
                            </v-text-field>
                        </v-col>
                        <v-col cols="3">
                            <v-text-field
                                v-model="numberOfAppendices" type="number"
                                :label="$t('numberOfAppendicesLabel')"
                                :rules="optionalNumericZeroOrGreaterFieldRules"
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
                        <v-col cols="12">
                            <v-text-field
                                v-model="udc"
                                :label="$t('udcLabel')"
                                :placeholder="$t('udcLabel')"
                                :rules="udcValidationRules"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <multilingual-text-input
                                ref="placeOfKeepRef"
                                v-model="placeOfKeep"
                                :initial-value="toMultilingualTextInput(presetContent?.placeOfKeep, languageTagsList)"
                                :label="$t('placeOfKeepLabel')"
                                :default-placeholder="(presetContent?.placeOfKeep && presetContent?.placeOfKeep.length > 0) ? '.' : ''">
                            </multilingual-text-input>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <multilingual-text-input
                                ref="typeOfTitleRef"
                                v-model="typeOfTitle"
                                :label="$t('typeOfTitleLabel')"
                                :initial-value="toMultilingualTextInput(presetContent?.typeOfTitle, languageTagsList)"
                                default-placeholder="PhD (dr)">
                            </multilingual-text-input>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <multilingual-text-input
                                ref="descriptionRef" v-model="description"
                                is-area :label="$t('abstractLabel')">
                            </multilingual-text-input>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <multilingual-text-input
                                ref="keywordsRef" v-model="keywords"
                                :label="$t('keywordsLabel')" is-area>
                            </multilingual-text-input>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <uri-input ref="urisRef" v-model="uris"></uri-input>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <publisher-autocomplete-search
                                ref="publisherAutocompleteRef"
                                v-model="selectedPublisher"
                                allow-author-reprint>
                            </publisher-autocomplete-search>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="4">
                            <v-text-field
                                v-model="scopus"
                                label="Scopus ID"
                                placeholder="Scopus ID"
                                :rules="scopusIdValidationRules"
                            />
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
import { computed, defineComponent, nextTick, watch } from 'vue';
import MultilingualTextInput from '../core/MultilingualTextInput.vue';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PublisherAutocompleteSearch from '../publisher/PublisherAutocompleteSearch.vue';
import UriInput from '../core/UriInput.vue';
import PersonPublicationContribution from './PersonPublicationContribution.vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { DocumentContributionType, type PersonDocumentContribution, PublicationType, type Thesis, ThesisType } from "@/models/PublicationModel";
import DocumentPublicationService from '@/services/DocumentPublicationService';
import type { AxiosError, AxiosResponse } from 'axios';
import { useI18n } from 'vue-i18n';
import type { ErrorResponse, LanguageResponse, PrepopulatedMetadata } from '@/models/Common';
import LanguageService from '@/services/LanguageService';
import { onMounted } from 'vue';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import OrganisationUnitAutocompleteSearch from '../organisationUnit/OrganisationUnitAutocompleteSearch.vue';
import { getThesisTitleFromValueAutoLocale, getThesisTypesForGivenLocale } from '@/i18n/thesisType';
import Toast from '../core/Toast.vue';
import { useLanguageTags } from '@/composables/useLanguageTags';
import { useUserRole } from '@/composables/useUserRole';
import DatePicker from '../core/DatePicker.vue';
import IDFMetadataPrepopulator from '../core/IDFMetadataPrepopulator.vue';
import InstitutionDefaultSubmissionContentService from '@/services/InstitutionDefaultSubmissionContentService';
import type { InstitutionDefaultSubmissionContent } from '@/models/OrganisationUnitModel';
import UserService from '@/services/UserService';
import PersonService from '@/services/PersonService';
import OrganisationUnitService from '@/services/OrganisationUnitService';
import PublicationDeduplicationTable from './PublicationDeduplicationTable.vue';


export default defineComponent({
    name: "SubmitThesis",
    components: { MultilingualTextInput, UriInput, PersonPublicationContribution, PublisherAutocompleteSearch, OrganisationUnitAutocompleteSearch, Toast, DatePicker, IDFMetadataPrepopulator, PublicationDeduplicationTable },
    setup() {
        const isFormValid = ref(false);
        const additionalFields = ref(false);
        const enterExternalOU = ref(false);

        const snackbar = ref(false);
        const error = ref(false);

        const i18n = useI18n();
        const errorMessage = ref(i18n.t("genericErrorMessage"));

        const router = useRouter();
        const {
            isAdmin, isInstitutionalLibrarian,
            isHeadOfLibrary, isResearcher,
            loggedInUser
        } = useUserRole();
        const canAddAsNonReference = computed(() => isAdmin.value || isInstitutionalLibrarian.value || isHeadOfLibrary.value);

        const topLevelInstitutionId = ref(-1);

        const { languageTags } = useLanguageTags();
        const languageTagsList = ref<any[]>([]);
        const languageList = ref<{title: string, value: number}[]>([]);
        
        const selectedLanguage = ref<number>();
        const languagesWithMoreWritingSystems = ref<number[]>([]);

        const selectedWritingLanguage = ref<{title: string, value: number}>();
        const languages = ref<LanguageResponse[]>();

        const presetContent = ref<InstitutionDefaultSubmissionContent>();
        const isOrganisationUnitDLClient = ref(true);
        const route = useRoute();

        onMounted(() => {
            LanguageService.getAllLanguages().then((response: AxiosResponse<LanguageResponse[]>) => {
                languages.value = response.data;
                languagesWithMoreWritingSystems.value.splice(0);
                response.data.forEach((language: LanguageResponse) => {
                    languageList.value.push(
                        {title: `${returnCurrentLocaleContent(language.name)} (${language.languageCode})`, value: language.id}
                    );
                    if (i18n.locale.value.toUpperCase() === language.languageCode) {
                        selectedLanguage.value = language.id;
                    }
                    if (language.languageCode === "SR") {
                        languagesWithMoreWritingSystems.value.push(language.id);
                    }
                })
            });

            fetchDefaultContent();

            const researcherId = route.query.researcherId;
            if (isResearcher.value || researcherId) {
                populateSinglePossibleAuthor(researcherId ? (researcherId as string) : null);
            }
        });

        const fetchDefaultContent = () => {
            InstitutionDefaultSubmissionContentService.getContentForUser().then(response => {
                presetContent.value = response.data;
            });
        };

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
        });

        watch([loggedInUser, i18n], () => {
            presetOU();
        });

        const presetOU = () => {
            if (isInstitutionalLibrarian.value || isHeadOfLibrary.value) {
                selectedOrganisationUnit.value = {
                    title: returnCurrentLocaleContent(loggedInUser.value?.organisationUnitName) as string,
                    value: loggedInUser.value?.organisationUnitId as number
                };

                topLevelInstitutionId.value = loggedInUser.value?.organisationUnitId as number;
            }
        };

        const scientificArea = ref<any[]>([]);
        const scientificSubArea = ref<any[]>([]);

        const titleRef = ref<typeof MultilingualTextInput>();
        const alternateTitleRef = ref<typeof MultilingualTextInput>();
        const externalOUNameRef = ref<typeof MultilingualTextInput>();
        const subtitleRef = ref<typeof MultilingualTextInput>();
        const descriptionRef = ref<typeof MultilingualTextInput>();
        const keywordsRef = ref<typeof MultilingualTextInput>();
        const scientificAreaRef = ref<typeof MultilingualTextInput>();
        const scientificSubAreaRef = ref<typeof MultilingualTextInput>();
        const typeOfTitleRef = ref<typeof MultilingualTextInput>();
        const placeOfKeepRef = ref<typeof MultilingualTextInput>();
        const contributionsRef = ref<typeof PersonPublicationContribution>();
        const urisRef = ref<typeof UriInput>();
        const publisherAutocompleteRef = ref<typeof PublisherAutocompleteSearch>();
        const deduplicationTableRef = ref<typeof PublicationDeduplicationTable>();

        const searchPlaceholder = {title: "", value: -1};
        const selectedPublisher = ref<{ title: string, value: number }>(searchPlaceholder);

        const title = ref<any[]>([]);
        const alternateTitle = ref<any[]>([]);
        const externalOUName = ref([]);
        const subtitle = ref([]);
        const description = ref([]);
        const keywords = ref<any[]>([]);
        const contributions = ref<PersonDocumentContribution[]>([]);
        const publicationYear = ref("");
        const doi = ref("");
        const openAlexId = ref("");
        const webOfScienceId = ref("");
        const scopus = ref("");
        const numberOfPages = ref<number|null>();
        const numberOfChapters = ref<number|null>();
        const numberOfReferences = ref<number|null>();
        const numberOfGraphs = ref<number|null>();
        const numberOfIllustrations = ref<number|null>();
        const numberOfTables = ref<number|null>();
        const numberOfAppendices = ref<number|null>();
        const uris = ref<string[]>([]);
        const topicAcceptanceDate = ref("");
        const thesisDefenceDate = ref("");
        const eIsbn = ref("");
        const printIsbn = ref("");
        const placeOfKeep = ref<any[]>([]);
        const udc = ref("");
        const typeOfTitle = ref<any[]>([]);

        const thesisTypes = getThesisTypesForGivenLocale();
        const selectedThesisType = ref<{title: string, value: ThesisType | null}>(
            { title: getThesisTitleFromValueAutoLocale(ThesisType.PHD) as string, value: ThesisType.PHD }
        );

        const ouAutocompleteRef = ref<typeof OrganisationUnitAutocompleteSearch>();
        const selectedOrganisationUnit = ref<{ title: string, value: number }>({title: "", value: -1});

        const {
            requiredFieldRules, requiredSelectionRules,
            doiValidationRules, workOpenAlexIdValidationRules,
            isbnValidationRules, udcValidationRules,
            documentWebOfScienceIdValidationRules,
            scopusIdValidationRules,
            optionalNumericZeroOrGreaterFieldRules
        } = useValidationUtils();

        watch(selectedOrganisationUnit, () => {
            if (selectedOrganisationUnit.value.value > 0) {
                OrganisationUnitService.readOU(selectedOrganisationUnit.value.value).then((response) => {
                    isOrganisationUnitDLClient.value = response.data.clientInstitutionDl;
                });
            }
        });

        const submitThesis = (stayOnPage: boolean) => {
            const newThesis: Thesis = {
                title: title.value,
                thesisType: selectedThesisType.value.value as ThesisType,
                languageId: selectedLanguage.value as number,
                writingLanguageTagId: selectedWritingLanguage.value?.value as number,
                numberOfPages: numberOfPages.value as number,
                numberOfChapters: numberOfChapters.value as number,
                numberOfReferences: numberOfReferences.value as number,
                numberOfIllustrations: numberOfIllustrations.value as number,
                numberOfGraphs: numberOfGraphs.value as number,
                numberOfTables: numberOfTables.value as number,
                numberOfAppendices: numberOfAppendices.value as number,
                organisationUnitId: enterExternalOU.value ? undefined : selectedOrganisationUnit.value?.value as number,
                externalOrganisationUnitName: externalOUName.value,
                description: description.value,
                keywords: keywords.value,
                subTitle: subtitle.value,
                alternateTitle: alternateTitle.value,
                uris: uris.value,
                contributions: contributions.value,
                documentDate: publicationYear.value,
                doi: doi.value,
                openAlexId: openAlexId.value,
                scopusId: scopus.value,
                webOfScienceId: webOfScienceId.value,
                publisherId: (!selectedPublisher.value || selectedPublisher.value.value < 0) ? undefined : selectedPublisher.value.value,
                authorReprint: selectedPublisher.value.value === -2,
                scientificArea: scientificArea.value,
                scientificSubArea: scientificSubArea.value,
                fileItems: [],
                proofs: [],
                topicAcceptanceDate: topicAcceptanceDate.value,
                thesisDefenceDate: thesisDefenceDate.value,
                printISBN: printIsbn.value,
                eisbn: eIsbn.value,
                udc: udc.value,
                placeOfKeep: placeOfKeep.value,
                typeOfTitle: typeOfTitle.value,
            };

            DocumentPublicationService.createThesis(newThesis).then((response) => {
                if (stayOnPage) {
                    titleRef.value?.clearInput();
                    externalOUNameRef.value?.clearInput();
                    subtitleRef.value?.clearInput();
                    alternateTitleRef.value?.clearInput();
                    descriptionRef.value?.clearInput();
                    keywordsRef.value?.clearInput();
                    urisRef.value?.clearInput();
                    publisherAutocompleteRef.value?.clearInput();
                    ouAutocompleteRef.value?.clearInput();
                    publicationYear.value = "";
                    doi.value = "";
                    openAlexId.value = "";
                    webOfScienceId.value = "";
                    numberOfPages.value = null;
                    numberOfChapters.value = null;
                    numberOfReferences.value = null;
                    numberOfIllustrations.value = null;
                    numberOfGraphs.value = null;
                    numberOfTables.value = null;
                    numberOfAppendices.value = null;
                    selectedThesisType.value = { title: "", value: null };
                    scientificAreaRef.value?.clearInput();
                    scientificSubAreaRef.value?.clearInput();
                    selectedOrganisationUnit.value = {title: "", value: -1};
                    contributionsRef.value?.clearInput();
                    topicAcceptanceDate.value = "";
                    thesisDefenceDate.value = "";
                    eIsbn.value = "";
                    printIsbn.value = "";
                    placeOfKeepRef.value?.clearInput();
                    udc.value = "";
                    scopus.value = "";
                    typeOfTitleRef.value?.clearInput();
                    deduplicationTableRef.value?.resetTable();

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

        const popuateMetadata = async (metadata: PrepopulatedMetadata) => {
            if (title.value.length === 0) {
                title.value = metadata.title;
                titleRef.value?.forceRefreshModelValue(toMultilingualTextInput(title.value, languageTags.value));
            }
            
            uris.value.push(metadata.url);
            doi.value = doi.value ? doi.value : metadata.doi;

            if (metadata.year > 0) {
                publicationYear.value = `${metadata.year}`;
            }

            if (contributions.value.length === 0) {
                contributions.value = metadata.contributions;
                contributionsRef.value?.fillDummyAuthors(contributions.value.length);

                await nextTick();

                contributionsRef.value?.fillInputs(contributions.value, true);
            }

            if (keywords.value.length === 0) {
                additionalFields.value = true;
                await nextTick();
                
                keywords.value = metadata.keywords;
                keywordsRef.value?.forceRefreshModelValue(toMultilingualTextInput(keywords.value, languageTags.value));
            }
        };

        const populateSinglePossibleAuthor = async (researcherId: string | null) => {
            let personId: number;
            
            if (researcherId) {
                personId = parseInt(researcherId);
            } else {
                const userResponse = await UserService.getLoggedInUser();
                personId = userResponse.data.personId;
            }

            const personResponse = await PersonService.getPersonWithUser(personId);

            contributions.value = [
                {
                    contributionType: DocumentContributionType.AUTHOR,
                    isMainContributor: true,
                    isCorrespondingContributor: true,
                    isBoardPresident: false,
                    personId: personId,
                    contributionDescription: [],
                    orderNumber: 1,
                    displayAffiliationStatement: [],
                    personName: personResponse.data.personName
                }
            ];
            contributionsRef.value?.fillDummyAuthors(contributions.value.length);

            await nextTick();

            contributionsRef.value?.fillInputs(contributions.value, true);
        };

        return {
            isFormValid, PublicationType, popuateMetadata,
            additionalFields, snackbar, error, title, titleRef,
            subtitle, subtitleRef, publicationYear, doi, openAlexId,
            publisherAutocompleteRef, selectedPublisher, numberOfPages,
            description, descriptionRef, doiValidationRules,
            keywords, keywordsRef, uris, urisRef, selectedLanguage,
            contributions, contributionsRef, languageList,
            requiredFieldRules, submitThesis, errorMessage,
            requiredSelectionRules, enterExternalOU, languageTagsList,
            selectedThesisType, thesisTypes, selectedOrganisationUnit,
            externalOUName, externalOUNameRef, ouAutocompleteRef,
            selectedWritingLanguage, canAddAsNonReference,
            isInstitutionalLibrarian, topicAcceptanceDate,
            thesisDefenceDate, workOpenAlexIdValidationRules,
            numberOfChapters, numberOfReferences, numberOfGraphs,
            numberOfIllustrations, numberOfTables, numberOfAppendices,
            scientificArea, eIsbn, printIsbn, isbnValidationRules,
            udcValidationRules, placeOfKeep, udc, scientificSubArea,
            documentWebOfScienceIdValidationRules, webOfScienceId,
            typeOfTitle, scientificAreaRef, scientificSubAreaRef,
            placeOfKeepRef, typeOfTitleRef, presetContent,
            toMultilingualTextInput, isResearcher, scopus, ThesisType,
            scopusIdValidationRules, languagesWithMoreWritingSystems,
            alternateTitleRef, alternateTitle, isHeadOfLibrary,
            topLevelInstitutionId, optionalNumericZeroOrGreaterFieldRules,
            isOrganisationUnitDLClient, isAdmin, deduplicationTableRef
        };
    }
});
</script>
