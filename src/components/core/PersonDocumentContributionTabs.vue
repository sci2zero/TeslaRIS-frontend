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
                        :lock-contribution-type="getLockedContributionTypes()"
                        :limit-one="limitOneAuthor && currentTab === 'authors'"
                        @update="sendToParent"
                    />

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
                        <v-tab v-show="showAuthorsOrStaff()" value="authors">
                            {{ $t("authorsLabel") }}
                        </v-tab>
                        <v-tab v-show="showEditors()" value="editors">
                            {{ $t("editorsLabel") }}
                        </v-tab>
                        <v-tab v-show="showEditors()" value="editors">
                            {{ $t("associatedEditorsLabel") }}
                        </v-tab>
                        <v-tab v-show="showInvitedEditors()" value="editors">
                            {{ $t("invitedEditorsLabel") }}
                        </v-tab>
                        <v-tab v-show="showReviewers()" value="reviewers">
                            {{ $t("reviewersLabel") }}
                        </v-tab>
                        <v-tab v-show="documentType === PublicationType.THESIS" value="advisors">
                            {{ $t(limitOneAuthor ? "mentorsLabel" : "advisorsLabel") }}
                        </v-tab>
                        <v-tab v-show="boardMembersAllowed && documentType === PublicationType.THESIS" value="boardMembers">
                            {{ $t("boardMembersLabel") }}
                        </v-tab>
                        <v-tab v-show="documentType === PublicationType.PERFORMANCE_RELATED_OUTPUT" value="presenters">
                            {{ $t("presentersLabel") }}
                        </v-tab>
                        <v-tab value="translators">
                            {{ $t("translatorsLabel") }}
                        </v-tab>
                        <v-tab v-show="showAuthorsOrStaff()" value="assistantStaff">
                            {{ $t("assistantStaffLabel") }}
                        </v-tab>
                        <v-tab v-show="boardMembersAllowed && documentType === PublicationType.THESIS" value="arguers">
                            {{ $t("arguersLabel") }}
                        </v-tab>
                        <v-tab v-show="showOwners()" value="owners">
                            {{ $t("ownersLabel") }}
                        </v-tab>
                    </v-tabs>

                    <v-window v-model="currentTab">
                        <v-window-item value="authors">
                            <person-document-contribution-list
                                :document-id="documentId"
                                :contribution-list="authorList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="editors">
                            <person-document-contribution-list
                                :document-id="documentId"
                                :contribution-list="editorList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="associatedEditors">
                            <person-document-contribution-list
                                :document-id="documentId"
                                :contribution-list="associatedEditorList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="invitedEditors">
                            <person-document-contribution-list
                                :document-id="documentId"
                                :contribution-list="invitedEditorList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="reviewers">
                            <person-document-contribution-list
                                :document-id="documentId"
                                :contribution-list="reviewerList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="advisors">
                            <person-document-contribution-list
                                :document-id="documentId"
                                :contribution-list="advisorList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="boardMembers">
                            <person-document-contribution-list
                                :document-id="documentId"
                                :contribution-list="boardMemberList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="presenters">
                            <person-document-contribution-list
                                :document-id="documentId"
                                :contribution-list="presenterList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="translators">
                            <person-document-contribution-list
                                :document-id="documentId"
                                :contribution-list="translatorList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="assistantStaff">
                            <person-document-contribution-list
                                :document-id="documentId"
                                :contribution-list="assistantStaffList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="arguers">
                            <person-document-contribution-list
                                :document-id="documentId"
                                :contribution-list="arguerList"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="owners">
                            <person-document-contribution-list
                                :document-id="documentId"
                                :contribution-list="ownerList"
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
import { DocumentContributionType, MonographType, PerformanceRelatedOutputType, PublicationType, type PersonDocumentContribution } from '@/models/PublicationModel';
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
        },
        documentType: {
            type: Object as PropType<PublicationType>,
            required: true
        },
        concreteType: {
            type: String,
            default: ""
        }
    },
    emits: ["update", "positionsChanged"],
    setup(props, { emit }) {
        const currentTab = ref(props.documentType === PublicationType.PROCEEDINGS ? "editors" : "authors");

        const localContributions = ref<PersonDocumentContribution[]>([]);

        const authorList = ref<PersonDocumentContribution[]>([]);
        const editorList = ref<PersonDocumentContribution[]>([]);
        const associatedEditorList = ref<PersonDocumentContribution[]>([]);
        const invitedEditorList = ref<PersonDocumentContribution[]>([]);
        const reviewerList = ref<PersonDocumentContribution[]>([]);
        const advisorList = ref<PersonDocumentContribution[]>([]);
        const boardMemberList = ref<PersonDocumentContribution[]>([]);
        const presenterList = ref<PersonDocumentContribution[]>([]);
        const translatorList = ref<PersonDocumentContribution[]>([]);
        const assistantStaffList = ref<PersonDocumentContribution[]>([]);
        const arguerList = ref<PersonDocumentContribution[]>([]);
        const ownerList = ref<PersonDocumentContribution[]>([]);

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
            associatedEditorList.value =
                localContributions.value.filter(
                    (contribution) => contribution.contributionType.toString() == DocumentContributionType[DocumentContributionType.ASSOCIATED_EDITOR]
                );
            invitedEditorList.value =
                localContributions.value.filter(
                    (contribution) => contribution.contributionType.toString() == DocumentContributionType[DocumentContributionType.INVITED_EDITOR]
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
            presenterList.value =
                localContributions.value.filter(
                    (contribution) => contribution.contributionType.toString() == DocumentContributionType[DocumentContributionType.PRESENTER]
                );
            translatorList.value =
                localContributions.value.filter(
                    (contribution) => contribution.contributionType.toString() == DocumentContributionType[DocumentContributionType.TRANSLATOR]
                );
            assistantStaffList.value =
                localContributions.value.filter(
                    (contribution) => contribution.contributionType.toString() == DocumentContributionType[DocumentContributionType.ASSISTANT_STAFF]
                );
            arguerList.value =
                localContributions.value.filter(
                    (contribution) => contribution.contributionType.toString() == DocumentContributionType[DocumentContributionType.ARGUER]
                );
            ownerList.value =
                localContributions.value.filter(
                    (contribution) => contribution.contributionType.toString() == DocumentContributionType[DocumentContributionType.OWNER]
                );

            selectFirstNonEmptyTab();
        };

        const sendToParent = (contributions: any[]) => {
            const contributionLists: Record<string, any[]> = {
                authors: authorList.value,
                editors: editorList.value,
                associatedEditors: associatedEditorList.value,
                invitedEditors: invitedEditorList.value,
                reviewers: reviewerList.value,
                advisors: advisorList.value,
                boardMembers: boardMemberList.value,
                presenters: presenterList.value,
                translators: translatorList.value,
                assistantStaff: assistantStaffList.value,
                arguers: arguerList.value,
                owners: ownerList.value
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

        const getLockedContributionTypes = () => {
            switch (currentTab.value) {
                case "authors":
                    return [DocumentContributionType.AUTHOR];
                case "editors":
                    return [DocumentContributionType.EDITOR];
                case "associatedEditors":
                    return [DocumentContributionType.ASSOCIATED_EDITOR];
                case "invitedEditors":
                    return [DocumentContributionType.INVITED_EDITOR];
                case "reviewers":
                    return [DocumentContributionType.REVIEWER];
                case "advisors":
                    return [DocumentContributionType.ADVISOR];
                case "boardMembers":
                    return [DocumentContributionType.BOARD_MEMBER];
                case "presenters":
                    return [DocumentContributionType.PRESENTER];
                case "translators":
                    return [DocumentContributionType.TRANSLATOR];
                case "assistantStaff":
                    return [DocumentContributionType.ASSISTANT_STAFF];
                case "arguers":
                    return [DocumentContributionType.ARGUER];
                case "owners":
                    return [DocumentContributionType.OWNER];
            }

            return getGlobalAllowedContributionTypesList();
        };

        const updateOrderInParentList = () => {
            const indexes: number[] = [];
            authorList.value.forEach(contribution => indexes.push(contribution.id as number));
            editorList.value.forEach(contribution => indexes.push(contribution.id as number));
            associatedEditorList.value.forEach(contribution => indexes.push(contribution.id as number));
            invitedEditorList.value.forEach(contribution => indexes.push(contribution.id as number));
            reviewerList.value.forEach(contribution => indexes.push(contribution.id as number));
            advisorList.value.forEach(contribution => indexes.push(contribution.id as number));
            boardMemberList.value.forEach(contribution => indexes.push(contribution.id as number));
            presenterList.value.forEach(contribution => indexes.push(contribution.id as number));
            translatorList.value.forEach(contribution => indexes.push(contribution.id as number));
            assistantStaffList.value.forEach(contribution => indexes.push(contribution.id as number));
            arguerList.value.forEach(contribution => indexes.push(contribution.id as number));
            ownerList.value.forEach(contribution => indexes.push(contribution.id as number));

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
            } else if (associatedEditorList.value.length > 0) {
                currentTab.value = "associatedEditors";
            } else if (invitedEditorList.value.length > 0) {
                currentTab.value = "invitedEditors";
            } else if (reviewerList.value.length > 0) {
                currentTab.value = "reviewers";
            } else if (advisorList.value.length > 0) {
                currentTab.value = "advisors";
            } else if (boardMemberList.value.length > 0) {
                currentTab.value = "boardMembers";
            } else if (presenterList.value.length > 0) {
                currentTab.value = "presenters";
            } else if (translatorList.value.length > 0) {
                currentTab.value = "translators";
            } else if (assistantStaffList.value.length > 0) {
                currentTab.value = "assistantStaff";
            } else if (arguerList.value.length > 0) {
                currentTab.value = "arguers";
            } else if (ownerList.value.length > 0) {
                currentTab.value = "owners";
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
                case "associatedEditors":
                    return associatedEditorList.value;
                case "invitedEditors":
                    return invitedEditorList.value;
                case "reviewers":
                    return reviewerList.value;
                case "advisors":
                    return advisorList.value;
                case "boardMembers":
                    return boardMemberList.value;
                case "presenters":
                    return presenterList.value;
                case "translators":
                    return translatorList.value;
                case "assistantStaff":
                    return assistantStaffList.value;
                case "arguers":
                    return arguerList.value;
                case "owners":
                    return ownerList.value;
            }

            return boardMemberList.value;
        };

        const showAuthorsOrStaff = () => 
            ![
                MonographType.JOURNAL_ISSUE,
                PerformanceRelatedOutputType.LITIGATION,
                PerformanceRelatedOutputType.BROADCAST_INTERVIEW,
                PerformanceRelatedOutputType.TEXT_INTERVIEW,
                PerformanceRelatedOutputType.NON_RESEARCH_PRESENTATION
            ].includes(props.concreteType as MonographType | PerformanceRelatedOutputType);

        const showEditors = () => 
            [
                MonographType.EDITED_BOOK,
                MonographType.JOURNAL_ISSUE,
                MonographType.ENCYCLOPEDIA,
                MonographType.DICTIONARY,
                MonographType.REPORT,
            ].includes(props.concreteType as MonographType);

        const showInvitedEditors = () => 
            [
                MonographType.JOURNAL_ISSUE
            ].includes(props.concreteType as MonographType);

        const showReviewers = () => 
            [
                PublicationType.PROCEEDINGS_PUBLICATION,
                PublicationType.MONOGRAPH_PUBLICATION,
                PublicationType.JOURNAL_PUBLICATION,
                PublicationType.THESIS,
            ].includes(props.documentType);

        const showOwners = () => 
            [
                PublicationType.INTANGIBLE_PRODUCT,
                PublicationType.MATERIAL_PRODUCT,
                PublicationType.GENETIC_MATERIAL
            ].includes(props.documentType);

        const getGlobalAllowedContributionTypesList = (): DocumentContributionType[] => {
            const contributionTypes: DocumentContributionType[] = [];

            if (showAuthorsOrStaff()) {
                contributionTypes.push(DocumentContributionType.AUTHOR, DocumentContributionType.ASSISTANT_STAFF);
            }

            if (showEditors()) {
                contributionTypes.push(DocumentContributionType.EDITOR, DocumentContributionType.ASSOCIATED_EDITOR);
            }

            if (showInvitedEditors()) {
                contributionTypes.push(DocumentContributionType.INVITED_EDITOR);
            }

            if (showReviewers()) {
                contributionTypes.push(DocumentContributionType.REVIEWER);
            }

            if (showOwners()) {
                contributionTypes.push(DocumentContributionType.OWNER);
            }

            if (props.documentType === PublicationType.THESIS) {
                contributionTypes.push(DocumentContributionType.ADVISOR);

                if (props.boardMembersAllowed) {
                    contributionTypes.push(DocumentContributionType.BOARD_MEMBER);
                    contributionTypes.push(DocumentContributionType.ARGUER);
                }
            }

            if (props.documentType === PublicationType.PERFORMANCE_RELATED_OUTPUT) {
                contributionTypes.push(DocumentContributionType.PRESENTER);
            }

            contributionTypes.push(DocumentContributionType.TRANSLATOR);

            return contributionTypes;
        };

        return {
            sendToParent, getTitleFromValueAutoLocale,
            currentTab, authorList, editorList,
            reviewerList, advisorList, boardMemberList,
            updateOrderInParentList, localContributions,
            getContributorGroupForUpdating, presenterList,
            getLockedContributionTypes, translatorList,
            assistantStaffList, arguerList, ownerList,
            PublicationType, showAuthorsOrStaff, showEditors,
            showInvitedEditors, showReviewers, showOwners,
            associatedEditorList, invitedEditorList
        };
    },
});
</script>
