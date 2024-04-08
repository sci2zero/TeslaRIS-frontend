<template>
    <v-container v-for="(input, index) in inputs" :key="index" style="margin-bottom: 20px;">
        <v-row>
            <v-col cols="10">
                <person-contribution-base :ref="(el) => (baseContributionRef[index] = el)" :basic="basic" :preset-contribution-value="input.contribution" @set-input="input.contribution = $event; sendContentToParent();"></person-contribution-base>
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
        <v-row v-if="!basic">
            <v-col>
                <v-select
                    v-model="input.contributionType"
                    :items="contributionTypes"
                    :label="$t('contributionTypeLabel')"
                    @update:model-value="sendContentToParent">
                </v-select>
            </v-col>
        </v-row>
        <v-row v-if="!basic">
            <v-col>
                <v-checkbox v-model="input.isMainContributor" :label="$t('mainContributorLabel')" @click="sendContentToParent"></v-checkbox>
            </v-col>
            <v-col>
                <v-checkbox v-model="input.isCorrespondingContributor" :label="$t('correspondingContributorLabel')" @click="sendContentToParent"></v-checkbox>
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
import { DocumentContributionType, type PersonDocumentContribution } from "@/models/PublicationModel";
import type { PropType } from "vue";
import { onMounted } from "vue";

export default defineComponent({
    name: "PersonPublicationContribution",
    components: {PersonContributionBase},
    props: {
        basic: {
            type: Boolean,
            default: false
        },
        presetContributions: {
            type: Array as PropType<PersonDocumentContribution[]>,
            default: () => []
        }
    },
    emits: ["setInput"],
    setup(props, {emit}) {
        const inputs = ref<any[]>(props.presetContributions.length > 0 ? Array.from({ length: props.presetContributions.length }, () => ({})) : [{contributionType: DocumentContributionType.AUTHOR, isMainContributor: false, isCorrespondingContributor: false}]);
        const baseContributionRef = ref<any>([]);

        const i18n = useI18n();

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
                    contributionType: contribution.contributionType, 
                    isMainContributor: contribution.isMainContributor, 
                    isCorrespondingContributor: contribution.isCorrespondingContributor});
                });
            }
        });

        const contributionTypesEn = [
            { title: "Author", value: DocumentContributionType.AUTHOR },
            { title: "Editor", value: DocumentContributionType.EDITOR },
            { title: "Reviewer", value: DocumentContributionType.REVIEWER },
            { title: "Advisor", value: DocumentContributionType.ADVISOR },
        ];

        const contributionTypesSr = [
            { title: "Autor", value: DocumentContributionType.AUTHOR },
            { title: "Urednik", value: DocumentContributionType.EDITOR },
            { title: "Recenzent", value: DocumentContributionType.REVIEWER },
            { title: "Savetnik", value: DocumentContributionType.ADVISOR },
        ];

        const contributionTypes = computed(() => i18n.locale.value === "sr" ? contributionTypesSr : contributionTypesEn);

        const addInput = () => {
            inputs.value.push({contributionType:  DocumentContributionType.AUTHOR, isMainContributor: false});
        };

        const removeInput = (index: number) => {
            inputs.value.splice(index, 1);
        };

        const clearInput = () => {
            inputs.value = [{contribution: {}, contributionType:  DocumentContributionType.AUTHOR, isMainContributor: false, isCorrespondingContributor: false}];
            baseContributionRef.value.forEach((ref: typeof PersonContributionBase) => {
                ref.clearInput();
            });
            sendContentToParent();
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
                returnObject.push({contributionDescription: input.contribution.description,
                                    personId: input.contribution.personId,
                                    displayAffiliationStatement: input.contribution.affiliationStatement,
                                    orderNumber: index + 1,
                                    personName: personName,
                                    contributionType: props.basic ? DocumentContributionType.AUTHOR : input.contributionType,
                                    isMainContributor: props.basic ? index === 0 : input.isMainContributor,
                                    isCorrespondingContributor: props.basic ? false : input.isMainContributor});
            });
            emit("setInput", returnObject);
        };

        return {inputs, addInput, removeInput, contributionTypes, sendContentToParent, baseContributionRef, clearInput}
    }
});
</script>
