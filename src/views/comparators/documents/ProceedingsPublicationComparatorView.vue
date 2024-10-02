<template>
    <v-container id="proceedingsPublication-publications-comparator">
        <v-row class="d-flex flex-row justify-center align-start">
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ returnCurrentLocaleContent(leftProceedingsPublication?.title) }}
                </h2>
                <br />

                <proceedings-publication-update-form ref="updateLeftRef" :preset-proceedings-publication="leftProceedingsPublication" in-comparator @update="updateLeft"></proceedings-publication-update-form>

                <br />

                <description-or-biography-update-form ref="updateLeftDescriptionRef" :preset-description-or-biography="(leftProceedingsPublication?.description as MultilingualContent[])" @update="updateLeftDescription"></description-or-biography-update-form>

                <keyword-update-form ref="updateLeftKeywordsRef" :preset-keywords="(leftProceedingsPublication?.keywords as MultilingualContent[])" @update="updateRightKeywords"></keyword-update-form>

                <br />

                <!-- Left Contributions Table -->
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div>
                            <b>{{ $t("contributionsLabel") }}</b>
                        </div>

                        <person-document-contribution-list :contribution-list="leftProceedingsPublication?.contributions ? leftProceedingsPublication.contributions : []" :document-id="leftProceedingsPublication?.id"></person-document-contribution-list>
                    </v-card-text>
                </v-card>

                <attachment-section :document="leftProceedingsPublication" :proofs="leftProceedingsPublication?.proofs" :file-items="leftProceedingsPublication?.fileItems"></attachment-section>
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
                    {{ returnCurrentLocaleContent(rightProceedingsPublication?.title) }}
                </h2>

                <br />

                <proceedings-publication-update-form ref="updateRightRef" :preset-proceedings-publication="rightProceedingsPublication" in-comparator @update="updateRight"></proceedings-publication-update-form>

                <br />

                <description-or-biography-update-form ref="updateRightDescriptionRef" :preset-description-or-biography="(rightProceedingsPublication?.description as MultilingualContent[])" @update="updateRightDescription"></description-or-biography-update-form>

                <keyword-update-form ref="updateRightKeywordsRef" :preset-keywords="(rightProceedingsPublication?.keywords as MultilingualContent[])" @update="updateRightKeywords"></keyword-update-form>

                <br />

                <!-- Right Contributions Table -->
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div>
                            <b>{{ $t("contributionsLabel") }}</b>
                        </div>

                        <person-document-contribution-list :contribution-list="rightProceedingsPublication?.contributions ? rightProceedingsPublication.contributions : []" :document-id="rightProceedingsPublication?.id"></person-document-contribution-list>
                    </v-card-text>
                </v-card>

                <attachment-section :document="rightProceedingsPublication" :proofs="rightProceedingsPublication?.proofs" :file-items="rightProceedingsPublication?.fileItems"></attachment-section>
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
import { mergeMultilingualContentField, returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import ProceedingsService from '@/services/ProceedingsService';
import PersonDocumentContributionList from '@/components/core/PersonDocumentContributionList.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import ProceedingsPublicationUpdateForm from '@/components/publication/update/ProceedingsPublicationUpdateForm.vue';
import type { PersonDocumentContribution, ProceedingsPublication } from '@/models/PublicationModel';
import type { MultilingualContent } from '@/models/Common';
import DescriptionOrBiographyUpdateForm from '@/components/core/update/DescriptionOrBiographyUpdateForm.vue';
import KeywordUpdateForm from '@/components/core/update/KeywordUpdateForm.vue';
import MergeService from '@/services/MergeService';
import ComparisonActions from '@/components/core/comparators/ComparisonActions.vue';
import { ComparisonSide } from '@/models/MergeModel';
import { mergeDocumentAttachments } from '@/utils/AttachmentUtil';
import AttachmentSection from '@/components/core/AttachmentSection.vue';
import DocumentPublicationService from '@/services/DocumentPublicationService';


export default defineComponent({
    name: "ProceedingsPublicationMetadataComparator",
    components: { PersonDocumentContributionList, ProceedingsPublicationUpdateForm, DescriptionOrBiographyUpdateForm, KeywordUpdateForm, ComparisonActions, AttachmentSection },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const leftProceedingsPublication = ref<ProceedingsPublication>();
        const rightProceedingsPublication = ref<ProceedingsPublication>();

        const updateLeftRef = ref<typeof ProceedingsPublicationUpdateForm>();
        const updateRightRef = ref<typeof ProceedingsPublicationUpdateForm>();
        const updateRightDescriptionRef = ref<typeof DescriptionOrBiographyUpdateForm>();
        const updateLeftDescriptionRef = ref<typeof DescriptionOrBiographyUpdateForm>();
        const updateRightKeywordsRef = ref<typeof KeywordUpdateForm>();
        const updateLeftKeywordsRef = ref<typeof KeywordUpdateForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("proceedingsPublicationMetadataComparatorLabel");
            fetchProceedingss();
        });

        const fetchProceedingss = () => {
            DocumentPublicationService.readProceedingsPublication(parseInt(currentRoute.params.leftId as string)).then((response) => {
                leftProceedingsPublication.value = response.data;
            });

            DocumentPublicationService.readProceedingsPublication(parseInt(currentRoute.params.rightId as string)).then((response) => {
                rightProceedingsPublication.value = response.data;
            });
        };

        const mergeProceedingsMetadata = (proceedingsPublication1: ProceedingsPublication, proceedingsPublication2: ProceedingsPublication) => {
            mergeMultilingualContentField(proceedingsPublication1.title, proceedingsPublication2.title);

            mergeMultilingualContentField(proceedingsPublication1.subTitle, proceedingsPublication2.subTitle);
            proceedingsPublication2.subTitle = [];

            mergeMultilingualContentField(proceedingsPublication1.keywords, proceedingsPublication2.keywords);
            proceedingsPublication2.keywords = [];

            mergeMultilingualContentField(proceedingsPublication1.description, proceedingsPublication2.description);
            proceedingsPublication2.description = [];

            mergeDocumentAttachments(proceedingsPublication1, proceedingsPublication2);
            
            proceedingsPublication1.proceedingsPublicationType = proceedingsPublication2.proceedingsPublicationType;
            proceedingsPublication1.numberOfPages = proceedingsPublication2.numberOfPages;
            proceedingsPublication2.numberOfPages = 0;
            proceedingsPublication1.doi = proceedingsPublication2.doi;
            proceedingsPublication2.doi = "";
            proceedingsPublication1.scopusId = proceedingsPublication2.scopusId;
            proceedingsPublication2.scopusId = "";
            proceedingsPublication1.documentDate = proceedingsPublication2.documentDate;
            proceedingsPublication1.startPage = proceedingsPublication2.startPage;
            proceedingsPublication2.startPage = "";
            proceedingsPublication1.endPage = proceedingsPublication2.endPage;
            proceedingsPublication2.endPage = "";
            proceedingsPublication1.articleNumber = proceedingsPublication2.articleNumber;
            proceedingsPublication2.articleNumber = "";

            proceedingsPublication1.eventId = proceedingsPublication2.eventId;
            proceedingsPublication1.proceedingsId = proceedingsPublication2.proceedingsId;

            proceedingsPublication2.uris!.forEach(uri => {
                if (!proceedingsPublication1.uris!.includes(uri)) {
                    proceedingsPublication1.uris!.push(uri);
                }
            });
            proceedingsPublication2.uris = [];

            proceedingsPublication1.contributions = proceedingsPublication1.contributions?.concat(proceedingsPublication2.contributions as PersonDocumentContribution[]);
            proceedingsPublication2.contributions = [];

            return [proceedingsPublication1, proceedingsPublication2];
        };

        const moveAll = (fromLeftToRight: boolean) => {
            updateLeftKeywordsRef.value?.updateKeywords();
            updateRightKeywordsRef.value?.updateKeywords();
            updateLeftDescriptionRef.value?.updateDescription();
            updateRightDescriptionRef.value?.updateDescription();
            updateLeftRef.value?.updateProceedingsPublication();
            updateRightRef.value?.updateProceedingsPublication();

            if (fromLeftToRight) {
                [rightProceedingsPublication.value, leftProceedingsPublication.value] = mergeProceedingsMetadata(rightProceedingsPublication.value as ProceedingsPublication, leftProceedingsPublication.value as ProceedingsPublication);
            } else {
                [leftProceedingsPublication.value, rightProceedingsPublication.value] = mergeProceedingsMetadata(leftProceedingsPublication.value as ProceedingsPublication, rightProceedingsPublication.value as ProceedingsPublication);
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

        const updateLeft = (updatedInfo: ProceedingsPublication) => {
            leftProceedingsPublication.value!.title = updatedInfo.title;
            leftProceedingsPublication.value!.subTitle = updatedInfo.subTitle;
            leftProceedingsPublication.value!.description = updatedInfo.description;
            leftProceedingsPublication.value!.keywords = updatedInfo.keywords;
            leftProceedingsPublication.value!.uris = updatedInfo.uris;
            leftProceedingsPublication.value!.documentDate = updatedInfo.documentDate;
            leftProceedingsPublication.value!.doi = updatedInfo.doi;
            leftProceedingsPublication.value!.startPage = updatedInfo.startPage;
            leftProceedingsPublication.value!.endPage = updatedInfo.endPage;
            leftProceedingsPublication.value!.articleNumber = updatedInfo.articleNumber;
            leftProceedingsPublication.value!.proceedingsPublicationType = updatedInfo.proceedingsPublicationType;
            leftProceedingsPublication.value!.proceedingsId = updatedInfo.proceedingsId;
            leftProceedingsPublication.value!.eventId = updatedInfo.eventId;
            leftProceedingsPublication.value!.numberOfPages = updatedInfo.numberOfPages;
            leftProceedingsPublication.value!.scopusId = updatedInfo.scopusId;
            
            if (update.value) {
                leftUpdateComplete.value = true;
                finishUpdates();
            }
        };

        const updateRight = (updatedInfo: ProceedingsPublication) => {
            rightProceedingsPublication.value!.title = updatedInfo.title;
            rightProceedingsPublication.value!.subTitle = updatedInfo.subTitle;
            rightProceedingsPublication.value!.description = updatedInfo.description;
            rightProceedingsPublication.value!.keywords = updatedInfo.keywords;
            rightProceedingsPublication.value!.uris = updatedInfo.uris;
            rightProceedingsPublication.value!.documentDate = updatedInfo.documentDate;
            rightProceedingsPublication.value!.doi = updatedInfo.doi;
            rightProceedingsPublication.value!.startPage = updatedInfo.startPage;
            rightProceedingsPublication.value!.endPage = updatedInfo.endPage;
            rightProceedingsPublication.value!.articleNumber = updatedInfo.articleNumber;
            rightProceedingsPublication.value!.proceedingsPublicationType = updatedInfo.proceedingsPublicationType;
            rightProceedingsPublication.value!.proceedingsId = updatedInfo.proceedingsId;
            rightProceedingsPublication.value!.eventId = updatedInfo.eventId;
            rightProceedingsPublication.value!.numberOfPages = updatedInfo.numberOfPages;
            rightProceedingsPublication.value!.scopusId = updatedInfo.scopusId;
            
            if (update.value) {
                rightUpdateComplete.value = true;
                finishUpdates();
            }
        };

        const updateAll = () => {
            update.value = true;
            updateLeftKeywordsRef.value?.updateKeywords();
            updateRightKeywordsRef.value?.updateKeywords();
            updateLeftDescriptionRef.value?.updateDescription();
            updateRightDescriptionRef.value?.updateDescription();
            updateLeftRef.value?.updateProceedingsPublication();
            updateRightRef.value?.updateProceedingsPublication();
        };

        const finishUpdates = () => {
            if (leftUpdateComplete.value && rightUpdateComplete.value) {
                leftUpdateComplete.value = false;
                rightUpdateComplete.value = false;
                update.value = false;
            
                MergeService.saveMergedProceedingsPublicationMetadata(
                leftProceedingsPublication.value?.id as number, rightProceedingsPublication.value?.id as number,
                {
                    leftProceedingsPublication: leftProceedingsPublication.value as ProceedingsPublication, 
                    rightProceedingsPublication: rightProceedingsPublication.value as ProceedingsPublication,
                    leftProofs: leftProceedingsPublication.value?.proofs?.map(file => file.id) as number[],
                    leftFileItems: leftProceedingsPublication.value?.fileItems?.map(file => file.id) as number[],
                    rightProofs: rightProceedingsPublication.value?.proofs?.map(file => file.id) as number[],
                    rightFileItems: rightProceedingsPublication.value?.fileItems?.map(file => file.id) as number[]
                })
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
            leftProceedingsPublication.value!.description = description;
        };

        const updateRightDescription = (description: MultilingualContent[]) => {
            rightProceedingsPublication.value!.description = description;
        };

        const updateLeftKeywords = (keywords: MultilingualContent[]) => {
            leftProceedingsPublication.value!.keywords = keywords;
        };

        const updateRightKeywords = (keywords: MultilingualContent[]) => {
            rightProceedingsPublication.value!.keywords = keywords;
        };

        const deleteSide = (side: ComparisonSide) => {
            ProceedingsService.deleteProceedings(side === ComparisonSide.LEFT ? leftProceedingsPublication.value?.id as number : rightProceedingsPublication.value?.id as number).then(() => {
                router.push({ name: "deduplication", query: { tab: "documents" } });
            }).catch(() => {
                const name = side === ComparisonSide.LEFT ? leftProceedingsPublication.value?.title : rightProceedingsPublication.value?.title;
                snackbarMessage.value = i18n.t("deleteFailedNotification", { name: returnCurrentLocaleContent(name) });
                snackbar.value = true;
            });
        };

        return {
            returnCurrentLocaleContent,
            snackbar, snackbarMessage,
            leftProceedingsPublication, rightProceedingsPublication,
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
