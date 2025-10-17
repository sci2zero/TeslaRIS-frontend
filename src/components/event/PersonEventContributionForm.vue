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
                    <v-btn v-show="inputs.length > 1" icon @click="removeInput(index)">
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
                    :readonly="lockContributionType !== undefined"
                    @update:model-value="sendContentToParent">
                </v-select>
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


export default defineComponent({
    name: "PersonEventContributionForm",
    components: {PersonContributionBase},
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
            type: Object as PropType<EventContributionType | undefined>,
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
                        title: getTitleFromValueAutoLocale(props.lockContributionType ? props.lockContributionType : EventContributionType.PROGRAMME_BOARD_MEMBER),
                        value: props.lockContributionType ? props.lockContributionType : EventContributionType.PROGRAMME_BOARD_MEMBER
                    }
                }
            ]
        );
        const baseContributionRef = ref<any>([]);

        onMounted(() => {
            if(props.presetContributions && props.presetContributions.length > 0) {
                inputs.value.splice(0);
                props.presetContributions.forEach(contribution => {
                    inputs.value.push({
                        contribution: {
                            personId: contribution.personId, 
                            description: contribution.contributionDescription, 
                            affiliationStatement: contribution.displayAffiliationStatement, 
                            selectedOtherName: [
                                        contribution.personName?.firstname, 
                                        contribution.personName?.otherName, 
                                        contribution.personName?.lastname
                                    ],
                            institutionIds: contribution.institutionIds
                        }, 
                    eventContributionType: {title: getTitleFromValueAutoLocale(contribution.eventContributionType), value: contribution.eventContributionType},
                    id: contribution.id});
                });
            }
        });

        const contributionTypes = computed(() => getTypesForGivenLocale());

        const addInput = () => {
            const contributionType =
                props.lockContributionType ? props.lockContributionType : EventContributionType.PROGRAMME_BOARD_MEMBER

            inputs.value.push({eventContributionType: {
                    title: getTitleFromValueAutoLocale(contributionType), 
                    value: contributionType
                }
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
                let personName = undefined;
                if (input.contribution.selectedOtherName) {
                    personName = {firstname: input.contribution.selectedOtherName[0], 
                                  otherName: input.contribution.selectedOtherName[1],
                                  lastname: input.contribution.selectedOtherName[2],
                                  dateFrom: input.contribution.selectedOtherName[3],
                                  dateTo: input.contribution.selectedOtherName[4]}
                }
                returnObject.push({contributionDescription: input.contribution.description,
                                    personId: input.contribution.personId,
                                    displayAffiliationStatement: input.contribution.affiliationStatement,
                                    orderNumber: index + 1,
                                    personName: personName,
                                    eventContributionType: input.eventContributionType.value,
                                    institutionIds: input.contribution.institutionIds
                                });
            });
            emit("setInput", returnObject);
        };

        return {inputs, addInput, removeInput, 
                contributionTypes, baseContributionRef,
                sendContentToParent, clearInput}
    }
});
</script>
