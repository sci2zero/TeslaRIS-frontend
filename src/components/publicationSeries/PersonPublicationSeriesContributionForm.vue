<template>
    <v-container v-for="(input, index) in inputs" :key="index" class="bottom-spacer">
        <v-row>
            <v-col cols="10">
                <person-contribution-base :ref="(el) => (baseContributionRef[index] = el)" :basic="false" :preset-contribution-value="input.contribution" @set-input="input.contribution = $event; sendContentToParent();"></person-contribution-base>
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
                    v-model="input.contributionType"
                    :items="contributionTypes"
                    :label="$t('contributionTypeLabel')"
                    return-object
                    @update:model-value="sendContentToParent">
                </v-select>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6">
                <date-picker
                    v-model="input.dateFrom"
                    :label="$t('fromLabel')"
                    color="primary"
                    @update:model-value="sendContentToParent"
                ></date-picker>
            </v-col>
            <v-col cols="6">
                <date-picker
                    v-model="input.dateTo"
                    :label="$t('toLabel')"
                    color="primary"
                    @update:model-value="sendContentToParent"
                ></date-picker>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { ref } from "vue";
import { defineComponent } from "vue";
import { computed } from "vue";
import PersonContributionBase from "../core/PersonContributionBase.vue";
import type { PropType } from "vue";
import { onMounted } from "vue";
import { getTypesForGivenLocale, getTitleFromValueAutoLocale } from "@/i18n/publicationSeriesContributionType";
import { PublicationSeriesContributionType, type PersonPublicationSeriesContribution } from "@/models/PublicationSeriesModel";
import DatePicker from "../core/DatePicker.vue";


export default defineComponent({
    name: "PersonPublicationSeriesContributionForm",
    components: {PersonContributionBase, DatePicker},
    props: {
        presetContributions: {
            type: Array as PropType<PersonPublicationSeriesContribution[]>,
            default: () => []
        }
    },
    emits: ["setInput"],
    setup(props, {emit}) {
        const inputs = ref<any[]>(props.presetContributions.length > 0 ? Array.from({ length: props.presetContributions.length }, () => ({})) : [{contributionType: {title: getTitleFromValueAutoLocale(PublicationSeriesContributionType.EDITOR), value: PublicationSeriesContributionType.EDITOR}}]);
        const baseContributionRef = ref<any>([]);

        onMounted(() => {
            if(props.presetContributions && props.presetContributions.length > 0) {
                inputs.value = [];
                props.presetContributions.forEach(contribution => {
                    inputs.value.push({contribution: {
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
                    contributionType: {title: getTitleFromValueAutoLocale(contribution.contributionType), value: contribution.contributionType},
                    dateFrom: contribution.dateFrom,
                    dateTo: contribution.dateTo,
                    id: contribution.id});
                });
            }
        });

        const contributionTypes = computed(() => getTypesForGivenLocale());

        const addInput = () => {
            inputs.value.push({contributionType: {
                    title: getTitleFromValueAutoLocale(PublicationSeriesContributionType.EDITOR), 
                    value: PublicationSeriesContributionType.EDITOR
                }
            });
        };

        const removeInput = (index: number) => {
            inputs.value.splice(index, 1);

            baseContributionRef.value.forEach((ref: typeof PersonContributionBase) => {
                ref.valueSet = false;
            });

            inputs.value = [...inputs.value];
            sendContentToParent();
        };

        const clearInput = () => {
            inputs.value = [{contribution: {}, contributionType: {
                    title: getTitleFromValueAutoLocale(PublicationSeriesContributionType.EDITOR), 
                    value: PublicationSeriesContributionType.EDITOR
                }}];
            baseContributionRef.value.forEach((ref: typeof PersonContributionBase) => {
                ref.clearInput();
            });
            sendContentToParent();
        };

        const sendContentToParent = () => {
            const returnObject: PersonPublicationSeriesContribution[] = [];
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
                                    contributionType: input.contributionType.value,
                                    dateFrom: input.dateFrom,
                                    dateTo: input.dateTo,
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
