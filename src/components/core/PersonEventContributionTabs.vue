<template>
    <v-row class="mt-1">
        <v-col cols="12">
            <v-card class="pt-10 pb-3" variant="flat" color="grey-lighten-5">
                <v-card-text class="edit-pen-container">
                    <event-contribution-update-modal
                        :read-only="readOnly"
                        :preset-event-contributions="getContributorGroupForUpdating()"
                        :lock-contribution-type="getLockedContributionType()"
                        @update="sendToParent"
                    />

                    <div
                        v-if="contributionList?.length === 0"
                        class="mt-5">
                        <b>{{ $t("participationsLabel") }}</b>
                    </div>
                    <strong v-if="contributionList?.length === 0">{{ $t("notYetSetMessage") }}</strong>
                    <v-tabs
                        v-else
                        v-model="currentTab"
                        color="deep-purple-accent-4"
                        align-tabs="start"
                    >
                        <v-tab value="organizers">
                            {{ $t("organizersLabel") }}
                        </v-tab>
                        <v-tab value="orgBoardChair">
                            {{ $t("orgBoardChairLabel") }}
                        </v-tab>
                        <v-tab value="orgBoardMembers">
                            {{ $t("orgBoardMembersLabel") }}
                        </v-tab>
                        <v-tab value="reviewers">
                            {{ $t("reviewersLabel") }}
                        </v-tab>
                        <v-tab value="progBoardMembers">
                            {{ $t("progBoardMembersLabel") }}
                        </v-tab>
                        <v-tab value="speakers">
                            {{ $t("speakersLabel") }}
                        </v-tab>
                        <v-tab value="invitedSpeakers">
                            {{ $t("invitedSpeakersLabel") }}
                        </v-tab>
                        <v-tab value="keynoteSpeakers">
                            {{ $t("keynoteSpeakersLabel") }}
                        </v-tab>
                        <v-tab value="panelists">
                            {{ $t("panelistsLabel") }}
                        </v-tab>
                        <v-tab value="chair">
                            {{ $t("chairLabel") }}
                        </v-tab>
                        <v-tab value="audience">
                            {{ $t("audienceLabel") }}
                        </v-tab>
                        <v-tab value="demonstrators">
                            {{ $t("demonstratorsLabel") }}
                        </v-tab>
                        <v-tab value="performers">
                            {{ $t("performersLabel") }}
                        </v-tab>
                        <v-tab value="producers">
                            {{ $t("producersLabel") }}
                        </v-tab>
                        <v-tab value="instructors">
                            {{ $t("instructorsLabel") }}
                        </v-tab>
                        <v-tab value="teachers">
                            {{ $t("teachersLabel") }}
                        </v-tab>
                        <v-tab value="examiners">
                            {{ $t("examinersLabel") }}
                        </v-tab>
                        <v-tab v-show="event && (event as OtherEvent).type !== undefined && (event as OtherEvent).type === OtherEventType.TRIAL" value="witnesses">
                            {{ $t("witnessesLabel") }}
                        </v-tab>
                        <v-tab value="arguers">
                            {{ $t("arguersLabel") }}
                        </v-tab>
                        <v-tab value="others">
                            {{ $t("othersLabel") }}
                        </v-tab>
                    </v-tabs>
                        
                    <v-window v-model="currentTab">
                        <v-window-item value="organizers">
                            <person-event-contribution-list
                                :event-id="eventId"
                                :contribution-list="organizerList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="orgBoardChair">
                            <person-event-contribution-list
                                :event-id="eventId"
                                :contribution-list="orgBoardChairList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="orgBoardMembers">
                            <person-event-contribution-list
                                :event-id="eventId"
                                :contribution-list="orgBoardMemberList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="reviewers">
                            <person-event-contribution-list
                                :event-id="eventId"
                                :contribution-list="reviewerList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="progBoardMembers">
                            <person-event-contribution-list
                                :event-id="eventId"
                                :contribution-list="progBoardMemberList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="speakers">
                            <person-event-contribution-list
                                :event-id="eventId"
                                :contribution-list="speakerList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="invitedSpeakers">
                            <person-event-contribution-list
                                :event-id="eventId"
                                :contribution-list="invitedSpeakerList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="keynoteSpeakers">
                            <person-event-contribution-list
                                :event-id="eventId"
                                :contribution-list="keynoteSpeakerList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="panelists">
                            <person-event-contribution-list
                                :event-id="eventId"
                                :contribution-list="panelistList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="chair">
                            <person-event-contribution-list
                                :event-id="eventId"
                                :contribution-list="chairList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="audience">
                            <person-event-contribution-list
                                :event-id="eventId"
                                :contribution-list="audienceList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="demonstrators">
                            <person-event-contribution-list
                                :event-id="eventId"
                                :contribution-list="demonstratorList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="performers">
                            <person-event-contribution-list
                                :event-id="eventId"
                                :contribution-list="performerList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="producers">
                            <person-event-contribution-list
                                :event-id="eventId"
                                :contribution-list="producerList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="instructors">
                            <person-event-contribution-list
                                :event-id="eventId"
                                :contribution-list="instructorList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="teachers">
                            <person-event-contribution-list
                                :event-id="eventId"
                                :contribution-list="teacherList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="examiners">
                            <person-event-contribution-list
                                :event-id="eventId"
                                :contribution-list="examinerList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="witnesses">
                            <person-event-contribution-list
                                :event-id="eventId"
                                :contribution-list="witnessList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="arguers">
                            <person-event-contribution-list
                                :event-id="eventId"
                                :contribution-list="arguerList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="others">
                            <person-event-contribution-list
                                :event-id="eventId"
                                :contribution-list="otherList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                    </v-window>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent, onMounted, type PropType } from 'vue';
