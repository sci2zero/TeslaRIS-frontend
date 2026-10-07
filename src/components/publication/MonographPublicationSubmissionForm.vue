<template>
    <v-form v-model="isFormValid" class="flex flex-col gap-6" @submit.prevent>
        <form-section
            icon="mdi-file-document-outline"
            :title="$t('publicationDetailsLabel')"
        >
            <i-d-f-metadata-prepopulator
                :document-type="PublicationType.MONOGRAPH_PUBLICATION"
                @metadata-fetched="popuateMetadata"
            />
            <monograph-autocomplete-search
                ref="eventAutocompleteRef"
                v-model="selectedMonograph"
                required
                only-books
            />
            <div v-if="selectedMonograph && selectedMonograph.value != -1 && myPublications.length > 0">
                <p class="text-sm font-semibold text-slate-700">
                    {{ $t("recentPublicationsLabel") }}
                </p>
                <p
                    v-for="(publicationIndex, i) in myPublications"
                    :key="i"
                    :value="publicationIndex"
                    class="text-sm text-slate-600"
                >
                    {{ $i18n.locale.startsWith("sr") ? publicationIndex.titleSr : publicationIndex.titleOther }}
                </p>
            </div>
            <p
                v-if="selectedMonograph && selectedMonograph.value > 0 && myPublications.length == 0 && isResearcher"
                class="text-sm text-slate-600"
            >
                {{ $t("noRecentPublicationsMonographLabel") }}
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
                <ui-input v-model="startPage" :label="$t('startPageLabel')" :placeholder="$t('startPageLabel')" />
                <ui-input v-model="endPage" :label="$t('endPageLabel')" :placeholder="$t('endPageLabel')" />
            </div>
            <ui-input
                v-model="selectedpublicationType"
                control="select"
                :items="publicationTypes"
                :label="$t('concretePublicationTypeLabel') + '*'"
                :rules="requiredSelectionRules"
                return-object />
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
                        v-model="numberOfPages" type="number"
                        :min="0" :label="$t('numberOfPagesLabel')"
                        :rules="optionalNumericZeroOrGreaterFieldRules"
                        :placeholder="$t('numberOfPagesLabel')"
                    />
                </div>
                <multilingual-text-input ref="descriptionRef" v-model="description" is-area :label="$t('abstractLabel')" />
                <multilingual-text-input ref="keywordsRef" v-model="keywords" :label="$t('keywordsLabel')" is-area />
                <multilingual-text-input
                    ref="sectionRef"
                    v-model="section"
                    :label="$t('sectionLabel')"
                />
                <uri-input ref="urisRef" v-model="uris" />
                <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <ui-input
                        v-model="scopus"
                        label="Scopus ID"
                        placeholder="Scopus ID"
                        :rules="scopusIdValidationRules" />
                    <ui-input
                        v-model="openAlexId"
                        label="Open Alex ID"
                        placeholder="Open Alex ID"
                        :rules="workOpenAlexIdValidationRules" />
                    <ui-input
                        v-model="webOfScienceId"
                        label="Web of Science ID"
                        placeholder="Web of Science ID"
                        :rules="documentWebOfScienceIdValidationRules" />
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
import { MonographPublicationType, PublicationType, type DocumentPublicationIndex } from "@/models/PublicationModel";
import UriInput from '../core/UriInput.vue';
import PersonPublicationContribution from './PersonPublicationContribution.vue';
import { watch } from 'vue';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import type { CommonFieldsData, MonographPublication, PersonDocumentContribution } from "@/models/PublicationModel";
import { useValidationUtils } from '@/utils/ValidationUtils';
import { getMonographPublicationTypesForGivenLocale, getTitleFromValueAutoLocale } from "@/i18n/monographPublicationType";
import type { ErrorResponse, PrepopulatedMetadata } from '@/models/Common';
import type { AxiosError } from 'axios';
import MonographAutocompleteSearch from './MonographAutocompleteSearch.vue';
import Toast from '../core/Toast.vue';
import { useUserRole } from '@/composables/useUserRole';
import IDFMetadataPrepopulator from '../core/IDFMetadataPrepopulator.vue';
import { useLanguageTags } from '@/composables/useLanguageTags';
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import PublicationDeduplicationTable from './PublicationDeduplicationTable.vue';
import DocumentCommonFields from './DocumentCommonFields.vue';


import UiInput from '@/components/ui/input/Input.vue';
import FormSection from '@/components/ui/form-section/FormSection.vue';
import { UiButton } from '@/components/ui/button';

