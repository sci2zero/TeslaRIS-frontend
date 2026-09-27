<template>
    <div class="mt-4 space-y-4">
        <div
            v-if="readOnly && visibleSections.length === 0"
            class="rounded-xl border border-slate-200 bg-white px-4 py-6 text-slate-600 shadow-sm">
            <p class="font-semibold text-slate-800">
                {{ showsBoardAndReviewers ? $t("boardAndReviewersLabel") : $t("contributionsLabel") }}
            </p>
            <p class="mt-1 text-sm text-slate-500">
                {{ $t("notYetSetMessage") }}
            </p>
        </div>

        <landing-section-card
            v-for="section in visibleSections"
            :key="section.key"
            :title="$t(section.titleKey)"
            :count="section.list.length"
            :icon="section.icon"
            :icon-class="section.iconClass">
            <template v-if="!readOnly" #action>
                <publication-contribution-update-modal
                    :key="sectionModalKey(section)"
                    :preset-document-contributions="section.list"
                    :board-members-allowed="boardMembersAllowed"
                    :board-member-ids="boardMemberIds"
                    :lock-contribution-type="[section.contributionType]"
                    :limit-one="section.limitOne"
                    @update="sendToParent(section.key, $event)">
                    <template #activator="{ props: activatorProps }">
                        <v-btn
                            v-bind="activatorProps"
                            variant="outlined"
                            size="small"
                            class="text-none"
                            prepend-icon="mdi-pencil-outline">
                            {{ $t("editActionLabel") }}
                        </v-btn>
                    </template>
                </publication-contribution-update-modal>
            </template>

            <div v-if="section.list.length === 0" class="px-4 py-5 text-sm text-slate-500">
                {{ $t("notYetSetMessage") }}
            </div>

            <ul v-else class="divide-y divide-slate-100">
                <li
                    v-for="(contribution, index) in section.list"
                    :key="contribution.id ?? `${section.key}-${index}`">
                    <person-contribution-row
                        :contribution="contribution"
                        :index="index + 1">
                        <template #badges>
                            <v-chip
                                v-if="contribution.isMainContributor"
                                size="small"
                                variant="tonal"
                                color="indigo">
                                {{ $t("mainContributorLabel") }}
                            </v-chip>
                            <v-chip
                                v-else
                                size="small"
                                variant="tonal"
                                :color="section.chipColor">
                                {{ getTitleFromValueAutoLocale(contribution.contributionType) }}
                            </v-chip>
                            <v-chip
                                v-if="contribution.isCorrespondingContributor"
                                size="small"
                                variant="tonal"
                                color="teal">
                                {{ $t("correspondingContributorLabel") }}
                            </v-chip>
                            <v-chip
                                v-if="contribution.isBoardPresident"
                                size="small"
                                variant="tonal"
                                color="deep-purple">
                                {{ $t("boardPresidentLabel") }}
                            </v-chip>
                        </template>
                    </person-contribution-row>
                </li>
            </ul>
        </landing-section-card>
    </div>
</template>

<script lang="ts">
import { DocumentContributionType, MonographType, PerformanceRelatedOutputType, PublicationType, type PersonDocumentContribution } from '@/models/PublicationModel';
import { computed, defineComponent, watch, type PropType } from 'vue';
import PublicationContributionUpdateModal from '@/components/publication/update/PublicationContributionUpdateModal.vue';
import { getTitleFromValueAutoLocale } from '@/i18n/documentContributionType';
import { ref } from 'vue';
import LandingSectionCard from '@/components/landing/LandingSectionCard.vue';
import PersonContributionRow from '@/components/person/PersonContributionRow.vue';

type SectionKey =
    | "authors"
    | "editors"
    | "associatedEditors"
    | "invitedEditors"
    | "reviewers"
    | "advisors"
    | "boardMembers"
    | "presenters"
    | "translators"
    | "assistantStaff"
    | "arguers"
    | "owners";

interface ContributionSection {
    key: SectionKey;
    titleKey: string;
    icon: string;
    iconClass: string;
    chipColor: string;
    list: PersonDocumentContribution[];
    contributionType: DocumentContributionType;
    visible: boolean;
    limitOne: boolean;
}

