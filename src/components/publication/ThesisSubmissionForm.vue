<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="8">
                <v-row>
                    <v-col v-if="!enterExternalOU" cols="12">
                        <organisation-unit-autocomplete-search
                            ref="ouAutocompleteRef"
                            v-model:model-value="selectedOrganisationUnit"
                            :readonly="isInstitutionalLibrarian"
                            required>
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
                            ref="titleRef" v-model="title"
                            :rules="requiredFieldRules" :label="$t('titleLabel') + '*'">
                        </multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
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
                    <v-col>
                        <h2>{{ $t("authorsLabel") }}</h2>
                        <person-publication-contribution
                            ref="contributionsRef"
                            basic
                            limit-one @set-input="contributions = $event">
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
                        <v-col cols="12">
                            <date-picker
                                v-model="topicAcceptanceDate"
                                :label="$t('topicAcceptanceDateLabel')"
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
                        <v-col cols="12" md="6">
                            <v-select
                                v-model="selectedWritingLanguage"
                                :label="$t('writingLanguageLabel')"
                                :items="languageTagsList"
                            ></v-select>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <v-select
                                v-model="selectedResearchArea"
                                :label="$t('researchAreaLabel')"
                                :items="researchAreasSelectable"
                                return-object
                            ></v-select>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field
                                v-model="doi" label="DOI"
                                placeholder="DOI" :rules="doiValidationRules">
                            </v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field
                                v-model="numberOfPages" type="number"
                                :label="$t('numberOfPagesLabel')"
                                :placeholder="$t('numberOfPagesLabel')">
                            </v-text-field>
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
                                v-model="selectedPublisher">
                            </publisher-autocomplete-search>
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
import { computed, defineComponent, watch } from 'vue';
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
import type { ErrorResponse, LanguageResponse } from '@/models/Common';
import ResearchAreaService from '@/services/ResearchAreaService';
import LanguageService from '@/services/LanguageService';
import { onMounted } from 'vue';
import type { ResearchArea } from '@/models/OrganisationUnitModel';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import OrganisationUnitAutocompleteSearch from '../organisationUnit/OrganisationUnitAutocompleteSearch.vue';
import { getThesisTypesForGivenLocale } from '@/i18n/thesisType';
import Toast from '../core/Toast.vue';
import { useLanguageTags } from '@/composables/useLanguageTags';
import { useUserRole } from '@/composables/useUserRole';
import DatePicker from '../core/DatePicker.vue';


