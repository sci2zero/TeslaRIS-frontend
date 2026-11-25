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
                        {{ $t("addLanguageKnowledgeLabel") }}
                    </v-btn>
                    <v-btn
                        v-else-if="!readOnly"
                        v-bind="scope.props"
                        icon="mdi-pencil-outline" variant="text" color="primary" size="small"
                        :aria-label="$t('updateLanguageKnowledgeLabel')"
                        :title="$t('updateLanguageKnowledgeLabel')" />
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
                    <span class="text-lg font-semibold text-slate-800">{{ edit ? $t("updateLanguageKnowledgeLabel") : $t("addLanguageKnowledgeLabel") }}</span>
                </v-card-title>
                <v-card-text class="pt-2">
                    <div class="py-2">
                        <language-knowledge-form
                            ref="formRef" :edit="edit"
                            :preset-language-knowledge="presetLanguageKnowledge"
                            :mother-tongue-taken="motherTongueTaken"
                            @create="emitCreateToParent"
                            @update="emitUpdateToParent" />
                    </div>
                </v-card-text>
                <v-card-actions class="border-t border-slate-100 px-6 py-4">
                    <v-spacer />
                    <v-btn variant="text" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn color="primary" variant="flat" :disabled="!formRef?.isFormValid" @click="formRef?.saveLanguageKnowledge()">
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
import { defineComponent, type PropType, ref } from "vue";
import LanguageKnowledgeForm from "./LanguageKnowledgeForm.vue";
import { usePersistentWhenEdited } from "@/composables/usePersistentWhenEdited";
import PersistentQuestionDialog from "@/components/core/comparators/PersistentQuestionDialog.vue";
import type { LanguageKnowledge, LanguageKnowledgeResponse } from "@/models/PersonModel";


export default defineComponent({
    name: "LanguageKnowledgeModal",
    components: { LanguageKnowledgeForm, PersistentQuestionDialog },
    props: {
        edit: {
            type: Boolean,
            default: false
        },
        readOnly: {
            type: Boolean,
            default: false
        },
        presetLanguageKnowledge: {
            type: Object as PropType<LanguageKnowledgeResponse | undefined>,
            default: undefined
        },
        motherTongueTaken: {
            type: Boolean,
            default: false
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

        const formRef = ref<typeof LanguageKnowledgeForm>();

        const emitUpdateToParent = (languageKnowledge: LanguageKnowledge) => {
            emit("update", languageKnowledge);
            dialog.value = false;
        };

        const emitCreateToParent = (languageKnowledge: LanguageKnowledge) => {
            emit("create", languageKnowledge);
            dialog.value = false;
        };

        return {dialog, cardRef, edited, confirmClose, onPointerDown, onKeyDown, onFieldEvent, onClickOutside, discardChanges, formRef, emitCreateToParent, emitUpdateToParent};
    }
});
</script>
