<template>
    <v-container id="conference-publications-comparator">
        <v-row class="d-flex flex-row justify-center align-start">
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ returnCurrentLocaleContent(leftConference?.name) }}
                </h2>
                <br />

                <event-update-form ref="updateLeftRef" :preset-event="leftConference" @update="updateLeft"></event-update-form>

                <br />

                <!-- Left Contributions Table -->
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div>
                            <b>{{ $t("contributionsLabel") }}</b>
                        </div>

                        <person-event-contribution-list :contribution-list="leftConference?.contributions ? leftConference.contributions : []" :event-id="leftConference?.id" in-comparator></person-event-contribution-list>
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

                <event-update-form ref="updateRightRef" :preset-event="rightConference" @update="updateRight"></event-update-form>

                <br />

                <!-- Right Contributions Table -->
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div>
                            <b>{{ $t("contributionsLabel") }}</b>
                        </div>

                        <person-event-contribution-list :contribution-list="rightConference?.contributions ? rightConference.contributions : []" :event-id="rightConference?.id" in-comparator></person-event-contribution-list>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-row class="d-flex flex-row justify-center">
            <v-btn color="blue darken-1" @click="updateAll">
                {{ $t("updateLabel") }}
            </v-btn>
        </v-row>

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
import { useRoute } from 'vue-router';
import { returnCurrentLocaleContent } from '@/i18n/TranslationUtil';
import { getErrorMessageForErrorKey } from '@/i18n';
import type { Conference, PersonEventContribution } from '@/models/EventModel';
import EventService from '@/services/EventService';
import type { MultilingualContent } from '@/models/Common';
import PersonEventContributionList from '@/components/core/PersonEventContributionList.vue';
import EventUpdateForm from '@/components/event/update/EventUpdateForm.vue';


export default defineComponent({
    name: "ConferenceMetadataComparator",
    components: { EventUpdateForm, PersonEventContributionList },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();

        const leftConference = ref<Conference>();
        const rightConference = ref<Conference>();

        const updateLeftRef = ref<typeof EventUpdateForm>();
        const updateRightRef = ref<typeof EventUpdateForm>();
        

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("eventMetadataComparatorLabel");
            fetchConferences();
        });

        const fetchConferences = () => {
            EventService.readConference(parseInt(currentRoute.params.leftId as string)).then((response) => {
                leftConference.value = response.data;
            });

            EventService.readConference(parseInt(currentRoute.params.rightId as string)).then((response) => {
                rightConference.value = response.data;
            });
        };

        const mergeMultilingualContentField = (content1: MultilingualContent[], content2: MultilingualContent[]) => {
            content2.forEach(content => {
                let merged = false;
                content1.forEach(currentContent => {
                    if (currentContent.languageTag === content.languageTag) {
                        currentContent.content += " | " + content.content;
                        merged = true;
                    }
                });
                if (!merged) {
                    content1.push(content);
                }
            });
        };

        const mergeConferenceMetadata = (conference1: Conference, conference2: Conference) => {
            mergeMultilingualContentField(conference1.name, conference2.name);

            mergeMultilingualContentField(conference1.nameAbbreviation, conference2.nameAbbreviation);
            conference2.nameAbbreviation = [];

            mergeMultilingualContentField(conference1.state, conference2.state);
            conference2.state = [];

            mergeMultilingualContentField(conference1.place, conference2.place);
            conference2.place = [];

            conference1.dateFrom = conference2.dateFrom;
            conference1.dateTo = conference2.dateTo;
            conference1.fee = conference2.fee;
            conference2.fee = "";
            conference1.number = conference2.number;
            conference2.number = "";
            conference1.confId = conference2.confId;
            conference2.confId = "";

            conference1.contributions = conference1.contributions?.concat(conference2.contributions as PersonEventContribution[]);
            conference2.contributions = [];

            return [conference1, conference2];
        };

        const moveAll = (fromLeftToRight: boolean) => {
            updateLeftRef.value?.updateEvent();
            updateRightRef.value?.updateEvent();

            if (fromLeftToRight) {
                [rightConference.value, leftConference.value] = mergeConferenceMetadata(rightConference.value as Conference, leftConference.value as Conference);
            } else {
                [leftConference.value, rightConference.value] = mergeConferenceMetadata(leftConference.value as Conference, rightConference.value as Conference);
            }

            updateLeftRef.value?.refreshForm();
            updateRightRef.value?.refreshForm();
        };

        const leftUpdateComplete = ref(false);
        const rightUpdateComplete = ref(false);
        const update = ref(false);

        const updateLeft = (basicInfo: Conference) => {
            leftConference.value!.name = basicInfo.name;
            leftConference.value!.nameAbbreviation = basicInfo.nameAbbreviation;
            leftConference.value!.dateFrom = basicInfo.dateFrom;
            leftConference.value!.dateTo = basicInfo.dateTo;
            leftConference.value!.state = basicInfo.state;
            leftConference.value!.place = basicInfo.place;
            leftConference.value!.serialEvent = basicInfo.serialEvent;
            leftConference.value!.fee = basicInfo.fee;
            leftConference.value!.number = basicInfo.number;
            leftConference.value!.confId = basicInfo.confId;
            leftUpdateComplete.value = true;
            
            if (update.value) {
                finishUpdates();
            }
        };

        const updateRight = (basicInfo: Conference) => {
            rightConference.value!.name = basicInfo.name;
            rightConference.value!.nameAbbreviation = basicInfo.nameAbbreviation;
            rightConference.value!.dateFrom = basicInfo.dateFrom;
            rightConference.value!.dateTo = basicInfo.dateTo;
            rightConference.value!.state = basicInfo.state;
            rightConference.value!.place = basicInfo.place;
            rightConference.value!.serialEvent = basicInfo.serialEvent;
            rightConference.value!.fee = basicInfo.fee;
            rightConference.value!.number = basicInfo.number;
            rightConference.value!.confId = basicInfo.confId;
            rightUpdateComplete.value = true;
            
            if (update.value) {
                finishUpdates();
            }
        };

        const updateAll = () => {
            update.value = true;
            updateLeftRef.value?.updateEvent();
            updateRightRef.value?.updateEvent();
        };

        const finishUpdates = () => {
            if (leftUpdateComplete.value && rightUpdateComplete.value) {
                leftUpdateComplete.value = false;
                rightUpdateComplete.value = false;
                update.value = false;

                const updateConferences = (firstId: number, firstConference: Conference, secondId: number, secondConference: Conference) => {
                    return EventService.updateConference(firstId, firstConference)
                        .then(() => EventService.updateConference(secondId, secondConference))
                        .then(() => {
                            snackbarMessage.value = i18n.t("updatedSuccessMessage");
                            snackbar.value = true;
                        })
                        .catch((error) => {
                            throw error;
                        });
                };

                updateConferences(leftConference.value?.id as number, leftConference.value as Conference, rightConference.value?.id as number, rightConference.value as Conference)
                    .catch(() => {
                        updateConferences(rightConference.value?.id as number, rightConference.value as Conference, leftConference.value?.id as number, leftConference.value as Conference)
                            .catch((secondError) => {
                                snackbarMessage.value = getErrorMessageForErrorKey(secondError.response.data.message);
                                snackbar.value = true;
                            });
                    });
            }
        };

        return {
            returnCurrentLocaleContent,
            snackbar, snackbarMessage,
            leftConference, rightConference,
            moveAll, updateAll, updateLeft,
            updateLeftRef, updateRightRef, updateRight
        };
}})

</script>

<style scoped>

    .middle-arrow {
        margin-left: 25px;
        margin-top: 120px;
    }

</style>
