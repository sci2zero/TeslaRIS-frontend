<template>
    <v-row>
        <v-col cols="12">
            <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                <v-card-text class="edit-pen-container">
                    <publication-contribution-update-modal :read-only="readOnly" :preset-document-contributions="contributionList" :board-members-allowed="boardMembersAllowed" @update="sendToParent"></publication-contribution-update-modal>

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
                            <person-document-contribution-list :document-id="documentId" :contribution-list="authorList"></person-document-contribution-list>
                        </v-window-item>
                        <v-window-item value="editors">
                            <person-document-contribution-list :document-id="documentId" :contribution-list="editorList"></person-document-contribution-list>
                        </v-window-item>
                        <v-window-item value="reviewers">
                            <person-document-contribution-list :document-id="documentId" :contribution-list="reviewerList"></person-document-contribution-list>
                        </v-window-item>
                        <v-window-item value="advisors">
                            <person-document-contribution-list :document-id="documentId" :contribution-list="advisorList"></person-document-contribution-list>
                        </v-window-item>
                        <v-window-item value="boardMembers">
                            <person-document-contribution-list :document-id="documentId" :contribution-list="boardMemberList"></person-document-contribution-list>
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
    emits: ["update"],
    setup(props, { emit }) {
        const currentTab = ref("authors");

        const authorList = ref<PersonDocumentContribution[]>([]);
        const editorList = ref<PersonDocumentContribution[]>([]);
        const reviewerList = ref<PersonDocumentContribution[]>([]);
        const advisorList = ref<PersonDocumentContribution[]>([]);
        const boardMemberList = ref<PersonDocumentContribution[]>([]);

        watch(() => props.contributionList, () => {
            authorList.value = props.contributionList.filter((contribution) => contribution.contributionType.toString() == DocumentContributionType[DocumentContributionType.AUTHOR]);
            editorList.value = props.contributionList.filter((contribution) => contribution.contributionType.toString() == DocumentContributionType[DocumentContributionType.EDITOR]);
            reviewerList.value = props.contributionList.filter((contribution) => contribution.contributionType.toString() == DocumentContributionType[DocumentContributionType.REVIEWER]);
            advisorList.value = props.contributionList.filter((contribution) => contribution.contributionType.toString() == DocumentContributionType[DocumentContributionType.ADVISOR]);
            boardMemberList.value = props.contributionList.filter((contribution) => contribution.contributionType.toString() == DocumentContributionType[DocumentContributionType.BOARD_MEMBER]);
        });

        const sendToParent = (contributions: any[]) => {
            emit("update", contributions);
        };

        return {sendToParent, getTitleFromValueAutoLocale,
                currentTab, authorList, editorList,
                reviewerList, advisorList, boardMemberList};
    },
});
</script>
