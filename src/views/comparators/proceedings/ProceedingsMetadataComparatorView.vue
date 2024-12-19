<template>
    <v-container id="proceedings-publications-comparator">
        <v-row class="d-flex flex-row justify-center align-start">
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ returnCurrentLocaleContent(leftProceedings?.title) }}
                </h2>
                <br />

                <proceedings-update-form ref="updateLeftRef" :preset-proceedings="leftProceedings" in-comparator @update="updateLeft"></proceedings-update-form>

                <br />

                <description-or-biography-update-form ref="updateLeftDescriptionRef" :preset-description-or-biography="(leftProceedings?.description as MultilingualContent[])" @update="updateLeftDescription"></description-or-biography-update-form>

                <keyword-update-form ref="updateLeftKeywordsRef" :preset-keywords="(leftProceedings?.keywords as MultilingualContent[])" @update="updateRightKeywords"></keyword-update-form>

                <br />

                <!-- Left Contributions Table -->
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div>
                            <b>{{ $t("contributionsLabel") }}</b>
                        </div>

                        <person-document-contribution-list :contribution-list="leftProceedings?.contributions ? leftProceedings.contributions : []" :document-id="leftProceedings?.id"></person-document-contribution-list>
                    </v-card-text>
                </v-card>

                <attachment-section :document="leftProceedings" :proofs="leftProceedings?.proofs" :file-items="leftProceedings?.fileItems"></attachment-section>
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
                    {{ returnCurrentLocaleContent(rightProceedings?.title) }}
                </h2>

                <br />

                <proceedings-update-form ref="updateRightRef" :preset-proceedings="rightProceedings" in-comparator @update="updateRight"></proceedings-update-form>

                <br />

                <description-or-biography-update-form ref="updateRightDescriptionRef" :preset-description-or-biography="(rightProceedings?.description as MultilingualContent[])" @update="updateRightDescription"></description-or-biography-update-form>

                <keyword-update-form ref="updateRightKeywordsRef" :preset-keywords="(rightProceedings?.keywords as MultilingualContent[])" @update="updateRightKeywords"></keyword-update-form>

                <br />

                <!-- Right Contributions Table -->
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div>
                            <b>{{ $t("contributionsLabel") }}</b>
                        </div>

                        <person-document-contribution-list :contribution-list="rightProceedings?.contributions ? rightProceedings.contributions : []" :document-id="rightProceedings?.id"></person-document-contribution-list>
                    </v-card-text>
                </v-card>

                <attachment-section :document="rightProceedings" :proofs="rightProceedings?.proofs" :file-items="rightProceedings?.fileItems"></attachment-section>
            </v-col>
        </v-row>

        <comparison-actions supports-force-delete @update="updateAll" @delete="deleteSide"></comparison-actions>

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
import type { Proceedings } from '@/models/ProceedingsModel';
import PersonDocumentContributionList from '@/components/core/PersonDocumentContributionList.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import ProceedingsUpdateForm from '@/components/proceedings/update/ProceedingsUpdateForm.vue';
import type { PersonDocumentContribution } from '@/models/PublicationModel';
import type { MultilingualContent } from '@/models/Common';
import DescriptionOrBiographyUpdateForm from '@/components/core/update/DescriptionOrBiographyUpdateForm.vue';
import KeywordUpdateForm from '@/components/core/update/KeywordUpdateForm.vue';
import MergeService from '@/services/MergeService';
import ComparisonActions from '@/components/core/comparators/ComparisonActions.vue';
import { ComparisonSide } from '@/models/MergeModel';
import { mergeDocumentAttachments } from '@/utils/AttachmentUtil';
import AttachmentSection from '@/components/core/AttachmentSection.vue';


