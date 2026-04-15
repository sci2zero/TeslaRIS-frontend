<template>
    <v-container id="otherEvent-publications-comparator">
        <v-row class="d-flex flex-row justify-center align-start">
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ returnCurrentLocaleContent(leftOtherEvent?.name) }}
                </h2>
                <br />

                <other-event-update-form
                    ref="updateLeftRef"
                    :preset-event="leftOtherEvent"
                    in-comparator
                    :in-modal="false"
                    @update="updateLeft"
                />

                <br />

                <description-or-biography-update-form
                    ref="updateLeftDescriptionRef"
                    :preset-description-or-biography="(leftOtherEvent?.description as MultilingualContent[])"
                    :placeholder-label="$t('eventDescriptionLabel')"
                    @update="updateLeftDescription"
                />

                <keyword-update-form
                    ref="updateLeftKeywordsRef"
                    :preset-keywords="(leftOtherEvent?.keywords as MultilingualContent[])"
                    @update="updateRightKeywords"
                />

                <br />

                <!-- Left Contributions Table -->
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div>
                            <b>{{ $t("contributionsLabel") }}</b>
                        </div>

                        <person-event-contribution-list
                            :contribution-list="leftOtherEvent?.contributions ? leftOtherEvent.contributions : []"
                            :event-id="leftOtherEvent?.id"
                            in-comparator
                            :can-reorder="true"
                        />
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
                    {{ returnCurrentLocaleContent(rightOtherEvent?.name) }}
                </h2>

                <br />

                <other-event-update-form
                    ref="updateRightRef"
                    :preset-event="rightOtherEvent"
                    in-comparator
                    :in-modal="false"
                    @update="updateRight"
                />

                <br />

                <description-or-biography-update-form
                    ref="updateRightDescriptionRef"
                    :preset-description-or-biography="(rightOtherEvent?.description as MultilingualContent[])"
                    :placeholder-label="$t('eventDescriptionLabel')"
                    @update="updateRightDescription"
                />

                <keyword-update-form
                    ref="updateRightKeywordsRef"
                    :preset-keywords="(rightOtherEvent?.keywords as MultilingualContent[])"
                    @update="updateRightKeywords"
                />

                <br />

                <!-- Right Contributions Table -->
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div>
                            <b>{{ $t("contributionsLabel") }}</b>
                        </div>

                        <person-event-contribution-list
                            :contribution-list="rightOtherEvent?.contributions ? rightOtherEvent.contributions : []"
                            :event-id="rightOtherEvent?.id"
                            in-comparator
                            :can-reorder="true"
                        />
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <comparison-actions
            :is-form-valid="updateLeftRef?.isFormValid && updateRightRef?.isFormValid"
            supports-force-delete
            :left-id="(leftOtherEvent?.id as number)"
            :right-id="(rightOtherEvent?.id as number)"
            :entity-type="EntityType.EVENT"
            @update="updateAll"
            @delete="deleteSide"
        />

        <toast
            v-model="snackbar"
            :message="snackbarMessage"
        />

        <persistent-stop-dialog
            v-if="showStopDialog"
            :text="$t('cantCompareSerialEventsMetadataMessage')"
        />
    </v-container>
</template>

