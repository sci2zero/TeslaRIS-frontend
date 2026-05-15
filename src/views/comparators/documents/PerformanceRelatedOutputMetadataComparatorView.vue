<template>
    <v-container id="performanceRelatedOutput-publications-comparator">
        <v-row class="d-flex flex-row justify-center align-start">
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ returnCurrentLocaleContent(leftPerformanceRelatedOutput?.title) }}
                </h2>
                <br />

                <performance-related-output-update-form
                    ref="updateLeftRef"
                    :preset-performance-related-output="leftPerformanceRelatedOutput" 
                    in-comparator 
                    :in-modal="false"
                    @update="updateLeft"
                />

                <br />

                <description-or-biography-update-form
                    ref="updateLeftDescriptionRef"
                    :preset-description-or-biography="(leftPerformanceRelatedOutput?.description as MultilingualContent[])"
                    @update="updateLeftDescription"
                />

                <keyword-update-form
                    ref="updateLeftKeywordsRef"
                    :preset-keywords="(leftPerformanceRelatedOutput?.keywords as MultilingualContent[])"
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
                            :contribution-list="leftPerformanceRelatedOutput?.contributions ? leftPerformanceRelatedOutput.contributions : []"
                            :document-id="leftPerformanceRelatedOutput?.id"
                            :can-reorder="true"
                            in-comparator
                        />
                    </v-card-text>
                </v-card>

                <attachment-section
                    :document="leftPerformanceRelatedOutput"
                    :proofs="leftPerformanceRelatedOutput?.proofs"
                    :file-items="leftPerformanceRelatedOutput?.fileItems"
                    in-comparator
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
                    {{ returnCurrentLocaleContent(rightPerformanceRelatedOutput?.title) }}
                </h2>

                <br />

                <performance-related-output-update-form
                    ref="updateRightRef"
                    :preset-performance-related-output="rightPerformanceRelatedOutput"
                    in-comparator
                    :in-modal="false"
                    @update="updateRight"
                />

                <br />

                <description-or-biography-update-form
                    ref="updateRightDescriptionRef"
                    :preset-description-or-biography="(rightPerformanceRelatedOutput?.description as MultilingualContent[])"
                    @update="updateRightDescription"
                />

                <keyword-update-form
                    ref="updateRightKeywordsRef"
                    :preset-keywords="(rightPerformanceRelatedOutput?.keywords as MultilingualContent[])"
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
                            :contribution-list="rightPerformanceRelatedOutput?.contributions ? rightPerformanceRelatedOutput.contributions : []"
                            :document-id="rightPerformanceRelatedOutput?.id"
                            :can-reorder="true"
                            in-comparator
                        />
                    </v-card-text>
                </v-card>

                <attachment-section
                    :document="rightPerformanceRelatedOutput"
                    :proofs="rightPerformanceRelatedOutput?.proofs"
                    :file-items="rightPerformanceRelatedOutput?.fileItems"
                    in-comparator
                />
            </v-col>
        </v-row>

        <comparison-actions
            :is-form-valid="updateLeftRef?.isFormValid && updateRightRef?.isFormValid"
            :left-id="(leftPerformanceRelatedOutput?.id as number)"
            :right-id="(rightPerformanceRelatedOutput?.id as number)"
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
import DocumentPublicationService from '@/services/DocumentPublicationService';
import type { PerformanceRelatedOutput } from '@/models/PublicationModel';
import PersonDocumentContributionList from '@/components/core/PersonDocumentContributionList.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import PerformanceRelatedOutputUpdateForm from '@/components/publication/update/PerformanceRelatedOutputUpdateForm.vue';
import type { MultilingualContent } from '@/models/Common';
import DescriptionOrBiographyUpdateForm from '@/components/core/update/DescriptionOrBiographyUpdateForm.vue';
import KeywordUpdateForm from '@/components/core/update/KeywordUpdateForm.vue';
import MergeService from '@/services/MergeService';
import ComparisonActions from '@/components/core/comparators/ComparisonActions.vue';
import { ComparisonSide, EntityType } from '@/models/MergeModel';
import AttachmentSection from '@/components/core/AttachmentSection.vue';
import Toast from '@/components/core/Toast.vue';
import { bulkTransferFields } from '@/utils/FieldTransferUtil';
import { mergeCommonMetadata, updateCommonBasicInfo } from '@/utils/CommonDocumentFieldsUtil';


