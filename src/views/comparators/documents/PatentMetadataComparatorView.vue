<template>
    <v-container id="patent-publications-comparator">
        <v-row class="d-flex flex-row justify-center align-start">
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ returnCurrentLocaleContent(leftPatent?.title) }}
                </h2>
                <br />

                <patent-update-form
                    ref="updateLeftRef" :preset-patent="leftPatent" in-comparator :in-modal="false"
                    @update="updateLeft"></patent-update-form>

                <br />

                <description-or-biography-update-form ref="updateLeftDescriptionRef" :preset-description-or-biography="(leftPatent?.description as MultilingualContent[])" @update="updateLeftDescription"></description-or-biography-update-form>

                <keyword-update-form ref="updateLeftKeywordsRef" :preset-keywords="(leftPatent?.keywords as MultilingualContent[])" @update="updateRightKeywords"></keyword-update-form>

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
                            :can-reorder="true">
                        </person-document-contribution-list>
                    </v-card-text>
                </v-card>

                <attachment-section :document="leftPatent" :proofs="leftPatent?.proofs" :file-items="leftPatent?.fileItems"></attachment-section>
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
                    ref="updateRightRef" :preset-patent="rightPatent" in-comparator :in-modal="false"
                    @update="updateRight"></patent-update-form>

                <br />

                <description-or-biography-update-form ref="updateRightDescriptionRef" :preset-description-or-biography="(rightPatent?.description as MultilingualContent[])" @update="updateRightDescription"></description-or-biography-update-form>

                <keyword-update-form ref="updateRightKeywordsRef" :preset-keywords="(rightPatent?.keywords as MultilingualContent[])" @update="updateRightKeywords"></keyword-update-form>

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
                            :can-reorder="true">
                        </person-document-contribution-list>
                    </v-card-text>
                </v-card>

                <attachment-section :document="rightPatent" :proofs="rightPatent?.proofs" :file-items="rightPatent?.fileItems"></attachment-section>
            </v-col>
        </v-row>

        <comparison-actions @update="updateAll" @delete="deleteSide($event)"></comparison-actions>

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
import type { Patent } from '@/models/PublicationModel';
import PersonDocumentContributionList from '@/components/core/PersonDocumentContributionList.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import PatentUpdateForm from '@/components/publication/update/PatentUpdateForm.vue';
import type { PersonDocumentContribution } from '@/models/PublicationModel';
import type { MultilingualContent } from '@/models/Common';
import DescriptionOrBiographyUpdateForm from '@/components/core/update/DescriptionOrBiographyUpdateForm.vue';
import KeywordUpdateForm from '@/components/core/update/KeywordUpdateForm.vue';
import MergeService from '@/services/MergeService';
import ComparisonActions from '@/components/core/comparators/ComparisonActions.vue';
import { ComparisonSide } from '@/models/MergeModel';
import AttachmentSection from '@/components/core/AttachmentSection.vue';
import { mergeDocumentAttachments } from '@/utils/AttachmentUtil';
import Toast from '@/components/core/Toast.vue';


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
            mergeMultilingualContentField(patent1.title, patent2.title);

            mergeMultilingualContentField(patent1.subTitle, patent2.subTitle);
            patent2.subTitle = [];

            mergeDocumentAttachments(patent1, patent2);

            mergeMultilingualContentField(patent1.keywords, patent2.keywords);
            patent2.keywords = [];

            mergeMultilingualContentField(patent1.description, patent2.description);
            patent2.description = [];

            patent1.number = patent2.number;
            patent2.number = "";
            patent1.doi = patent2.doi;
            patent2.doi = "";
            patent1.scopusId = patent2.scopusId;
            patent2.scopusId = "";
            patent1.documentDate = patent2.documentDate;

            patent1.eventId = patent2.eventId;
            patent1.publisherId = patent2.publisherId;

            patent2.uris!.forEach(uri => {
                if (!patent1.uris!.includes(uri)) {
                    patent1.uris!.push(uri);
                }
            });
            patent2.uris = [];

            patent1.contributions = patent1.contributions?.concat(patent2.contributions as PersonDocumentContribution[]);
            patent2.contributions = [];

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
            leftPatent.value!.title = updatedInfo.title;
            leftPatent.value!.subTitle = updatedInfo.subTitle;
            leftPatent.value!.description = updatedInfo.description;
            leftPatent.value!.keywords = updatedInfo.keywords;
            leftPatent.value!.uris = updatedInfo.uris;
            leftPatent.value!.documentDate = updatedInfo.documentDate;
            leftPatent.value!.doi = updatedInfo.doi;
            leftPatent.value!.number = updatedInfo.number;
            leftPatent.value!.eventId = updatedInfo.eventId;
            leftPatent.value!.publisherId = updatedInfo.publisherId;
            leftPatent.value!.scopusId = updatedInfo.scopusId;
            
            if (update.value) {
                leftUpdateComplete.value = true;
                finishUpdates();
            }
        };

        const updateRight = (updatedInfo: Patent) => {
            rightPatent.value!.title = updatedInfo.title;
            rightPatent.value!.subTitle = updatedInfo.subTitle;
            rightPatent.value!.description = updatedInfo.description;
            rightPatent.value!.keywords = updatedInfo.keywords;
            rightPatent.value!.uris = updatedInfo.uris;
            rightPatent.value!.documentDate = updatedInfo.documentDate;
            rightPatent.value!.doi = updatedInfo.doi;
            rightPatent.value!.number = updatedInfo.number;
            rightPatent.value!.eventId = updatedInfo.eventId;
            rightPatent.value!.publisherId = updatedInfo.publisherId;
            rightPatent.value!.scopusId = updatedInfo.scopusId;
            
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

        const deleteSide = (side: ComparisonSide) => {
            DocumentPublicationService.deleteDocumentPublication(side === ComparisonSide.LEFT ? leftPatent.value?.id as number : rightPatent.value?.id as number).then(() => {
                router.push({ name: "deduplication", query: { tab: "documents" } });
            }).catch(() => {
                const name = side === ComparisonSide.LEFT ? leftPatent.value?.title : rightPatent.value?.title;
                snackbarMessage.value = i18n.t("deleteFailedNotification", { name: returnCurrentLocaleContent(name) });
                snackbar.value = true;
            });
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
            deleteSide
        };
}})

</script>
