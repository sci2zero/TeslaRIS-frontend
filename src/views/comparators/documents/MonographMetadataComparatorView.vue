<template>
    <v-container id="monograph-publications-comparator">
        <v-row class="d-flex flex-row justify-center align-start">
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ returnCurrentLocaleContent(leftMonograph?.title) }}
                </h2>
                <br />

                <monograph-update-form ref="updateLeftRef" :preset-monograph="leftMonograph" in-comparator @update="updateLeft"></monograph-update-form>

                <br />

                <description-or-biography-update-form ref="updateLeftDescriptionRef" :preset-description-or-biography="(leftMonograph?.description as MultilingualContent[])" @update="updateLeftDescription"></description-or-biography-update-form>

                <keyword-update-form ref="updateLeftKeywordsRef" :preset-keywords="(leftMonograph?.keywords as MultilingualContent[])" @update="updateRightKeywords"></keyword-update-form>

                <br />

                <!-- Left Contributions Table -->
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div>
                            <b>{{ $t("contributionsLabel") }}</b>
                        </div>

                        <person-document-contribution-list :contribution-list="leftMonograph?.contributions ? leftMonograph.contributions : []" :document-id="leftMonograph?.id"></person-document-contribution-list>
                    </v-card-text>
                </v-card>

                <attachment-section :document="leftMonograph" :proofs="leftMonograph?.proofs" :file-items="leftMonograph?.fileItems"></attachment-section>
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
                    {{ returnCurrentLocaleContent(rightMonograph?.title) }}
                </h2>

                <br />

                <monograph-update-form ref="updateRightRef" :preset-monograph="rightMonograph" in-comparator @update="updateRight"></monograph-update-form>

                <br />

                <description-or-biography-update-form ref="updateRightDescriptionRef" :preset-description-or-biography="(rightMonograph?.description as MultilingualContent[])" @update="updateRightDescription"></description-or-biography-update-form>

                <keyword-update-form ref="updateRightKeywordsRef" :preset-keywords="(rightMonograph?.keywords as MultilingualContent[])" @update="updateRightKeywords"></keyword-update-form>

                <br />

                <!-- Right Contributions Table -->
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div>
                            <b>{{ $t("contributionsLabel") }}</b>
                        </div>

                        <person-document-contribution-list :contribution-list="rightMonograph?.contributions ? rightMonograph.contributions : []" :document-id="rightMonograph?.id"></person-document-contribution-list>
                    </v-card-text>
                </v-card>

                <attachment-section :document="rightMonograph" :proofs="rightMonograph?.proofs" :file-items="rightMonograph?.fileItems"></attachment-section>
            </v-col>
        </v-row>

        <comparison-actions @update="updateAll" @delete="deleteSide($event)"></comparison-actions>

        <v-snackbar
            v-model="snackbar"
            :timeout="5000">
            {{ snackbarMessage }}
            <template #actions>
                <v-btn
                    color="blue"
                    variant="text"
                    @click="snackbar = false">
                    {{ $t("closeLabel") }}
                </v-btn>
            </template>
        </v-snackbar>
    </v-container>
</template>

