<template>
    <v-container id="dataset-publications-comparator">
        <v-row class="d-flex flex-row justify-center align-start">
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ returnCurrentLocaleContent(leftDataset?.title) }}
                </h2>
                <br />

                <dataset-update-form
                    ref="updateLeftRef" :preset-dataset="leftDataset" in-comparator :in-modal="false"
                    @update="updateLeft"></dataset-update-form>

                <br />

                <description-or-biography-update-form ref="updateLeftDescriptionRef" :preset-description-or-biography="(leftDataset?.description as MultilingualContent[])" @update="updateLeftDescription"></description-or-biography-update-form>

                <keyword-update-form ref="updateLeftKeywordsRef" :preset-keywords="(leftDataset?.keywords as MultilingualContent[])" @update="updateRightKeywords"></keyword-update-form>

                <br />

                <!-- Left Contributions Table -->
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div>
                            <b>{{ $t("contributionsLabel") }}</b>
                        </div>

                        <person-document-contribution-list
                            :contribution-list="leftDataset?.contributions ? leftDataset.contributions : []"
                            :document-id="leftDataset?.id"
                            :can-reorder="true"
                            in-comparator>
                        </person-document-contribution-list>
                    </v-card-text>
                </v-card>

                <attachment-section :document="leftDataset" :proofs="leftDataset?.proofs" :file-items="leftDataset?.fileItems"></attachment-section>
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
                    {{ returnCurrentLocaleContent(rightDataset?.title) }}
                </h2>

                <br />

                <dataset-update-form
                    ref="updateRightRef" :preset-dataset="rightDataset" in-comparator :in-modal="false"
                    @update="updateRight"></dataset-update-form>

                <br />

                <description-or-biography-update-form ref="updateRightDescriptionRef" :preset-description-or-biography="(rightDataset?.description as MultilingualContent[])" @update="updateRightDescription"></description-or-biography-update-form>

                <keyword-update-form ref="updateRightKeywordsRef" :preset-keywords="(rightDataset?.keywords as MultilingualContent[])" @update="updateRightKeywords"></keyword-update-form>

                <br />

                <!-- Right Contributions Table -->
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div>
                            <b>{{ $t("contributionsLabel") }}</b>
                        </div>

                        <person-document-contribution-list
                            :contribution-list="rightDataset?.contributions ? rightDataset.contributions : []"
                            :document-id="rightDataset?.id"
                            :can-reorder="true"
                            in-comparator>
                        </person-document-contribution-list>
                    </v-card-text>
                </v-card>

                <attachment-section :document="rightDataset" :proofs="rightDataset?.proofs" :file-items="rightDataset?.fileItems"></attachment-section>
            </v-col>
        </v-row>

        <comparison-actions
            :is-form-valid="updateLeftRef?.isFormValid && updateRightRef?.isFormValid"
            @update="updateAll"
            @delete="deleteSide($event)">
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
import DocumentPublicationService from '@/services/DocumentPublicationService';
import type { Dataset } from '@/models/PublicationModel';
import PersonDocumentContributionList from '@/components/core/PersonDocumentContributionList.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import DatasetUpdateForm from '@/components/publication/update/DatasetUpdateForm.vue';
import type { PersonDocumentContribution } from '@/models/PublicationModel';
import type { MultilingualContent } from '@/models/Common';
import DescriptionOrBiographyUpdateForm from '@/components/core/update/DescriptionOrBiographyUpdateForm.vue';
import KeywordUpdateForm from '@/components/core/update/KeywordUpdateForm.vue';
import MergeService from '@/services/MergeService';
import ComparisonActions from '@/components/core/comparators/ComparisonActions.vue';
import { ComparisonSide } from '@/models/MergeModel';
import { mergeDocumentAttachments } from '@/utils/AttachmentUtil';
import AttachmentSection from '@/components/core/AttachmentSection.vue';
import Toast from '@/components/core/Toast.vue';


