<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col :cols="inModal ? 12 : 10">
                <v-row>
                    <v-col cols="11">
                        <i-d-f-metadata-prepopulator
                            :document-type="PublicationType.MATERIAL_PRODUCT"
                            @metadata-fetched="popuateMetadata"
                        />
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
                        <v-col cols="10">
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
                        <v-select
                            v-model="selectedMaterialProductType"
                            :label="$t('materialProductTypeLabel') + '*'"
                            :items="materialProductTypes"
                            :rules="requiredSelectionRules"
                            :disabled="inModal"
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
                        <h2>{{ $t("authorsLabel") }}</h2>
                        <person-publication-contribution ref="contributionsRef" basic @set-input="contributions = $event" />
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
                                ref="descriptionRef"
                                v-model="description"
                                is-area
                                :label="$t('abstractLabel')">
                            </multilingual-text-input>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <multilingual-text-input
                                ref="keywordsRef"
                                v-model="keywords"
                                :label="$t('keywordsLabel')"
                                is-area>
                            </multilingual-text-input>
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
                    <h2 class="mt-5!">
                        {{ $t("researchAreasLabel") }}
                    </h2>
                    <v-row>
                        <v-col cols="10">
                            <research-areas-selection
                                ref="researchAreasSelectionRef"
                                :research-areas-hierarchy="[]"
                                submit-on-click
                                @update="saveResearchAreas"
                            />
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
import { defineComponent, nextTick } from 'vue';
import MultilingualTextInput from '../core/MultilingualTextInput.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import PublisherAutocompleteSearch from '../publisher/PublisherAutocompleteSearch.vue';
import UriInput from '../core/UriInput.vue';
import PersonPublicationContribution from './PersonPublicationContribution.vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { PublicationType, type PersonDocumentContribution, type MaterialProduct, MaterialProductType } from "@/models/PublicationModel";
import DocumentPublicationService from '@/services/DocumentPublicationService';
import type { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import type { ErrorResponse, PrepopulatedMetadata } from '@/models/Common';
import Toast from '../core/Toast.vue';
import { useLanguageTags } from '@/composables/useLanguageTags';
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import IDFMetadataPrepopulator from '../core/IDFMetadataPrepopulator.vue';
import PublicationDeduplicationTable from './PublicationDeduplicationTable.vue';
import { getMaterialProductTypesForGivenLocale } from '@/i18n/materialProductType';
import ResearchAreasSelection from '../core/ResearchAreasSelection.vue';


export default defineComponent({
    name: "SubmitMaterialProduct",
    components: { MultilingualTextInput, UriInput, PersonPublicationContribution, PublisherAutocompleteSearch, Toast, IDFMetadataPrepopulator, PublicationDeduplicationTable, ResearchAreasSelection },
    props: {
        inModal: {
            type: Boolean,
            default: false
        }
    },
    setup() {
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
        const usersRef = ref<typeof MultilingualTextInput>();
        const researchAreasSelectionRef = ref<typeof ResearchAreasSelection>();

        const searchPlaceholder = {title: "", value: -1};
        const selectedPublisher = ref<{ title: string, value: number }>(searchPlaceholder);

        const title = ref<any[]>([]);
        const subtitle = ref([]);
        const description = ref([]);
        const keywords = ref<any[]>([]);
        const productUsers = ref<any>([]);
        const contributions = ref<PersonDocumentContribution[]>([]);
        const publicationYear = ref("");
        const doi = ref("");
        const openAlexId = ref("");
        const scopus = ref("");
        const webOfScienceId = ref("");
        const materialProductNumber = ref("");
        const uris = ref<string[]>([]);
        const numberProduced = ref();
        const researchAreaIds = ref<number[]>([]);

        const materialProductTypes = getMaterialProductTypesForGivenLocale();
        const selectedMaterialProductType = ref<{title: string, value: MaterialProductType | null}>({ title: "", value: null });

        const {
            requiredFieldRules, doiValidationRules,
            workOpenAlexIdValidationRules,
            documentWebOfScienceIdValidationRules,
            scopusIdValidationRules,
            requiredSelectionRules
        } = useValidationUtils();

        const submitMaterialProduct = (stayOnPage: boolean) => {
            const newMaterialProduct: MaterialProduct = {
                title: title.value,
                internalNumber: materialProductNumber.value,
                numberProduced: numberProduced.value,
                description: description.value,
                keywords: keywords.value,
                productUsers: productUsers.value,
                materialProductType: selectedMaterialProductType.value.value as MaterialProductType,
                subTitle: subtitle.value,
                uris: uris.value,
                contributions: contributions.value,
                documentDate: publicationYear.value,
                doi: doi.value,
                openAlexId: openAlexId.value,
                scopusId: scopus.value,
                webOfScienceId: webOfScienceId.value,
                publisherId: (!selectedPublisher.value || selectedPublisher.value.value < 0) ? undefined : selectedPublisher.value.value,
                authorReprint: selectedPublisher.value.value === -2,
                fileItems: [],
                proofs: [],
                researchAreasId: researchAreaIds.value
            };

            DocumentPublicationService.createMaterialProduct(newMaterialProduct).then((response) => {
                if (stayOnPage) {
                    titleRef.value?.clearInput();
                    subtitleRef.value?.clearInput();
                    descriptionRef.value?.clearInput();
                    keywordsRef.value?.clearInput();
                    urisRef.value?.clearInput();
                    publisherAutocompleteRef.value?.clearInput();
                    publicationYear.value = "";
                    doi.value = "";
                    openAlexId.value = "";
                    webOfScienceId.value = "";
                    materialProductNumber.value = "";
                    scopus.value = ""
                    numberProduced.value = 0;
                    contributionsRef.value?.clearInput();
                    deduplicationTableRef.value?.resetTable();
                    usersRef.value?.clearInput();
                    researchAreasSelectionRef.value?.resetForm();

                    error.value = false;
                    snackbar.value = true;
                } else {
                    router.push({ name: "materialProductLandingPage", params: {id: response.data.id} });
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

            materialProductNumber.value = materialProductNumber.value ? materialProductNumber.value : metadata.issue;
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

        const saveResearchAreas = (newResearchAreaIds: number[]) => {
            researchAreaIds.value = newResearchAreaIds;
        };

        return {
            isFormValid, scopusIdValidationRules,
            additionalFields, snackbar, error,
            title, titleRef, subtitle, subtitleRef,
            publicationYear, doi, PublicationType,
            publisherAutocompleteRef, popuateMetadata,
            selectedPublisher, materialProductNumber, openAlexId,
            description, descriptionRef, doiValidationRules,
            keywords, keywordsRef, uris, urisRef, productUsers,
            contributions, contributionsRef, errorMessage,
            requiredFieldRules, submitMaterialProduct, scopus,
            workOpenAlexIdValidationRules, webOfScienceId,
            documentWebOfScienceIdValidationRules,
            deduplicationTableRef, numberProduced,
            materialProductTypes, selectedMaterialProductType,
            requiredSelectionRules, usersRef,
            researchAreasSelectionRef, saveResearchAreas
        };
    }
});
</script>
