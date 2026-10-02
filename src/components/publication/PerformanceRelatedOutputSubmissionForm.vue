<template>
    <v-form v-model="isFormValid" class="flex flex-col gap-6" @submit.prevent>
        <form-section
            icon="mdi-file-document-outline"
            :title="$t('publicationDetailsLabel')"
        >
            <i-d-f-metadata-prepopulator
                :document-type="PublicationType.PERFORMANCE_RELATED_OUTPUT"
                @metadata-fetched="popuateMetadata"
            />
            <multilingual-text-input
                ref="titleRef"
                v-model="title"
                :rules="requiredFieldRules"
                :label="$t('titleLabel') + '*'"
            />
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
            <ui-input control="select"
                v-model="selectedPerformanceRelatedOutputType"
                :label="$t('performanceRelatedOutputTypeLabel') + '*'"
                :items="performanceRelatedOutputTypes"
                :rules="requiredSelectionRules"
                return-object
            />
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
                    :label="$t('subtitleLabel')"
                />
                <multilingual-text-input
                    ref="descriptionRef"
                    v-model="description"
                    is-area
                    :label="$t('abstractLabel')"
                />
                <multilingual-text-input
                    ref="keywordsRef"
                    v-model="keywords"
                    :label="$t('keywordsLabel')"
                    is-area
                />
                <multilingual-text-input
                    ref="producerRef"
                    v-model="producer"
                    :label="$t('producerLabel')"
                />
                <multilingual-text-input
                    ref="distributorRef"
                    v-model="distributor"
                    :label="$t('distributorLabel')"
                />
                <multilingual-text-input
                    ref="sourceTitleRef"
                    v-model="sourceTitle"
                    :label="$t('sourceTitleLabel')"
                />
                <multilingual-text-input
                    ref="otherActorsRef"
                    v-model="otherActors"
                    :label="$t('otherActorsLabel')"
                />
                <ui-input control="select"
                    v-model="selectedLanguageTags"
                    :items="allLanguageTags"
                    :label="$t('languageLabel')"
                    return-object
                    multiple
                />
                <uri-input
                    ref="urisRef"
                    v-model="uris"
                />
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
                        :rules="workOpenAlexIdValidationRules"
                    />
                    <ui-input
                        v-model="webOfScienceId"
                        label="Web of Science ID"
                        placeholder="Web of Science ID"
                        :rules="documentWebOfScienceIdValidationRules"
                    />
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
import { defineComponent, nextTick, onMounted } from 'vue';
import MultilingualTextInput from '../core/MultilingualTextInput.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import UriInput from '../core/UriInput.vue';
import PersonPublicationContribution from './PersonPublicationContribution.vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { PublicationType, type PersonDocumentContribution, type PerformanceRelatedOutput, type PerformanceRelatedOutputType, type CommonFieldsData } from "@/models/PublicationModel";
import DocumentPublicationService from '@/services/DocumentPublicationService';
import type { AxiosError, AxiosResponse } from 'axios';
import { useI18n } from 'vue-i18n';
import type { ErrorResponse, FlexibleDate, LanguageTagResponse, PrepopulatedMetadata } from '@/models/Common';
import Toast from '../core/Toast.vue';
import { useLanguageTags } from '@/composables/useLanguageTags';
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import IDFMetadataPrepopulator from '../core/IDFMetadataPrepopulator.vue';
import PublicationDeduplicationTable from './PublicationDeduplicationTable.vue';
import { getPerformanceRelatedOutputTypesForGivenLocale } from '@/i18n/performanceRelatedOutputType';
import DocumentCommonFields from './DocumentCommonFields.vue';
import LanguageService from '@/services/LanguageService';
import FlexibleDatePicker from '../core/FlexibleDatePicker.vue';


import UiInput from '@/components/ui/input/Input.vue';
import FormSection from '@/components/ui/form-section/FormSection.vue';
import { UiButton } from '@/components/ui/button';

