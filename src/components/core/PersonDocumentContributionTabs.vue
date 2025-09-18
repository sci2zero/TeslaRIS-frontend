<template>
    <v-row>
        <v-col cols="12">
            <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                <v-card-text class="edit-pen-container">
                    <publication-contribution-update-modal
                        :read-only="readOnly"
                        :preset-document-contributions="getContributorGroupForUpdating()"
                        :board-members-allowed="boardMembersAllowed"
                        :board-member-ids="boardMembersAllowed ? boardMemberList.map(bm => bm.personId).filter(id => !!id) : []"
                        :lock-contribution-type="getLockedContributionType()"
                        :limit-one="limitOneAuthor && currentTab === 'authors'"
                        @update="sendToParent">
                    </publication-contribution-update-modal>

                    <div
                        v-if="contributionList?.length === 0"
                        class="mt-5">
                        <b>{{ showsBoardAndReviewers ? $t("boardAndReviewersLabel") : $t("contributionsLabel") }}</b>
                    </div>
                    <strong v-if="contributionList?.length === 0">{{ $t("notYetSetMessage") }}</strong>
                    <v-tabs
                        v-else
                        v-model="currentTab"
                        color="deep-purple-accent-4"
                        align-tabs="start"
                    >
                        <v-tab value="authors">
                            {{ $t("authorsLabel") }}
                        </v-tab>
                        <v-tab value="editors">
                            {{ $t("editorsLabel") }}
                        </v-tab>
                        <v-tab value="reviewers">
                            {{ $t("reviewersLabel") }}
                        </v-tab>
                        <v-tab value="advisors">
                            {{ $t(limitOneAuthor ? "mentorsLabel" : "advisorsLabel") }}
                        </v-tab>
                        <v-tab v-show="boardMembersAllowed" value="boardMembers">
                            {{ $t("boardMembersLabel") }}
                        </v-tab>
                    </v-tabs>

                    <v-window v-model="currentTab">
                        <v-window-item value="authors">
                            <person-document-contribution-list
                                :document-id="documentId"
                                :contribution-list="authorList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList">
                            </person-document-contribution-list>
                        </v-window-item>
                        <v-window-item value="editors">
                            <person-document-contribution-list
                                :document-id="documentId"
                                :contribution-list="editorList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList">
                            </person-document-contribution-list>
                        </v-window-item>
                        <v-window-item value="reviewers">
                            <person-document-contribution-list
                                :document-id="documentId"
                                :contribution-list="reviewerList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList">
                            </person-document-contribution-list>
                        </v-window-item>
                        <v-window-item value="advisors">
                            <person-document-contribution-list
                                :document-id="documentId"
                                :contribution-list="advisorList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList">
                            </person-document-contribution-list>
                        </v-window-item>
                        <v-window-item value="boardMembers">
                            <person-document-contribution-list
                                :document-id="documentId"
                                :contribution-list="boardMemberList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList">
                            </person-document-contribution-list>
                        </v-window-item>
                    </v-window>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { DocumentContributionType, type PersonDocumentContribution } from '@/models/PublicationModel';
import { defineComponent, onMounted, type PropType } from 'vue';
import PublicationContributionUpdateModal from '@/components/publication/update/PublicationContributionUpdateModal.vue';
import { getTitleFromValueAutoLocale } from '@/i18n/documentContributionType';
import { ref } from 'vue';
import { watch } from 'vue';
import PersonDocumentContributionList from './PersonDocumentContributionList.vue';


