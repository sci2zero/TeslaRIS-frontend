<template>
    <v-row>
        <v-col cols="12">
            <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                <v-card-text class="edit-pen-container">
                    <funding-call-contribution-update-modal
                        :read-only="readOnly"
                        :preset-funding-call-contributions="getContributorGroupForUpdating()"
                        :lock-contribution-type="getLockedContributionType()"
                        @update="sendToParent"
                    />

                    <div
                        v-if="contributionList?.length === 0"
                        class="mt-5">
                        <b>{{ $t("contributionsLabel") }}</b>
                    </div>
                    <strong v-if="contributionList?.length === 0">{{ $t("notYetSetMessage") }}</strong>
                    <v-tabs
                        v-else
                        v-model="currentTab"
                        color="deep-purple-accent-4"
                        align-tabs="start"
                    >
                        <v-tab value="organizer">
                            {{ getTitleFromValueAutoLocale(FundingCallContributionType.ORGANIZER) }}
                        </v-tab>
                        <v-tab value="coordinator">
                            {{ getTitleFromValueAutoLocale(FundingCallContributionType.COORDINATOR) }}
                        </v-tab>
                        <v-tab value="assessmentBoardPresident">
                            {{ getTitleFromValueAutoLocale(FundingCallContributionType.ASSESSMENT_BOARD_PRESIDENT) }}
                        </v-tab>
                        <v-tab value="assessmentBoardVicepresident">
                            {{ getTitleFromValueAutoLocale(FundingCallContributionType.ASSESSMENT_BOARD_VICEPRESIDENT) }}
                        </v-tab>
                        <v-tab value="assessmentBoardMember">
                            {{ getTitleFromValueAutoLocale(FundingCallContributionType.ASSESSMENT_BOARD_MEMBER) }}
                        </v-tab>
                        <v-tab value="assessmentEvaluator">
                            {{ getTitleFromValueAutoLocale(FundingCallContributionType.ASSESSMENT_EVALUATOR) }}
                        </v-tab>
                        <v-tab value="assessmentSpecialist">
                            {{ getTitleFromValueAutoLocale(FundingCallContributionType.ASSESSMENT_SPECIALIST) }}
                        </v-tab>
                        <v-tab value="assessmentOther">
                            {{ getTitleFromValueAutoLocale(FundingCallContributionType.ASSESSMENT_OTHER) }}
                        </v-tab>
                        <v-tab value="applicant">
                            {{ getTitleFromValueAutoLocale(FundingCallContributionType.APPLICANT) }}
                        </v-tab>
                        <v-tab value="others">
                            {{ getTitleFromValueAutoLocale(FundingCallContributionType.OTHER_CONTRIBUTORS) }}
                        </v-tab>
                    </v-tabs>

                    <v-window v-model="currentTab">
                        <v-window-item value="organizer">
                            <person-funding-call-contribution-list
                                :contribution-list="organizerList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="coordinator">
                            <person-funding-call-contribution-list
                                :contribution-list="coordinatorList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="assessmentBoardPresident">
                            <person-funding-call-contribution-list
                                :contribution-list="assessmentBoardPresidentList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="assessmentBoardVicepresident">
                            <person-funding-call-contribution-list
                                :contribution-list="assessmentBoardVicepresidentList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="assessmentBoardMember">
                            <person-funding-call-contribution-list
                                :contribution-list="assessmentBoardMemberList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="assessmentEvaluator">
                            <person-funding-call-contribution-list
                                :contribution-list="assessmentEvaluatorList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="assessmentSpecialist">
                            <person-funding-call-contribution-list
                                :contribution-list="assessmentSpecialistList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="assessmentOther">
                            <person-funding-call-contribution-list
                                :contribution-list="assessmentOtherList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="applicant">
                            <person-funding-call-contribution-list
                                :contribution-list="applicantList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="others">
                            <person-funding-call-contribution-list
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

<script setup lang="ts">
import { onMounted, ref, watch, type PropType } from 'vue';
import { FundingCallContributionType, type PersonFundingCallContribution } from '@/models/FundingCallModel';
import { getTitleFromValueAutoLocale } from '@/i18n/fundingCallContributionType';
import FundingCallContributionUpdateModal from "@/components/project/FundingCallContributionUpdateModal.vue"
import PersonFundingCallContributionList from './PersonFundingCallContributionList.vue';