<script lang="ts">
import { onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { mergeMultilingualContentField, returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import { getErrorMessageForErrorKey } from '@/i18n';
import type { OtherEvent, PersonEventContribution } from '@/models/EventModel';
import EventService from '@/services/EventService';
import type { MultilingualContent } from '@/models/Common';
import PersonEventContributionList from '@/components/core/PersonEventContributionList.vue';
import PersistentStopDialog from '@/components/core/PersistentStopDialog.vue';
import DescriptionOrBiographyUpdateForm from '@/components/core/update/DescriptionOrBiographyUpdateForm.vue';
import KeywordUpdateForm from '@/components/core/update/KeywordUpdateForm.vue';
import ComparisonActions from '@/components/core/comparators/ComparisonActions.vue';
import { ComparisonSide, EntityType } from '@/models/MergeModel';
import MergeService from '@/services/MergeService';
import Toast from '@/components/core/Toast.vue';
import { bulkTransferFields } from '@/utils/FieldTransferUtil';
import OtherEventUpdateForm from '@/components/event/update/OtherEventUpdateForm.vue';


export default defineComponent({
    name: "OtherEventMetadataComparator",
    components: { OtherEventUpdateForm, PersonEventContributionList, Toast, PersistentStopDialog, DescriptionOrBiographyUpdateForm, KeywordUpdateForm, ComparisonActions },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const leftOtherEvent = ref<OtherEvent>();
        const rightOtherEvent = ref<OtherEvent>();

        const updateLeftRef = ref<typeof OtherEventUpdateForm>();
        const updateRightRef = ref<typeof OtherEventUpdateForm>();
        const updateRightDescriptionRef = ref<typeof DescriptionOrBiographyUpdateForm>();
        const updateLeftDescriptionRef = ref<typeof DescriptionOrBiographyUpdateForm>();
        const updateRightKeywordsRef = ref<typeof KeywordUpdateForm>();
        const updateLeftKeywordsRef = ref<typeof KeywordUpdateForm>();

        const showStopDialog = ref(false);

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("eventMetadataComparatorLabel");
            fetchOtherEvents();
        });

        const fetchOtherEvents = () => {
            EventService.readOtherEvent(parseInt(currentRoute.params.leftId as string)).then((response) => {
                if (response.data.serialEvent) {
                    showStopDialog.value = true;
                    return;
                }

                leftOtherEvent.value = response.data;
                leftOtherEvent.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
            });

            EventService.readOtherEvent(parseInt(currentRoute.params.rightId as string)).then((response) => {
                if (response.data.serialEvent) {
                    showStopDialog.value = true;
                    return;
                }

                rightOtherEvent.value = response.data;
                rightOtherEvent.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
            });
        };

        const mergeOtherEventMetadata = (otherEvent1: OtherEvent, otherEvent2: OtherEvent) => {
            mergeMultilingualContentField(otherEvent1.name, otherEvent2.name);

            mergeMultilingualContentField(otherEvent1.nameAbbreviation, otherEvent2.nameAbbreviation);
            otherEvent2.nameAbbreviation = [];

            otherEvent1.countryId = otherEvent2.countryId;
            otherEvent2.countryId = undefined;

            mergeMultilingualContentField(otherEvent1.place, otherEvent2.place);
            otherEvent2.place = [];

            mergeMultilingualContentField(otherEvent1.keywords, otherEvent2.keywords);
            otherEvent2.keywords = [];

            mergeMultilingualContentField(otherEvent1.description, otherEvent2.description);
            otherEvent2.description = [];

            mergeMultilingualContentField(otherEvent1.displayOrganizer, otherEvent2.displayOrganizer);
            otherEvent2.displayOrganizer = [];

            bulkTransferFields(otherEvent1, otherEvent2, [
                { fieldName: "dateFrom", emptyValue: null, setEmpty: false },
                { fieldName: "dateTo", emptyValue: null, setEmpty: false },
                { fieldName: "type", emptyValue: null, setEmpty: false, condition: () => true }
            ]);

            otherEvent2.uris.forEach(uri => {
                if (!otherEvent1.uris.includes(uri)) {
                    otherEvent1.uris.push(uri);
                }
            });
            otherEvent2.uris = [];

            otherEvent1.contributions = otherEvent1.contributions?.concat(otherEvent2.contributions as PersonEventContribution[]);
            otherEvent2.contributions = [];

            return [otherEvent1, otherEvent2];
        };

        const moveAll = (fromLeftToRight: boolean) => {
            updateLeftKeywordsRef.value?.submit();
            updateRightKeywordsRef.value?.submit();
            updateLeftDescriptionRef.value?.submit();
            updateRightDescriptionRef.value?.submit();
            updateLeftRef.value?.submit();
            updateRightRef.value?.submit();

            if (fromLeftToRight) {
                [rightOtherEvent.value, leftOtherEvent.value] = mergeOtherEventMetadata(rightOtherEvent.value as OtherEvent, leftOtherEvent.value as OtherEvent);
            } else {
                [leftOtherEvent.value, rightOtherEvent.value] = mergeOtherEventMetadata(leftOtherEvent.value as OtherEvent, rightOtherEvent.value as OtherEvent);
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

        const updateLeft = (basicInfo: OtherEvent) => {
            leftOtherEvent.value!.name = basicInfo.name;
            leftOtherEvent.value!.nameAbbreviation = basicInfo.nameAbbreviation;
            leftOtherEvent.value!.dateFrom = basicInfo.dateFrom;
            leftOtherEvent.value!.dateTo = basicInfo.dateTo;
            leftOtherEvent.value!.countryId = basicInfo.countryId;
            leftOtherEvent.value!.place = basicInfo.place;
            leftOtherEvent.value!.serialEvent = basicInfo.serialEvent;
            leftOtherEvent.value!.type = basicInfo.type;
            leftOtherEvent.value!.uris = basicInfo.uris;
            leftOtherEvent.value!.displayOrganizer = basicInfo.displayOrganizer;
            
            if (update.value) {
                leftUpdateComplete.value = true;
                finishUpdates();
            }
        };

        const updateRight = (basicInfo: OtherEvent) => {
            rightOtherEvent.value!.name = basicInfo.name;
            rightOtherEvent.value!.nameAbbreviation = basicInfo.nameAbbreviation;
            rightOtherEvent.value!.dateFrom = basicInfo.dateFrom;
            rightOtherEvent.value!.dateTo = basicInfo.dateTo;
            rightOtherEvent.value!.countryId = basicInfo.countryId;
            rightOtherEvent.value!.place = basicInfo.place;
            rightOtherEvent.value!.serialEvent = basicInfo.serialEvent;
            rightOtherEvent.value!.type = basicInfo.type;
            rightOtherEvent.value!.uris = basicInfo.uris;
            rightOtherEvent.value!.displayOrganizer = basicInfo.displayOrganizer;
            
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

                MergeService.saveMergedOtherEventsMetadata(
                    leftOtherEvent.value?.id as number, rightOtherEvent.value?.id as number,
                    {
                        leftOtherEvent: leftOtherEvent.value as OtherEvent, 
                        rightOtherEvent: rightOtherEvent.value as OtherEvent
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
            leftOtherEvent.value!.description = description;
        };

        const updateRightDescription = (description: MultilingualContent[]) => {
            rightOtherEvent.value!.description = description;
        };

        const updateLeftKeywords = (keywords: MultilingualContent[]) => {
            leftOtherEvent.value!.keywords = keywords;
        };

        const updateRightKeywords = (keywords: MultilingualContent[]) => {
            rightOtherEvent.value!.keywords = keywords;
        };

        const deleteSide = async (side: ComparisonSide, isForceDelete = false) => {
            const id = side === ComparisonSide.LEFT ? leftOtherEvent.value?.id : rightOtherEvent.value?.id;
            const transferTargetId = side === ComparisonSide.LEFT ? rightOtherEvent.value?.id : leftOtherEvent.value?.id;
            const name = side === ComparisonSide.LEFT ? leftOtherEvent.value?.name : rightOtherEvent.value?.name;

            try {
                const deleteAction = isForceDelete
                    ? EventService.forceDeleteOtherEvent(id as number)
                    : EventService.deleteOtherEvent(id as number);

                await deleteAction;

                await MergeService.migrateGenericIdentifierHistory(id as number, transferTargetId as number, EntityType.OTHER_EVENT);
                await MergeService.switchAllIndicatorsToOtherEvent(id as number, transferTargetId as number);
                await MergeService.switchAllClassificationsToOtherEvent(id as number, transferTargetId as number);

                router.push({ name: "otherEventLandingPage", params: { id: transferTargetId } });
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
            leftOtherEvent, rightOtherEvent,
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
