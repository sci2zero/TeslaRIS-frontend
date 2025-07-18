<template>
    <v-row>
        <v-col cols="12">
            <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                <v-card-text class="edit-pen-container">
                    <event-contribution-update-modal
                        :read-only="readOnly"
                        :preset-event-contributions="getContributorGroupForUpdating()"
                        :lock-contribution-type="getLockedContributionType()"
                        @update="sendToParent">
                    </event-contribution-update-modal>

                    <div v-if="contributionList?.length === 0">
                        <b>{{ $t("contributionsLabel") }}</b>
                    </div>
                    <strong v-if="contributionList?.length === 0">{{ $t("notYetSetMessage") }}</strong>
                    <v-tabs
                        v-else
                        v-model="currentTab"
                        color="deep-purple-accent-4"
                        align-tabs="start"
                    >
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
                    </v-tabs>
                        
                    <v-window v-model="currentTab">
                        <v-window-item value="orgBoardChair">
                            <person-event-contribution-list
                                :event-id="eventId"
                                :contribution-list="orgBoardChairList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList">
                            </person-event-contribution-list>
                        </v-window-item>
                        <v-window-item value="orgBoardMembers">
                            <person-event-contribution-list
                                :event-id="eventId"
                                :contribution-list="orgBoardMemberList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList">
                            </person-event-contribution-list>
                        </v-window-item>
                        <v-window-item value="reviewers">
                            <person-event-contribution-list
                                :event-id="eventId"
                                :contribution-list="reviewerList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList">
                            </person-event-contribution-list>
                        </v-window-item>
                        <v-window-item value="progBoardMembers">
                            <person-event-contribution-list
                                :event-id="eventId"
                                :contribution-list="progBoardMemberList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList">
                            </person-event-contribution-list>
                        </v-window-item>
                        <v-window-item value="speakers">
                            <person-event-contribution-list
                                :event-id="eventId"
                                :contribution-list="speakerList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList">
                            </person-event-contribution-list>
                        </v-window-item>
                        <v-window-item value="panelists">
                            <person-event-contribution-list
                                :event-id="eventId"
                                :contribution-list="panelistList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList">
                            </person-event-contribution-list>
                        </v-window-item>
                        <v-window-item value="chair">
                            <person-event-contribution-list
                                :event-id="eventId"
                                :contribution-list="chairList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList">
                            </person-event-contribution-list>
                        </v-window-item>
                        <v-window-item value="audience">
                            <person-event-contribution-list
                                :event-id="eventId"
                                :contribution-list="audienceList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList">
                            </person-event-contribution-list>
                        </v-window-item>
                        <v-window-item value="demonstrators">
                            <person-event-contribution-list
                                :event-id="eventId"
                                :contribution-list="demonstratorList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList">
                            </person-event-contribution-list>
                        </v-window-item>
                    </v-window>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import EventContributionUpdateModal from '../event/update/EventContributionUpdateModal.vue';
