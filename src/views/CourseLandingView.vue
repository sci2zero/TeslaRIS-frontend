<template>
    <v-container id="course">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        <v-skeleton-loader
                            :loading="!course"
                            type="heading"
                            color="blue-lighten-3"
                            class="d-flex justify-center align-center"
                        >
                            <p class="text-h5">
                                {{ returnCurrentLocaleContent(course?.name) + (course?.nameAbbreviation && course.nameAbbreviation.length > 0 ? " (" + returnCurrentLocaleContent(course?.nameAbbreviation) + ")" : "") }}
                            </p>
                        </v-skeleton-loader>
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ $t("courseLabel") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- Course Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon size="x-large" class="large-course-icon">
                    {{ icon }}
                </v-icon>
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="secondary">
                    <v-card-text class="edit-pen-container">
                        <generic-crud-modal
                            :form-component="CourseUpdateForm"
                            :form-props="{ presetEvent: course }"
                            entity-name="Course"
                            is-update
                            is-section-update
                            :read-only="!canEdit"
                            @update="updateBasicInfo"
                        />

                        <!-- Personal Info -->
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>
                        <basic-info-loader v-if="!course" :citation-button="false" />
                        <v-row>
                            <v-col cols="6">
                                <div v-if="!course?.serialEvent">
                                    {{ $t("eventDateLabel") }}:
                                </div>
                                <div v-if="!course?.serialEvent" class="response">
                                    {{ localiseDateRange(course?.dateFrom as string, course?.dateTo as string) }}
                                </div>
                                <div v-if="course?.countryId">
                                    {{ $t("stateLabel") }}:
                                </div>
                                <div v-if="course?.countryId" class="response">
                                    {{ returnCurrentLocaleContent(country?.name) }}
                                </div>
                                <div v-if="course?.place && course.place.length > 0">
                                    {{ $t("placeLabel") }}:
                                </div>
                                <div v-if="course?.place && course.place.length > 0" class="response">
                                    {{ returnCurrentLocaleContent(course?.place) }}
                                </div>
                                <div v-if="course?.courseLevel">
                                    {{ $t("courseLevelLabel") }}:
                                </div>
                                <div v-if="course?.courseLevel" class="response">
                                    {{ course.courseLevel }}
                                </div>
                                <div v-if="course?.courseCode">
                                    {{ $t("courseCodeLabel") }}:
                                </div>
                                <div v-if="course?.courseCode" class="response">
                                    {{ course.courseCode }}
                                </div>
                                <div v-if="course?.academicYear">
                                    {{ $t("academicYearLabel") }}:
                                </div>
                                <div v-if="course?.academicYear" class="response">
                                    {{ course.academicYear }}
                                </div>
                                <div v-if="course?.numberOfCredits">
                                    {{ $t("numberOfCreditsLabel") }}:
                                </div>
                                <div v-if="course?.numberOfCredits" class="response">
                                    {{ course.numberOfCredits }}
                                </div>
                                <div v-if="course?.numberOfStudents">
                                    {{ $t("numberOfStudentsLabel") }}:
                                </div>
                                <div v-if="course?.numberOfStudents" class="response">
                                    {{ course.numberOfStudents }}
                                </div>
                                <div v-if="(course?.groupName?.length ?? 0) > 0">
                                    {{ $t("groupNameLabel") }}:
                                </div>
                                <div v-if="(course?.groupName?.length ?? 0) > 0" class="response">
                                    {{ returnCurrentLocaleContent(course?.groupName) }}
                                </div>
                                <div v-if="(course?.displayOrganizer?.length ?? 0) > 0">
                                    {{ $t("organizerLabel") }}:
                                </div>
                                <div v-if="(course?.displayOrganizer?.length ?? 0) > 0" class="response">
                                    {{ returnCurrentLocaleContent(course?.displayOrganizer) }}
                                </div>
                                <div v-if="course?.uris && course?.uris.length > 0">
                                    {{ $t("uriInputLabel") }}:
                                </div>
                                <div class="response">
                                    <uri-list :uris="course?.uris"></uri-list>
                                </div>
                                <br />
                                <div v-if="course?.serialEvent">
                                    <h2>{{ $t("isSerialEventMessage") }}</h2>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <tab-content-loader v-if="!course" layout="sections" />
        <v-tabs
            v-show="course"
            v-model="currentTab"
            color="deep-purple-accent-4"
            align-tabs="start"
        >
            <v-tab value="contributions">
                {{ $t("participationsLabel") }}
            </v-tab>    
            <v-tab value="additionalInfo">
                {{ $t("additionalInfoLabel") }}
            </v-tab>
            <v-tab v-show="(eventIndicators && eventIndicators.length > 0) || canClassify" value="indicators">
                {{ $t("indicatorListLabel") }}
            </v-tab>
            <v-tab v-show="(eventClassifications && eventClassifications.length > 0) || canClassify" value="classifications">
                {{ $t("classificationsLabel") }}
            </v-tab>
        </v-tabs>

        <v-tabs-window
            v-show="course"
            v-model="currentTab">
            <v-tabs-window-item value="contributions">
                <person-event-contribution-tabs
                    :event-id="course?.id"
                    :contribution-list="course?.contributions ? course.contributions : []"
                    :read-only="!canEdit"
                    @update="updateContributions">
                </person-event-contribution-tabs>
            </v-tabs-window-item>
            <v-tabs-window-item value="additionalInfo">
                <keyword-list
                    :keywords="course?.keywords ? course?.keywords : []"
                    :can-edit="canEdit"
                    @update="updateKeywords">
                </keyword-list>
                <description-section
                    :description="course?.description ? course.description : []"
                    :can-edit="canEdit"
                    is-general-description
                    @update="updateDescription">
                </description-section>

                <div class="mt-10">
                    <events-relation-list
                        :preset-event="course"
                        :readonly="!canEdit"
                    />
                </div>
            </v-tabs-window-item>
            <v-tabs-window-item value="indicators">
                <indicators-section 
                    :indicators="eventIndicators" 
                    :applicable-types="[ApplicableEntityType.EVENT]" 
                    :entity-id="course?.id" 
                    :entity-type="ApplicableEntityType.EVENT" 
                    :can-edit="canClassify"
                    show-statistics
                    @create="createIndicator"
                    @updated="fetchIndicators"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="classifications">
                <entity-classification-view
                    :entity-classifications="eventClassifications"
                    :entity-id="course?.id"
                    :can-edit="canClassify"
                    :containing-entity-type="ApplicableEntityType.EVENT"
                    :applicable-types="[ApplicableEntityType.COURSE]"
                    @create="createClassification"
                    @update="fetchClassifications"
                />
            </v-tabs-window-item>
        </v-tabs-window>
        
        <toast v-model="snackbar" :message="snackbarMessage" />
    </v-container>
