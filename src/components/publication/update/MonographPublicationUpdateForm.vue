<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="10">
                <monograph-autocomplete-search
                    ref="monographAutocompleteRef"
                    v-model="selectedMonograph"
                    required
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
                    :initial-value="toMultilingualTextInput(presetMonographPublication?.title, languageTags)"
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="subtitleRef"
                    v-model="subtitle"
                    :label="$t('subtitleLabel')"
                    :initial-value="toMultilingualTextInput(presetMonographPublication?.subTitle, languageTags)"
                />
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="5">
                <v-text-field
                    v-model="startPage"
                    :label="$t('startPageLabel')"
                    :placeholder="$t('startPageLabel')"
                />
            </v-col>
            <v-col cols="5">
                <v-text-field
                    v-model="endPage"
                    :label="$t('endPageLabel')"
                    :placeholder="$t('endPageLabel')"
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="10">
                <v-text-field
                    v-model="doi"
                    label="DOI"
                    placeholder="DOI"
                    :rules="doiValidationRules"
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="10">
                <v-select
                    v-model="selectedpublicationType"
                    :items="publicationTypes"
                    :label="$t('concretePublicationTypeLabel') + '*'"
                    return-object
                    :rules="requiredSelectionRules"
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="5">
                <v-text-field
                    v-model="articleNumber"
                    :label="$t('articleNumberLabel')"
                    :placeholder="$t('articleNumberLabel')"
                />
            </v-col>
            <v-col cols="5">
                <v-text-field
                    v-model="numberOfPages" type="number"
                    :min="0" :label="$t('numberOfPagesLabel')"
                    :rules="optionalNumericZeroOrGreaterFieldRules"
                    :placeholder="$t('numberOfPagesLabel')"
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="sectionRef"
                    v-model="section"
                    :label="$t('sectionLabel')"
                    :initial-value="toMultilingualTextInput(presetMonographPublication?.section, languageTags)"
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
                <event-autocomplete-search
                    ref="eventAutocompleteRef"
                    v-model="selectedEvent"
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
import { computed, defineComponent, type PropType } from 'vue';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import { ref } from 'vue';
import type { MultilingualContent } from '@/models/Common';
import { onMounted } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import type { CommonFieldsData, MonographPublication, MonographPublicationType } from '@/models/PublicationModel';
import UriInput from '@/components/core/UriInput.vue';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import MonographService from '@/services/DocumentPublicationService';
import type { Monograph } from '@/models/PublicationModel';
import type { Conference } from '@/models/EventModel';
import { getTitleFromValueAutoLocale, getMonographPublicationTypesForGivenLocale } from '@/i18n/monographPublicationType';
import MonographAutocompleteSearch from '../MonographAutocompleteSearch.vue';
import { watch } from 'vue';
import { useLanguageTags } from '@/composables/useLanguageTags';
import Toast from '@/components/core/Toast.vue';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import { useIdentifierCheck } from '@/composables/useIdentifierCheck';
import DocumentCommonFields from '../DocumentCommonFields.vue';
import { getCommonIdentifiers, updateDocumentCommonFields } from '@/utils/CommonDocumentFieldsUtil';


