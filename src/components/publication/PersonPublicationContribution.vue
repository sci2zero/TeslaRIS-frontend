<template>
    <v-container v-for="(input, index) in inputs" :key="index" class="bg-blue-grey-lighten-5" style="margin-bottom: 20px;">
        <v-row>
            <v-col cols="10">
                <person-contribution-base @set-input="input.contribution = $event; sendContentToParent();"></person-contribution-base>
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
                    @update:model-value="sendContentToParent">
                </v-select>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-checkbox v-model="input.isMainContributor" :label="$t('mainContributorLabel')" @click="sendContentToParent"></v-checkbox>
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

export default defineComponent({
    name: "PersonPublicationContribution",
    components: {PersonContributionBase},
    emits: ["setInput"],
    setup(_, {emit}) {
        const inputs = ref<any[]>([{contributionType:  DocumentContributionType.AUTHOR, isMainContributor: true}]);

        const i18n = useI18n();

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
            inputs.value = [{contribution: {}, contributionType:  DocumentContributionType.AUTHOR, isMainContributor: true}];
        };

        const sendContentToParent = () => {
            const returnObject: PersonDocumentContribution[] = [];
            inputs.value.forEach((input, index) => {
                returnObject.push({contributionDescription: input.contribution.description,
                                    personId: input.contribution.personId,
                                    displayAffiliationStatement: input.contribution.affiliationStatement,
                                    orderNumber: index + 1,
                                    contributionType: input.contributionType,
                                    isMainContributor: input.isMainContributor,
                                    isCorrespondingContributor: !input.isMainContributor});
            });
            emit("setInput", returnObject);
        };

        return {inputs, addInput, removeInput, contributionTypes, sendContentToParent, clearInput}
    }
});
</script>
