<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="titleRef" v-model="title" :rules="requiredFieldRules" :label="$t('titleLabel') + '*'"
                    :initial-value="toMultilingualTextInput(presetMaterialProduct?.title, languageTags)">
                </multilingual-text-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="subtitleRef"
                    v-model="subtitle"
                    :label="$t('subtitleLabel')"
                    :initial-value="toMultilingualTextInput(presetMaterialProduct?.subTitle, languageTags)">
                </multilingual-text-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="10">
                <v-text-field
                    v-model="publicationYear"
                    type="number"
                    :label="$t('yearOfPublicationLabel') + '*'"
                    :placeholder="$t('yearOfPublicationLabel') + '*'"
                    :rules="requiredFieldRules">
                </v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="10">
                <v-text-field 
                    v-model="doi"
                    label="DOI"
                    placeholder="DOI"
                    :rules="doiValidationRules">
                </v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="10">
                <v-select
                    v-model="selectedMaterialProductType"
                    :label="$t('materialProductTypeLabel') + '*'"
                    :items="materialProductTypes"
                    :rules="requiredSelectionRules"
                    return-object
                ></v-select>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="10">
                <v-text-field
                    v-model="materialProductNumber"
                    :label="$t('internalNumberLabel')"
                    :placeholder="$t('internalNumberLabel')">
                </v-text-field>
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
                    allow-author-reprint>
                </publisher-autocomplete-search>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="3">
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
            <v-col cols="3">
                <v-text-field
                    v-model="webOfScienceId"
                    label="Web of Science ID"
                    placeholder="Web of Science ID"
                    :rules="documentWebOfScienceIdValidationRules">
                </v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="10">
                <v-text-field
                    v-model="numberProduced"
                    type="number"
                    :label="$t('numberProducedLabel')"
                    :placeholder="$t('numberProducedLabel')"
                ></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="10">
                <multilingual-text-input
                    ref="usersRef"
                    v-model="productUsers"
                    :label="$t('productUsersLabel')">
                </multilingual-text-input>
            </v-col>
        </v-row>
        <h2
            v-if="!inComparator"
            class="mt-5!">
            {{ $t("researchAreasLabel") }}
        </h2>
        <v-row v-if="!inComparator">
            <v-col cols="10">
                <research-areas-selection
                    ref="researchAreasSelectionRef"
                    :research-areas-hierarchy="presetResearchAreas"
                    submit-on-click
                    @update="saveResearchAreas"
                />
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
import type { MultilingualContent } from '@/models/Common';
import { onMounted } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import type { MaterialProduct, MaterialProductType } from '@/models/PublicationModel';
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
import { getMaterialProductTypesForGivenLocale, getMaterialProductTypeTitleFromValueAutoLocale } from '@/i18n/materialProductType';
import { type ResearchArea } from '@/models/OrganisationUnitModel';
import ResearchAreasSelection from '@/components/core/ResearchAreasSelection.vue';


