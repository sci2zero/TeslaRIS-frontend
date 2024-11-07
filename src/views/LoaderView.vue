<template>
    <v-container v-if="!noRecordsRemaining">
        <h1>{{ $t("currentlyLoadingLabel") }}: {{ returnCurrentLocaleContent(currentLoadRecord?.title) }}</h1>
        <h3>{{ $t("yearOfPublicationLabel") }}: {{ localiseDate(currentLoadRecord?.documentDate) }}</h3>

        <deduplicator :publication-for-loading="currentLoadRecord" @deduplicate="deduplicate"></deduplicator>

        <br />
        <v-stepper
            v-model="stepperValue" :items="steps"
            :next-text="$t('nextLabel')"
            :prev-text="$t('previousLabel')">
            <template v-for="(contribution, index) in currentLoadRecord?.contributions" :key="contribution.key" #[`item.${index+1}`]>
                <import-author :ref="(el) => (importAuthorsRef[index] = el)" :person-for-loading="contribution.person" :institutions-for-loading="contribution.institutions"></import-author>
            </template>

            <template #[`item.${steps.length-1}`]>
                <import-journal v-if="loadingJournalPublication" ref="journalImportRef" :publication-for-loading="(currentLoadRecord as JournalPublicationLoad)"></import-journal>
                <import-proceedings v-if="loadingProceedingsPublication" ref="proceedingsImportRef" :publication-for-loading="(currentLoadRecord as ProceedingsPublicationLoad)"></import-proceedings>
            </template>

            <template #[`item.${steps.length}`]>
                <import-journal-publication-details v-if="loadingJournalPublication" ref="journalPublicationDetailsRef" :preset-metadata="(currentLoadRecord as JournalPublicationLoad)" @update="updateRecord"></import-journal-publication-details>
                <import-proceedings-publication-details v-if="loadingProceedingsPublication" ref="proceedingsPublicationDetailsRef" :preset-metadata="(currentLoadRecord as ProceedingsPublicationLoad)" @update="updateRecord"></import-proceedings-publication-details>
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

        <v-btn class="load-action" @click="skipDocument">
            {{ $t('skipDocumentLabel') }}
        </v-btn>

        
        <v-btn class="load-action same-line" :disabled="stepperValue === steps.length" @click="smartSkip">
            {{ $t('smartImportLabel') }}
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

        <v-btn class="load-action same-line" :disabled="stepperValue !== steps.length" @click="finishLoad">
            {{ $t('finishLoadLabel') }}
        </v-btn>

        <v-snackbar
            v-model="snackbar"
            :timeout="5000">
            {{ errorMessage }}
            <template #actions>
                <v-btn
                    color="blue"
                    variant="text"
                    @click="snackbar = false">
                    {{ $t("closeLabel") }}
                </v-btn>
            </template>
        </v-snackbar>
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
import ImportService from "@/services/ImportService";
import { ref } from "vue";
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


