<template>
    <v-container id="materialProduct-publications-comparator">
        <v-row class="d-flex flex-row justify-center align-start">
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ returnCurrentLocaleContent(leftMaterialProduct?.title) }}
                </h2>
                
                <br />

                <material-product-update-form
                    ref="updateLeftRef"
                    :preset-material-product="leftMaterialProduct"
                    in-comparator
                    :in-modal="false"
                    @update="updateLeft"
                />

                <br />

                <description-or-biography-update-form
                    ref="updateLeftDescriptionRef"
                    :preset-description-or-biography="(leftMaterialProduct?.description as MultilingualContent[])"
                    @update="updateLeftDescription"
                />

                <keyword-update-form
                    ref="updateLeftKeywordsRef"
                    :preset-keywords="(leftMaterialProduct?.keywords as MultilingualContent[])"
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
                            :contribution-list="leftMaterialProduct?.contributions ? leftMaterialProduct.contributions : []"
                            :document-id="leftMaterialProduct?.id"
                            :can-reorder="true"
                            in-comparator>
                        </person-document-contribution-list>
                    </v-card-text>
                </v-card>

                <br />

                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div><b>{{ $t("researchAreasLabel") }}</b></div>
                        <research-area-hierarchy
                            :research-areas="leftMaterialProduct?.researchAreas"
                            in-comparator>
                        </research-area-hierarchy>
                    </v-card-text>
                </v-card>

                <attachment-section
                    :document="leftMaterialProduct"
                    :proofs="leftMaterialProduct?.proofs"
                    :file-items="leftMaterialProduct?.fileItems"
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
                    {{ returnCurrentLocaleContent(rightMaterialProduct?.title) }}
                </h2>

                <br />

                <material-product-update-form
                    ref="updateRightRef"
                    :preset-material-product="rightMaterialProduct"
                    in-comparator 
                    :in-modal="false"
                    @update="updateRight"
                />

                <br />

                <description-or-biography-update-form
                    ref="updateRightDescriptionRef"
                    :preset-description-or-biography="(rightMaterialProduct?.description as MultilingualContent[])"
                    @update="updateRightDescription"
                />

                <keyword-update-form
                    ref="updateRightKeywordsRef"
                    :preset-keywords="(rightMaterialProduct?.keywords as MultilingualContent[])"
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
                            :contribution-list="rightMaterialProduct?.contributions ? rightMaterialProduct.contributions : []"
                            :document-id="rightMaterialProduct?.id"
                            :can-reorder="true"
                            in-comparator>
                        </person-document-contribution-list>
                    </v-card-text>
                </v-card>

                <br />

                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div><b>{{ $t("researchAreasLabel") }}</b></div>
                        <research-area-hierarchy
                            :research-areas="rightMaterialProduct?.researchAreas"
                            in-comparator>
                        </research-area-hierarchy>
                    </v-card-text>
                </v-card>

                <attachment-section
                    :document="rightMaterialProduct"
                    :proofs="rightMaterialProduct?.proofs"
                    :file-items="rightMaterialProduct?.fileItems"
                />
            </v-col>
        </v-row>

        <comparison-actions
            :is-form-valid="updateLeftRef?.isFormValid && updateRightRef?.isFormValid"
            :left-id="(leftMaterialProduct?.id as number)"
            :right-id="(rightMaterialProduct?.id as number)"
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
import type { MaterialProduct } from '@/models/PublicationModel';
import PersonDocumentContributionList from '@/components/core/PersonDocumentContributionList.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import MaterialProductUpdateForm from '@/components/publication/update/MaterialProductUpdateForm.vue';
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
import { type ResearchArea } from '@/models/OrganisationUnitModel';
import ResearchAreaHierarchy from '@/components/core/ResearchAreaHierarchy.vue';


