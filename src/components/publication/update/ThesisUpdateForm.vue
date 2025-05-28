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
                <multilingual-text-input ref="subtitleRef" v-model="subtitle" :label="$t('subtitleLabel')" :initial-value="toMultilingualTextInput(presetThesis?.subTitle, languageTags)"></multilingual-text-input>
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
            <v-col cols="6">
                <date-picker
                    v-model="thesisDefenceDate"
                    :label="$t('defenceDateLabel')"
                    color="primary"
                ></date-picker>
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
                <v-text-field v-model="doi" label="DOI" placeholder="DOI" :rules="doiValidationRules"></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-text-field v-model="numberOfPages" type="number" :label="$t('numberOfPagesLabel')" :placeholder="$t('numberOfPagesLabel')"></v-text-field>
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
                ></v-select>
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
import ResearchAreaService from '@/services/ResearchAreaService';
import type { ResearchArea } from '@/models/OrganisationUnitModel';
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

        const { languageTags, languageTagsList } = useLanguageTags();
        const languageList = ref<{title: string, value: number}[]>([]);
        const selectedLanguage = ref<number>(props.presetThesis?.languageId as number);
        const selectedWritingLanguage = ref<number>(props.presetThesis?.writingLanguageTagId as number);

        onMounted(() => {
            LanguageService.getAllLanguages().then((response: AxiosResponse<LanguageResponse[]>) => {
                response.data.forEach((language: LanguageResponse) => {
                    languageList.value.push({title: `${returnCurrentLocaleContent(language.name)} (${language.languageCode})`, value: language.id});
                });
            });

            ResearchAreaService.listAllResearchAreas().then(response => {
                allResearchAreas.value = response.data;
                populateSelectionData();
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

                if (props.presetThesis.researchAreaId) {
                    ResearchAreaService.readResearchAreaHierarchy(props.presetThesis.researchAreaId).then((response) => {
                        selectedResearchArea.value = {title: returnCurrentLocaleContent(response.data.name) as string, value: response.data.id as number};
                    });
                }
            }
        };

        const populateSelectionData = () => {
            researchAreasSelectable.value = [];
            allResearchAreas.value.forEach(researchArea => {
                researchAreasSelectable.value.push({title: returnCurrentLocaleContent(researchArea.name) as string, value: researchArea.id as number});
            });
        };

        watch(() => props.presetThesis, () => {
            if (props.presetThesis) {
                refreshForm();
            }
        });

        const titleRef = ref<typeof MultilingualTextInput>();
        const externalOUNameRef = ref<typeof MultilingualTextInput>();
        const subtitleRef = ref<typeof MultilingualTextInput>();
        const urisRef = ref<typeof UriInput>();

        const selectedPublisher = ref<{ title: string, value: number }>({title: returnCurrentLocaleContent(publisher.value?.name) as string, value: publisher.value?.id as number});
        const selectedOrganisationUnit = ref<{ title: string, value: number }>();

        const allResearchAreas = ref<ResearchArea[]>([]);
        const researchAreasSelectable = ref<{ title: string, value: number }[]>([]);
        const selectedResearchArea = ref<{ title: string, value: number | null}>({ title: "", value: null });

        const title = ref<any>([]);
        const externalOUName = ref<any>([]);
        const subtitle = ref<any>([]);
        const publicationYear = ref(props.presetThesis?.documentDate);
        const doi = ref(props.presetThesis?.doi);
        const numberOfPages = ref(props.presetThesis?.numberOfPages);
        const uris = ref<string[]>(props.presetThesis?.uris as string[]);
        const topicAcceptanceDate = ref(props.presetThesis?.topicAcceptanceDate as string);
        const thesisDefenceDate = ref(props.presetThesis?.thesisDefenceDate as string);

        const { requiredFieldRules, requiredSelectionRules, doiValidationRules, scopusIdValidationRules } = useValidationUtils();

        const publicationTypes = computed(() => getThesisTypesForGivenLocale());
        const selectedThesisType = ref<{ title: string, value: ThesisType | undefined }>({title: getThesisTitleFromValueAutoLocale(props.presetThesis?.thesisType as ThesisType) as string, value: props.presetThesis?.thesisType as ThesisType});

        const submit = async () => {
            if (props.inModal) {
                const { duplicateFound } = await checkIdentifiers(
                    [{ value: doi.value as string, error: "doiExistsError" }],
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
                researchAreaId: selectedResearchArea.value.value as number,
                thesisType: selectedThesisType.value.value as ThesisType,
                title: title.value as MultilingualContent[],
                numberOfPages: numberOfPages.value as number,
                description: props.presetThesis?.description as MultilingualContent[],
                keywords: props.presetThesis?.keywords as MultilingualContent[],
                subTitle: subtitle.value as MultilingualContent[],
                uris: uris.value,
                contributions: props.presetThesis?.contributions,
                documentDate: publicationYear.value,
                doi: doi.value,
                publisherId: selectedPublisher.value.value === -1 ? undefined : selectedPublisher.value.value,
                languageId: selectedLanguage.value,
                writingLanguageTagId: selectedWritingLanguage.value,
                fileItems: [],
                proofs: [],
                topicAcceptanceDate: topicAcceptanceDate.value,
                thesisDefenceDate: thesisDefenceDate.value
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

            selectedLanguage.value = props.presetThesis?.languageId as number;
            uris.value = props.presetThesis?.uris as string[];
            numberOfPages.value = props.presetThesis?.numberOfPages;
            publicationYear.value = props.presetThesis?.documentDate;
            doi.value = props.presetThesis?.doi;
            topicAcceptanceDate.value = props.presetThesis?.topicAcceptanceDate as string;
            thesisDefenceDate.value = props.presetThesis?.thesisDefenceDate as string;

            titleRef.value?.forceRefreshModelValue(toMultilingualTextInput(title.value, languageTags.value));
            subtitleRef.value?.forceRefreshModelValue(toMultilingualTextInput(subtitle.value, languageTags.value));
            urisRef.value?.refreshModelValue(uris.value);

            selectedThesisType.value = {title: props.presetThesis?.thesisType ? getThesisTitleFromValueAutoLocale(props.presetThesis?.thesisType as ThesisType) as string : "", value: props.presetThesis?.thesisType ? props.presetThesis?.thesisType as ThesisType : undefined};

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
            researchAreasSelectable, selectedResearchArea,
            selectedLanguage, publicationTypes, selectedThesisType,
            languageList, titleRef, subtitleRef, refreshForm,
            externalOUName, externalOUNameRef, isInstitutionalLibrarian,
            topicAcceptanceDate, thesisDefenceDate, canAddAsNonReference
        };
    }
});
</script>
