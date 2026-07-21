<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="titleRef"
                    v-model="title"
                    :rules="requiredFieldRules"
                    :label="$t('titleLabel') + '*'"
                    :initial-value="toMultilingualTextInput(presetIntellectualProperty?.title, languageTags)"
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="subtitleRef"
                    v-model="subtitle"
                    :label="$t('subtitleLabel')"
                    :initial-value="toMultilingualTextInput(presetIntellectualProperty?.subTitle, languageTags)"
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
            <v-col cols="5">
                <v-text-field
                    v-model="doi"
                    label="DOI"
                    placeholder="DOI"
                    :rules="doiValidationRules"
                />
            </v-col>
            <v-col cols="5">
                <v-text-field
                    v-model="intellectualPropertyNumber"
                    :label="$t('internalNumberLabel')"
                    :placeholder="$t('internalNumberLabel')"
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
                    return-object
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
        
        <v-row>
            <p class="required-fields-message">
                {{ $t("requiredFieldsMessage") }}
            </p>
        </v-row>
    </v-form>

    <toast v-model="snackbar" :message="message" />
</template>

<script lang="ts">
import { computed, defineComponent, watch, type PropType } from 'vue';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import { ref } from 'vue';
import type { FlexibleDate, MultilingualContent } from '@/models/Common';
import { onMounted } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import type { CommonFieldsData, IntellectualPropertyApplicationStatus, IntellectualPropertyType, IntellectualProperty } from '@/models/PublicationModel';
import UriInput from '@/components/core/UriInput.vue';
import PublisherAutocompleteSearch from '@/components/publisher/PublisherAutocompleteSearch.vue';
import PublisherService from '@/services/PublisherService';
import type { Publisher } from '@/models/PublisherModel';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import { useLanguageTags } from '@/composables/useLanguageTags';
import Toast from '@/components/core/Toast.vue';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import { useIdentifierCheck } from '@/composables/useIdentifierCheck';
import DocumentCommonFields from '../DocumentCommonFields.vue';
import { getCommonIdentifiers, updateDocumentCommonFields } from '@/utils/CommonDocumentFieldsUtil';
import { getIntellectualPropertyApplicationStatusesForGivenLocale, getIntellectualPropertyApplicationStatusTitleFromValueAutoLocale, isApplicationStatusApplicable } from '@/i18n/intellectualPropertyApplicationStatus.js';
import { getIntellectualPropertyTypesForGivenLocale, getIntellectualPropertyTypeTitleFromValueAutoLocale } from '@/i18n/intellectualPropertyType.js';
import FlexibleDatePicker from '@/components/core/FlexibleDatePicker.vue';