export default defineComponent({
    name: "MonographPublicationUpdateForm",
    components: { MultilingualTextInput, UriInput, MonographAutocompleteSearch, Toast, DocumentCommonFields },
    props: {
        presetMonographPublication: {
            type: Object as PropType<MonographPublication | undefined>,
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

        const monograph = ref<Monograph>();
        const event = ref<Conference>();

        const { checkIdentifiers, message, snackbar } = useIdentifierCheck();

        const { languageTags } = useLanguageTags();

        onMounted(() => {
            updatePresetCommonFields();
            fetchDetails();
        });

        const fetchDetails = () => {
            if(props.presetMonographPublication?.monographId) {
                MonographService.readMonograph(props.presetMonographPublication.monographId).then((response) => {
                    monograph.value = response.data;
                    selectedMonograph.value = {title: returnCurrentLocaleContent(monograph.value.title) as string, value: monograph.value.id as number};
                });
            }
        };

        watch(() => props.presetMonographPublication, () => {
            if (props.presetMonographPublication) {
                refreshForm();
            }
        });

        const titleRef = ref<typeof MultilingualTextInput>();
        const subtitleRef = ref<typeof MultilingualTextInput>();
        const sectionRef = ref<typeof MultilingualTextInput>();
        const urisRef = ref<typeof UriInput>();

        const searchPlaceholderMonograph = {title: returnCurrentLocaleContent(monograph.value?.title) as string, value: monograph.value?.id as number};
        const selectedMonograph = ref<{ title: string, value: number }>(searchPlaceholderMonograph);

        const searchPlaceholderEvent = {title: returnCurrentLocaleContent(event.value?.name) as string, value: event.value?.id as number};
        const selectedEvent = ref<{ title: string, value: number }>(searchPlaceholderEvent);

        const title = ref<any>([]);
        const subtitle = ref<any>([]);
        const section = ref<any>([]);
        const startPage = ref(props.presetMonographPublication?.startPage);
        const endPage = ref(props.presetMonographPublication?.endPage);
        const publicationDate = ref(props.presetMonographPublication?.documentDate);
        const doi = ref(props.presetMonographPublication?.doi);
        const scopus = ref(props.presetMonographPublication?.scopusId);
        const openAlexId = ref(props.presetMonographPublication?.openAlexId);
        const webOfScienceId = ref(props.presetMonographPublication?.webOfScienceId);
        const articleNumber = ref(props.presetMonographPublication?.articleNumber);
        const numberOfPages = ref(props.presetMonographPublication?.numberOfPages);
        const uris = ref<string[]>(props.presetMonographPublication?.uris as string[]);

        const commonFieldsRef = ref<typeof DocumentCommonFields>();
        const commonFieldsData = ref<CommonFieldsData>({});
        const presetCommonFieldsData = ref<CommonFieldsData | undefined>(undefined);

        const {
            requiredFieldRules, requiredSelectionRules,
            doiValidationRules, scopusIdValidationRules,
            workOpenAlexIdValidationRules,
            documentWebOfScienceIdValidationRules,
            optionalNumericZeroOrGreaterFieldRules
        } = useValidationUtils();
        
        const publicationTypes = computed(() => getMonographPublicationTypesForGivenLocale());
        const selectedpublicationType = ref<{ title: string, value: MonographPublicationType | null }>({title: props.presetMonographPublication?.monographPublicationType ? getTitleFromValueAutoLocale(props.presetMonographPublication?.monographPublicationType as MonographPublicationType) as string : "", value: props.presetMonographPublication?.monographPublicationType as MonographPublicationType});

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
                    props.presetMonographPublication?.id as number,
                    (id, docId) => DocumentPublicationService.checkIdentifierUsage(id, docId)
                );

                if (duplicateFound) {
                    return;
                }
            }

            const updatedMonographPublication: MonographPublication = {
                title: title.value as MultilingualContent[],
                startPage: startPage.value as string,
                endPage: endPage.value as string,
                numberOfPages: numberOfPages.value as number,
                articleNumber: articleNumber.value as string,
                description: props.presetMonographPublication?.description as MultilingualContent[],
                keywords: props.presetMonographPublication?.keywords as MultilingualContent[],
                subTitle: subtitle.value as MultilingualContent[],
                uris: uris.value,
                contributions: props.presetMonographPublication?.contributions,
                documentDate: publicationDate.value,
                scopusId: scopus.value,
                doi: doi.value,
                openAlexId: openAlexId.value,
                webOfScienceId: webOfScienceId.value,
                monographId: selectedMonograph.value.value,
                eventId: selectedEvent.value.value,
                monographPublicationType: selectedpublicationType.value.value as MonographPublicationType,
                fileItems: [],
                proofs: [],
                section: section.value,
                ...commonFieldsData.value
            };

            emit("update", updatedMonographPublication);
        };

        const updatePresetCommonFields = () => {
            updateDocumentCommonFields(props.presetMonographPublication, presetCommonFieldsData);
        };

        const refreshForm = () => {
            titleRef.value?.clearInput();
            title.value = props.presetMonographPublication?.title as MultilingualContent[];

            subtitleRef.value?.clearInput();
            subtitle.value = props.presetMonographPublication?.subTitle as MultilingualContent[];

            sectionRef.value?.clearInput();
            section.value = props.presetMonographPublication?.section as MultilingualContent[];

            uris.value = props.presetMonographPublication?.uris as string[];
            startPage.value = props.presetMonographPublication?.startPage;
            endPage.value = props.presetMonographPublication?.endPage;
            numberOfPages.value = props.presetMonographPublication?.numberOfPages;
            publicationDate.value = props.presetMonographPublication?.documentDate;
            doi.value = props.presetMonographPublication?.doi;
            scopus.value = props.presetMonographPublication?.scopusId;
            openAlexId.value = props.presetMonographPublication?.openAlexId;
            webOfScienceId.value = props.presetMonographPublication?.webOfScienceId;
            articleNumber.value = props.presetMonographPublication?.articleNumber;

            updateDocumentCommonFields(props.presetMonographPublication, presetCommonFieldsData);

            selectedpublicationType.value = {title: props.presetMonographPublication?.monographPublicationType ? getTitleFromValueAutoLocale(props.presetMonographPublication?.monographPublicationType as MonographPublicationType) as string : "", value: props.presetMonographPublication?.monographPublicationType ? props.presetMonographPublication?.monographPublicationType as MonographPublicationType : null};

            titleRef.value?.forceRefreshModelValue(toMultilingualTextInput(title.value, languageTags.value));
            subtitleRef.value?.forceRefreshModelValue(toMultilingualTextInput(subtitle.value, languageTags.value));
            sectionRef.value?.forceRefreshModelValue(toMultilingualTextInput(section.value, languageTags.value));
            urisRef.value?.refreshModelValue(uris.value);

            if (commonFieldsRef.value && presetCommonFieldsData.value) {
                commonFieldsRef.value.refreshForm(presetCommonFieldsData.value);
            }

            fetchDetails();
        };

        return {
            isFormValid, snackbar, section, sectionRef,
            title, subtitle, message, doi, scopus,
            selectedMonograph, articleNumber,
            uris, numberOfPages, doiValidationRules,
            requiredFieldRules, selectedEvent,
            submit, toMultilingualTextInput, openAlexId,
            languageTags, startPage, endPage, refreshForm,
            publicationTypes, selectedpublicationType,
            scopusIdValidationRules, titleRef, subtitleRef,
            urisRef, requiredSelectionRules, webOfScienceId,
            workOpenAlexIdValidationRules, commonFieldsData,
            optionalNumericZeroOrGreaterFieldRules,
            documentWebOfScienceIdValidationRules,
            commonFieldsRef, presetCommonFieldsData
        };
    }
});
</script>
