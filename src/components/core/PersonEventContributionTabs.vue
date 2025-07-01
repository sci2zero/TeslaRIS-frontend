<template>
    <v-row>
        <v-col cols="12">
            <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                <v-card-text class="edit-pen-container">
                    <event-contribution-update-modal
                        :read-only="readOnly"
                        :preset-event-contributions="localContributions"
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
                        <v-tab v-if="orgBoardChairList.length > 0" value="orgBoardChair">
                            {{ $t("orgBoardChairLabel") }}
                        </v-tab>
                        <v-tab v-if="orgBoardMemberList.length > 0" value="orgBoardMembers">
                            {{ $t("orgBoardMembersLabel") }}
                        </v-tab>
                        <v-tab v-if="reviewerList.length > 0" value="reviewers">
                            {{ $t("reviewersLabel") }}
                        </v-tab>
                        <v-tab v-if="progBoardMemberList.length > 0" value="progBoardMembers">
                            {{ $t("progBoardMembersLabel") }}
                        </v-tab>
                        <v-tab v-if="speakerList.length > 0" value="speakers">
                            {{ $t("speakersLabel") }}
                        </v-tab>
                        <v-tab v-if="panelistList.length > 0" value="panelists">
                            {{ $t("panelistsLabel") }}
                        </v-tab>
                        <v-tab v-if="chairList.length > 0" value="chair">
                            {{ $t("chairLabel") }}
                        </v-tab>
                        <v-tab v-if="audienceList.length > 0" value="audience">
                            {{ $t("audienceLabel") }}
                        </v-tab>
                        <v-tab v-if="demonstratorList.length > 0" value="demonstrators">
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
            emit("update", contributions);
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
            }
        };

        return {
            sendToParent, updateOrderInParentList,
            getTitleFromValueAutoLocale, currentTab,
            orgBoardChairList, reviewerList,
            orgBoardMemberList, progBoardMemberList,
            speakerList, panelistList, chairList,
            audienceList, demonstratorList,
            localContributions
        };
    },
});
</script>