export default defineComponent({
    name: "LoaderView",
    components: {ImportAuthor, ImportJournal, ImportJournalPublicationDetails, ImportProceedingsPublicationDetails, Deduplicator, ImportProceedings},
    setup() {
        const importAuthorsRef = ref<any[]>([]);
        const journalImportRef = ref<typeof ImportJournal>();
        const journalPublicationDetailsRef = ref<typeof ImportJournalPublicationDetails>();

        const proceedingsImportRef = ref<typeof ImportProceedings>();
        const proceedingsPublicationDetailsRef = ref<typeof ImportProceedingsPublicationDetails>();

        const contributionsLength = ref(0);

        const isFormValid = ref(false);
        
        const snackbar = ref(false);
        const errorMessage = ref("");
        const i18n = useI18n();

        const stepperValue = ref(1);
        const canAdvance = ref(true);
        const steps = ref<string[]>([]);

        const loadingJournalPublication = ref(false);
        const loadingProceedingsPublication = ref(false);

        const noRecordsRemaining = ref(false);
        
        const nextStep = () => {
            stepperValue.value += 1;
        };

        const previousStep = () => {
            stepperValue.value -= 1;
        };

        const currentLoadRecord = ref<JournalPublicationLoad|ProceedingsPublicationLoad>();

        onMounted(() => {
            document.title = i18n.t("harvestDataLabel");

            fetchNextRecordForLoading();
        });

        const fetchNextRecordForLoading = () => {
            importAuthorsRef.value = [];
            importAuthorsRef.value.length = 0;
            loadingJournalPublication.value = false;
            loadingProceedingsPublication.value = false;

            ImportService.getNextFromWizard().then(response => {
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
            });
        };

        const skipDocument = () => {
            ImportService.skipWizard().then(() => {
                stepperValue.value = 1;
                importAuthorsRef.value = [];
                importAuthorsRef.value.length = 0;
                fetchNextRecordForLoading();
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
            let shouldStep = true;
            while (shouldStep) {
                nextStep();
                await new Promise(r => setTimeout(r, 1000));
                if (stepperValue.value <= currentLoadRecord.value!.contributions.length) {
                    await waitForImportAuthor(stepperValue.value - 1);
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
            if (contributionsLength.value !== currentLoadRecord.value?.contributions.length) {
                errorMessage.value = i18n.t("authorBindNotFinishedMessage");
                snackbar.value = true;
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
                return;
            }
            
            if (loadingJournalPublication.value) {
                if (!journalImportRef.value?.journalBinded) {
                    errorMessage.value = i18n.t("journalNotBindedMessage");
                    snackbar.value = true;
                    return;
                }

                if (!journalPublicationDetailsRef.value) {
                    errorMessage.value = i18n.t("detailsNotReviewedMessage");
                    snackbar.value = true;
                    return;
                }
                
                journalPublicationDetailsRef.value?.updateJournalPublication();
            
            } else if (loadingProceedingsPublication.value) {
                if (!proceedingsImportRef.value?.eventBinded) {
                    errorMessage.value = i18n.t("eventNotBindedMessage");
                    snackbar.value = true;
                    return;
                }

                if (!proceedingsImportRef.value?.proceedingsBinded) {
                    errorMessage.value = i18n.t("proceedingsNotBindedMessage");
                    snackbar.value = true;
                    return;
                }

                proceedingsPublicationDetailsRef.value?.updateProceedingsPublication();
            }
        };

        const submitNewPublication = () => {
            const contributions: PersonDocumentContribution[] = [];
            currentLoadRecord.value?.contributions.forEach((contribution, index) => {
                contributions.push({
                    contributionDescription: contribution.contributionDescription,
                    contributionType: contribution.contributionType,
                    displayAffiliationStatement: [],
                    isCorrespondingContributor: contribution.isCorrespondingContributor ? true : false,
                    isMainContributor: contribution.isMainContributor ? true : false,
                    orderNumber: contribution.orderNumber as number,
                    personId: importAuthorsRef.value[index].selectedResearcher.databaseId,
                    personName: {
                        firstname: contribution.person.firstName,
                        lastname: contribution.person.lastName,
                        otherName: "",
                    }
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
                });
            }
        };

        const deduplicate = () => {
            markAsLoadedAndFetchNext();
        };

        const markAsLoadedAndFetchNext = () => {
            importAuthorsRef.value = [];
            importAuthorsRef.value.length = 0;
            ImportService.markCurrentAsLoaded().then(() => {
                stepperValue.value = 1;
                fetchNextRecordForLoading();
                errorMessage.value = i18n.t("loadSuccessMessage");
                snackbar.value = true;
            });
        };

        return {
            isFormValid, snackbar,
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
            noRecordsRemaining
        };
    },
});
</script>

<style scoped>

.load-action {
    margin-top: 30px;
}

.same-line {
    margin-left: 30px;
}

</style>
