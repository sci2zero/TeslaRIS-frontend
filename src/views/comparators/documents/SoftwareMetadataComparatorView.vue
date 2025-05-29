<template>
    <v-container id="software-publications-comparator">
        <v-row class="d-flex flex-row justify-center align-start">
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ returnCurrentLocaleContent(leftSoftware?.title) }}
                </h2>
                <br />

                <software-update-form
                    ref="updateLeftRef" :preset-software="leftSoftware" in-comparator :in-modal="false"
                    @update="updateLeft"></software-update-form>

                <br />

                <description-or-biography-update-form ref="updateLeftDescriptionRef" :preset-description-or-biography="(leftSoftware?.description as MultilingualContent[])" @update="updateLeftDescription"></description-or-biography-update-form>

                <keyword-update-form ref="updateLeftKeywordsRef" :preset-keywords="(leftSoftware?.keywords as MultilingualContent[])" @update="updateRightKeywords"></keyword-update-form>

                <br />

                <!-- Left Contributions Table -->
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div>
                            <b>{{ $t("contributionsLabel") }}</b>
                        </div>

                        <person-document-contribution-list
                            :contribution-list="leftSoftware?.contributions ? leftSoftware.contributions : []"
                            :document-id="leftSoftware?.id"
                            :can-reorder="true">
                        </person-document-contribution-list>
                    </v-card-text>
                </v-card>

                <attachment-section :document="leftSoftware" :proofs="leftSoftware?.proofs" :file-items="leftSoftware?.fileItems"></attachment-section>
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
                    {{ returnCurrentLocaleContent(rightSoftware?.title) }}
                </h2>

                <br />

                <software-update-form
                    ref="updateRightRef" :preset-software="rightSoftware" in-comparator :in-modal="false"
                    @update="updateRight"></software-update-form>

                <br />

                <description-or-biography-update-form ref="updateRightDescriptionRef" :preset-description-or-biography="(rightSoftware?.description as MultilingualContent[])" @update="updateRightDescription"></description-or-biography-update-form>

                <keyword-update-form ref="updateRightKeywordsRef" :preset-keywords="(rightSoftware?.keywords as MultilingualContent[])" @update="updateRightKeywords"></keyword-update-form>

                <br />

                <!-- Right Contributions Table -->
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div>
                            <b>{{ $t("contributionsLabel") }}</b>
                        </div>

                        <person-document-contribution-list
                            :contribution-list="rightSoftware?.contributions ? rightSoftware.contributions : []"
                            :document-id="rightSoftware?.id"
                            :can-reorder="true">
                        </person-document-contribution-list>
                    </v-card-text>
                </v-card>

                <attachment-section :document="rightSoftware" :proofs="rightSoftware?.proofs" :file-items="rightSoftware?.fileItems"></attachment-section>
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
import type { Software } from '@/models/PublicationModel';
import PersonDocumentContributionList from '@/components/core/PersonDocumentContributionList.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import SoftwareUpdateForm from '@/components/publication/update/SoftwareUpdateForm.vue';
import type { PersonDocumentContribution } from '@/models/PublicationModel';
import type { MultilingualContent } from '@/models/Common';
import DescriptionOrBiographyUpdateForm from '@/components/core/update/DescriptionOrBiographyUpdateForm.vue';
import KeywordUpdateForm from '@/components/core/update/KeywordUpdateForm.vue';
import MergeService from '@/services/MergeService';
import ComparisonActions from '@/components/core/comparators/ComparisonActions.vue';
import { ComparisonSide } from '@/models/MergeModel';
import { mergeDocumentAttachments } from '@/utils/AttachmentUtil';
import AttachmentSection from '@/components/core/AttachmentSection.vue';
import Toast from '@/components/core/Toast.vue';


