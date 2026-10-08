<template>
    <div class="inline-flex shrink-0 items-center">
        <v-dialog
            v-model="dialog" :persistent="edited" scrollable max-width="800px"
            @click:outside="onClickOutside" @keydown.esc="onClickOutside">
            <template #activator="scope">
                <slot name="activator" v-bind="scope">
                    <v-btn
                        v-if="!readOnly && !edit"
                        v-bind="scope.props"
                        variant="outlined" size="small" class="text-none"
                        prepend-icon="mdi-plus">
                        {{ $t("addInvolvementLabel") }}
                    </v-btn>
                    <v-btn
                        v-else-if="!readOnly"
                        v-bind="scope.props"
                        icon="mdi-pencil-outline" variant="text" color="primary" size="small"
                        :aria-label="$t('updateInvolvementLabel')"
                        :title="$t('updateInvolvementLabel')" />
                </slot>
            </template>
            <v-card
                ref="cardRef"
                @pointerdown.capture="onPointerDown"
                @keydown.capture="onKeyDown"
                @input.capture="onFieldEvent"
                @change.capture="onFieldEvent"
            >
                <v-card-title class="px-6 pt-5 pb-2 whitespace-normal!">
                    <span class="text-lg font-semibold text-slate-800">{{ edit ? $t("updateInvolvementLabel") : $t("addInvolvementLabel") }}</span>
                </v-card-title>
                <v-card-text class="pt-2">
                    <div class="py-2">
                        <person-involvement-form
                            ref="formRef" :edit="edit"
                            :preset-involvement="presetInvolvement"
                            :researcher-id="researcherId"
                            @create="emitCreateToParent"
                            @update="emitUpdateToParent"
                        />
                    </div>
                </v-card-text>
                <v-card-actions class="border-t border-slate-100 px-6 py-4">
                    <v-spacer />
                    <v-btn
                        variant="text"
                        @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn
                        color="primary" variant="flat"
                        :disabled="!formRef?.isFormValid"
                        @click="formRef?.saveInvolvement()">
                        {{ edit ? $t("updateLabel") : $t("saveLabel") }}
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
    </div>
</template>

<script lang="ts">
import { ref } from "vue";
import { defineComponent } from "vue";
import type { PropType } from "vue";
import PersonInvolvementForm from "./PersonInvolvementForm.vue";
import { usePersistentWhenEdited } from "@/composables/usePersistentWhenEdited";
import PersistentQuestionDialog from "@/components/core/comparators/PersistentQuestionDialog.vue";
import type { Education, Employment, Membership } from "@/models/InvolvementModel";


export default defineComponent({
    name: "PersonInvolvementModal",
    components: { PersonInvolvementForm, PersistentQuestionDialog },
    props: {
        edit: {
            type: Boolean,
            default: false
        },
        readOnly: {
            type: Boolean,
            default: false
        },
        presetInvolvement: {
            type: Object as PropType<Education | Membership | Employment | undefined>,
            default: undefined
        },
        researcherId: {
            type: Number,
            default: null
        }
    },
    emits: ["update", "create"],
    setup(_, { emit }) {
        const dialog = ref(false);
        const cardRef = ref<{ $el?: HTMLElement } | null>(null);
        const { edited, confirmClose, onPointerDown, onKeyDown, onFieldEvent, onClickOutside, discardChanges } = usePersistentWhenEdited(
            dialog,
            () => cardRef.value?.$el ?? null
        );

        const formRef = ref<typeof PersonInvolvementForm>();

        const emitUpdateToParent = (involvement: Education | Membership | Employment) => {
            emit("update", involvement)
            dialog.value = false;
        };

        const emitCreateToParent = (involvement: Education | Membership | Employment) => {
            emit("create", involvement)
            dialog.value = false;
        };

        return {
            dialog, cardRef, edited, confirmClose, onPointerDown, onKeyDown, onFieldEvent, onClickOutside, discardChanges, formRef,
            emitCreateToParent,
            emitUpdateToParent
        };
    }
});
</script>
