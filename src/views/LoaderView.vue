<template>
    <v-row
        v-if="isAdmin"
        class="d-flex flex-row justify-center"
    >
        <v-col cols="8">
            <organisation-unit-autocomplete-search
                v-model:model-value="selectedOrganisationUnit"
                required
                disable-submission
                only-harvestable-institutions
            ></organisation-unit-autocomplete-search>
        </v-col>
    </v-row>
    <v-container v-if="!noRecordsRemaining">
        <h1>{{ $t("currentlyLoadingLabel") }}: {{ returnCurrentLocaleContent(currentLoadRecord?.title) }}</h1>
        <h3>{{ $t("dateOfPublicationLabel") }}: {{ localiseDate(currentLoadRecord?.documentDate) }}</h3>

        <deduplicator :publication-for-loading="currentLoadRecord" @deduplicate="deduplicate"></deduplicator>

        <br />
        
        <v-btn class="load-action mb-5" @click="skipDocument">
            {{ $t('skipDocumentLabel') }}
        </v-btn>
        <v-btn class="load-action mb-5 same-line" :disabled="stepperValue === steps.length" @click="toggleSmartLoading">
            {{ smartLoading ? $t('turnOffSmartImportLabel') : $t('turnOnSmartImportLabel') }}
        </v-btn>
        
        <v-btn icon variant="plain">
            <v-icon>mdi-information-variant</v-icon>
            <v-tooltip
                activator="parent"
                location="bottom"
            >
                {{ $t('smartImportTooltip') }}
            </v-tooltip>
        </v-btn>

        <v-stepper
            v-model="stepperValue" :items="steps"
            :next-text="$t('nextLabel')"
            :prev-text="$t('previousLabel')">
            <template v-for="(contribution, index) in currentLoadRecord?.contributions" :key="contribution.key" #[`item.${index+1}`]>
                <import-author
                    :ref="(el) => (importAuthorsRef[index] = el)"
                    :person-for-loading="contribution.person"
                    :institutions-for-loading="contribution.institutions"
                    :top-level-institution-id="selectedOrganisationUnit.value"
                    @user-action-complete="resumeImport">
                </import-author>
            </template>

            <template #[`item.${steps.length-1}`]>
                <import-journal
                    v-if="loadingJournalPublication"
                    ref="journalImportRef"
                    :publication-for-loading="(currentLoadRecord as JournalPublicationLoad)"
                    :top-level-institution-id="selectedOrganisationUnit.value"
                    @user-action-complete="resumeImport">
                </import-journal>
                
                <import-proceedings
                    v-if="loadingProceedingsPublication"
                    ref="proceedingsImportRef"
                    :publication-for-loading="(currentLoadRecord as ProceedingsPublicationLoad)"
                    :top-level-institution-id="selectedOrganisationUnit.value"
                    @user-action-complete="resumeImport">
                </import-proceedings>
            </template>

            <template #[`item.${steps.length}`]>
                <import-journal-publication-details
                    v-if="loadingJournalPublication"
                    ref="journalPublicationDetailsRef"
                    :preset-metadata="(currentLoadRecord as JournalPublicationLoad)"
                    @update="updateRecord">
                </import-journal-publication-details>
                
                <import-proceedings-publication-details
                    v-if="loadingProceedingsPublication"
                    ref="proceedingsPublicationDetailsRef"
                    :preset-metadata="(currentLoadRecord as ProceedingsPublicationLoad)"
                    @update="updateRecord">
                </import-proceedings-publication-details>
            </template>

            <template #actions>
                <div class="d-flex flex-row justify-between">
                    <v-btn :disabled="stepperValue === 1" @click="previousStep">
                        {{ $t('previousLabel') }}
                    </v-btn>
                    <v-btn :disabled="stepperValue === steps.length || !canAdvance" @click="nextStep">
                        {{ $t('nextLabel') }}
                    </v-btn>
                </div>
            </template>
        </v-stepper>

        <v-btn class="load-action" :disabled="stepperValue !== steps.length" @click="finishLoad">
            {{ $t('finishLoadLabel') }}
        </v-btn>

        <v-progress-circular
            v-if="loading"
            color="primary"
            class="load-action ml-2"
            indeterminate
        ></v-progress-circular>

        <toast v-model="snackbar" :message="errorMessage" />
    </v-container>
    <v-container v-else>
        <h1 class="d-flex flex-row justify-center">
            {{ $t("noRecordsRemainingMessage") }}
        </h1>
    </v-container>
</template>