const props = defineProps({
    contributionList: {
        type: Array as PropType<PersonFundingCallContribution[]>,
        required: true
    },
    readOnly: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(["update"]);

const currentTab = ref("organizer");

const localContributions = ref<PersonFundingCallContribution[]>([]);

const organizerList = ref<PersonFundingCallContribution[]>([]);
const coordinatorList = ref<PersonFundingCallContribution[]>([]);
const assessmentBoardPresidentList = ref<PersonFundingCallContribution[]>([]);
const assessmentBoardVicepresidentList = ref<PersonFundingCallContribution[]>([]);
const assessmentBoardMemberList = ref<PersonFundingCallContribution[]>([]);
const assessmentEvaluatorList = ref<PersonFundingCallContribution[]>([]);
const assessmentSpecialistList = ref<PersonFundingCallContribution[]>([]);
const assessmentOtherList = ref<PersonFundingCallContribution[]>([]);
const applicantList = ref<PersonFundingCallContribution[]>([]);
const otherList = ref<PersonFundingCallContribution[]>([]);

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
            (contribution) => contribution.contributionType.toString() == FundingCallContributionType[FundingCallContributionType.ORGANIZER]
        );
    coordinatorList.value =
        localContributions.value.filter(
            (contribution) => contribution.contributionType.toString() == FundingCallContributionType[FundingCallContributionType.COORDINATOR]
        );
    assessmentBoardPresidentList.value =
        localContributions.value.filter(
            (contribution) => contribution.contributionType.toString() == FundingCallContributionType[FundingCallContributionType.ASSESSMENT_BOARD_PRESIDENT]
        );
    assessmentBoardVicepresidentList.value =
        localContributions.value.filter(
            (contribution) => contribution.contributionType.toString() == FundingCallContributionType[FundingCallContributionType.ASSESSMENT_BOARD_VICEPRESIDENT]
        );
    assessmentBoardMemberList.value =
        localContributions.value.filter(
            (contribution) => contribution.contributionType.toString() == FundingCallContributionType[FundingCallContributionType.ASSESSMENT_BOARD_MEMBER]
        );
    assessmentEvaluatorList.value =
        localContributions.value.filter(
            (contribution) => contribution.contributionType.toString() == FundingCallContributionType[FundingCallContributionType.ASSESSMENT_EVALUATOR]
        );
    assessmentSpecialistList.value =
        localContributions.value.filter(
            (contribution) => contribution.contributionType.toString() == FundingCallContributionType[FundingCallContributionType.ASSESSMENT_SPECIALIST]
        );
    assessmentOtherList.value =
        localContributions.value.filter(
            (contribution) => contribution.contributionType.toString() == FundingCallContributionType[FundingCallContributionType.ASSESSMENT_OTHER]
        );
    applicantList.value =
        localContributions.value.filter(
            (contribution) => contribution.contributionType.toString() == FundingCallContributionType[FundingCallContributionType.APPLICANT]
        );
    otherList.value =
        localContributions.value.filter(
            (contribution) => contribution.contributionType.toString() == FundingCallContributionType[FundingCallContributionType.OTHER_CONTRIBUTORS]
        );

    selectFirstNonEmptyTab();
};

