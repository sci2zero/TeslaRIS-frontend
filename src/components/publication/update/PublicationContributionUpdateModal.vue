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
                            <person-publication-contribution
                                ref="updateFormRef"
                                :preset-contributions="presetDocumentContributions"
                                :board-members-allowed="boardMembersAllowed"
                                is-update
                                @set-input="contributions = $event">
                            </person-publication-contribution>
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
import type { PersonDocumentContribution } from "@/models/PublicationModel";
import PersonPublicationContribution from "@/components/publication/PersonPublicationContribution.vue";


export default defineComponent({
    name: "PublicationContributionUpdateModal",
    components: { PersonPublicationContribution },
    props: {
        readOnly: {
            type: Boolean,
            default: false
        },
        presetDocumentContributions: {
            type: Object as PropType<PersonDocumentContribution[]>,
            required: true
        },
        boardMembersAllowed: {
            type: Boolean,
            default: false
        }
    },
    emits: ["update"],
    setup(_, { emit }) {
        const isFormValid = ref(false);

        const dialog = ref(false);

        const contributions = ref<any[]>([]);

        const updateFormRef = ref<typeof PersonPublicationContribution>();

        const emitToParent = () => {
            const personDocumentContributions: PersonDocumentContribution[] = [];

            contributions.value.forEach(contribution => {
                personDocumentContributions.push({
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
                    isMainContributor: contribution.isMainContributor,
                    isCorrespondingContributor: contribution.isCorrespondingContributor,
                    isBoardPresident: contribution.isBoardPresident,
                    employmentTitle: contribution.employmentTitle,
                    personalTitle: contribution.personalTitle
                });

            });
            emit("update", personDocumentContributions);
            dialog.value = false;
        };

        return {dialog, updateFormRef, emitToParent, contributions, isFormValid};
    }
});
</script>
