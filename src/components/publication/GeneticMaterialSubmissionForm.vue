<template>
    <v-form v-model="isFormValid" class="flex flex-col gap-6" @submit.prevent>
        <form-section
            icon="mdi-file-document-outline"
            :title="$t('publicationDetailsLabel')"
        >
            <i-d-f-metadata-prepopulator
                :document-type="PublicationType.GENETIC_MATERIAL"
                @metadata-fetched="popuateMetadata"
            />
            <multilingual-text-input
                ref="titleRef"
                v-model="title"
                :rules="requiredFieldRules"
                :label="$t('titleLabel') + '*'" />
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
            <ui-input
                v-model="selectedGeneticMaterialType"
                control="select"
                :label="$t('geneticMaterialTypeLabel') + '*'"
                :items="geneticMaterialTypes"
                :rules="requiredSelectionRules"
                return-object
            />
            <ui-input
                v-model="geneticMaterialNumber"
                :label="$t('internalNumberLabel')"
                :placeholder="$t('internalNumberLabel')" />
        </form-section>

        <form-section
            icon="mdi-account-multiple-outline"
            :title="$t('authorsLabel')"
            :description="$t('contributionAccordionHint')"
        >
            <person-publication-contribution
                ref="contributionsRef"
                basic
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
                    :label="$t('subtitleLabel')" />
                <multilingual-text-input
                    ref="descriptionRef"
                    v-model="description"
                    is-area
                    :label="$t('abstractLabel')" />
                <multilingual-text-input
                    ref="keywordsRef"
                    v-model="keywords"
                    :label="$t('keywordsLabel')"
                    is-area />
                <uri-input ref="urisRef" v-model="uris" />
                <publisher-autocomplete-search
                    ref="publisherAutocompleteRef"
                    v-model="selectedPublisher"
                    allow-author-reprint />
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
                        :rules="workOpenAlexIdValidationRules" />
                    <ui-input
                        v-model="webOfScienceId"
                        label="Web of Science ID"
                        placeholder="Web of Science ID"
                        :rules="documentWebOfScienceIdValidationRules" />
                </div>
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
    
    <toast v-model="snackbar" :message="!error ? $t('savedMessage') : errorMessage" />
</template>

