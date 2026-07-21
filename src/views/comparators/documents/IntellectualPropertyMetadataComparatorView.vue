<template>
    <v-container id="intellectual-property-publications-comparator">
        <v-row class="d-flex flex-row justify-center align-start">
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ returnCurrentLocaleContent(leftIntellectualProperty?.title) }}
                </h2>
                <br />

                <intellectual-property-update-form
                    ref="updateLeftRef"
                    :preset-intellectual-property="leftIntellectualProperty"
                    in-comparator
                    :in-modal="false"
                    @update="updateLeft"
                />

                <br />

                <description-or-biography-update-form
                    ref="updateLeftDescriptionRef"
                    :preset-description-or-biography="(leftIntellectualProperty?.description as MultilingualContent[])"
                    @update="updateLeftDescription"
                />

                <keyword-update-form
                    ref="updateLeftKeywordsRef"
                    :preset-keywords="(leftIntellectualProperty?.keywords as MultilingualContent[])"
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
                            :contribution-list="leftIntellectualProperty?.contributions ? leftIntellectualProperty.contributions : []"
                            :document-id="leftIntellectualProperty?.id"
                            :can-reorder="true"
                            in-comparator
                        />
                    </v-card-text>
                </v-card>

                <attachment-section
                    :document="leftIntellectualProperty" 
                    :proofs="leftIntellectualProperty?.proofs"
                    :file-items="leftIntellectualProperty?.fileItems"
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
                    {{ returnCurrentLocaleContent(rightIntellectualProperty?.title) }}
                </h2>

                <br />

                <intellectual-property-update-form
                    ref="updateRightRef"
                    :preset-intellectual-property="rightIntellectualProperty"
                    in-comparator
                    :in-modal="false"
                    @update="updateRight"
                />

                <br />

                <description-or-biography-update-form
                    ref="updateRightDescriptionRef"
                    :preset-description-or-biography="(rightIntellectualProperty?.description as MultilingualContent[])"
                    @update="updateRightDescription"
                />

                <keyword-update-form
                    ref="updateRightKeywordsRef"
                    :preset-keywords="(rightIntellectualProperty?.keywords as MultilingualContent[])"
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
                            :contribution-list="rightIntellectualProperty?.contributions ? rightIntellectualProperty.contributions : []"
                            :document-id="rightIntellectualProperty?.id"
                            :can-reorder="true"
                            in-comparator
                        />
                    </v-card-text>
                </v-card>

                <attachment-section
                    :document="rightIntellectualProperty"
                    :proofs="rightIntellectualProperty?.proofs"
                    :file-items="rightIntellectualProperty?.fileItems"
                />
            </v-col>
        </v-row>

        <comparison-actions
            :is-form-valid="updateLeftRef?.isFormValid && updateRightRef?.isFormValid"
            :left-id="(leftIntellectualProperty?.id as number)"
            :right-id="(rightIntellectualProperty?.id as number)"
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
import type { IntellectualProperty } from '@/models/PublicationModel';
import PersonDocumentContributionList from '@/components/core/PersonDocumentContributionList.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import IntellectualPropertyUpdateForm from '@/components/publication/update/IntellectualPropertyUpdateForm.vue';
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
    name: "IntellectualPropertyMetadataComparator",
    components: { PersonDocumentContributionList, Toast, IntellectualPropertyUpdateForm, DescriptionOrBiographyUpdateForm, KeywordUpdateForm, ComparisonActions, AttachmentSection },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const leftIntellectualProperty = ref<IntellectualProperty>();
        const rightIntellectualProperty = ref<IntellectualProperty>();

        const updateLeftRef = ref<typeof IntellectualPropertyUpdateForm>();
        const updateRightRef = ref<typeof IntellectualPropertyUpdateForm>();
        const updateRightDescriptionRef = ref<typeof DescriptionOrBiographyUpdateForm>();
        const updateLeftDescriptionRef = ref<typeof DescriptionOrBiographyUpdateForm>();
        const updateRightKeywordsRef = ref<typeof KeywordUpdateForm>();
        const updateLeftKeywordsRef = ref<typeof KeywordUpdateForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("intellectualPropertyMetadataComparatorLabel");
            fetchIntellectualProperties();
        });

        const fetchIntellectualProperties = () => {
            DocumentPublicationService.readIntellectualProperty(parseInt(currentRoute.params.leftId as string)).then((response) => {
                leftIntellectualProperty.value = response.data;
                leftIntellectualProperty.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
            });

            DocumentPublicationService.readIntellectualProperty(parseInt(currentRoute.params.rightId as string)).then((response) => {
                rightIntellectualProperty.value = response.data;
                rightIntellectualProperty.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
            });
        };

        const mergeIntellectualPropertyMetadata = (intellectualProperty1: IntellectualProperty, intellectualProperty2: IntellectualProperty) => {
            mergeCommonMetadata(intellectualProperty1, intellectualProperty2);
            
            bulkTransferFields(intellectualProperty1, intellectualProperty2, [
                { fieldName: "number", emptyValue: "" },
                { fieldName: "publisherId", emptyValue: null, setEmpty: false },
                { fieldName: "type", emptyValue: null, setEmpty: false },
                { fieldName: "applicationStatus", emptyValue: null, setEmpty: false },
                { fieldName: "dateRequested", emptyValue: null, setEmpty: false },
                { fieldName: "dateFilingPriority", emptyValue: null, setEmpty: false },
                { fieldName: "dateTo", emptyValue: null, setEmpty: false }
            ]);

            return [intellectualProperty1, intellectualProperty2];
        };

        const moveAll = (fromLeftToRight: boolean) => {
            updateLeftKeywordsRef.value?.submit();
            updateRightKeywordsRef.value?.submit();
            updateLeftDescriptionRef.value?.submit();
            updateRightDescriptionRef.value?.submit();
            updateLeftRef.value?.submit();
            updateRightRef.value?.submit();

            if (fromLeftToRight) {
                [rightIntellectualProperty.value, leftIntellectualProperty.value] = mergeIntellectualPropertyMetadata(rightIntellectualProperty.value as IntellectualProperty, leftIntellectualProperty.value as IntellectualProperty);
            } else {
                [leftIntellectualProperty.value, rightIntellectualProperty.value] = mergeIntellectualPropertyMetadata(leftIntellectualProperty.value as IntellectualProperty, rightIntellectualProperty.value as IntellectualProperty);
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

        const updateLeft = (updatedInfo: IntellectualProperty) => {
            leftIntellectualProperty.value!.number = updatedInfo.number;
            leftIntellectualProperty.value!.publisherId = updatedInfo.publisherId;
            leftIntellectualProperty.value!.type = updatedInfo.type;
            leftIntellectualProperty.value!.applicationStatus = updatedInfo.applicationStatus;
            leftIntellectualProperty.value!.dateRequested = updatedInfo.dateRequested;
            leftIntellectualProperty.value!.dateFilingPriority = updatedInfo.dateFilingPriority;
            leftIntellectualProperty.value!.dateTo = updatedInfo.dateTo;

            updateCommonBasicInfo(leftIntellectualProperty, updatedInfo);
            
            if (update.value) {
                leftUpdateComplete.value = true;
                finishUpdates();
            }
        };

        const updateRight = (updatedInfo: IntellectualProperty) => {
            rightIntellectualProperty.value!.number = updatedInfo.number;
            rightIntellectualProperty.value!.publisherId = updatedInfo.publisherId;
            rightIntellectualProperty.value!.type = updatedInfo.type;
            rightIntellectualProperty.value!.applicationStatus = updatedInfo.applicationStatus;
            rightIntellectualProperty.value!.dateRequested = updatedInfo.dateRequested;
            rightIntellectualProperty.value!.dateFilingPriority = updatedInfo.dateFilingPriority;
            rightIntellectualProperty.value!.dateTo = updatedInfo.dateTo;

            updateCommonBasicInfo(rightIntellectualProperty, updatedInfo);
            
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
            
                MergeService.saveMergedIntellectualPropertiesMetadata(
                    leftIntellectualProperty.value?.id as number, rightIntellectualProperty.value?.id as number,
                    {
                        leftIntellectualProperty: leftIntellectualProperty.value as IntellectualProperty, 
                        rightIntellectualProperty: rightIntellectualProperty.value as IntellectualProperty,
                        leftProofs: leftIntellectualProperty.value?.proofs?.map(file => file.id) as number[],
                        leftFileItems: leftIntellectualProperty.value?.fileItems?.map(file => file.id) as number[],
                        rightProofs: rightIntellectualProperty.value?.proofs?.map(file => file.id) as number[],
                        rightFileItems: rightIntellectualProperty.value?.fileItems?.map(file => file.id) as number[]
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
            leftIntellectualProperty.value!.description = description;
        };

        const updateRightDescription = (description: MultilingualContent[]) => {
            rightIntellectualProperty.value!.description = description;
        };

        const updateLeftKeywords = (keywords: MultilingualContent[]) => {
            leftIntellectualProperty.value!.keywords = keywords;
        };

        const updateRightKeywords = (keywords: MultilingualContent[]) => {
            rightIntellectualProperty.value!.keywords = keywords;
        };

        const deleteSide = async (side: ComparisonSide) => {
            const id = side === ComparisonSide.LEFT ? leftIntellectualProperty.value?.id : rightIntellectualProperty.value?.id;
            const transferTargetId = side === ComparisonSide.LEFT ? rightIntellectualProperty.value?.id : leftIntellectualProperty.value?.id;

            try {
                await MergeService.migratePublicationIdentifierHistory(id as number, transferTargetId as number, "publication");
                await DocumentPublicationService.deleteDocumentPublication(id as number);
                await MergeService.switchAllIndicatorsToOtherDocument(id as number, transferTargetId as number);

                router.push({ name: "intellectualPropertyLandingPage", params: { id: transferTargetId } });
            } catch {
                const name = side === ComparisonSide.LEFT ? leftIntellectualProperty.value?.title : rightIntellectualProperty.value?.title;
                snackbarMessage.value = i18n.t("deleteFailedNotification", { name: returnCurrentLocaleContent(name) });
                snackbar.value = true;
            }
        };

        return {
            returnCurrentLocaleContent,
            snackbar, snackbarMessage,
            leftIntellectualProperty, rightIntellectualProperty,
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
