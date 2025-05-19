<template>
    <v-row>
        <v-col cols="12">
            <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                <v-card-text class="edit-pen-container">
                    <publication-contribution-update-modal
                        :read-only="readOnly"
                        :preset-document-contributions="localContributions"
                        :board-members-allowed="boardMembersAllowed"
                        @update="sendToParent">
                    </publication-contribution-update-modal>

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
                        <v-tab v-if="authorList.length > 0" value="authors">
                            {{ $t("authorsLabel") }}
                        </v-tab>
                        <v-tab v-if="editorList.length > 0" value="editors">
                            {{ $t("editorsLabel") }}
                        </v-tab>
                        <v-tab v-if="reviewerList.length > 0" value="reviewers">
                            {{ $t("reviewersLabel") }}
                        </v-tab>
                        <v-tab v-if="advisorList.length > 0" value="advisors">
                            {{ $t("advisorsLabel") }}
                        </v-tab>
                        <v-tab v-if="boardMemberList.length > 0" value="boardMembers">
                            {{ $t("boardMembersLabel") }}
                        </v-tab>
                    </v-tabs>

                    <v-window v-model="currentTab">
                        <v-window-item value="authors">
                            <person-document-contribution-list
                                :document-id="documentId"
                                :contribution-list="authorList"
                                @positions-changed="updateOrderInParentList"
                                :can-reorder="!readOnly">
                            </person-document-contribution-list>
                        </v-window-item>
                        <v-window-item value="editors">
                            <person-document-contribution-list
                                :document-id="documentId"
                                :contribution-list="editorList"
                                @positions-changed="updateOrderInParentList"
                                :can-reorder="!readOnly">
                            </person-document-contribution-list>
                        </v-window-item>
                        <v-window-item value="reviewers">
                            <person-document-contribution-list
                                :document-id="documentId"
                                :contribution-list="reviewerList"
                                @positions-changed="updateOrderInParentList"
                                :can-reorder="!readOnly">
                            </person-document-contribution-list>
                        </v-window-item>
                        <v-window-item value="advisors">
                            <person-document-contribution-list
                                :document-id="documentId"
                                :contribution-list="advisorList"
                                @positions-changed="updateOrderInParentList"
                                :can-reorder="!readOnly">
                            </person-document-contribution-list>
                        </v-window-item>
                        <v-window-item value="boardMembers">
                            <person-document-contribution-list
                                :document-id="documentId"
                                :contribution-list="boardMemberList"
                                @positions-changed="updateOrderInParentList"
                                :can-reorder="!readOnly">
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
import { defineComponent, type PropType } from 'vue';
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

        watch(() => props.contributionList, () => {
            localContributions.value = props.contributionList;

            authorList.value = localContributions.value.filter((contribution) => contribution.contributionType.toString() == DocumentContributionType[DocumentContributionType.AUTHOR]);
            editorList.value = localContributions.value.filter((contribution) => contribution.contributionType.toString() == DocumentContributionType[DocumentContributionType.EDITOR]);
            reviewerList.value = localContributions.value.filter((contribution) => contribution.contributionType.toString() == DocumentContributionType[DocumentContributionType.REVIEWER]);
            advisorList.value = localContributions.value.filter((contribution) => contribution.contributionType.toString() == DocumentContributionType[DocumentContributionType.ADVISOR]);
            boardMemberList.value = localContributions.value.filter((contribution) => contribution.contributionType.toString() == DocumentContributionType[DocumentContributionType.BOARD_MEMBER]);
        });

        const sendToParent = (contributions: any[]) => {
            emit("update", contributions);
        };

        const updateOrderInParentList = () => {
            const indexes: number[] = [];
            authorList.value.forEach(contribution => indexes.push(contribution.id as number));
            editorList.value.forEach(contribution => indexes.push(contribution.id as number));
            reviewerList.value.forEach(contribution => indexes.push(contribution.id as number));
            advisorList.value.forEach(contribution => indexes.push(contribution.id as number));
            boardMemberList.value.forEach(contribution => indexes.push(contribution.id as number));

            updateContributionPositions(indexes);
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

        return {
            sendToParent, getTitleFromValueAutoLocale,
            currentTab, authorList, editorList,
            reviewerList, advisorList, boardMemberList,
            updateOrderInParentList, localContributions
        };
    },
});
</script>
