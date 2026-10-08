<template>
    <v-form v-model="isFormValid" class="flex flex-col gap-6" @submit.prevent>
        <form-section
            icon="mdi-file-document-outline"
            :title="$t('publicationDetailsLabel')"
        >
            <i-d-f-metadata-prepopulator
                :document-type="PublicationType.PROCEEDINGS_PUBLICATION"
                @metadata-fetched="popuateMetadata"
            />
            <event-autocomplete-search ref="eventAutocompleteRef" v-model="selectedEvent" required />
            <div v-if="selectedEvent && selectedEvent.value != -1 && myPublications.length > 0">
                <p class="text-sm font-semibold text-slate-700">
                    {{ $t("recentPublicationsLabel") }}
                </p>
                <p
                    v-for="(publication) in myPublications"
                    :key="publication.id"
                    class="text-sm text-slate-600"
                >
                    {{ returnCurrentLocaleContent(publication.title) + ` ${$t("inLabel")} ` + returnCurrentLocaleContent(publication.proceedingsTitle) }}
                </p>
            </div>
            <p
                v-if="selectedEvent && selectedEvent.value > 0 && myPublications.length == 0 && isResearcher"
                class="text-sm text-slate-600"
            >
                {{ $t("noRecentPublicationsConferenceLabel") }}
            </p>
            <div class="flex items-end gap-2">
                <ui-input
                    v-model="selectedProceedings"
                    class="min-w-0 flex-1"
                    control="select"
                    :items="availableProceedings"
                    :label="$t('proceedingsLabel') + '*'"
                    :no-data-text="(selectedEvent && selectedEvent.value === -1) ? $t('selectConferenceMessage') : $t('noAvailableProceedingsMessage')"
                    :rules="requiredSelectionRules"
                    return-object
                />
                <generic-crud-modal
                    class="mb-0.5 w-fit shrink-0"
                    :form-component="ProceedingsSubmissionForm"
                    :form-props="{
                        conference: selectedEvent ? selectedEvent : searchPlaceholder,
                        presetName: `Proceedings of: ${selectedEvent.title.split('|')[0].trim()}`
                    }"
                    entity-name="Proceedings"
                    is-submission
                    :read-only="!selectedEvent || selectedEvent.value === -1"
                    @create="selectNewlyAddedProceedings"
                />
            </div>
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
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ui-input v-model="startPage" :label="$t('startPageLabel')" :placeholder="$t('startPageLabel')" />
                <ui-input v-model="endPage" :label="$t('endPageLabel')" :placeholder="$t('endPageLabel')" />
            </div>
            <ui-input
                v-model="selectedpublicationType"
                control="select"
                :items="publicationTypes"
                :label="$t('concretePublicationTypeLabel') + '*'"
                :rules="requiredSelectionRules"
                return-object
            />
        </form-section>

        <form-section
            icon="mdi-account-multiple-outline"
            :title="$t('authorsLabel')"
            :description="$t('contributionAccordionHint')"
        >
            <person-publication-contribution ref="contributionsRef" basic @set-input="contributions = $event" />
        </form-section>

        <form-section :title="$t('additionalFieldsLabel')">
            <ui-button variant="outline" type="button" @click="additionalFields = !additionalFields">
                {{ $t("additionalFieldsLabel") }} {{ additionalFields ? "▲" : "▼" }}
            </ui-button>
            <template v-if="additionalFields">
                <multilingual-text-input ref="subtitleRef" v-model="subtitle" :label="$t('subtitleLabel')" />
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ui-input v-model="articleNumber" :label="$t('articleNumberLabel')" :placeholder="$t('articleNumberLabel')" />
                    <ui-input
                        v-model="numberOfPages"
                        type="number"
                        :min="0"
                        :label="$t('numberOfPagesLabel')"
                        :rules="optionalNumericZeroOrGreaterFieldRules"
                        :placeholder="$t('numberOfPagesLabel')"
                    />
                </div>
                <multilingual-text-input ref="descriptionRef" v-model="description" is-area :label="$t('abstractLabel')" />
                <multilingual-text-input ref="keywordsRef" v-model="keywords" :label="$t('keywordsLabel')" is-area />
                <multilingual-text-input ref="sectionRef" v-model="section" :label="$t('sectionLabel')" />
                <uri-input ref="urisRef" v-model="uris" />
                <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <ui-input v-model="scopus" label="Scopus ID" placeholder="Scopus ID" :rules="scopusIdValidationRules" />
                    <ui-input v-model="openAlexId" label="Open Alex ID" placeholder="Open Alex ID" :rules="workOpenAlexIdValidationRules" />
                    <ui-input v-model="webOfScienceId" label="Web of Science ID" placeholder="Web of Science ID" :rules="documentWebOfScienceIdValidationRules" />
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
import { defineComponent, nextTick } from 'vue';
import MultilingualTextInput from '../core/MultilingualTextInput.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import EventAutocompleteSearch from '../event/EventAutocompleteSearch.vue';
import { PublicationType, type ProceedingsPublicationResponse, type ProceedingsPublicationType } from "@/models/PublicationModel";
import UriInput from '../core/UriInput.vue';
import PersonPublicationContribution from './PersonPublicationContribution.vue';
import { watch } from 'vue';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import type { CommonFieldsData, PersonDocumentContribution, ProceedingsPublication } from "@/models/PublicationModel";
import ProceedingsService from '@/services/ProceedingsService';
import type { Proceedings, ProceedingsResponse } from '@/models/ProceedingsModel';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { getTypesForGivenLocale } from "@/i18n/proceedingsPublicationType";
import type { ErrorResponse, PrepopulatedMetadata } from '@/models/Common';
import type { AxiosError } from 'axios';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import Toast from '../core/Toast.vue';
import GenericCrudModal from '../core/GenericCrudModal.vue';
import ProceedingsSubmissionForm from '../proceedings/ProceedingsSubmissionForm.vue';
import { useUserRole } from '@/composables/useUserRole';
import IDFMetadataPrepopulator from '../core/IDFMetadataPrepopulator.vue';
import { useLanguageTags } from '@/composables/useLanguageTags';
import PublicationDeduplicationTable from './PublicationDeduplicationTable.vue';
import DocumentCommonFields from './DocumentCommonFields.vue';
import { localiseFlexibleDate } from '@/utils/DateUtil.js';


