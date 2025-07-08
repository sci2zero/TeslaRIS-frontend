<template>
    <v-container v-for="(input, index) in inputs" :key="index" class="bottom-spacer contributions-box">
        <v-row>
            <v-col cols="10">
                <person-contribution-base
                    :ref="(el) => (baseContributionRef[index] = el)"
                    :basic="basic"
                    :required="required"
                    :preset-contribution-value="input.contribution"
                    :allow-external-associate="allowExternalAssociate && !boardMembersAllowed"
                    :is-update="isUpdate"
                    @set-input="input.contribution = $event; sendContentToParent();" />
            </v-col>
            <v-col cols="2">
                <v-col>
                    <v-btn
                        v-show="inputs.length > ((presetContributions && presetContributions.length > 0) ? 0 : 1)"
                        icon
                        @click="removeInput(index)">
                        <v-icon>mdi-delete</v-icon>
                    </v-btn>
                    <v-btn v-show="index === inputs.length - 1 && !limitOne" icon @click="addInput">
                        <v-icon>mdi-plus</v-icon>
                    </v-btn>
                </v-col>
            </v-col>
        </v-row>
        <v-row v-if="!basic">
            <v-col>
                <v-select
                    v-model="input.contributionType"
                    :items="contributionTypes"
                    :label="$t('contributionTypeLabel')"
                    return-object
                    :readonly="lockContributionType !== undefined"
                    @update:model-value="sendContentToParent">
                </v-select>
            </v-col>
        </v-row>
        <v-row v-if="!basic">
            <v-col v-if="input.contributionType && input.contributionType.value === 'AUTHOR'">
                <v-checkbox v-model="input.isCorrespondingContributor" :label="$t('correspondingContributorLabel')" @update:model-value="sendContentToParent"></v-checkbox>
            </v-col>
            <v-col v-if="input.contributionType && input.contributionType.value === 'BOARD_MEMBER' && shouldDiplayBoardPresidentBox(input)">
                <v-checkbox v-model="input.isBoardPresident" :label="$t('boardPresidentLabel')" @update:model-value="sendContentToParent"></v-checkbox>
            </v-col>
            <v-col v-if="input.contributionType && boardMembersAllowed && input.contributionType.value === 'ADVISOR' && shouldDisplayAlsoBoardMemberBox(input)">
                <v-checkbox v-model="input.isAlsoABoardMember" :label="$t('isAlsoABoardMemberLabel')" @update:model-value="sendContentToParent"></v-checkbox>
            </v-col>
            <v-col v-if="input.contributionType && (input.contributionType.value === 'BOARD_MEMBER' || input.contributionType.value === 'ADVISOR')">
                <v-select
                    v-model="input.employmentTitle"
                    :items="employmentTitles"
                    :label="$t('employmentPositionLabel')"
                    @update:model-value="sendContentToParent">
                </v-select>
            </v-col>
            <v-col v-if="input.contributionType && (input.contributionType.value === 'BOARD_MEMBER' || input.contributionType.value === 'ADVISOR')">
                <v-select
                    v-model="input.personalTitle"
                    :items="personalTitles"
                    :label="$t('academicTitleLabel')"
                    @update:model-value="sendContentToParent">
                </v-select>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { ref } from "vue";
import { defineComponent } from "vue";
import { computed } from "vue";
import PersonContributionBase from "../core/PersonContributionBase.vue";
import { DocumentContributionType, type PersonDocumentContribution } from "@/models/PublicationModel";
import type { PropType } from "vue";
import { onMounted } from "vue";
import { getTitleFromValueAutoLocale, getTypesForGivenLocale } from "@/i18n/documentContributionType";
import { getEmploymentTitlesForGivenLocale } from "@/i18n/employmentTitle";
import { getPersonalTitlesForGivenLocale } from "@/i18n/personalTitle";
import { EmploymentTitle, PersonalTitle } from "@/models/InvolvementModel";
import InvolvementService from "@/services/InvolvementService";
import { useI18n } from "vue-i18n";


