<template>
    <v-dialog v-model="dialog" persistent scrollable max-width="960px">
        <template #activator="scope">
            <slot name="activator" v-bind="scope">
                <div v-if="!readOnly" class="edit-pen">
                    <v-btn
                        icon
                        variant="outlined"
                        color="grey-lighten"
                        v-bind="scope.props"
                        class="bottom-spacer"
                        size="small">
                        <v-icon size="x-large" icon="mdi-file-edit-outline"></v-icon>
                    </v-btn>
                </div>
            </slot>
        </template>
        <v-card>
            <v-card-title class="pb-1">
                <span class="text-h5">{{ $t("updateContributionsLabel") }}</span>
            </v-card-title>
            <v-card-text class="pt-2">
                <v-form v-model="isFormValid" @submit.prevent>
                    <person-publication-contribution
                        ref="updateFormRef"
                        :preset-contributions="presetDocumentContributions"
                        :board-members-allowed="boardMembersAllowed"
                        :board-member-ids="boardMemberIds"
                        is-update
                        :limit-one="limitOne"
                        :lock-contribution-type="lockContributionType"
                        @set-input="contributions = $event">
                    </person-publication-contribution>
                </v-form>
            </v-card-text>
            <v-card-actions class="px-6 pb-4">
                <v-spacer></v-spacer>
                <v-btn variant="text" @click="dialog = false">
                    {{ $t("closeLabel") }}
                </v-btn>
                <v-btn color="primary" variant="flat" :disabled="!isFormValid" @click="emitToParent">
                    {{ $t("updateLabel") }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import { ref } from "vue";
import { defineComponent } from "vue";
import type { PropType } from "vue";
import type { DocumentContributionType, PersonDocumentContribution } from "@/models/PublicationModel";
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
        },
        lockContributionType: {
            type: Object as PropType<DocumentContributionType[] | undefined>,
            default: undefined
        },
        boardMemberIds: {
            type: Array<number>,
            default: []
        },
        limitOne: {
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
                    isBoardPresident: contribution.isBoardPresident ?? false,
                    employmentTitle: contribution.employmentTitle,
                    personalTitle: contribution.personalTitle,
                    dateFrom: contribution.dateFrom,
                    dateTo: contribution.dateTo,
                    researchAreasId: contribution.researchAreasId
                });

            });
            emit("update", personDocumentContributions);
            dialog.value = false;
        };

        return {dialog, updateFormRef, emitToParent, contributions, isFormValid};
    }
});
</script>
