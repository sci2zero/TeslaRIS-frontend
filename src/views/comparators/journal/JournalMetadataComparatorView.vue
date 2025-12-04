<template>
    <v-container id="journal-publications-comparator">
        <v-row class="d-flex flex-row justify-center align-start">
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ returnCurrentLocaleContent(leftJournal?.title) }}
                </h2>
                <br />

                <publication-series-update-form
                    ref="updateLeftRef" input-type="JOURNAL" :preset-publication-series="leftJournal" :in-modal="false"
                    @update="updateLeft"></publication-series-update-form>

                <br />

                <!-- Left Contributions Table -->
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <!-- <publication-series-contribution-update-modal :read-only="false" :preset-publication-series-contributions="leftContributions"></publication-series-contribution-update-modal> -->

                        <div>
                            <b>{{ $t("contributionsLabel") }}</b>
                        </div>

                        <person-publication-series-contribution-list
                            :publication-series-id="leftJournal?.id"
                            :contribution-list="leftJournal?.contributions ? leftJournal.contributions : []"
                            in-comparator
                            :can-reorder="true">
                        </person-publication-series-contribution-list>
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

                <publication-series-update-form
                    ref="updateRightRef" input-type="JOURNAL" :preset-publication-series="rightJournal" :in-modal="false"
                    @update="updateRight"></publication-series-update-form>

                <br />

                <!-- Right Contributions Table -->
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <!-- <publication-series-contribution-update-modal :read-only="false" :preset-publication-series-contributions="leftContributions"></publication-series-contribution-update-modal> -->

                        <div>
                            <b>{{ $t("contributionsLabel") }}</b>
                        </div>

                        <person-publication-series-contribution-list
                            :publication-series-id="rightJournal?.id"
                            :contribution-list="rightJournal?.contributions ? rightJournal.contributions : []"
                            in-comparator
                            :can-reorder="true">
                        </person-publication-series-contribution-list>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <comparison-actions
            :is-form-valid="updateLeftRef?.isFormValid && updateRightRef?.isFormValid"
            supports-force-delete
            aggregated-entities-comparison-page="journalPublicationsComparator"
            :left-id="(leftJournal?.id as number)"
            :right-id="(rightJournal?.id as number)"
            :entity-type="EntityType.JOURNAL"
            @update="updateAll"
            @delete="deleteSide">
        </comparison-actions>

        <toast v-model="snackbar" :message="snackbarMessage" />
    </v-container>
</template>

<script lang="ts">
import { onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { mergeMultilingualContentField, returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import JournalService from '@/services/JournalService';
import type { Journal } from '@/models/JournalModel';
import PersonPublicationSeriesContributionList from '@/components/core/PersonPublicationSeriesContributionList.vue';
import type { PersonPublicationSeriesContribution } from '@/models/PublicationSeriesModel';
import PublicationSeriesUpdateForm from '@/components/publicationSeries/update/PublicationSeriesUpdateForm.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import { ComparisonSide, EntityType } from '@/models/MergeModel';
import MergeService from '@/services/MergeService';
import ComparisonActions from '@/components/core/comparators/ComparisonActions.vue';
import Toast from '@/components/core/Toast.vue';
import { bulkTransferFields } from '@/utils/FieldTransferUtil';


export default defineComponent({
    name: "JournalMetadataComparator",
    components: { PersonPublicationSeriesContributionList, PublicationSeriesUpdateForm, ComparisonActions, Toast },
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
                leftJournal.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
            });

            JournalService.readJournal(parseInt(currentRoute.params.rightId as string)).then((response) => {
                rightJournal.value = response.data;
                rightJournal.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
            });
        };

        const mergeJournalMetadata = (journal1: Journal, journal2: Journal) => {
            mergeMultilingualContentField(journal1.title, journal2.title);
            mergeMultilingualContentField(journal1.subtitle, journal2.subtitle);

            mergeMultilingualContentField(journal1.nameAbbreviation, journal2.nameAbbreviation);
            journal2.nameAbbreviation = [];

            bulkTransferFields(journal1, journal2, [
                { fieldName: "eissn", emptyValue: "" },
                { fieldName: "printISSN", emptyValue: "" },
                { fieldName: "openAlexId", emptyValue: "" }
            ]);

            journal2.languageIds.forEach(languageId => {
                if (!journal1.languageIds.includes(languageId)) {
                    journal1.languageIds.push(languageId);
                }
            });
            journal2.languageIds = [];

            journal2.uris.forEach(uri => {
                if (!journal1.uris.includes(uri)) {
                    journal1.uris.push(uri);
                }
            });
            journal2.uris = [];

            journal1.contributions = journal1.contributions?.concat(journal2.contributions as PersonPublicationSeriesContribution[]);
            journal2.contributions = [];

            return [journal1, journal2];
        };

        const moveAll = (fromLeftToRight: boolean) => {
            updateLeftRef.value?.submit();
            updateRightRef.value?.submit();

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
            leftJournal.value!.languageIds = updatedJournal.languageIds;
            leftJournal.value!.uris = updatedJournal.uris;
            leftJournal.value!.subtitle = updatedJournal.subtitle;
            leftJournal.value!.openAlexId = updatedJournal.openAlexId;
            
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
            rightJournal.value!.languageIds = updatedJournal.languageIds;
            rightJournal.value!.uris = updatedJournal.uris;
            rightJournal.value!.subtitle = updatedJournal.subtitle;
            rightJournal.value!.openAlexId = updatedJournal.openAlexId;
            
            if (update.value) {
                rightUpdateComplete.value = true;
                finishUpdates();
            }
        };

        const updateAll = () => {
            update.value = true;
            updateLeftRef.value?.submit();
            updateRightRef.value?.submit();
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

        const deleteSide = async (side: ComparisonSide, isForceDelete = false) => {
            const id = side === ComparisonSide.LEFT ? leftJournal.value?.id : rightJournal.value?.id;
            const transferTargetId = side === ComparisonSide.LEFT ? rightJournal.value?.id : leftJournal.value?.id;
            const name = side === ComparisonSide.LEFT ? leftJournal.value?.title : rightJournal.value?.title;

            try {
                const deleteAction = isForceDelete 
                    ? JournalService.forceDeleteJournal(id as number)
                    : JournalService.deleteJournal(id as number);

                await deleteAction;

                await MergeService.migrateGenericIdentifierHistory(id as number, transferTargetId as number, EntityType.JOURNAL);
                await MergeService.switchAllIndicatorsToOtherJournal(id as number, transferTargetId as number);
                await MergeService.switchAllClassificationsToOtherJournal(id as number, transferTargetId as number);

                router.push({ name: "journalLandingPage", params: { id: transferTargetId } });
            } catch (_error) {
                snackbarMessage.value = i18n.t(
                    "deleteFailedNotification", 
                    { name: returnCurrentLocaleContent(name) }
                );
                snackbar.value = true;
            }
        };

        return {
            returnCurrentLocaleContent,
            snackbar, snackbarMessage,
            leftJournal, rightJournal,
            moveAll, updateAll, updateLeft,
            updateLeftRef, updateRightRef,
            updateRight, deleteSide,
            EntityType
        };
}})

</script>