export default defineComponent({
    name: "ProceedingsMetadataComparator",
    components: { PersonDocumentContributionList, ProceedingsUpdateForm, DescriptionOrBiographyUpdateForm, KeywordUpdateForm, ComparisonActions, AttachmentSection },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const leftProceedings = ref<Proceedings>();
        const rightProceedings = ref<Proceedings>();

        const updateLeftRef = ref<typeof ProceedingsUpdateForm>();
        const updateRightRef = ref<typeof ProceedingsUpdateForm>();
        const updateRightDescriptionRef = ref<typeof DescriptionOrBiographyUpdateForm>();
        const updateLeftDescriptionRef = ref<typeof DescriptionOrBiographyUpdateForm>();
        const updateRightKeywordsRef = ref<typeof KeywordUpdateForm>();
        const updateLeftKeywordsRef = ref<typeof KeywordUpdateForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("proceedingsMetadataComparatorLabel");
            fetchProceedingss();
        });

        const fetchProceedingss = () => {
            ProceedingsService.readProceedings(parseInt(currentRoute.params.leftId as string)).then((response) => {
                leftProceedings.value = response.data;
            });

            ProceedingsService.readProceedings(parseInt(currentRoute.params.rightId as string)).then((response) => {
                rightProceedings.value = response.data;
            });
        };

        const mergeProceedingsMetadata = (proceedings1: Proceedings, proceedings2: Proceedings) => {
            mergeMultilingualContentField(proceedings1.title, proceedings2.title);

            mergeMultilingualContentField(proceedings1.subTitle, proceedings2.subTitle);
            proceedings2.subTitle = [];

            mergeMultilingualContentField(proceedings1.keywords, proceedings2.keywords);
            proceedings2.keywords = [];

            mergeMultilingualContentField(proceedings1.description, proceedings2.description);
            proceedings2.description = [];

            mergeDocumentAttachments(proceedings1, proceedings2);

            proceedings1.eISBN = proceedings2.eISBN;
            proceedings2.eISBN = "";
            proceedings1.printISBN = proceedings2.printISBN;
            proceedings2.printISBN = "";
            proceedings1.numberOfPages = proceedings2.numberOfPages;
            proceedings2.numberOfPages = 0;
            proceedings1.doi = proceedings2.doi;
            proceedings2.doi = "";
            proceedings1.scopusId = proceedings2.scopusId;
            proceedings2.scopusId = "";
            proceedings1.documentDate = proceedings2.documentDate;
            proceedings1.publicationSeriesVolume = proceedings2.publicationSeriesVolume;
            proceedings2.publicationSeriesVolume = "";
            proceedings1.publicationSeriesIssue = proceedings2.publicationSeriesIssue;
            proceedings2.publicationSeriesIssue = "";

            proceedings1.eventId = proceedings2.eventId;
            proceedings1.publicationSeriesId = proceedings2.publicationSeriesId;
            proceedings1.publisherId = proceedings2.publisherId;

            proceedings2.languageTagIds!.forEach(languageTagId => {
                if (!proceedings1.languageTagIds!.includes(languageTagId)) {
                    proceedings1.languageTagIds!.push(languageTagId);
                }
            });
            proceedings2.languageTagIds = [];

            proceedings2.uris!.forEach(uri => {
                if (!proceedings1.uris!.includes(uri)) {
                    proceedings1.uris!.push(uri);
                }
            });
            proceedings2.uris = [];

            proceedings1.contributions = proceedings1.contributions?.concat(proceedings2.contributions as PersonDocumentContribution[]);
            proceedings2.contributions = [];

            return [proceedings1, proceedings2];
        };

        const moveAll = (fromLeftToRight: boolean) => {
            updateLeftKeywordsRef.value?.submit();
            updateRightKeywordsRef.value?.submit();
            updateLeftDescriptionRef.value?.submit();
            updateRightDescriptionRef.value?.submit();
            updateLeftRef.value?.submit();
            updateRightRef.value?.submit();

            if (fromLeftToRight) {
                [rightProceedings.value, leftProceedings.value] = mergeProceedingsMetadata(rightProceedings.value as Proceedings, leftProceedings.value as Proceedings);
            } else {
                [leftProceedings.value, rightProceedings.value] = mergeProceedingsMetadata(leftProceedings.value as Proceedings, rightProceedings.value as Proceedings);
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

        const updateLeft = (updatedInfo: Proceedings) => {
            leftProceedings.value!.title = updatedInfo.title;
            leftProceedings.value!.subTitle = updatedInfo.subTitle;
            leftProceedings.value!.description = updatedInfo.description;
            leftProceedings.value!.keywords = updatedInfo.keywords;
            leftProceedings.value!.uris = updatedInfo.uris;
            leftProceedings.value!.documentDate = updatedInfo.documentDate;
            leftProceedings.value!.doi = updatedInfo.doi;
            leftProceedings.value!.eISBN = updatedInfo.eISBN;
            leftProceedings.value!.eventId = updatedInfo.eventId;
            leftProceedings.value!.languageTagIds = updatedInfo.languageTagIds;
            leftProceedings.value!.numberOfPages = updatedInfo.numberOfPages;
            leftProceedings.value!.printISBN = updatedInfo.printISBN;
            leftProceedings.value!.publicationSeriesId = updatedInfo.publicationSeriesId;
            leftProceedings.value!.publicationSeriesIssue = updatedInfo.publicationSeriesIssue;
            leftProceedings.value!.publicationSeriesVolume = updatedInfo.publicationSeriesVolume;
            leftProceedings.value!.publisherId = updatedInfo.publisherId;
            leftProceedings.value!.scopusId = updatedInfo.scopusId;
            
            if (update.value) {
                leftUpdateComplete.value = true;
                finishUpdates();
            }
        };

        const updateRight = (updatedInfo: Proceedings) => {
            rightProceedings.value!.title = updatedInfo.title;
            rightProceedings.value!.subTitle = updatedInfo.subTitle;
            rightProceedings.value!.description = updatedInfo.description;
            rightProceedings.value!.keywords = updatedInfo.keywords;
            rightProceedings.value!.uris = updatedInfo.uris;
            rightProceedings.value!.documentDate = updatedInfo.documentDate;
            rightProceedings.value!.doi = updatedInfo.doi;
            rightProceedings.value!.eISBN = updatedInfo.eISBN;
            rightProceedings.value!.eventId = updatedInfo.eventId;
            rightProceedings.value!.languageTagIds = updatedInfo.languageTagIds;
            rightProceedings.value!.numberOfPages = updatedInfo.numberOfPages;
            rightProceedings.value!.printISBN = updatedInfo.printISBN;
            rightProceedings.value!.publicationSeriesId = updatedInfo.publicationSeriesId;
            rightProceedings.value!.publicationSeriesIssue = updatedInfo.publicationSeriesIssue;
            rightProceedings.value!.publicationSeriesVolume = updatedInfo.publicationSeriesVolume;
            rightProceedings.value!.publisherId = updatedInfo.publisherId;
            rightProceedings.value!.scopusId = updatedInfo.scopusId;
            
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

                MergeService.saveMergedProceedingsMetadata(
                leftProceedings.value?.id as number, rightProceedings.value?.id as number,
                {
                    leftProceedings: leftProceedings.value as Proceedings, 
                    rightProceedings: rightProceedings.value as Proceedings,
                    leftProofs: leftProceedings.value?.proofs?.map(file => file.id) as number[],
                    leftFileItems: leftProceedings.value?.fileItems?.map(file => file.id) as number[],
                    rightProofs: rightProceedings.value?.proofs?.map(file => file.id) as number[],
                    rightFileItems: rightProceedings.value?.fileItems?.map(file => file.id) as number[]
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
            leftProceedings.value!.description = description;
        };

        const updateRightDescription = (description: MultilingualContent[]) => {
            rightProceedings.value!.description = description;
        };

        const updateLeftKeywords = (keywords: MultilingualContent[]) => {
            leftProceedings.value!.keywords = keywords;
        };

        const updateRightKeywords = (keywords: MultilingualContent[]) => {
            rightProceedings.value!.keywords = keywords;
        };

        const deleteSide = (side: ComparisonSide, isForceDelete = false) => {
            const id = side === ComparisonSide.LEFT ? leftProceedings.value?.id as number : rightProceedings.value?.id as number;
            const name = side === ComparisonSide.LEFT ? leftProceedings.value?.title : rightProceedings.value?.title;

            const deleteAction = isForceDelete 
                ? ProceedingsService.forceDeleteProceedings(id)
                : ProceedingsService.deleteProceedings(id);

            deleteAction.then(() => {
                router.push({ name: "deduplication", query: { tab: "documents" } });
            }).catch(() => {
                snackbarMessage.value = i18n.t("deleteFailedNotification", { name: returnCurrentLocaleContent(name) });
                snackbar.value = true;
            });
        };

        return {
            returnCurrentLocaleContent,
            snackbar, snackbarMessage,
            leftProceedings, rightProceedings,
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