import { EventContributionType, type PersonEventContribution } from '@/models/EventModel';
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
    },
    emits: ["update"],
    setup(props, { emit }) {
        const currentTab = ref("progBoardMembers");

        const localContributions = ref<PersonEventContribution[]>([]);

        const orgBoardChairList = ref<PersonEventContribution[]>([]);
        const orgBoardMemberList = ref<PersonEventContribution[]>([]);
        const reviewerList = ref<PersonEventContribution[]>([]);
        const progBoardMemberList = ref<PersonEventContribution[]>([]);
        const speakerList = ref<PersonEventContribution[]>([]);
        const panelistList = ref<PersonEventContribution[]>([]);
        const chairList = ref<PersonEventContribution[]>([]);
        const audienceList = ref<PersonEventContribution[]>([]);
        const demonstratorList = ref<PersonEventContribution[]>([]);

        watch(() => props.contributionList, () => {
            localContributions.value = props.contributionList;

            orgBoardChairList.value = localContributions.value.filter((contribution) => contribution.eventContributionType.toString() == EventContributionType[EventContributionType.ORGANIZATION_BOARD_CHAIR]);
            orgBoardMemberList.value = localContributions.value.filter((contribution) => contribution.eventContributionType.toString() == EventContributionType[EventContributionType.ORGANIZATION_BOARD_MEMBER]);
            reviewerList.value = localContributions.value.filter((contribution) => contribution.eventContributionType.toString() == EventContributionType[EventContributionType.REVIEWER]);
            progBoardMemberList.value = localContributions.value.filter((contribution) => contribution.eventContributionType.toString() == EventContributionType[EventContributionType.PROGRAMME_BOARD_MEMBER]);
            speakerList.value = localContributions.value.filter((contribution) => contribution.eventContributionType.toString() == EventContributionType[EventContributionType.SPEAKER]);
            panelistList.value = localContributions.value.filter((contribution) => contribution.eventContributionType.toString() == EventContributionType[EventContributionType.PANELISTS]);
            chairList.value = localContributions.value.filter((contribution) => contribution.eventContributionType.toString() == EventContributionType[EventContributionType.CHAIR]);
            audienceList.value = localContributions.value.filter((contribution) => contribution.eventContributionType.toString() == EventContributionType[EventContributionType.AUDIENCE]);
            demonstratorList.value = localContributions.value.filter((contribution) => contribution.eventContributionType.toString() == EventContributionType[EventContributionType.DEMONSTRATOR]);

            selectFirstNonEmptyTab();
        });
        
        const sendToParent = (contributions: any[]) => {
            const contributionLists: Record<string, any[]> = {
                orgBoardChair: orgBoardChairList.value,
                orgBoardMembers: orgBoardMemberList.value,
                reviewers: reviewerList.value,
                progBoardMembers: progBoardMemberList.value,
                speakers: speakerList.value,
                panelists: panelistList.value,
                chair: chairList.value,
                audience: audienceList.value,
                demonstrators: demonstratorList.value
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
            orgBoardChairList.value.forEach(contribution => indexes.push(contribution.id as number));
            reviewerList.value.forEach(contribution => indexes.push(contribution.id as number));
            progBoardMemberList.value.forEach(contribution => indexes.push(contribution.id as number));
            speakerList.value.forEach(contribution => indexes.push(contribution.id as number));
            panelistList.value.forEach(contribution => indexes.push(contribution.id as number));
            chairList.value.forEach(contribution => indexes.push(contribution.id as number));
            audienceList.value.forEach(contribution => indexes.push(contribution.id as number));
            demonstratorList.value.forEach(contribution => indexes.push(contribution.id as number));

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
            if (orgBoardChairList.value.length > 0) {
                currentTab.value = "orgBoardChair";
            } else if (orgBoardMemberList.value.length > 0) {
                currentTab.value = "orgBoardMembers";
            } else if (reviewerList.value.length > 0) {
                currentTab.value = "reviewers";
            } else if (progBoardMemberList.value.length > 0) {
                currentTab.value = "progBoardMembers";
            } else if (speakerList.value.length > 0) {
                currentTab.value = "speakers";
            } else if (panelistList.value.length > 0) {
                currentTab.value = "panelists";
            } else if (chairList.value.length > 0) {
                currentTab.value = "chair";
            } else if (audienceList.value.length > 0) {
                currentTab.value = "audience";
            } else if (demonstratorList.value.length > 0) {
                currentTab.value = "demonstrators";
            } else {
                currentTab.value = "";
            }
        };

        const getLockedContributionType = () => {
            switch (currentTab.value) {
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
                case "panelists":
                    return EventContributionType.PANELISTS;
                case "chair":
                    return EventContributionType.CHAIR;
                case "audience":
                    return EventContributionType.AUDIENCE;
                case "demonstrators":
                    return EventContributionType.DEMONSTRATOR;
            }
            
            return undefined;
        };

        const getContributorGroupForUpdating = () => {
            switch (currentTab.value) {
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
                case "panelists":
                    return panelistList.value;
                case "chair":
                    return chairList.value;
                case "audience":
                    return audienceList.value;
                case "demonstrators":
                    return demonstratorList.value;
            }

            return orgBoardChairList.value;
        };

        return {
            sendToParent, updateOrderInParentList,
            getTitleFromValueAutoLocale, currentTab,
            orgBoardChairList, reviewerList,
            orgBoardMemberList, progBoardMemberList,
            speakerList, panelistList, chairList,
            audienceList, demonstratorList,
            localContributions,
            getLockedContributionType,
            getContributorGroupForUpdating
        };
    },
});
</script>
