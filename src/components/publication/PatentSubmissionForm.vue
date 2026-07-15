<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col :cols="inModal ? 12 : 10">
                <v-row>
                    <v-col cols="11">
                        <i-d-f-metadata-prepopulator
                            :document-type="PublicationType.PATENT"
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
                        <v-text-field
                            v-model="publicationYear"
                            type="number"
                            :label="$t('yearOfPublicationLabel') + '*'"
                            :placeholder="$t('yearOfPublicationLabel') + '*'"
                            :rules="requiredFieldRules"
                        />
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="10">
                        <v-select
                            v-model="selectedIntellectualPropertyType"
                            :label="$t('intellectualPropertyTypeLabel') + '*'"
                            :items="intellectualPropertyTypes"
                            :rules="requiredSelectionRules"
                            :disabled="inModal"
                            return-object
                        />
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="10">
                        <v-select
                            v-model="selectedIntellectualPropertyApplicationStatusType"
                            :label="$t('intellectualPropertyApplicationStatusLabel')"
                            :items="intellectualPropertyApplicationStatuses"
                            :disabled="inModal"
                            return-object
                        />
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="10">
                        <v-text-field
                            v-model="patentNumber"
                            :label="$t('patentNumberLabel')"
                            :placeholder="$t('patentNumberLabel')"
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
                            <uri-input
                                ref="urisRef"
                                v-model="uris"
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <multilingual-text-input
                                ref="placeRef"
                                v-model="place"
                                :label="$t('placeLabel')"
                            />
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
                        <v-col cols="10">
                            <flexible-date-picker
                                v-model="dateRequested"
                                :label="$t('dateRequestedLabel')"
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="10">
                            <flexible-date-picker
                                v-model="dateFilingPriority"
                                :label="$t('dateFilingPriorityLabel')"
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="10">
                            <flexible-date-picker
                                v-model="dateTo"
                                :label="$t('dateToLabel')"
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
import { useRouter } from 'vue-router';
import PublisherAutocompleteSearch from '../publisher/PublisherAutocompleteSearch.vue';
import UriInput from '../core/UriInput.vue';
import PersonPublicationContribution from './PersonPublicationContribution.vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { type PersonDocumentContribution, PublicationType, type Patent, type CommonFieldsData, IntellectualPropertyType, IntellectualPropertyApplicationStatus } from "@/models/PublicationModel";
import DocumentPublicationService from '@/services/DocumentPublicationService';
import type { AxiosError } from 'axios';
import type { ErrorResponse, FlexibleDate, PrepopulatedMetadata } from '@/models/Common';
import { useI18n } from 'vue-i18n';
import Toast from '../core/Toast.vue';
import IDFMetadataPrepopulator from '../core/IDFMetadataPrepopulator.vue';
import { useLanguageTags } from '@/composables/useLanguageTags';
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import PublicationDeduplicationTable from './PublicationDeduplicationTable.vue';
import DocumentCommonFields from './DocumentCommonFields.vue';
import FlexibleDatePicker from '../core/FlexibleDatePicker.vue';
import { getIntellectualPropertyTypesForGivenLocale } from '@/i18n/intellectualPropertyType.js';
import { getIntellectualPropertyApplicationStatusesForGivenLocale, isApplicationStatusApplicable } from '@/i18n/intellectualPropertyApplicationStatus.js';