export default defineComponent({
    name: "MaterialProductUpdateForm",
    components: { MultilingualTextInput, UriInput, PublisherAutocompleteSearch, Toast, ResearchAreasSelection },
    props: {
        presetMaterialProduct: {
            type: Object as PropType<MaterialProduct | undefined>,
            required: true
        },
        inModal: {
            type: Boolean,
            default: true
        },
        inComparator: {
            type: Boolean,
            default: false
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const publisher = ref<Publisher>();

        const { checkIdentifiers, message, snackbar } = useIdentifierCheck();

        const { languageTags } = useLanguageTags();

        onMounted(() => {
            fetchDetails();
        });

        const fetchDetails = () => {
            if(props.presetMaterialProduct?.publisherId) {
                PublisherService.readPublisher(props.presetMaterialProduct.publisherId).then((response) => {
                    publisher.value = response.data;
                    selectedPublisher.value = {
                        title: returnCurrentLocaleContent(publisher.value.name) as string,
                        value: publisher.value.id as number
                    };
                });
            } else if (props.presetMaterialProduct?.authorReprint) {
                selectedPublisher.value = {title: "", value: -2};
            }
        };

        watch(() => props.presetMaterialProduct, () => {
            if (props.presetMaterialProduct) {
                refreshForm();
            }
        });

        const titleRef = ref<typeof MultilingualTextInput>();
        const subtitleRef = ref<typeof MultilingualTextInput>();
        const usersRef = ref<typeof MultilingualTextInput>();
        const urisRef = ref<typeof UriInput>();
        const researchAreasSelectionRef = ref<typeof ResearchAreasSelection>();

        const searchPlaceholder = {title: returnCurrentLocaleContent(publisher.value?.name) as string, value: publisher.value?.id as number};
        const selectedPublisher = ref<{ title: string, value: number }>(searchPlaceholder);

        const title = ref<any>([]);
        const subtitle = ref<any>([]);
        const productUsers = ref<any>([]);
        const publicationYear = ref(props.presetMaterialProduct?.documentDate);
        const doi = ref(props.presetMaterialProduct?.doi);
        const openAlexId = ref(props.presetMaterialProduct?.openAlexId);
        const webOfScienceId = ref(props.presetMaterialProduct?.webOfScienceId);
        const materialProductNumber = ref(props.presetMaterialProduct?.internalNumber);
        const uris = ref<string[]>(props.presetMaterialProduct?.uris as string[]);
        const scopus = ref(props.presetMaterialProduct?.scopusId);
        const numberProduced = ref(props.presetMaterialProduct?.numberProduced);

        const presetResearchAreas = ref<ResearchArea[]>(props.presetMaterialProduct?.researchAreas as ResearchArea[]);
        const researchAreaIds = ref<number[]>(props.presetMaterialProduct?.researchAreas?.map(researchArea => researchArea.id) as number[]);

        const materialProductTypes = getMaterialProductTypesForGivenLocale();
        const selectedMaterialProductType = ref<{title: string, value: MaterialProductType}>(
            { 
                title: getMaterialProductTypeTitleFromValueAutoLocale(props.presetMaterialProduct?.materialProductType as MaterialProductType) as string, 
                value: props.presetMaterialProduct?.materialProductType as MaterialProductType 
            }
        );

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
                        { value: doi.value as string, error: "doiExistsError" },
                        { value: openAlexId.value as string, error: "openAlexIdExistsError"},
                        { value: webOfScienceId.value as string, error: "webOfScienceIdExistsError"},
                        { value: scopus.value as string, error: "scopusIdExistsError"}
                    ],
                    props.presetMaterialProduct?.id as number,
                    (id, docId) => DocumentPublicationService.checkIdentifierUsage(id, docId)
                );

                if (duplicateFound) {
                    return;
                }
            }

            const updatedMaterialProduct: MaterialProduct = {
                title: title.value as MultilingualContent[],
                materialProductType: selectedMaterialProductType.value.value,
                internalNumber: materialProductNumber.value as string,
                description: props.presetMaterialProduct?.description as MultilingualContent[],
                keywords: props.presetMaterialProduct?.keywords as MultilingualContent[],
                subTitle: subtitle.value as MultilingualContent[],
                uris: uris.value,
                contributions: props.presetMaterialProduct?.contributions,
                documentDate: publicationYear.value,
                doi: doi.value,
                scopusId: scopus.value,
                openAlexId: openAlexId.value,
                webOfScienceId: webOfScienceId.value,
                numberProduced: numberProduced.value as number,
                researchAreasId: researchAreaIds.value,
                productUsers: productUsers.value,
                publisherId: (!selectedPublisher.value || selectedPublisher.value.value < 0) ? undefined : selectedPublisher.value.value,
                authorReprint: selectedPublisher.value?.value === -2,
                fileItems: [],
                proofs: []
            };

            emit("update", updatedMaterialProduct);
        };

        const refreshForm = () => {
            titleRef.value?.clearInput();
            title.value = props.presetMaterialProduct?.title as MultilingualContent[];

            subtitleRef.value?.clearInput();
            subtitle.value = props.presetMaterialProduct?.subTitle as MultilingualContent[];

            uris.value = props.presetMaterialProduct?.uris as string[];
            materialProductNumber.value = props.presetMaterialProduct?.internalNumber;
            publicationYear.value = props.presetMaterialProduct?.documentDate;
            doi.value = props.presetMaterialProduct?.doi;
            openAlexId.value = props.presetMaterialProduct?.openAlexId;
            webOfScienceId.value = props.presetMaterialProduct?.webOfScienceId;
            scopus.value = props.presetMaterialProduct?.scopusId;
            numberProduced.value = props.presetMaterialProduct?.numberProduced;

            selectedMaterialProductType.value = 
                { 
                    title: getMaterialProductTypeTitleFromValueAutoLocale(props.presetMaterialProduct?.materialProductType as MaterialProductType) as string, 
                    value: props.presetMaterialProduct?.materialProductType as MaterialProductType 
                };

            presetResearchAreas.value = props.presetMaterialProduct?.researchAreas as ResearchArea[];
            researchAreaIds.value = props.presetMaterialProduct?.researchAreasId as number[];
            researchAreasSelectionRef.value?.resetForm();

            titleRef.value?.forceRefreshModelValue(toMultilingualTextInput(title.value, languageTags.value));
            subtitleRef.value?.forceRefreshModelValue(toMultilingualTextInput(subtitle.value, languageTags.value));
            usersRef.value?.forceRefreshModelValue(toMultilingualTextInput(productUsers.value, languageTags.value));
            urisRef.value?.refreshModelValue(uris.value);

            fetchDetails();
        };

        const saveResearchAreas = (newResearchAreaIds: number[]) => {
            researchAreaIds.value = newResearchAreaIds;
        };

        return {
            isFormValid, doi, snackbar, message,
            title, subtitle, publicationYear,
            selectedPublisher, materialProductNumber,
            uris, requiredFieldRules, titleRef, usersRef,
            submit, toMultilingualTextInput, requiredSelectionRules,
            languageTags, doiValidationRules, saveResearchAreas,
            refreshForm, urisRef, subtitleRef, productUsers,
            openAlexId, workOpenAlexIdValidationRules,
            webOfScienceId, documentWebOfScienceIdValidationRules,
            scopus, scopusIdValidationRules, numberProduced,
            materialProductTypes, selectedMaterialProductType,
            researchAreasSelectionRef, presetResearchAreas
        };
    }
});
</script>
