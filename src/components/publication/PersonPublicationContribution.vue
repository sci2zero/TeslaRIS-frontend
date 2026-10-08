<template>
    <div class="contribution-list">
        <p class="contribution-list-hint">
            {{ $t("contributionAccordionHint") }}
        </p>

        <div v-if="inputs.length === 0" class="contribution-empty">
            {{ $t("notYetSetMessage") }}
        </div>

        <draggable
            :list="inputs"
            item-key="_uid"
            handle=".contribution-drag-handle"
            :animation="200"
            ghost-class="contribution-panel-ghost"
            :disabled="limitOne || inputs.length < 2"
            class="contribution-panels"
            @change="onContributorReorder"
        >
            <v-expansion-panels
                v-for="(input, index) in inputs"
                :key="input._uid"
                v-model="openedPanel"
                eager
                flat
                class="contribution-panel-wrap"
            >
                <v-expansion-panel
                    :value="input._uid"
                    eager
                    class="contribution-panel"
                >
                    <v-expansion-panel-title class="contribution-panel-title">
                        <div class="contribution-summary">
                            <v-icon
                                v-if="!limitOne && inputs.length > 1"
                                class="contribution-drag-handle"
                                icon="mdi-drag-vertical"
                                @click.stop
                            />
                            <span class="contribution-index">{{ index + 1 }}</span>
                            <div class="contribution-summary-text">
                                <div class="contribution-name">
                                    {{ getContributorDisplayName(input) }}
                                </div>
                                <div class="contribution-chips">
                                    <v-chip
                                        v-if="!basic && input.contributionType?.title"
                                        size="x-small"
                                        variant="tonal"
                                        color="primary"
                                    >
                                        {{ input.contributionType.title }}
                                    </v-chip>
                                    <v-chip
                                        v-if="!basic && input.isMainContributor"
                                        size="x-small"
                                        variant="tonal"
                                        color="indigo"
                                    >
                                        {{ $t("mainContributorLabel") }}
                                    </v-chip>
                                    <v-chip
                                        v-if="!basic && input.isCorrespondingContributor"
                                        size="x-small"
                                        variant="tonal"
                                        color="teal"
                                    >
                                        {{ $t("correspondingContributorLabel") }}
                                    </v-chip>
                                    <v-chip
                                        v-if="!basic && input.isBoardPresident"
                                        size="x-small"
                                        variant="tonal"
                                        color="deep-purple"
                                    >
                                        {{ $t("boardPresidentLabel") }}
                                    </v-chip>
                                    <v-chip
                                        v-if="!basic && input.isAlsoABoardMember"
                                        size="x-small"
                                        variant="tonal"
                                    >
                                        {{ $t("isAlsoABoardMemberLabel") }}
                                    </v-chip>
                                </div>
                            </div>
                            <v-tooltip
                                v-if="canRemoveContributor"
                                location="top"
                                :text="$t('deleteLabel')"
                            >
                                <template #activator="{ props: tooltipProps }">
                                    <v-icon
                                        v-bind="tooltipProps"
                                        class="contribution-delete"
                                        color="error"
                                        @click.stop.prevent="removeInput(index)"
                                        @mousedown.stop
                                    >
                                        mdi-delete-outline
                                    </v-icon>
                                </template>
                            </v-tooltip>
                        </div>
                    </v-expansion-panel-title>
                    <v-expansion-panel-text eager>
                        <div class="contribution-editor">
                            <person-contribution-base
                                :ref="(el) => (baseContributionRef[index] = el)"
                                :basic="basic"
                                :required="required"
                                :preset-contribution-value="input.contribution"
                                :allow-external-associate="allowExternalAssociate && !boardMembersAllowed"
                                :is-update="isUpdate"
                                :lock-search-field="lockSearchField"
                                show-top-suggestions
                                :suggestion-display-check="checkWhetherCurrentUserShouldBeDisplayed"
                                @set-input="input.contribution = $event; sendContentToParent();"
                            />

                            <section v-if="!basic" class="editor-section">
                                <h3 class="editor-section-title">
                                    {{ $t("contributorRoleSectionLabel") }}
                                </h3>
                                <ui-input
                                    v-model="input.contributionType"
                                    control="select"
                                    :items="contributionTypes"
                                    :label="$t('contributionTypeLabel')"
                                    return-object
                                    @update:model-value="sendContentToParent"
                                />

                                <div v-if="hasRoleOptions(input)" class="role-options">
                                    <v-checkbox
                                        v-if="canBeMainContributor(input)"
                                        v-model="input.isMainContributor"
                                        class="role-option"
                                        color="primary"
                                        hide-details
                                        @update:model-value="sendContentToParent"
                                    >
                                        <template #label>
                                            <div>
                                                <div class="role-option-title">
                                                    {{ $t("mainContributorLabel") }}
                                                </div>
                                                <div class="role-option-hint">
                                                    {{ $t("mainContributorHint") }}
                                                </div>
                                            </div>
                                        </template>
                                    </v-checkbox>
                                    <v-checkbox
                                        v-if="input.contributionType && input.contributionType.value === 'AUTHOR'"
                                        v-model="input.isCorrespondingContributor"
                                        class="role-option"
                                        color="primary"
                                        hide-details
                                        @update:model-value="sendContentToParent"
                                    >
                                        <template #label>
                                            <div>
                                                <div class="role-option-title">
                                                    {{ $t("correspondingContributorLabel") }}
                                                </div>
                                                <div class="role-option-hint">
                                                    {{ $t("correspondingContributorHint") }}
                                                </div>
                                            </div>
                                        </template>
                                    </v-checkbox>
                                    <v-checkbox
                                        v-if="input.contributionType && input.contributionType.value === 'BOARD_MEMBER' && shouldDiplayBoardPresidentBox(input)"
                                        v-model="input.isBoardPresident"
                                        class="role-option"
                                        color="primary"
                                        hide-details
                                        @update:model-value="sendContentToParent"
                                    >
                                        <template #label>
                                            <div>
                                                <div class="role-option-title">
                                                    {{ $t("boardPresidentLabel") }}
                                                </div>
                                                <div class="role-option-hint">
                                                    {{ $t("boardPresidentHint") }}
                                                </div>
                                            </div>
                                        </template>
                                    </v-checkbox>
                                    <v-checkbox
                                        v-if="input.contributionType && boardMembersAllowed && input.contributionType.value === 'ADVISOR' && shouldDisplayAlsoBoardMemberBox(input)"
                                        v-model="input.isAlsoABoardMember"
                                        class="role-option"
                                        color="primary"
                                        hide-details
                                        @update:model-value="sendContentToParent"
                                    >
                                        <template #label>
                                            <div>
                                                <div class="role-option-title">
                                                    {{ $t("isAlsoABoardMemberLabel") }}
                                                </div>
                                                <div class="role-option-hint">
                                                    {{ $t("isAlsoABoardMemberHint") }}
                                                </div>
                                            </div>
                                        </template>
                                    </v-checkbox>
                                </div>

                                <div
                                    v-if="input.contributionType && (input.contributionType.value === 'BOARD_MEMBER' || input.contributionType.value === 'ADVISOR')"
                                    class="title-options"
                                >
                                    <h4 class="editor-subsection-title">
                                        {{ $t("contributorTitlesSectionLabel") }}
                                    </h4>
                                    <v-row>
                                        <v-col cols="12" md="6">
                                            <ui-input
                                                v-model="input.employmentTitle"
                                                control="select"
                                                :items="employmentTitles"
                                                :label="$t('employmentPositionLabel')"
                                                @update:model-value="sendContentToParent"
                                            />
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <ui-input
                                                v-model="input.personalTitle"
                                                control="select"
                                                :items="personalTitles"
                                                :label="$t('academicTitleLabel')"
                                                @update:model-value="sendContentToParent"
                                            />
                                        </v-col>
                                    </v-row>
                                </div>
                            </section>
                        </div>
                    </v-expansion-panel-text>
                </v-expansion-panel>
            </v-expansion-panels>
        </draggable>

        <div v-if="!limitOne" class="add-contributor-row">
            <v-btn
                variant="tonal"
                color="primary"
                prepend-icon="mdi-plus"
                @click="addInput"
            >
                {{ $t("addContributorLabel") }}
            </v-btn>
        </div>
    </div>