</template>

<script lang="ts">
import { onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import KeywordList from '@/components/core/KeywordList.vue';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { Course, PersonEventContribution } from "@/models/EventModel";
import EventService from '@/services/EventService';
import PersonEventContributionTabs from '@/components/core/PersonEventContributionTabs.vue';
import { ApplicableEntityType, type Country, type MultilingualContent } from '@/models/Common';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import DescriptionSection from '@/components/core/DescriptionSection.vue';
import { localiseDateRange } from '@/utils/DateUtil';
import EventsRelationList from '@/components/event/EventsRelationList.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import CountryService from '@/services/CountryService';
import UriList from '@/components/core/UriList.vue';
import EntityIndicatorService from '@/services/assessment/EntityIndicatorService';
import type { EntityClassificationResponse, EntityIndicatorResponse, EventAssessmentClassification, EventIndicator } from '@/models/AssessmentModel';
import IndicatorsSection from '@/components/assessment/indicators/IndicatorsSection.vue';
import Toast from '@/components/core/Toast.vue';
import EntityClassificationService from '@/services/assessment/EntityClassificationService';
import EntityClassificationView from '@/components/assessment/classifications/EntityClassificationView.vue';
import { useLoginStore } from '@/stores/loginStore';
import BasicInfoLoader from '@/components/core/BasicInfoLoader.vue';
import TabContentLoader from '@/components/core/TabContentLoader.vue';
import StatisticsService from '@/services/StatisticsService';
import CourseUpdateForm from '@/components/event/update/CourseUpdateForm.vue';


export default defineComponent({
    name: "CourseLandingPage",
    components: { PersonEventContributionTabs, KeywordList, GenericCrudModal, DescriptionSection, EventsRelationList, UriList, IndicatorsSection, Toast, EntityClassificationView, BasicInfoLoader, TabContentLoader },
    setup() {
        const currentTab = ref("contributions");

        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const course = ref<Course>();
        const keywords = ref<string[]>([]);
        
        const i18n = useI18n();
        const router = useRouter();

        const icon = ref("mdi-presentation");

        const canEdit = ref(false);
        const canClassify = ref(false);
        const country = ref<Country>();

        const eventIndicators = ref<EntityIndicatorResponse[]>();
        const eventClassifications = ref<EntityClassificationResponse[]>();

        const loginStore = useLoginStore();

        onMounted(() => {
            if (loginStore.userLoggedIn) {
                EventService.canEdit(parseInt(currentRoute.params.id as string)).then((response) => {
                    canEdit.value = response.data;
                });
                EventService.canClassify(parseInt(currentRoute.params.id as string)).then((response) => {
                    canClassify.value = response.data;
                });
                fetchClassifications();

                StatisticsService.registerEventView(parseInt(currentRoute.params.id as string));
            }

            fetchCourse();
            fetchIndicators();
        });

        const fetchIndicators = () => {
            EntityIndicatorService.fetchEventIndicators(parseInt(currentRoute.params.id as string)).then(response => {
                eventIndicators.value = response.data;
            });
        };

        const fetchClassifications = () => {
            EntityClassificationService.fetchEventClassifications(parseInt(currentRoute.params.id as string)).then(response => {
                eventClassifications.value = response.data;
            });
        };

        const fetchCourse = () => {
            EventService.readCourse(
                parseInt(currentRoute.params.id as string)
            ).then((response) => {
                course.value = response.data;
                
                document.title = returnCurrentLocaleContent(course.value.name) as string;

                fetchDetails();

                currentTab.value =
                    ((course.value?.contributions?.length ?? 0) > 0) ? "contributions" : "additionalInfo";
            }).catch(() => {
                router.push({ name: "notFound" });
            });
        };

        const fetchDetails = () => {
            if (course.value?.countryId) {
                CountryService.readCountry(course.value.countryId as number).then((response) => {
                    country.value = response.data;
                });
            }
        };

        const updateKeywords = (keywords: MultilingualContent[]) => {
            course.value!.keywords = keywords;
            performUpdate(false);
        };

        const updateDescription = (description: MultilingualContent[]) => {
            course.value!.description = description;
            performUpdate(false);
        };

        const updateContributions = (contributions: PersonEventContribution[]) => {
            course.value!.contributions = contributions;
            performUpdate(true);
        };

        const updateBasicInfo = (basicInfo: Course) => {
            course.value!.name = basicInfo.name;
            course.value!.nameAbbreviation = basicInfo.nameAbbreviation;
            course.value!.dateFrom = basicInfo.dateFrom;
            course.value!.dateTo = basicInfo.dateTo;
            course.value!.countryId = basicInfo.countryId;
            course.value!.place = basicInfo.place;
            course.value!.serialEvent = basicInfo.serialEvent;
            course.value!.courseLevel = basicInfo.courseLevel;
            course.value!.courseCode = basicInfo.courseCode;
            course.value!.academicYear = basicInfo.academicYear;
            course.value!.numberOfCredits = basicInfo.numberOfCredits;
            course.value!.numberOfStudents = basicInfo.numberOfStudents;
            course.value!.groupName = basicInfo.groupName;
            course.value!.uris = basicInfo.uris;
            course.value!.displayOrganizer = basicInfo.displayOrganizer;

            performUpdate(true);
        };

        const performUpdate = (reload: boolean) => {
            EventService.updateCourse(course.value?.id as number, course.value as Course).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                if(reload) {
                    fetchCourse();
                }
            }).catch((error) => {
                snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
                if(reload) {
                    fetchCourse();
                }
            });
        };

        const createIndicator = async (eventIndicator: {indicator: EventIndicator, files: File[]}) => {
            EntityIndicatorService.createEventIndicator(eventIndicator.indicator).then((response) => {
                EntityIndicatorService.uploadFilesAndFetchIndicators(eventIndicator.files, response.data.id).then(() => {
                    fetchIndicators();
                });
            });
        };

        const createClassification = (eventClassification: EventAssessmentClassification) => {
            EntityClassificationService.createEventClassification(eventClassification).then(() => {
                fetchClassifications();
            });
        };

        return {
            keywords, localiseDateRange, updateBasicInfo,
            canEdit, returnCurrentLocaleContent, course,
            updateContributions, updateKeywords, icon,
            snackbar, snackbarMessage, updateDescription,
            country, CourseUpdateForm, ApplicableEntityType,
            eventIndicators, fetchIndicators, createIndicator,
            currentTab, eventClassifications, createClassification,
            fetchClassifications, canClassify
        };
}})

</script>

<style scoped>
    #course .large-course-icon {
        font-size: 10em;
    }

    #course .response {
        font-size: 1.2rem;
        margin-bottom: 10px;
        font-weight: bold;
    }

    .edit-pen-container {
        position:relative;
    }
</style>
