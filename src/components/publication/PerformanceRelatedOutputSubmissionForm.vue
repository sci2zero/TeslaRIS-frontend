<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col :cols="inModal ? 12 : 10">
                <v-row>
                    <v-col cols="11">
                        <i-d-f-metadata-prepopulator
                            :document-type="PublicationType.PERFORMANCE_RELATED_OUTPUT"
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
                            v-model="selectedPerformanceRelatedOutputType"
                            :label="$t('performanceRelatedOutputTypeLabel') + '*'"
                            :items="performanceRelatedOutputTypes"
                            :rules="requiredSelectionRules"
                            return-object
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
                            <multilingual-text-input
                                ref="producerRef"
                                v-model="producer"
                                :label="$t('producerLabel')"
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <multilingual-text-input
                                ref="distributorRef"
                                v-model="distributor"
                                :label="$t('distributorLabel')"
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <multilingual-text-input
                                ref="sourceTitleRef"
                                v-model="sourceTitle"
                                :label="$t('sourceTitleLabel')"
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <multilingual-text-input
                                ref="otherActorsRef"
                                v-model="otherActors"
                                :label="$t('otherActorsLabel')"
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="10">
                            <v-select
                                v-model="selectedLanguageTags"
                                :items="allLanguageTags"
                                :label="$t('languageLabel')"
                                return-object
                                multiple
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
import type { ErrorResponse, LanguageTagResponse, PrepopulatedMetadata } from '@/models/Common';
import Toast from '../core/Toast.vue';
import { useLanguageTags } from '@/composables/useLanguageTags';
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import IDFMetadataPrepopulator from '../core/IDFMetadataPrepopulator.vue';
import PublicationDeduplicationTable from './PublicationDeduplicationTable.vue';
import { getPerformanceRelatedOutputTypesForGivenLocale } from '@/i18n/performanceRelatedOutputType';
import DocumentCommonFields from './DocumentCommonFields.vue';
import LanguageService from '@/services/LanguageService';


export default defineComponent({
    name: "SubmitPerformanceRelatedOutput",
    components: { MultilingualTextInput, UriInput, PersonPublicationContribution, Toast, IDFMetadataPrepopulator, PublicationDeduplicationTable, DocumentCommonFields },
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
        const publicationYear = ref("");
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
                documentDate: publicationYear.value,
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
                    publicationYear.value = "";
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

        return {
            isFormValid, scopusIdValidationRules,
            additionalFields, snackbar, error,
            title, titleRef, subtitle, subtitleRef,
            publicationYear, doi, PublicationType,
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