export default defineComponent({
    name: "SubmitPatent",
    components: { MultilingualTextInput, UriInput, PersonPublicationContribution, PublisherAutocompleteSearch, Toast, IDFMetadataPrepopulator, PublicationDeduplicationTable, DocumentCommonFields, FlexibleDatePicker },
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

        const router = useRouter();

        const i18n = useI18n();
        const errorMessage = ref(i18n.t("genericErrorMessage"));

        const titleRef = ref<typeof MultilingualTextInput>();
        const subtitleRef = ref<typeof MultilingualTextInput>();
        const descriptionRef = ref<typeof MultilingualTextInput>();
        const keywordsRef = ref<typeof MultilingualTextInput>();
        const placeRef = ref<typeof MultilingualTextInput>();
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
        const place = ref([]);
        const contributions = ref<PersonDocumentContribution[]>([]);
        const publicationYear = ref("");
        const doi = ref("");
        const openAlexId = ref("");
        const scopus = ref("");
        const webOfScienceId = ref("");
        const patentNumber = ref("");
        const uris = ref<string[]>([]);
        const dateRequested = ref<FlexibleDate>();
        const dateFilingPriority = ref<FlexibleDate>();
        const dateTo = ref<FlexibleDate>();

        const intellectualPropertyTypes = getIntellectualPropertyTypesForGivenLocale();
        const selectedIntellectualPropertyType = ref<{title: string, value: IntellectualPropertyType | null}>(
            { title: "", value: null }
        );

        const intellectualPropertyApplicationStatuses = computed(() => {
            const type = selectedIntellectualPropertyType.value.value;

            if (!type) {
                return [];
            }

            return getIntellectualPropertyApplicationStatusesForGivenLocale().filter(status =>
                isApplicationStatusApplicable(type, status.value)
            );
        });
        const selectedIntellectualPropertyApplicationStatusType = ref<{title: string, value: IntellectualPropertyApplicationStatus | null}>(
            { title: "", value: null }
        );

        watch(selectedIntellectualPropertyType, () => {
            const selected = selectedIntellectualPropertyApplicationStatusType.value.value;

            if (
                selected &&
                !intellectualPropertyApplicationStatuses.value.some(
                    status => status.value === selected
                )
            ) {
                selectedIntellectualPropertyApplicationStatusType.value = {
                    title: "",
                    value: null
                };
            }
        });

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
            submitPatent(true);
        };

        const submitPatent = (stayOnPage: boolean) => {
            const newPatent: Patent = {
                title: title.value,
                number: patentNumber.value,
                description: description.value,
                keywords: keywords.value,
                subTitle: subtitle.value,
                uris: uris.value,
                contributions: contributions.value,
                documentDate: publicationYear.value,
                doi: doi.value,
                openAlexId: openAlexId.value,
                scopusId: scopus.value,
                webOfScienceId: openAlexId.value,
                publisherId: (!selectedPublisher.value || selectedPublisher.value.value < 0) ? undefined : selectedPublisher.value.value,
                authorReprint: selectedPublisher.value.value === -2,
                fileItems: [],
                proofs: [],
                type: selectedIntellectualPropertyType.value.value as IntellectualPropertyType,
                applicationStatus: selectedIntellectualPropertyApplicationStatusType.value.value as IntellectualPropertyApplicationStatus,
                dateRequested: dateRequested.value,
                dateFilingPriority: dateFilingPriority.value,
                dateTo: dateTo.value,
                ...commonFieldsData.value
            };

            DocumentPublicationService.createPatent(
                newPatent
            ).then((response) => {
                emit("create", response.data);

                if (stayOnPage) {
                    titleRef.value?.clearInput();
                    subtitleRef.value?.clearInput();
                    descriptionRef.value?.clearInput();
                    keywordsRef.value?.clearInput();
                    placeRef.value?.clearInput();
                    urisRef.value?.clearInput();
                    publisherAutocompleteRef.value?.clearInput();
                    publicationYear.value = "";
                    doi.value = "";
                    openAlexId.value = "";
                    webOfScienceId.value = "";
                    patentNumber.value = "";
                    scopus.value = "";
                    dateRequested.value = undefined;
                    dateFilingPriority.value = undefined;
                    dateTo.value = undefined;
                    selectedIntellectualPropertyType.value = { title: "", value: null };
                    selectedIntellectualPropertyApplicationStatusType.value = { title: "", value: null };
                    contributionsRef.value?.clearInput();
                    deduplicationTableRef.value?.resetTable();
                    commonFieldsRef.value?.clearInputs();
                    commonFieldsData.value = {};

                    error.value = false;
                    snackbar.value = true;
                } else {
                    router.push({ name: "patentLandingPage", params: {id: response.data.id} });
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

            patentNumber.value = patentNumber.value ? patentNumber.value : metadata.issue;
            uris.value.push(metadata.url);
            doi.value = doi.value ? doi.value : metadata.doi;

            if (metadata.year > 0) {
                publicationYear.value = `${metadata.year}`;
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
            isFormValid, additionalFields,
            snackbar, error, title, titleRef,
            subtitle, subtitleRef,
            publicationYear, doi,
            publisherAutocompleteRef,
            selectedPublisher, patentNumber,
            description, descriptionRef,
            keywords, keywordsRef, errorMessage,
            place, placeRef, uris, urisRef,
            contributions, contributionsRef,
            requiredFieldRules, submitPatent,
            doiValidationRules, openAlexId,
            workOpenAlexIdValidationRules,
            PublicationType, popuateMetadata,
            documentWebOfScienceIdValidationRules,
            webOfScienceId, scopus, submit,
            scopusIdValidationRules,
            deduplicationTableRef,
            commonFieldsRef, commonFieldsData,
            presetCommonFieldsData, dateTo,
            dateRequested, dateFilingPriority,
            requiredSelectionRules,
            intellectualPropertyTypes,
            selectedIntellectualPropertyType,
            intellectualPropertyApplicationStatuses,
            selectedIntellectualPropertyApplicationStatusType
        };
    }
});
</script>