export default defineComponent({
    name: "PerformanceRelatedOutputMetadataComparator",
    components: { PersonDocumentContributionList, PerformanceRelatedOutputUpdateForm, Toast, DescriptionOrBiographyUpdateForm, KeywordUpdateForm, ComparisonActions, AttachmentSection },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const leftPerformanceRelatedOutput = ref<PerformanceRelatedOutput>();
        const rightPerformanceRelatedOutput = ref<PerformanceRelatedOutput>();

        const updateLeftRef = ref<typeof PerformanceRelatedOutputUpdateForm>();
        const updateRightRef = ref<typeof PerformanceRelatedOutputUpdateForm>();
        const updateRightDescriptionRef = ref<typeof DescriptionOrBiographyUpdateForm>();
        const updateLeftDescriptionRef = ref<typeof DescriptionOrBiographyUpdateForm>();
        const updateRightKeywordsRef = ref<typeof KeywordUpdateForm>();
        const updateLeftKeywordsRef = ref<typeof KeywordUpdateForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("routeLabel.performanceRelatedOutputMetadataComparator");
            fetchPerformanceRelatedOutputs();
        });

        const fetchPerformanceRelatedOutputs = () => {
            DocumentPublicationService.readPerformanceRelatedOutput(parseInt(currentRoute.params.leftId as string)).then((response) => {
                leftPerformanceRelatedOutput.value = response.data;
                leftPerformanceRelatedOutput.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
            });

            DocumentPublicationService.readPerformanceRelatedOutput(parseInt(currentRoute.params.rightId as string)).then((response) => {
                rightPerformanceRelatedOutput.value = response.data;
                rightPerformanceRelatedOutput.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
            });
        };

        const mergePerformanceRelatedOutputMetadata = (performanceRelatedOutput1: PerformanceRelatedOutput, performanceRelatedOutput2: PerformanceRelatedOutput) => {
            mergeCommonMetadata(performanceRelatedOutput1, performanceRelatedOutput2);
            
            bulkTransferFields(performanceRelatedOutput1, performanceRelatedOutput2, [
                { fieldName: "internalNumber", emptyValue: "" },
                { fieldName: "publisherId", emptyValue: null, setEmpty: false },
                { fieldName: "authorReprint", emptyValue: null, setEmpty: false }
            ]);

            return [performanceRelatedOutput1, performanceRelatedOutput2];
        };

        const moveAll = (fromLeftToRight: boolean) => {
            updateLeftKeywordsRef.value?.submit();
            updateRightKeywordsRef.value?.submit();
            updateLeftDescriptionRef.value?.submit();
            updateRightDescriptionRef.value?.submit();
            updateLeftRef.value?.submit();
            updateRightRef.value?.submit();

            if (fromLeftToRight) {
                [rightPerformanceRelatedOutput.value, leftPerformanceRelatedOutput.value] = 
                    mergePerformanceRelatedOutputMetadata(rightPerformanceRelatedOutput.value as PerformanceRelatedOutput, leftPerformanceRelatedOutput.value as PerformanceRelatedOutput);
            } else {
                [leftPerformanceRelatedOutput.value, rightPerformanceRelatedOutput.value] = 
                    mergePerformanceRelatedOutputMetadata(leftPerformanceRelatedOutput.value as PerformanceRelatedOutput, rightPerformanceRelatedOutput.value as PerformanceRelatedOutput);
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

        const updateLeft = (updatedInfo: PerformanceRelatedOutput) => {
            leftPerformanceRelatedOutput.value!.distributor = updatedInfo.distributor;
            leftPerformanceRelatedOutput.value!.producer = updatedInfo.producer;
            leftPerformanceRelatedOutput.value!.sourceTitle = updatedInfo.sourceTitle;
            leftPerformanceRelatedOutput.value!.otherActors = updatedInfo.otherActors;
            leftPerformanceRelatedOutput.value!.type = updatedInfo.type;
            leftPerformanceRelatedOutput.value!.languageTagIds = updatedInfo.languageTagIds;

            updateCommonBasicInfo(leftPerformanceRelatedOutput, updatedInfo);
            
            if (update.value) {
                leftUpdateComplete.value = true;
                finishUpdates();
            }
        };

        const updateRight = (updatedInfo: PerformanceRelatedOutput) => {
            rightPerformanceRelatedOutput.value!.distributor = updatedInfo.distributor;
            rightPerformanceRelatedOutput.value!.producer = updatedInfo.producer;
            rightPerformanceRelatedOutput.value!.sourceTitle = updatedInfo.sourceTitle;
            rightPerformanceRelatedOutput.value!.otherActors = updatedInfo.otherActors;
            rightPerformanceRelatedOutput.value!.type = updatedInfo.type;
            rightPerformanceRelatedOutput.value!.languageTagIds = updatedInfo.languageTagIds;

            updateCommonBasicInfo(rightPerformanceRelatedOutput, updatedInfo);
                        
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
            
                MergeService.saveMergedPerformanceRelatedOutputMetadata(
                    leftPerformanceRelatedOutput.value?.id as number, rightPerformanceRelatedOutput.value?.id as number,
                    {
                        leftPerformanceRelatedOutput: leftPerformanceRelatedOutput.value as PerformanceRelatedOutput, 
                        rightPerformanceRelatedOutput: rightPerformanceRelatedOutput.value as PerformanceRelatedOutput,
                        leftProofs: leftPerformanceRelatedOutput.value?.proofs?.map(file => file.id) as number[],
                        leftFileItems: leftPerformanceRelatedOutput.value?.fileItems?.map(file => file.id) as number[],
                        rightProofs: rightPerformanceRelatedOutput.value?.proofs?.map(file => file.id) as number[],
                        rightFileItems: rightPerformanceRelatedOutput.value?.fileItems?.map(file => file.id) as number[]
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
            leftPerformanceRelatedOutput.value!.description = description;
        };

        const updateRightDescription = (description: MultilingualContent[]) => {
            rightPerformanceRelatedOutput.value!.description = description;
        };

        const updateLeftKeywords = (keywords: MultilingualContent[]) => {
            leftPerformanceRelatedOutput.value!.keywords = keywords;
        };

        const updateRightKeywords = (keywords: MultilingualContent[]) => {
            rightPerformanceRelatedOutput.value!.keywords = keywords;
        };

        const deleteSide = async (side: ComparisonSide) => {
            const id = side === ComparisonSide.LEFT ? leftPerformanceRelatedOutput.value?.id : rightPerformanceRelatedOutput.value?.id;
            const transferTargetId = side === ComparisonSide.LEFT ? rightPerformanceRelatedOutput.value?.id : leftPerformanceRelatedOutput.value?.id;

            try {
                await MergeService.migratePublicationIdentifierHistory(id as number, transferTargetId as number, "publication");
                await DocumentPublicationService.deleteDocumentPublication(id as number);
                await MergeService.switchAllIndicatorsToOtherDocument(id as number, transferTargetId as number);

                router.push({ name: "performanceRelatedOutputLandingPage", params: { id: transferTargetId } });
            } catch {
                const name = side === ComparisonSide.LEFT ? leftPerformanceRelatedOutput.value?.title : rightPerformanceRelatedOutput.value?.title;
                snackbarMessage.value = i18n.t("deleteFailedNotification", { name: returnCurrentLocaleContent(name) });
                snackbar.value = true;
            }
        };

        return {
            returnCurrentLocaleContent,
            snackbar, snackbarMessage,
            leftPerformanceRelatedOutput, rightPerformanceRelatedOutput,
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
