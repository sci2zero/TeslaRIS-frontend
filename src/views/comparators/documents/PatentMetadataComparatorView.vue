<template>
    <v-container id="patent-publications-comparator">
        <v-row class="d-flex flex-row justify-center align-start">
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ returnCurrentLocaleContent(leftPatent?.title) }}
                </h2>
                <br />

                <patent-update-form
                    ref="updateLeftRef"
                    :preset-patent="leftPatent"
                    in-comparator
                    :in-modal="false"
                    @update="updateLeft"
                />

                <br />

                <description-or-biography-update-form
                    ref="updateLeftDescriptionRef"
                    :preset-description-or-biography="(leftPatent?.description as MultilingualContent[])"
                    @update="updateLeftDescription"
                />

                <keyword-update-form
                    ref="updateLeftKeywordsRef"
                    :preset-keywords="(leftPatent?.keywords as MultilingualContent[])"
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
                            :contribution-list="leftPatent?.contributions ? leftPatent.contributions : []"
                            :document-id="leftPatent?.id"
                            :can-reorder="true"
                            in-comparator
                        />
                    </v-card-text>
                </v-card>

                <attachment-section
                    :document="leftPatent" 
                    :proofs="leftPatent?.proofs"
                    :file-items="leftPatent?.fileItems"
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
                    {{ returnCurrentLocaleContent(rightPatent?.title) }}
                </h2>

                <br />

                <patent-update-form
                    ref="updateRightRef"
                    :preset-patent="rightPatent"
                    in-comparator
                    :in-modal="false"
                    @update="updateRight"
                />

                <br />

                <description-or-biography-update-form
                    ref="updateRightDescriptionRef"
                    :preset-description-or-biography="(rightPatent?.description as MultilingualContent[])"
                    @update="updateRightDescription"
                />

                <keyword-update-form
                    ref="updateRightKeywordsRef"
                    :preset-keywords="(rightPatent?.keywords as MultilingualContent[])"
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
                            :contribution-list="rightPatent?.contributions ? rightPatent.contributions : []"
                            :document-id="rightPatent?.id"
                            :can-reorder="true"
                            in-comparator
                        />
                    </v-card-text>
                </v-card>

                <attachment-section
                    :document="rightPatent"
                    :proofs="rightPatent?.proofs"
                    :file-items="rightPatent?.fileItems"
                />
            </v-col>
        </v-row>

        <comparison-actions
            :is-form-valid="updateLeftRef?.isFormValid && updateRightRef?.isFormValid"
            :left-id="(leftPatent?.id as number)"
            :right-id="(rightPatent?.id as number)"
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
import type { Patent } from '@/models/PublicationModel';
import PersonDocumentContributionList from '@/components/core/PersonDocumentContributionList.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import PatentUpdateForm from '@/components/publication/update/PatentUpdateForm.vue';
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
    name: "PatentMetadataComparator",
    components: { PersonDocumentContributionList, Toast, PatentUpdateForm, DescriptionOrBiographyUpdateForm, KeywordUpdateForm, ComparisonActions, AttachmentSection },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const leftPatent = ref<Patent>();
        const rightPatent = ref<Patent>();

        const updateLeftRef = ref<typeof PatentUpdateForm>();
        const updateRightRef = ref<typeof PatentUpdateForm>();
        const updateRightDescriptionRef = ref<typeof DescriptionOrBiographyUpdateForm>();
        const updateLeftDescriptionRef = ref<typeof DescriptionOrBiographyUpdateForm>();
        const updateRightKeywordsRef = ref<typeof KeywordUpdateForm>();
        const updateLeftKeywordsRef = ref<typeof KeywordUpdateForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("patentMetadataComparatorLabel");
            fetchPatents();
        });

        const fetchPatents = () => {
            DocumentPublicationService.readPatent(parseInt(currentRoute.params.leftId as string)).then((response) => {
                leftPatent.value = response.data;
                leftPatent.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
            });

            DocumentPublicationService.readPatent(parseInt(currentRoute.params.rightId as string)).then((response) => {
                rightPatent.value = response.data;
                rightPatent.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
            });
        };

        const mergePatentMetadata = (patent1: Patent, patent2: Patent) => {
            mergeCommonMetadata(patent1, patent2);
            
            bulkTransferFields(patent1, patent2, [
                { fieldName: "number", emptyValue: "" },
                { fieldName: "publisherId", emptyValue: null, setEmpty: false },
                { fieldName: "type", emptyValue: null, setEmpty: false },
                { fieldName: "applicationStatus", emptyValue: null, setEmpty: false },
                { fieldName: "dateRequested", emptyValue: null, setEmpty: false },
                { fieldName: "dateFilingPriority", emptyValue: null, setEmpty: false },
                { fieldName: "dateTo", emptyValue: null, setEmpty: false }
            ]);

            return [patent1, patent2];
        };

        const moveAll = (fromLeftToRight: boolean) => {
            updateLeftKeywordsRef.value?.submit();
            updateRightKeywordsRef.value?.submit();
            updateLeftDescriptionRef.value?.submit();
            updateRightDescriptionRef.value?.submit();
            updateLeftRef.value?.submit();
            updateRightRef.value?.submit();

            if (fromLeftToRight) {
                [rightPatent.value, leftPatent.value] = mergePatentMetadata(rightPatent.value as Patent, leftPatent.value as Patent);
            } else {
                [leftPatent.value, rightPatent.value] = mergePatentMetadata(leftPatent.value as Patent, rightPatent.value as Patent);
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

        const updateLeft = (updatedInfo: Patent) => {
            leftPatent.value!.number = updatedInfo.number;
            leftPatent.value!.publisherId = updatedInfo.publisherId;
            leftPatent.value!.type = updatedInfo.type;
            leftPatent.value!.applicationStatus = updatedInfo.applicationStatus;
            leftPatent.value!.dateRequested = updatedInfo.dateRequested;
            leftPatent.value!.dateFilingPriority = updatedInfo.dateFilingPriority;
            leftPatent.value!.dateTo = updatedInfo.dateTo;

            updateCommonBasicInfo(leftPatent, updatedInfo);
            
            if (update.value) {
                leftUpdateComplete.value = true;
                finishUpdates();
            }
        };

        const updateRight = (updatedInfo: Patent) => {
            rightPatent.value!.number = updatedInfo.number;
            rightPatent.value!.publisherId = updatedInfo.publisherId;
            rightPatent.value!.type = updatedInfo.type;
            rightPatent.value!.applicationStatus = updatedInfo.applicationStatus;
            rightPatent.value!.dateRequested = updatedInfo.dateRequested;
            rightPatent.value!.dateFilingPriority = updatedInfo.dateFilingPriority;
            rightPatent.value!.dateTo = updatedInfo.dateTo;

            updateCommonBasicInfo(rightPatent, updatedInfo);
            
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
            
                MergeService.saveMergedPatentsMetadata(
                    leftPatent.value?.id as number, rightPatent.value?.id as number,
                    {
                        leftPatent: leftPatent.value as Patent, 
                        rightPatent: rightPatent.value as Patent,
                        leftProofs: leftPatent.value?.proofs?.map(file => file.id) as number[],
                        leftFileItems: leftPatent.value?.fileItems?.map(file => file.id) as number[],
                        rightProofs: rightPatent.value?.proofs?.map(file => file.id) as number[],
                        rightFileItems: rightPatent.value?.fileItems?.map(file => file.id) as number[]
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
            leftPatent.value!.description = description;
        };

        const updateRightDescription = (description: MultilingualContent[]) => {
            rightPatent.value!.description = description;
        };

        const updateLeftKeywords = (keywords: MultilingualContent[]) => {
            leftPatent.value!.keywords = keywords;
        };

        const updateRightKeywords = (keywords: MultilingualContent[]) => {
            rightPatent.value!.keywords = keywords;
        };

        const deleteSide = async (side: ComparisonSide) => {
            const id = side === ComparisonSide.LEFT ? leftPatent.value?.id : rightPatent.value?.id;
            const transferTargetId = side === ComparisonSide.LEFT ? rightPatent.value?.id : leftPatent.value?.id;

            try {
                await MergeService.migratePublicationIdentifierHistory(id as number, transferTargetId as number, "publication");
                await DocumentPublicationService.deleteDocumentPublication(id as number);
                await MergeService.switchAllIndicatorsToOtherDocument(id as number, transferTargetId as number);

                router.push({ name: "patentLandingPage", params: { id: transferTargetId } });
            } catch {
                const name = side === ComparisonSide.LEFT ? leftPatent.value?.title : rightPatent.value?.title;
                snackbarMessage.value = i18n.t("deleteFailedNotification", { name: returnCurrentLocaleContent(name) });
                snackbar.value = true;
            }
        };

        return {
            returnCurrentLocaleContent,
            snackbar, snackbarMessage,
            leftPatent, rightPatent,
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
