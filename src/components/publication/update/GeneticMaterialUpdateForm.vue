<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="titleRef" v-model="title" 
                    :rules="requiredFieldRules" 
                    :label="$t('titleLabel') + '*'"
                    :initial-value="toMultilingualTextInput(presetGeneticMaterial?.title, languageTags)"
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="subtitleRef"
                    v-model="subtitle"
                    :label="$t('subtitleLabel')"
                    :initial-value="toMultilingualTextInput(presetGeneticMaterial?.subTitle, languageTags)"
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="10">
                <flexible-date-picker
                    v-model="publicationDate"
                    :label="$t('yearOfPublicationLabel') + '*'"
                    required
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="10">
                <v-text-field v-model="doi" label="DOI" placeholder="DOI" :rules="doiValidationRules" />
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="10">
                <v-select
                    v-model="selectedGeneticMaterialType"
                    :label="$t('geneticMaterialTypeLabel') + '*'"
                    :items="geneticMaterialTypes"
                    :rules="requiredSelectionRules"
                    return-object
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="10">
                <v-text-field
                    v-model="geneticMaterialNumber"
                    :label="$t('internalNumberLabel')"
                    :placeholder="$t('internalNumberLabel')"
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <uri-input ref="urisRef" v-model="uris" />
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="10">
                <publisher-autocomplete-search
                    ref="publisherAutocompleteRef"
                    v-model="selectedPublisher"
                    allow-author-reprint
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="3">
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
                    :rules="workOpenAlexIdValidationRules"
                />
            </v-col>
            <v-col cols="3">
                <v-text-field
                    v-model="webOfScienceId"
                    label="Web of Science ID"
                    placeholder="Web of Science ID"
                    :rules="documentWebOfScienceIdValidationRules"
                />
            </v-col>
        </v-row>

        <document-common-fields
            ref="commonFieldsRef"
            v-model="commonFieldsData"
            :preset-data="presetCommonFieldsData"
        />

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
import type { MultilingualContent } from '@/models/Common';
import { onMounted } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import type { CommonFieldsData, GeneticMaterial, GeneticMaterialType } from '@/models/PublicationModel';
import UriInput from '@/components/core/UriInput.vue';
import PublisherAutocompleteSearch from '@/components/publisher/PublisherAutocompleteSearch.vue';
import PublisherService from '@/services/PublisherService';
import type { Publisher } from '@/models/PublisherModel';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import { watch } from 'vue';
import { useLanguageTags } from '@/composables/useLanguageTags';
import Toast from '@/components/core/Toast.vue';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import { useIdentifierCheck } from '@/composables/useIdentifierCheck';
import { getGeneticMaterialTypesForGivenLocale, getGeneticMaterialTypeTitleFromValueAutoLocale } from '@/i18n/geneticMaterialType';
import DocumentCommonFields from '../DocumentCommonFields.vue';
import { getCommonIdentifiers, updateDocumentCommonFields } from '@/utils/CommonDocumentFieldsUtil';
import FlexibleDatePicker from '@/components/core/FlexibleDatePicker.vue';


