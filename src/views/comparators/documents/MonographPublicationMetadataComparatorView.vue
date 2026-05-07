<template>
    <v-container id="monographPublication-publications-comparator">
        <v-row class="d-flex flex-row justify-center align-start">
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ returnCurrentLocaleContent(leftMonographPublication?.title) }}
                </h2>
                <br />

                <monograph-publication-update-form
                    ref="updateLeftRef"
                    :preset-monograph-publication="leftMonographPublication"
                    in-comparator
                    :in-modal="false"
                    @update="updateLeft"
                />

                <br />

                <description-or-biography-update-form
                    ref="updateLeftDescriptionRef"
                    :preset-description-or-biography="(leftMonographPublication?.description as MultilingualContent[])"
                    @update="updateLeftDescription"
                />

                <keyword-update-form
                    ref="updateLeftKeywordsRef"
                    :preset-keywords="(leftMonographPublication?.keywords as MultilingualContent[])"
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
                            :contribution-list="leftMonographPublication?.contributions ? leftMonographPublication.contributions : []"
                            :document-id="leftMonographPublication?.id"
                            :can-reorder="true"
                            in-comparator
                        />
                    </v-card-text>
                </v-card>

                <attachment-section
                    :document="leftMonographPublication"
                    :proofs="leftMonographPublication?.proofs"
                    :file-items="leftMonographPublication?.fileItems"
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
                    {{ returnCurrentLocaleContent(rightMonographPublication?.title) }}
                </h2>

                <br />

                <monograph-publication-update-form
                    ref="updateRightRef"
                    :preset-monograph-publication="rightMonographPublication"
                    in-comparator
                    :in-modal="false"
                    @update="updateRight"
                />

                <br />

                <description-or-biography-update-form
                    ref="updateRightDescriptionRef"
                    :preset-description-or-biography="(rightMonographPublication?.description as MultilingualContent[])"
                    @update="updateRightDescription"
                />

                <keyword-update-form
                    ref="updateRightKeywordsRef"
                    :preset-keywords="(rightMonographPublication?.keywords as MultilingualContent[])"
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
                            :contribution-list="rightMonographPublication?.contributions ? rightMonographPublication.contributions : []"
                            :document-id="rightMonographPublication?.id"
                            in-comparator
                        />
                    </v-card-text>
                </v-card>

                <attachment-section
                    :document="rightMonographPublication"
                    :proofs="rightMonographPublication?.proofs"
                    :file-items="rightMonographPublication?.fileItems"
                />
            </v-col>
        </v-row>

        <comparison-actions
            :is-form-valid="updateLeftRef?.isFormValid && updateRightRef?.isFormValid"
            :left-id="(leftMonographPublication?.id as number)"
            :right-id="(rightMonographPublication?.id as number)"
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
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import PersonDocumentContributionList from '@/components/core/PersonDocumentContributionList.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import MonographPublicationUpdateForm from '@/components/publication/update/MonographPublicationUpdateForm.vue';
import type { MonographPublication } from '@/models/PublicationModel';
import type { MultilingualContent } from '@/models/Common';
import DescriptionOrBiographyUpdateForm from '@/components/core/update/DescriptionOrBiographyUpdateForm.vue';
import KeywordUpdateForm from '@/components/core/update/KeywordUpdateForm.vue';
import MergeService from '@/services/MergeService';
import ComparisonActions from '@/components/core/comparators/ComparisonActions.vue';
import { ComparisonSide, EntityType } from '@/models/MergeModel';
import AttachmentSection from '@/components/core/AttachmentSection.vue';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import Toast from '@/components/core/Toast.vue';
import { bulkTransferFields } from '@/utils/FieldTransferUtil';
import { mergeCommonMetadata, updateCommonBasicInfo } from '@/utils/CommonDocumentFieldsUtil';


