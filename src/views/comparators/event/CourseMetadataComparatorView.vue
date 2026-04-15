<template>
    <v-container id="course-publications-comparator">
        <v-row class="d-flex flex-row justify-center align-start">
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ returnCurrentLocaleContent(leftCourse?.name) }}
                </h2>
                <br />

                <course-update-form
                    ref="updateLeftRef"
                    :preset-event="leftCourse"
                    in-comparator
                    :in-modal="false"
                    @update="updateLeft"
                />

                <br />

                <description-or-biography-update-form
                    ref="updateLeftDescriptionRef"
                    :preset-description-or-biography="(leftCourse?.description as MultilingualContent[])"
                    :placeholder-label="$t('eventDescriptionLabel')"
                    @update="updateLeftDescription"
                />

                <keyword-update-form
                    ref="updateLeftKeywordsRef"
                    :preset-keywords="(leftCourse?.keywords as MultilingualContent[])"
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
                            :contribution-list="leftCourse?.contributions ? leftCourse.contributions : []"
                            :event-id="leftCourse?.id"
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
                    {{ returnCurrentLocaleContent(rightCourse?.name) }}
                </h2>

                <br />

                <course-update-form
                    ref="updateRightRef"
                    :preset-event="rightCourse"
                    in-comparator
                    :in-modal="false"
                    @update="updateRight"
                />

                <br />

                <description-or-biography-update-form
                    ref="updateRightDescriptionRef"
                    :preset-description-or-biography="(rightCourse?.description as MultilingualContent[])"
                    :placeholder-label="$t('eventDescriptionLabel')"
                    @update="updateRightDescription"
                />

                <keyword-update-form
                    ref="updateRightKeywordsRef"
                    :preset-keywords="(rightCourse?.keywords as MultilingualContent[])"
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
                            :contribution-list="rightCourse?.contributions ? rightCourse.contributions : []"
                            :event-id="rightCourse?.id"
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
            :left-id="(leftCourse?.id as number)"
            :right-id="(rightCourse?.id as number)"
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
import type { Course, PersonEventContribution } from '@/models/EventModel';
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
import CourseUpdateForm from '@/components/event/update/CourseUpdateForm.vue';


