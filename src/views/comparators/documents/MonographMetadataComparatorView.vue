<template>
    <v-container id="monograph-publications-comparator">
        <v-row class="d-flex flex-row justify-center align-start">
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ returnCurrentLocaleContent(leftMonograph?.title) }}
                </h2>
                <br />

                <monograph-update-form
                    ref="updateLeftRef" :preset-monograph="leftMonograph" in-comparator :in-modal="false"
                    @update="updateLeft"></monograph-update-form>

                <br />

                <description-or-biography-update-form ref="updateLeftDescriptionRef" :preset-description-or-biography="(leftMonograph?.description as MultilingualContent[])" @update="updateLeftDescription"></description-or-biography-update-form>

                <keyword-update-form ref="updateLeftKeywordsRef" :preset-keywords="(leftMonograph?.keywords as MultilingualContent[])" @update="updateRightKeywords"></keyword-update-form>

                <br />

                <!-- Left Contributions Table -->
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div>
                            <b>{{ $t("contributionsLabel") }}</b>
                        </div>

                        <person-document-contribution-list
                            :contribution-list="leftMonograph?.contributions ? leftMonograph.contributions : []"
                            :document-id="leftMonograph?.id"
                            :can-reorder="true"
                            in-comparator>
                        </person-document-contribution-list>
                    </v-card-text>
                </v-card>

                <attachment-section :document="leftMonograph" :proofs="leftMonograph?.proofs" :file-items="leftMonograph?.fileItems"></attachment-section>
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
                    {{ returnCurrentLocaleContent(rightMonograph?.title) }}
                </h2>

                <br />

                <monograph-update-form
                    ref="updateRightRef" :preset-monograph="rightMonograph" in-comparator :in-modal="false"
                    @update="updateRight"></monograph-update-form>

                <br />

                <description-or-biography-update-form ref="updateRightDescriptionRef" :preset-description-or-biography="(rightMonograph?.description as MultilingualContent[])" @update="updateRightDescription"></description-or-biography-update-form>

                <keyword-update-form ref="updateRightKeywordsRef" :preset-keywords="(rightMonograph?.keywords as MultilingualContent[])" @update="updateRightKeywords"></keyword-update-form>

                <br />

                <!-- Right Contributions Table -->
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div>
                            <b>{{ $t("contributionsLabel") }}</b>
                        </div>

                        <person-document-contribution-list
                            :contribution-list="rightMonograph?.contributions ? rightMonograph.contributions : []"
                            :document-id="rightMonograph?.id"
                            :can-reorder="true"
                            in-comparator>
                        </person-document-contribution-list>
                    </v-card-text>
                </v-card>

                <attachment-section :document="rightMonograph" :proofs="rightMonograph?.proofs" :file-items="rightMonograph?.fileItems"></attachment-section>
            </v-col>
        </v-row>

        <comparison-actions
            :is-form-valid="updateLeftRef?.isFormValid && updateRightRef?.isFormValid"
            :supports-force-delete="(isAdmin as boolean)"
            aggregated-entities-comparison-page="monographPublicationsComparator"
            :left-id="(leftMonograph?.id as number)"
            :right-id="(rightMonograph?.id as number)"
            :entity-type="EntityType.PUBLICATION"
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
import type { Monograph } from '@/models/PublicationModel';
import PersonDocumentContributionList from '@/components/core/PersonDocumentContributionList.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import MonographUpdateForm from '@/components/publication/update/MonographUpdateForm.vue';
import type { PersonDocumentContribution } from '@/models/PublicationModel';
import type { MultilingualContent } from '@/models/Common';
import DescriptionOrBiographyUpdateForm from '@/components/core/update/DescriptionOrBiographyUpdateForm.vue';
import KeywordUpdateForm from '@/components/core/update/KeywordUpdateForm.vue';
import MergeService from '@/services/MergeService';
import ComparisonActions from '@/components/core/comparators/ComparisonActions.vue';
import { ComparisonSide, EntityType } from '@/models/MergeModel';
import { mergeDocumentAttachments } from '@/utils/AttachmentUtil';
import AttachmentSection from '@/components/core/AttachmentSection.vue';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import Toast from '@/components/core/Toast.vue';
import { useUserRole } from '@/composables/useUserRole';
import { bulkTransferFields } from '@/utils/FieldTransferUtil';