<script lang="ts">
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import { localiseDate } from "@/i18n/dateLocalisation";
import type { JournalPublicationLoad, ProceedingsPublicationLoad } from "@/models/LoadModel";
import ImportService from "@/services/importer/ImportService";
import { ref, watch } from "vue";
import { onMounted } from "vue";
import { defineComponent } from "vue";
import { useI18n } from "vue-i18n";
import ImportAuthor from "@/components/import/ImportAuthor.vue";
import ImportJournal from "@/components/import/ImportJournal.vue";
import ImportJournalPublicationDetails from "@/components/import/ImportJournalPublicationDetails.vue";
import ImportProceedingsPublicationDetails from "@/components/import/ImportProceedingsPublicationDetails.vue";
import type { JournalPublication, PersonDocumentContribution, ProceedingsPublication } from "@/models/PublicationModel";
import DocumentPublicationService from "@/services/DocumentPublicationService";
import Deduplicator from "@/components/import/Deduplicator.vue";
import ImportProceedings from "@/components/import/ImportProceedings.vue";
import Toast from "@/components/core/Toast.vue";
import { useUserRole } from "@/composables/useUserRole";
import OrganisationUnitAutocompleteSearch from "@/components/organisationUnit/OrganisationUnitAutocompleteSearch.vue";
import LoadingConfigurationService from "@/services/importer/LoadingConfigurationService";
import LanguageService from "@/services/LanguageService";
import { type LanguageTagResponse } from "@/models/Common";


