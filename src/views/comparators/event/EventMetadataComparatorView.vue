<template>
    <v-container id="conference-publications-comparator">
        <v-row class="d-flex flex-row justify-center align-start">
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ returnCurrentLocaleContent(leftConference?.name) }}
                </h2>
                <br />

                <event-update-form
                    ref="updateLeftRef" :preset-event="leftConference" in-comparator :in-modal="false"
                    @update="updateLeft"></event-update-form>

                <br />

                <description-or-biography-update-form
                    ref="updateLeftDescriptionRef"
                    :preset-description-or-biography="(leftConference?.description as MultilingualContent[])"
                    :placeholder-label="$t('eventDescriptionLabel')"
                    @update="updateLeftDescription">
                </description-or-biography-update-form>

                <keyword-update-form
                    ref="updateLeftKeywordsRef"
                    :preset-keywords="(leftConference?.keywords as MultilingualContent[])"
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
                            :contribution-list="leftConference?.contributions ? leftConference.contributions : []"
                            :event-id="leftConference?.id"
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
                    {{ returnCurrentLocaleContent(rightConference?.name) }}
                </h2>

                <br />

                <event-update-form
                    ref="updateRightRef" :preset-event="rightConference" in-comparator :in-modal="false"
                    @update="updateRight"></event-update-form>

                <br />

                <description-or-biography-update-form
                    ref="updateRightDescriptionRef"
                    :preset-description-or-biography="(rightConference?.description as MultilingualContent[])"
                    :placeholder-label="$t('eventDescriptionLabel')"
                    @update="updateRightDescription">
                </description-or-biography-update-form>

                <keyword-update-form
                    ref="updateRightKeywordsRef"
                    :preset-keywords="(rightConference?.keywords as MultilingualContent[])"
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
                            :contribution-list="rightConference?.contributions ? rightConference.contributions : []"
                            :event-id="rightConference?.id"
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
            aggregated-entities-comparison-page="eventProceedingsComparator"
            :left-id="(leftConference?.id as number)"
            :right-id="(rightConference?.id as number)"
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
import type { Conference, PersonEventContribution } from '@/models/EventModel';
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
    name: "ConferenceMetadataComparator",
    components: { EventUpdateForm, PersonEventContributionList, Toast, PersistentStopDialog, DescriptionOrBiographyUpdateForm, KeywordUpdateForm, ComparisonActions },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const leftConference = ref<Conference>();
        const rightConference = ref<Conference>();

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
            fetchConferences();
        });

        const fetchConferences = () => {
            EventService.readConference(parseInt(currentRoute.params.leftId as string)).then((response) => {
                if (response.data.serialEvent) {
                    showStopDialog.value = true;
                    return;
                }

                leftConference.value = response.data;
                leftConference.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
            });

            EventService.readConference(parseInt(currentRoute.params.rightId as string)).then((response) => {
                if (response.data.serialEvent) {
                    showStopDialog.value = true;
                    return;
                }

                rightConference.value = response.data;
                rightConference.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
            });
        };

        const mergeConferenceMetadata = (conference1: Conference, conference2: Conference) => {
            mergeMultilingualContentField(conference1.name, conference2.name);

            mergeMultilingualContentField(conference1.nameAbbreviation, conference2.nameAbbreviation);
            conference2.nameAbbreviation = [];

            conference1.countryId = conference2.countryId;
            conference2.countryId = undefined;

            mergeMultilingualContentField(conference1.place, conference2.place);
            conference2.place = [];

            mergeMultilingualContentField(conference1.keywords, conference2.keywords);
            conference2.keywords = [];

            mergeMultilingualContentField(conference1.description, conference2.description);
            conference2.description = [];

            bulkTransferFields(conference1, conference2, [
                { fieldName: "dateFrom", emptyValue: null, setEmpty: false },
                { fieldName: "dateTo", emptyValue: null, setEmpty: false },
                { fieldName: "fee", emptyValue: "" },
                { fieldName: "number", emptyValue: "" },
                { fieldName: "confId", emptyValue: "" },
                { fieldName: "openAlexId", emptyValue: "" }
            ]);

            conference2.uris.forEach(uri => {
                if (!conference1.uris.includes(uri)) {
                    conference1.uris.push(uri);
                }
            });
            conference2.uris = [];

            conference1.contributions = conference1.contributions?.concat(conference2.contributions as PersonEventContribution[]);
            conference2.contributions = [];

            return [conference1, conference2];
        };

        const moveAll = (fromLeftToRight: boolean) => {
            updateLeftKeywordsRef.value?.submit();
            updateRightKeywordsRef.value?.submit();
            updateLeftDescriptionRef.value?.submit();
            updateRightDescriptionRef.value?.submit();
            updateLeftRef.value?.submit();
            updateRightRef.value?.submit();

            if (fromLeftToRight) {
                [rightConference.value, leftConference.value] = mergeConferenceMetadata(rightConference.value as Conference, leftConference.value as Conference);
            } else {
                [leftConference.value, rightConference.value] = mergeConferenceMetadata(leftConference.value as Conference, rightConference.value as Conference);
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

        const updateLeft = (basicInfo: Conference) => {
            leftConference.value!.name = basicInfo.name;
            leftConference.value!.nameAbbreviation = basicInfo.nameAbbreviation;
            leftConference.value!.dateFrom = basicInfo.dateFrom;
            leftConference.value!.dateTo = basicInfo.dateTo;
            leftConference.value!.countryId = basicInfo.countryId;
            leftConference.value!.place = basicInfo.place;
            leftConference.value!.serialEvent = basicInfo.serialEvent;
            leftConference.value!.fee = basicInfo.fee;
            leftConference.value!.number = basicInfo.number;
            leftConference.value!.confId = basicInfo.confId;
            leftConference.value!.openAlexId = basicInfo.openAlexId;
            leftConference.value!.uris = basicInfo.uris;
            
            if (update.value) {
                leftUpdateComplete.value = true;
                finishUpdates();
            }
        };

        const updateRight = (basicInfo: Conference) => {
            rightConference.value!.name = basicInfo.name;
            rightConference.value!.nameAbbreviation = basicInfo.nameAbbreviation;
            rightConference.value!.dateFrom = basicInfo.dateFrom;
            rightConference.value!.dateTo = basicInfo.dateTo;
            rightConference.value!.countryId = basicInfo.countryId;
            rightConference.value!.place = basicInfo.place;
            rightConference.value!.serialEvent = basicInfo.serialEvent;
            rightConference.value!.fee = basicInfo.fee;
            rightConference.value!.number = basicInfo.number;
            rightConference.value!.confId = basicInfo.confId;
            rightConference.value!.openAlexId = basicInfo.openAlexId;
            rightConference.value!.uris = basicInfo.uris;
            
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

                MergeService.saveMergedConferencesMetadata(
                    leftConference.value?.id as number, rightConference.value?.id as number,
                    {
                        leftConference: leftConference.value as Conference, 
                        rightConference: rightConference.value as Conference
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
            leftConference.value!.description = description;
        };

        const updateRightDescription = (description: MultilingualContent[]) => {
            rightConference.value!.description = description;
        };

        const updateLeftKeywords = (keywords: MultilingualContent[]) => {
            leftConference.value!.keywords = keywords;
        };

        const updateRightKeywords = (keywords: MultilingualContent[]) => {
            rightConference.value!.keywords = keywords;
        };

        const deleteSide = async (side: ComparisonSide, isForceDelete = false) => {
            const id = side === ComparisonSide.LEFT ? leftConference.value?.id : rightConference.value?.id;
            const transferTargetId = side === ComparisonSide.LEFT ? rightConference.value?.id : leftConference.value?.id;
            const name = side === ComparisonSide.LEFT ? leftConference.value?.name : rightConference.value?.name;

            try {
                const deleteAction = isForceDelete
                    ? EventService.forceDeleteConference(id as number)
                    : EventService.deleteConference(id as number);

                await deleteAction;

                await MergeService.migrateGenericIdentifierHistory(id as number, transferTargetId as number, EntityType.EVENT);
                await MergeService.switchAllIndicatorsToOtherConference(id as number, transferTargetId as number);
                await MergeService.switchAllClassificationsToOtherConference(id as number, transferTargetId as number);

                router.push({ name: "conferenceLandingPage", params: { id: transferTargetId } });
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
            leftConference, rightConference,
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
