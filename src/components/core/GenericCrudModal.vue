<template>
    <div :class="['generic-crud-modal', { 'contents': hideActivator || $slots.activator }]">
        <scrollable-dialog
            ref="dialogShell"
            v-model="dialog"
            :persistent="!guardOutsideClose || edited"
            :max-width="wide ? 1500 : 700"
            @escape="onEscape"
            @click-outside="onClickOutside"
            @pointerdown.capture="onPointerDown"
            @keydown.capture="onKeyDown"
            @input.capture="onFieldEvent"
            @change.capture="onFieldEvent"
        >
            <template v-if="!hideActivator" #activator="scope">
                <slot name="activator" v-bind="scope">
                    <div v-if="isSectionUpdate && !readOnly" class="edit-pen">
                        <v-btn
                            icon variant="outlined"
                            :disabled="disabled"
                            color="grey-lighten" v-bind="scope.props" class="bottom-spacer"
                            size="small">
                            <v-icon size="x-large" icon="mdi-file-edit-outline" />
                        </v-btn>
                    </div>
                    <UiButton
                        v-if="!isSectionUpdate && !readOnly && isSubmission"
                        variant="outline"
                        size="icon"
                        class="!size-[2.75rem] !rounded-xl shrink-0"
                        :disabled="disabled"
                        :aria-label="$t('createNew' + entityName + 'Label')"
                        v-bind="scope.props"
                    >
                        <span class="mdi mdi-pencil-plus-outline text-xl" aria-hidden="true" />
                    </UiButton>
                    <v-btn
                        v-if="!isSectionUpdate && !readOnly && !isSubmission"
                        :disabled="disabled"
                        :variant="outlined ? 'outlined' : 'elevated'"
                        :color="primaryColor ? 'primary' : ''"
                        :density="primaryColor && !compact ? 'default' : 'compact'" class="bottom-spacer" v-bind="scope.props">
                        {{ isUpdate ? $t("update" + entityName + "Label") : $t("createNew" + entityName + "Label") }}
                    </v-btn>
                </slot>
            </template>
            <template #header>
                <div class="flex items-center gap-3 px-5 pt-5 pb-4">
                    <h2 class="crud-modal-title min-w-0 flex-1 text-xl font-bold leading-tight text-slate-800 sm:text-2xl">
                        {{ isUpdate || isSectionUpdate ? $t("update" + entityName + "Label") : $t("createNew" + entityName + "Label") }}
                    </h2>
                    <UiButton
                        variant="ghost"
                        size="icon-sm"
                        class="shrink-0"
                        :aria-label="$t('closeLabel')"
                        @click="dialog = false"
                    >
                        <span class="mdi mdi-close text-lg" aria-hidden="true" />
                    </UiButton>
                </div>
            </template>

            <v-container>
                <component
                    :is="formComponent"
                    ref="formRef"
                    v-bind="formProps"
                    in-modal
                    @create="emitToParent"
                    @update="emitToParent"
                    @update-persist="emitToParentAndPersist"
                    @selected="emitSelectionToParent"
                />
            </v-container>

            <template #footer>
                <div class="flex justify-end gap-2 px-5 py-4">
                    <v-btn
                        color="blue darken-1"
                        @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn
                        v-if="!disableSubmission"
                        color="blue darken-1"
                        :disabled="!formRef?.isFormValid"
                        @click="formRef?.submit(true)">
                        {{ $t("saveLabel") }}
                    </v-btn>
                </div>
            </template>
        </scrollable-dialog>
        <persistent-question-dialog
            v-if="guardOutsideClose"
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
import { computed, type PropType, ref } from "vue";
import { defineComponent } from "vue";
import { UiButton } from "@/components/ui/button";
import { usePersistentWhenEdited } from "@/composables/usePersistentWhenEdited";
import PersistentQuestionDialog from "@/components/core/comparators/PersistentQuestionDialog.vue";
import ScrollableDialog from "@/components/core/ScrollableDialog.vue";

export default defineComponent({
    name: "GenericCrudModal",
    components: { UiButton, PersistentQuestionDialog, ScrollableDialog },
    props: {
        isUpdate: {
            type: Boolean,
            default: false
        },
        isSectionUpdate: {
            type: Boolean,
            default: false
        },
        isSubmission: {
            type: Boolean,
            default: false
        },
        readOnly: {
            type: Boolean,
            default: false
        },
        formComponent: {
            type: Object as PropType<any>,
            required: true
        },
        formProps: {
            type: Object as PropType<Record<string, any>>,
            default: () => ({})
        },
        entityName: {
            type: String,
            required: true
        },
        wide: {
            type: Boolean,
            default: false
        },
        primaryColor: {
            type: Boolean,
            default: false
        },
        disableSubmission: {
            type: Boolean,
            default: false
        },
        disabled: {
            type: Boolean,
            default: false
        },
        outlined: {
            type: Boolean,
            default: false
        },
        compact: {
            type: Boolean,
            default: false
        },
        hideActivator: {
            type: Boolean,
            default: false
        }
    },
    emits: ["create", "update", "updatePersist", "selected"],
    setup(props, { emit }) {
        const dialog = ref(false);
        const formRef = ref<InstanceType<typeof props.formComponent>>();
        const dialogShell = ref<{ getPanel: () => HTMLElement | null } | null>(null);

        const guardOutsideClose = computed(() => props.isUpdate || props.isSectionUpdate);
        const { edited, confirmClose, onPointerDown, onKeyDown, onFieldEvent, onClickOutside, discardChanges } = usePersistentWhenEdited(
            dialog,
            () => dialogShell.value?.getPanel() ?? null,
            guardOutsideClose
        );

        const onEscape = () => {
            if (guardOutsideClose.value && edited.value) {
                onClickOutside();
                return;
            }
            dialog.value = false;
        };

        const emitToParent = (formData: any) => {
            if (props.isUpdate) {
                emit("update", formData);
            } else {
                emit("create", formData);
            }
            
            dialog.value = false;
        };

        const emitSelectionToParent = (formData: any) => {
            emit("selected", formData);
            dialog.value = false;
        };

        const emitToParentAndPersist = (formData: any) => {
            emit("updatePersist", formData);
        };

        return { 
            dialog, formRef, dialogShell, edited, confirmClose, guardOutsideClose,
            onPointerDown, onKeyDown, onFieldEvent, onClickOutside, discardChanges, onEscape,
            emitToParent,
            emitToParentAndPersist,
            emitSelectionToParent
        };
    }
});
</script>

<style scoped>

.crud-modal-title {
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1.25;
}

@media (min-width: 640px) {
    .crud-modal-title {
        font-size: 1.5rem;
    }
}

</style>