</template>

<script lang="ts">
import { ref } from "vue";
import { defineComponent } from "vue";
import { computed } from "vue";
import PersonContributionBase from "../core/PersonContributionBase.vue";
import { DocumentContributionType, type PersonDocumentContribution } from "@/models/PublicationModel";
import type { PropType } from "vue";
import { nextTick, onMounted } from "vue";
import { getTitleFromValueAutoLocale, getTypesForGivenLocale } from "@/i18n/documentContributionType";
import { getEmploymentTitlesForGivenLocale } from "@/i18n/employmentTitle";
import { getPersonalTitlesForGivenLocale } from "@/i18n/personalTitle";
import { EmploymentTitle, PersonalTitle } from "@/models/InvolvementModel";
import InvolvementService from "@/services/InvolvementService";
import { useI18n } from "vue-i18n";
import { useUserRole } from "@/composables/useUserRole";
import UiInput from "@/components/ui/input/Input.vue";
import { VueDraggableNext } from "vue-draggable-next";


export default defineComponent({
    name: "PersonPublicationContribution",
    components: { PersonContributionBase, UiInput, draggable: VueDraggableNext },
    props: {
        basic: {
            type: Boolean,
            default: false
        },
        presetContributions: {
            type: Array as PropType<PersonDocumentContribution[]>,
            default: () => []
        },
        boardMembersAllowed: {
            type: Boolean,
            default: false
        },
        limitOne: {
            type: Boolean,
            default: false
        },
        allowExternalAssociate: {
            type: Boolean,
            default: true
        },
        required: {
            type: Boolean,
            default: true
        },
        isUpdate: {
            type: Boolean,
            default: false
        },
        lockContributionType: {
            type: Object as PropType<DocumentContributionType[] | undefined>,
            default: undefined
        },
        boardMemberIds: {
            type: Array<number>,
            default: []
        },
        lockSearchField: {
            type: Boolean,
            default: false
        }
    },
    emits: ["setInput"],
    setup(props, {emit}) {
        let nextUid = 1;

        const createDefaultInput = () => {
            const contributionType =
                props.lockContributionType ? props.lockContributionType[0] : DocumentContributionType.AUTHOR;

            return {
                _uid: nextUid++,
                contributionType: {
                    title: getTitleFromValueAutoLocale(contributionType),
                    value: contributionType
                },
                isMainContributor: false,
                isCorrespondingContributor: false,
                isBoardPresident: false,
                employmentTitle: EmploymentTitle.FULL_PROFESSOR,
                personalTitle: PersonalTitle.PHD
            };
        };

        const inputs = ref<any[]>(
            Array.from(
                { length: Math.max(props.presetContributions.length, 1) },
                () => createDefaultInput()
            )
        );
        const baseContributionRef = ref<any>([]);
        const openedPanel = ref<number | undefined>(undefined);

        const employmentTitles = computed(() => getEmploymentTitlesForGivenLocale());
        const personalTitles = computed(() => getPersonalTitlesForGivenLocale());
        const canRemoveContributor = computed(() =>
            inputs.value.length > ((props.presetContributions && props.presetContributions.length > 0) ? 0 : 1)
        );

        const i18n = useI18n();

        const { isResearcher } = useUserRole();

        onMounted(() => {
            populateFormData();
            syncOpenedPanel();
        });

        const checkWhetherCurrentUserShouldBeDisplayed = (personId: number): boolean => {
            if (isResearcher.value && inputs.value && inputs.value.length > 0) {
                if (inputs.value.find(c => c.contribution && c.contribution.personId === personId) === undefined) {
                    return true;
                } else {
                    return false;
                }
            }

            return false;
        };

        const populateFormData = () => {
            if(props.presetContributions && props.presetContributions.length > 0) {
                fillInputs(props.presetContributions, false);
            }
        };

        const syncOpenedPanel = () => {
            if (inputs.value.length === 0) {
                openedPanel.value = undefined;
                return;
            }

            if (props.isUpdate && inputs.value.length > 1) {
                openedPanel.value = undefined;
                return;
            }

            openedPanel.value = inputs.value[0]._uid;
        };

        const fillInputs = (contributions: PersonDocumentContribution[], resetBaseComponents: boolean) => {
            if (resetBaseComponents) {
                baseContributionRef.value.filter((ref: any) => ref).forEach((ref: typeof PersonContributionBase) => {
                    ref.valueSet = false;
                });
            }
            inputs.value.splice(0);

            contributions.forEach(contribution => {
                    inputs.value.push({
                        _uid: nextUid++,
                        contribution:
                            {
                                personId: contribution.personId,
                                description: contribution.contributionDescription !== null ? contribution.contributionDescription : [],
                                affiliationStatement: contribution.displayAffiliationStatement !== null ? contribution.displayAffiliationStatement : [],
                                selectedOtherName: [
                                            contribution.personName?.firstname,
                                            contribution.personName?.otherName,
                                            contribution.personName?.lastname
                                        ],
                                institutionIds: contribution.institutionIds,
                                dateFrom: contribution.dateFrom,
                                dateTo: contribution.dateTo,
                                researchAreas: contribution.researchAreas
                            },
                        contributionType: {
                            title: getTitleFromValueAutoLocale(contribution.contributionType),
                            value: contribution.contributionType
                        },
                        isMainContributor: contribution.isMainContributor,
                        isCorrespondingContributor: contribution.isCorrespondingContributor,
                        isBoardPresident: contribution.isBoardPresident ?? false,
                        employmentTitle: contribution.employmentTitle,
                        personalTitle: contribution.personalTitle,
                        id: contribution.id
                    });
                });

            syncOpenedPanel();
        };

        const fillDummyAuthors = (amount: number) => {
            inputs.value = Array.from({ length: amount }, () => createDefaultInput());
        };

        const contributionTypes = computed(() => {
            const types = getTypesForGivenLocale();

            if (types && props.lockContributionType) {
                return types.filter(type => props.lockContributionType?.includes(type.value));
            }

            if (types && !props.boardMembersAllowed) {
                return types.filter(type => type.value !== "BOARD_MEMBER");
            }

            if (types && props.boardMembersAllowed) {
                types.forEach(type => {
                    if (type.value === "ADVISOR") {
                        type.title = i18n.t("mentorLabel");
                    }
                });
            }

            return types;
        });

        const addInput = () => {
            const newInput = createDefaultInput();
            inputs.value.push(newInput);

            nextTick(() => {
                openedPanel.value = newInput._uid;
            });
        };

        const removeInput = (index: number) => {
            const removedUid = inputs.value[index]?._uid;
            inputs.value.splice(index, 1);

            if (openedPanel.value === removedUid) {
                openedPanel.value = undefined;
            }

            sendContentToParent();
        };

        const onContributorReorder = () => {
            nextTick(() => sendContentToParent());
        };

        const clearInput = () => {
            inputs.value.splice(0);
            inputs.value = [createDefaultInput()];

            baseContributionRef.value
            .filter((ref: any) => ref)
            .forEach((ref: typeof PersonContributionBase) => {
                ref.clearInput();
            });

            openedPanel.value = inputs.value[0]._uid;
            emit("setInput", []);
        };

        const sendContentToParent = () => {
            const returnObject: PersonDocumentContribution[] = [];
            inputs.value.forEach((input, index) => {
                if (!input.contribution) {
                    return;
                }

                const contributionTypeValue = props.basic
                    ? DocumentContributionType.AUTHOR
                    : input.contributionType?.value;

                if (!contributionTypeValue) {
                    return;
                }

                let personName = undefined;
                if (input.contribution.selectedOtherName) {
                    personName = {firstname: input.contribution.selectedOtherName[0],
                                  otherName: input.contribution.selectedOtherName[1],
                                  lastname: input.contribution.selectedOtherName[2],
                                  dateFrom: input.contribution.selectedOtherName[3],
                                  dateTo: input.contribution.selectedOtherName[4]}
                }

                if (contributionTypeValue === DocumentContributionType.BOARD_MEMBER && !input.employmentTitle && input.contribution.personId > 0) {
                    InvolvementService.getEmploymentTitle(input.contribution.personId)
                    .then(response => {
                        input.employmentTitle = response.data ? response.data : EmploymentTitle.FULL_PROFESSOR;
                        sendContentToParent();
                    });
                }

                if (contributionTypeValue === DocumentContributionType.BOARD_MEMBER && !input.personalTitle) {
                    input.personalTitle = PersonalTitle.PHD;
                    sendContentToParent();
                }

                const advisorOrBoardMember = contributionTypeValue === DocumentContributionType.BOARD_MEMBER || contributionTypeValue === DocumentContributionType.ADVISOR;

                const contributionObject = {
                    contributionDescription: input.contribution.description,
                    personId: input.contribution.personId !== -1 ? input.contribution.personId : undefined,
                    displayAffiliationStatement: input.contribution.affiliationStatement,
                    orderNumber: index + 1,
                    personName: personName,
                    contributionType: contributionTypeValue,
                    isMainContributor: canBeMainContributor(input) ? (props.basic ? index === 0 : input.isMainContributor) : false,
                    isCorrespondingContributor: contributionTypeValue === DocumentContributionType.AUTHOR ? (props.basic ? false : input.isCorrespondingContributor) : false,
                    isBoardPresident: contributionTypeValue === DocumentContributionType.BOARD_MEMBER ? (props.basic ? false : input.isBoardPresident) : false,
                    institutionIds: input.contribution.institutionIds,
                    employmentTitle: advisorOrBoardMember ? input.employmentTitle : undefined,
                    personalTitle: advisorOrBoardMember ? input.personalTitle : undefined,
                    dateFrom: input.contribution.dateFrom,
                    dateTo: input.contribution.dateTo,
                    researchAreasId: input.contribution.researchAreasId
                };

                returnObject.push(contributionObject);

                if (input.isAlsoABoardMember) {
                    const boardMemberContribution = JSON.parse(JSON.stringify(contributionObject));
                    boardMemberContribution.contributionType = DocumentContributionType.BOARD_MEMBER;
                    returnObject.push(boardMemberContribution);
                }
            });

            baseContributionRef.value
            .filter((ref: any) => ref)
            .forEach((ref: typeof PersonContributionBase) => {
                ref.displayTopCollaboratorPicks();
            });

            emit("setInput", returnObject);
        };

        const shouldDiplayBoardPresidentBox = (input: any) => {
            if (inputs.value.find(i => i.isBoardPresident)) {
                return input.isBoardPresident;
            }

            return true;
        };

        const shouldDisplayAlsoBoardMemberBox = (input: any) => {
            for(const boardMemberId of props.boardMemberIds) {
                if (input.contribution && input.contribution.personId === boardMemberId) {
                    return false;
                }
            }

            return true;
        };

        const canBeMainContributor = ((input: any) =>
            [
                DocumentContributionType.AUTHOR,
                DocumentContributionType.PRESENTER,
                DocumentContributionType.EDITOR,
                DocumentContributionType.ADVISOR,
                DocumentContributionType.ARGUER
            ].includes(input.contributionType?.value)
        );

        const hasRoleOptions = (input: any) => {
            if (canBeMainContributor(input)) {
                return true;
            }

            if (input.contributionType?.value === DocumentContributionType.AUTHOR) {
                return true;
            }

            if (input.contributionType?.value === DocumentContributionType.BOARD_MEMBER && shouldDiplayBoardPresidentBox(input)) {
                return true;
            }

            if (
                props.boardMembersAllowed &&
                input.contributionType?.value === DocumentContributionType.ADVISOR &&
                shouldDisplayAlsoBoardMemberBox(input)
            ) {
                return true;
            }

            return false;
        };

        const getContributorDisplayName = (input: any): string => {
            const nameParts = input.contribution?.selectedOtherName;
            if (!nameParts) {
                return i18n.t("newContributorLabel");
            }

            const first = nameParts[0]?.toString().trim() || "";
            const middleRaw = nameParts[1]?.toString().trim() || "";
            const middle = middleRaw.toLowerCase() === "null" ? "" : middleRaw;
            const last = nameParts[2]?.toString().trim() || "";
            const fullName = [first, middle, last].filter(Boolean).join(" ").trim();

            return fullName || i18n.t("newContributorLabel");
        };

        return {
            inputs, addInput, removeInput,
            contributionTypes, sendContentToParent,
            baseContributionRef, clearInput,
            employmentTitles, personalTitles,
            populateFormData, fillInputs, fillDummyAuthors,
            checkWhetherCurrentUserShouldBeDisplayed,
            shouldDiplayBoardPresidentBox,
            shouldDisplayAlsoBoardMemberBox,
            canBeMainContributor,
            hasRoleOptions,
            getContributorDisplayName,
            openedPanel,
            canRemoveContributor,
            onContributorReorder
        }
    }
});
</script>

