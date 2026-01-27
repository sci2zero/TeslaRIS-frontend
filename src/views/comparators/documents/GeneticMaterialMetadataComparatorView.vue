<template>
    <v-container id="geneticMaterial-publications-comparator">
        <v-row class="d-flex flex-row justify-center align-start">
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ returnCurrentLocaleContent(leftGeneticMaterial?.title) }}
                </h2>
                <br />

                <genetic-material-update-form
                    ref="updateLeftRef"
                    :preset-genetic-material="leftGeneticMaterial" 
                    in-comparator 
                    :in-modal="false"
                    @update="updateLeft"
                />

                <br />

                <description-or-biography-update-form
                    ref="updateLeftDescriptionRef"
                    :preset-description-or-biography="(leftGeneticMaterial?.description as MultilingualContent[])"
                    @update="updateLeftDescription"
                />

                <keyword-update-form
                    ref="updateLeftKeywordsRef"
                    :preset-keywords="(leftGeneticMaterial?.keywords as MultilingualContent[])"
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
                            :contribution-list="leftGeneticMaterial?.contributions ? leftGeneticMaterial.contributions : []"
                            :document-id="leftGeneticMaterial?.id"
                            :can-reorder="true"
                            in-comparator>
                        </person-document-contribution-list>
                    </v-card-text>
                </v-card>

                <attachment-section
                    :document="leftGeneticMaterial"
                    :proofs="leftGeneticMaterial?.proofs"
                    :file-items="leftGeneticMaterial?.fileItems"
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
                    {{ returnCurrentLocaleContent(rightGeneticMaterial?.title) }}
                </h2>

                <br />

                <genetic-material-update-form
                    ref="updateRightRef"
                    :preset-genetic-material="rightGeneticMaterial"
                    in-comparator
                    :in-modal="false"
                    @update="updateRight"
                />

                <br />

                <description-or-biography-update-form
                    ref="updateRightDescriptionRef"
                    :preset-description-or-biography="(rightGeneticMaterial?.description as MultilingualContent[])"
                    @update="updateRightDescription"
                />

                <keyword-update-form
                    ref="updateRightKeywordsRef"
                    :preset-keywords="(rightGeneticMaterial?.keywords as MultilingualContent[])"
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
                            :contribution-list="rightGeneticMaterial?.contributions ? rightGeneticMaterial.contributions : []"
                            :document-id="rightGeneticMaterial?.id"
                            :can-reorder="true"
                            in-comparator>
                        </person-document-contribution-list>
                    </v-card-text>
                </v-card>

                <attachment-section
                    :document="rightGeneticMaterial"
                    :proofs="rightGeneticMaterial?.proofs"
                    :file-items="rightGeneticMaterial?.fileItems"
                />
            </v-col>
        </v-row>

        <comparison-actions
            :is-form-valid="updateLeftRef?.isFormValid && updateRightRef?.isFormValid"
            :left-id="(leftGeneticMaterial?.id as number)"
            :right-id="(rightGeneticMaterial?.id as number)"
            :entity-type="EntityType.PUBLICATION"
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
import type { GeneticMaterial } from '@/models/PublicationModel';
import PersonDocumentContributionList from '@/components/core/PersonDocumentContributionList.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import GeneticMaterialUpdateForm from '@/components/publication/update/GeneticMaterialUpdateForm.vue';
import type { PersonDocumentContribution } from '@/models/PublicationModel';
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