<script lang="ts">
import { defineComponent, nextTick } from 'vue';
import MultilingualTextInput from '../core/MultilingualTextInput.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import PublisherAutocompleteSearch from '../publisher/PublisherAutocompleteSearch.vue';
import UriInput from '../core/UriInput.vue';
import PersonPublicationContribution from './PersonPublicationContribution.vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { PublicationType, type PersonDocumentContribution, type GeneticMaterial, type GeneticMaterialType, type CommonFieldsData } from "@/models/PublicationModel";
import DocumentPublicationService from '@/services/DocumentPublicationService';
import type { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import type { ErrorResponse, FlexibleDate, PrepopulatedMetadata } from '@/models/Common';
import Toast from '../core/Toast.vue';
import { useLanguageTags } from '@/composables/useLanguageTags';
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import IDFMetadataPrepopulator from '../core/IDFMetadataPrepopulator.vue';
import PublicationDeduplicationTable from './PublicationDeduplicationTable.vue';
import { getGeneticMaterialTypesForGivenLocale } from '@/i18n/geneticMaterialType';
import DocumentCommonFields from './DocumentCommonFields.vue';
import FlexibleDatePicker from '../core/FlexibleDatePicker.vue';


import UiInput from '@/components/ui/input/Input.vue';
import FormSection from '@/components/ui/form-section/FormSection.vue';
import { UiButton } from '@/components/ui/button';

export default defineComponent({
    name: "SubmitGeneticMaterial",
    components: {MultilingualTextInput, UriInput, PersonPublicationContribution, PublisherAutocompleteSearch, Toast, IDFMetadataPrepopulator, PublicationDeduplicationTable, DocumentCommonFields, FlexibleDatePicker, UiInput, FormSection, UiButton},
    props: {
        inModal: {
            type: Boolean,
            default: false
        }
    },
    emits: ["create"],
    setup(_, {emit}) {
        const isFormValid = ref(false);
        const additionalFields = ref(false);

        const snackbar = ref(false);
        const error = ref(false);

        const i18n = useI18n();
        const errorMessage = ref(i18n.t("genericErrorMessage"));

        const router = useRouter();

        const titleRef = ref<typeof MultilingualTextInput>();
        const subtitleRef = ref<typeof MultilingualTextInput>();
        const descriptionRef = ref<typeof MultilingualTextInput>();
        const keywordsRef = ref<typeof MultilingualTextInput>();
        const contributionsRef = ref<typeof PersonPublicationContribution>();
        const urisRef = ref<typeof UriInput>();
        const publisherAutocompleteRef = ref<typeof PublisherAutocompleteSearch>();
        const deduplicationTableRef = ref<typeof PublicationDeduplicationTable>();

        const searchPlaceholder = {title: "", value: -1};
        const selectedPublisher = ref<{ title: string, value: number }>(searchPlaceholder);

        const title = ref<any[]>([]);
        const subtitle = ref([]);
        const description = ref([]);
        const keywords = ref<any[]>([]);
        const contributions = ref<PersonDocumentContribution[]>([]);
        const publicationDate = ref<FlexibleDate>();
        const doi = ref("");
        const openAlexId = ref("");
        const scopus = ref("");
        const webOfScienceId = ref("");
        const geneticMaterialNumber = ref("");
        const uris = ref<string[]>([]);

        const geneticMaterialTypes = getGeneticMaterialTypesForGivenLocale();
        const selectedGeneticMaterialType = ref<{title: string, value: GeneticMaterialType | null}>({ title: "", value: null });

        const commonFieldsRef = ref<typeof DocumentCommonFields>();
        const commonFieldsData = ref<CommonFieldsData>({});
        const presetCommonFieldsData = ref<CommonFieldsData | undefined>(undefined);

        const {
            requiredFieldRules, doiValidationRules,
            workOpenAlexIdValidationRules,
            documentWebOfScienceIdValidationRules,
            scopusIdValidationRules,
            requiredSelectionRules
        } = useValidationUtils();

        const submit = () => {
            submitGeneticMaterial(true);
        };

        const submitGeneticMaterial = (stayOnPage: boolean) => {
            const newGeneticMaterial: GeneticMaterial = {
                title: title.value,
                internalNumber: geneticMaterialNumber.value,
                description: description.value,
                keywords: keywords.value,
                subTitle: subtitle.value,
                uris: uris.value,
                contributions: contributions.value,
                documentDate: publicationDate.value,
                doi: doi.value,
                openAlexId: openAlexId.value,
                scopusId: scopus.value,
                webOfScienceId: webOfScienceId.value,
                geneticMaterialType: selectedGeneticMaterialType.value.value as GeneticMaterialType,
                publisherId: (!selectedPublisher.value || selectedPublisher.value.value < 0) ? undefined : selectedPublisher.value.value,
                authorReprint: selectedPublisher.value.value === -2,
                fileItems: [],
                proofs: [],
                ...commonFieldsData.value
            };

            DocumentPublicationService.createGeneticMaterial(
                newGeneticMaterial
            ).then((response) => {
                emit("create", response.data);

                if (stayOnPage) {
                    titleRef.value?.clearInput();
                    subtitleRef.value?.clearInput();
                    descriptionRef.value?.clearInput();
                    keywordsRef.value?.clearInput();
                    urisRef.value?.clearInput();
                    publisherAutocompleteRef.value?.clearInput();
                    publicationDate.value = undefined;
                    doi.value = "";
                    openAlexId.value = "";
                    webOfScienceId.value = "";
                    geneticMaterialNumber.value = "";
                    scopus.value = ""
                    contributionsRef.value?.clearInput();
                    deduplicationTableRef.value?.resetTable();
                    selectedGeneticMaterialType.value = { title: "", value: null };
                    commonFieldsRef.value?.clearInputs();
                    commonFieldsData.value = {};

                    error.value = false;
                    snackbar.value = true;
                } else {
                    router.push({ name: "geneticMaterialLandingPage", params: {id: response.data.id} });
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

        const { languageTags } = useLanguageTags();
        const popuateMetadata = async (metadata: PrepopulatedMetadata) => {
            if (title.value.length === 0) {
                title.value = metadata.title;
                titleRef.value?.forceRefreshModelValue(toMultilingualTextInput(title.value, languageTags.value));
            }

            geneticMaterialNumber.value = geneticMaterialNumber.value ? geneticMaterialNumber.value : metadata.issue;
            uris.value.push(metadata.url);
            doi.value = doi.value ? doi.value : metadata.doi;

            if (metadata.year > 0) {
                publicationDate.value = { year: metadata.year };
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
            isFormValid, scopusIdValidationRules,
            additionalFields, snackbar, error,
            title, titleRef, subtitle, subtitleRef,
            publicationDate, doi, PublicationType,
            publisherAutocompleteRef, popuateMetadata,
            selectedPublisher, geneticMaterialNumber, openAlexId,
            description, descriptionRef, doiValidationRules,
            keywords, keywordsRef, uris, urisRef,
            contributions, contributionsRef, errorMessage,
            requiredFieldRules, submitGeneticMaterial, scopus,
            workOpenAlexIdValidationRules, webOfScienceId,
            documentWebOfScienceIdValidationRules, submit,
            deduplicationTableRef, selectedGeneticMaterialType,
            geneticMaterialTypes, requiredSelectionRules,
            commonFieldsRef, commonFieldsData,
            presetCommonFieldsData
        };
    }
});
</script>