export default defineComponent({
    name: "SoftwareMetadataComparator",
    components: { PersonDocumentContributionList, SoftwareUpdateForm, Toast, DescriptionOrBiographyUpdateForm, KeywordUpdateForm, ComparisonActions, AttachmentSection },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const leftSoftware = ref<Software>();
        const rightSoftware = ref<Software>();

        const updateLeftRef = ref<typeof SoftwareUpdateForm>();
        const updateRightRef = ref<typeof SoftwareUpdateForm>();
        const updateRightDescriptionRef = ref<typeof DescriptionOrBiographyUpdateForm>();
        const updateLeftDescriptionRef = ref<typeof DescriptionOrBiographyUpdateForm>();
        const updateRightKeywordsRef = ref<typeof KeywordUpdateForm>();
        const updateLeftKeywordsRef = ref<typeof KeywordUpdateForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("softwareMetadataComparatorLabel");
            fetchSoftwares();
        });

        const fetchSoftwares = () => {
            DocumentPublicationService.readSoftware(parseInt(currentRoute.params.leftId as string)).then((response) => {
                leftSoftware.value = response.data;
                leftSoftware.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
            });

            DocumentPublicationService.readSoftware(parseInt(currentRoute.params.rightId as string)).then((response) => {
                rightSoftware.value = response.data;
                rightSoftware.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
            });
        };

        const mergeSoftwareMetadata = (software1: Software, software2: Software) => {
            mergeMultilingualContentField(software1.title, software2.title);

            mergeMultilingualContentField(software1.subTitle, software2.subTitle);
            software2.subTitle = [];

            mergeMultilingualContentField(software1.keywords, software2.keywords);
            software2.keywords = [];

            mergeMultilingualContentField(software1.description, software2.description);
            software2.description = [];

            mergeDocumentAttachments(software1, software2);

            software1.internalNumber = software2.internalNumber;
            software2.internalNumber = "";
            software1.doi = software2.doi;
            software2.doi = "";
            software1.scopusId = software2.scopusId;
            software2.scopusId = "";
            software1.documentDate = software2.documentDate;

            software1.eventId = software2.eventId;
            software1.publisherId = software2.publisherId;

            software2.uris!.forEach(uri => {
                if (!software1.uris!.includes(uri)) {
                    software1.uris!.push(uri);
                }
            });
            software2.uris = [];

            software1.contributions = software1.contributions?.concat(software2.contributions as PersonDocumentContribution[]);
            software2.contributions = [];

            return [software1, software2];
        };

        const moveAll = (fromLeftToRight: boolean) => {
            updateLeftKeywordsRef.value?.submit();
            updateRightKeywordsRef.value?.submit();
            updateLeftDescriptionRef.value?.submit();
            updateRightDescriptionRef.value?.submit();
            updateLeftRef.value?.submit();
            updateRightRef.value?.submit();

            if (fromLeftToRight) {
                [rightSoftware.value, leftSoftware.value] = mergeSoftwareMetadata(rightSoftware.value as Software, leftSoftware.value as Software);
            } else {
                [leftSoftware.value, rightSoftware.value] = mergeSoftwareMetadata(leftSoftware.value as Software, rightSoftware.value as Software);
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

        const updateLeft = (updatedInfo: Software) => {
            leftSoftware.value!.title = updatedInfo.title;
            leftSoftware.value!.subTitle = updatedInfo.subTitle;
            leftSoftware.value!.description = updatedInfo.description;
            leftSoftware.value!.keywords = updatedInfo.keywords;
            leftSoftware.value!.uris = updatedInfo.uris;
            leftSoftware.value!.documentDate = updatedInfo.documentDate;
            leftSoftware.value!.doi = updatedInfo.doi;
            leftSoftware.value!.internalNumber = updatedInfo.internalNumber;
            leftSoftware.value!.eventId = updatedInfo.eventId;
            leftSoftware.value!.publisherId = updatedInfo.publisherId;
            leftSoftware.value!.scopusId = updatedInfo.scopusId;
            
            if (update.value) {
                leftUpdateComplete.value = true;
                finishUpdates();
            }
        };

        const updateRight = (updatedInfo: Software) => {
            rightSoftware.value!.title = updatedInfo.title;
            rightSoftware.value!.subTitle = updatedInfo.subTitle;
            rightSoftware.value!.description = updatedInfo.description;
            rightSoftware.value!.keywords = updatedInfo.keywords;
            rightSoftware.value!.uris = updatedInfo.uris;
            rightSoftware.value!.documentDate = updatedInfo.documentDate;
            rightSoftware.value!.doi = updatedInfo.doi;
            rightSoftware.value!.internalNumber = updatedInfo.internalNumber;
            rightSoftware.value!.eventId = updatedInfo.eventId;
            rightSoftware.value!.publisherId = updatedInfo.publisherId;
            rightSoftware.value!.scopusId = updatedInfo.scopusId;
                        
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
            
                MergeService.saveMergedSoftwareMetadata(
                    leftSoftware.value?.id as number, rightSoftware.value?.id as number,
                    {
                        leftSoftware: leftSoftware.value as Software, 
                        rightSoftware: rightSoftware.value as Software,
                        leftProofs: leftSoftware.value?.proofs?.map(file => file.id) as number[],
                        leftFileItems: leftSoftware.value?.fileItems?.map(file => file.id) as number[],
                        rightProofs: rightSoftware.value?.proofs?.map(file => file.id) as number[],
                        rightFileItems: rightSoftware.value?.fileItems?.map(file => file.id) as number[]
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
            leftSoftware.value!.description = description;
        };

        const updateRightDescription = (description: MultilingualContent[]) => {
            rightSoftware.value!.description = description;
        };

        const updateLeftKeywords = (keywords: MultilingualContent[]) => {
            leftSoftware.value!.keywords = keywords;
        };

        const updateRightKeywords = (keywords: MultilingualContent[]) => {
            rightSoftware.value!.keywords = keywords;
        };

        const deleteSide = (side: ComparisonSide) => {
            DocumentPublicationService.deleteDocumentPublication(side === ComparisonSide.LEFT ? leftSoftware.value?.id as number : rightSoftware.value?.id as number).then(() => {
                router.push({ name: "deduplication", query: { tab: "documents" } });
            }).catch(() => {
                const name = side === ComparisonSide.LEFT ? leftSoftware.value?.title : rightSoftware.value?.title;
                snackbarMessage.value = i18n.t("deleteFailedNotification", { name: returnCurrentLocaleContent(name) });
                snackbar.value = true;
            });
        };

        return {
            returnCurrentLocaleContent,
            snackbar, snackbarMessage,
            leftSoftware, rightSoftware,
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
