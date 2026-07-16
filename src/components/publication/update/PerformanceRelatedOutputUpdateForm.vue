<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="titleRef" v-model="title" 
                    :rules="requiredFieldRules" 
                    :label="$t('titleLabel') + '*'"
                    :initial-value="toMultilingualTextInput(presetPerformanceRelatedOutput?.title, languageTags)"
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="subtitleRef"
                    v-model="subtitle"
                    :label="$t('subtitleLabel')"
                    :initial-value="toMultilingualTextInput(presetPerformanceRelatedOutput?.subTitle, languageTags)"
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
                    v-model="selectedPerformanceRelatedOutputType"
                    :label="$t('performanceRelatedOutputTypeLabel') + '*'"
                    :items="performanceRelatedOutputTypes"
                    :rules="requiredSelectionRules"
                    return-object
                ></v-select>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="producerRef"
                    v-model="producer"
                    :label="$t('producerLabel')"
                    :initial-value="toMultilingualTextInput(presetPerformanceRelatedOutput?.producer, languageTags)"
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="distributorRef"
                    v-model="distributor"
                    :label="$t('distributorLabel')"
                    :initial-value="toMultilingualTextInput(presetPerformanceRelatedOutput?.distributor, languageTags)"
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="sourceTitleRef"
                    v-model="sourceTitle"
                    :label="$t('sourceTitleLabel')"
                    :initial-value="toMultilingualTextInput(presetPerformanceRelatedOutput?.sourceTitle, languageTags)"
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="otherActorsRef"
                    v-model="otherActors"
                    :label="$t('otherActorsLabel')"
                    :initial-value="toMultilingualTextInput(presetPerformanceRelatedOutput?.otherActors, languageTags)"
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
import type { CommonFieldsData, PerformanceRelatedOutput, PerformanceRelatedOutputType } from '@/models/PublicationModel';
import UriInput from '@/components/core/UriInput.vue';
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import { watch } from 'vue';
import { useLanguageTags } from '@/composables/useLanguageTags';
import Toast from '@/components/core/Toast.vue';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import { useIdentifierCheck } from '@/composables/useIdentifierCheck';
import { getPerformanceRelatedOutputTypesForGivenLocale, getPerformanceRelatedOutputTypeTitleFromValueAutoLocale } from '@/i18n/performanceRelatedOutputType';
import DocumentCommonFields from '../DocumentCommonFields.vue';
import { getCommonIdentifiers, updateDocumentCommonFields } from '@/utils/CommonDocumentFieldsUtil';
import LanguageService from '@/services/LanguageService';
import { type AxiosResponse } from 'axios';
import FlexibleDatePicker from '@/components/core/FlexibleDatePicker.vue';


