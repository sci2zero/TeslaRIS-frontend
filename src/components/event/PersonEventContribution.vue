<template>
    <v-container v-for="(input, index) in inputs" :key="index" class="bg-blue-grey-lighten-5" style="margin-bottom: 20px;">
        <v-row>
            <v-col cols="10">
                <person-contribution-base @set-input="input.contribution = $event"></person-contribution-base>
            </v-col>
            <v-col cols="2">
                <v-col>
                    <v-btn v-show="inputs.length > 1" icon @click="removeInput(index)">
                        -
                    </v-btn>
                    <v-btn v-show="index === inputs.length - 1" icon @click="addInput">
                        +
                    </v-btn>
                </v-col>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-select
                    v-model="input.contributionType"
                    :items="contributionTypes"
                    :label="$t('contributionTypeLabel')">
                </v-select>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { ref } from "vue";
import { defineComponent } from "vue";
import { EventContributionType } from "@/models/EventModel";
import { useI18n } from "vue-i18n";
import { computed } from "vue";
import PersonContributionBase from "../core/PersonContributionBase.vue";

export default defineComponent({
    name: "PersonEventContribution",
    components: {PersonContributionBase},
    setup() {
        const inputs = ref<any[]>([{}]);

        const i18n = useI18n();

        const contributionTypesEn = [
            {title: "Organization Board Chair", value: EventContributionType.ORGANIZATION_BOARD_CHAIR},
            {title: "Organization Board Members", value: EventContributionType.ORGANIZATION_BOARD_MEMBER},
            {title: "Panelists", value: EventContributionType.PANELISTS},
            {title: "Audience", value: EventContributionType.AUDIENCE},
            {title: "Programme Board Member", value: EventContributionType.PROGRAMME_BOARD_MEMBER},
            {title: "Reviewer", value: EventContributionType.REVIEWER},
            {title: "Speaker", value: EventContributionType.SPEAKER},
            {title: "Chair", value: EventContributionType.CHAIR},
            {title: "Demonstrator", value: EventContributionType.DEMONSTRATOR},
        ]

        const contributionTypesSr = [
            { title: "Predsednik Organizacionog Odbora", value: EventContributionType.ORGANIZATION_BOARD_CHAIR },
            { title: "Član Organizacionog Odbora", value: EventContributionType.ORGANIZATION_BOARD_MEMBER },
            { title: "Panelist", value: EventContributionType.PANELISTS },
            { title: "Publika", value: EventContributionType.AUDIENCE },
            { title: "Član Programskog Odbora", value: EventContributionType.PROGRAMME_BOARD_MEMBER },
            { title: "Recenzent", value: EventContributionType.REVIEWER },
            { title: "Govornik", value: EventContributionType.SPEAKER },
            { title: "Član Odbora", value: EventContributionType.CHAIR },
            { title: "Demonstrator", value: EventContributionType.DEMONSTRATOR },
        ];

        const contributionTypes = computed(() => i18n.locale.value === "sr" ? contributionTypesSr : contributionTypesEn);

        const addInput = () => {
            inputs.value.push({});
        };

        const removeInput = (index: number) => {
            inputs.value.splice(index, 1);
        };

        return {inputs, addInput, removeInput, contributionTypes}
    }
});
</script>
