<template>
    <v-row justify="start">
        <v-dialog v-model="dialog" persistent max-width="800px">
            <template #activator="scope">
                <div v-if="!readOnly" class="edit-pen">
                    <v-btn
                        icon variant="outlined"
                        color="grey-lighten" v-bind="scope.props" class="bottom-spacer"
                        size="small" v-on="scope.isActive">
                        <v-icon size="x-large" icon="mdi-file-edit-outline" />
                    </v-btn>
                </div>
            </template>
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ $t("updateContributionsLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-form v-model="isFormValid" @submit.prevent>
                        <v-container>
                            <person-funding-call-contribution-form
                                ref="updateFormRef"
                                :preset-contributions="presetFundingCallContributions"
                                is-update
                                :lock-contribution-type="lockContributionType"
                                @set-input="contributions = $event"
                            />
                        </v-container>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn color="blue darken-1" :disabled="!isFormValid" @click="emitToParent">
                        {{ $t("updateLabel") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-row>
</template>

<script lang="ts">
import { ref } from "vue";
import { defineComponent } from "vue";
import type { PropType } from "vue";
import type { FundingCallContributionType, PersonFundingCallContribution } from "@/models/FundingCallModel";
import PersonFundingCallContributionForm from "./PersonFundingCallContributionForm.vue";


export default defineComponent({
    name: "FundingCallContributionUpdateModal",
    components: { PersonFundingCallContributionForm },
    props: {
        readOnly: {
            type: Boolean,
            default: false
        },
        presetFundingCallContributions: {
            type: Object as PropType<PersonFundingCallContribution[]>,
            required: true
        },
        lockContributionType: {
            type: Object as PropType<FundingCallContributionType[] | undefined>,
            default: undefined
        }
    },
    emits: ["update"],
    setup(_, { emit }) {
        const isFormValid = ref(false);

        const dialog = ref(false);

        const contributions = ref<any[]>([]);

        const updateFormRef = ref<typeof PersonFundingCallContributionForm>();

        const emitToParent = () => {
            const personFundingCallContributions: PersonFundingCallContribution[] = [];

            contributions.value.forEach(contribution => {
                personFundingCallContributions.push({
                    personId: contribution.personId,
                    contributionDescription: contribution.contributionDescription,
                    orderNumber: contribution.orderNumber,
                    institutionIds: contribution.institutionIds,
                    displayAffiliationStatement: contribution.displayAffiliationStatement,
                    personName: {
                                    firstname: contribution.personName.firstname,
                                    otherName: contribution.personName.otherName,
                                    lastname: contribution.personName.lastname
                                },
                    contributionType: contribution.contributionType,
                    dateFrom: contribution.dateFrom,
                    dateTo: contribution.dateTo,
                    researchAreasId: contribution.researchAreasId
                });

            });
            emit("update", personFundingCallContributions);
            dialog.value = false;
        };

        return {dialog, updateFormRef, emitToParent, contributions, isFormValid};
    }
});
</script>
