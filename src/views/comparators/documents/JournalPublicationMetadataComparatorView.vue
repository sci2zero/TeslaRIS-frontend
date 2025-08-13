<template>
    <v-container id="journalPublication-publications-comparator">
        <v-row class="d-flex flex-row justify-center align-start">
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ returnCurrentLocaleContent(leftJournalPublication?.title) }}
                </h2>
                <br />

                <journal-publication-update-form
                    ref="updateLeftRef" :preset-journal-publication="leftJournalPublication" in-comparator :in-modal="false"
                    @update="updateLeft"></journal-publication-update-form>

                <br />

                <description-or-biography-update-form ref="updateLeftDescriptionRef" :preset-description-or-biography="(leftJournalPublication?.description as MultilingualContent[])" @update="updateLeftDescription"></description-or-biography-update-form>

                <keyword-update-form ref="updateLeftKeywordsRef" :preset-keywords="(leftJournalPublication?.keywords as MultilingualContent[])" @update="updateRightKeywords"></keyword-update-form>

                <br />

                <!-- Left Contributions Table -->
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div>
                            <b>{{ $t("contributionsLabel") }}</b>
                        </div>

                        <person-document-contribution-list
                            :contribution-list="leftJournalPublication?.contributions ? leftJournalPublication.contributions : []"
                            :document-id="leftJournalPublication?.id"
                            :can-reorder="true"
                            in-comparator>
                        </person-document-contribution-list>
                    </v-card-text>
                </v-card>

                <attachment-section :document="leftJournalPublication" :proofs="leftJournalPublication?.proofs" :file-items="leftJournalPublication?.fileItems"></attachment-section>
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
                    {{ returnCurrentLocaleContent(rightJournalPublication?.title) }}
                </h2>

                <br />

                <journal-publication-update-form
                    ref="updateRightRef" :preset-journal-publication="rightJournalPublication" in-comparator :in-modal="false"
                    @update="updateRight"></journal-publication-update-form>

                <br />

                <description-or-biography-update-form ref="updateRightDescriptionRef" :preset-description-or-biography="(rightJournalPublication?.description as MultilingualContent[])" @update="updateRightDescription"></description-or-biography-update-form>

                <keyword-update-form ref="updateRightKeywordsRef" :preset-keywords="(rightJournalPublication?.keywords as MultilingualContent[])" @update="updateRightKeywords"></keyword-update-form>

                <br />

                <!-- Right Contributions Table -->
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div>
                            <b>{{ $t("contributionsLabel") }}</b>
                        </div>

                        <person-document-contribution-list
                            :contribution-list="rightJournalPublication?.contributions ? rightJournalPublication.contributions : []"
                            :document-id="rightJournalPublication?.id"
                            :can-reorder="true"
                            in-comparator>
                        </person-document-contribution-list>
                    </v-card-text>
                </v-card>

                <attachment-section :document="rightJournalPublication" :proofs="rightJournalPublication?.proofs" :file-items="rightJournalPublication?.fileItems"></attachment-section>
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
import PersonDocumentContributionList from '@/components/core/PersonDocumentContributionList.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import JournalPublicationUpdateForm from '@/components/publication/update/JournalPublicationUpdateForm.vue';
import type { PersonDocumentContribution, JournalPublication } from '@/models/PublicationModel';
import type { MultilingualContent } from '@/models/Common';
import DescriptionOrBiographyUpdateForm from '@/components/core/update/DescriptionOrBiographyUpdateForm.vue';
import KeywordUpdateForm from '@/components/core/update/KeywordUpdateForm.vue';
import MergeService from '@/services/MergeService';
import ComparisonActions from '@/components/core/comparators/ComparisonActions.vue';
import { ComparisonSide } from '@/models/MergeModel';
import { mergeDocumentAttachments } from '@/utils/AttachmentUtil';
import AttachmentSection from '@/components/core/AttachmentSection.vue';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import Toast from '@/components/core/Toast.vue';