export default defineComponent({
    name: "GeneticMaterialMetadataComparator",
    components: { PersonDocumentContributionList, GeneticMaterialUpdateForm, Toast, DescriptionOrBiographyUpdateForm, KeywordUpdateForm, ComparisonActions, AttachmentSection },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const leftGeneticMaterial = ref<GeneticMaterial>();
        const rightGeneticMaterial = ref<GeneticMaterial>();

        const updateLeftRef = ref<typeof GeneticMaterialUpdateForm>();
        const updateRightRef = ref<typeof GeneticMaterialUpdateForm>();
        const updateRightDescriptionRef = ref<typeof DescriptionOrBiographyUpdateForm>();
        const updateLeftDescriptionRef = ref<typeof DescriptionOrBiographyUpdateForm>();
        const updateRightKeywordsRef = ref<typeof KeywordUpdateForm>();
        const updateLeftKeywordsRef = ref<typeof KeywordUpdateForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("geneticMaterialMetadataComparatorLabel");
            fetchGeneticMaterials();
        });

        const fetchGeneticMaterials = () => {
            DocumentPublicationService.readGeneticMaterial(parseInt(currentRoute.params.leftId as string)).then((response) => {
                leftGeneticMaterial.value = response.data;
                leftGeneticMaterial.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
            });

            DocumentPublicationService.readGeneticMaterial(parseInt(currentRoute.params.rightId as string)).then((response) => {
                rightGeneticMaterial.value = response.data;
                rightGeneticMaterial.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
            });
        };

        const mergeGeneticMaterialMetadata = (geneticMaterial1: GeneticMaterial, geneticMaterial2: GeneticMaterial) => {
            mergeMultilingualContentField(geneticMaterial1.title, geneticMaterial2.title);

            mergeMultilingualContentField(geneticMaterial1.subTitle, geneticMaterial2.subTitle);
            geneticMaterial2.subTitle = [];

            mergeMultilingualContentField(geneticMaterial1.keywords, geneticMaterial2.keywords);
            geneticMaterial2.keywords = [];

            mergeMultilingualContentField(geneticMaterial1.description, geneticMaterial2.description);
            geneticMaterial2.description = [];

            mergeDocumentAttachments(geneticMaterial1, geneticMaterial2);

            bulkTransferFields(geneticMaterial1, geneticMaterial2, [
                { fieldName: "doi", emptyValue: "" },
                { fieldName: "scopusId", emptyValue: "" },
                { fieldName: "openAlexId", emptyValue: "" },
                { fieldName: "webOfScienceId", emptyValue: "" },
                { fieldName: "documentDate", emptyValue: null, setEmpty: false },
                { fieldName: "internalNumber", emptyValue: "" },
                { fieldName: "eventId", emptyValue: null, setEmpty: false },
                { fieldName: "publisherId", emptyValue: null, setEmpty: false },
                { fieldName: "authorReprint", emptyValue: null, setEmpty: false }
            ]);

            geneticMaterial2.uris!.forEach(uri => {
                if (!geneticMaterial1.uris!.includes(uri)) {
                    geneticMaterial1.uris!.push(uri);
                }
            });
            geneticMaterial2.uris = [];

            geneticMaterial1.contributions = 
                geneticMaterial1.contributions?.concat(geneticMaterial2.contributions as PersonDocumentContribution[]);
            geneticMaterial2.contributions = [];

            return [geneticMaterial1, geneticMaterial2];
        };

        const moveAll = (fromLeftToRight: boolean) => {
            updateLeftKeywordsRef.value?.submit();
            updateRightKeywordsRef.value?.submit();
            updateLeftDescriptionRef.value?.submit();
            updateRightDescriptionRef.value?.submit();
            updateLeftRef.value?.submit();
            updateRightRef.value?.submit();

            if (fromLeftToRight) {
                [rightGeneticMaterial.value, leftGeneticMaterial.value] = 
                    mergeGeneticMaterialMetadata(rightGeneticMaterial.value as GeneticMaterial, leftGeneticMaterial.value as GeneticMaterial);
            } else {
                [leftGeneticMaterial.value, rightGeneticMaterial.value] = 
                    mergeGeneticMaterialMetadata(leftGeneticMaterial.value as GeneticMaterial, rightGeneticMaterial.value as GeneticMaterial);
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

        const updateLeft = (updatedInfo: GeneticMaterial) => {
            leftGeneticMaterial.value!.title = updatedInfo.title;
            leftGeneticMaterial.value!.subTitle = updatedInfo.subTitle;
            leftGeneticMaterial.value!.description = updatedInfo.description;
            leftGeneticMaterial.value!.keywords = updatedInfo.keywords;
            leftGeneticMaterial.value!.uris = updatedInfo.uris;
            leftGeneticMaterial.value!.documentDate = updatedInfo.documentDate;
            leftGeneticMaterial.value!.doi = updatedInfo.doi;
            leftGeneticMaterial.value!.internalNumber = updatedInfo.internalNumber;
            leftGeneticMaterial.value!.eventId = updatedInfo.eventId;
            leftGeneticMaterial.value!.publisherId = updatedInfo.publisherId;
            leftGeneticMaterial.value!.scopusId = updatedInfo.scopusId;
            leftGeneticMaterial.value!.openAlexId = updatedInfo.openAlexId;
            leftGeneticMaterial.value!.webOfScienceId = updatedInfo.webOfScienceId;
            leftGeneticMaterial.value!.authorReprint = updatedInfo.authorReprint;
            leftGeneticMaterial.value!.geneticMaterialType = updatedInfo.geneticMaterialType;
            
            if (update.value) {
                leftUpdateComplete.value = true;
                finishUpdates();
            }
        };

        const updateRight = (updatedInfo: GeneticMaterial) => {
            rightGeneticMaterial.value!.title = updatedInfo.title;
            rightGeneticMaterial.value!.subTitle = updatedInfo.subTitle;
            rightGeneticMaterial.value!.description = updatedInfo.description;
            rightGeneticMaterial.value!.keywords = updatedInfo.keywords;
            rightGeneticMaterial.value!.uris = updatedInfo.uris;
            rightGeneticMaterial.value!.documentDate = updatedInfo.documentDate;
            rightGeneticMaterial.value!.doi = updatedInfo.doi;
            rightGeneticMaterial.value!.internalNumber = updatedInfo.internalNumber;
            rightGeneticMaterial.value!.eventId = updatedInfo.eventId;
            rightGeneticMaterial.value!.publisherId = updatedInfo.publisherId;
            rightGeneticMaterial.value!.scopusId = updatedInfo.scopusId;
            rightGeneticMaterial.value!.openAlexId = updatedInfo.openAlexId;
            rightGeneticMaterial.value!.webOfScienceId = updatedInfo.webOfScienceId;
            rightGeneticMaterial.value!.authorReprint = updatedInfo.authorReprint;
            rightGeneticMaterial.value!.geneticMaterialType = updatedInfo.geneticMaterialType;
                        
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
            
                MergeService.saveMergedGeneticMaterialMetadata(
                    leftGeneticMaterial.value?.id as number, rightGeneticMaterial.value?.id as number,
                    {
                        leftGeneticMaterial: leftGeneticMaterial.value as GeneticMaterial, 
                        rightGeneticMaterial: rightGeneticMaterial.value as GeneticMaterial,
                        leftProofs: leftGeneticMaterial.value?.proofs?.map(file => file.id) as number[],
                        leftFileItems: leftGeneticMaterial.value?.fileItems?.map(file => file.id) as number[],
                        rightProofs: rightGeneticMaterial.value?.proofs?.map(file => file.id) as number[],
                        rightFileItems: rightGeneticMaterial.value?.fileItems?.map(file => file.id) as number[]
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
            leftGeneticMaterial.value!.description = description;
        };

        const updateRightDescription = (description: MultilingualContent[]) => {
            rightGeneticMaterial.value!.description = description;
        };

        const updateLeftKeywords = (keywords: MultilingualContent[]) => {
            leftGeneticMaterial.value!.keywords = keywords;
        };

        const updateRightKeywords = (keywords: MultilingualContent[]) => {
            rightGeneticMaterial.value!.keywords = keywords;
        };

        const deleteSide = async (side: ComparisonSide) => {
            const id = side === ComparisonSide.LEFT ? leftGeneticMaterial.value?.id : rightGeneticMaterial.value?.id;
            const transferTargetId = side === ComparisonSide.LEFT ? rightGeneticMaterial.value?.id : leftGeneticMaterial.value?.id;

            try {
                await MergeService.migratePublicationIdentifierHistory(id as number, transferTargetId as number, "publication");
                await DocumentPublicationService.deleteDocumentPublication(id as number);
                await MergeService.switchAllIndicatorsToOtherDocument(id as number, transferTargetId as number);

                router.push({ name: "geneticMaterialLandingPage", params: { id: transferTargetId } });
            } catch {
                const name = side === ComparisonSide.LEFT ? leftGeneticMaterial.value?.title : rightGeneticMaterial.value?.title;
                snackbarMessage.value = i18n.t("deleteFailedNotification", { name: returnCurrentLocaleContent(name) });
                snackbar.value = true;
            }
        };

        return {
            returnCurrentLocaleContent,
            snackbar, snackbarMessage,
            leftGeneticMaterial, rightGeneticMaterial,
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
