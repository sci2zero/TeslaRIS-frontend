<template>
    <v-container v-for="(input, index) in inputs" :key="index" style="margin-bottom: 20px;">
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
                <v-text-field v-model="input.dateFrom" type="date" :label="$t('fromLabel')" @update:model-value="sendContentToParent"></v-text-field>
            </v-col>
            <v-col cols="6">
                <v-text-field v-model="input.dateTo" type="date" :label="$t('toLabel')" @update:model-value="sendContentToParent"></v-text-field>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { ref } from "vue";
import { defineComponent } from "vue";
import { useI18n } from "vue-i18n";
import { computed } from "vue";
import PersonContributionBase from "../core/PersonContributionBase.vue";
import type { PropType } from "vue";
import { onMounted } from "vue";
import { getTypesForGivenLocale, getTitleFromValueAutoLocale } from "@/i18n/publicationSeriesContributionType";
import { PublicationSeriesContributionType, type PersonPublicationSeriesContribution } from "@/models/PublicationSeriesModel";

export default defineComponent({
    name: "PersonPublicationSeriesContributionForm",
    components: {PersonContributionBase},
    props: {
        presetContributions: {
            type: Array as PropType<PersonPublicationSeriesContribution[]>,
            default: () => []
        }
    },
    emits: ["setInput"],
    setup(props, {emit}) {
        const i18n = useI18n();

        const inputs = ref<any[]>(props.presetContributions.length > 0 ? Array.from({ length: props.presetContributions.length }, () => ({})) : [{contributionType: {title: getTitleFromValueAutoLocale(PublicationSeriesContributionType.EDITOR, i18n.locale.value), value: PublicationSeriesContributionType.EDITOR}}]);
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
                                                            ]
                                                    }, 
                    contributionType: {title: getTitleFromValueAutoLocale(contribution.contributionType, i18n.locale.value), value: contribution.contributionType},
                    dateFrom: contribution.dateFrom,
                    dateTo: contribution.dateTo,
                    id: contribution.id});
                });
            }
        });

        const contributionTypes = computed(() => getTypesForGivenLocale(i18n.locale.value));

        const addInput = () => {
            inputs.value.push({contributionType: {
                    title: getTitleFromValueAutoLocale(PublicationSeriesContributionType.EDITOR, i18n.locale.value), 
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
                    title: getTitleFromValueAutoLocale(PublicationSeriesContributionType.EDITOR, i18n.locale.value), 
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
                                    dateTo: input.dateTo});
            });
            emit("setInput", returnObject);
        };

        return {inputs, addInput, removeInput, 
                contributionTypes, baseContributionRef,
                sendContentToParent, clearInput}
    }
});
</script>
