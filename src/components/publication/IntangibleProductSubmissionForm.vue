<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col :cols="inModal ? 12 : 10">
                <v-row>
                    <v-col cols="11">
                        <i-d-f-metadata-prepopulator
                            :document-type="PublicationType.INTANGIBLE_PRODUCT"
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
                            :label="$t('titleLabel') + '*'"
                        />
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
                            />
                        </v-col>
                    </v-row>
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
                        <v-select
                            v-model="selectedIntangibleProductType"
                            :label="$t('intangibleProductTypeLabel') + '*'"
                            :items="intangibleProductTypes"
                            :rules="requiredSelectionRules"
                            :disabled="inModal"
                            return-object
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="10">
                        <v-text-field
                            v-model="intangibleProductNumber"
                            :label="$t('internalNumberLabel')"
                            :placeholder="$t('internalNumberLabel')"
                        />
                    </v-col>
                </v-row>

                <v-row>
                    <v-col>
                        <h2>{{ $t("authorsLabel") }}</h2>
                        <person-publication-contribution
                            ref="contributionsRef"
                            basic
                            @set-input="contributions = $event"
                        />
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
                                :label="$t('subtitleLabel')"
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <multilingual-text-input
                                ref="descriptionRef"
                                v-model="description"
                                is-area
                                :label="$t('abstractLabel')"
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <multilingual-text-input
                                ref="keywordsRef"
                                v-model="keywords"
                                :label="$t('keywordsLabel')"
                                is-area
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
                    <v-row>
                        <v-col cols="10">
                            <multilingual-text-input
                                ref="usersRef"
                                v-model="productUsers"
                                :label="$t('productUsersLabel')"
                            />
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

                    <document-common-fields
                        ref="commonFieldsRef"
                        v-model="commonFieldsData"
                        :preset-data="presetCommonFieldsData"
                    />
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
import { PublicationType, type PersonDocumentContribution, type IntangibleProduct, IntangibleProductType, type CommonFieldsData } from "@/models/PublicationModel";
import DocumentPublicationService from '@/services/DocumentPublicationService';
import type { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import type { ErrorResponse, FlexibleDate, PrepopulatedMetadata } from '@/models/Common';
import Toast from '../core/Toast.vue';
import { useLanguageTags } from '@/composables/useLanguageTags';
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import IDFMetadataPrepopulator from '../core/IDFMetadataPrepopulator.vue';
import PublicationDeduplicationTable from './PublicationDeduplicationTable.vue';
import { getIntangibleProductTypesForGivenLocale } from '@/i18n/intangibleProductType';
import ResearchAreasSelection from '../core/ResearchAreasSelection.vue';
import DocumentCommonFields from './DocumentCommonFields.vue';
import FlexibleDatePicker from '../core/FlexibleDatePicker.vue';


export default defineComponent({
    name: "SubmitIntangibleProduct",
    components: { MultilingualTextInput, UriInput, PersonPublicationContribution, PublisherAutocompleteSearch, Toast, IDFMetadataPrepopulator, PublicationDeduplicationTable, ResearchAreasSelection, DocumentCommonFields, FlexibleDatePicker },
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
        const publicationDate = ref<FlexibleDate>();
        const doi = ref("");
        const openAlexId = ref("");
        const scopus = ref("");
        const webOfScienceId = ref("");
        const intangibleProductNumber = ref("");
        const uris = ref<string[]>([]);
        const researchAreaIds = ref<number[]>([]);

        const intangibleProductTypes = getIntangibleProductTypesForGivenLocale();
        const selectedIntangibleProductType = ref<{title: string, value: IntangibleProductType | null}>({ title: "", value: null });

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
            submitIntangibleProduct(true);
        };

        const submitIntangibleProduct = (stayOnPage: boolean) => {
            const newIntangibleProduct: IntangibleProduct = {
                title: title.value,
                internalNumber: intangibleProductNumber.value,
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
                publisherId: (!selectedPublisher.value || selectedPublisher.value.value < 0) ? undefined : selectedPublisher.value.value,
                authorReprint: selectedPublisher.value.value === -2,
                fileItems: [],
                proofs: [],
                productUsers: productUsers.value,
                intangibleProductType: selectedIntangibleProductType.value.value as IntangibleProductType,
                researchAreasId: researchAreaIds.value,
                ...commonFieldsData.value
            };

            DocumentPublicationService.createIntangibleProduct(
                newIntangibleProduct
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
                    intangibleProductNumber.value = "";
                    scopus.value = ""
                    contributionsRef.value?.clearInput();
                    deduplicationTableRef.value?.resetTable();
                    usersRef.value?.clearInput();
                    researchAreasSelectionRef.value?.resetForm();
                    selectedIntangibleProductType.value = { title: "", value: null };
                    commonFieldsRef.value?.clearInputs();
                    commonFieldsData.value = {};

                    error.value = false;
                    snackbar.value = true;
                } else {
                    router.push({ name: "intangibleProductLandingPage", params: {id: response.data.id} });
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

            intangibleProductNumber.value = intangibleProductNumber.value ? intangibleProductNumber.value : metadata.issue;
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

        const saveResearchAreas = (newResearchAreaIds: number[]) => {
            researchAreaIds.value = newResearchAreaIds;
        };

        return {
            isFormValid, scopusIdValidationRules,
            additionalFields, snackbar, error,
            title, titleRef, subtitle, subtitleRef,
            publicationDate, doi, PublicationType,
            publisherAutocompleteRef, popuateMetadata,
            selectedPublisher, intangibleProductNumber, openAlexId,
            description, descriptionRef, doiValidationRules,
            keywords, keywordsRef, uris, urisRef, productUsers,
            contributions, contributionsRef, errorMessage,
            requiredFieldRules, submitIntangibleProduct, scopus,
            workOpenAlexIdValidationRules, webOfScienceId,
            documentWebOfScienceIdValidationRules, usersRef,
            deduplicationTableRef, requiredSelectionRules,
            intangibleProductTypes, selectedIntangibleProductType,
            researchAreasSelectionRef, saveResearchAreas, submit,
            commonFieldsRef, commonFieldsData, presetCommonFieldsData
        };
    }
});
</script>
