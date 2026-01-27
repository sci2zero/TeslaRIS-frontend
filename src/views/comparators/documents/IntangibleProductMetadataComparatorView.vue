<template>
    <v-container id="intangible-product-publications-comparator">
        <v-row class="d-flex flex-row justify-center align-start">
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ returnCurrentLocaleContent(leftIntangibleProduct?.title) }}
                </h2>
                <br />

                <intangible-product-update-form
                    ref="updateLeftRef"
                    :preset-intangible-product="leftIntangibleProduct"
                    in-comparator
                    :in-modal="false"
                    @update="updateLeft"
                />

                <br />

                <description-or-biography-update-form
                    ref="updateLeftDescriptionRef"
                    :preset-description-or-biography="(leftIntangibleProduct?.description as MultilingualContent[])"
                    @update="updateLeftDescription"
                />

                <keyword-update-form
                    ref="updateLeftKeywordsRef"
                    :preset-keywords="(leftIntangibleProduct?.keywords as MultilingualContent[])"
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
                            :contribution-list="leftIntangibleProduct?.contributions ? leftIntangibleProduct.contributions : []"
                            :document-id="leftIntangibleProduct?.id"
                            :can-reorder="true"
                            in-comparator>
                        </person-document-contribution-list>
                    </v-card-text>
                </v-card>

                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div><b>{{ $t("researchAreasLabel") }}</b></div>
                        <research-area-hierarchy
                            :research-areas="leftIntangibleProduct?.researchAreas"
                            in-comparator>
                        </research-area-hierarchy>
                    </v-card-text>
                </v-card>

                <attachment-section
                    :document="leftIntangibleProduct"
                    :proofs="leftIntangibleProduct?.proofs"
                    :file-items="leftIntangibleProduct?.fileItems"
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
                    {{ returnCurrentLocaleContent(rightIntangibleProduct?.title) }}
                </h2>

                <br />

                <intangible-product-update-form
                    ref="updateRightRef"
                    :preset-intangible-product="rightIntangibleProduct"
                    in-comparator
                    :in-modal="false"
                    @update="updateRight"
                />

                <br />

                <description-or-biography-update-form
                    ref="updateRightDescriptionRef"
                    :preset-description-or-biography="(rightIntangibleProduct?.description as MultilingualContent[])"
                    @update="updateRightDescription"
                />

                <keyword-update-form
                    ref="updateRightKeywordsRef"
                    :preset-keywords="(rightIntangibleProduct?.keywords as MultilingualContent[])"
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
                            :contribution-list="rightIntangibleProduct?.contributions ? rightIntangibleProduct.contributions : []"
                            :document-id="rightIntangibleProduct?.id"
                            :can-reorder="true"
                            in-comparator>
                        </person-document-contribution-list>
                    </v-card-text>
                </v-card>

                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div><b>{{ $t("researchAreasLabel") }}</b></div>
                        <research-area-hierarchy
                            :research-areas="rightIntangibleProduct?.researchAreas"
                            in-comparator>
                        </research-area-hierarchy>
                    </v-card-text>
                </v-card>

                <attachment-section
                    :document="rightIntangibleProduct"
                    :proofs="rightIntangibleProduct?.proofs"
                    :file-items="rightIntangibleProduct?.fileItems"
                />
            </v-col>
        </v-row>

        <comparison-actions
            :is-form-valid="updateLeftRef?.isFormValid && updateRightRef?.isFormValid"
            :left-id="(leftIntangibleProduct?.id as number)"
            :right-id="(rightIntangibleProduct?.id as number)"
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
import type { IntangibleProduct } from '@/models/PublicationModel';
import PersonDocumentContributionList from '@/components/core/PersonDocumentContributionList.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import IntangibleProductUpdateForm from '@/components/publication/update/IntangibleProductUpdateForm.vue';
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
    name: "IntangibleProductMetadataComparator",
    components: { PersonDocumentContributionList, IntangibleProductUpdateForm, Toast, DescriptionOrBiographyUpdateForm, KeywordUpdateForm, ComparisonActions, AttachmentSection, ResearchAreaHierarchy },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const leftIntangibleProduct = ref<IntangibleProduct>();
        const rightIntangibleProduct = ref<IntangibleProduct>();

        const updateLeftRef = ref<typeof IntangibleProductUpdateForm>();
        const updateRightRef = ref<typeof IntangibleProductUpdateForm>();
        const updateRightDescriptionRef = ref<typeof DescriptionOrBiographyUpdateForm>();
        const updateLeftDescriptionRef = ref<typeof DescriptionOrBiographyUpdateForm>();
        const updateRightKeywordsRef = ref<typeof KeywordUpdateForm>();
        const updateLeftKeywordsRef = ref<typeof KeywordUpdateForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("intangibleProductMetadataComparatorLabel");
            fetchIntangibleProducts();
        });

        const fetchIntangibleProducts = () => {
            DocumentPublicationService.readIntangibleProduct(parseInt(currentRoute.params.leftId as string)).then((response) => {
                leftIntangibleProduct.value = response.data;
                leftIntangibleProduct.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
            });

            DocumentPublicationService.readIntangibleProduct(parseInt(currentRoute.params.rightId as string)).then((response) => {
                rightIntangibleProduct.value = response.data;
                rightIntangibleProduct.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
            });
        };

        const mergeIntangibleProductMetadata = (intangibleProduct1: IntangibleProduct, intangibleProduct2: IntangibleProduct) => {
            mergeMultilingualContentField(intangibleProduct1.title, intangibleProduct2.title);

            mergeMultilingualContentField(intangibleProduct1.subTitle, intangibleProduct2.subTitle);
            intangibleProduct2.subTitle = [];

            mergeMultilingualContentField(intangibleProduct1.keywords, intangibleProduct2.keywords);
            intangibleProduct2.keywords = [];

            mergeMultilingualContentField(intangibleProduct1.description, intangibleProduct2.description);
            intangibleProduct2.description = [];

            mergeMultilingualContentField(intangibleProduct1.productUsers, intangibleProduct2.productUsers);
            intangibleProduct2.productUsers = [];

            mergeDocumentAttachments(intangibleProduct1, intangibleProduct2);

            bulkTransferFields(intangibleProduct1, intangibleProduct2, [
                { fieldName: "doi", emptyValue: "" },
                { fieldName: "scopusId", emptyValue: "" },
                { fieldName: "openAlexId", emptyValue: "" },
                { fieldName: "webOfScienceId", emptyValue: "" },
                { fieldName: "documentDate", emptyValue: null, setEmpty: false },
                { fieldName: "internalNumber", emptyValue: "" },
                { fieldName: "eventId", emptyValue: null, setEmpty: false },
                { fieldName: "publisherId", emptyValue: null, setEmpty: false },
                { fieldName: "authorReprint", emptyValue: null, setEmpty: false },
                { fieldName: "intangibleProductType", emptyValue: null, setEmpty: false }
            ]);

            intangibleProduct2.uris!.forEach(uri => {
                if (!intangibleProduct1.uris!.includes(uri)) {
                    intangibleProduct1.uris!.push(uri);
                }
            });
            intangibleProduct2.uris = [];

            intangibleProduct1.contributions = intangibleProduct1.contributions?.concat(intangibleProduct2.contributions as PersonDocumentContribution[]);
            intangibleProduct2.contributions = [];

            intangibleProduct1.researchAreas = intangibleProduct1.researchAreas?.concat(intangibleProduct2.researchAreas as ResearchArea[]);
            intangibleProduct2.researchAreas = [];

            intangibleProduct1.researchAreasId = intangibleProduct1.researchAreasId?.concat(intangibleProduct2.researchAreasId as number[]);
            intangibleProduct2.researchAreasId = [];

            return [intangibleProduct1, intangibleProduct2];
        };

        const moveAll = (fromLeftToRight: boolean) => {
            updateLeftKeywordsRef.value?.submit();
            updateRightKeywordsRef.value?.submit();
            updateLeftDescriptionRef.value?.submit();
            updateRightDescriptionRef.value?.submit();
            updateLeftRef.value?.submit();
            updateRightRef.value?.submit();

            if (fromLeftToRight) {
                [rightIntangibleProduct.value, leftIntangibleProduct.value] = mergeIntangibleProductMetadata(rightIntangibleProduct.value as IntangibleProduct, leftIntangibleProduct.value as IntangibleProduct);
            } else {
                [leftIntangibleProduct.value, rightIntangibleProduct.value] = mergeIntangibleProductMetadata(leftIntangibleProduct.value as IntangibleProduct, rightIntangibleProduct.value as IntangibleProduct);
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

        const updateLeft = (updatedInfo: IntangibleProduct) => {
            leftIntangibleProduct.value!.title = updatedInfo.title;
            leftIntangibleProduct.value!.subTitle = updatedInfo.subTitle;
            leftIntangibleProduct.value!.description = updatedInfo.description;
            leftIntangibleProduct.value!.keywords = updatedInfo.keywords;
            leftIntangibleProduct.value!.uris = updatedInfo.uris;
            leftIntangibleProduct.value!.documentDate = updatedInfo.documentDate;
            leftIntangibleProduct.value!.doi = updatedInfo.doi;
            leftIntangibleProduct.value!.internalNumber = updatedInfo.internalNumber;
            leftIntangibleProduct.value!.eventId = updatedInfo.eventId;
            leftIntangibleProduct.value!.publisherId = updatedInfo.publisherId;
            leftIntangibleProduct.value!.scopusId = updatedInfo.scopusId;
            leftIntangibleProduct.value!.openAlexId = updatedInfo.openAlexId;
            leftIntangibleProduct.value!.webOfScienceId = updatedInfo.webOfScienceId;
            leftIntangibleProduct.value!.authorReprint = updatedInfo.authorReprint;
            leftIntangibleProduct.value!.productUsers = updatedInfo.productUsers;
            leftIntangibleProduct.value!.intangibleProductType = updatedInfo.intangibleProductType;
            leftIntangibleProduct.value!.researchAreasId =
                leftIntangibleProduct.value?.researchAreas?.map(researchArea => researchArea.id) as number[];
            
            if (update.value) {
                leftUpdateComplete.value = true;
                finishUpdates();
            }
        };

        const updateRight = (updatedInfo: IntangibleProduct) => {
            rightIntangibleProduct.value!.title = updatedInfo.title;
            rightIntangibleProduct.value!.subTitle = updatedInfo.subTitle;
            rightIntangibleProduct.value!.description = updatedInfo.description;
            rightIntangibleProduct.value!.keywords = updatedInfo.keywords;
            rightIntangibleProduct.value!.uris = updatedInfo.uris;
            rightIntangibleProduct.value!.documentDate = updatedInfo.documentDate;
            rightIntangibleProduct.value!.doi = updatedInfo.doi;
            rightIntangibleProduct.value!.internalNumber = updatedInfo.internalNumber;
            rightIntangibleProduct.value!.eventId = updatedInfo.eventId;
            rightIntangibleProduct.value!.publisherId = updatedInfo.publisherId;
            rightIntangibleProduct.value!.scopusId = updatedInfo.scopusId;
            rightIntangibleProduct.value!.openAlexId = updatedInfo.openAlexId;
            rightIntangibleProduct.value!.webOfScienceId = updatedInfo.webOfScienceId;
            rightIntangibleProduct.value!.authorReprint = updatedInfo.authorReprint;
            rightIntangibleProduct.value!.productUsers = updatedInfo.productUsers;
            rightIntangibleProduct.value!.intangibleProductType = updatedInfo.intangibleProductType;
            rightIntangibleProduct.value!.researchAreasId =
                rightIntangibleProduct.value?.researchAreas?.map(researchArea => researchArea.id) as number[];
                        
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
            
                MergeService.saveMergedIntangibleProductMetadata(
                    leftIntangibleProduct.value?.id as number, rightIntangibleProduct.value?.id as number,
                    {
                        leftIntangibleProduct: leftIntangibleProduct.value as IntangibleProduct, 
                        rightIntangibleProduct: rightIntangibleProduct.value as IntangibleProduct,
                        leftProofs: leftIntangibleProduct.value?.proofs?.map(file => file.id) as number[],
                        leftFileItems: leftIntangibleProduct.value?.fileItems?.map(file => file.id) as number[],
                        rightProofs: rightIntangibleProduct.value?.proofs?.map(file => file.id) as number[],
                        rightFileItems: rightIntangibleProduct.value?.fileItems?.map(file => file.id) as number[]
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
            leftIntangibleProduct.value!.description = description;
        };

        const updateRightDescription = (description: MultilingualContent[]) => {
            rightIntangibleProduct.value!.description = description;
        };

        const updateLeftKeywords = (keywords: MultilingualContent[]) => {
            leftIntangibleProduct.value!.keywords = keywords;
        };

        const updateRightKeywords = (keywords: MultilingualContent[]) => {
            rightIntangibleProduct.value!.keywords = keywords;
        };

        const deleteSide = async (side: ComparisonSide) => {
            const id = side === ComparisonSide.LEFT ? leftIntangibleProduct.value?.id : rightIntangibleProduct.value?.id;
            const transferTargetId = side === ComparisonSide.LEFT ? rightIntangibleProduct.value?.id : leftIntangibleProduct.value?.id;

            try {
                await MergeService.migratePublicationIdentifierHistory(id as number, transferTargetId as number, "publication");
                await DocumentPublicationService.deleteDocumentPublication(id as number);
                await MergeService.switchAllIndicatorsToOtherDocument(id as number, transferTargetId as number);

                router.push({ name: "intangibleProductLandingPage", params: { id: transferTargetId } });
            } catch {
                const name = side === ComparisonSide.LEFT ? leftIntangibleProduct.value?.title : rightIntangibleProduct.value?.title;
                snackbarMessage.value = i18n.t("deleteFailedNotification", { name: returnCurrentLocaleContent(name) });
                snackbar.value = true;
            }
        };

        return {
            returnCurrentLocaleContent,
            snackbar, snackbarMessage,
            leftIntangibleProduct, rightIntangibleProduct,
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
