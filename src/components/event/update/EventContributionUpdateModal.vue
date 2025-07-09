<template>
    <v-row justify="start">
        <v-dialog v-model="dialog" persistent max-width="800px">
            <template #activator="scope">
                <div v-if="!readOnly" class="edit-pen">
                    <v-btn
                        icon variant="outlined"
                        color="grey-lighten" v-bind="scope.props" class="bottom-spacer"
                        size="small" v-on="scope.isActive">
                        <v-icon size="x-large" icon="mdi-file-edit-outline"></v-icon>
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
                            <person-event-contribution-form
                                ref="updateFormRef"
                                :preset-contributions="presetEventContributions"
                                :lock-contribution-type="lockContributionType"
                                is-update
                                @set-input="contributions = $event"
                            />
                        </v-container>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
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
import type { EventContributionType, PersonEventContribution } from "@/models/EventModel";
import PersonEventContributionForm from "../PersonEventContributionForm.vue";


export default defineComponent({
    name: "EventContributionUpdateModal",
    components: { PersonEventContributionForm },
    props: {
        readOnly: {
            type: Boolean,
            default: false
        },
        presetEventContributions: {
            type: Object as PropType<PersonEventContribution[]>,
            required: true
        },
        lockContributionType: {
            type: Object as PropType<EventContributionType | undefined>,
            default: undefined
        }
    },
    emits: ["update"],
    setup(_, { emit }) {
        const isFormValid = ref(false);

        const dialog = ref(false);

        const contributions = ref<any[]>([]);

        const updateFormRef = ref<typeof PersonEventContributionForm>();

        const emitToParent = () => {
            const personEventContributions: PersonEventContribution[] = [];

            contributions.value.forEach(contribution => {
                personEventContributions.push({
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
                    eventContributionType: contribution.eventContributionType
                });

            });
            emit("update", personEventContributions);
            dialog.value = false;
        };

        return {dialog, updateFormRef, emitToParent, contributions, isFormValid};
    }
});
</script>
