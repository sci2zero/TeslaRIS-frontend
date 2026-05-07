<template>
    <v-container id="thesis-publications-comparator">
        <v-row class="d-flex flex-row justify-center align-start">
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ returnCurrentLocaleContent(leftThesis?.title) }}
                </h2>
                <br />

                <thesis-update-form
                    ref="updateLeftRef"
                    :preset-thesis="leftThesis"
                    in-comparator
                    :in-modal="false"
                    @update="updateLeft"
                />

                <br />

                <description-or-biography-update-form
                    ref="updateLeftDescriptionRef"
                    :preset-description-or-biography="(leftThesis?.description as MultilingualContent[])"
                    @update="updateLeftDescription"
                />

                <keyword-update-form
                    ref="updateLeftKeywordsRef"
                    :preset-keywords="(leftThesis?.keywords as MultilingualContent[])"
                    @update="updateRightKeywords"
                />

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
                            in-comparator
                        />
                    </v-card-text>
                </v-card>

                <attachment-section
                    :document="leftThesis"
                    :proofs="leftThesis?.proofs"
                    :file-items="leftThesis?.fileItems"
                    :preliminary-files="leftThesis?.preliminaryFiles"
                    :preliminary-supplements="leftThesis?.preliminarySupplements"
                    :commission-reports="leftThesis?.commissionReports"
                    in-comparator
                    show-all-thesis-sections
                />
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
                    ref="updateRightRef"
                    :preset-thesis="rightThesis"
                    in-comparator
                    :in-modal="false"
                    @update="updateRight"
                />

                <br />

                <description-or-biography-update-form
                    ref="updateRightDescriptionRef"
                    :preset-description-or-biography="(rightThesis?.description as MultilingualContent[])"
                    @update="updateRightDescription"
                />

                <keyword-update-form
                    ref="updateRightKeywordsRef"
                    :preset-keywords="(rightThesis?.keywords as MultilingualContent[])"
                    @update="updateRightKeywords"
                />

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
                            in-comparator
                        />
                    </v-card-text>
                </v-card>

                <attachment-section
                    :document="rightThesis"
                    :proofs="rightThesis?.proofs"
                    :file-items="rightThesis?.fileItems"
                    :preliminary-files="rightThesis?.preliminaryFiles"
                    :preliminary-supplements="rightThesis?.preliminarySupplements"
                    :commission-reports="rightThesis?.commissionReports"
                    in-comparator
                    show-all-thesis-sections
                />
            </v-col>
        </v-row>

        <comparison-actions
            :is-form-valid="updateLeftRef?.isFormValid && updateRightRef?.isFormValid"
            :left-id="(leftThesis?.id as number)"
            :right-id="(rightThesis?.id as number)"
            :entity-type="EntityType.PUBLICATION"
            @update="updateAll"
            @delete="deleteSide($event)"
        />

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
import type { MultilingualContent } from '@/models/Common';
import DescriptionOrBiographyUpdateForm from '@/components/core/update/DescriptionOrBiographyUpdateForm.vue';
import KeywordUpdateForm from '@/components/core/update/KeywordUpdateForm.vue';
import MergeService from '@/services/MergeService';
import ComparisonActions from '@/components/core/comparators/ComparisonActions.vue';
import { ComparisonSide, EntityType } from '@/models/MergeModel';
import { mergeDocumentAttachments } from '@/utils/AttachmentUtil';
import AttachmentSection from '@/components/core/AttachmentSection.vue';
import Toast from '@/components/core/Toast.vue';
import { bulkTransferFields } from '@/utils/FieldTransferUtil';
import { mergeCommonMetadata, updateCommonBasicInfo } from '@/utils/CommonDocumentFieldsUtil';


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
            mergeCommonMetadata(thesis1, thesis2);

            mergeMultilingualContentField(thesis1.scientificArea, thesis2.scientificArea);
            thesis2.scientificArea = [];

            mergeMultilingualContentField(thesis1.scientificSubArea, thesis2.scientificSubArea);
            thesis2.scientificSubArea = [];

            mergeMultilingualContentField(thesis1.typeOfTitle, thesis2.typeOfTitle);
            thesis2.typeOfTitle = [];

            mergeMultilingualContentField(thesis1.placeOfKeep, thesis2.placeOfKeep);
            thesis2.placeOfKeep = [];

            mergeDocumentAttachments(thesis1, thesis2);

            bulkTransferFields(thesis1, thesis2, [
                { fieldName: "topicAcceptanceDate", emptyValue: null, setEmpty: false },
                { fieldName: "thesisDefenceDate", emptyValue: null, setEmpty: false },
                { fieldName: "organisationUnitId", emptyValue: null, setEmpty: false },
                { fieldName: "thesisType", emptyValue: null, setEmpty: false },
                { fieldName: "printISBN", emptyValue: "" },
                { fieldName: "eisbn", emptyValue: "" },
                { fieldName: "udc", emptyValue: "" },
                { fieldName: "numberOfPages", emptyValue: "" },
                { fieldName: "numberOfChapters", emptyValue: "" },
                { fieldName: "numberOfReferences", emptyValue: "" },
                { fieldName: "numberOfGraphs", emptyValue: "" },
                { fieldName: "numberOfIllustrations", emptyValue: "" },
                { fieldName: "numberOfTables", emptyValue: "" },
                { fieldName: "numberOfAppendices", emptyValue: "" },
                { fieldName: "publisherId", emptyValue: null, setEmpty: false },
                { fieldName: "authorReprint", emptyValue: null, setEmpty: false },
                { fieldName: "languageId", emptyValue: undefined },
                { fieldName: "writingLanguageTagId", emptyValue: undefined }
            ]);

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

            updateCommonBasicInfo(leftThesis, updatedInfo);
            
            if (update.value) {
                leftUpdateComplete.value = true;
                finishUpdates();
            }
        };

        const updateRight = (updatedInfo: Thesis) => {
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

            updateCommonBasicInfo(rightThesis, updatedInfo);
            
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
            deleteSide, EntityType
        };
}})

</script>