import UiInput from '@/components/ui/input/Input.vue';
import FormSection from '@/components/ui/form-section/FormSection.vue';
import { UiButton } from '@/components/ui/button';

export default defineComponent({
    name: "SubmitProceedingsPublication",
    components: {MultilingualTextInput, UriInput, PersonPublicationContribution, EventAutocompleteSearch, GenericCrudModal, Toast, IDFMetadataPrepopulator, PublicationDeduplicationTable, DocumentCommonFields, UiInput, FormSection, UiButton},
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

        const titleRef = ref<typeof MultilingualTextInput>();
        const subtitleRef = ref<typeof MultilingualTextInput>();
        const descriptionRef = ref<typeof MultilingualTextInput>();
        const keywordsRef = ref<typeof MultilingualTextInput>();
        const sectionRef = ref<typeof MultilingualTextInput>();
        const placeRef = ref<typeof MultilingualTextInput>();
        const contributionsRef = ref<typeof PersonPublicationContribution>();
        const urisRef = ref<typeof UriInput>();
        const deduplicationTableRef = ref<typeof PublicationDeduplicationTable>();

        const eventAutocompleteRef = ref<typeof EventAutocompleteSearch>();

        const searchPlaceholder = {title: "", value: -1};
        const selectedEvent = ref<{ title: string, value: number }>(searchPlaceholder);

        const myPublications = ref<ProceedingsPublicationResponse[]>([]);

        const title = ref<any[]>([]);
        const subtitle = ref([]);
        const description = ref([]);
        const keywords = ref<any[]>([]);
        const section = ref([]);
        const contributions = ref<PersonDocumentContribution[]>([]);
        const availableProceedings = ref<{title: string, value: number}[]>([]);
        const selectedProceedings = ref(searchPlaceholder);
        const startPage = ref("");
        const endPage = ref("");
        const doi = ref("");
        const openAlexId = ref("");
        const webOfScienceId = ref("");
        const scopus = ref("");
        const articleNumber = ref("");
        const numberOfPages = ref();
        const uris = ref<string[]>([]);

        const i18n = useI18n();
        const errorMessage = ref(i18n.t("genericErrorMessage"));

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

        const publicationTypes = computed(
            (): { title: string, value: ProceedingsPublicationType | null }[] => (
                getTypesForGivenLocale() as { title: string; value: ProceedingsPublicationType; }[]
            )
        );
        const selectedpublicationType = ref<{ title: string, value: ProceedingsPublicationType | null }>(
            {title: "", value: null}
        );

        const listPublications = (event: { title: string, value: number }) => {
            if (event.value > 0) {
                DocumentPublicationService.findMyPublicationsInEvent(event.value).then((response) => {
                    myPublications.value = response.data;
                });
            }
        };

        const fetchProceedings = (event: { title: string, value: number }) => {
            if (event.value <= 0) {
                return;
            }

            ProceedingsService.readProceedingsForEvent(event.value).then((response) => {
                response.data.forEach((proceedingsResponse: ProceedingsResponse) => {
                    let title: string | undefined;
                    proceedingsResponse.title.forEach(multilingualContent => {
                        if(multilingualContent.languageTag === i18n.locale.value.toUpperCase()) {
                            title = multilingualContent.content;
                            return;
                        }
                    });
                    if (!title && proceedingsResponse.title.length > 0) {
                        title = proceedingsResponse.title[0].content;
                    }

                    if (proceedingsResponse.documentDate) {
                        availableProceedings.value.push({title: `${title} | ${localiseFlexibleDate(proceedingsResponse.documentDate)}`, value: proceedingsResponse.id as number });
                    } else {
                        availableProceedings.value.push({title: title as string, value: proceedingsResponse.id as number });
                    }
                });
            });
        };

        const { isResearcher } = useUserRole();

        watch(selectedEvent, (newValue) => {
            if (newValue) {
                if (isResearcher.value) {
                    listPublications(newValue);
                }
                availableProceedings.value = [];
                selectedProceedings.value = searchPlaceholder;
                fetchProceedings(newValue);
            }
        });

        const { languageTags } = useLanguageTags();
        const popuateMetadata = async (metadata: PrepopulatedMetadata) => {
            if (title.value.length === 0) {
                title.value = metadata.title;
                titleRef.value?.forceRefreshModelValue(toMultilingualTextInput(title.value, languageTags.value));
            }
            
            startPage.value = startPage.value ? startPage.value : metadata.startPage;
            endPage.value = endPage.value ? endPage.value : metadata.endPage;
            uris.value.push(metadata.url);
            doi.value = doi.value ? doi.value : metadata.doi;

            if (metadata.publishedInName && selectedEvent.value.value <= 0) {
                selectedEvent.value = {title: metadata.publishedInName, value: metadata.publishEntityId};
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

        const selectNewlyAddedProceedings = (proceedings: Proceedings) => {
            let title: string | undefined;
            proceedings.title.forEach(multilingualContent => {
                if(multilingualContent.languageTag === i18n.locale.value.toUpperCase()) {
                    title = multilingualContent.content;
                    return;
                }
            });
            if (!title && proceedings.title.length > 0) {
                title = proceedings.title[0].content;
            }
            const toSelect = {title: `${title} | ${localiseFlexibleDate(proceedings.documentDate)}`, value: proceedings.id as number};
            availableProceedings.value.push(toSelect);
            selectedProceedings.value = toSelect;
        };

        const submit = () => {
            submitProceedingsPublication(true);
        };

        const submitProceedingsPublication = (stayOnPage: boolean) => {
            const newProceedingsPublication: ProceedingsPublication = {
                articleNumber: articleNumber.value,
                description: description.value,
                endPage: endPage.value,
                keywords: keywords.value,
                numberOfPages: numberOfPages.value,
                proceedingsId: selectedProceedings.value.value,
                proceedingsPublicationType: selectedpublicationType.value.value as ProceedingsPublicationType,
                startPage: startPage.value,
                subTitle: subtitle.value,
                title: title.value,
                uris: uris.value,
                contributions: contributions.value,
                doi: doi.value,
                openAlexId: openAlexId.value,
                webOfScienceId: webOfScienceId.value,
                scopusId: scopus.value,
                eventId: selectedEvent.value.value,
                fileItems: [],
                proofs: [],
                section: section.value,
                ...commonFieldsData.value
            };

            DocumentPublicationService.createProceedingsPublication(
                newProceedingsPublication
            ).then((response) => {
                emit("create", response.data);

                if (stayOnPage) {
                    titleRef.value?.clearInput();
                    subtitleRef.value?.clearInput();
                    descriptionRef.value?.clearInput();
                    keywordsRef.value?.clearInput();
                    placeRef.value?.clearInput();
                    urisRef.value?.clearInput();
                    sectionRef.value?.clearInput();
                    eventAutocompleteRef.value!.clearInput();
                    availableProceedings.value = [];
                    selectedProceedings.value = searchPlaceholder;
                    selectedpublicationType.value = {title: "", value: null};
                    startPage.value = "";
                    endPage.value = "";
                    doi.value = "";
                    openAlexId.value = "";
                    webOfScienceId.value = "";
                    scopus.value = "";
                    articleNumber.value = "";
                    numberOfPages.value = null;
                    myPublications.value = [];
                    contributionsRef.value?.clearInput();
                    deduplicationTableRef.value?.resetTable();
                    commonFieldsRef.value?.clearInputs();
                    commonFieldsData.value = {};

                    error.value = false;
                    snackbar.value = true;
                } else {
                    router.push({ name: "proceedingsPublicationLandingPage", params: {id: response.data.id} });
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

        return {
            isFormValid, additionalFields, snackbar, error, title,
            subtitle, subtitleRef, startPage, endPage, doi, scopus,
            articleNumber, numberOfPages, description, descriptionRef,
            keywords, keywordsRef, placeRef, uris, urisRef, titleRef,
            myPublications, doiValidationRules, selectNewlyAddedProceedings,
            selectedEvent, eventAutocompleteRef, listPublications, PublicationType,
            publicationTypes, selectedpublicationType, errorMessage, openAlexId,
            contributions, contributionsRef, scopusIdValidationRules, isResearcher,
            requiredFieldRules, requiredSelectionRules, submitProceedingsPublication,
            availableProceedings, selectedProceedings, returnCurrentLocaleContent,
            searchPlaceholder, ProceedingsSubmissionForm, workOpenAlexIdValidationRules,
            popuateMetadata, documentWebOfScienceIdValidationRules, webOfScienceId,
            optionalNumericZeroOrGreaterFieldRules, deduplicationTableRef, submit,
            commonFieldsRef, commonFieldsData, presetCommonFieldsData, section,
            sectionRef
        };
    }
});
</script>