export default defineComponent({
    name: "CourseMetadataComparator",
    components: { CourseUpdateForm, PersonEventContributionList, Toast, PersistentStopDialog, DescriptionOrBiographyUpdateForm, KeywordUpdateForm, ComparisonActions },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const leftCourse = ref<Course>();
        const rightCourse = ref<Course>();

        const updateLeftRef = ref<typeof CourseUpdateForm>();
        const updateRightRef = ref<typeof CourseUpdateForm>();
        const updateRightDescriptionRef = ref<typeof DescriptionOrBiographyUpdateForm>();
        const updateLeftDescriptionRef = ref<typeof DescriptionOrBiographyUpdateForm>();
        const updateRightKeywordsRef = ref<typeof KeywordUpdateForm>();
        const updateLeftKeywordsRef = ref<typeof KeywordUpdateForm>();

        const showStopDialog = ref(false);

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("eventMetadataComparatorLabel");
            fetchCourses();
        });

        const fetchCourses = () => {
            EventService.readCourse(parseInt(currentRoute.params.leftId as string)).then((response) => {
                if (response.data.serialEvent) {
                    showStopDialog.value = true;
                    return;
                }

                leftCourse.value = response.data;
                leftCourse.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
            });

            EventService.readCourse(parseInt(currentRoute.params.rightId as string)).then((response) => {
                if (response.data.serialEvent) {
                    showStopDialog.value = true;
                    return;
                }

                rightCourse.value = response.data;
                rightCourse.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
            });
        };

        const mergeCourseMetadata = (course1: Course, course2: Course) => {
            mergeMultilingualContentField(course1.name, course2.name);

            mergeMultilingualContentField(course1.nameAbbreviation, course2.nameAbbreviation);
            course2.nameAbbreviation = [];

            course1.countryId = course2.countryId;
            course2.countryId = undefined;

            mergeMultilingualContentField(course1.place, course2.place);
            course2.place = [];

            mergeMultilingualContentField(course1.keywords, course2.keywords);
            course2.keywords = [];

            mergeMultilingualContentField(course1.description, course2.description);
            course2.description = [];

            mergeMultilingualContentField(course1.displayOrganizer, course2.displayOrganizer);
            course2.displayOrganizer = [];

            mergeMultilingualContentField(course1.groupName, course2.groupName);
            course2.groupName = [];

            bulkTransferFields(course1, course2, [
                { fieldName: "dateFrom", emptyValue: null, setEmpty: false },
                { fieldName: "dateTo", emptyValue: null, setEmpty: false },
                { fieldName: "courseLevel", emptyValue: "" },
                { fieldName: "courseCode", emptyValue: "" },
                { fieldName: "numberOfCredits", emptyValue: "" },
                { fieldName: "numberOfStudents", emptyValue: 0 },
                { fieldName: "academicYear", emptyValue: "" }
            ]);

            course2.uris.forEach(uri => {
                if (!course1.uris.includes(uri)) {
                    course1.uris.push(uri);
                }
            });
            course2.uris = [];

            course1.contributions = course1.contributions?.concat(course2.contributions as PersonEventContribution[]);
            course2.contributions = [];

            return [course1, course2];
        };

        const moveAll = (fromLeftToRight: boolean) => {
            updateLeftKeywordsRef.value?.submit();
            updateRightKeywordsRef.value?.submit();
            updateLeftDescriptionRef.value?.submit();
            updateRightDescriptionRef.value?.submit();
            updateLeftRef.value?.submit();
            updateRightRef.value?.submit();

            if (fromLeftToRight) {
                [rightCourse.value, leftCourse.value] = mergeCourseMetadata(rightCourse.value as Course, leftCourse.value as Course);
            } else {
                [leftCourse.value, rightCourse.value] = mergeCourseMetadata(leftCourse.value as Course, rightCourse.value as Course);
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

        const updateLeft = (basicInfo: Course) => {
            leftCourse.value!.name = basicInfo.name;
            leftCourse.value!.nameAbbreviation = basicInfo.nameAbbreviation;
            leftCourse.value!.dateFrom = basicInfo.dateFrom;
            leftCourse.value!.dateTo = basicInfo.dateTo;
            leftCourse.value!.countryId = basicInfo.countryId;
            leftCourse.value!.place = basicInfo.place;
            leftCourse.value!.serialEvent = basicInfo.serialEvent;
            leftCourse.value!.courseLevel = basicInfo.courseLevel;
            leftCourse.value!.courseCode = basicInfo.courseCode;
            leftCourse.value!.academicYear = basicInfo.academicYear;
            leftCourse.value!.numberOfCredits = basicInfo.numberOfCredits;
            leftCourse.value!.numberOfStudents = basicInfo.numberOfStudents;
            leftCourse.value!.groupName = basicInfo.groupName;
            leftCourse.value!.uris = basicInfo.uris;
            leftCourse.value!.displayOrganizer = basicInfo.displayOrganizer;
            
            if (update.value) {
                leftUpdateComplete.value = true;
                finishUpdates();
            }
        };

        const updateRight = (basicInfo: Course) => {
            rightCourse.value!.name = basicInfo.name;
            rightCourse.value!.nameAbbreviation = basicInfo.nameAbbreviation;
            rightCourse.value!.dateFrom = basicInfo.dateFrom;
            rightCourse.value!.dateTo = basicInfo.dateTo;
            rightCourse.value!.countryId = basicInfo.countryId;
            rightCourse.value!.place = basicInfo.place;
            rightCourse.value!.serialEvent = basicInfo.serialEvent;
            rightCourse.value!.courseLevel = basicInfo.courseLevel;
            rightCourse.value!.courseCode = basicInfo.courseCode;
            rightCourse.value!.academicYear = basicInfo.academicYear;
            rightCourse.value!.numberOfCredits = basicInfo.numberOfCredits;
            rightCourse.value!.numberOfStudents = basicInfo.numberOfStudents;
            rightCourse.value!.groupName = basicInfo.groupName;
            rightCourse.value!.uris = basicInfo.uris;
            rightCourse.value!.displayOrganizer = basicInfo.displayOrganizer;
            
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

                MergeService.saveMergedCoursesMetadata(
                    leftCourse.value?.id as number, rightCourse.value?.id as number,
                    {
                        leftCourse: leftCourse.value as Course, 
                        rightCourse: rightCourse.value as Course
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
            leftCourse.value!.description = description;
        };

        const updateRightDescription = (description: MultilingualContent[]) => {
            rightCourse.value!.description = description;
        };

        const updateLeftKeywords = (keywords: MultilingualContent[]) => {
            leftCourse.value!.keywords = keywords;
        };

        const updateRightKeywords = (keywords: MultilingualContent[]) => {
            rightCourse.value!.keywords = keywords;
        };

        const deleteSide = async (side: ComparisonSide, isForceDelete = false) => {
            const id = side === ComparisonSide.LEFT ? leftCourse.value?.id : rightCourse.value?.id;
            const transferTargetId = side === ComparisonSide.LEFT ? rightCourse.value?.id : leftCourse.value?.id;
            const name = side === ComparisonSide.LEFT ? leftCourse.value?.name : rightCourse.value?.name;

            try {
                const deleteAction = isForceDelete
                    ? EventService.forceDeleteCourse(id as number)
                    : EventService.deleteCourse(id as number);

                await deleteAction;

                await MergeService.migrateGenericIdentifierHistory(id as number, transferTargetId as number, EntityType.COURSE);
                await MergeService.switchAllIndicatorsToOtherCourse(id as number, transferTargetId as number);
                await MergeService.switchAllClassificationsToOtherCourse(id as number, transferTargetId as number);

                router.push({ name: "courseLandingPage", params: { id: transferTargetId } });
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
            leftCourse, rightCourse,
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
