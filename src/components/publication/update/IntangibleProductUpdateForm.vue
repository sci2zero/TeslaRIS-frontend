<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="titleRef" v-model="title"
                    :rules="requiredFieldRules"
                    :label="$t('titleLabel') + '*'"
                    :initial-value="toMultilingualTextInput(presetIntangibleProduct?.title, languageTags)"
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="subtitleRef"
                    v-model="subtitle"
                    :label="$t('subtitleLabel')"
                    :initial-value="toMultilingualTextInput(presetIntangibleProduct?.subTitle, languageTags)"
                />
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
                <v-text-field v-model="doi" label="DOI" placeholder="DOI" :rules="doiValidationRules"></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="10">
                <v-select
                    v-model="selectedIntangibleProductType"
                    :label="$t('intangibleProductTypeLabel') + '*'"
                    :items="intangibleProductTypes"
                    :rules="requiredSelectionRules"
                    return-object
                ></v-select>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="10">
                <v-text-field v-model="intangibleProductNumber" :label="$t('internalNumberLabel')" :placeholder="$t('internalNumberLabel')"></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <uri-input ref="urisRef" v-model="uris"></uri-input>
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
import type { IntangibleProduct, IntangibleProductType } from '@/models/PublicationModel';
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
import { type ResearchArea } from '@/models/OrganisationUnitModel';
import { getIntangibleProductTypesForGivenLocale, getIntangibleProductTypeTitleFromValueAutoLocale } from '@/i18n/intangibleProductType';
import ResearchAreasSelection from '@/components/core/ResearchAreasSelection.vue';


export default defineComponent({
    name: "IntangibleProductUpdateForm",
    components: { MultilingualTextInput, UriInput, PublisherAutocompleteSearch, Toast, ResearchAreasSelection },
    props: {
        presetIntangibleProduct: {
            type: Object as PropType<IntangibleProduct | undefined>,
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
            if(props.presetIntangibleProduct?.publisherId) {
                PublisherService.readPublisher(props.presetIntangibleProduct.publisherId).then((response) => {
                    publisher.value = response.data;
                    selectedPublisher.value = {title: returnCurrentLocaleContent(publisher.value.name) as string, value: publisher.value.id as number};
                });
            } else if (props.presetIntangibleProduct?.authorReprint) {
                selectedPublisher.value = {title: "", value: -2};
            }
        };

        watch(() => props.presetIntangibleProduct, () => {
            if (props.presetIntangibleProduct) {
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
        const publicationYear = ref(props.presetIntangibleProduct?.documentDate);
        const doi = ref(props.presetIntangibleProduct?.doi);
        const openAlexId = ref(props.presetIntangibleProduct?.openAlexId);
        const webOfScienceId = ref(props.presetIntangibleProduct?.webOfScienceId);
        const intangibleProductNumber = ref(props.presetIntangibleProduct?.internalNumber);
        const uris = ref<string[]>(props.presetIntangibleProduct?.uris as string[]);
        const scopus = ref(props.presetIntangibleProduct?.scopusId);
        const productUsers = ref<any>([]);

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
                    props.presetIntangibleProduct?.id as number,
                    (id, docId) => DocumentPublicationService.checkIdentifierUsage(id, docId)
                );

                if (duplicateFound) {
                    return;
                }
            }

            const updatedIntangibleProduct: IntangibleProduct = {
                title: title.value as MultilingualContent[],
                internalNumber: intangibleProductNumber.value as string,
                description: props.presetIntangibleProduct?.description as MultilingualContent[],
                keywords: props.presetIntangibleProduct?.keywords as MultilingualContent[],
                subTitle: subtitle.value as MultilingualContent[],
                uris: uris.value,
                contributions: props.presetIntangibleProduct?.contributions,
                documentDate: publicationYear.value,
                doi: doi.value,
                scopusId: scopus.value,
                openAlexId: openAlexId.value,
                webOfScienceId: webOfScienceId.value,
                publisherId: (!selectedPublisher.value || selectedPublisher.value.value < 0) ? undefined : selectedPublisher.value.value,
                authorReprint: selectedPublisher.value?.value === -2,
                researchAreasId: researchAreaIds.value,
                productUsers: productUsers.value,
                intangibleProductType: selectedIntangibleProductType.value.value,
                fileItems: [],
                proofs: []
            };

            emit("update", updatedIntangibleProduct);
        };

        const refreshForm = () => {
            titleRef.value?.clearInput();
            title.value = props.presetIntangibleProduct?.title as MultilingualContent[];

            subtitleRef.value?.clearInput();
            subtitle.value = props.presetIntangibleProduct?.subTitle as MultilingualContent[];

            uris.value = props.presetIntangibleProduct?.uris as string[];
            intangibleProductNumber.value = props.presetIntangibleProduct?.internalNumber;
            publicationYear.value = props.presetIntangibleProduct?.documentDate;
            doi.value = props.presetIntangibleProduct?.doi;
            openAlexId.value = props.presetIntangibleProduct?.openAlexId;
            webOfScienceId.value = props.presetIntangibleProduct?.webOfScienceId;
            scopus.value = props.presetIntangibleProduct?.scopusId;

            selectedIntangibleProductType.value = 
                { 
                    title: getIntangibleProductTypeTitleFromValueAutoLocale(props.presetIntangibleProduct?.intangibleProductType as IntangibleProductType) as string, 
                    value: props.presetIntangibleProduct?.intangibleProductType as IntangibleProductType 
                };

            presetResearchAreas.value = props.presetIntangibleProduct?.researchAreas as ResearchArea[];
            researchAreaIds.value = props.presetIntangibleProduct?.researchAreasId as number[];
            researchAreasSelectionRef.value?.resetForm();

            titleRef.value?.forceRefreshModelValue(toMultilingualTextInput(title.value, languageTags.value));
            subtitleRef.value?.forceRefreshModelValue(toMultilingualTextInput(subtitle.value, languageTags.value));
            usersRef.value?.forceRefreshModelValue(toMultilingualTextInput(productUsers.value, languageTags.value));
            urisRef.value?.refreshModelValue(uris.value);

            fetchDetails();
        };

        const presetResearchAreas = ref<ResearchArea[]>(props.presetIntangibleProduct?.researchAreas as ResearchArea[]);
        const researchAreaIds = ref<number[]>(props.presetIntangibleProduct?.researchAreas?.map(researchArea => researchArea.id) as number[]);

        const intangibleProductTypes = getIntangibleProductTypesForGivenLocale();
        const selectedIntangibleProductType = ref<{title: string, value: IntangibleProductType}>(
            { 
                title: getIntangibleProductTypeTitleFromValueAutoLocale(props.presetIntangibleProduct?.intangibleProductType as IntangibleProductType) as string, 
                value: props.presetIntangibleProduct?.intangibleProductType as IntangibleProductType 
            }
        );

        const saveResearchAreas = (newResearchAreaIds: number[]) => {
            researchAreaIds.value = newResearchAreaIds;
        };

        return {
            isFormValid, doi, snackbar, message,
            title, subtitle, publicationYear,
            selectedPublisher, intangibleProductNumber,
            uris, requiredFieldRules, titleRef,
            submit, toMultilingualTextInput,
            languageTags, doiValidationRules,
            refreshForm, urisRef, subtitleRef,
            openAlexId, workOpenAlexIdValidationRules,
            webOfScienceId, documentWebOfScienceIdValidationRules,
            scopus, scopusIdValidationRules, presetResearchAreas,
            researchAreaIds, intangibleProductTypes, productUsers,
            selectedIntangibleProductType, saveResearchAreas,
            requiredSelectionRules
        };
    }
});
</script>
