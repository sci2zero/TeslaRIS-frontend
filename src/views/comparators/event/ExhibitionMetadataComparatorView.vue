<template>
    <v-container id="exhibition-publications-comparator">
        <v-row class="d-flex flex-row justify-center align-start">
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ returnCurrentLocaleContent(leftExhibition?.name) }}
                </h2>
                <br />

                <event-update-form
                    ref="updateLeftRef" :preset-event="leftExhibition" in-comparator :in-modal="false"
                    @update="updateLeft"></event-update-form>

                <br />

                <description-or-biography-update-form
                    ref="updateLeftDescriptionRef"
                    :preset-description-or-biography="(leftExhibition?.description as MultilingualContent[])"
                    :placeholder-label="$t('eventDescriptionLabel')"
                    @update="updateLeftDescription">
                </description-or-biography-update-form>

                <keyword-update-form
                    ref="updateLeftKeywordsRef"
                    :preset-keywords="(leftExhibition?.keywords as MultilingualContent[])"
                    @update="updateRightKeywords">
                </keyword-update-form>

                <br />

                <!-- Left Contributions Table -->
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div>
                            <b>{{ $t("contributionsLabel") }}</b>
                        </div>

                        <person-event-contribution-list
                            :contribution-list="leftExhibition?.contributions ? leftExhibition.contributions : []"
                            :event-id="leftExhibition?.id"
                            in-comparator
                            :can-reorder="true">
                        </person-event-contribution-list>
                    </v-card-text>
                </v-card>
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
                    {{ returnCurrentLocaleContent(rightExhibition?.name) }}
                </h2>

                <br />

                <event-update-form
                    ref="updateRightRef" :preset-event="rightExhibition" in-comparator :in-modal="false"
                    @update="updateRight"></event-update-form>

                <br />

                <description-or-biography-update-form
                    ref="updateRightDescriptionRef"
                    :preset-description-or-biography="(rightExhibition?.description as MultilingualContent[])"
                    :placeholder-label="$t('eventDescriptionLabel')"
                    @update="updateRightDescription">
                </description-or-biography-update-form>

                <keyword-update-form
                    ref="updateRightKeywordsRef"
                    :preset-keywords="(rightExhibition?.keywords as MultilingualContent[])"
                    @update="updateRightKeywords">
                </keyword-update-form>

                <br />

                <!-- Right Contributions Table -->
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div>
                            <b>{{ $t("contributionsLabel") }}</b>
                        </div>

                        <person-event-contribution-list
                            :contribution-list="rightExhibition?.contributions ? rightExhibition.contributions : []"
                            :event-id="rightExhibition?.id"
                            in-comparator
                            :can-reorder="true">
                        </person-event-contribution-list>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <comparison-actions
            :is-form-valid="updateLeftRef?.isFormValid && updateRightRef?.isFormValid"
            supports-force-delete
            :left-id="(leftExhibition?.id as number)"
            :right-id="(rightExhibition?.id as number)"
            :entity-type="EntityType.EVENT"
            @update="updateAll"
            @delete="deleteSide">
        </comparison-actions>

        <toast v-model="snackbar" :message="snackbarMessage" />

        <persistent-stop-dialog v-if="showStopDialog" :text="$t('cantCompareSerialEventsMetadataMessage')"></persistent-stop-dialog>
    </v-container>
</template>