export default defineComponent({
    name: "SubmitPerformanceRelatedOutput",
    components: {MultilingualTextInput, UriInput, PersonPublicationContribution, Toast, IDFMetadataPrepopulator, PublicationDeduplicationTable, DocumentCommonFields, FlexibleDatePicker, UiInput, FormSection, UiButton},
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
        const deduplicationTableRef = ref<typeof PublicationDeduplicationTable>();
        const producerRef = ref<typeof MultilingualTextInput>();
        const distributorRef = ref<typeof MultilingualTextInput>();
        const sourceTitleRef = ref<typeof MultilingualTextInput>();
        const otherActorsRef = ref<typeof MultilingualTextInput>();

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
        const performanceRelatedOutputNumber = ref("");
        const uris = ref<string[]>([]);
        const producer = ref<any[]>([]);
        const distributor = ref<any[]>([]);
        const sourceTitle = ref<any[]>([]);
        const otherActors = ref<any[]>([]);

        const performanceRelatedOutputTypes = getPerformanceRelatedOutputTypesForGivenLocale();
        const selectedPerformanceRelatedOutputType = ref<{title: string, value: PerformanceRelatedOutputType | null}>({ title: "", value: null });

        const commonFieldsRef = ref<typeof DocumentCommonFields>();
        const commonFieldsData = ref<CommonFieldsData>({});
        const presetCommonFieldsData = ref<CommonFieldsData | undefined>(undefined);

        const selectedLanguageTags = ref<{title: string, value: number}[]>([]);
        const allLanguageTags = ref<{title: string, value: number}[]>([]);

        onMounted(() => {
            LanguageService.getAllLanguageTags()
                .then((response: AxiosResponse<LanguageTagResponse[]>) => {
                response.data.forEach(languageTag => {
                    allLanguageTags.value.push({
                        title: languageTag.display, value: languageTag.id
                    });
                })
            });
        });

        const {
            requiredFieldRules, doiValidationRules,
            workOpenAlexIdValidationRules,
            documentWebOfScienceIdValidationRules,
            scopusIdValidationRules,
            requiredSelectionRules
        } = useValidationUtils();

        const submit = () => {
            submitPerformanceRelatedOutput(true);
        };

        const submitPerformanceRelatedOutput = (stayOnPage: boolean) => {
            const newPerformanceRelatedOutput: PerformanceRelatedOutput = {
                title: title.value,
                description: description.value,
                keywords: keywords.value,
                producer: producer.value,
                distributor: distributor.value,
                otherActors: otherActors.value,
                sourceTitle: sourceTitle.value,
                subTitle: subtitle.value,
                uris: uris.value,
                contributions: contributions.value,
                documentDate: publicationDate.value,
                doi: doi.value,
                openAlexId: openAlexId.value,
                scopusId: scopus.value,
                webOfScienceId: webOfScienceId.value,
                type: selectedPerformanceRelatedOutputType.value.value as PerformanceRelatedOutputType,
                fileItems: [],
                proofs: [],
                languageTagIds: selectedLanguageTags.value.map(languageTag => languageTag.value),
                ...commonFieldsData.value
            };

            DocumentPublicationService.createPerformanceRelatedOutput(
                newPerformanceRelatedOutput
            ).then((response) => {
                emit("create", response.data);

                if (stayOnPage) {
                    titleRef.value?.clearInput();
                    subtitleRef.value?.clearInput();
                    descriptionRef.value?.clearInput();
                    keywordsRef.value?.clearInput();
                    urisRef.value?.clearInput();
                    producerRef.value?.clearInput();
                    distributorRef.value?.clearInput();
                    otherActorsRef.value?.clearInput();
                    sourceTitleRef.value?.clearInput();
                    publicationDate.value = undefined;
                    doi.value = "";
                    openAlexId.value = "";
                    webOfScienceId.value = "";
                    performanceRelatedOutputNumber.value = "";
                    scopus.value = ""
                    contributionsRef.value?.clearInput();
                    deduplicationTableRef.value?.resetTable();
                    selectedPerformanceRelatedOutputType.value = { title: "", value: null };
                    commonFieldsRef.value?.clearInputs();
                    commonFieldsData.value = {};

                    error.value = false;
                    snackbar.value = true;
                } else {
                    router.push({ name: "performanceRelatedOutputLandingPage", params: {id: response.data.id} });
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

            performanceRelatedOutputNumber.value = performanceRelatedOutputNumber.value ? performanceRelatedOutputNumber.value : metadata.issue;
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
            popuateMetadata, producer, distributor,
            performanceRelatedOutputNumber, openAlexId,
            description, descriptionRef, doiValidationRules,
            keywords, keywordsRef, uris, urisRef, sourceTitle,
            contributions, contributionsRef, errorMessage,
            requiredFieldRules, submitPerformanceRelatedOutput, scopus,
            workOpenAlexIdValidationRules, webOfScienceId,
            documentWebOfScienceIdValidationRules, submit,
            deduplicationTableRef, selectedPerformanceRelatedOutputType,
            performanceRelatedOutputTypes, requiredSelectionRules,
            commonFieldsRef, commonFieldsData, otherActors,
            presetCommonFieldsData, producerRef, distributorRef,
            sourceTitleRef, otherActorsRef, selectedLanguageTags,
            allLanguageTags
        };
    }
});
</script>