const matchesType = (contribution: PersonDocumentContribution, type: DocumentContributionType) =>
    contribution.contributionType?.toString() === type.toString();

export default defineComponent({
    name: "PersonDocumentContributionTabs",
    components: { PublicationContributionUpdateModal, LandingSectionCard, PersonContributionRow },
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

        const populateLists = () => {
            localContributions.value = props.contributionList;

            authorList.value = localContributions.value.filter(
                (contribution) => matchesType(contribution, DocumentContributionType.AUTHOR)
            );
            editorList.value = localContributions.value.filter(
                (contribution) => matchesType(contribution, DocumentContributionType.EDITOR)
            );
            associatedEditorList.value = localContributions.value.filter(
                (contribution) => matchesType(contribution, DocumentContributionType.ASSOCIATED_EDITOR)
            );
            invitedEditorList.value = localContributions.value.filter(
                (contribution) => matchesType(contribution, DocumentContributionType.INVITED_EDITOR)
            );
            reviewerList.value = localContributions.value.filter(
                (contribution) => matchesType(contribution, DocumentContributionType.REVIEWER)
            );
            advisorList.value = localContributions.value.filter(
                (contribution) => matchesType(contribution, DocumentContributionType.ADVISOR)
            );
            boardMemberList.value = localContributions.value.filter(
                (contribution) => matchesType(contribution, DocumentContributionType.BOARD_MEMBER)
            );
            presenterList.value = localContributions.value.filter(
                (contribution) => matchesType(contribution, DocumentContributionType.PRESENTER)
            );
            translatorList.value = localContributions.value.filter(
                (contribution) => matchesType(contribution, DocumentContributionType.TRANSLATOR)
            );
            assistantStaffList.value = localContributions.value.filter(
                (contribution) => matchesType(contribution, DocumentContributionType.ASSISTANT_STAFF)
            );
            arguerList.value = localContributions.value.filter(
                (contribution) => matchesType(contribution, DocumentContributionType.ARGUER)
            );
            ownerList.value = localContributions.value.filter(
                (contribution) => matchesType(contribution, DocumentContributionType.OWNER)
            );
        };

        watch(() => props.contributionList, () => {
            if (props.contributionList) {
                populateLists();
            }
        }, { immediate: true });

        const allSections = computed<ContributionSection[]>(() => [
            {
                key: "authors",
                titleKey: "authorsLabel",
                icon: "mdi-account-group",
                iconClass: "bg-indigo-50 text-indigo-600",
                chipColor: "indigo",
                list: authorList.value,
                contributionType: DocumentContributionType.AUTHOR,
                visible: showAuthorsOrStaff(),
                limitOne: props.limitOneAuthor
            },
            {
                key: "editors",
                titleKey: "editorsLabel",
                icon: "mdi-pencil",
                iconClass: "bg-cyan-50 text-cyan-700",
                chipColor: "cyan",
                list: editorList.value,
                contributionType: DocumentContributionType.EDITOR,
                visible: showEditors(),
                limitOne: false
            },
            {
                key: "associatedEditors",
                titleKey: "associatedEditorsLabel",
                icon: "mdi-account-edit",
                iconClass: "bg-sky-50 text-sky-700",
                chipColor: "light-blue",
                list: associatedEditorList.value,
                contributionType: DocumentContributionType.ASSOCIATED_EDITOR,
                visible: showEditors(),
                limitOne: false
            },
            {
                key: "invitedEditors",
                titleKey: "invitedEditorsLabel",
                icon: "mdi-account-star",
                iconClass: "bg-blue-50 text-blue-700",
                chipColor: "blue",
                list: invitedEditorList.value,
                contributionType: DocumentContributionType.INVITED_EDITOR,
                visible: showInvitedEditors(),
                limitOne: false
            },
            {
                key: "reviewers",
                titleKey: "reviewersLabel",
                icon: "mdi-clipboard-check",
                iconClass: "bg-orange-50 text-orange-700",
                chipColor: "orange",
                list: reviewerList.value,
                contributionType: DocumentContributionType.REVIEWER,
                visible: showReviewers(),
                limitOne: false
            },
            {
                key: "advisors",
                titleKey: props.limitOneAuthor ? "mentorsLabel" : "advisorsLabel",
                icon: "mdi-school",
                iconClass: "bg-purple-50 text-purple-700",
                chipColor: "deep-purple",
                list: advisorList.value,
                contributionType: DocumentContributionType.ADVISOR,
                visible: props.documentType === PublicationType.THESIS,
                limitOne: false
            },
            {
                key: "boardMembers",
                titleKey: "boardMembersLabel",
                icon: "mdi-account-tie",
                iconClass: "bg-violet-50 text-violet-700",
                chipColor: "purple",
                list: boardMemberList.value,
                contributionType: DocumentContributionType.BOARD_MEMBER,
                visible: props.boardMembersAllowed && props.documentType === PublicationType.THESIS,
                limitOne: false
            },
            {
                key: "presenters",
                titleKey: "presentersLabel",
                icon: "mdi-presentation",
                iconClass: "bg-blue-50 text-blue-700",
                chipColor: "blue",
                list: presenterList.value,
                contributionType: DocumentContributionType.PRESENTER,
                visible: props.documentType === PublicationType.PERFORMANCE_RELATED_OUTPUT,
                limitOne: false
            },
            {
                key: "translators",
                titleKey: "translatorsLabel",
                icon: "mdi-translate",
                iconClass: "bg-emerald-50 text-emerald-700",
                chipColor: "green",
                list: translatorList.value,
                contributionType: DocumentContributionType.TRANSLATOR,
                visible: true,
                limitOne: false
            },
            {
                key: "assistantStaff",
                titleKey: "assistantStaffLabel",
                icon: "mdi-account-hard-hat",
                iconClass: "bg-amber-50 text-amber-700",
                chipColor: "amber",
                list: assistantStaffList.value,
                contributionType: DocumentContributionType.ASSISTANT_STAFF,
                visible: showAuthorsOrStaff(),
                limitOne: false
            },
            {
                key: "arguers",
                titleKey: "arguersLabel",
                icon: "mdi-gavel",
                iconClass: "bg-stone-100 text-stone-700",
                chipColor: "brown",
                list: arguerList.value,
                contributionType: DocumentContributionType.ARGUER,
                visible: props.boardMembersAllowed && props.documentType === PublicationType.THESIS,
                limitOne: false
            },
            {
                key: "owners",
                titleKey: "ownersLabel",
                icon: "mdi-key-variant",
                iconClass: "bg-rose-50 text-rose-700",
                chipColor: "pink",
                list: ownerList.value,
                contributionType: DocumentContributionType.OWNER,
                visible: showOwners(),
                limitOne: false
            }
        ]);

        const visibleSections = computed(() =>
            allSections.value.filter((section) => {
                if (!section.visible) {
                    return false;
                }
                if (props.readOnly && section.list.length === 0) {
                    return false;
                }
                return true;
            })
        );

        const boardMemberIds = computed(() =>
            props.boardMembersAllowed
                ? boardMemberList.value.map(bm => bm.personId).filter(id => !!id)
                : []
        );

        const sendToParent = (sectionKey: SectionKey, contributions: PersonDocumentContribution[]) => {
            const contributionLists: Record<SectionKey, PersonDocumentContribution[]> = {
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

            const allContributions: PersonDocumentContribution[] = [];
            (Object.keys(contributionLists) as SectionKey[]).forEach((key) => {
                if (key === sectionKey) {
                    allContributions.push(...contributions);
                } else {
                    allContributions.push(...(contributionLists[key] || []));
                }
            });

            emit("update", allContributions);
        };

        const sectionModalKey = (section: ContributionSection) =>
            `${section.key}-${section.list.map((contribution) => contribution.id ?? contribution.personId).join("|")}`;

        return {
            sendToParent,
            getTitleFromValueAutoLocale,
            visibleSections,
            boardMemberIds,
            sectionModalKey
        };
    },
});
</script>