<script lang="ts">
import { onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { mergeMultilingualContentField, returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { Monograph } from '@/models/PublicationModel';
import PersonDocumentContributionList from '@/components/core/PersonDocumentContributionList.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import MonographUpdateForm from '@/components/publication/update/MonographUpdateForm.vue';
import type { PersonDocumentContribution } from '@/models/PublicationModel';
import type { MultilingualContent } from '@/models/Common';
import DescriptionOrBiographyUpdateForm from '@/components/core/update/DescriptionOrBiographyUpdateForm.vue';
import KeywordUpdateForm from '@/components/core/update/KeywordUpdateForm.vue';
import MergeService from '@/services/MergeService';
import ComparisonActions from '@/components/core/comparators/ComparisonActions.vue';
import { ComparisonSide } from '@/models/MergeModel';
import { mergeDocumentAttachments } from '@/utils/AttachmentUtil';
import AttachmentSection from '@/components/core/AttachmentSection.vue';
import DocumentPublicationService from '@/services/DocumentPublicationService';


export default defineComponent({
    name: "MonographMetadataComparator",
    components: { PersonDocumentContributionList, MonographUpdateForm, DescriptionOrBiographyUpdateForm, KeywordUpdateForm, ComparisonActions, AttachmentSection },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const leftMonograph = ref<Monograph>();
        const rightMonograph = ref<Monograph>();

        const updateLeftRef = ref<typeof MonographUpdateForm>();
        const updateRightRef = ref<typeof MonographUpdateForm>();
        const updateRightDescriptionRef = ref<typeof DescriptionOrBiographyUpdateForm>();
        const updateLeftDescriptionRef = ref<typeof DescriptionOrBiographyUpdateForm>();
        const updateRightKeywordsRef = ref<typeof KeywordUpdateForm>();
        const updateLeftKeywordsRef = ref<typeof KeywordUpdateForm>();

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("monographMetadataComparatorLabel");
            fetchMonographs();
        });

        const fetchMonographs = () => {
            DocumentPublicationService.readMonograph(parseInt(currentRoute.params.leftId as string)).then((response) => {
                leftMonograph.value = response.data;
                leftMonograph.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
            });

            DocumentPublicationService.readMonograph(parseInt(currentRoute.params.rightId as string)).then((response) => {
                rightMonograph.value = response.data;
                rightMonograph.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
            });
        };

        const mergeMonographMetadata = (monograph1: Monograph, monograph2: Monograph) => {
            mergeMultilingualContentField(monograph1.title, monograph2.title);

            mergeMultilingualContentField(monograph1.subTitle, monograph2.subTitle);
            monograph2.subTitle = [];

            mergeMultilingualContentField(monograph1.keywords, monograph2.keywords);
            monograph2.keywords = [];

            mergeMultilingualContentField(monograph1.description, monograph2.description);
            monograph2.description = [];

            mergeDocumentAttachments(monograph1, monograph2);

            monograph1.monographType = monograph2.monographType;
            monograph1.eisbn = monograph2.eisbn;
            monograph2.eisbn = "";
            monograph1.printISBN = monograph2.printISBN;
            monograph2.printISBN = "";
            monograph1.numberOfPages = monograph2.numberOfPages;
            monograph2.numberOfPages = 0;
            monograph1.doi = monograph2.doi;
            monograph2.doi = "";
            monograph1.scopusId = monograph2.scopusId;
            monograph2.scopusId = "";
            monograph1.documentDate = monograph2.documentDate;
            monograph1.volume = monograph2.volume;
            monograph2.volume = "";
            monograph1.number = monograph2.number;
            monograph2.number = "";

            monograph1.eventId = monograph2.eventId;
            monograph1.publicationSeriesId = monograph2.publicationSeriesId;
            monograph1.researchAreaId = monograph2.researchAreaId;

            monograph2.languageTagIds!.forEach(languageTagId => {
                if (!monograph1.languageTagIds!.includes(languageTagId)) {
                    monograph1.languageTagIds!.push(languageTagId);
                }
            });
            monograph2.languageTagIds = [];

            monograph2.uris!.forEach(uri => {
                if (!monograph1.uris!.includes(uri)) {
                    monograph1.uris!.push(uri);
                }
            });
            monograph2.uris = [];

            monograph1.contributions = monograph1.contributions?.concat(monograph2.contributions as PersonDocumentContribution[]);
            monograph2.contributions = [];

            return [monograph1, monograph2];
        };

        const moveAll = (fromLeftToRight: boolean) => {
            updateLeftKeywordsRef.value?.updateKeywords();
            updateRightKeywordsRef.value?.updateKeywords();
            updateLeftDescriptionRef.value?.updateDescription();
            updateRightDescriptionRef.value?.updateDescription();
            updateLeftRef.value?.updateMonograph();
            updateRightRef.value?.updateMonograph();

            if (fromLeftToRight) {
                [rightMonograph.value, leftMonograph.value] = mergeMonographMetadata(rightMonograph.value as Monograph, leftMonograph.value as Monograph);
            } else {
                [leftMonograph.value, rightMonograph.value] = mergeMonographMetadata(leftMonograph.value as Monograph, rightMonograph.value as Monograph);
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

        const updateLeft = (updatedInfo: Monograph) => {
            leftMonograph.value!.title = updatedInfo.title;
            leftMonograph.value!.subTitle = updatedInfo.subTitle;
            leftMonograph.value!.description = updatedInfo.description;
            leftMonograph.value!.keywords = updatedInfo.keywords;
            leftMonograph.value!.uris = updatedInfo.uris;
            leftMonograph.value!.documentDate = updatedInfo.documentDate;
            leftMonograph.value!.doi = updatedInfo.doi;
            leftMonograph.value!.eisbn = updatedInfo.eisbn;
            leftMonograph.value!.eventId = updatedInfo.eventId;
            leftMonograph.value!.languageTagIds = updatedInfo.languageTagIds;
            leftMonograph.value!.numberOfPages = updatedInfo.numberOfPages;
            leftMonograph.value!.printISBN = updatedInfo.printISBN;
            leftMonograph.value!.publicationSeriesId = updatedInfo.publicationSeriesId;
            leftMonograph.value!.volume = updatedInfo.volume;
            leftMonograph.value!.number = updatedInfo.number;
            leftMonograph.value!.researchAreaId = updatedInfo.researchAreaId;
            leftMonograph.value!.scopusId = updatedInfo.scopusId;
            
            if (update.value) {
                leftUpdateComplete.value = true;
                finishUpdates();
            }
        };

        const updateRight = (updatedInfo: Monograph) => {
            rightMonograph.value!.title = updatedInfo.title;
            rightMonograph.value!.subTitle = updatedInfo.subTitle;
            rightMonograph.value!.description = updatedInfo.description;
            rightMonograph.value!.keywords = updatedInfo.keywords;
            rightMonograph.value!.uris = updatedInfo.uris;
            rightMonograph.value!.documentDate = updatedInfo.documentDate;
            rightMonograph.value!.doi = updatedInfo.doi;
            rightMonograph.value!.eisbn = updatedInfo.eisbn;
            rightMonograph.value!.eventId = updatedInfo.eventId;
            rightMonograph.value!.languageTagIds = updatedInfo.languageTagIds;
            rightMonograph.value!.numberOfPages = updatedInfo.numberOfPages;
            rightMonograph.value!.printISBN = updatedInfo.printISBN;
            rightMonograph.value!.publicationSeriesId = updatedInfo.publicationSeriesId;
            rightMonograph.value!.volume = updatedInfo.volume;
            rightMonograph.value!.number = updatedInfo.number;
            rightMonograph.value!.researchAreaId = updatedInfo.researchAreaId;
            rightMonograph.value!.scopusId = updatedInfo.scopusId;
            
            if (update.value) {
                rightUpdateComplete.value = true;
                finishUpdates();
            }
        };

        const updateAll = () => {
            update.value = true;
            updateLeftKeywordsRef.value?.updateKeywords();
            updateRightKeywordsRef.value?.updateKeywords();
            updateLeftDescriptionRef.value?.updateDescription();
            updateRightDescriptionRef.value?.updateDescription();
            updateLeftRef.value?.updateMonograph();
            updateRightRef.value?.updateMonograph();
        };

        const finishUpdates = () => {
            if (leftUpdateComplete.value && rightUpdateComplete.value) {
                leftUpdateComplete.value = false;
                rightUpdateComplete.value = false;
                update.value = false;

                MergeService.saveMergedMonographsMetadata(
                leftMonograph.value?.id as number, rightMonograph.value?.id as number,
                {
                    leftMonograph: leftMonograph.value as Monograph, 
                    rightMonograph: rightMonograph.value as Monograph,
                    leftProofs: leftMonograph.value?.proofs?.map(file => file.id) as number[],
                    leftFileItems: leftMonograph.value?.fileItems?.map(file => file.id) as number[],
                    rightProofs: rightMonograph.value?.proofs?.map(file => file.id) as number[],
                    rightFileItems: rightMonograph.value?.fileItems?.map(file => file.id) as number[]
                })
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
            leftMonograph.value!.description = description;
        };

        const updateRightDescription = (description: MultilingualContent[]) => {
            rightMonograph.value!.description = description;
        };

        const updateLeftKeywords = (keywords: MultilingualContent[]) => {
            leftMonograph.value!.keywords = keywords;
        };

        const updateRightKeywords = (keywords: MultilingualContent[]) => {
            rightMonograph.value!.keywords = keywords;
        };

        const deleteSide = (side: ComparisonSide) => {
            DocumentPublicationService.deleteMonograph(side === ComparisonSide.LEFT ? leftMonograph.value?.id as number : rightMonograph.value?.id as number).then(() => {
                router.push({ name: "deduplication", query: { tab: "documents" } });
            }).catch(() => {
                const name = side === ComparisonSide.LEFT ? leftMonograph.value?.title : rightMonograph.value?.title;
                snackbarMessage.value = i18n.t("deleteFailedNotification", { name: returnCurrentLocaleContent(name) });
                snackbar.value = true;
            });
        };

        return {
            returnCurrentLocaleContent,
            snackbar, snackbarMessage,
            leftMonograph, rightMonograph,
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