export default defineComponent({
    name: "IntellectualPropertyUpdateForm",
    components: { MultilingualTextInput, UriInput, PublisherAutocompleteSearch, Toast, DocumentCommonFields, FlexibleDatePicker },
    props: {
        presetIntellectualProperty: {
            type: Object as PropType<IntellectualProperty | undefined>,
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
            if(props.presetIntellectualProperty?.publisherId) {
                PublisherService.readPublisher(props.presetIntellectualProperty.publisherId).then((response) => {
                    publisher.value = response.data;
                    selectedPublisher.value = {title: returnCurrentLocaleContent(publisher.value.name) as string, value: publisher.value.id as number};
                });
            } else if (props.presetIntellectualProperty?.authorReprint) {
                selectedPublisher.value = {title: "", value: -2};
            }
        };

        watch(() => props.presetIntellectualProperty, () => {
            if (props.presetIntellectualProperty) {
                refreshForm();
            }
        });

        const titleRef = ref<typeof MultilingualTextInput>();
        const subtitleRef = ref<typeof MultilingualTextInput>();
        const urisRef = ref<typeof UriInput>();

        const searchPlaceholder = {title: returnCurrentLocaleContent(publisher.value?.name) as string, value: publisher.value?.id as number};
        const selectedPublisher = ref<{ title: string, value: number }>(searchPlaceholder);

        const title = ref<any>([]);
        const subtitle = ref<any>([]);
        const publicationDate = ref(props.presetIntellectualProperty?.documentDate);
        const doi = ref(props.presetIntellectualProperty?.doi);
        const openAlexId = ref(props.presetIntellectualProperty?.openAlexId);
        const webOfScienceId = ref(props.presetIntellectualProperty?.webOfScienceId);
        const intellectualPropertyNumber = ref(props.presetIntellectualProperty?.number);
        const uris = ref<string[]>(props.presetIntellectualProperty?.uris as string[]);
        const scopus = ref(props.presetIntellectualProperty?.scopusId);
        const dateRequested = ref<FlexibleDate>();
        const dateFilingPriority = ref<FlexibleDate>();
        const dateTo = ref<FlexibleDate>();

        const intellectualPropertyTypes = getIntellectualPropertyTypesForGivenLocale();
        const selectedIntellectualPropertyType = ref<{title: string, value: IntellectualPropertyType | null}>(
            {
                title: getIntellectualPropertyTypeTitleFromValueAutoLocale(props.presetIntellectualProperty?.type as IntellectualPropertyType) as string ?? "",
                value: props.presetIntellectualProperty?.type as IntellectualPropertyType ?? null
            }
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
            { 
                title: getIntellectualPropertyApplicationStatusTitleFromValueAutoLocale(props.presetIntellectualProperty?.applicationStatus as IntellectualPropertyApplicationStatus) as string ?? "",
                value: props.presetIntellectualProperty?.applicationStatus as IntellectualPropertyApplicationStatus ?? null
            }
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
                    props.presetIntellectualProperty?.id as number,
                    (id, docId) => DocumentPublicationService.checkIdentifierUsage(id, docId)
                );

                if (duplicateFound) {
                    return;
                }
            }

            const updatedIntellectualProperty: IntellectualProperty = {
                title: title.value as MultilingualContent[],
                number: intellectualPropertyNumber.value as string,
                description: props.presetIntellectualProperty?.description as MultilingualContent[],
                keywords: props.presetIntellectualProperty?.keywords as MultilingualContent[],
                subTitle: subtitle.value as MultilingualContent[],
                uris: uris.value,
                contributions: props.presetIntellectualProperty?.contributions,
                documentDate: publicationDate.value,
                doi: doi.value,
                scopusId: scopus.value,
                openAlexId: openAlexId.value,
                webOfScienceId: webOfScienceId.value,
                publisherId: (!selectedPublisher.value || selectedPublisher.value.value < 0) ? undefined : selectedPublisher.value.value,
                authorReprint: selectedPublisher.value?.value === -2,
                fileItems: [],
                proofs: [],
                type: selectedIntellectualPropertyType.value.value as IntellectualPropertyType,
                applicationStatus: selectedIntellectualPropertyApplicationStatusType.value.value as IntellectualPropertyApplicationStatus,
                dateRequested: dateRequested.value,
                dateFilingPriority: dateFilingPriority.value,
                dateTo: dateTo.value,
                ...commonFieldsData.value
            };

            emit("update", updatedIntellectualProperty);
        };

        const updatePresetCommonFields = () => {
            updateDocumentCommonFields(props.presetIntellectualProperty, presetCommonFieldsData);
        };

        const refreshForm = () => {
            titleRef.value?.clearInput();
            title.value = props.presetIntellectualProperty?.title as MultilingualContent[];

            subtitleRef.value?.clearInput();
            subtitle.value = props.presetIntellectualProperty?.subTitle as MultilingualContent[];

            uris.value = props.presetIntellectualProperty?.uris as string[];
            intellectualPropertyNumber.value = props.presetIntellectualProperty?.number;
            publicationDate.value = props.presetIntellectualProperty?.documentDate;
            doi.value = props.presetIntellectualProperty?.doi;
            openAlexId.value = props.presetIntellectualProperty?.openAlexId;
            webOfScienceId.value = props.presetIntellectualProperty?.webOfScienceId;
            scopus.value = props.presetIntellectualProperty?.scopusId;
            dateRequested.value = props.presetIntellectualProperty?.dateRequested;
            dateFilingPriority.value = props.presetIntellectualProperty?.dateFilingPriority;
            dateTo.value = props.presetIntellectualProperty?.dateTo;

            selectedIntellectualPropertyType.value = {
                title: getIntellectualPropertyTypeTitleFromValueAutoLocale(props.presetIntellectualProperty?.type as IntellectualPropertyType) as string,
                value: props.presetIntellectualProperty?.type as IntellectualPropertyType
            };

            selectedIntellectualPropertyApplicationStatusType.value = { 
                title: getIntellectualPropertyApplicationStatusTitleFromValueAutoLocale(props.presetIntellectualProperty?.applicationStatus as IntellectualPropertyApplicationStatus) as string,
                value: props.presetIntellectualProperty?.applicationStatus as IntellectualPropertyApplicationStatus
            };

            updateDocumentCommonFields(props.presetIntellectualProperty, presetCommonFieldsData);

            titleRef.value?.forceRefreshModelValue(toMultilingualTextInput(title.value, languageTags.value));
            subtitleRef.value?.forceRefreshModelValue(toMultilingualTextInput(subtitle.value, languageTags.value));
            urisRef.value?.refreshModelValue(uris.value);

            if (commonFieldsRef.value && presetCommonFieldsData.value) {
                commonFieldsRef.value.refreshForm(presetCommonFieldsData.value);
            }

            fetchDetails();
        };

        return {
            isFormValid, title,
            scopusIdValidationRules,
            subtitle, doi, scopus,
            publicationDate, 
            selectedPublisher, 
            intellectualPropertyNumber, uris, 
            requiredFieldRules,
            submit, message, snackbar,
            toMultilingualTextInput,
            languageTags,
            doiValidationRules,
            titleRef, subtitleRef,
            refreshForm, urisRef,
            openAlexId, webOfScienceId,
            workOpenAlexIdValidationRules,
            documentWebOfScienceIdValidationRules,
            commonFieldsRef, commonFieldsData,
            presetCommonFieldsData, dateTo,
            dateRequested, dateFilingPriority,
            intellectualPropertyTypes, requiredSelectionRules,
            selectedIntellectualPropertyType,
            intellectualPropertyApplicationStatuses,
            selectedIntellectualPropertyApplicationStatusType
        };
    }
});
</script>
