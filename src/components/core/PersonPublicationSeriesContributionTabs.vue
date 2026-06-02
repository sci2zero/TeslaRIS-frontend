<template>
    <v-row>
        <v-col cols="12">
            <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                <v-card-text class="edit-pen-container">
                    <publication-series-contribution-update-modal
                        :read-only="readOnly"
                        :preset-publication-series-contributions="getContributorGroupForUpdating()"
                        :lock-contribution-type="getLockedContributionType()"
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
                        <v-tab value="editors">
                            {{ $t("editorsLabel") }}
                        </v-tab>
                        <v-tab value="associateEditors">
                            {{ $t("associateEditorsLabel") }}
                        </v-tab>
                        <v-tab value="invitedEditors">
                            {{ $t("invitedEditorsLabel") }}
                        </v-tab>
                        <v-tab value="reviewers">
                            {{ $t("reviewersLabel") }}
                        </v-tab>
                        <v-tab value="adhocReviewers">
                            {{ $t("adHocReviewersLabel") }}
                        </v-tab>
                        <v-tab
                            v-show="showScientificBoardMembers"
                            value="scientificBoardMembers">
                            {{ $t("scientificBoardMembersLabel") }}
                        </v-tab>
                    </v-tabs>
                        
                    <v-window v-model="currentTab">
                        <v-window-item value="editors">
                            <person-publication-series-contribution-list
                                :contribution-list="editorList"
                                :publication-series-id="publicationSeriesId"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="associateEditors">
                            <person-publication-series-contribution-list
                                :contribution-list="associateEditorList"
                                :publication-series-id="publicationSeriesId"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="invitedEditors">
                            <person-publication-series-contribution-list
                                :contribution-list="invitedEditorList"
                                :publication-series-id="publicationSeriesId"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="reviewers">
                            <person-publication-series-contribution-list
                                :contribution-list="reviewerList"
                                :publication-series-id="publicationSeriesId"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="adhocReviewers">
                            <person-publication-series-contribution-list
                                :contribution-list="adhocReviewerList"
                                :publication-series-id="publicationSeriesId"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList"
                            />
                        </v-window-item>
                        <v-window-item value="scientificBoardMembers">
                            <person-publication-series-contribution-list
                                :contribution-list="scientificBoardMemberList"
                                :publication-series-id="publicationSeriesId"
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
import { computed, defineComponent, onMounted, type PropType } from 'vue';
import { PublicationSeriesContributionType, type PersonPublicationSeriesContribution } from '@/models/PublicationSeriesModel';
import { getTitleFromValueAutoLocale } from '@/i18n/publicationSeriesContributionType';
import PublicationSeriesContributionUpdateModal from "@/components/publicationSeries/update/PublicationSeriesContributionUpdateModal.vue"
import { ref } from 'vue';
import { watch } from 'vue';
import PersonPublicationSeriesContributionList from './PersonPublicationSeriesContributionList.vue';
import { ArticleCollectionSeriesType } from '@/models/JournalModel.js';