import EventContributionUpdateModal from '../event/update/EventContributionUpdateModal.vue';
import { type Conference, type Course, EventContributionType, OtherEventType, type Event, type OtherEvent, type PersonEventContribution, type Exhibition } from '@/models/EventModel';
import { getTitleFromValueAutoLocale } from '@/i18n/eventContributionType';
import { ref } from 'vue';
import { watch } from 'vue';
import PersonEventContributionList from './PersonEventContributionList.vue';


export default defineComponent({
    name: "PersonEventContributionTabs",
    components: { EventContributionUpdateModal, PersonEventContributionList },
    props: {
        contributionList: {
            type: Array as PropType<PersonEventContribution[]>,
            required: true
        },
        eventId: {
            type: Object as PropType<number | undefined>,
            required: true
        },
        readOnly: {
            type: Boolean,
            default: false
        },
        event: {
            type: Object as PropType<Event | OtherEvent | Course | Conference | Exhibition | undefined>,
            required: true
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const currentTab = ref("progBoardMembers");

        const localContributions = ref<PersonEventContribution[]>([]);

        const organizerList = ref<PersonEventContribution[]>([]);
        const orgBoardChairList = ref<PersonEventContribution[]>([]);
        const orgBoardMemberList = ref<PersonEventContribution[]>([]);
        const reviewerList = ref<PersonEventContribution[]>([]);
        const progBoardMemberList = ref<PersonEventContribution[]>([]);
        const speakerList = ref<PersonEventContribution[]>([]);
        const invitedSpeakerList = ref<PersonEventContribution[]>([]);
        const keynoteSpeakerList = ref<PersonEventContribution[]>([]);
        const panelistList = ref<PersonEventContribution[]>([]);
        const chairList = ref<PersonEventContribution[]>([]);
        const audienceList = ref<PersonEventContribution[]>([]);
        const demonstratorList = ref<PersonEventContribution[]>([]);
        const performerList = ref<PersonEventContribution[]>([]);
        const producerList = ref<PersonEventContribution[]>([]);
        const instructorList = ref<PersonEventContribution[]>([]);
        const teacherList = ref<PersonEventContribution[]>([]);
        const examinerList = ref<PersonEventContribution[]>([]);
        const witnessList = ref<PersonEventContribution[]>([]);
        const arguerList = ref<PersonEventContribution[]>([]);
        const otherList = ref<PersonEventContribution[]>([]);

        onMounted(() => {
            if (props.contributionList) {
                populateLists();
            }
        });

        watch(() => props.contributionList, () => {
            if (props.contributionList) {
                populateLists();
            }
        });

        const populateLists = () => {
            localContributions.value = props.contributionList;

            organizerList.value =
                localContributions.value.filter(
                    (contribution) => contribution.eventContributionType.toString() == EventContributionType[EventContributionType.ORGANIZER]
                );
            orgBoardChairList.value =
                localContributions.value.filter(
                    (contribution) => contribution.eventContributionType.toString() == EventContributionType[EventContributionType.ORGANIZATION_BOARD_CHAIR]
                );
            orgBoardMemberList.value =
                localContributions.value.filter(
                    (contribution) => contribution.eventContributionType.toString() == EventContributionType[EventContributionType.ORGANIZATION_BOARD_MEMBER]
                );
            reviewerList.value =
                localContributions.value.filter(
                    (contribution) => contribution.eventContributionType.toString() == EventContributionType[EventContributionType.REVIEWER]
                );
            progBoardMemberList.value =
                localContributions.value.filter(
                    (contribution) => contribution.eventContributionType.toString() == EventContributionType[EventContributionType.PROGRAMME_BOARD_MEMBER]
                );
            speakerList.value =
                localContributions.value.filter(
                    (contribution) => contribution.eventContributionType.toString() == EventContributionType[EventContributionType.SPEAKER]
                );
            invitedSpeakerList.value =
                localContributions.value.filter(
                    (contribution) => contribution.eventContributionType.toString() == EventContributionType[EventContributionType.INVITED_SPEAKER]
                );
            keynoteSpeakerList.value =
                localContributions.value.filter(
                    (contribution) => contribution.eventContributionType.toString() == EventContributionType[EventContributionType.KEYNOTE_SPEAKER]
                );
            panelistList.value =
                localContributions.value.filter(
                    (contribution) => contribution.eventContributionType.toString() == EventContributionType[EventContributionType.PANELISTS]
                );
            chairList.value =
                localContributions.value.filter(
                    (contribution) => contribution.eventContributionType.toString() == EventContributionType[EventContributionType.CHAIR]
                );
            audienceList.value =
                localContributions.value.filter(
                    (contribution) => contribution.eventContributionType.toString() == EventContributionType[EventContributionType.AUDIENCE]
                );
            demonstratorList.value =
                localContributions.value.filter(
                    (contribution) => contribution.eventContributionType.toString() == EventContributionType[EventContributionType.DEMONSTRATOR]
                );
            performerList.value =
                localContributions.value.filter(
                    (contribution) => contribution.eventContributionType.toString() == EventContributionType[EventContributionType.PERFORMER]
                );
            producerList.value =
                localContributions.value.filter(
                    (contribution) => contribution.eventContributionType.toString() == EventContributionType[EventContributionType.PRODUCER]
                );
            instructorList.value =
                localContributions.value.filter(
                    (contribution) => contribution.eventContributionType.toString() == EventContributionType[EventContributionType.INSTRUCTOR]
                );
            teacherList.value =
                localContributions.value.filter(
                    (contribution) => contribution.eventContributionType.toString() == EventContributionType[EventContributionType.TEACHER]
                );
            examinerList.value =
                localContributions.value.filter(
                    (contribution) => contribution.eventContributionType.toString() == EventContributionType[EventContributionType.EXAMINER]
                );
            witnessList.value =
                localContributions.value.filter(
                    (contribution) => contribution.eventContributionType.toString() == EventContributionType[EventContributionType.WITNESS]
                );
            arguerList.value =
                localContributions.value.filter(
                    (contribution) => contribution.eventContributionType.toString() == EventContributionType[EventContributionType.ARGUER]
                );
            otherList.value =
                localContributions.value.filter(
                    (contribution) => contribution.eventContributionType.toString() == EventContributionType[EventContributionType.OTHER]
                );

            selectFirstNonEmptyTab();
        };
        
        const sendToParent = (contributions: any[]) => {
            const contributionLists: Record<string, any[]> = {
                organizers: organizerList.value,
                orgBoardChair: orgBoardChairList.value,
                orgBoardMembers: orgBoardMemberList.value,
                reviewers: reviewerList.value,
                progBoardMembers: progBoardMemberList.value,
                speakers: speakerList.value,
                invitedSpeakers: invitedSpeakerList.value,
                keynoteSpeakers: keynoteSpeakerList.value,
                panelists: panelistList.value,
                chair: chairList.value,
                audience: audienceList.value,
                demonstrators: demonstratorList.value,
                performers: performerList.value,
                producers: producerList.value,
                instructors: instructorList.value,
                teachers: teacherList.value,
                examiners: examinerList.value,
                witnesses: witnessList.value,
                arguers: arguerList.value,
                others: otherList.value
            };

            const tabs = Object.keys(contributionLists);
            const allContributions: any[] = [];

            if (tabs.includes(currentTab.value)) {
                for (const tab of tabs) {
                    if (tab === currentTab.value) {
                        allContributions.push(...contributions);
                    } else {
                        allContributions.push(...(contributionLists[tab] || []));
                    }
                }
            } else {
                allContributions.push(...contributions);
            }

            emit("update", allContributions);
        };

        const updateOrderInParentList = () => {
            const indexes: number[] = [];
            organizerList.value.forEach(contribution => indexes.push(contribution.id as number));
            orgBoardChairList.value.forEach(contribution => indexes.push(contribution.id as number));
            reviewerList.value.forEach(contribution => indexes.push(contribution.id as number));
            progBoardMemberList.value.forEach(contribution => indexes.push(contribution.id as number));
            speakerList.value.forEach(contribution => indexes.push(contribution.id as number));
            invitedSpeakerList.value.forEach(contribution => indexes.push(contribution.id as number));
            keynoteSpeakerList.value.forEach(contribution => indexes.push(contribution.id as number));
            panelistList.value.forEach(contribution => indexes.push(contribution.id as number));
            chairList.value.forEach(contribution => indexes.push(contribution.id as number));
            audienceList.value.forEach(contribution => indexes.push(contribution.id as number));
            demonstratorList.value.forEach(contribution => indexes.push(contribution.id as number));
            performerList.value.forEach(contribution => indexes.push(contribution.id as number));
            producerList.value.forEach(contribution => indexes.push(contribution.id as number));
            instructorList.value.forEach(contribution => indexes.push(contribution.id as number));
            teacherList.value.forEach(contribution => indexes.push(contribution.id as number));
            examinerList.value.forEach(contribution => indexes.push(contribution.id as number));
            witnessList.value.forEach(contribution => indexes.push(contribution.id as number));
            arguerList.value.forEach(contribution => indexes.push(contribution.id as number));
            otherList.value.forEach(contribution => indexes.push(contribution.id as number));

            updateContributionPositions(indexes);
            selectFirstNonEmptyTab();
        };

        const updateContributionPositions = (indexes: number[]) => {
            if (!localContributions.value) return;

            const contributionMap = new Map<number, any>(
                localContributions.value.map(contribution => [contribution.id as number, contribution])
            );

            localContributions.value = indexes
                .map(id => contributionMap.get(id))
                .filter((c): c is NonNullable<typeof c> => !!c);
        };

        const selectFirstNonEmptyTab = () => {
            if (organizerList.value.length > 0) {
                currentTab.value = "organizers";
            } else if (orgBoardChairList.value.length > 0) {
                currentTab.value = "orgBoardChair";
            } else if (orgBoardMemberList.value.length > 0) {
                currentTab.value = "orgBoardMembers";
            } else if (reviewerList.value.length > 0) {
                currentTab.value = "reviewers";
            } else if (progBoardMemberList.value.length > 0) {
                currentTab.value = "progBoardMembers";
            } else if (speakerList.value.length > 0) {
                currentTab.value = "speakers";
            } else if (invitedSpeakerList.value.length > 0) {
                currentTab.value = "invitedSpeakers";
            } else if (keynoteSpeakerList.value.length > 0) {
                currentTab.value = "keynoteSpeakers";
            } else if (panelistList.value.length > 0) {
                currentTab.value = "panelists";
            } else if (chairList.value.length > 0) {
                currentTab.value = "chair";
            } else if (audienceList.value.length > 0) {
                currentTab.value = "audience";
            } else if (demonstratorList.value.length > 0) {
                currentTab.value = "demonstrators";
            } else if (performerList.value.length > 0) {
                currentTab.value = "performers";
            } else if (producerList.value.length > 0) {
                currentTab.value = "producers";
            } else if (instructorList.value.length > 0) {
                currentTab.value = "instructors";
            } else if (teacherList.value.length > 0) {
                currentTab.value = "teachers";
            } else if (examinerList.value.length > 0) {
                currentTab.value = "examiners";
            } else if (witnessList.value.length > 0) {
                currentTab.value = "witnesses";
            } else if (arguerList.value.length > 0) {
                currentTab.value = "arguers";
            } else if (otherList.value.length > 0) {
                currentTab.value = "others";
            } else {
                currentTab.value = "";
            }
        };

        const getLockedContributionType = () => {
            switch (currentTab.value) {
                case "organizers":
                    return EventContributionType.ORGANIZER;
                case "orgBoardChair":
                    return EventContributionType.ORGANIZATION_BOARD_CHAIR;
                case "orgBoardMembers":
                    return EventContributionType.ORGANIZATION_BOARD_MEMBER;
                case "reviewers":
                    return EventContributionType.REVIEWER;
                case "progBoardMembers":
                    return EventContributionType.PROGRAMME_BOARD_MEMBER;
                case "speakers":
                    return EventContributionType.SPEAKER;
                case "invitedSpeakers":
                    return EventContributionType.INVITED_SPEAKER;
                case "keynoteSpeakers":
                    return EventContributionType.KEYNOTE_SPEAKER;
                case "panelists":
                    return EventContributionType.PANELISTS;
                case "chair":
                    return EventContributionType.CHAIR;
                case "audience":
                    return EventContributionType.AUDIENCE;
                case "demonstrators":
                    return EventContributionType.DEMONSTRATOR;
                case "performers":
                    return EventContributionType.PERFORMER;
                case "producers":
                    return EventContributionType.PRODUCER;
                case "instructors":
                    return EventContributionType.INSTRUCTOR;
                case "teachers":
                    return EventContributionType.TEACHER;
                case "examiners":
                    return EventContributionType.EXAMINER;
                case "witnesses":
                    return EventContributionType.WITNESS;
                case "arguers":
                    return EventContributionType.ARGUER;
                case "others":
                    return EventContributionType.OTHER;
            }
            
            return undefined;
        };

        const getContributorGroupForUpdating = () => {
            switch (currentTab.value) {
                case "organizers":
                    return organizerList.value;
                case "orgBoardChair":
                    return orgBoardChairList.value;
                case "orgBoardMembers":
                    return orgBoardMemberList.value;
                case "reviewers":
                    return reviewerList.value;
                case "progBoardMembers":
                    return progBoardMemberList.value;
                case "speakers":
                    return speakerList.value;
                case "invitedSpeakers":
                    return invitedSpeakerList.value;
                case "keynoteSpeakers":
                    return keynoteSpeakerList.value;
                case "panelists":
                    return panelistList.value;
                case "chair":
                    return chairList.value;
                case "audience":
                    return audienceList.value;
                case "demonstrators":
                    return demonstratorList.value;
                case "performers":
                    return performerList.value;
                case "producers":
                    return producerList.value;
                case "instructors":
                    return instructorList.value;
                case "teachers":
                    return teacherList.value;
                case "examiners":
                    return examinerList.value;
                case "witnesses":
                    return witnessList.value;
                case "arguers":
                    return arguerList.value;
                case "others":
                    return otherList.value;
            }

            return organizerList.value;
        };

        return {
            sendToParent, updateOrderInParentList,
            getTitleFromValueAutoLocale, currentTab,
            orgBoardChairList, reviewerList,
            orgBoardMemberList, progBoardMemberList,
            speakerList, panelistList, chairList,
            audienceList, demonstratorList,
            localContributions, organizerList,
            getLockedContributionType,
            getContributorGroupForUpdating,
            invitedSpeakerList, keynoteSpeakerList,
            performerList, producerList, instructorList,
            teacherList, examinerList, witnessList,
            arguerList, otherList, OtherEventType
        };
    },
});
</script>
