<template>
    <v-form v-model="isFormValid" class="flex flex-col gap-6" @submit.prevent>
        <form-section
            icon="mdi-file-document-outline"
            :title="$t('publicationDetailsLabel')"
            :description="$t('journalPublicationDetailsHint')"
        >
            <i-d-f-metadata-prepopulator
                :document-type="PublicationType.JOURNAL_PUBLICATION"
                @metadata-fetched="popuateMetadata"
            />
            <journal-autocomplete-search
                ref="journalAutocompleteRef"
                v-model="selectedJournal"
                required
            />

            <div v-if="selectedJournal && selectedJournal.value > 0 && myPublications.length > 0">
                <p class="text-sm font-semibold text-slate-700">
                    {{ $t("recentPublicationsLabel") }}
                </p>
                <p
                    v-for="(publicationIndex, i) in myPublications"
                    :key="i"
                    class="text-sm text-slate-600"
                >
                    {{ $i18n.locale.startsWith("sr") ? publicationIndex.titleSr : publicationIndex.titleOther }}
                </p>
            </div>
            <p
                v-if="selectedJournal && selectedJournal.value != -1 && myPublications.length == 0 && isResearcher"
                class="text-sm text-slate-600"
            >
                {{ $t("noRecentPublicationsJournalLabel") }}
            </p>

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
                <ui-input v-model="volume" :label="$t('volumeLabel')" placeholder="e.g. 12" />
                <ui-input v-model="issue" :label="$t('issueLabel')" placeholder="e.g. 3" />
            </div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ui-input v-model="startPage" :label="$t('startPageLabel')" placeholder="e.g. 101" />
                <ui-input v-model="endPage" :label="$t('endPageLabel')" placeholder="e.g. 120" />
            </div>

            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p class="text-sm font-semibold text-slate-800">
                    {{ $t("publicationDateSectionLabel") }}
                </p>
                <p class="mb-3 text-sm text-slate-500">
                    {{ $t("publicationDateSectionHint") }}
                </p>
                <choice-cards
                    :model-value="disableYearInput ? 'unknown' : 'known'"
                    :options="[
                        { value: 'known', title: $t('knownDateLabel'), description: $t('knownDateHint') },
                        { value: 'unknown', title: $t('dateUnknownLabel'), description: $t('dateUnknownHint') },
                    ]"
                    @update:model-value="disableYearInput = $event === 'unknown'"
                />
                <flexible-date-picker
                    v-if="!disableYearInput"
                    v-model="publicationDate"
                    class="mt-4"
                    :label="$t('yearLabel') + '*'"
                    required
                />
            </div>

            <ui-input
                v-model="selectedpublicationType"
                control="select"
                :items="publicationTypes"
                :label="$t('concretePublicationTypeLabel')"
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
                <multilingual-text-input ref="subtitleRef" v-model="subtitle" :label="$t('subtitleLabel')" />
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ui-input v-model="articleNumber" :label="$t('articleNumberLabel')" />
                    <ui-input
                        v-model="numberOfPages"
                        type="number"
                        :min="0"
                        :label="$t('numberOfPagesLabel')"
                        :rules="optionalNumericZeroOrGreaterFieldRules"
                    />
                </div>
                <multilingual-text-input ref="descriptionRef" v-model="description" is-area :label="$t('abstractLabel')" />
                <multilingual-text-input ref="keywordsRef" v-model="keywords" :label="$t('keywordsLabel')" is-area />
                <multilingual-text-input ref="sectionRef" v-model="section" :label="$t('sectionLabel')" />
                <uri-input ref="urisRef" v-model="uris" />
                <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <ui-input v-model="scopus" label="Scopus ID" :rules="scopusIdValidationRules" />
                    <ui-input v-model="openAlexId" label="Open Alex ID" :rules="workOpenAlexIdValidationRules" />
                    <ui-input v-model="webOfScienceId" label="Web of Science ID" :rules="documentWebOfScienceIdValidationRules" />
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
import JournalAutocompleteSearch from '../journal/JournalAutocompleteSearch.vue';
import { type CommonFieldsData, type DocumentPublicationIndex, type JournalPublication, JournalPublicationType, type PersonDocumentContribution, PublicationType } from "@/models/PublicationModel";
import DocumentPublicationService from "@/services/DocumentPublicationService";
import UriInput from '../core/UriInput.vue';
import PersonPublicationContribution from './PersonPublicationContribution.vue';
import { watch } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import type { AxiosError } from 'axios';
import type { ErrorResponse, FlexibleDate, PrepopulatedMetadata } from '@/models/Common';
import { getTitleFromValueAutoLocale, getTypesForGivenLocale } from '@/i18n/journalPublicationType';
import Toast from '../core/Toast.vue';
import { useUserRole } from '@/composables/useUserRole';
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import IDFMetadataPrepopulator from '../core/IDFMetadataPrepopulator.vue';
import { useLanguageTags } from '@/composables/useLanguageTags';
import PublicationDeduplicationTable from './PublicationDeduplicationTable.vue';
import DocumentCommonFields from './DocumentCommonFields.vue';
import FlexibleDatePicker from '../core/FlexibleDatePicker.vue';
import FormSection from '@/components/ui/form-section/FormSection.vue';
import ChoiceCards from '@/components/ui/choice-cards/ChoiceCards.vue';
import UiInput from '@/components/ui/input/Input.vue';
import { UiButton } from '@/components/ui/button';