export default defineComponent({
    name: "SubmitThesis",
    components: {MultilingualTextInput, UriInput, PersonPublicationContribution, PublisherAutocompleteSearch, OrganisationUnitAutocompleteSearch, Toast, DatePicker},
    setup() {
        const isFormValid = ref(false);
        const additionalFields = ref(false);
        const enterExternalOU = ref(false);

        const snackbar = ref(false);
        const error = ref(false);

        const i18n = useI18n();
        const errorMessage = ref(i18n.t("genericErrorMessage"));

        const router = useRouter();
        const { isAdmin, isInstitutionalLibrarian, loggedInUser } = useUserRole();
        const canAddAsNonReference = computed(() => isAdmin.value || isInstitutionalLibrarian.value);

        const { languageTagsList } = useLanguageTags();
        const languageList = ref<{title: string, value: number}[]>([]);
        const selectedLanguage = ref<number>();
        const selectedWritingLanguage = ref<number>();

        onMounted(() => {
            LanguageService.getAllLanguages().then((response: AxiosResponse<LanguageResponse[]>) => {
                response.data.forEach((language: LanguageResponse) => {
                    languageList.value.push({title: `${returnCurrentLocaleContent(language.name)} (${language.languageCode})`, value: language.id});
                    if (i18n.locale.value.toUpperCase() === language.languageCode) {
                        selectedLanguage.value = language.id;
                    }
                })
            });

            ResearchAreaService.listAllResearchAreas().then(response => {
                allResearchAreas.value = response.data;
                populateSelectionData();
            });
        });

        watch([loggedInUser, i18n], () => {
            presetOU();
        });

        const presetOU = () => {
            if (isInstitutionalLibrarian.value) {
                selectedOrganisationUnit.value = {
                    title: returnCurrentLocaleContent(loggedInUser.value?.organisationUnitName) as string,
                    value: loggedInUser.value?.organisationUnitId as number
                };
            }
        };

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
        const externalOUNameRef = ref<typeof MultilingualTextInput>();
        const subtitleRef = ref<typeof MultilingualTextInput>();
        const descriptionRef = ref<typeof MultilingualTextInput>();
        const keywordsRef = ref<typeof MultilingualTextInput>();
        const contributionsRef = ref<typeof PersonPublicationContribution>();
        const urisRef = ref<typeof UriInput>();
        const publisherAutocompleteRef = ref<typeof PublisherAutocompleteSearch>();

        const searchPlaceholder = {title: "", value: -1};
        const selectedPublisher = ref<{ title: string, value: number }>(searchPlaceholder);

        const title = ref([]);
        const externalOUName = ref([]);
        const subtitle = ref([]);
        const description = ref([]);
        const keywords = ref([]);
        const contributions = ref([]);
        const publicationYear = ref("");
        const doi = ref("");
        const numberOfPages = ref<number|null>();
        const uris = ref<string[]>([]);
        const topicAcceptanceDate = ref("");

        const thesisTypes = getThesisTypesForGivenLocale();
        const selectedThesisType = ref<{title: string, value: ThesisType | null}>({ title: "", value: null });

        const ouAutocompleteRef = ref<typeof OrganisationUnitAutocompleteSearch>();
        const selectedOrganisationUnit = ref<{ title: string, value: number }>({title: "", value: -1});

        const { requiredFieldRules, requiredSelectionRules, doiValidationRules } = useValidationUtils();

        const submitThesis = (stayOnPage: boolean) => {
            const newThesis: Thesis = {
                title: title.value,
                thesisType: selectedThesisType.value.value as ThesisType,
                languageId: selectedLanguage.value as number,
                writingLanguageTagId: selectedWritingLanguage.value as number,
                numberOfPages: numberOfPages.value as number,
                organisationUnitId: enterExternalOU.value ? undefined : selectedOrganisationUnit.value?.value as number,
                externalOrganisationUnitName: externalOUName.value,
                description: description.value,
                keywords: keywords.value,
                subTitle: subtitle.value,
                uris: uris.value,
                contributions: contributions.value,
                documentDate: publicationYear.value,
                doi: doi.value,
                publisherId: selectedPublisher.value.value === -1 ? undefined : selectedPublisher.value.value,
                researchAreaId: selectedResearchArea.value.value as number,
                fileItems: [],
                proofs: [],
                topicAcceptanceDate: topicAcceptanceDate.value
            };

            DocumentPublicationService.createThesis(newThesis).then((response) => {
                if (stayOnPage) {
                    titleRef.value?.clearInput();
                    externalOUNameRef.value?.clearInput();
                    subtitleRef.value?.clearInput();
                    descriptionRef.value?.clearInput();
                    keywordsRef.value?.clearInput();
                    urisRef.value?.clearInput();
                    publisherAutocompleteRef.value?.clearInput();
                    ouAutocompleteRef.value?.clearInput();
                    publicationYear.value = "";
                    doi.value = "";
                    numberOfPages.value = null;
                    selectedThesisType.value = { title: "", value: null };
                    selectedResearchArea.value = { title: "", value: null };
                    selectedOrganisationUnit.value = {title: "", value: -1};
                    contributionsRef.value?.clearInput();

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
            additionalFields, snackbar, error, title, titleRef,
            subtitle, subtitleRef, publicationYear, doi,
            publisherAutocompleteRef, selectedPublisher, numberOfPages,
            description, descriptionRef, doiValidationRules,
            keywords, keywordsRef, uris, urisRef, selectedLanguage,
            contributions, contributionsRef, languageList,
            requiredFieldRules, submitThesis, errorMessage,
            requiredSelectionRules, enterExternalOU, languageTagsList,
            researchAreasSelectable, selectedResearchArea,
            selectedThesisType, thesisTypes, selectedOrganisationUnit,
            externalOUName, externalOUNameRef, ouAutocompleteRef,
            selectedWritingLanguage, canAddAsNonReference,
            isInstitutionalLibrarian, topicAcceptanceDate
        };
    }
});
</script>
