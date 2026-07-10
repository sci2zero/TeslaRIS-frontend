<template>
    <v-container v-for="(input, index) in inputs" :key="index" class="bottom-spacer section-box">
        <v-row>
            <v-col cols="10">
                <person-contribution-base
                    :ref="(el) => (baseContributionRef[index] = el)"
                    :basic="false"
                    required
                    allow-external-associate
                    is-update
                    :preset-contribution-value="input.contribution"
                    @set-input="input.contribution = $event; sendContentToParent();"
                />
            </v-col>
            <v-col cols="2">
                <v-col>
                    <v-btn
                        v-show="inputs.length > ((presetContributions && presetContributions.length > 0) ? 0 : 1)"
                        icon
                        @click="removeInput(index)">
                        <v-icon>mdi-delete</v-icon>
                    </v-btn>
                    <v-btn v-show="index === inputs.length - 1" icon @click="addInput">
                        <v-icon>mdi-plus</v-icon>
                    </v-btn>
                </v-col>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-select
                    v-model="input.eventContributionType"
                    :items="contributionTypes"
                    :label="$t('contributionTypeLabel')"
                    return-object
                    :readonly="lockContributionType !== undefined && lockContributionType.length === 1"
                    @update:model-value="sendContentToParent">
                </v-select>
            </v-col>
        </v-row>
        <v-row v-if="input.eventContributionType && showPerTypeFields(input.eventContributionType.value, EventContributionType.ARGUER, 'ARGUER')">
            <v-col>
                <v-checkbox
                    v-model="input.mainArguer"
                    :label="$t('mainArguerLabel')"
                    @update:model-value="sendContentToParent"
                />
            </v-col>
        </v-row>
        <v-row v-if="input.eventContributionType && showPerTypeFields(input.eventContributionType.value, EventContributionType.WITNESS, 'WITNESS')">
            <v-col>
                <multilingual-text-input
                    ref="caseNameRef"
                    v-model="input.caseName"
                    :label="$t('caseNameLabel')"
                    :initial-value="toMultilingualTextInput(input.caseName, languageTags)"
                    @update="sendContentToParent"
                />
            </v-col>
        </v-row>
        <v-row v-if="input.eventContributionType && showPerTypeFields(input.eventContributionType.value, EventContributionType.WITNESS, 'WITNESS')">
            <v-col>
                <multilingual-text-input
                    ref="locationJurisdictionRef"
                    v-model="input.locationJurisdiction"
                    :label="$t('locationJurisdictionLabel')"
                    :initial-value="toMultilingualTextInput(input.locationJurisdiction, languageTags)"
                    @update="sendContentToParent"
                />
            </v-col>
        </v-row>
        <v-row v-if="input.eventContributionType && showPerTypeFields(input.eventContributionType.value, EventContributionType.SPEAKER, 'SPEAKER')">
            <v-col>
                <v-text-field
                    v-model="input.lectureHoursPerWeek"
                    :label="$t('lectureHoursPerWeekLabel')"
                    :placeholder="$t('lectureHoursPerWeekLabel')"
                    @update:model-value="sendContentToParent"
                />
            </v-col>
            <v-col>
                <v-text-field
                    v-model="input.tutorialHoursPerWeek"
                    :label="$t('tutorialHoursPerWeekLabel')"
                    :placeholder="$t('tutorialHoursPerWeekLabel')"
                    @update:model-value="sendContentToParent"
                />
            </v-col>
        </v-row>
        <v-row v-if="input.eventContributionType && showPerTypeFields(input.eventContributionType.value, EventContributionType.SPEAKER, 'SPEAKER')">
            <v-col>
                <v-text-field
                    v-model="input.labHoursPerWeek"
                    :label="$t('labHoursPerWeekLabel')"
                    :placeholder="$t('labHoursPerWeekLabel')"
                    @update:model-value="sendContentToParent"
                />
            </v-col>
            <v-col>
                <v-text-field
                    v-model="input.otherContactHoursPerWeek"
                    :label="$t('otherContactHoursPerWeekLabel')"
                    :placeholder="$t('otherContactHoursPerWeekLabel')"
                    @update:model-value="sendContentToParent"
                />
            </v-col>
        </v-row>
        <v-row v-if="input.eventContributionType && showPerTypeFields(input.eventContributionType.value, EventContributionType.REVIEWER, 'REVIEWER')">
            <v-col>
                <v-text-field
                    v-model="input.numberOfReviewsOrAssessment"
                    :label="$t('numberOfReviewsOrAssessmentLabel')"
                    :placeholder="$t('numberOfReviewsOrAssessmentLabel')"
                    @update:model-value="sendContentToParent"
                />
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { ref } from "vue";
import { defineComponent } from "vue";
import { EventContributionType, type PersonEventContribution } from "@/models/EventModel";
import { computed } from "vue";
import PersonContributionBase from "../core/PersonContributionBase.vue";
import type { PropType } from "vue";
import { onMounted } from "vue";
import { getTypesForGivenLocale, getTitleFromValueAutoLocale } from "@/i18n/eventContributionType";
import { toMultilingualTextInput } from "@/i18n/MultilingualContentUtil.js";
import { useLanguageTags } from "@/composables/useLanguageTags.js";
import MultilingualTextInput from "../core/MultilingualTextInput.vue";
import { getNameFromOrdinal } from "@/utils/EnumUtil.js";