export default defineComponent({
    name: "GeneticMaterialUpdateForm",
    components: { MultilingualTextInput, UriInput, PublisherAutocompleteSearch, Toast, DocumentCommonFields, FlexibleDatePicker },
    props: {
        presetGeneticMaterial: {
            type: Object as PropType<GeneticMaterial | undefined>,
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

        const publisher = ref<Publisher>();

        const { checkIdentifiers, message, snackbar } = useIdentifierCheck();

        const { languageTags } = useLanguageTags();

        onMounted(() => {
            updatePresetCommonFields();
            fetchDetails();
        });

        const fetchDetails = () => {
            if(props.presetGeneticMaterial?.publisherId) {
                PublisherService.readPublisher(props.presetGeneticMaterial.publisherId).then((response) => {
                    publisher.value = response.data;
                    selectedPublisher.value = {
                        title: returnCurrentLocaleContent(publisher.value.name) as string,
                        value: publisher.value.id as number
                    };
                });
            } else if (props.presetGeneticMaterial?.authorReprint) {
                selectedPublisher.value = {title: "", value: -2};
            }
        };

        watch(() => props.presetGeneticMaterial, () => {
            if (props.presetGeneticMaterial) {
                refreshForm();
            }
        });

        const titleRef = ref<typeof MultilingualTextInput>();
        const subtitleRef = ref<typeof MultilingualTextInput>();
        const urisRef = ref<typeof UriInput>();

        const searchPlaceholder = {
            title: returnCurrentLocaleContent(publisher.value?.name) as string,
            value: publisher.value?.id as number
        };
        const selectedPublisher = ref<{ title: string, value: number }>(searchPlaceholder);

        const title = ref<any>([]);
        const subtitle = ref<any>([]);
        const publicationDate = ref(props.presetGeneticMaterial?.documentDate);
        const doi = ref(props.presetGeneticMaterial?.doi);
        const openAlexId = ref(props.presetGeneticMaterial?.openAlexId);
        const webOfScienceId = ref(props.presetGeneticMaterial?.webOfScienceId);
        const geneticMaterialNumber = ref(props.presetGeneticMaterial?.internalNumber);
        const uris = ref<string[]>(props.presetGeneticMaterial?.uris as string[]);
        const scopus = ref(props.presetGeneticMaterial?.scopusId);

        const geneticMaterialTypes = getGeneticMaterialTypesForGivenLocale();
        const selectedGeneticMaterialType = ref<{title: string, value: GeneticMaterialType | null}>(
            { 
                title: getGeneticMaterialTypeTitleFromValueAutoLocale(props.presetGeneticMaterial?.geneticMaterialType as GeneticMaterialType) as string,
                value: props.presetGeneticMaterial?.geneticMaterialType as GeneticMaterialType 
            }
        );

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

        const submit = async () => {
            if (props.inModal) {
                const { duplicateFound } = await checkIdentifiers(
                    [
                        ...getCommonIdentifiers(
                            doi.value,
                            scopus.value,
                            openAlexId.value,
                            webOfScienceId.value,
                            commonFieldsData.value.handleId,
                            commonFieldsData.value.arxivId,
                            commonFieldsData.value.pubmedId,
                            commonFieldsData.value.ssrnId,
                            commonFieldsData.value.nationalId
                        )
                    ],
                    props.presetGeneticMaterial?.id as number,
                    (id, docId) => DocumentPublicationService.checkIdentifierUsage(id, docId)
                );

                if (duplicateFound) {
                    return;
                }
            }

            const updatedGeneticMaterial: GeneticMaterial = {
                title: title.value as MultilingualContent[],
                internalNumber: geneticMaterialNumber.value as string,
                description: props.presetGeneticMaterial?.description as MultilingualContent[],
                keywords: props.presetGeneticMaterial?.keywords as MultilingualContent[],
                subTitle: subtitle.value as MultilingualContent[],
                uris: uris.value,
                contributions: props.presetGeneticMaterial?.contributions,
                documentDate: publicationDate.value,
                doi: doi.value,
                scopusId: scopus.value,
                openAlexId: openAlexId.value,
                webOfScienceId: webOfScienceId.value,
                publisherId: (!selectedPublisher.value || selectedPublisher.value.value < 0) ? undefined : selectedPublisher.value.value,
                authorReprint: selectedPublisher.value?.value === -2,
                geneticMaterialType: selectedGeneticMaterialType.value.value as GeneticMaterialType,
                fileItems: [],
                proofs: [],
                ...commonFieldsData.value
            };

            emit("update", updatedGeneticMaterial);
        };

        const updatePresetCommonFields = () => {
            updateDocumentCommonFields(props.presetGeneticMaterial, presetCommonFieldsData);
        };

        const refreshForm = () => {
            titleRef.value?.clearInput();
            title.value = props.presetGeneticMaterial?.title as MultilingualContent[];

            subtitleRef.value?.clearInput();
            subtitle.value = props.presetGeneticMaterial?.subTitle as MultilingualContent[];

            uris.value = props.presetGeneticMaterial?.uris as string[];
            geneticMaterialNumber.value = props.presetGeneticMaterial?.internalNumber;
            publicationDate.value = props.presetGeneticMaterial?.documentDate;
            doi.value = props.presetGeneticMaterial?.doi;
            openAlexId.value = props.presetGeneticMaterial?.openAlexId;
            webOfScienceId.value = props.presetGeneticMaterial?.webOfScienceId;
            scopus.value = props.presetGeneticMaterial?.scopusId;

            updateDocumentCommonFields(props.presetGeneticMaterial, presetCommonFieldsData);

            selectedGeneticMaterialType.value =
                { 
                    title: getGeneticMaterialTypeTitleFromValueAutoLocale(props.presetGeneticMaterial?.geneticMaterialType as GeneticMaterialType) as string,
                    value: props.presetGeneticMaterial?.geneticMaterialType as GeneticMaterialType 
                };

            titleRef.value?.forceRefreshModelValue(toMultilingualTextInput(title.value, languageTags.value));
            subtitleRef.value?.forceRefreshModelValue(toMultilingualTextInput(subtitle.value, languageTags.value));
            urisRef.value?.refreshModelValue(uris.value);

            if (commonFieldsRef.value && presetCommonFieldsData.value) {
                commonFieldsRef.value.refreshForm(presetCommonFieldsData.value);
            }

            fetchDetails();
        };

        return {
            isFormValid, doi, snackbar, message,
            title, subtitle, publicationDate,
            selectedPublisher, geneticMaterialNumber,
            uris, requiredFieldRules, titleRef,
            submit, toMultilingualTextInput,
            languageTags, doiValidationRules,
            refreshForm, urisRef, subtitleRef,
            openAlexId, workOpenAlexIdValidationRules,
            webOfScienceId, documentWebOfScienceIdValidationRules,
            scopus, scopusIdValidationRules, geneticMaterialTypes,
            selectedGeneticMaterialType, requiredSelectionRules,
            commonFieldsRef, commonFieldsData, presetCommonFieldsData
        };
    }
});
</script>