export default defineComponent({
    name: "MaterialProductMetadataComparator",
    components: { PersonDocumentContributionList, MaterialProductUpdateForm, Toast, DescriptionOrBiographyUpdateForm, KeywordUpdateForm, ComparisonActions, AttachmentSection, ResearchAreaHierarchy },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const leftMaterialProduct = ref<MaterialProduct>();
        const rightMaterialProduct = ref<MaterialProduct>();

        const updateLeftRef = ref<typeof MaterialProductUpdateForm>();
        const updateRightRef = ref<typeof MaterialProductUpdateForm>();
        const updateRightDescriptionRef = ref<typeof DescriptionOrBiographyUpdateForm>();
        const updateLeftDescriptionRef = ref<typeof DescriptionOrBiographyUpdateForm>();
        const updateRightKeywordsRef = ref<typeof KeywordUpdateForm>();
        const updateLeftKeywordsRef = ref<typeof KeywordUpdateForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("materialProductMetadataComparatorLabel");
            fetchMaterialProducts();
        });

        const fetchMaterialProducts = () => {
            DocumentPublicationService.readMaterialProduct(parseInt(currentRoute.params.leftId as string)).then((response) => {
                leftMaterialProduct.value = response.data;
                leftMaterialProduct.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
            });

            DocumentPublicationService.readMaterialProduct(parseInt(currentRoute.params.rightId as string)).then((response) => {
                rightMaterialProduct.value = response.data;
                rightMaterialProduct.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
            });
        };

        const mergeMaterialProductMetadata = (materialProduct1: MaterialProduct, materialProduct2: MaterialProduct) => {
            mergeMultilingualContentField(materialProduct1.title, materialProduct2.title);

            mergeMultilingualContentField(materialProduct1.subTitle, materialProduct2.subTitle);
            materialProduct2.subTitle = [];

            mergeMultilingualContentField(materialProduct1.keywords, materialProduct2.keywords);
            materialProduct2.keywords = [];

            mergeMultilingualContentField(materialProduct1.description, materialProduct2.description);
            materialProduct2.description = [];

            mergeMultilingualContentField(materialProduct1.productUsers, materialProduct2.productUsers);
            materialProduct2.productUsers = [];

            mergeDocumentAttachments(materialProduct1, materialProduct2);

            bulkTransferFields(materialProduct1, materialProduct2, [
                { fieldName: "doi", emptyValue: "" },
                { fieldName: "scopusId", emptyValue: "" },
                { fieldName: "openAlexId", emptyValue: "" },
                { fieldName: "webOfScienceId", emptyValue: "" },
                { fieldName: "documentDate", emptyValue: null, setEmpty: false },
                { fieldName: "internalNumber", emptyValue: "" },
                { fieldName: "eventId", emptyValue: null, setEmpty: false },
                { fieldName: "publisherId", emptyValue: null, setEmpty: false },
                { fieldName: "authorReprint", emptyValue: null, setEmpty: false },
                { fieldName: "numberProduced", emptyValue: null },
                { fieldName: "materialProductType", emptyValue: null, setEmpty: false }
            ]);

            materialProduct2.uris!.forEach(uri => {
                if (!materialProduct1.uris!.includes(uri)) {
                    materialProduct1.uris!.push(uri);
                }
            });
            materialProduct2.uris = [];

            materialProduct1.contributions = materialProduct1.contributions?.concat(materialProduct2.contributions as PersonDocumentContribution[]);
            materialProduct2.contributions = [];

            materialProduct1.researchAreas = materialProduct1.researchAreas?.concat(materialProduct2.researchAreas as ResearchArea[]);
            materialProduct2.researchAreas = [];

            materialProduct1.researchAreasId = materialProduct1.researchAreasId?.concat(materialProduct2.researchAreasId as number[]);
            materialProduct2.researchAreasId = [];

            return [materialProduct1, materialProduct2];
        };

        const moveAll = (fromLeftToRight: boolean) => {
            updateLeftKeywordsRef.value?.submit();
            updateRightKeywordsRef.value?.submit();
            updateLeftDescriptionRef.value?.submit();
            updateRightDescriptionRef.value?.submit();
            updateLeftRef.value?.submit();
            updateRightRef.value?.submit();

            if (fromLeftToRight) {
                [rightMaterialProduct.value, leftMaterialProduct.value] = mergeMaterialProductMetadata(rightMaterialProduct.value as MaterialProduct, leftMaterialProduct.value as MaterialProduct);
            } else {
                [leftMaterialProduct.value, rightMaterialProduct.value] = mergeMaterialProductMetadata(leftMaterialProduct.value as MaterialProduct, rightMaterialProduct.value as MaterialProduct);
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

        const updateLeft = (updatedInfo: MaterialProduct) => {
            leftMaterialProduct.value!.title = updatedInfo.title;
            leftMaterialProduct.value!.subTitle = updatedInfo.subTitle;
            leftMaterialProduct.value!.description = updatedInfo.description;
            leftMaterialProduct.value!.keywords = updatedInfo.keywords;
            leftMaterialProduct.value!.uris = updatedInfo.uris;
            leftMaterialProduct.value!.documentDate = updatedInfo.documentDate;
            leftMaterialProduct.value!.doi = updatedInfo.doi;
            leftMaterialProduct.value!.internalNumber = updatedInfo.internalNumber;
            leftMaterialProduct.value!.eventId = updatedInfo.eventId;
            leftMaterialProduct.value!.publisherId = updatedInfo.publisherId;
            leftMaterialProduct.value!.scopusId = updatedInfo.scopusId;
            leftMaterialProduct.value!.openAlexId = updatedInfo.openAlexId;
            leftMaterialProduct.value!.webOfScienceId = updatedInfo.webOfScienceId;
            leftMaterialProduct.value!.authorReprint = updatedInfo.authorReprint;
            leftMaterialProduct.value!.numberProduced = updatedInfo.numberProduced;
            leftMaterialProduct.value!.productUsers = updatedInfo.productUsers;
            leftMaterialProduct.value!.materialProductType = updatedInfo.materialProductType;
            leftMaterialProduct.value!.researchAreasId =
                leftMaterialProduct.value?.researchAreas?.map(researchArea => researchArea.id) as number[];
            
            if (update.value) {
                leftUpdateComplete.value = true;
                finishUpdates();
            }
        };

        const updateRight = (updatedInfo: MaterialProduct) => {
            rightMaterialProduct.value!.title = updatedInfo.title;
            rightMaterialProduct.value!.subTitle = updatedInfo.subTitle;
            rightMaterialProduct.value!.description = updatedInfo.description;
            rightMaterialProduct.value!.keywords = updatedInfo.keywords;
            rightMaterialProduct.value!.uris = updatedInfo.uris;
            rightMaterialProduct.value!.documentDate = updatedInfo.documentDate;
            rightMaterialProduct.value!.doi = updatedInfo.doi;
            rightMaterialProduct.value!.internalNumber = updatedInfo.internalNumber;
            rightMaterialProduct.value!.eventId = updatedInfo.eventId;
            rightMaterialProduct.value!.publisherId = updatedInfo.publisherId;
            rightMaterialProduct.value!.scopusId = updatedInfo.scopusId;
            rightMaterialProduct.value!.openAlexId = updatedInfo.openAlexId;
            rightMaterialProduct.value!.webOfScienceId = updatedInfo.webOfScienceId;
            rightMaterialProduct.value!.authorReprint = updatedInfo.authorReprint;
            rightMaterialProduct.value!.numberProduced = updatedInfo.numberProduced;
            rightMaterialProduct.value!.productUsers = updatedInfo.productUsers;
            rightMaterialProduct.value!.materialProductType = updatedInfo.materialProductType;
            rightMaterialProduct.value!.researchAreasId =
                rightMaterialProduct.value?.researchAreas?.map(researchArea => researchArea.id) as number[];
                        
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
            
                MergeService.saveMergedMaterialProductMetadata(
                    leftMaterialProduct.value?.id as number, rightMaterialProduct.value?.id as number,
                    {
                        leftMaterialProduct: leftMaterialProduct.value as MaterialProduct, 
                        rightMaterialProduct: rightMaterialProduct.value as MaterialProduct,
                        leftProofs: leftMaterialProduct.value?.proofs?.map(file => file.id) as number[],
                        leftFileItems: leftMaterialProduct.value?.fileItems?.map(file => file.id) as number[],
                        rightProofs: rightMaterialProduct.value?.proofs?.map(file => file.id) as number[],
                        rightFileItems: rightMaterialProduct.value?.fileItems?.map(file => file.id) as number[]
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
            leftMaterialProduct.value!.description = description;
        };

        const updateRightDescription = (description: MultilingualContent[]) => {
            rightMaterialProduct.value!.description = description;
        };

        const updateLeftKeywords = (keywords: MultilingualContent[]) => {
            leftMaterialProduct.value!.keywords = keywords;
        };

        const updateRightKeywords = (keywords: MultilingualContent[]) => {
            rightMaterialProduct.value!.keywords = keywords;
        };

        const deleteSide = async (side: ComparisonSide) => {
            const id = side === ComparisonSide.LEFT ? leftMaterialProduct.value?.id : rightMaterialProduct.value?.id;
            const transferTargetId = side === ComparisonSide.LEFT ? rightMaterialProduct.value?.id : leftMaterialProduct.value?.id;

            try {
                await MergeService.migratePublicationIdentifierHistory(id as number, transferTargetId as number, "publication");
                await DocumentPublicationService.deleteDocumentPublication(id as number);
                await MergeService.switchAllIndicatorsToOtherDocument(id as number, transferTargetId as number);

                router.push({ name: "materialProductLandingPage", params: { id: transferTargetId } });
            } catch {
                const name = side === ComparisonSide.LEFT ? leftMaterialProduct.value?.title : rightMaterialProduct.value?.title;
                snackbarMessage.value = i18n.t("deleteFailedNotification", { name: returnCurrentLocaleContent(name) });
                snackbar.value = true;
            }
        };

        return {
            returnCurrentLocaleContent,
            snackbar, snackbarMessage,
            leftMaterialProduct, rightMaterialProduct,
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
