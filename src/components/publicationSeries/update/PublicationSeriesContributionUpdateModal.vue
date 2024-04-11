<template>
    <v-row justify="start">
        <v-dialog v-model="dialog" persistent max-width="800px">
            <template #activator="scope">
                <div v-if="!readOnly" class="edit-pen">
                    <v-btn
                        icon variant="outlined"
                        color="grey-lighten" v-bind="scope.props" style="margin-bottom: 20px;"
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
                            <person-publication-series-contribution-form ref="updateFormRef" :preset-contributions="presetPublicationSeriesContributions" @set-input="contributions = $event"></person-publication-series-contribution-form>
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
import type { PersonPublicationSeriesContribution } from "@/models/PublicationSeriesModel";
import PersonPublicationSeriesContributionForm from "../PersonPublicationSeriesContributionForm.vue";


export default defineComponent({
    name: "PublicationSeriesContributionUpdateModal",
    components: { PersonPublicationSeriesContributionForm },
    props: {
        readOnly: {
            type: Boolean,
            default: false
        },
        presetPublicationSeriesContributions: {
            type: Object as PropType<PersonPublicationSeriesContribution[]>,
            required: true
        }
    },
    emits: ["update"],
    setup(_, { emit }) {
        const isFormValid = ref(false);

        const dialog = ref(false);

        const contributions = ref<any[]>([]);

        const updateFormRef = ref<typeof PersonPublicationSeriesContributionForm>();

        const emitToParent = () => {
            const personPublicationSeriesContributions: PersonPublicationSeriesContribution[] = [];

            contributions.value.forEach(contribution => {
                personPublicationSeriesContributions.push({
                    personId: contribution.personId,
                    contributionDescription: contribution.contributionDescription,
                    orderNumber: contribution.orderNumber,
                    institutionIds: [],
                    displayAffiliationStatement: contribution.displayAffiliationStatement,
                    personName: {
                                    firstname: contribution.personName.firstname, 
                                    otherName: contribution.personName.otherName, 
                                    lastname: contribution.personName.lastname
                                },
                    contributionType: contribution.contributionType,
                    dateFrom: contribution.dateFrom,
                    dateTo: contribution.dateTo
                });

            });
            emit("update", personPublicationSeriesContributions);
            dialog.value = false;
        };

        return {dialog, updateFormRef, emitToParent, contributions, isFormValid};
    }
});
</script>

<style scoped>
.edit-pen-container .edit-pen {
    top: 0px;
    right: 0px;
    position: absolute;
    z-index: 10;
    opacity: 0;
}

.edit-pen-container:hover .edit-pen {
    opacity: 0.3;
}

.edit-pen-container .edit-pen:hover {
    opacity: 1;
}
</style>