export default defineComponent({
    name: "PersonEventContributionForm",
    components: { PersonContributionBase, MultilingualTextInput },
    props: {
        presetContributions: {
            type: Array as PropType<PersonEventContribution[]>,
            default: () => []
        },
        isUpdate: {
            type: Boolean,
            default: false
        },
        lockContributionType: {
            type: Object as PropType<EventContributionType[] | undefined>,
            default: undefined
        }
    },
    emits: ["setInput"],
    setup(props, {emit}) {
        const inputs = ref<any[]>(
            props.presetContributions.length > 0 ? Array.from(
                { length: props.presetContributions.length }, () => ({})
            ) : 
            [
                {
                    eventContributionType: {
                        title: getTitleFromValueAutoLocale(
                            (props.lockContributionType !== undefined) ? props.lockContributionType[0] : EventContributionType.PROGRAMME_BOARD_MEMBER
                        ),
                        value: (props.lockContributionType !== undefined) ? props.lockContributionType[0] : EventContributionType.PROGRAMME_BOARD_MEMBER
                    }
                }
            ]
        );
        const baseContributionRef = ref<any>([]);

        const { languageTags } = useLanguageTags();

        onMounted(() => {
            if(props.presetContributions && props.presetContributions.length > 0) {
                inputs.value.splice(0);
                props.presetContributions.forEach(contribution => {
                    inputs.value.push(
                        {
                            contribution: {
                                personId: contribution.personId, 
                                description: contribution.contributionDescription, 
                                affiliationStatement: contribution.displayAffiliationStatement, 
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
                        eventContributionType: {
                            title: getTitleFromValueAutoLocale(contribution.eventContributionType),
                            value: contribution.eventContributionType
                        },
                        caseName: contribution.caseName,
                        locationJurisdiction: contribution.locationJurisdiction,
                        lectureHoursPerWeek: contribution.lectureHoursPerWeek,
                        tutorialHoursPerWeek: contribution.tutorialHoursPerWeek,
                        labHoursPerWeek: contribution.labHoursPerWeek,
                        otherContactHoursPerWeek: contribution.otherContactHoursPerWeek,
                        numberOfReviewsOrAssessment: contribution.numberOfReviewsOrAssessment,
                        mainArguer: contribution.mainArguer,
                        id: contribution.id
                    });
                });
            }
        });

        const contributionTypes = computed(() => {
            const types = getTypesForGivenLocale();

            if (types && props.lockContributionType) {
                return types.filter(type => props.lockContributionType?.includes(type.value));
            }

            return types;
        });

        const addInput = () => {
            const contributionType =
                (props.lockContributionType !== undefined) ? props.lockContributionType[0] : EventContributionType.PROGRAMME_BOARD_MEMBER

            inputs.value.push({
                eventContributionType: {
                    title: getTitleFromValueAutoLocale(contributionType), 
                    value: contributionType
                },
                mainArguer: false
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
            inputs.value = [{contribution: {}, eventContributionType: {
                    title: getTitleFromValueAutoLocale(EventContributionType.PROGRAMME_BOARD_MEMBER), 
                    value: EventContributionType.PROGRAMME_BOARD_MEMBER
                }
            }];

            baseContributionRef.value
            .filter((ref: any) => ref)
            .forEach((ref: typeof PersonContributionBase) => {
                ref.clearInput();
            });

            sendContentToParent();
        };

        const sendContentToParent = () => {
            const returnObject: PersonEventContribution[] = [];

            inputs.value.forEach((input, index) => {
                if(!input.contribution) {
                    return;
                }

                let personName = undefined;
                if (input.contribution.selectedOtherName) {
                    personName = {
                        firstname: input.contribution.selectedOtherName[0], 
                        otherName: input.contribution.selectedOtherName[1],
                        lastname: input.contribution.selectedOtherName[2],
                        dateFrom: input.contribution.selectedOtherName[3],
                        dateTo: input.contribution.selectedOtherName[4]
                    };
                }
                returnObject.push({
                    contributionDescription: input.contribution.description,
                    personId: input.contribution.personId,
                    displayAffiliationStatement: input.contribution.affiliationStatement,
                    orderNumber: index + 1,
                    personName: personName,
                    eventContributionType: input.eventContributionType.value,
                    institutionIds: input.contribution.institutionIds,
                    caseName: input.caseName,
                    locationJurisdiction: input.locationJurisdiction,
                    lectureHoursPerWeek: input.lectureHoursPerWeek,
                    tutorialHoursPerWeek: input.tutorialHoursPerWeek,
                    labHoursPerWeek: input.labHoursPerWeek,
                    otherContactHoursPerWeek: input.otherContactHoursPerWeek,
                    numberOfReviewsOrAssessment: input.numberOfReviewsOrAssessment,
                    mainArguer: input.mainArguer,
                    dateFrom: input.contribution.dateFrom,
                    dateTo: input.contribution.dateTo,
                    researchAreasId: input.contribution.researchAreasId
                });
            });
            emit("setInput", returnObject);
        };

        const showPerTypeFields = 
            (eventContributionType: EventContributionType | number | string, compareWith: EventContributionType, stringRepr: string) => 
                eventContributionType === compareWith || 
                eventContributionType === stringRepr || 
                (
                    typeof eventContributionType === 'number' && 
                    getNameFromOrdinal(EventContributionType, eventContributionType) === stringRepr
                );

        return {
            inputs, addInput, removeInput,
            contributionTypes, baseContributionRef,
            sendContentToParent, clearInput,
            EventContributionType, languageTags,
            toMultilingualTextInput, getNameFromOrdinal,
            showPerTypeFields
        }
    }
});
</script>