export default defineComponent({
    name: "MonographMetadataComparator",
    components: { PersonDocumentContributionList, Toast, MonographUpdateForm, DescriptionOrBiographyUpdateForm, KeywordUpdateForm, ComparisonActions, AttachmentSection },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const leftMonograph = ref<Monograph>();
        const rightMonograph = ref<Monograph>();

        const updateLeftRef = ref<typeof MonographUpdateForm>();
        const updateRightRef = ref<typeof MonographUpdateForm>();
        const updateRightDescriptionRef = ref<typeof DescriptionOrBiographyUpdateForm>();
        const updateLeftDescriptionRef = ref<typeof DescriptionOrBiographyUpdateForm>();
        const updateRightKeywordsRef = ref<typeof KeywordUpdateForm>();
        const updateLeftKeywordsRef = ref<typeof KeywordUpdateForm>();

        const { isAdmin } = useUserRole();
        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("monographMetadataComparatorLabel");
            fetchMonographs();
        });

        const fetchMonographs = () => {
            DocumentPublicationService.readMonograph(parseInt(currentRoute.params.leftId as string)).then((response) => {
                leftMonograph.value = response.data;
                leftMonograph.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
            });

            DocumentPublicationService.readMonograph(parseInt(currentRoute.params.rightId as string)).then((response) => {
                rightMonograph.value = response.data;
                rightMonograph.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
            });
        };

        const mergeMonographMetadata = (monograph1: Monograph, monograph2: Monograph) => {
            mergeMultilingualContentField(monograph1.title, monograph2.title);

            mergeMultilingualContentField(monograph1.subTitle, monograph2.subTitle);
            monograph2.subTitle = [];

            mergeMultilingualContentField(monograph1.keywords, monograph2.keywords);
            monograph2.keywords = [];

            mergeMultilingualContentField(monograph1.description, monograph2.description);
            monograph2.description = [];

            mergeDocumentAttachments(monograph1, monograph2);

            bulkTransferFields(monograph1, monograph2, [
                { fieldName: "eisbn", emptyValue: "" },
                { fieldName: "printISBN", emptyValue: "" },
                { fieldName: "numberOfPages", emptyValue: 0 },
                { fieldName: "doi", emptyValue: "" },
                { fieldName: "scopusId", emptyValue: "" },
                { fieldName: "openAlexId", emptyValue: "" },
                { fieldName: "webOfScienceId", emptyValue: "" },
                { fieldName: "volume", emptyValue: "" },
                { fieldName: "number", emptyValue: "" },
                { fieldName: "monographType", emptyValue: null, setEmpty: false },
                { fieldName: "documentDate", emptyValue: null, setEmpty: false },
                { fieldName: "eventId", emptyValue: null, setEmpty: false },
                { fieldName: "publicationSeriesId", emptyValue: null, setEmpty: false },
                { fieldName: "researchAreaId", emptyValue: null, setEmpty: false },
                { fieldName: "publisherId", emptyValue: null, setEmpty: false },
                { fieldName: "authorReprint", emptyValue: null, setEmpty: false }
            ]);

            monograph2.languageIds!.forEach(languageId => {
                if (!monograph1.languageIds!.includes(languageId)) {
                    monograph1.languageIds!.push(languageId);
                }
            });
            monograph2.languageIds = [];

            monograph2.uris!.forEach(uri => {
                if (!monograph1.uris!.includes(uri)) {
                    monograph1.uris!.push(uri);
                }
            });
            monograph2.uris = [];

            monograph1.contributions = monograph1.contributions?.concat(monograph2.contributions as PersonDocumentContribution[]);
            monograph2.contributions = [];

            return [monograph1, monograph2];
        };

        const moveAll = (fromLeftToRight: boolean) => {
            updateLeftKeywordsRef.value?.submit();
            updateRightKeywordsRef.value?.submit();
            updateLeftDescriptionRef.value?.submit();
            updateRightDescriptionRef.value?.submit();
            updateLeftRef.value?.submit();
            updateRightRef.value?.submit();

            if (fromLeftToRight) {
                [rightMonograph.value, leftMonograph.value] = mergeMonographMetadata(rightMonograph.value as Monograph, leftMonograph.value as Monograph);
            } else {
                [leftMonograph.value, rightMonograph.value] = mergeMonographMetadata(leftMonograph.value as Monograph, rightMonograph.value as Monograph);
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

        const updateLeft = (updatedInfo: Monograph) => {
            leftMonograph.value!.title = updatedInfo.title;
            leftMonograph.value!.subTitle = updatedInfo.subTitle;
            leftMonograph.value!.description = updatedInfo.description;
            leftMonograph.value!.keywords = updatedInfo.keywords;
            leftMonograph.value!.uris = updatedInfo.uris;
            leftMonograph.value!.documentDate = updatedInfo.documentDate;
            leftMonograph.value!.doi = updatedInfo.doi;
            leftMonograph.value!.eisbn = updatedInfo.eisbn;
            leftMonograph.value!.eventId = updatedInfo.eventId;
            leftMonograph.value!.languageIds = updatedInfo.languageIds;
            leftMonograph.value!.numberOfPages = updatedInfo.numberOfPages;
            leftMonograph.value!.printISBN = updatedInfo.printISBN;
            leftMonograph.value!.publicationSeriesId = updatedInfo.publicationSeriesId;
            leftMonograph.value!.volume = updatedInfo.volume;
            leftMonograph.value!.number = updatedInfo.number;
            leftMonograph.value!.researchAreaId = updatedInfo.researchAreaId;
            leftMonograph.value!.scopusId = updatedInfo.scopusId;
            leftMonograph.value!.openAlexId = updatedInfo.openAlexId;
            leftMonograph.value!.webOfScienceId = updatedInfo.webOfScienceId;
            leftMonograph.value!.publisherId = updatedInfo.publisherId;
            leftMonograph.value!.authorReprint = updatedInfo.authorReprint;
            
            if (update.value) {
                leftUpdateComplete.value = true;
                finishUpdates();
            }
        };

        const updateRight = (updatedInfo: Monograph) => {
            rightMonograph.value!.title = updatedInfo.title;
            rightMonograph.value!.subTitle = updatedInfo.subTitle;
            rightMonograph.value!.description = updatedInfo.description;
            rightMonograph.value!.keywords = updatedInfo.keywords;
            rightMonograph.value!.uris = updatedInfo.uris;
            rightMonograph.value!.documentDate = updatedInfo.documentDate;
            rightMonograph.value!.doi = updatedInfo.doi;
            rightMonograph.value!.eisbn = updatedInfo.eisbn;
            rightMonograph.value!.eventId = updatedInfo.eventId;
            rightMonograph.value!.languageIds = updatedInfo.languageIds;
            rightMonograph.value!.numberOfPages = updatedInfo.numberOfPages;
            rightMonograph.value!.printISBN = updatedInfo.printISBN;
            rightMonograph.value!.publicationSeriesId = updatedInfo.publicationSeriesId;
            rightMonograph.value!.volume = updatedInfo.volume;
            rightMonograph.value!.number = updatedInfo.number;
            rightMonograph.value!.researchAreaId = updatedInfo.researchAreaId;
            rightMonograph.value!.scopusId = updatedInfo.scopusId;
            rightMonograph.value!.openAlexId = updatedInfo.openAlexId;
            rightMonograph.value!.webOfScienceId = updatedInfo.webOfScienceId;
            rightMonograph.value!.publisherId = updatedInfo.publisherId;
            rightMonograph.value!.authorReprint = updatedInfo.authorReprint;
            
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

                MergeService.saveMergedMonographsMetadata(
                leftMonograph.value?.id as number, rightMonograph.value?.id as number,
                {
                    leftMonograph: leftMonograph.value as Monograph, 
                    rightMonograph: rightMonograph.value as Monograph,
                    leftProofs: leftMonograph.value?.proofs?.map(file => file.id) as number[],
                    leftFileItems: leftMonograph.value?.fileItems?.map(file => file.id) as number[],
                    rightProofs: rightMonograph.value?.proofs?.map(file => file.id) as number[],
                    rightFileItems: rightMonograph.value?.fileItems?.map(file => file.id) as number[]
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
            leftMonograph.value!.description = description;
        };

        const updateRightDescription = (description: MultilingualContent[]) => {
            rightMonograph.value!.description = description;
        };

        const updateLeftKeywords = (keywords: MultilingualContent[]) => {
            leftMonograph.value!.keywords = keywords;
        };

        const updateRightKeywords = (keywords: MultilingualContent[]) => {
            rightMonograph.value!.keywords = keywords;
        };

        const deleteSide = async (side: ComparisonSide, isForceDelete = false) => {
            const id = side === ComparisonSide.LEFT ? leftMonograph.value?.id as number : rightMonograph.value?.id as number;
            const name = side === ComparisonSide.LEFT ? leftMonograph.value?.title : rightMonograph.value?.title;
            const transferTargetId = side === ComparisonSide.LEFT ? rightMonograph.value?.id : leftMonograph.value?.id;

            try {
                const deleteAction = isForceDelete 
                    ? DocumentPublicationService.forceDeleteMonograph(id)
                    : DocumentPublicationService.deleteMonograph(id);

                await deleteAction;

                await MergeService.migratePublicationIdentifierHistory(id, transferTargetId as number, "monograph");
                await MergeService.switchAllIndicatorsToOtherDocument(id as number, transferTargetId as number);

                router.push({ name: "monographLandingPage", params: { id: transferTargetId } });
            } catch {
                snackbarMessage.value = i18n.t("deleteFailedNotification", { name: returnCurrentLocaleContent(name) });
                snackbar.value = true;
            }
        };

        return {
            returnCurrentLocaleContent,
            snackbar, snackbarMessage,
            leftMonograph, rightMonograph,
            moveAll, updateAll, updateLeft, isAdmin,
            updateLeftRef, updateRightRef, updateRight,
            updateRightDescriptionRef, updateLeftDescriptionRef,
            updateRightKeywordsRef, updateLeftKeywordsRef,
            updateLeftDescription, updateRightDescription,
            updateLeftKeywords, updateRightKeywords,
            deleteSide, EntityType
        };
}})

</script>
