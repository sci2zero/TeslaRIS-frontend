<template>
    <v-row>
        <v-col cols="12">
            <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                <v-card-text class="edit-pen-container">
                    <publication-series-contribution-update-modal :read-only="readOnly" :preset-publication-series-contributions="contributionList" @update="sendToParent"></publication-series-contribution-update-modal>

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
                        <v-tab v-if="editorList.length > 0" value="editors">
                            {{ $t("editorsLabel") }}
                        </v-tab>
                        <v-tab v-if="associateEditorList.length > 0" value="associateEditors">
                            {{ $t("associateEditorsLabel") }}
                        </v-tab>
                        <v-tab v-if="reviewerList.length > 0" value="reviewers">
                            {{ $t("reviewersLabel") }}
                        </v-tab>
                        <v-tab v-if="scientificBoardMemberList.length > 0" value="scientificBoardMembers">
                            {{ $t("scientificBoardMembersLabel") }}
                        </v-tab>
                    </v-tabs>
                        
                    <v-window v-model="currentTab">
                        <v-window-item value="editors">
                            <person-publication-series-contribution-list :contribution-list="editorList"></person-publication-series-contribution-list>
                        </v-window-item>
                        <v-window-item value="associateEditors">
                            <person-publication-series-contribution-list :contribution-list="associateEditorList"></person-publication-series-contribution-list>
                        </v-window-item>
                        <v-window-item value="reviewers">
                            <person-publication-series-contribution-list :contribution-list="reviewerList"></person-publication-series-contribution-list>
                        </v-window-item>
                        <v-window-item value="scientificBoardMembers">
                            <person-publication-series-contribution-list :contribution-list="scientificBoardMemberList"></person-publication-series-contribution-list>
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
    },
    emits: ["update"],
    setup(props, { emit }) {
        const currentTab = ref("editors");

        const editorList = ref<PersonPublicationSeriesContribution[]>([]);
        const associateEditorList = ref<PersonPublicationSeriesContribution[]>([]);
        const reviewerList = ref<PersonPublicationSeriesContribution[]>([]);
        const scientificBoardMemberList = ref<PersonPublicationSeriesContribution[]>([]);

        watch(() => props.contributionList, () => {
            editorList.value = props.contributionList.filter((contribution) => contribution.contributionType.toString() == PublicationSeriesContributionType[PublicationSeriesContributionType.EDITOR]);
            associateEditorList.value = props.contributionList.filter((contribution) => contribution.contributionType.toString() == PublicationSeriesContributionType[PublicationSeriesContributionType.ASSOCIATE_EDITOR]);
            reviewerList.value = props.contributionList.filter((contribution) => contribution.contributionType.toString() == PublicationSeriesContributionType[PublicationSeriesContributionType.REVIEWER]);
            scientificBoardMemberList.value = props.contributionList.filter((contribution) => contribution.contributionType.toString() == PublicationSeriesContributionType[PublicationSeriesContributionType.SCIENTIFIC_BOARD_MEMBER]);
        });

        const sendToParent = (contributions: any[]) => {
            emit("update", contributions);
        };

        return {sendToParent, 
            getTitleFromValueAutoLocale,
            currentTab, editorList,
            associateEditorList, reviewerList,
            scientificBoardMemberList};
    },
});
</script>