const updateOrderInParentList = () => {
    const indexes: number[] = [];
    organizerList.value.forEach(contribution => indexes.push(contribution.id as number));
    coordinatorList.value.forEach(contribution => indexes.push(contribution.id as number));
    assessmentBoardPresidentList.value.forEach(contribution => indexes.push(contribution.id as number));
    assessmentBoardVicepresidentList.value.forEach(contribution => indexes.push(contribution.id as number));
    assessmentBoardMemberList.value.forEach(contribution => indexes.push(contribution.id as number));
    assessmentEvaluatorList.value.forEach(contribution => indexes.push(contribution.id as number));
    assessmentSpecialistList.value.forEach(contribution => indexes.push(contribution.id as number));
    assessmentOtherList.value.forEach(contribution => indexes.push(contribution.id as number));
    applicantList.value.forEach(contribution => indexes.push(contribution.id as number));
    otherList.value.forEach(contribution => indexes.push(contribution.id as number));

    updateContributionPositions(indexes);
    selectFirstNonEmptyTab();
    emit("update", buildAllContributions());
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

const buildAllContributions = (overrideTab?: string, overrideContributions?: any[]) => {
    const contributionLists: Record<string, any[]> = {
        organizer: organizerList.value,
        coordinator: coordinatorList.value,
        assessmentBoardPresident: assessmentBoardPresidentList.value,
        assessmentBoardVicepresident: assessmentBoardVicepresidentList.value,
        assessmentBoardMember: assessmentBoardMemberList.value,
        assessmentEvaluator: assessmentEvaluatorList.value,
        assessmentSpecialist: assessmentSpecialistList.value,
        assessmentOther: assessmentOtherList.value,
        applicant: applicantList.value,
        others: otherList.value
    };

    const tabs = Object.keys(contributionLists);

    if (overrideContributions === undefined) {
        const allContributions: any[] = [];
        tabs.forEach(tab => allContributions.push(...contributionLists[tab]));
        return allContributions;
    }

    if (overrideTab !== undefined && tabs.includes(overrideTab)) {
        const allContributions: any[] = [];
        tabs.forEach(tab => allContributions.push(...(tab === overrideTab ? overrideContributions : contributionLists[tab])));
        return allContributions;
    }

    return overrideContributions;
};

const sendToParent = (contributions: any[]) => {
    emit("update", buildAllContributions(currentTab.value, contributions));
};

const getLockedContributionType = () => {
    switch (currentTab.value) {
        case "organizer":
            return [FundingCallContributionType.ORGANIZER];
        case "coordinator":
            return [FundingCallContributionType.COORDINATOR];
        case "assessmentBoardPresident":
            return [FundingCallContributionType.ASSESSMENT_BOARD_PRESIDENT];
        case "assessmentBoardVicepresident":
            return [FundingCallContributionType.ASSESSMENT_BOARD_VICEPRESIDENT];
        case "assessmentBoardMember":
            return [FundingCallContributionType.ASSESSMENT_BOARD_MEMBER];
        case "assessmentEvaluator":
            return [FundingCallContributionType.ASSESSMENT_EVALUATOR];
        case "assessmentSpecialist":
            return [FundingCallContributionType.ASSESSMENT_SPECIALIST];
        case "assessmentOther":
            return [FundingCallContributionType.ASSESSMENT_OTHER];
        case "applicant":
            return [FundingCallContributionType.APPLICANT];
        case "others":
            return [FundingCallContributionType.OTHER_CONTRIBUTORS];
    }

    return Object.values(FundingCallContributionType) as FundingCallContributionType[];
};

const getContributorGroupForUpdating = () => {
    switch (currentTab.value) {
        case "organizer":
            return organizerList.value;
        case "coordinator":
            return coordinatorList.value;
        case "assessmentBoardPresident":
            return assessmentBoardPresidentList.value;
        case "assessmentBoardVicepresident":
            return assessmentBoardVicepresidentList.value;
        case "assessmentBoardMember":
            return assessmentBoardMemberList.value;
        case "assessmentEvaluator":
            return assessmentEvaluatorList.value;
        case "assessmentSpecialist":
            return assessmentSpecialistList.value;
        case "assessmentOther":
            return assessmentOtherList.value;
        case "applicant":
            return applicantList.value;
        case "others":
            return otherList.value;
    }

    return organizerList.value;
};

const selectFirstNonEmptyTab = () => {
    if (organizerList.value.length > 0) {
        currentTab.value = "organizer";
    } else if (coordinatorList.value.length > 0) {
        currentTab.value = "coordinator";
    } else if (assessmentBoardPresidentList.value.length > 0) {
        currentTab.value = "assessmentBoardPresident";
    } else if (assessmentBoardVicepresidentList.value.length > 0) {
        currentTab.value = "assessmentBoardVicepresident";
    } else if (assessmentBoardMemberList.value.length > 0) {
        currentTab.value = "assessmentBoardMember";
    } else if (assessmentEvaluatorList.value.length > 0) {
        currentTab.value = "assessmentEvaluator";
    } else if (assessmentSpecialistList.value.length > 0) {
        currentTab.value = "assessmentSpecialist";
    } else if (assessmentOtherList.value.length > 0) {
        currentTab.value = "assessmentOther";
    } else if (applicantList.value.length > 0) {
        currentTab.value = "applicant";
    } else if (otherList.value.length > 0) {
        currentTab.value = "others";
    } else {
        currentTab.value = "";
    }
};

</script>
