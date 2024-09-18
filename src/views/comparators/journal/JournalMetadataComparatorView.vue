<template>
    <v-container id="journal-publications-comparator">
        <v-row class="d-flex flex-row justify-center align-start">
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ returnCurrentLocaleContent(leftJournal?.title) }}
                </h2>
                <br />

                <publication-series-update-form ref="updateLeftRef" input-type="JOURNAL" :preset-publication-series="leftJournal" @update="updateLeft"></publication-series-update-form>

                <br />

                <!-- Left Contributions Table -->
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <!-- <publication-series-contribution-update-modal :read-only="false" :preset-publication-series-contributions="leftContributions"></publication-series-contribution-update-modal> -->

                        <div>
                            <b>{{ $t("contributionsLabel") }}</b>
                        </div>

                        <person-publication-series-contribution-list :contribution-list="leftJournal?.contributions ? leftJournal.contributions : []" in-comparator></person-publication-series-contribution-list>
                    </v-card-text>
                </v-card>
            </v-col>

            <v-col cols="1">
                <v-btn class="mb-1 middle-arrow" icon @click="moveAll(true)">
                    <v-icon>mdi-arrow-right</v-icon>
                </v-btn>
                <v-btn class="mt-1 middle-arrow" icon @click="moveAll(false)">
                    <v-icon>mdi-arrow-left</v-icon>
                </v-btn>
            </v-col>
            
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ returnCurrentLocaleContent(rightJournal?.title) }}
                </h2>

                <br />

                <publication-series-update-form ref="updateRightRef" input-type="JOURNAL" :preset-publication-series="rightJournal" @update="updateRight"></publication-series-update-form>

                <br />

                <!-- Right Contributions Table -->
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <!-- <publication-series-contribution-update-modal :read-only="false" :preset-publication-series-contributions="leftContributions"></publication-series-contribution-update-modal> -->

                        <div>
                            <b>{{ $t("contributionsLabel") }}</b>
                        </div>

                        <person-publication-series-contribution-list :contribution-list="rightJournal?.contributions ? rightJournal.contributions : []" in-comparator></person-publication-series-contribution-list>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <comparison-actions @update="updateAll" @delete="deleteSide($event)"></comparison-actions>

        <v-snackbar
            v-model="snackbar"
            :timeout="5000">
            {{ snackbarMessage }}
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
</template>

