<template>
    <v-row>
        <v-col cols="12">
            <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                <v-card-text class="edit-pen-container">
                    <publication-series-contribution-update-modal
                        :read-only="readOnly"
                        :preset-publication-series-contributions="getContributorGroupForUpdating()"
                        :lock-contribution-type="getLockedContributionType()"
                        @update="sendToParent">
                    </publication-series-contribution-update-modal>

                    <div v-if="contributionList?.length === 0">
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
                        <v-tab value="reviewers">
                            {{ $t("reviewersLabel") }}
                        </v-tab>
                        <v-tab value="scientificBoardMembers">
                            {{ $t("scientificBoardMembersLabel") }}
                        </v-tab>
                    </v-tabs>
                        
                    <v-window v-model="currentTab">
                        <v-window-item value="editors">
                            <person-publication-series-contribution-list
                                :contribution-list="editorList"
                                :publication-series-id="publicationSeriesId"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList">
                            </person-publication-series-contribution-list>
                        </v-window-item>
                        <v-window-item value="associateEditors">
                            <person-publication-series-contribution-list
                                :contribution-list="associateEditorList"
                                :publication-series-id="publicationSeriesId"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList">
                            </person-publication-series-contribution-list>
                        </v-window-item>
                        <v-window-item value="reviewers">
                            <person-publication-series-contribution-list
                                :contribution-list="reviewerList"
                                :publication-series-id="publicationSeriesId"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList">
                            </person-publication-series-contribution-list>
                        </v-window-item>
                        <v-window-item value="scientificBoardMembers">
                            <person-publication-series-contribution-list
                                :contribution-list="scientificBoardMemberList"
                                :publication-series-id="publicationSeriesId"
                                :can-reorder="!readOnly"
                                @positions-changed="updateOrderInParentList">
                            </person-publication-series-contribution-list>
                        </v-window-item>
                    </v-window>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { PublicationSeriesContributionType, type PersonPublicationSeriesContribution } from '@/models/PublicationSeriesModel';
import { getTitleFromValueAutoLocale } from '@/i18n/publicationSeriesContributionType';
import PublicationSeriesContributionUpdateModal from "@/components/publicationSeries/update/PublicationSeriesContributionUpdateModal.vue"
import { ref } from 'vue';
import { watch } from 'vue';
import PersonPublicationSeriesContributionList from './PersonPublicationSeriesContributionList.vue';


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
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const currentTab = ref("editors");

        const localContributions = ref<PersonPublicationSeriesContribution[]>([]);

        const editorList = ref<PersonPublicationSeriesContribution[]>([]);
        const associateEditorList = ref<PersonPublicationSeriesContribution[]>([]);
        const reviewerList = ref<PersonPublicationSeriesContribution[]>([]);
        const scientificBoardMemberList = ref<PersonPublicationSeriesContribution[]>([]);

        watch(() => props.contributionList, () => {
            localContributions.value = props.contributionList;

            editorList.value = localContributions.value.filter((contribution) => contribution.contributionType.toString() == PublicationSeriesContributionType[PublicationSeriesContributionType.EDITOR]);
            associateEditorList.value = localContributions.value.filter((contribution) => contribution.contributionType.toString() == PublicationSeriesContributionType[PublicationSeriesContributionType.ASSOCIATE_EDITOR]);
            reviewerList.value = localContributions.value.filter((contribution) => contribution.contributionType.toString() == PublicationSeriesContributionType[PublicationSeriesContributionType.REVIEWER]);
            scientificBoardMemberList.value = localContributions.value.filter((contribution) => contribution.contributionType.toString() == PublicationSeriesContributionType[PublicationSeriesContributionType.SCIENTIFIC_BOARD_MEMBER]);
        
            selectFirstNonEmptyTab();
        });

        const updateOrderInParentList = () => {
            const indexes: number[] = [];
            editorList.value.forEach(contribution => indexes.push(contribution.id as number));
            associateEditorList.value.forEach(contribution => indexes.push(contribution.id as number));
            reviewerList.value.forEach(contribution => indexes.push(contribution.id as number));
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
                reviewers: reviewerList.value,
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
                    return PublicationSeriesContributionType.EDITOR;
                case "associateEditors":
                    return PublicationSeriesContributionType.ASSOCIATE_EDITOR;
                case "reviewers":
                    return PublicationSeriesContributionType.REVIEWER;
                case "scientificBoardMembers":
                    return PublicationSeriesContributionType.SCIENTIFIC_BOARD_MEMBER;
            }

            return undefined;
        };

        const getContributorGroupForUpdating = () => {
            switch (currentTab.value) {
                case "editors":
                    return editorList.value;
                case "associatedEditors":
                    return associateEditorList.value;
                case "reviewers":
                    return reviewerList.value;
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
            } else if (reviewerList.value.length > 0) {
                currentTab.value = "reviewers";
            } else if (scientificBoardMemberList.value.length > 0) {
                currentTab.value = "scientificBoardMembers";
            } else {
                currentTab.value = "";
            }
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
            getContributorGroupForUpdating
        };
    },
});
</script>