<script lang="ts">
import { onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { mergeMultilingualContentField, returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import { getErrorMessageForErrorKey } from '@/i18n';
import type { Exhibition, PersonEventContribution } from '@/models/EventModel';
import EventService from '@/services/EventService';
import type { MultilingualContent } from '@/models/Common';
import PersonEventContributionList from '@/components/core/PersonEventContributionList.vue';
import EventUpdateForm from '@/components/event/update/EventUpdateForm.vue';
import PersistentStopDialog from '@/components/core/PersistentStopDialog.vue';
import DescriptionOrBiographyUpdateForm from '@/components/core/update/DescriptionOrBiographyUpdateForm.vue';
import KeywordUpdateForm from '@/components/core/update/KeywordUpdateForm.vue';
import ComparisonActions from '@/components/core/comparators/ComparisonActions.vue';
import { ComparisonSide, EntityType } from '@/models/MergeModel';
import MergeService from '@/services/MergeService';
import Toast from '@/components/core/Toast.vue';
import { bulkTransferFields } from '@/utils/FieldTransferUtil';


export default defineComponent({
    name: "ExhibitionMetadataComparator",
    components: { EventUpdateForm, PersonEventContributionList, Toast, PersistentStopDialog, DescriptionOrBiographyUpdateForm, KeywordUpdateForm, ComparisonActions },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const leftExhibition = ref<Exhibition>();
        const rightExhibition = ref<Exhibition>();

        const updateLeftRef = ref<typeof EventUpdateForm>();
        const updateRightRef = ref<typeof EventUpdateForm>();
        const updateRightDescriptionRef = ref<typeof DescriptionOrBiographyUpdateForm>();
        const updateLeftDescriptionRef = ref<typeof DescriptionOrBiographyUpdateForm>();
        const updateRightKeywordsRef = ref<typeof KeywordUpdateForm>();
        const updateLeftKeywordsRef = ref<typeof KeywordUpdateForm>();

        const showStopDialog = ref(false);

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("eventMetadataComparatorLabel");
            fetchExhibitions();
        });

        const fetchExhibitions = () => {
            EventService.readExhibition(parseInt(currentRoute.params.leftId as string)).then((response) => {
                if (response.data.serialEvent) {
                    showStopDialog.value = true;
                    return;
                }

                leftExhibition.value = response.data;
                leftExhibition.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
            });

            EventService.readExhibition(parseInt(currentRoute.params.rightId as string)).then((response) => {
                if (response.data.serialEvent) {
                    showStopDialog.value = true;
                    return;
                }

                rightExhibition.value = response.data;
                rightExhibition.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
            });
        };

        const mergeExhibitionMetadata = (exhibition1: Exhibition, exhibition2: Exhibition) => {
            mergeMultilingualContentField(exhibition1.name, exhibition2.name);

            mergeMultilingualContentField(exhibition1.nameAbbreviation, exhibition2.nameAbbreviation);
            exhibition2.nameAbbreviation = [];

            exhibition1.countryId = exhibition2.countryId;
            exhibition2.countryId = undefined;

            mergeMultilingualContentField(exhibition1.place, exhibition2.place);
            exhibition2.place = [];

            mergeMultilingualContentField(exhibition1.keywords, exhibition2.keywords);
            exhibition2.keywords = [];

            mergeMultilingualContentField(exhibition1.description, exhibition2.description);
            exhibition2.description = [];

            bulkTransferFields(exhibition1, exhibition2, [
                { fieldName: "dateFrom", emptyValue: null, setEmpty: false },
                { fieldName: "dateTo", emptyValue: null, setEmpty: false },
                { fieldName: "fee", emptyValue: "" },
                { fieldName: "number", emptyValue: "" },
                { fieldName: "confId", emptyValue: "" },
                { fieldName: "openAlexId", emptyValue: "" }
            ]);

            exhibition2.uris.forEach(uri => {
                if (!exhibition1.uris.includes(uri)) {
                    exhibition1.uris.push(uri);
                }
            });
            exhibition2.uris = [];

            exhibition1.contributions = exhibition1.contributions?.concat(exhibition2.contributions as PersonEventContribution[]);
            exhibition2.contributions = [];

            return [exhibition1, exhibition2];
        };

        const moveAll = (fromLeftToRight: boolean) => {
            updateLeftKeywordsRef.value?.submit();
            updateRightKeywordsRef.value?.submit();
            updateLeftDescriptionRef.value?.submit();
            updateRightDescriptionRef.value?.submit();
            updateLeftRef.value?.submit();
            updateRightRef.value?.submit();

            if (fromLeftToRight) {
                [rightExhibition.value, leftExhibition.value] = mergeExhibitionMetadata(rightExhibition.value as Exhibition, leftExhibition.value as Exhibition);
            } else {
                [leftExhibition.value, rightExhibition.value] = mergeExhibitionMetadata(leftExhibition.value as Exhibition, rightExhibition.value as Exhibition);
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

        const updateLeft = (basicInfo: Exhibition) => {
            leftExhibition.value!.name = basicInfo.name;
            leftExhibition.value!.nameAbbreviation = basicInfo.nameAbbreviation;
            leftExhibition.value!.dateFrom = basicInfo.dateFrom;
            leftExhibition.value!.dateTo = basicInfo.dateTo;
            leftExhibition.value!.countryId = basicInfo.countryId;
            leftExhibition.value!.place = basicInfo.place;
            leftExhibition.value!.serialEvent = basicInfo.serialEvent;
            leftExhibition.value!.fee = basicInfo.fee;
            leftExhibition.value!.number = basicInfo.number;
            leftExhibition.value!.uris = basicInfo.uris;
            
            if (update.value) {
                leftUpdateComplete.value = true;
                finishUpdates();
            }
        };

        const updateRight = (basicInfo: Exhibition) => {
            rightExhibition.value!.name = basicInfo.name;
            rightExhibition.value!.nameAbbreviation = basicInfo.nameAbbreviation;
            rightExhibition.value!.dateFrom = basicInfo.dateFrom;
            rightExhibition.value!.dateTo = basicInfo.dateTo;
            rightExhibition.value!.countryId = basicInfo.countryId;
            rightExhibition.value!.place = basicInfo.place;
            rightExhibition.value!.serialEvent = basicInfo.serialEvent;
            rightExhibition.value!.fee = basicInfo.fee;
            rightExhibition.value!.number = basicInfo.number;
            rightExhibition.value!.uris = basicInfo.uris;
            
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

                MergeService.saveMergedExhibitionsMetadata(
                    leftExhibition.value?.id as number, rightExhibition.value?.id as number,
                    {
                        leftExhibition: leftExhibition.value as Exhibition, 
                        rightExhibition: rightExhibition.value as Exhibition
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
            leftExhibition.value!.description = description;
        };

        const updateRightDescription = (description: MultilingualContent[]) => {
            rightExhibition.value!.description = description;
        };

        const updateLeftKeywords = (keywords: MultilingualContent[]) => {
            leftExhibition.value!.keywords = keywords;
        };

        const updateRightKeywords = (keywords: MultilingualContent[]) => {
            rightExhibition.value!.keywords = keywords;
        };

        const deleteSide = async (side: ComparisonSide, isForceDelete = false) => {
            const id = side === ComparisonSide.LEFT ? leftExhibition.value?.id : rightExhibition.value?.id;
            const transferTargetId = side === ComparisonSide.LEFT ? rightExhibition.value?.id : leftExhibition.value?.id;
            const name = side === ComparisonSide.LEFT ? leftExhibition.value?.name : rightExhibition.value?.name;

            try {
                const deleteAction = isForceDelete
                    ? EventService.forceDeleteExhibition(id as number)
                    : EventService.deleteExhibition(id as number);

                await deleteAction;

                await MergeService.migrateGenericIdentifierHistory(id as number, transferTargetId as number, EntityType.EXHIBITION);
                await MergeService.switchAllIndicatorsToOtherExhibition(id as number, transferTargetId as number);
                await MergeService.switchAllClassificationsToOtherExhibition(id as number, transferTargetId as number);

                router.push({ name: "exhibitionLandingPage", params: { id: transferTargetId } });
            } catch (_error) {
                snackbarMessage.value = i18n.t(
                    "deleteFailedNotification", 
                    { name: returnCurrentLocaleContent(name) }
                );
                snackbar.value = true;
            }
        };

        return {
            returnCurrentLocaleContent,
            snackbar, snackbarMessage,
            leftExhibition, rightExhibition,
            moveAll, updateAll, updateLeft,
            updateLeftRef, updateRightRef, EntityType,
            updateRight, showStopDialog, deleteSide,
            updateLeftDescription, updateRightDescription,
            updateLeftKeywords, updateRightKeywords,
            updateLeftKeywordsRef, updateRightKeywordsRef,
            updateLeftDescriptionRef, updateRightDescriptionRef
        };
}})

</script>
