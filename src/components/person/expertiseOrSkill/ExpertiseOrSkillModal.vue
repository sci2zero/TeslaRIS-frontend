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
                        {{ $t("addExpertiseOrSkillLabel") }}
                    </v-btn>
                    <v-btn
                        v-else-if="!readOnly"
                        v-bind="scope.props"
                        icon="mdi-pencil-outline" variant="text" color="primary" size="small"
                        :aria-label="$t('updateExpertiseOrSkillLabel')"
                        :title="$t('updateExpertiseOrSkillLabel')" />
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
                    <span class="text-lg font-semibold text-slate-800">{{ edit ? $t("updateExpertiseOrSkillLabel") : $t("addExpertiseOrSkillLabel") }}</span>
                </v-card-title>
                <v-card-text class="pt-2">
                    <div class="py-2">
                        <expertise-or-skill-form
                            ref="formRef" :edit="edit" :preset-expertise-or-skill="presetExpertiseOrSkill" @create="emitCreateToParent"
                            @update="emitUpdateToParent" />
                    </div>
                </v-card-text>
                <v-card-actions class="border-t border-slate-100 px-6 py-4">
                    <v-spacer />
                    <v-btn variant="text" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn color="primary" variant="flat" :disabled="!formRef?.isFormValid" @click="formRef?.saveExpertiseOrSkill()">
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
import ExpertiseOrSkillForm from "./ExpertiseOrSkillForm.vue";
import { usePersistentWhenEdited } from "@/composables/usePersistentWhenEdited";
import PersistentQuestionDialog from "@/components/core/comparators/PersistentQuestionDialog.vue";
import type { ExpertiseOrSkillResponse, ExpertiseOrSkill } from "@/models/PersonModel";


export default defineComponent({
    name: "ExpertiseOrSkillModal",
    components: { ExpertiseOrSkillForm, PersistentQuestionDialog },
    props: {
        edit: {
            type: Boolean,
            default: false
        },
        readOnly: {
            type: Boolean,
            default: false
        },
        presetExpertiseOrSkill: {
            type: Object as PropType<ExpertiseOrSkillResponse | undefined>,
            default: undefined
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

        const formRef = ref<typeof ExpertiseOrSkillForm>();

        const emitUpdateToParent = (expertiseOrSkill: ExpertiseOrSkill) => {
            emit("update", expertiseOrSkill)
            dialog.value = false;
        };

        const emitCreateToParent = (expertiseOrSkill: ExpertiseOrSkill) => {
            emit("create", expertiseOrSkill)
            dialog.value = false;
        };

        return {dialog, cardRef, edited, confirmClose, onPointerDown, onKeyDown, onFieldEvent, onClickOutside, discardChanges, formRef, emitCreateToParent, emitUpdateToParent};
    }
});
</script>