<style scoped>
.contribution-list-hint {
    margin: 0 0 12px;
    font-size: 0.875rem;
    color: rgba(var(--v-theme-on-surface), 0.65);
    line-height: 1.45;
}

.contribution-empty {
    text-align: center;
    padding: 24px 8px;
    color: rgba(var(--v-theme-on-surface), 0.55);
}

.contribution-panels {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.contribution-panel-wrap {
    min-width: 0;
}

.contribution-panel {
    border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
    border-radius: 10px !important;
    overflow: hidden;
}

.contribution-panel-ghost {
    opacity: 0.45;
}

.contribution-drag-handle {
    flex-shrink: 0;
    cursor: grab;
    color: rgba(var(--v-theme-on-surface), 0.45);
}

.contribution-drag-handle:active {
    cursor: grabbing;
}

.contribution-panel-title {
    min-height: 64px;
    padding: 10px 16px;
    font-weight: 600;
}

.contribution-summary {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
    padding-right: 8px;
}

.contribution-index {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 700;
    color: rgb(var(--v-theme-primary));
    background: rgba(var(--v-theme-primary), 0.12);
}

.contribution-summary-text {
    flex: 1;
    min-width: 0;
    text-align: left;
}

.contribution-name {
    font-size: 0.95rem;
    font-weight: 600;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.contribution-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 4px;
}

.contribution-delete {
    flex-shrink: 0;
    cursor: pointer;
}

.contribution-editor {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 4px 4px 12px;
}

.editor-section {
    padding: 12px 14px 8px;
    border-radius: 10px;
    background: rgba(var(--v-theme-on-surface), 0.03);
    border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.editor-section-title {
    margin: 0 0 10px;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: rgba(var(--v-theme-on-surface), 0.55);
}

.editor-subsection-title {
    margin: 8px 0 4px;
    font-size: 0.8rem;
    font-weight: 600;
    color: rgba(var(--v-theme-on-surface), 0.7);
}

.role-options {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin: 8px 0 12px;
}

.role-option {
    margin-inline-start: -8px;
}

:deep(.role-option .v-selection-control) {
    align-items: flex-start;
}

.role-option-title {
    font-weight: 600;
    line-height: 1.3;
}

.role-option-hint {
    margin-top: 2px;
    font-size: 0.75rem;
    font-weight: 400;
    color: rgba(var(--v-theme-on-surface), 0.6);
    line-height: 1.35;
    white-space: normal;
}

:deep(.role-option .v-label) {
    white-space: normal;
    opacity: 1;
    align-items: flex-start;
}

.add-contributor-row {
    display: flex;
    justify-content: flex-start;
    margin-top: 12px;
}

:deep(.v-expansion-panel-title__overlay) {
    opacity: 0;
}

:deep(.contribution-panel .v-expansion-panel-title:hover) {
    background: rgba(var(--v-theme-primary), 0.04);
}

:deep(.v-expansion-panel-text__wrapper) {
    padding: 0 16px 8px;
}

:deep(.v-expansion-panel--active > .v-expansion-panel-title) {
    min-height: 64px;
}

:deep(.v-expansion-panels) {
    gap: 8px;
}
</style>