export default defineComponent({
    name: "PerformanceRelatedOutputUpdateForm",
    components: { MultilingualTextInput, UriInput, Toast, DocumentCommonFields, FlexibleDatePicker },
    props: {
        presetPerformanceRelatedOutput: {
            type: Object as PropType<PerformanceRelatedOutput | undefined>,
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

        const { checkIdentifiers, message, snackbar } = useIdentifierCheck();

        const { languageTags } = useLanguageTags();

        onMounted(() => {
            updatePresetCommonFields();

            LanguageService.getAllLanguageTags()
                .then((response: AxiosResponse<LanguageTagResponse[]>) => {
                response.data.forEach(languageTag => {
                    allLanguageTags.value.push({
                        title: languageTag.display, value: languageTag.id
                    });

                    fillLanguageData();
                })
            });
        });

        const fillLanguageData = () => {
            selectedLanguageTags.value.splice(0);
            props.presetPerformanceRelatedOutput?.languageTags?.forEach(languageTag => {
                selectedLanguageTags.value.push({
                    title: languageTag.display,
                    value: languageTag.id
                });
            });
        };

        watch(() => props.presetPerformanceRelatedOutput, () => {
            if (props.presetPerformanceRelatedOutput) {
                refreshForm();
            }
        });

        const titleRef = ref<typeof MultilingualTextInput>();
        const subtitleRef = ref<typeof MultilingualTextInput>();
        const producerRef = ref<typeof MultilingualTextInput>();
        const distributorRef = ref<typeof MultilingualTextInput>();
        const sourceTitleRef = ref<typeof MultilingualTextInput>();
        const otherActorsRef = ref<typeof MultilingualTextInput>();
        const urisRef = ref<typeof UriInput>();

        const title = ref<any>([]);
        const subtitle = ref<any>([]);
        const producer = ref<any>([]);
        const distributor = ref<any>([]);
        const sourceTitle = ref<any>([]);
        const otherActors = ref<any>([]);
        const publicationDate = ref(props.presetPerformanceRelatedOutput?.documentDate);
        const doi = ref(props.presetPerformanceRelatedOutput?.doi);
        const openAlexId = ref(props.presetPerformanceRelatedOutput?.openAlexId);
        const webOfScienceId = ref(props.presetPerformanceRelatedOutput?.webOfScienceId);
        const uris = ref<string[]>(props.presetPerformanceRelatedOutput?.uris as string[]);
        const scopus = ref(props.presetPerformanceRelatedOutput?.scopusId);

        const selectedLanguageTags = ref<{title: string, value: number}[]>([]);
        const allLanguageTags = ref<{title: string, value: number}[]>([]);

        const performanceRelatedOutputTypes = getPerformanceRelatedOutputTypesForGivenLocale();
        const selectedPerformanceRelatedOutputType = ref<{title: string, value: PerformanceRelatedOutputType | null}>(
            { 
                title: getPerformanceRelatedOutputTypeTitleFromValueAutoLocale(props.presetPerformanceRelatedOutput?.type as PerformanceRelatedOutputType) as string,
                value: props.presetPerformanceRelatedOutput?.type as PerformanceRelatedOutputType 
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
                    props.presetPerformanceRelatedOutput?.id as number,
                    (id, docId) => DocumentPublicationService.checkIdentifierUsage(id, docId)
                );

                if (duplicateFound) {
                    return;
                }
            }

            const updatedPerformanceRelatedOutput: PerformanceRelatedOutput = {
                title: title.value as MultilingualContent[],
                description: props.presetPerformanceRelatedOutput?.description as MultilingualContent[],
                keywords: props.presetPerformanceRelatedOutput?.keywords as MultilingualContent[],
                subTitle: subtitle.value as MultilingualContent[],
                uris: uris.value,
                contributions: props.presetPerformanceRelatedOutput?.contributions,
                documentDate: publicationDate.value,
                doi: doi.value,
                scopusId: scopus.value,
                openAlexId: openAlexId.value,
                webOfScienceId: webOfScienceId.value,
                type: selectedPerformanceRelatedOutputType.value.value as PerformanceRelatedOutputType,
                fileItems: [],
                proofs: [],
                producer: producer.value,
                distributor: distributor.value,
                sourceTitle: sourceTitle.value,
                otherActors: otherActors.value,
                languageTagIds: selectedLanguageTags.value.map(languageTag => languageTag.value),
                ...commonFieldsData.value
            };

            emit("update", updatedPerformanceRelatedOutput);
        };

        const updatePresetCommonFields = () => {
            updateDocumentCommonFields(props.presetPerformanceRelatedOutput, presetCommonFieldsData);
        };

        const refreshForm = () => {
            titleRef.value?.clearInput();
            title.value = props.presetPerformanceRelatedOutput?.title as MultilingualContent[];

            subtitleRef.value?.clearInput();
            subtitle.value = props.presetPerformanceRelatedOutput?.subTitle as MultilingualContent[];

            producerRef.value?.clearInput();
            producer.value = props.presetPerformanceRelatedOutput?.producer as MultilingualContent[];

            distributorRef.value?.clearInput();
            distributor.value = props.presetPerformanceRelatedOutput?.distributor as MultilingualContent[];

            sourceTitleRef.value?.clearInput();
            sourceTitle.value = props.presetPerformanceRelatedOutput?.sourceTitle as MultilingualContent[];

            otherActorsRef.value?.clearInput();
            otherActors.value = props.presetPerformanceRelatedOutput?.otherActors as MultilingualContent[];

            uris.value = props.presetPerformanceRelatedOutput?.uris as string[];
            publicationDate.value = props.presetPerformanceRelatedOutput?.documentDate;
            doi.value = props.presetPerformanceRelatedOutput?.doi;
            openAlexId.value = props.presetPerformanceRelatedOutput?.openAlexId;
            webOfScienceId.value = props.presetPerformanceRelatedOutput?.webOfScienceId;
            scopus.value = props.presetPerformanceRelatedOutput?.scopusId;

            updateDocumentCommonFields(props.presetPerformanceRelatedOutput, presetCommonFieldsData);

            selectedPerformanceRelatedOutputType.value =
                { 
                    title: getPerformanceRelatedOutputTypeTitleFromValueAutoLocale(props.presetPerformanceRelatedOutput?.type as PerformanceRelatedOutputType) as string,
                    value: props.presetPerformanceRelatedOutput?.type as PerformanceRelatedOutputType 
                };

            fillLanguageData();

            titleRef.value?.forceRefreshModelValue(toMultilingualTextInput(title.value, languageTags.value));
            subtitleRef.value?.forceRefreshModelValue(toMultilingualTextInput(subtitle.value, languageTags.value));
            urisRef.value?.refreshModelValue(uris.value);

            if (commonFieldsRef.value && presetCommonFieldsData.value) {
                commonFieldsRef.value.refreshForm(presetCommonFieldsData.value);
            }
        };

        return {
            isFormValid, doi, snackbar, message,
            title, subtitle, publicationDate,
            uris, requiredFieldRules, titleRef,
            submit, toMultilingualTextInput,
            languageTags, doiValidationRules,
            refreshForm, urisRef, subtitleRef,
            openAlexId, workOpenAlexIdValidationRules,
            webOfScienceId, documentWebOfScienceIdValidationRules,
            scopus, scopusIdValidationRules, performanceRelatedOutputTypes,
            selectedPerformanceRelatedOutputType, requiredSelectionRules,
            commonFieldsRef, commonFieldsData, presetCommonFieldsData,
            distributorRef, producerRef, sourceTitleRef, otherActorsRef,
            distributor, producer, sourceTitle, otherActors,
            allLanguageTags, selectedLanguageTags
        };
    }
});
</script>