export default defineComponent({
    name: "PersonDocumentContributionTabs",
    components: { PublicationContributionUpdateModal, PersonDocumentContributionList },
    props: {
        contributionList: {
            type: Array as PropType<PersonDocumentContribution[]>,
            required: true
        },
        documentId: {
            type: Object as PropType<number | undefined>,
            required: true
        },
        readOnly: {
            type: Boolean,
            default: false
        },
        boardMembersAllowed: {
            type: Boolean,
            default: false
        },
        showsBoardAndReviewers: {
            type: Boolean,
            default: false
        },
        limitOneAuthor: {
            type: Boolean,
            default: false
        }
    },
    emits: ["update", "positionsChanged"],
    setup(props, { emit }) {
        const currentTab = ref("authors");

        const localContributions = ref<PersonDocumentContribution[]>([]);

        const authorList = ref<PersonDocumentContribution[]>([]);
        const editorList = ref<PersonDocumentContribution[]>([]);
        const reviewerList = ref<PersonDocumentContribution[]>([]);
        const advisorList = ref<PersonDocumentContribution[]>([]);
        const boardMemberList = ref<PersonDocumentContribution[]>([]);

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

            authorList.value =
                localContributions.value.filter(
                    (contribution) => contribution.contributionType.toString() == DocumentContributionType[DocumentContributionType.AUTHOR]
                );
            editorList.value =
                localContributions.value.filter(
                    (contribution) => contribution.contributionType.toString() == DocumentContributionType[DocumentContributionType.EDITOR]
                );
            reviewerList.value =
                localContributions.value.filter(
                    (contribution) => contribution.contributionType.toString() == DocumentContributionType[DocumentContributionType.REVIEWER]
                );
            advisorList.value =
                localContributions.value.filter(
                    (contribution) => contribution.contributionType.toString() == DocumentContributionType[DocumentContributionType.ADVISOR]
                );
            boardMemberList.value =
                localContributions.value.filter(
                    (contribution) => contribution.contributionType.toString() == DocumentContributionType[DocumentContributionType.BOARD_MEMBER]
                );

            selectFirstNonEmptyTab();
        };

        const sendToParent = (contributions: any[]) => {
            const contributionLists: Record<string, any[]> = {
                authors: authorList.value,
                editors: editorList.value,
                reviewers: reviewerList.value,
                advisors: advisorList.value,
                boardMembers: boardMemberList.value
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

        const getLockedContributionType = () => {
            switch (currentTab.value) {
                case "authors":
                    return DocumentContributionType.AUTHOR;
                case "editors":
                    return DocumentContributionType.EDITOR;
                case "reviewers":
                    return DocumentContributionType.REVIEWER;
                case "advisors":
                    return DocumentContributionType.ADVISOR;
                case "boardMembers":
                    return DocumentContributionType.BOARD_MEMBER;
            }

            return DocumentContributionType.AUTHOR;
        };

        const updateOrderInParentList = () => {
            const indexes: number[] = [];
            authorList.value.forEach(contribution => indexes.push(contribution.id as number));
            editorList.value.forEach(contribution => indexes.push(contribution.id as number));
            reviewerList.value.forEach(contribution => indexes.push(contribution.id as number));
            advisorList.value.forEach(contribution => indexes.push(contribution.id as number));
            boardMemberList.value.forEach(contribution => indexes.push(contribution.id as number));

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
            if (authorList.value.length > 0) {
                currentTab.value = "authors";
            } else if (editorList.value.length > 0) {
                currentTab.value = "editors";
            } else if (reviewerList.value.length > 0) {
                currentTab.value = "reviewers";
            } else if (advisorList.value.length > 0) {
                currentTab.value = "advisors";
            } else if (boardMemberList.value.length > 0) {
                currentTab.value = "boardMembers";
            } else {
                currentTab.value = "";
            }
        };

        const getContributorGroupForUpdating = () => {
            switch (currentTab.value) {
                case "authors":
                    return authorList.value;
                case "editors":
                    return editorList.value;
                case "reviewers":
                    return reviewerList.value;
                case "advisors":
                    return advisorList.value;
                case "boardMembers":
                    return boardMemberList.value;
            }

            return boardMemberList.value;
        };

        return {
            sendToParent, getTitleFromValueAutoLocale,
            currentTab, authorList, editorList,
            reviewerList, advisorList, boardMemberList,
            updateOrderInParentList, localContributions,
            getContributorGroupForUpdating,
            getLockedContributionType
        };
    },
});
</script>
