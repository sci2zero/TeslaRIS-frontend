<template>
    <v-card class="pa-3" variant="flat" color="grey-lighten-5">
        <v-card-text class="edit-pen-container">
            <v-row>
                <generic-crud-modal
                    class="mt-5 ml-5"
                    :form-component="CommissionRelationForm"
                    :form-props="{ sourceCommissionId: sourceCommissionId, priority: commissionRelations.length + 1 }"
                    entity-name="CommissionRelation"
                    :read-only="!canEdit"
                    @create="addNewRelation"
                />
            </v-row>
            <v-row>
                <v-col>
                    <h2 v-if="commissionRelations?.length > 0" class="mt-5">
                        {{ $t("commissionRelationsLabel") }}
                    </h2>
        
                    <draggable 
                        :list="commissionRelations" item-key="id"
                        group="commissionRelations" 
                        :disabled="false"
                        @change="handleRelationReordering"
                    >
                        <div v-for="(relation, relationIndex) in commissionRelations" :key="relation.id" class="mt-5">
                            <v-row>
                                <v-col>
                                    <div class="d-flex flex-row justify-between">
                                        <v-icon class="mt-1" icon="mdi-mouse-move-vertical"></v-icon>
                                        <h2>{{ `${$t("relationGroupLabel")} ${relationIndex + 1} - ${getResultCalculationMethodTitleFromValueAutoLocale(relation.resultCalculationMethod)}` }}</h2>
                                    </div>
                                </v-col>
                            </v-row>
                            <v-row>
                                <div class="d-flex flex-row justify-between ml-5">
                                    <generic-crud-modal
                                        :form-component="CommissionRelationForm"
                                        :form-props="{ presetRelation: relation, sourceCommissionId: sourceCommissionId, priority: relation.priority }"
                                        entity-name=""
                                        is-update
                                        :read-only="!canEdit"
                                        @update="updateExistingRelation($event, relation.id)"
                                    />
                                    <v-btn
                                        density="compact" class="bottom-spacer" :disabled="!canEdit" @click="deleteRelation(relation.id)">
                                        {{ $t("deleteLabel") }}
                                    </v-btn>
                                </div>
                            </v-row>
                            <v-row>
                                <v-list
                                    :lines="false"
                                    density="comfortable"
                                    class="bigger-font"
                                >
                                    <v-list-item
                                        v-for="(commission, commissionIndex) in relation.targetCommissions" :key="commission.id"
                                        :value="commission.id"
                                        color="grey-lighten-5"
                                    >
                                        <v-list-item-title @click="navigateToCommissionPage(commission.id)">
                                            {{ commissionIndex + 1 }}. {{ returnCurrentLocaleContent(commission.description) }}
                                        </v-list-item-title>
                                    </v-list-item>
                                </v-list>
                            </v-row>
                        </div>
                    </draggable>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { CommissionRelation, CommissionRelationResponse } from '@/models/AssessmentModel';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import { VueDraggableNext } from 'vue-draggable-next';
import { getResultCalculationMethodTitleFromValueAutoLocale } from '@/i18n/resultCalculationMethod';
import CommissionRelationForm from './CommissionRelationForm.vue';
import CommissionRelationService from '@/services/assessment/CommissionRelationService';
import { useRouter } from 'vue-router';


export default defineComponent({
    name: "CommissionRelationsView",
    components: { GenericCrudModal, draggable: VueDraggableNext },
    props: {
        commissionRelations: {
            type: Array<CommissionRelationResponse>,
            required: true
        },
        canEdit: {
            type: Boolean,
            required: false
        },
        sourceCommissionId: {
            type: Object as PropType<number | undefined>,
            required: true
        }
    },
    emits: ["update"],
    setup(props, {emit}) {
        const router = useRouter();

        const addNewRelation = (relation: CommissionRelation) => {
            CommissionRelationService.addCommissionRelation(relation).then(() => {
                emit("update");
            });
        };

        const updateExistingRelation = (relation: CommissionRelation, relationId: number) => {
            CommissionRelationService.updateCommissionRelation(relation, relationId).then(() => {
                emit("update");
            });
        };

        const deleteRelation = (relationId: number) => {
            CommissionRelationService.deleteCommissionRelation(props.sourceCommissionId as number, relationId).then(() => {
                emit("update");
            });
        };

        const handleRelationReordering = (event: any) => {
            if (event.moved) {
                CommissionRelationService.reorderCommissionRelations(
                    {oldRelationPriority: event.moved.oldIndex + 1, newRelationPriority: event.moved.newIndex + 1}, 
                    props.sourceCommissionId as number, 
                    event.moved.element.id
                ).then(() => {
                    emit("update");
                });
            }
        };

        const navigateToCommissionPage = (commissionId: number) => {
            router.push({ name: "commissionLandingPage", params: {id: commissionId} });
        };

        return {
            returnCurrentLocaleContent, CommissionRelationForm,
            getResultCalculationMethodTitleFromValueAutoLocale,
            addNewRelation, updateExistingRelation,
            handleRelationReordering, deleteRelation,
            navigateToCommissionPage
        };
    }
});
</script>

<style scoped>
.bigger-font :deep(.v-list-item-title) {
    font-size: 20px;
}
</style>