export default defineComponent({
    name: "PersonPublicationSeriesContributionTabs",
    components: { PublicationSeriesContributionUpdateModal, PersonPublicationSeriesContributionList },
    props: {
        contributionList: {
            type: Array as PropType<PersonPublicationSeriesContribution[]>,
            required: true
        },
        readOnly: {
            type: Boolean,
            default: false
        },
        publicationSeriesId: {
            type: Object as PropType<number | undefined>,
            required: true
        },
        showsBoardAndReviewers: {
            type: Boolean,
            default: false
        },
        articleCollectionSeriesType: {
            type: Object as PropType<ArticleCollectionSeriesType | undefined>,
            default: undefined
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const currentTab = ref("editors");

        const localContributions = ref<PersonPublicationSeriesContribution[]>([]);

        const editorList = ref<PersonPublicationSeriesContribution[]>([]);
        const associateEditorList = ref<PersonPublicationSeriesContribution[]>([]);
        const invitedEditorList = ref<PersonPublicationSeriesContribution[]>([]);
        const reviewerList = ref<PersonPublicationSeriesContribution[]>([]);
        const adhocReviewerList = ref<PersonPublicationSeriesContribution[]>([]);
        const scientificBoardMemberList = ref<PersonPublicationSeriesContribution[]>([]);

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

            editorList.value =
                localContributions.value.filter(
                    (contribution) => contribution.contributionType.toString() == PublicationSeriesContributionType[PublicationSeriesContributionType.EDITOR]
                );
            associateEditorList.value =
                localContributions.value.filter(
                    (contribution) => contribution.contributionType.toString() == PublicationSeriesContributionType[PublicationSeriesContributionType.ASSOCIATE_EDITOR]
                );
            invitedEditorList.value =
                localContributions.value.filter(
                    (contribution) => contribution.contributionType.toString() == PublicationSeriesContributionType[PublicationSeriesContributionType.INVITED_EDITOR]
                );
            reviewerList.value =
                localContributions.value.filter(
                    (contribution) => contribution.contributionType.toString() == PublicationSeriesContributionType[PublicationSeriesContributionType.REVIEWER]
                );
            adhocReviewerList.value =
                localContributions.value.filter(
                    (contribution) => contribution.contributionType.toString() == PublicationSeriesContributionType[PublicationSeriesContributionType.ADHOC_REVIEWER]
                );
            scientificBoardMemberList.value =
                localContributions.value.filter(
                    (contribution) => contribution.contributionType.toString() == PublicationSeriesContributionType[PublicationSeriesContributionType.SCIENTIFIC_BOARD_MEMBER]
                );
        
            selectFirstNonEmptyTab();
        };

        const updateOrderInParentList = () => {
            const indexes: number[] = [];
            editorList.value.forEach(contribution => indexes.push(contribution.id as number));
            associateEditorList.value.forEach(contribution => indexes.push(contribution.id as number));
            invitedEditorList.value.forEach(contribution => indexes.push(contribution.id as number));
            reviewerList.value.forEach(contribution => indexes.push(contribution.id as number));
            adhocReviewerList.value.forEach(contribution => indexes.push(contribution.id as number));
            scientificBoardMemberList.value.forEach(contribution => indexes.push(contribution.id as number));

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

        const sendToParent = (contributions: any[]) => {
            const contributionLists: Record<string, any[]> = {
                editors: editorList.value,
                associateEditors: associateEditorList.value,
                invitedEditors: invitedEditorList.value,
                reviewers: reviewerList.value,
                adhocReviewers: adhocReviewerList.value,
                scientificBoardMembers: scientificBoardMemberList.value
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
                case "editors":
                    return [PublicationSeriesContributionType.EDITOR];
                case "associateEditors":
                    return [PublicationSeriesContributionType.ASSOCIATE_EDITOR];
                case "invitedEditors":
                    return [PublicationSeriesContributionType.INVITED_EDITOR];
                case "reviewers":
                    return [PublicationSeriesContributionType.REVIEWER];
                case "adhocReviewers":
                    return [PublicationSeriesContributionType.ADHOC_REVIEWER];
                case "scientificBoardMembers":
                    return [PublicationSeriesContributionType.SCIENTIFIC_BOARD_MEMBER];
            }

            return getGlobalAllowedContributionTypesList();
        };

        const getContributorGroupForUpdating = () => {
            switch (currentTab.value) {
                case "editors":
                    return editorList.value;
                case "associatedEditors":
                    return associateEditorList.value;
                case "invitedEditors":
                    return invitedEditorList.value;
                case "reviewers":
                    return reviewerList.value;
                case "adhocReviewers":
                    return adhocReviewerList.value;
                case "scientificBoardMembers":
                    return scientificBoardMemberList.value;
            }

            return editorList.value;
        };

        const selectFirstNonEmptyTab = () => {
            if (editorList.value.length > 0) {
                currentTab.value = "editors";
            } else if (associateEditorList.value.length > 0) {
                currentTab.value = "associateEditors";
            } else if (invitedEditorList.value.length > 0) {
                currentTab.value = "invitedEditors";
            } else if (reviewerList.value.length > 0) {
                currentTab.value = "reviewers";
            } else if (adhocReviewerList.value.length > 0) {
                currentTab.value = "adhocReviewers";
            } else if (scientificBoardMemberList.value.length > 0) {
                currentTab.value = "scientificBoardMembers";
            } else {
                currentTab.value = "";
            }
        };

        const showScientificBoardMembers = computed(() => 
            props.articleCollectionSeriesType === undefined || 
            props.articleCollectionSeriesType === ArticleCollectionSeriesType.JOURNAL || 
            props.articleCollectionSeriesType === ArticleCollectionSeriesType.MAGAZINE
        );

        const getGlobalAllowedContributionTypesList = (): PublicationSeriesContributionType[] => {
            const contributionTypes: PublicationSeriesContributionType[] = [];

            contributionTypes.push(
                PublicationSeriesContributionType.EDITOR,
                PublicationSeriesContributionType.ASSOCIATE_EDITOR,
                PublicationSeriesContributionType.INVITED_EDITOR,
                PublicationSeriesContributionType.REVIEWER,
                PublicationSeriesContributionType.ADHOC_REVIEWER
            );

            if (showScientificBoardMembers.value) {
                contributionTypes.push(PublicationSeriesContributionType.SCIENTIFIC_BOARD_MEMBER);
            }

            return contributionTypes;
        };

        return {
            sendToParent, 
            getTitleFromValueAutoLocale,
            currentTab, editorList,
            associateEditorList, reviewerList,
            scientificBoardMemberList,
            localContributions,
            updateOrderInParentList,
            getLockedContributionType,
            getContributorGroupForUpdating,
            invitedEditorList, adhocReviewerList,
            ArticleCollectionSeriesType,
            showScientificBoardMembers
        };
    },
});
</script>
