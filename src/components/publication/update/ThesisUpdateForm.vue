<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col v-if="!enterExternalOU" cols="11">
                <organisation-unit-autocomplete-search ref="ouAutocompleteRef" v-model:model-value="selectedOrganisationUnit" required></organisation-unit-autocomplete-search>
            </v-col>
            <v-col v-else>
                <multilingual-text-input
                    ref="externalOUNameRef" v-model="externalOUName" :rules="requiredFieldRules" :label="$t('externalOUNameLabel') + '*'"
                    :initial-value="toMultilingualTextInput(presetThesis?.externalOrganisationUnitName, languageTags)"></multilingual-text-input>
            </v-col>
        </v-row>
        <v-row>
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
                <v-text-field v-model="publicationYear" type="number" :label="$t('yearOfPublicationLabel')" :placeholder="$t('yearOfPublicationLabel')"></v-text-field>
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
                    v-model="selectedLanguages"
                    :label="$t('languageLabel')"
                    :items="languageList"
                    multiple
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
import type { LanguageTagResponse, MultilingualContent } from '@/models/Common';
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
import { useI18n } from 'vue-i18n';
import DocumentPublicationService from '@/services/DocumentPublicationService';


export default defineComponent({
    name: "ThesisUpdateForm",
    components: {MultilingualTextInput, UriInput, PublisherAutocompleteSearch, OrganisationUnitAutocompleteSearch, Toast},
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

        const snackbar = ref(false);
        const message = ref("");
        const i18n = useI18n();

        const languageTags = ref<LanguageTagResponse[]>([]);
        const languageList = ref<{title: string, value: number}[]>([]);
        const selectedLanguages = ref<number[]>(props.presetThesis?.languageTagIds as number[]);

        onMounted(() => {
            LanguageService.getAllLanguageTags().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                languageTags.value = response.data;

                response.data.forEach((languageTag: LanguageTagResponse) => {
                    languageList.value.push({title: `${languageTag.display} (${languageTag.languageCode})`, value: languageTag.id});
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

        const { requiredFieldRules, requiredSelectionRules, doiValidationRules, scopusIdValidationRules } = useValidationUtils();

        const publicationTypes = computed(() => getThesisTypesForGivenLocale());
        const selectedThesisType = ref<{ title: string, value: ThesisType | undefined }>({title: getThesisTitleFromValueAutoLocale(props.presetThesis?.thesisType as ThesisType) as string, value: props.presetThesis?.thesisType as ThesisType});

        const submit = async () => {
            if (props.inModal) {
                const documentId = props.presetThesis?.id as number;
                const identifiers = [
                    { value: doi.value, error: "doiExistsError" }
                ].filter(id => id.value);

                const results = await Promise.all(
                    identifiers.map(id => DocumentPublicationService.checkIdentifierUsage(id.value as string, documentId))
                );

                const firstDuplicate = identifiers.find((_, index) => results[index].data);
                if (firstDuplicate) {
                    message.value = i18n.t(firstDuplicate.error);
                    snackbar.value = true;
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
                languageTagIds: selectedLanguages.value,
                fileItems: [],
                proofs: []
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

            selectedLanguages.value = props.presetThesis?.languageTagIds as number[];
            uris.value = props.presetThesis?.uris as string[];
            numberOfPages.value = props.presetThesis?.numberOfPages;
            publicationYear.value = props.presetThesis?.documentDate;
            doi.value = props.presetThesis?.doi;

            titleRef.value?.forceRefreshModelValue(toMultilingualTextInput(title.value, languageTags.value));
            subtitleRef.value?.forceRefreshModelValue(toMultilingualTextInput(subtitle.value, languageTags.value));
            urisRef.value?.refreshModelValue(uris.value);

            selectedThesisType.value = {title: props.presetThesis?.thesisType ? getThesisTitleFromValueAutoLocale(props.presetThesis?.thesisType as ThesisType) as string : "", value: props.presetThesis?.thesisType ? props.presetThesis?.thesisType as ThesisType : undefined};

            fetchDetails();
        };

        return {
            isFormValid, title, subtitle, urisRef,
            publicationYear, doi, message, snackbar,
            numberOfPages, selectedPublisher,
            uris, requiredFieldRules, requiredSelectionRules,
            submit, toMultilingualTextInput,
            languageTags, doiValidationRules, enterExternalOU,
            scopusIdValidationRules, selectedOrganisationUnit,
            researchAreasSelectable, selectedResearchArea,
            selectedLanguages, publicationTypes, selectedThesisType,
            languageList, titleRef, subtitleRef, refreshForm,
            externalOUName, externalOUNameRef
        };
    }
});
</script>