export default defineComponent({
    name: "DatasetMetadataComparator",
    components: { PersonDocumentContributionList, DatasetUpdateForm, DescriptionOrBiographyUpdateForm, KeywordUpdateForm, ComparisonActions, AttachmentSection, Toast },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const leftDataset = ref<Dataset>();
        const rightDataset = ref<Dataset>();

        const updateLeftRef = ref<typeof DatasetUpdateForm>();
        const updateRightRef = ref<typeof DatasetUpdateForm>();
        const updateRightDescriptionRef = ref<typeof DescriptionOrBiographyUpdateForm>();
        const updateLeftDescriptionRef = ref<typeof DescriptionOrBiographyUpdateForm>();
        const updateRightKeywordsRef = ref<typeof KeywordUpdateForm>();
        const updateLeftKeywordsRef = ref<typeof KeywordUpdateForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("datasetMetadataComparatorLabel");
            fetchDatasets();
        });

        const fetchDatasets = () => {
            DocumentPublicationService.readDataset(parseInt(currentRoute.params.leftId as string)).then((response) => {
                leftDataset.value = response.data;
                leftDataset.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
            });

            DocumentPublicationService.readDataset(parseInt(currentRoute.params.rightId as string)).then((response) => {
                rightDataset.value = response.data;
                rightDataset.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
            });
        };

        const mergeDatasetMetadata = (dataset1: Dataset, dataset2: Dataset) => {
            mergeMultilingualContentField(dataset1.title, dataset2.title);

            mergeMultilingualContentField(dataset1.subTitle, dataset2.subTitle);
            dataset2.subTitle = [];

            mergeMultilingualContentField(dataset1.keywords, dataset2.keywords);
            dataset2.keywords = [];

            mergeMultilingualContentField(dataset1.description, dataset2.description);
            dataset2.description = [];

            mergeDocumentAttachments(dataset1, dataset2);

            dataset1.internalNumber = dataset2.internalNumber;
            dataset2.internalNumber = "";
            dataset1.doi = dataset2.doi;
            dataset2.doi = "";
            dataset1.scopusId = dataset2.scopusId;
            dataset2.scopusId = "";
            dataset1.openAlexId = dataset2.openAlexId;
            dataset2.openAlexId = "";
            dataset1.webOfScienceId = dataset2.webOfScienceId;
            dataset2.webOfScienceId = "";
            dataset1.documentDate = dataset2.documentDate;

            dataset1.eventId = dataset2.eventId;
            dataset1.publisherId = dataset2.publisherId;

            dataset2.uris!.forEach(uri => {
                if (!dataset1.uris!.includes(uri)) {
                    dataset1.uris!.push(uri);
                }
            });
            dataset2.uris = [];

            dataset1.contributions = dataset1.contributions?.concat(dataset2.contributions as PersonDocumentContribution[]);
            dataset2.contributions = [];

            return [dataset1, dataset2];
        };

        const moveAll = (fromLeftToRight: boolean) => {
            updateLeftKeywordsRef.value?.submit();
            updateRightKeywordsRef.value?.submit();
            updateLeftDescriptionRef.value?.submit();
            updateRightDescriptionRef.value?.submit();
            updateLeftRef.value?.submit();
            updateRightRef.value?.submit();

            if (fromLeftToRight) {
                [rightDataset.value, leftDataset.value] = mergeDatasetMetadata(rightDataset.value as Dataset, leftDataset.value as Dataset);
            } else {
                [leftDataset.value, rightDataset.value] = mergeDatasetMetadata(leftDataset.value as Dataset, rightDataset.value as Dataset);
            }

            updateLeftRef.value?.refreshForm();
            updateRightRef.value?.refreshForm();
            updateLeftKeywordsRef.value?.refreshForm();
            updateRightKeywordsRef.value?.refreshForm();
            updateLeftDescriptionRef.value?.refreshForm();
            updateRightDescriptionRef.value?.refreshForm();
        };

        const leftUpdateComplete = ref(false);
        const rightUpdateComplete = ref(false);
        const update = ref(false);

        const updateLeft = (updatedInfo: Dataset) => {
            leftDataset.value!.title = updatedInfo.title;
            leftDataset.value!.subTitle = updatedInfo.subTitle;
            leftDataset.value!.description = updatedInfo.description;
            leftDataset.value!.keywords = updatedInfo.keywords;
            leftDataset.value!.uris = updatedInfo.uris;
            leftDataset.value!.documentDate = updatedInfo.documentDate;
            leftDataset.value!.doi = updatedInfo.doi;
            leftDataset.value!.internalNumber = updatedInfo.internalNumber;
            leftDataset.value!.eventId = updatedInfo.eventId;
            leftDataset.value!.publisherId = updatedInfo.publisherId;
            leftDataset.value!.scopusId = updatedInfo.scopusId;
            leftDataset.value!.openAlexId = updatedInfo.openAlexId;
            leftDataset.value!.webOfScienceId = updatedInfo.webOfScienceId;
            
            if (update.value) {
                leftUpdateComplete.value = true;
                finishUpdates();
            }
        };

        const updateRight = (updatedInfo: Dataset) => {
            rightDataset.value!.title = updatedInfo.title;
            rightDataset.value!.subTitle = updatedInfo.subTitle;
            rightDataset.value!.description = updatedInfo.description;
            rightDataset.value!.keywords = updatedInfo.keywords;
            rightDataset.value!.uris = updatedInfo.uris;
            rightDataset.value!.documentDate = updatedInfo.documentDate;
            rightDataset.value!.doi = updatedInfo.doi;
            rightDataset.value!.internalNumber = updatedInfo.internalNumber;
            rightDataset.value!.eventId = updatedInfo.eventId;
            rightDataset.value!.publisherId = updatedInfo.publisherId;
            rightDataset.value!.scopusId = updatedInfo.scopusId;
            rightDataset.value!.openAlexId = updatedInfo.openAlexId;
            rightDataset.value!.webOfScienceId = updatedInfo.webOfScienceId;
            
            if (update.value) {
                rightUpdateComplete.value = true;
                finishUpdates();
            }
        };

        const updateAll = () => {
            update.value = true;
            updateLeftKeywordsRef.value?.submit();
            updateRightKeywordsRef.value?.submit();
            updateLeftDescriptionRef.value?.submit();
            updateRightDescriptionRef.value?.submit();
            updateLeftRef.value?.submit();
            updateRightRef.value?.submit();
        };

        const finishUpdates = () => {
            if (leftUpdateComplete.value && rightUpdateComplete.value) {
                leftUpdateComplete.value = false;
                rightUpdateComplete.value = false;
                update.value = false;
            
                MergeService.saveMergedDatasetsMetadata(
                    leftDataset.value?.id as number, rightDataset.value?.id as number,
                    {
                        leftDataset: leftDataset.value as Dataset, 
                        rightDataset: rightDataset.value as Dataset,
                        leftProofs: leftDataset.value?.proofs?.map(file => file.id) as number[],
                        leftFileItems: leftDataset.value?.fileItems?.map(file => file.id) as number[],
                        rightProofs: rightDataset.value?.proofs?.map(file => file.id) as number[],
                        rightFileItems: rightDataset.value?.fileItems?.map(file => file.id) as number[]
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

        const updateLeftDescription = (description: MultilingualContent[]) => {
            leftDataset.value!.description = description;
        };

        const updateRightDescription = (description: MultilingualContent[]) => {
            rightDataset.value!.description = description;
        };

        const updateLeftKeywords = (keywords: MultilingualContent[]) => {
            leftDataset.value!.keywords = keywords;
        };

        const updateRightKeywords = (keywords: MultilingualContent[]) => {
            rightDataset.value!.keywords = keywords;
        };

        const deleteSide = async (side: ComparisonSide) => {
            const id = side === ComparisonSide.LEFT ? leftDataset.value?.id : rightDataset.value?.id;
            const transferTargetId = side === ComparisonSide.LEFT ? rightDataset.value?.id : leftDataset.value?.id;

            try {
                await MergeService.migratePublicationIdentifierHistory(id as number, transferTargetId as number, "publication");
                await DocumentPublicationService.deleteDocumentPublication(id as number);
                await MergeService.switchAllIndicatorsToOtherDocument(id as number, transferTargetId as number);

                router.push({ name: "datasetLandingPage", params: { id: transferTargetId } });
            } catch {
                const name = side === ComparisonSide.LEFT ? leftDataset.value?.title : rightDataset.value?.title;
                snackbarMessage.value = i18n.t("deleteFailedNotification", { name: returnCurrentLocaleContent(name) });
                snackbar.value = true;
            }
        };

        return {
            returnCurrentLocaleContent,
            snackbar, snackbarMessage,
            leftDataset, rightDataset,
            moveAll, updateAll, updateLeft,
            updateLeftRef, updateRightRef, updateRight,
            updateRightDescriptionRef, updateLeftDescriptionRef,
            updateRightKeywordsRef, updateLeftKeywordsRef,
            updateLeftDescription, updateRightDescription,
            updateLeftKeywords, updateRightKeywords,
            deleteSide
        };
}})

</script>
