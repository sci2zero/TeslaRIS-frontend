<template>
    <v-row justify="start">
        <v-dialog v-model="dialog" :persistent="edited" max-width="900px" @click:outside="onClickOutside" @keydown.esc="onClickOutside">
            <template #activator="scope">
                <div v-if="!readOnly" class="edit-pen">
                    <v-btn
                        icon variant="outlined"
                        color="grey-lighten" v-bind="scope.props" class="bottom-spacer"
                        :disabled="readOnly" size="small">
                        <v-icon size="x-large" icon="mdi-file-edit-outline"></v-icon>
                    </v-btn>
                </div>
            </template>
            <v-card
                ref="cardRef"
                @pointerdown.capture="onPointerDown"
                @keydown.capture="onKeyDown"
                @input.capture="onFieldEvent"
                @change.capture="onFieldEvent"
            >
                <v-card-title>
                    <span class="text-h5">{{ $t("updateOURelationLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <organisation-unit-relation-update-form ref="updateFormRef" :relations="relations" :source-o-u="sourceOU" @update="emitToParent" />
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn color="blue darken-1" :disabled="!updateFormRef?.isFormValid" @click="updateFormRef?.updateOURelations()">
                        {{ $t("updateLabel") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <persistent-question-dialog
            v-model="confirmClose"
            :title="$t('areYouSureLabel')"
            :message="$t('unsavedChangesMessage')"
            :cancel-text="$t('keepEditingLabel')"
            :continue-text="$t('closeLabel')"
            emphasize-cancel
            @continue="discardChanges"
        />
    </v-row>
</template>

<script lang="ts">
import { ref } from "vue";
import { defineComponent } from "vue";
import type { PropType } from "vue";
import OrganisationUnitRelationUpdateForm from "./OrganisationUnitRelationUpdateForm.vue";
import { usePersistentWhenEdited } from "@/composables/usePersistentWhenEdited";
import PersistentQuestionDialog from "@/components/core/comparators/PersistentQuestionDialog.vue";
import type { OrganisationUnitRelationResponse, OrganisationUnitRelationRequest, OrganisationUnitResponse } from "@/models/OrganisationUnitModel";


export default defineComponent({
    name: "OrganisationUnitRelationUpdateModal",
    components: { OrganisationUnitRelationUpdateForm, PersistentQuestionDialog },
    props: {
        readOnly: {
            type: Boolean,
            default: false
        },
        sourceOU: {
            type: Object as PropType<OrganisationUnitResponse | undefined>,
            required: true
        },
        relations: {
            type: Object as PropType<OrganisationUnitRelationResponse[] | undefined>,
            required: true
        }
    },
    emits: ["update"],
    setup(_, { emit }) {
        const dialog = ref(false);
        const cardRef = ref<{ $el?: HTMLElement } | null>(null);
        const { edited, confirmClose, onPointerDown, onKeyDown, onFieldEvent, onClickOutside, discardChanges } = usePersistentWhenEdited(
            dialog,
            () => cardRef.value?.$el ?? null
        );

        const updateFormRef = ref<typeof OrganisationUnitRelationUpdateForm>();

        const emitToParent = (organisationUnitRelations: OrganisationUnitRelationRequest[], toDelete: number[]) => {
            emit("update", organisationUnitRelations, toDelete)
            dialog.value = false;
        };

        return {dialog, cardRef, edited, confirmClose, onPointerDown, onKeyDown, onFieldEvent, onClickOutside, discardChanges, updateFormRef, emitToParent};
    }
});
</script>