export default defineComponent({
    name: "LoaderView",
    components: { ImportAuthor, ImportJournal, ImportJournalPublicationDetails, ImportProceedingsPublicationDetails, Deduplicator, ImportProceedings, Toast, OrganisationUnitAutocompleteSearch },
    setup() {
        const selectedOrganisationUnit = ref<{ title: string, value: number }>({title: "", value: -1});
        const { isAdmin, isResearcher } = useUserRole();

        const importAuthorsRef = ref<any[]>([]);
        const journalImportRef = ref<typeof ImportJournal>();
        const journalPublicationDetailsRef = ref<typeof ImportJournalPublicationDetails>();

        const proceedingsImportRef = ref<typeof ImportProceedings>();
        const proceedingsPublicationDetailsRef = ref<typeof ImportProceedingsPublicationDetails>();

        const contributionsLength = ref(0);

        const isFormValid = ref(false);
        const loading = ref(false);
        
        const snackbar = ref(false);
        const errorMessage = ref("");
        const i18n = useI18n();

        const stepperValue = ref(0);
        const canAdvance = ref(true);
        const steps = ref<string[]>([]);

        const loadingJournalPublication = ref(false);
        const loadingProceedingsPublication = ref(false);

        const noRecordsRemaining = ref(false);

        const smartLoading = ref(false);
        const currentSmartSkipRunId = ref('');

        const languageTags = ref<LanguageTagResponse[]>([]);
        
        const nextStep = () => {
            stepperValue.value += 1;
        };

        const previousStep = () => {
            stepperValue.value -= 1;
        };

        const currentLoadRecord = ref<JournalPublicationLoad|ProceedingsPublicationLoad>();

        onMounted(() => {
            document.title = i18n.t("harvestDataLabel");

            LoadingConfigurationService.fetchLoadingConfiguration()
            .then(response => {
                if (isResearcher.value) {
                    smartLoading.value = response.data.smartLoadingByDefault;
                }
                
                fetchNextRecordForLoading();
            });

            LanguageService.getAllLanguageTags().then(response => {
                languageTags.value = response.data;
            });
        });

        watch(selectedOrganisationUnit, () => {
            smartLoading.value = false;
            currentSmartSkipRunId.value = crypto.randomUUID();
            noRecordsRemaining.value = false;
            stepperValue.value = 0;

            fetchNextRecordForLoading();
        });

        const fetchNextRecordForLoading = () => {
            importAuthorsRef.value = [];
            importAuthorsRef.value.length = 0;
            loadingJournalPublication.value = false;
            loadingProceedingsPublication.value = false;

            ImportService.getNextFromWizard(
                selectedOrganisationUnit.value.value > 0 ? selectedOrganisationUnit.value.value : null
            ).then(response => {
                if(!response.data) {
                    noRecordsRemaining.value = true;
                    return;
                }

                currentLoadRecord.value = response.data;
                contributionsLength.value = currentLoadRecord.value.contributions.length;
                steps.value.splice(0, steps.value.length);
                currentLoadRecord.value.contributions.forEach((contribution) => {
                    contribution.key = crypto.randomUUID();
                    steps.value.push(`${contribution.person.firstName} ${contribution.person.lastName}`);
                });

                if ((currentLoadRecord.value as ProceedingsPublicationLoad).proceedingsPublicationType) {
                    steps.value.push(i18n.t("proceedingsLabel"));
                    loadingProceedingsPublication.value = true;
                } else if ((currentLoadRecord.value as JournalPublicationLoad).journalPublicationType) {
                    steps.value.push(i18n.t("journalLabel"));
                    loadingJournalPublication.value = true;
                }

                steps.value.push(i18n.t("otherDetailsLabel"));
                if (smartLoading.value) {
                    smartSkip();
                }
            });
        };

        const skipDocument = () => {
            const shouldToggleSmartLoading = smartLoading.value;
            smartLoading.value = false;
            currentSmartSkipRunId.value = crypto.randomUUID();

            ImportService.skipWizard(
                selectedOrganisationUnit.value.value > 0 ? selectedOrganisationUnit.value.value : null
            ).then(() => {
                stepperValue.value = 0;
                importAuthorsRef.value.forEach(contribution => {
                    if (contribution) {
                        contribution.resetIdempotencyKey();
                    }
                });
                importAuthorsRef.value = [];
                importAuthorsRef.value.length = 0;
                fetchNextRecordForLoading();
                smartLoading.value = shouldToggleSmartLoading;
            });
        };

        const waitForImportAuthor = (index: number): Promise<void> => {
            return new Promise(resolve => {
                const intervalId = setInterval(() => {
                if (importAuthorsRef.value[index]) {
                    if (importAuthorsRef.value[index].isReady()) {
                        clearInterval(intervalId);
                        resolve();
                    }
                }
                }, 200); // Check every 200 milliseconds
            });
        };

        const waitForImportJournal = (): Promise<void> => {
            return new Promise(resolve => {
                const intervalId = setInterval(() => {
                if (journalImportRef.value) {
                    clearInterval(intervalId);
                    resolve();
                }
                }, 200); // Check every 200 milliseconds
            });
        };

        const waitForImportProceedings = (): Promise<void> => {
            return new Promise(resolve => {
                const intervalId = setInterval(() => {
                if (proceedingsImportRef.value) {
                    clearInterval(intervalId);
                    resolve();
                }
                }, 200); // Check every 200 milliseconds
            });
        };

        const smartSkip = async () => {
            const runId = crypto.randomUUID();
            currentSmartSkipRunId.value = runId;
            smartLoading.value = true;

            let shouldStep = true;
            while (shouldStep) {
                if (!smartLoading.value || currentSmartSkipRunId.value !== runId) {
                    break;
                }

                nextStep();
                await new Promise(r => setTimeout(r, 1000));

                if (!smartLoading.value || currentSmartSkipRunId.value !== runId) break;

                if (stepperValue.value <= currentLoadRecord.value!.contributions.length) {
                    await waitForImportAuthor(stepperValue.value - 1);
                    if (!smartLoading.value || currentSmartSkipRunId.value !== runId) break;
                    shouldStep = importAuthorsRef.value[stepperValue.value - 1].isHandled();
                } else if (stepperValue.value === currentLoadRecord.value!.contributions.length + 1) {
                    if (loadingJournalPublication.value) {
                        await waitForImportJournal();
                        shouldStep = journalImportRef.value!.journalBinded;
                    } else if (loadingProceedingsPublication.value) {
                        await waitForImportProceedings();
                        shouldStep = proceedingsImportRef.value!.eventBinded && proceedingsImportRef.value!.proceedingsBinded;
                    } else {
                        shouldStep = false;
                    }
                } else {
                    shouldStep = false;
                }
            }
        };


        const updateRecord = (updatedRecord: JournalPublicationLoad | ProceedingsPublicationLoad) => {
            currentLoadRecord.value!.subTitle = updatedRecord.subTitle;
            currentLoadRecord.value!.description = updatedRecord.description;
            currentLoadRecord.value!.startPage = updatedRecord.startPage;
            currentLoadRecord.value!.endPage = updatedRecord.endPage;
            currentLoadRecord.value!.numberOfPages = updatedRecord.numberOfPages;
            currentLoadRecord.value!.articleNumber = updatedRecord.articleNumber;
            currentLoadRecord.value!.keywords = updatedRecord.keywords;
            currentLoadRecord.value!.uris = updatedRecord.uris;
            currentLoadRecord.value!.documentDate = updatedRecord.documentDate;
            currentLoadRecord.value!.scopusId = updatedRecord.scopusId;
            currentLoadRecord.value!.doi = updatedRecord.doi;
            
            if (loadingJournalPublication.value) {
                (currentLoadRecord.value as JournalPublicationLoad)!.volume = (updatedRecord as JournalPublicationLoad).volume;
                (currentLoadRecord.value as JournalPublicationLoad)!.issue = (updatedRecord as JournalPublicationLoad).issue;
                (currentLoadRecord.value as JournalPublicationLoad)!.journalPublicationType = (updatedRecord as JournalPublicationLoad).journalPublicationType;
            } else if (loadingProceedingsPublication.value) {
                (currentLoadRecord.value as ProceedingsPublicationLoad)!.proceedingsPublicationType = (updatedRecord as ProceedingsPublicationLoad).proceedingsPublicationType;
            }

            submitNewPublication();
        };

        const finishLoad = () => {
            loading.value = true;

            if (contributionsLength.value !== currentLoadRecord.value?.contributions.length) {
                errorMessage.value = i18n.t("authorBindNotFinishedMessage");
                snackbar.value = true;
                loading.value = false;
                return;
            }

            const unbindedAuthors: string[] = [];
            importAuthorsRef.value.forEach(contribution => {
                if (contribution && !contribution.isHandled()) {
                    unbindedAuthors.push(`${contribution.personForLoading.firstName} ${contribution.personForLoading.lastName}`)
                }
            });

            if (unbindedAuthors.length !== 0) {
                errorMessage.value = i18n.t("authorsNotBindedMessage", unbindedAuthors);
                snackbar.value = true;
                loading.value = false;
                return;
            }
            
            if (loadingJournalPublication.value) {
                if (!journalImportRef.value?.journalBinded) {
                    errorMessage.value = i18n.t("journalNotBindedMessage");
                    snackbar.value = true;
                    loading.value = false;
                    return;
                }

                if (!journalPublicationDetailsRef.value) {
                    errorMessage.value = i18n.t("detailsNotReviewedMessage");
                    snackbar.value = true;
                    loading.value = false;
                    return;
                }
                
                journalPublicationDetailsRef.value?.updateJournalPublication();
            
            } else if (loadingProceedingsPublication.value) {
                if (!proceedingsImportRef.value?.eventBinded) {
                    errorMessage.value = i18n.t("eventNotBindedMessage");
                    snackbar.value = true;
                    loading.value = false;
                    return;
                }

                if (!proceedingsImportRef.value?.proceedingsBinded) {
                    errorMessage.value = i18n.t("proceedingsNotBindedMessage");
                    snackbar.value = true;
                    loading.value = false;
                    return;
                }

                proceedingsPublicationDetailsRef.value?.updateProceedingsPublication();
            }
        };

        const submitNewPublication = () => {
            const contributions: PersonDocumentContribution[] = [];
            
            currentLoadRecord.value?.contributions.forEach((contribution, index) => {
                const affiliatedInstitutionIds = 
                    importAuthorsRef.value[index].importAffiliationsRef
                    .filter(
                        (importAffiliationRef: any) =>
                            importAffiliationRef &&
                            importAffiliationRef.selectedAffiliation &&
                            importAffiliationRef.selectedAffiliation.databaseId
                    )
                    .map(
                        (importAffiliationRef: any) => 
                            importAffiliationRef.selectedAffiliation.databaseId
                    );

                let affiliationStatement = [];
                const isUnmanagedPerson = !importAuthorsRef.value[index].selectedResearcher.databaseId;
                if (affiliatedInstitutionIds.length === 0 || isUnmanagedPerson) {
                    affiliationStatement = importAuthorsRef.value[index].importAffiliationsRef
                        .filter(
                            (importAffiliationRef: any) =>
                                importAffiliationRef &&
                                importAffiliationRef.selectedAffiliation
                        )
                        .map(
                            (importAffiliationRef: any) => {
                                return {
                                    languageTagId: languageTags.value.find(tag => tag.languageCode === "EN")?.id,
                                    languageTag: "EN",
                                    content: importAffiliationRef.selectedAffiliation.nameOther,
                                    priority: 1
                                };
                            }
                        );
                }
                
                contributions.push({
                    contributionDescription: contribution.contributionDescription,
                    contributionType: contribution.contributionType,
                    displayAffiliationStatement: affiliationStatement,
                    isCorrespondingContributor: contribution.isCorrespondingContributor ? true : false,
                    isMainContributor: contribution.isMainContributor ? true : false,
                    orderNumber: contribution.orderNumber as number,
                    personId: importAuthorsRef.value[index].selectedResearcher.databaseId,
                    personName: {
                        firstname: contribution.person.firstName,
                        lastname: contribution.person.lastName,
                        otherName: "",
                    },
                    isBoardPresident: false,
                    employmentTitle: undefined,
                    personalTitle: undefined,
                    institutionIds: affiliatedInstitutionIds
                });
            });

            if (loadingJournalPublication.value) {
                const newJournalPublication: JournalPublication = {
                    title: currentLoadRecord.value!.title,
                    articleNumber: currentLoadRecord.value!.articleNumber,
                    description: currentLoadRecord.value!.description,
                    startPage: currentLoadRecord.value!.startPage,
                    endPage: currentLoadRecord.value!.endPage,
                    volume: (currentLoadRecord.value as JournalPublicationLoad)!.volume,
                    issue: (currentLoadRecord.value as JournalPublicationLoad)!.issue,
                    journalId: journalImportRef.value!.selectedJournal.databaseId,
                    journalPublicationType: (currentLoadRecord.value as JournalPublicationLoad)!.journalPublicationType,
                    keywords: currentLoadRecord.value!.keywords,
                    numberOfPages: currentLoadRecord.value!.numberOfPages as number,
                    subTitle: currentLoadRecord.value!.subTitle,
                    uris: currentLoadRecord.value!.uris,
                    contributions: contributions,
                    documentDate: currentLoadRecord.value!.documentDate,
                    scopusId: currentLoadRecord.value!.scopusId,
                    doi: currentLoadRecord.value!.doi,
                    eventId: undefined, // is this ok?
                    fileItems: [],
                    proofs: []
                };

                DocumentPublicationService.createJournalPublication(newJournalPublication).then(() => {
                    markAsLoadedAndFetchNext();
                    loading.value = false;
                });
            } else if (loadingProceedingsPublication.value) {
                const newProceedingsPublication: ProceedingsPublication = {
                    title: currentLoadRecord.value!.title,
                    articleNumber: currentLoadRecord.value!.articleNumber ? currentLoadRecord.value!.articleNumber : "",
                    description: currentLoadRecord.value!.description,
                    startPage: currentLoadRecord.value!.startPage,
                    endPage: currentLoadRecord.value!.endPage,
                    proceedingsPublicationType: (currentLoadRecord.value as ProceedingsPublicationLoad)!.proceedingsPublicationType,
                    keywords: currentLoadRecord.value!.keywords,
                    numberOfPages: currentLoadRecord.value!.numberOfPages as number,
                    subTitle: currentLoadRecord.value!.subTitle,
                    uris: currentLoadRecord.value!.uris,
                    contributions: contributions,
                    documentDate: currentLoadRecord.value!.documentDate,
                    scopusId: currentLoadRecord.value!.scopusId,
                    doi: currentLoadRecord.value!.doi,
                    eventId: proceedingsImportRef.value!.selectedEvent.databaseId,
                    proceedingsId: proceedingsImportRef.value!.selectedProceedings.id,
                    fileItems: [],
                    proofs: []
                };

                DocumentPublicationService.createProceedingsPublication(newProceedingsPublication).then(() => {
                    markAsLoadedAndFetchNext();
                    loading.value = false;
                });
            }
        };

        const deduplicate = () => {
            markAsLoadedAndFetchNext();
        };

        const markAsLoadedAndFetchNext = () => {
            importAuthorsRef.value = [];
            importAuthorsRef.value.length = 0;
            ImportService.markCurrentAsLoaded(
                selectedOrganisationUnit.value.value > 0 ? selectedOrganisationUnit.value.value : null
            ).then(() => {
                stepperValue.value = 0;
                fetchNextRecordForLoading();
                errorMessage.value = i18n.t("loadSuccessMessage");
                snackbar.value = true;
            });
        };

        const toggleSmartLoading = () => {
            smartLoading.value = !smartLoading.value;
            if (smartLoading.value) {
                smartSkip();
            }
        };

        const resumeImport = () => {
            if (smartLoading.value) {
                smartSkip();
            }
        };

        return {
            isFormValid, snackbar, isAdmin,
            errorMessage, currentLoadRecord,
            returnCurrentLocaleContent,
            localiseDate, stepperValue, steps,
            nextStep, previousStep, canAdvance,
            skipDocument, importAuthorsRef, smartSkip,
            loadingJournalPublication, updateRecord,
            loadingProceedingsPublication, finishLoad,
            journalImportRef, journalPublicationDetailsRef,
            deduplicate, proceedingsImportRef,
            proceedingsPublicationDetailsRef,
            noRecordsRemaining, toggleSmartLoading,
            smartLoading, resumeImport, loading,
            selectedOrganisationUnit
        };
    },
});
</script>

<style scoped>

.load-action {
    margin-top: 30px;
}

.same-line {
    margin-left: 20px;
}

</style>