export default defineComponent({
    name: "SubmitJournalPublication",
    components: { MultilingualTextInput, UriInput, PersonPublicationContribution, JournalAutocompleteSearch, Toast, IDFMetadataPrepopulator, PublicationDeduplicationTable, DocumentCommonFields, FlexibleDatePicker, FormSection, ChoiceCards, UiInput, UiButton },
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
        const contributionsRef = ref<typeof PersonPublicationContribution>();
        const urisRef = ref<typeof UriInput>();
        const deduplicationTableRef = ref<typeof PublicationDeduplicationTable>();

        const journalAutocompleteRef = ref<typeof JournalAutocompleteSearch>();

        const searchPlaceholder = {title: "", value: -1};
        const selectedJournal = ref<{ title: string, value: number }>(searchPlaceholder);

        const myPublications = ref<DocumentPublicationIndex[]>([]);

        const { languageTags } = useLanguageTags();

        const title = ref<any[]>([]);
        const subtitle = ref([]);
        const description = ref([]);
        const keywords = ref<any[]>([]);
        const section = ref<any[]>([]);
        const contributions = ref<PersonDocumentContribution[]>([]);
        const volume = ref("");
        const issue = ref("");
        const startPage = ref("");
        const endPage = ref("");
        const publicationDate = ref<FlexibleDate>();
        const doi = ref("");
        const scopus = ref("");
        const openAlexId = ref("");
        const webOfScienceId = ref("");
        const articleNumber = ref("");
        const numberOfPages = ref();
        const uris = ref<string[]>([]);

        const disableYearInput = ref(false);

        const i18n = useI18n();
        const errorMessage = ref(i18n.t("genericErrorMessage"));

        const commonFieldsRef = ref<typeof DocumentCommonFields>();
        const commonFieldsData = ref<CommonFieldsData>({});
        const presetCommonFieldsData = ref<CommonFieldsData | undefined>(undefined);

        const {
            requiredFieldRules, doiValidationRules,
            scopusIdValidationRules, workOpenAlexIdValidationRules,
            documentWebOfScienceIdValidationRules,
            optionalNumericZeroOrGreaterFieldRules
        } = useValidationUtils();

        const publicationTypes = computed(() => getTypesForGivenLocale());
        const selectedpublicationType = ref<{ title: string, value: JournalPublicationType | null }>(
            {
                title: getTitleFromValueAutoLocale(JournalPublicationType.RESEARCH_ARTICLE) as string,
                value: JournalPublicationType.RESEARCH_ARTICLE
            }
        );

        const listPublications = (journal: { title: string, value: number }) => {
            if (journal.value > 0) {
                DocumentPublicationService.findMyPublicationsInJournal(journal.value).then((response) => {
                    myPublications.value = response.data;
                });
            }
        };

        const { isResearcher } = useUserRole();

        watch(selectedJournal, (newValue) => {
            if (newValue && isResearcher.value) {
                listPublications(newValue);
            }
        });

        const popuateMetadata = async (metadata: PrepopulatedMetadata) => {
            if (title.value.length === 0) {
                title.value = metadata.title;
                titleRef.value?.forceRefreshModelValue(toMultilingualTextInput(title.value, languageTags.value));
            }
            
            volume.value = volume.value ? volume.value : metadata.volume;
            issue.value = issue.value ? issue.value : metadata.issue;
            startPage.value = startPage.value ? startPage.value : metadata.startPage;
            endPage.value = endPage.value ? endPage.value : metadata.endPage;
            uris.value.push(metadata.url);
            doi.value = doi.value ? doi.value : metadata.doi;
            
            if (metadata.year > 0) {
                publicationDate.value = { year: metadata.year };
            }

            if (metadata.publishedInName && selectedJournal.value.value <= 0) {
                selectedJournal.value = {title: metadata.publishedInName, value: metadata.publishEntityId};
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

        const submit = () => {
            submitJournalPublication(true);
        };

        const submitJournalPublication = (stayOnPage: boolean) => {
            const newJournalPublication: JournalPublication = {
                title: title.value,
                articleNumber: articleNumber.value,
                description: description.value,
                endPage: endPage.value,
                issue: issue.value,
                journalId: selectedJournal.value.value,
                journalPublicationType: selectedpublicationType.value.value as JournalPublicationType,
                keywords: keywords.value,
                numberOfPages: numberOfPages.value,
                startPage: startPage.value,
                subTitle: subtitle.value,
                uris: uris.value,
                volume: volume.value,
                contributions: contributions.value,
                documentDate: disableYearInput.value ? undefined : publicationDate.value,
                scopusId: scopus.value,
                openAlexId: openAlexId.value,
                webOfScienceId: webOfScienceId.value,
                doi: doi.value,
                fileItems: [],
                proofs: [],
                section: section.value,
                ...commonFieldsData.value
            };

            DocumentPublicationService.createJournalPublication(
                newJournalPublication
            ).then((response) => {
                emit("create", response.data);

                if (stayOnPage) {
                    titleRef.value?.clearInput();
                    subtitleRef.value?.clearInput();
                    descriptionRef.value?.clearInput();
                    keywordsRef.value?.clearInput();
                    sectionRef.value?.clearInput();
                    urisRef.value?.clearInput();
                    journalAutocompleteRef.value?.clearInput();
                    selectedpublicationType.value = {title: "", value: null};
                    volume.value = "";
                    issue.value = "";
                    startPage.value = "";
                    endPage.value = "";
                    publicationDate.value = undefined;
                    doi.value = "";
                    scopus.value = "";
                    openAlexId.value = "";
                    webOfScienceId.value = "";
                    articleNumber.value = "";
                    numberOfPages.value = null;
                    contributionsRef.value?.clearInput();
                    deduplicationTableRef.value?.resetTable();
                    commonFieldsRef.value?.clearInputs();
                    commonFieldsData.value = {};

                    error.value = false;
                    snackbar.value = true;
                } else {
                    router.push({ name: "journalPublicationLandingPage", params: {id: response.data.id} });
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
            isFormValid, subtitleRef, openAlexId, workOpenAlexIdValidationRules,
            additionalFields, snackbar, error, title, titleRef, subtitle,
            volume, issue, startPage, endPage, publicationDate, doi, scopus,
            articleNumber, numberOfPages, description, descriptionRef,
            keywords, keywordsRef, isResearcher, uris, urisRef, doiValidationRules,
            selectedJournal, journalAutocompleteRef, myPublications, submit,
            publicationTypes, selectedpublicationType, listPublications,
            contributions, contributionsRef, scopusIdValidationRules,
            requiredFieldRules, submitJournalPublication, errorMessage,
            popuateMetadata, PublicationType, documentWebOfScienceIdValidationRules,
            webOfScienceId, optionalNumericZeroOrGreaterFieldRules, disableYearInput,
            deduplicationTableRef, commonFieldsData, presetCommonFieldsData,
            commonFieldsRef, section, sectionRef
        };
    }
});
</script>