export default defineComponent({
    name: "SubmitMonographPublication",
    components: {MultilingualTextInput, UriInput, PersonPublicationContribution, MonographAutocompleteSearch, Toast, IDFMetadataPrepopulator, PublicationDeduplicationTable, DocumentCommonFields, UiInput, FormSection, UiButton},
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

        const monographAutocompleteRef = ref<typeof MonographAutocompleteSearch>();

        const searchPlaceholder = {title: "", value: -1};

        const myPublications = ref<DocumentPublicationIndex[]>([]);

        const title = ref<any[]>([]);
        const subtitle = ref([]);
        const description = ref([]);
        const keywords = ref<any[]>([]);
        const section = ref<any[]>([]);
        const contributions = ref<PersonDocumentContribution[]>([]);
        const availableMonograph = ref<{title: string, value: number}[]>([]);
        const selectedMonograph = ref(searchPlaceholder);
        const startPage = ref("");
        const endPage = ref("");
        const doi = ref("");
        const scopus = ref("");
        const openAlexId = ref("");
        const webOfScienceId = ref("");
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

        const publicationTypes = computed((): { title: string, value: MonographPublicationType | null }[] => (getMonographPublicationTypesForGivenLocale() as { title: string; value: MonographPublicationType; }[]));
        const selectedpublicationType = ref<{ title: string, value: MonographPublicationType | null }>(
            {
                title: getTitleFromValueAutoLocale(MonographPublicationType.RESEARCH_ARTICLE) as string,
                value: MonographPublicationType.RESEARCH_ARTICLE
            }
        );

        const listPublications = (monograph: { title: string, value: number }) => {
            if (monograph.value > 0) {
                DocumentPublicationService.findMyPublicationsInMonograph(monograph.value).then((response) => {
                myPublications.value = response.data;
            });
            }
        };

        const { isResearcher } = useUserRole();

        watch(selectedMonograph, (newValue) => {
            if (newValue && isResearcher.value) {
                listPublications(newValue);
            }
        });

        const submit = () => {
            submitMonographPublication(true);
        };

        const submitMonographPublication = (stayOnPage: boolean) => {
            const newMonographPublication: MonographPublication = {
                articleNumber: articleNumber.value,
                description: description.value,
                endPage: endPage.value,
                keywords: keywords.value,
                numberOfPages: numberOfPages.value,
                monographId: selectedMonograph.value.value,
                monographPublicationType: selectedpublicationType.value.value as MonographPublicationType,
                startPage: startPage.value,
                subTitle: subtitle.value,
                title: title.value,
                uris: uris.value,
                contributions: contributions.value,
                doi: doi.value,
                openAlexId: openAlexId.value,
                webOfScienceId: webOfScienceId.value,
                scopusId: scopus.value,
                fileItems: [],
                proofs: [],
                section: section.value,
                ...commonFieldsData.value
            };

            DocumentPublicationService.createMonographPublication(
                newMonographPublication
            ).then((response) => {
                emit("create", response.data);

                if (stayOnPage) {
                    titleRef.value?.clearInput();
                    subtitleRef.value?.clearInput();
                    descriptionRef.value?.clearInput();
                    keywordsRef.value?.clearInput();
                    sectionRef.value?.clearInput();
                    urisRef.value?.clearInput();
                    monographAutocompleteRef.value?.clearInput();
                    availableMonograph.value = [];
                    selectedMonograph.value = searchPlaceholder;
                    selectedpublicationType.value = {title: "", value: null};
                    startPage.value = "";
                    endPage.value = "";
                    doi.value = "";
                    scopus.value = "";
                    openAlexId.value = "";
                    articleNumber.value = "";
                    webOfScienceId.value = "";
                    numberOfPages.value = null;
                    contributionsRef.value?.clearInput();
                    deduplicationTableRef.value?.resetTable();
                    commonFieldsRef.value?.clearInputs();
                    commonFieldsData.value = {};

                    error.value = false;
                    snackbar.value = true;
                } else {
                    router.push({ name: "monographPublicationLandingPage", params: {id: response.data.id} });
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
            
            startPage.value = startPage.value ? startPage.value : metadata.startPage;
            endPage.value = endPage.value ? endPage.value : metadata.endPage;
            uris.value.push(metadata.url);
            doi.value = doi.value ? doi.value : metadata.doi;

            if (metadata.publishedInName && selectedMonograph.value.value <= 0) {
                selectedMonograph.value = {title: metadata.publishedInName, value: metadata.publishEntityId};
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
            snackbar, error, title, titleRef, deduplicationTableRef,
            subtitle, subtitleRef, startPage, endPage, submit,
            doi, scopus, articleNumber, numberOfPages, PublicationType,
            description, descriptionRef, keywords, keywordsRef,
            uris, urisRef, myPublications, doiValidationRules, openAlexId,
            selectedMonograph, monographAutocompleteRef, listPublications,
            publicationTypes, selectedpublicationType, isResearcher, webOfScienceId,
            contributions, contributionsRef, scopusIdValidationRules, popuateMetadata,
            requiredFieldRules, requiredSelectionRules, submitMonographPublication,
            availableMonograph, errorMessage, workOpenAlexIdValidationRules,
            documentWebOfScienceIdValidationRules, optionalNumericZeroOrGreaterFieldRules,
            commonFieldsRef, commonFieldsData, presetCommonFieldsData, section, sectionRef
        };
    }
});
</script>


<style scoped>

.monograph-submission {
    margin-top: 15px;
}

</style>
