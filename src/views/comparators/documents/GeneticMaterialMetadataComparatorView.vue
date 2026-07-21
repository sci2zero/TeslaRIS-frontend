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
                            in-comparator
                        />
                    </v-card-text>
                </v-card>

                <attachment-section
                    :document="leftGeneticMaterial"
                    :proofs="leftGeneticMaterial?.proofs"
                    :file-items="leftGeneticMaterial?.fileItems"
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
                            in-comparator
                        />
                    </v-card-text>
                </v-card>

                <attachment-section
                    :document="rightGeneticMaterial"
                    :proofs="rightGeneticMaterial?.proofs"
                    :file-items="rightGeneticMaterial?.fileItems"
                    in-comparator
                />
            </v-col>
        </v-row>

        <comparison-actions
            :is-form-valid="updateLeftRef?.isFormValid && updateRightRef?.isFormValid"
            :left-id="(leftGeneticMaterial?.id as number)"
            :right-id="(rightGeneticMaterial?.id as number)"
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
import type { GeneticMaterial } from '@/models/PublicationModel';
import PersonDocumentContributionList from '@/components/core/PersonDocumentContributionList.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import GeneticMaterialUpdateForm from '@/components/publication/update/GeneticMaterialUpdateForm.vue';
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
            document.title = i18n.t("routeLabel.geneticMaterialMetadataComparator");
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
            mergeCommonMetadata(geneticMaterial1, geneticMaterial2);
            
            bulkTransferFields(geneticMaterial1, geneticMaterial2, [
                { fieldName: "internalNumber", emptyValue: "" },
                { fieldName: "publisherId", emptyValue: null, setEmpty: false }
            ]);

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
            leftGeneticMaterial.value!.internalNumber = updatedInfo.internalNumber;
            leftGeneticMaterial.value!.publisherId = updatedInfo.publisherId;
            leftGeneticMaterial.value!.geneticMaterialType = updatedInfo.geneticMaterialType;

            updateCommonBasicInfo(leftGeneticMaterial, updatedInfo);
            
            if (update.value) {
                leftUpdateComplete.value = true;
                finishUpdates();
            }
        };

        const updateRight = (updatedInfo: GeneticMaterial) => {
            rightGeneticMaterial.value!.internalNumber = updatedInfo.internalNumber;
            rightGeneticMaterial.value!.publisherId = updatedInfo.publisherId;
            rightGeneticMaterial.value!.geneticMaterialType = updatedInfo.geneticMaterialType;

            updateCommonBasicInfo(rightGeneticMaterial, updatedInfo);
                        
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