export default defineComponent({
    name: "PersonPublicationContribution",
    components: { PersonContributionBase },
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
            type: Object as PropType<DocumentContributionType | undefined>,
            default: undefined
        },
        boardMemberIds: {
            type: Array<number>,
            default: []
        }
    },
    emits: ["setInput"],
    setup(props, {emit}) {
        const inputs = ref<any[]>(
            props.presetContributions.length > 0 ?
            Array.from({ length: props.presetContributions.length }, () => ({})) : 
            [
                {
                    contributionType: {
                        title: getTitleFromValueAutoLocale(props.lockContributionType ? props.lockContributionType : DocumentContributionType.AUTHOR),
                        value: props.lockContributionType ? props.lockContributionType : DocumentContributionType.AUTHOR
                    },
                    isMainContributor: false, isCorrespondingContributor: false
                }
            ]
        );
        const baseContributionRef = ref<any>([]);

        const employmentTitles = computed(() => getEmploymentTitlesForGivenLocale());
        const personalTitles = computed(() => getPersonalTitlesForGivenLocale());

        const i18n = useI18n();

        onMounted(() => {
            populateFormData();
        });

        const populateFormData = () => {
            if(props.presetContributions && props.presetContributions.length > 0) {
                fillInputs(props.presetContributions, false);
            }
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
                                institutionIds: contribution.institutionIds
                            }, 
                        contributionType: {
                            title: getTitleFromValueAutoLocale(contribution.contributionType),
                            value: contribution.contributionType
                        }, 
                        isMainContributor: contribution.isMainContributor, 
                        isCorrespondingContributor: contribution.isCorrespondingContributor,
                        isBoardPresident: contribution.isBoardPresident,
                        employmentTitle: contribution.employmentTitle,
                        personalTitle: contribution.personalTitle,
                        id: contribution.id
                    });
                });
        };

        const fillDummyAuthors = (amount: number) => {
            inputs.value = Array.from({ length: amount }, () => ({}));
        };

        const contributionTypes = computed(() => {
            const types = getTypesForGivenLocale();

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
            inputs.value.push({
                contributionType: {
                    title: getTitleFromValueAutoLocale(DocumentContributionType.AUTHOR),
                    value: props.lockContributionType ? props.lockContributionType : DocumentContributionType.AUTHOR
                },
                isMainContributor: false, 
                isCorrespondingContributor: false,
                isBoardPresident: false,
                personalTitle: PersonalTitle.DR
            });
        };

        const removeInput = (index: number) => {
            inputs.value.splice(index, 1);

            baseContributionRef.value.filter((ref: any) => ref).forEach((ref: typeof PersonContributionBase) => {
                ref.valueSet = false;
            });

            inputs.value = [...inputs.value];
            sendContentToParent();
        };

        const clearInput = () => {
            inputs.value.splice(0);
            inputs.value = [{
                contributionType: {
                    title: getTitleFromValueAutoLocale(DocumentContributionType.AUTHOR), 
                    value: DocumentContributionType.AUTHOR
                }, 
                isMainContributor: false, 
                isCorrespondingContributor: false,
            }];
            
            baseContributionRef.value
            .filter((ref: any) => ref)
            .forEach((ref: typeof PersonContributionBase) => {
                ref.clearInput();
            });

            emit("setInput", []);
        };

        const sendContentToParent = () => {
            const returnObject: PersonDocumentContribution[] = [];
            inputs.value.forEach((input, index) => {
                let personName = undefined;
                if (input.contribution.selectedOtherName) {
                    personName = {firstname: input.contribution.selectedOtherName[0], 
                                  otherName: input.contribution.selectedOtherName[1],
                                  lastname: input.contribution.selectedOtherName[2],
                                  dateFrom: input.contribution.selectedOtherName[3],
                                  dateTo: input.contribution.selectedOtherName[4]}
                }

                if (input.contributionType.value === DocumentContributionType.BOARD_MEMBER && !input.employmentTitle && input.contribution.personId !== -1) {
                    InvolvementService.getEmploymentTitle(input.contribution.personId)
                    .then(response => {
                        input.employmentTitle = response.data ? response.data : EmploymentTitle.ASSOCIATE_PROFESSOR;
                        sendContentToParent();
                    });
                }

                const advisorOrBoardMember = input.contributionType.value === DocumentContributionType.BOARD_MEMBER || input.contributionType.value === DocumentContributionType.ADVISOR;

                const contributionObject = {
                    contributionDescription: input.contribution.description,
                    personId: input.contribution.personId !== -1 ? input.contribution.personId : undefined,
                    displayAffiliationStatement: input.contribution.affiliationStatement,
                    orderNumber: index + 1,
                    personName: personName,
                    contributionType: props.basic ? DocumentContributionType.AUTHOR : input.contributionType.value,
                    isMainContributor: input.contributionType.value === DocumentContributionType.AUTHOR ? (props.basic ? index === 0 : input.isMainContributor) : false,
                    isCorrespondingContributor: input.contributionType.value === DocumentContributionType.AUTHOR ? (props.basic ? false : input.isCorrespondingContributor) : false,
                    isBoardPresident: input.contributionType.value === DocumentContributionType.BOARD_MEMBER ? (props.basic ? false : input.isBoardPresident) : false,
                    institutionIds: input.contribution.institutionIds,
                    employmentTitle: advisorOrBoardMember ? input.employmentTitle : undefined,
                    personalTitle: advisorOrBoardMember ? input.personalTitle : undefined
                };

                returnObject.push(contributionObject);

                if (input.isAlsoABoardMember) {
                    const boardMemberContribution = JSON.parse(JSON.stringify(contributionObject));
                    boardMemberContribution.contributionType = DocumentContributionType.BOARD_MEMBER;
                    returnObject.push(boardMemberContribution);
                }
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

        return {
            inputs, addInput, removeInput,
            contributionTypes, sendContentToParent,
            baseContributionRef, clearInput,
            employmentTitles, personalTitles,
            populateFormData, fillInputs,
            fillDummyAuthors,
            shouldDiplayBoardPresidentBox,
            shouldDisplayAlsoBoardMemberBox
        }
    }
});
</script>