<script lang="ts">
import { onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import JournalService from '@/services/JournalService';
import type { Journal } from '@/models/JournalModel';
import PersonPublicationSeriesContributionList from '@/components/core/PersonPublicationSeriesContributionList.vue';
import type { PersonPublicationSeriesContribution } from '@/models/PublicationSeriesModel';
import PublicationSeriesUpdateForm from '@/components/publicationSeries/update/PublicationSeriesUpdateForm.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import { ComparisonSide } from '@/models/MergeModel';
import MergeService from '@/services/MergeService';
import ComparisonActions from '@/components/core/comparators/ComparisonActions.vue';


export default defineComponent({
    name: "JournalMetadataComparator",
    components: { PersonPublicationSeriesContributionList, PublicationSeriesUpdateForm, ComparisonActions },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const leftJournal = ref<Journal>();
        const rightJournal = ref<Journal>();

        const updateLeftRef = ref<typeof PublicationSeriesUpdateForm>();
        const updateRightRef = ref<typeof PublicationSeriesUpdateForm>();
        
        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("journalMetadataComparatorLabel");
            fetchJournals();
        });

        const fetchJournals = () => {
            JournalService.readJournal(parseInt(currentRoute.params.leftId as string)).then((response) => {
                leftJournal.value = response.data;
            });

            JournalService.readJournal(parseInt(currentRoute.params.rightId as string)).then((response) => {
                rightJournal.value = response.data;
            });
        };

        const mergeJournalMetadata = (journal1: Journal, journal2: Journal) => {
            journal2.title.forEach(title => {
                let merged = false;
                journal1.title.forEach(currentTitle => {
                    if (currentTitle.languageTag === title.languageTag) {
                        currentTitle.content += " | " + title.content;
                        merged = true;
                    }
                });
                if (!merged) {
                    journal1.title.push(title);
                }
            });

            journal2.nameAbbreviation.forEach(nameAbbreviation => {
                let merged = false;
                journal1.nameAbbreviation.forEach(currentNameAbbreviation => {
                    if (currentNameAbbreviation.languageTag === nameAbbreviation.languageTag) {
                        currentNameAbbreviation.content += " | " + nameAbbreviation.content;
                        merged = true;
                    }
                });
                if (!merged) {
                    journal1.nameAbbreviation.push(nameAbbreviation);
                }
            });
            journal2.nameAbbreviation = [];

            journal1.eissn = journal2.eissn;
            journal2.eissn = "";
            journal1.printISSN = journal2.printISSN;
            journal2.printISSN = "";

            journal2.languageTagIds.forEach(languageTagId => {
                if (!journal1.languageTagIds.includes(languageTagId)) {
                    journal1.languageTagIds.push(languageTagId);
                }
            });
            journal2.languageTagIds = [];

            journal1.contributions = journal1.contributions?.concat(journal2.contributions as PersonPublicationSeriesContribution[]);
            journal2.contributions = [];

            return [journal1, journal2];
        };

        const moveAll = (fromLeftToRight: boolean) => {
            updateLeftRef.value?.updatePublicationSeries();
            updateRightRef.value?.updatePublicationSeries();

            if (fromLeftToRight) {
                [rightJournal.value, leftJournal.value] = mergeJournalMetadata(rightJournal.value as Journal, leftJournal.value as Journal);
            } else {
                [leftJournal.value, rightJournal.value] = mergeJournalMetadata(leftJournal.value as Journal, rightJournal.value as Journal);
            }

            updateLeftRef.value?.refreshForm();
            updateRightRef.value?.refreshForm();
        };

        const leftUpdateComplete = ref(false);
        const rightUpdateComplete = ref(false);
        const update = ref(false);

        const updateLeft = (updatedJournal: Journal) => {
            leftJournal.value!.title = updatedJournal.title;
            leftJournal.value!.nameAbbreviation = updatedJournal.nameAbbreviation;
            leftJournal.value!.eissn = updatedJournal.eissn;
            leftJournal.value!.printISSN = updatedJournal.printISSN;
            leftJournal.value!.languageTagIds = updatedJournal.languageTagIds;
            
            if (update.value) {
                leftUpdateComplete.value = true;
                finishUpdates();
            }
        };

        const updateRight = (updatedJournal: Journal) => {
            rightJournal.value!.title = updatedJournal.title;
            rightJournal.value!.nameAbbreviation = updatedJournal.nameAbbreviation;
            rightJournal.value!.eissn = updatedJournal.eissn;
            rightJournal.value!.printISSN = updatedJournal.printISSN;
            rightJournal.value!.languageTagIds = updatedJournal.languageTagIds;
            
            if (update.value) {
                rightUpdateComplete.value = true;
                finishUpdates();
            }
        };

        const updateAll = () => {
            update.value = true;
            updateLeftRef.value?.updatePublicationSeries();
            updateRightRef.value?.updatePublicationSeries();
        };

        const finishUpdates = () => {
            if (leftUpdateComplete.value && rightUpdateComplete.value) {
                leftUpdateComplete.value = false;
                rightUpdateComplete.value = false;
                update.value = false;

                MergeService.saveMergedJournalsMetadata(
                    leftJournal.value?.id as number, rightJournal.value?.id as number,
                    {
                        leftJournal: leftJournal.value as Journal, 
                        rightJournal: rightJournal.value as Journal
                    }
                )
                .then(() => {
                    snackbarMessage.value = i18n.t("updatedSuccessMessage");
                    snackbar.value = true;
                })
                .catch((error) => {
                    snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                    snackbar.value = true;
                });
            }
        };

        const deleteSide = (side: ComparisonSide) => {
            JournalService.deleteJournal(side === ComparisonSide.LEFT ? leftJournal.value?.id as number : rightJournal.value?.id as number).then(() => {
                router.push({ name: "deduplication" });
            }).catch(() => {
                const name = side === ComparisonSide.LEFT ? leftJournal.value?.title : rightJournal.value?.title;
                snackbarMessage.value = i18n.t("deleteFailedNotification", { name: returnCurrentLocaleContent(name) });
                snackbar.value = true;
            });
        };

        return {
            returnCurrentLocaleContent,
            snackbar, snackbarMessage,
            leftJournal, rightJournal,
            moveAll, updateAll, updateLeft,
            updateLeftRef, updateRightRef,
            updateRight, deleteSide
        };
}})

</script>
