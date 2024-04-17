<template>
    <v-row>
        <v-col cols="12">
            <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                <v-card-text class="edit-pen-container">
                    <event-contribution-update-modal :read-only="readOnly" :preset-event-contributions="contributionList" @update="sendToParent"></event-contribution-update-modal>

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
                            <person-event-contribution-list :contribution-list="orgBoardChairList"></person-event-contribution-list>
                        </v-window-item>
                        <v-window-item value="orgBoardMembers">
                            <person-event-contribution-list :contribution-list="orgBoardMemberList"></person-event-contribution-list>
                        </v-window-item>
                        <v-window-item value="reviewers">
                            <person-event-contribution-list :contribution-list="reviewerList"></person-event-contribution-list>
                        </v-window-item>
                        <v-window-item value="progBoardMembers">
                            <person-event-contribution-list :contribution-list="progBoardMemberList"></person-event-contribution-list>
                        </v-window-item>
                        <v-window-item value="speakers">
                            <person-event-contribution-list :contribution-list="speakerList"></person-event-contribution-list>
                        </v-window-item>
                        <v-window-item value="panelists">
                            <person-event-contribution-list :contribution-list="panelistList"></person-event-contribution-list>
                        </v-window-item>
                        <v-window-item value="chair">
                            <person-event-contribution-list :contribution-list="chairList"></person-event-contribution-list>
                        </v-window-item>
                        <v-window-item value="audience">
                            <person-event-contribution-list :contribution-list="audienceList"></person-event-contribution-list>
                        </v-window-item>
                        <v-window-item value="demonstrators">
                            <person-event-contribution-list :contribution-list="demonstratorList"></person-event-contribution-list>
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
        readOnly: {
            type: Boolean,
            default: false
        },
    },
    emits: ["update"],
    setup(props, { emit }) {
        const currentTab = ref("progBoardMembers");

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
            orgBoardChairList.value = props.contributionList.filter((contribution) => contribution.eventContributionType.toString() == EventContributionType[EventContributionType.ORGANIZATION_BOARD_CHAIR]);
            orgBoardMemberList.value = props.contributionList.filter((contribution) => contribution.eventContributionType.toString() == EventContributionType[EventContributionType.ORGANIZATION_BOARD_MEMBER]);
            reviewerList.value = props.contributionList.filter((contribution) => contribution.eventContributionType.toString() == EventContributionType[EventContributionType.REVIEWER]);
            progBoardMemberList.value = props.contributionList.filter((contribution) => contribution.eventContributionType.toString() == EventContributionType[EventContributionType.PROGRAMME_BOARD_MEMBER]);
            speakerList.value = props.contributionList.filter((contribution) => contribution.eventContributionType.toString() == EventContributionType[EventContributionType.SPEAKER]);
            panelistList.value = props.contributionList.filter((contribution) => contribution.eventContributionType.toString() == EventContributionType[EventContributionType.PANELISTS]);
            chairList.value = props.contributionList.filter((contribution) => contribution.eventContributionType.toString() == EventContributionType[EventContributionType.CHAIR]);
            audienceList.value = props.contributionList.filter((contribution) => contribution.eventContributionType.toString() == EventContributionType[EventContributionType.AUDIENCE]);
            demonstratorList.value = props.contributionList.filter((contribution) => contribution.eventContributionType.toString() == EventContributionType[EventContributionType.DEMONSTRATOR]);
        });
        
        const sendToParent = (contributions: any[]) => {
            emit("update", contributions);
        };

        return {sendToParent,
            getTitleFromValueAutoLocale,
            currentTab, orgBoardChairList, reviewerList,
            orgBoardMemberList, progBoardMemberList,
            speakerList, panelistList, chairList,
            audienceList, demonstratorList };
    },
});
</script>