export default defineComponent({
    name: "MonographPublicationMetadataComparatorView",
    components: { PersonDocumentContributionList, Toast, MonographPublicationUpdateForm, DescriptionOrBiographyUpdateForm, KeywordUpdateForm, ComparisonActions, AttachmentSection },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const leftMonographPublication = ref<MonographPublication>();
        const rightMonographPublication = ref<MonographPublication>();

        const updateLeftRef = ref<typeof MonographPublicationUpdateForm>();
        const updateRightRef = ref<typeof MonographPublicationUpdateForm>();
        const updateRightDescriptionRef = ref<typeof DescriptionOrBiographyUpdateForm>();
        const updateLeftDescriptionRef = ref<typeof DescriptionOrBiographyUpdateForm>();
        const updateRightKeywordsRef = ref<typeof KeywordUpdateForm>();
        const updateLeftKeywordsRef = ref<typeof KeywordUpdateForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("routeLabel.monographPublicationMetadataComparator");
            fetchMonographs();
        });

        const fetchMonographs = () => {
            DocumentPublicationService.readMonographPublication(parseInt(currentRoute.params.leftId as string)).then((response) => {
                leftMonographPublication.value = response.data;
                leftMonographPublication.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
            });

            DocumentPublicationService.readMonographPublication(parseInt(currentRoute.params.rightId as string)).then((response) => {
                rightMonographPublication.value = response.data;
                rightMonographPublication.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
            });
        };

        const mergeMonographMetadata = (monographPublication1: MonographPublication, monographPublication2: MonographPublication) => {
            mergeCommonMetadata(monographPublication1, monographPublication2);

            bulkTransferFields(monographPublication1, monographPublication2, [
                { fieldName: "numberOfPages", emptyValue: 0 },
                { fieldName: "articleNumber", emptyValue: "" },
                { fieldName: "startPage", emptyValue: "" },
                { fieldName: "endPage", emptyValue: "" },
                { fieldName: "monographPublicationType", emptyValue: null, setEmpty: false },
                { fieldName: "monographId", emptyValue: null, setEmpty: false }
            ]);

            return [monographPublication1, monographPublication2];
        };

        const moveAll = (fromLeftToRight: boolean) => {
            updateLeftKeywordsRef.value?.submit();
            updateRightKeywordsRef.value?.submits();
            updateLeftDescriptionRef.value?.submit();
            updateRightDescriptionRef.value?.submit();
            updateLeftRef.value?.submit();
            updateRightRef.value?.submit();

            if (fromLeftToRight) {
                [rightMonographPublication.value, leftMonographPublication.value] = mergeMonographMetadata(rightMonographPublication.value as MonographPublication, leftMonographPublication.value as MonographPublication);
            } else {
                [leftMonographPublication.value, rightMonographPublication.value] = mergeMonographMetadata(leftMonographPublication.value as MonographPublication, rightMonographPublication.value as MonographPublication);
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

        const updateLeft = (updatedInfo: MonographPublication) => {
            leftMonographPublication.value!.startPage = updatedInfo.startPage;
            leftMonographPublication.value!.endPage = updatedInfo.endPage;
            leftMonographPublication.value!.articleNumber = updatedInfo.articleNumber;
            leftMonographPublication.value!.monographPublicationType = updatedInfo.monographPublicationType;
            leftMonographPublication.value!.monographId = updatedInfo.monographId;
            leftMonographPublication.value!.numberOfPages = updatedInfo.numberOfPages;

            updateCommonBasicInfo(leftMonographPublication, updatedInfo);
            
            if (update.value) {
                leftUpdateComplete.value = true;
                finishUpdates();
            }
        };

        const updateRight = (updatedInfo: MonographPublication) => {
            rightMonographPublication.value!.startPage = updatedInfo.startPage;
            rightMonographPublication.value!.endPage = updatedInfo.endPage;
            rightMonographPublication.value!.articleNumber = updatedInfo.articleNumber;
            rightMonographPublication.value!.monographPublicationType = updatedInfo.monographPublicationType;
            rightMonographPublication.value!.monographId = updatedInfo.monographId;
            rightMonographPublication.value!.numberOfPages = updatedInfo.numberOfPages;

            updateCommonBasicInfo(rightMonographPublication, updatedInfo);
            
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
            
                MergeService.saveMergedMonographPublicationsMetadata(
                    leftMonographPublication.value?.id as number, rightMonographPublication.value?.id as number,
                    {
                        leftMonographPublication: leftMonographPublication.value as MonographPublication, 
                        rightMonographPublication: rightMonographPublication.value as MonographPublication,
                        leftProofs: leftMonographPublication.value?.proofs?.map(file => file.id) as number[],
                        leftFileItems: leftMonographPublication.value?.fileItems?.map(file => file.id) as number[],
                        rightProofs: rightMonographPublication.value?.proofs?.map(file => file.id) as number[],
                        rightFileItems: rightMonographPublication.value?.fileItems?.map(file => file.id) as number[]
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
            leftMonographPublication.value!.description = description;
        };

        const updateRightDescription = (description: MultilingualContent[]) => {
            rightMonographPublication.value!.description = description;
        };

        const updateLeftKeywords = (keywords: MultilingualContent[]) => {
            leftMonographPublication.value!.keywords = keywords;
        };

        const updateRightKeywords = (keywords: MultilingualContent[]) => {
            rightMonographPublication.value!.keywords = keywords;
        };

        const deleteSide = async (side: ComparisonSide) => {
            const id = side === ComparisonSide.LEFT ? leftMonographPublication.value?.id : rightMonographPublication.value?.id;
            const transferTargetId = side === ComparisonSide.LEFT ? rightMonographPublication.value?.id : leftMonographPublication.value?.id;

            try {
                await MergeService.migratePublicationIdentifierHistory(id as number, transferTargetId as number, "publication");
                await DocumentPublicationService.deleteDocumentPublication(id as number);
                await MergeService.switchAllIndicatorsToOtherDocument(id as number, transferTargetId as number);

                router.push({ name: "monographPublicationLandingPage", params: { id: transferTargetId } });
            } catch {
                const name = side === ComparisonSide.LEFT ? leftMonographPublication.value?.title : rightMonographPublication.value?.title;
                snackbarMessage.value = i18n.t("deleteFailedNotification", { name: returnCurrentLocaleContent(name) });
                snackbar.value = true;
            }
        };

        return {
            returnCurrentLocaleContent,
            snackbar, snackbarMessage,
            leftMonographPublication, rightMonographPublication,
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
