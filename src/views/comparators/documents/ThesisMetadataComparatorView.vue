<template>
    <v-container id="thesis-publications-comparator">
        <v-row class="d-flex flex-row justify-center align-start">
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ returnCurrentLocaleContent(leftThesis?.title) }}
                </h2>
                <br />

                <thesis-update-form
                    ref="updateLeftRef" :preset-thesis="leftThesis" in-comparator :in-modal="false"
                    @update="updateLeft"></thesis-update-form>

                <br />

                <description-or-biography-update-form ref="updateLeftDescriptionRef" :preset-description-or-biography="(leftThesis?.description as MultilingualContent[])" @update="updateLeftDescription"></description-or-biography-update-form>

                <keyword-update-form ref="updateLeftKeywordsRef" :preset-keywords="(leftThesis?.keywords as MultilingualContent[])" @update="updateRightKeywords"></keyword-update-form>

                <br />

                <!-- Left Contributions Table -->
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div>
                            <b>{{ $t("contributionsLabel") }}</b>
                        </div>

                        <person-document-contribution-list
                            :contribution-list="leftThesis?.contributions ? leftThesis.contributions : []"
                            :document-id="leftThesis?.id"
                            :can-reorder="true"
                            in-comparator>
                        </person-document-contribution-list>
                    </v-card-text>
                </v-card>

                <attachment-section :document="leftThesis" :proofs="leftThesis?.proofs" :file-items="leftThesis?.fileItems"></attachment-section>
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
                    {{ returnCurrentLocaleContent(rightThesis?.title) }}
                </h2>

                <br />

                <thesis-update-form
                    ref="updateRightRef" :preset-thesis="rightThesis" in-comparator :in-modal="false"
                    @update="updateRight"></thesis-update-form>

                <br />

                <description-or-biography-update-form ref="updateRightDescriptionRef" :preset-description-or-biography="(rightThesis?.description as MultilingualContent[])" @update="updateRightDescription"></description-or-biography-update-form>

                <keyword-update-form ref="updateRightKeywordsRef" :preset-keywords="(rightThesis?.keywords as MultilingualContent[])" @update="updateRightKeywords"></keyword-update-form>

                <br />

                <!-- Right Contributions Table -->
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div>
                            <b>{{ $t("contributionsLabel") }}</b>
                        </div>

                        <person-document-contribution-list
                            :contribution-list="rightThesis?.contributions ? rightThesis.contributions : []"
                            :document-id="rightThesis?.id"
                            :can-reorder="true"
                            in-comparator>
                        </person-document-contribution-list>
                    </v-card-text>
                </v-card>

                <attachment-section :document="rightThesis" :proofs="rightThesis?.proofs" :file-items="rightThesis?.fileItems"></attachment-section>
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
import type { Thesis } from '@/models/PublicationModel';
import PersonDocumentContributionList from '@/components/core/PersonDocumentContributionList.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import ThesisUpdateForm from '@/components/publication/update/ThesisUpdateForm.vue';
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
    name: "ThesisMetadataComparator",
    components: { PersonDocumentContributionList, ThesisUpdateForm, DescriptionOrBiographyUpdateForm, KeywordUpdateForm, ComparisonActions, AttachmentSection, Toast },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const leftThesis = ref<Thesis>();
        const rightThesis = ref<Thesis>();

        const updateLeftRef = ref<typeof ThesisUpdateForm>();
        const updateRightRef = ref<typeof ThesisUpdateForm>();
        const updateRightDescriptionRef = ref<typeof DescriptionOrBiographyUpdateForm>();
        const updateLeftDescriptionRef = ref<typeof DescriptionOrBiographyUpdateForm>();
        const updateRightKeywordsRef = ref<typeof KeywordUpdateForm>();
        const updateLeftKeywordsRef = ref<typeof KeywordUpdateForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("thesisMetadataComparatorLabel");
            fetchThesiss();
        });

        const fetchThesiss = () => {
            DocumentPublicationService.readThesis(parseInt(currentRoute.params.leftId as string)).then((response) => {
                leftThesis.value = response.data;
                leftThesis.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
            });

            DocumentPublicationService.readThesis(parseInt(currentRoute.params.rightId as string)).then((response) => {
                rightThesis.value = response.data;
                rightThesis.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
            });
        };

        const mergeThesisMetadata = (thesis1: Thesis, thesis2: Thesis) => {
            mergeMultilingualContentField(thesis1.title, thesis2.title);

            mergeMultilingualContentField(thesis1.subTitle, thesis2.subTitle);
            thesis2.subTitle = [];

            mergeMultilingualContentField(thesis1.keywords, thesis2.keywords);
            thesis2.keywords = [];

            mergeMultilingualContentField(thesis1.description, thesis2.description);
            thesis2.description = [];

            mergeMultilingualContentField(thesis1.scientificArea, thesis2.scientificArea);
            thesis2.scientificArea = [];

            mergeMultilingualContentField(thesis1.scientificSubArea, thesis2.scientificSubArea);
            thesis2.scientificSubArea = [];

            mergeMultilingualContentField(thesis1.typeOfTitle, thesis2.typeOfTitle);
            thesis2.typeOfTitle = [];

            mergeMultilingualContentField(thesis1.placeOfKeep, thesis2.placeOfKeep);
            thesis2.placeOfKeep = [];

            mergeDocumentAttachments(thesis1, thesis2);

            thesis1.organisationUnitId = thesis2.organisationUnitId;
            thesis1.thesisType = thesis2.thesisType;
            thesis1.printISBN = thesis2.printISBN;
            thesis2.printISBN = "";
            thesis1.eisbn = thesis2.eisbn;
            thesis2.eisbn = "";
            thesis1.udc = thesis2.udc;
            thesis2.udc = "";

            thesis1.numberOfPages = thesis2.numberOfPages;
            thesis2.numberOfPages = 0;
            thesis1.numberOfChapters = thesis2.numberOfChapters;
            thesis2.numberOfChapters = 0;
            thesis1.numberOfReferences = thesis2.numberOfReferences;
            thesis2.numberOfReferences = 0;
            thesis1.numberOfGraphs = thesis2.numberOfGraphs;
            thesis2.numberOfGraphs = 0;
            thesis1.numberOfIllustrations = thesis2.numberOfIllustrations;
            thesis2.numberOfIllustrations = 0;
            thesis1.numberOfTables = thesis2.numberOfTables;
            thesis2.numberOfTables = 0;
            thesis1.numberOfAppendices = thesis2.numberOfAppendices;
            thesis2.numberOfAppendices = 0;
            thesis1.doi = thesis2.doi;
            thesis2.doi = "";
            thesis1.openAlexId = thesis2.openAlexId;
            thesis2.openAlexId = "";
            thesis1.webOfScienceId = thesis2.webOfScienceId;
            thesis2.webOfScienceId = "";
            thesis1.scopusId = thesis2.scopusId;
            thesis2.scopusId = "";
            thesis1.documentDate = thesis2.documentDate;

            thesis1.eventId = thesis2.eventId;
            thesis1.publisherId = thesis2.publisherId;
            thesis1.authorReprint = thesis2.authorReprint;

            thesis2.uris!.forEach(uri => {
                if (!thesis1.uris!.includes(uri)) {
                    thesis1.uris!.push(uri);
                }
            });
            thesis2.uris = [];

            thesis1.languageId = thesis2.languageId;
            thesis2.languageId = undefined;

            thesis1.writingLanguageTagId = thesis2.writingLanguageTagId;
            thesis2.writingLanguageTagId = undefined;

            thesis1.contributions = thesis1.contributions?.concat(thesis2.contributions as PersonDocumentContribution[]);
            thesis2.contributions = [];

            return [thesis1, thesis2];
        };

        const moveAll = (fromLeftToRight: boolean) => {
            updateLeftKeywordsRef.value?.submit();
            updateRightKeywordsRef.value?.submit();
            updateLeftDescriptionRef.value?.submit();
            updateRightDescriptionRef.value?.submit();
            updateLeftRef.value?.submit();
            updateRightRef.value?.submit();

            if (fromLeftToRight) {
                [rightThesis.value, leftThesis.value] = mergeThesisMetadata(rightThesis.value as Thesis, leftThesis.value as Thesis);
            } else {
                [leftThesis.value, rightThesis.value] = mergeThesisMetadata(leftThesis.value as Thesis, rightThesis.value as Thesis);
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

        const updateLeft = (updatedInfo: Thesis) => {
            leftThesis.value!.title = updatedInfo.title;
            leftThesis.value!.subTitle = updatedInfo.subTitle;
            leftThesis.value!.description = updatedInfo.description;
            leftThesis.value!.keywords = updatedInfo.keywords;
            leftThesis.value!.uris = updatedInfo.uris;
            leftThesis.value!.documentDate = updatedInfo.documentDate;
            leftThesis.value!.doi = updatedInfo.doi;
            leftThesis.value!.openAlexId = updatedInfo.openAlexId;
            leftThesis.value!.webOfScienceId = updatedInfo.webOfScienceId;
            leftThesis.value!.numberOfPages = updatedInfo.numberOfPages;
            leftThesis.value!.numberOfChapters = updatedInfo.numberOfChapters;
            leftThesis.value!.numberOfReferences = updatedInfo.numberOfReferences;
            leftThesis.value!.numberOfIllustrations = updatedInfo.numberOfIllustrations;
            leftThesis.value!.numberOfTables = updatedInfo.numberOfTables;
            leftThesis.value!.numberOfGraphs = updatedInfo.numberOfGraphs;
            leftThesis.value!.numberOfAppendices = updatedInfo.numberOfAppendices;
            leftThesis.value!.organisationUnitId = updatedInfo.organisationUnitId;
            leftThesis.value!.languageId = updatedInfo.languageId;
            leftThesis.value!.writingLanguageTagId = updatedInfo.writingLanguageTagId;
            leftThesis.value!.thesisType = updatedInfo.thesisType;
            leftThesis.value!.publisherId = updatedInfo.publisherId;
            leftThesis.value!.externalOrganisationUnitName = updatedInfo.externalOrganisationUnitName;
            leftThesis.value!.topicAcceptanceDate = updatedInfo.topicAcceptanceDate;
            leftThesis.value!.thesisDefenceDate = updatedInfo.thesisDefenceDate;
            leftThesis.value!.printISBN = updatedInfo.printISBN;
            leftThesis.value!.eisbn = updatedInfo.eisbn;
            leftThesis.value!.placeOfKeep = updatedInfo.placeOfKeep;
            leftThesis.value!.udc = updatedInfo.udc;
            leftThesis.value!.typeOfTitle = updatedInfo.typeOfTitle;
            leftThesis.value!.authorReprint = updatedInfo.authorReprint;
            leftThesis.value!.scopusId = updatedInfo.scopusId;
            
            if (update.value) {
                leftUpdateComplete.value = true;
                finishUpdates();
            }
        };

        const updateRight = (updatedInfo: Thesis) => {
            rightThesis.value!.title = updatedInfo.title;
            rightThesis.value!.subTitle = updatedInfo.subTitle;
            rightThesis.value!.description = updatedInfo.description;
            rightThesis.value!.keywords = updatedInfo.keywords;
            rightThesis.value!.uris = updatedInfo.uris;
            rightThesis.value!.documentDate = updatedInfo.documentDate;
            rightThesis.value!.doi = updatedInfo.doi;
            rightThesis.value!.openAlexId = updatedInfo.openAlexId;
            rightThesis.value!.webOfScienceId = updatedInfo.webOfScienceId;
            rightThesis.value!.numberOfPages = updatedInfo.numberOfPages;
            rightThesis.value!.numberOfChapters = updatedInfo.numberOfChapters;
            rightThesis.value!.numberOfReferences = updatedInfo.numberOfReferences;
            rightThesis.value!.numberOfIllustrations = updatedInfo.numberOfIllustrations;
            rightThesis.value!.numberOfTables = updatedInfo.numberOfTables;
            rightThesis.value!.numberOfGraphs = updatedInfo.numberOfGraphs;
            rightThesis.value!.numberOfAppendices = updatedInfo.numberOfAppendices;
            rightThesis.value!.organisationUnitId = updatedInfo.organisationUnitId;
            rightThesis.value!.languageId = updatedInfo.languageId;
            rightThesis.value!.writingLanguageTagId = updatedInfo.writingLanguageTagId;
            rightThesis.value!.thesisType = updatedInfo.thesisType;
            rightThesis.value!.publisherId = updatedInfo.publisherId;
            rightThesis.value!.externalOrganisationUnitName = updatedInfo.externalOrganisationUnitName;
            rightThesis.value!.topicAcceptanceDate = updatedInfo.topicAcceptanceDate;
            rightThesis.value!.thesisDefenceDate = updatedInfo.thesisDefenceDate;
            rightThesis.value!.printISBN = updatedInfo.printISBN;
            rightThesis.value!.eisbn = updatedInfo.eisbn;
            rightThesis.value!.placeOfKeep = updatedInfo.placeOfKeep;
            rightThesis.value!.udc = updatedInfo.udc;
            rightThesis.value!.typeOfTitle = updatedInfo.typeOfTitle;
            rightThesis.value!.authorReprint = updatedInfo.authorReprint;
            rightThesis.value!.scopusId = updatedInfo.scopusId;
            
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
            
                MergeService.saveMergedThesesMetadata(
                    leftThesis.value?.id as number, rightThesis.value?.id as number,
                    {
                        leftThesis: leftThesis.value as Thesis, 
                        rightThesis: rightThesis.value as Thesis,
                        leftProofs: leftThesis.value?.proofs?.map(file => file.id) as number[],
                        leftFileItems: leftThesis.value?.fileItems?.map(file => file.id) as number[],
                        rightProofs: rightThesis.value?.proofs?.map(file => file.id) as number[],
                        rightFileItems: rightThesis.value?.fileItems?.map(file => file.id) as number[]
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
            leftThesis.value!.description = description;
        };

        const updateRightDescription = (description: MultilingualContent[]) => {
            rightThesis.value!.description = description;
        };

        const updateLeftKeywords = (keywords: MultilingualContent[]) => {
            leftThesis.value!.keywords = keywords;
        };

        const updateRightKeywords = (keywords: MultilingualContent[]) => {
            rightThesis.value!.keywords = keywords;
        };

        const deleteSide = async (side: ComparisonSide) => {
            const id = side === ComparisonSide.LEFT ? leftThesis.value?.id : rightThesis.value?.id;
            const transferTargetId = side === ComparisonSide.LEFT ? rightThesis.value?.id : leftThesis.value?.id;

            try {
                await MergeService.migratePublicationIdentifierHistory(id as number, transferTargetId as number, "publication");
                await DocumentPublicationService.deleteDocumentPublication(id as number);
                await MergeService.switchAllIndicatorsToOtherDocument(id as number, transferTargetId as number);

                router.push({ name: "thesisLandingPage", params: { id: transferTargetId } });
            } catch {
                const name = side === ComparisonSide.LEFT ? leftThesis.value?.title : rightThesis.value?.title;
                snackbarMessage.value = i18n.t("deleteFailedNotification", { name: returnCurrentLocaleContent(name) });
                snackbar.value = true;
            }
        };

        return {
            returnCurrentLocaleContent,
            snackbar, snackbarMessage,
            leftThesis, rightThesis,
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