export default defineComponent({
    name: "JournalPublicationMetadataComparator",
    components: { PersonDocumentContributionList, Toast, JournalPublicationUpdateForm, DescriptionOrBiographyUpdateForm, KeywordUpdateForm, ComparisonActions, AttachmentSection },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const leftJournalPublication = ref<JournalPublication>();
        const rightJournalPublication = ref<JournalPublication>();

        const updateLeftRef = ref<typeof JournalPublicationUpdateForm>();
        const updateRightRef = ref<typeof JournalPublicationUpdateForm>();
        const updateRightDescriptionRef = ref<typeof DescriptionOrBiographyUpdateForm>();
        const updateLeftDescriptionRef = ref<typeof DescriptionOrBiographyUpdateForm>();
        const updateRightKeywordsRef = ref<typeof KeywordUpdateForm>();
        const updateLeftKeywordsRef = ref<typeof KeywordUpdateForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("journalPublicationMetadataComparatorLabel");
            fetchJournals();
        });

        const fetchJournals = () => {
            DocumentPublicationService.readJournalPublication(parseInt(currentRoute.params.leftId as string)).then((response) => {
                leftJournalPublication.value = response.data;
                leftJournalPublication.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
            });

            DocumentPublicationService.readJournalPublication(parseInt(currentRoute.params.rightId as string)).then((response) => {
                rightJournalPublication.value = response.data;
                rightJournalPublication.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
            });
        };

        const mergeJournalMetadata = (journalPublication1: JournalPublication, journalPublication2: JournalPublication) => {
            mergeMultilingualContentField(journalPublication1.title, journalPublication2.title);

            mergeMultilingualContentField(journalPublication1.subTitle, journalPublication2.subTitle);
            journalPublication2.subTitle = [];

            mergeMultilingualContentField(journalPublication1.keywords, journalPublication2.keywords);
            journalPublication2.keywords = [];

            mergeMultilingualContentField(journalPublication1.description, journalPublication2.description);
            journalPublication2.description = [];

            mergeDocumentAttachments(journalPublication1, journalPublication2);
            
            journalPublication1.journalPublicationType = journalPublication2.journalPublicationType;
            journalPublication1.numberOfPages = journalPublication2.numberOfPages;
            journalPublication2.numberOfPages = 0;
            journalPublication1.doi = journalPublication2.doi;
            journalPublication2.doi = "";
            journalPublication1.scopusId = journalPublication2.scopusId;
            journalPublication2.scopusId = "";
            journalPublication1.documentDate = journalPublication2.documentDate;
            journalPublication1.startPage = journalPublication2.startPage;
            journalPublication2.startPage = "";
            journalPublication1.endPage = journalPublication2.endPage;
            journalPublication2.endPage = "";
            journalPublication1.articleNumber = journalPublication2.articleNumber;
            journalPublication2.articleNumber = "";
            journalPublication1.volume = journalPublication2.volume;
            journalPublication2.volume = "";
            journalPublication1.issue = journalPublication2.issue;
            journalPublication2.issue = "";
            journalPublication1.openAlexId = journalPublication2.openAlexId;
            journalPublication2.openAlexId = "";

            journalPublication1.eventId = journalPublication2.eventId;
            journalPublication1.journalId = journalPublication2.journalId;

            journalPublication2.uris!.forEach(uri => {
                if (!journalPublication1.uris!.includes(uri)) {
                    journalPublication1.uris!.push(uri);
                }
            });
            journalPublication2.uris = [];

            journalPublication1.contributions = journalPublication1.contributions?.concat(journalPublication2.contributions as PersonDocumentContribution[]);
            journalPublication2.contributions = [];

            return [journalPublication1, journalPublication2];
        };

        const moveAll = (fromLeftToRight: boolean) => {
            updateLeftKeywordsRef.value?.submit();
            updateRightKeywordsRef.value?.submit();
            updateLeftDescriptionRef.value?.submit();
            updateRightDescriptionRef.value?.submit();
            updateLeftRef.value?.submit();
            updateRightRef.value?.submit();

            if (fromLeftToRight) {
                [rightJournalPublication.value, leftJournalPublication.value] = mergeJournalMetadata(rightJournalPublication.value as JournalPublication, leftJournalPublication.value as JournalPublication);
            } else {
                [leftJournalPublication.value, rightJournalPublication.value] = mergeJournalMetadata(leftJournalPublication.value as JournalPublication, rightJournalPublication.value as JournalPublication);
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

        const updateLeft = (updatedInfo: JournalPublication) => {
            leftJournalPublication.value!.title = updatedInfo.title;
            leftJournalPublication.value!.subTitle = updatedInfo.subTitle;
            leftJournalPublication.value!.description = updatedInfo.description;
            leftJournalPublication.value!.keywords = updatedInfo.keywords;
            leftJournalPublication.value!.uris = updatedInfo.uris;
            leftJournalPublication.value!.documentDate = updatedInfo.documentDate;
            leftJournalPublication.value!.doi = updatedInfo.doi;
            leftJournalPublication.value!.startPage = updatedInfo.startPage;
            leftJournalPublication.value!.endPage = updatedInfo.endPage;
            leftJournalPublication.value!.articleNumber = updatedInfo.articleNumber;
            leftJournalPublication.value!.journalPublicationType = updatedInfo.journalPublicationType;
            leftJournalPublication.value!.volume = updatedInfo.volume;
            leftJournalPublication.value!.issue = updatedInfo.issue;
            leftJournalPublication.value!.journalId = updatedInfo.journalId;
            leftJournalPublication.value!.eventId = updatedInfo.eventId;
            leftJournalPublication.value!.numberOfPages = updatedInfo.numberOfPages;
            leftJournalPublication.value!.scopusId = updatedInfo.scopusId;
            leftJournalPublication.value!.openAlexId = updatedInfo.openAlexId;
            
            if (update.value) {
                leftUpdateComplete.value = true;
                finishUpdates();
            }
        };

        const updateRight = (updatedInfo: JournalPublication) => {
            rightJournalPublication.value!.title = updatedInfo.title;
            rightJournalPublication.value!.subTitle = updatedInfo.subTitle;
            rightJournalPublication.value!.description = updatedInfo.description;
            rightJournalPublication.value!.keywords = updatedInfo.keywords;
            rightJournalPublication.value!.uris = updatedInfo.uris;
            rightJournalPublication.value!.documentDate = updatedInfo.documentDate;
            rightJournalPublication.value!.doi = updatedInfo.doi;
            rightJournalPublication.value!.startPage = updatedInfo.startPage;
            rightJournalPublication.value!.endPage = updatedInfo.endPage;
            rightJournalPublication.value!.articleNumber = updatedInfo.articleNumber;
            rightJournalPublication.value!.journalPublicationType = updatedInfo.journalPublicationType;
            rightJournalPublication.value!.volume = updatedInfo.volume;
            rightJournalPublication.value!.issue = updatedInfo.issue;
            rightJournalPublication.value!.journalId = updatedInfo.journalId;
            rightJournalPublication.value!.eventId = updatedInfo.eventId;
            rightJournalPublication.value!.numberOfPages = updatedInfo.numberOfPages;
            rightJournalPublication.value!.scopusId = updatedInfo.scopusId;
            rightJournalPublication.value!.openAlexId = updatedInfo.openAlexId;
            
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
            
                MergeService.saveMergedJournalPublicationsMetadata(
                    leftJournalPublication.value?.id as number, rightJournalPublication.value?.id as number,
                    {
                        leftJournalPublication: leftJournalPublication.value as JournalPublication, 
                        rightJournalPublication: rightJournalPublication.value as JournalPublication,
                        leftProofs: leftJournalPublication.value?.proofs?.map(file => file.id) as number[],
                        leftFileItems: leftJournalPublication.value?.fileItems?.map(file => file.id) as number[],
                        rightProofs: rightJournalPublication.value?.proofs?.map(file => file.id) as number[],
                        rightFileItems: rightJournalPublication.value?.fileItems?.map(file => file.id) as number[]
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
            leftJournalPublication.value!.description = description;
        };

        const updateRightDescription = (description: MultilingualContent[]) => {
            rightJournalPublication.value!.description = description;
        };

        const updateLeftKeywords = (keywords: MultilingualContent[]) => {
            leftJournalPublication.value!.keywords = keywords;
        };

        const updateRightKeywords = (keywords: MultilingualContent[]) => {
            rightJournalPublication.value!.keywords = keywords;
        };

        const deleteSide = async (side: ComparisonSide) => {
            const id = side === ComparisonSide.LEFT ? leftJournalPublication.value?.id : rightJournalPublication.value?.id;
            const transferTargetId = side === ComparisonSide.LEFT ? rightJournalPublication.value?.id : leftJournalPublication.value?.id;

            try {
                await MergeService.migratePublicationIdentifierHistory(id as number, transferTargetId as number, "publication");
                await DocumentPublicationService.deleteDocumentPublication(id as number);
                await MergeService.switchAllIndicatorsToOtherDocument(id as number, transferTargetId as number);

                router.push({ name: "journalPublicationLandingPage", params: { id: transferTargetId } });
            } catch {
                const name = side === ComparisonSide.LEFT ? leftJournalPublication.value?.title : rightJournalPublication.value?.title;
                snackbarMessage.value = i18n.t("deleteFailedNotification", { name: returnCurrentLocaleContent(name) });
                snackbar.value = true;
            }
        };

        return {
            returnCurrentLocaleContent,
            snackbar, snackbarMessage,
            leftJournalPublication, rightJournalPublication,
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
