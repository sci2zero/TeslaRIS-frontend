<template>
    <div :class="['generic-crud-modal', { 'contents': hideActivator || $slots.activator }]">
        <v-dialog
            v-model="dialog"
            :persistent="!guardOutsideClose || edited"
            :class="['crud-dialog', wide ? 'wide' : 'narrow']"
            @keydown.esc="onEscape"
            @click:outside="onClickOutside"
        >
            <template v-if="!hideActivator" #activator="scope">
                <slot name="activator" v-bind="scope">
                    <div v-if="isSectionUpdate && !readOnly" class="edit-pen">
                        <v-btn
                            icon variant="outlined"
                            :disabled="disabled"
                            color="grey-lighten" v-bind="scope.props" class="bottom-spacer"
                            size="small">
                            <v-icon size="x-large" icon="mdi-file-edit-outline"></v-icon>
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
                        <span class="mdi mdi-pencil-plus-outline text-xl" aria-hidden="true"></span>
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
            <div
                ref="cardRef"
                class="flex max-h-[calc(100dvh-3rem)] min-h-0 w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm"
                @pointerdown.capture="onPointerDown"
                @keydown.capture="onKeyDown"
                @input.capture="onFieldEvent"
                @change.capture="onFieldEvent"
            >
                <div class="flex shrink-0 items-center gap-3 border-b border-slate-200 px-5 pt-5 pb-4">
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
                        <span class="mdi mdi-close text-lg" aria-hidden="true"></span>
                    </UiButton>
                </div>

                <div
                    ref="bodyRef"
                    class="min-h-0 overflow-y-auto"
                    @scroll="updateScrollState"
                >
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
                </div>

                <div
                    class="crud-modal-footer flex shrink-0 justify-end gap-2 border-t border-slate-200 px-5 py-4"
                    :class="{ 'has-more': canScrollDown }"
                >
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
            </div>
        </v-dialog>
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
import { computed, nextTick, onBeforeUnmount, type PropType, ref, watch } from "vue";
import { defineComponent } from "vue";
import { UiButton } from "@/components/ui/button";
import { usePersistentWhenEdited } from "@/composables/usePersistentWhenEdited";
import PersistentQuestionDialog from "@/components/core/comparators/PersistentQuestionDialog.vue";

export default defineComponent({
    name: "GenericCrudModal",
    components: { UiButton, PersistentQuestionDialog },
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
        const cardRef = ref<HTMLElement | null>(null);
        const bodyRef = ref<HTMLElement | null>(null);
        const canScrollDown = ref(false);
        let resizeObserver: ResizeObserver | null = null;

        const updateScrollState = () => {
            const el = bodyRef.value;
            if (!el) {
                canScrollDown.value = false;
                return;
            }
            canScrollDown.value = el.scrollHeight - el.scrollTop - el.clientHeight > 8;
        };

        const observeScrollBody = () => {
            resizeObserver?.disconnect();
            const el = bodyRef.value;
            if (!el) {
                return;
            }
            updateScrollState();
            if (typeof ResizeObserver === "undefined") {
                return;
            }
            resizeObserver = new ResizeObserver(updateScrollState);
            resizeObserver.observe(el);
            if (el.firstElementChild) {
                resizeObserver.observe(el.firstElementChild);
            }
        };

        watch(dialog, (open) => {
            if (!open) {
                canScrollDown.value = false;
                resizeObserver?.disconnect();
                resizeObserver = null;
                return;
            }
            nextTick(() => {
                observeScrollBody();
                requestAnimationFrame(updateScrollState);
            });
        });

        onBeforeUnmount(() => resizeObserver?.disconnect());
        const guardOutsideClose = computed(() => props.isUpdate || props.isSectionUpdate);
        const { edited, confirmClose, onPointerDown, onKeyDown, onFieldEvent, onClickOutside, discardChanges } = usePersistentWhenEdited(
            dialog,
            () => cardRef.value,
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
            dialog, formRef, cardRef, bodyRef, canScrollDown, edited, confirmClose, guardOutsideClose,
            onPointerDown, onKeyDown, onFieldEvent, onClickOutside, discardChanges, onEscape, updateScrollState,
            emitToParent,
            emitToParentAndPersist,
            emitSelectionToParent
        };
    }
});
</script>

<style scoped>

.crud-dialog :deep(.v-overlay__content) {
    overflow: hidden;
    max-height: calc(100dvh - 3rem);
}

.crud-modal-title {
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1.25;
}

.crud-modal-footer {
    position: relative;
}

.crud-modal-footer::before {
    content: "";
    position: absolute;
    right: 0;
    bottom: 100%;
    left: 0;
    height: 1.75rem;
    pointer-events: none;
    background: linear-gradient(to top, rgba(15, 23, 42, 0.2), rgba(15, 23, 42, 0));
    opacity: 0;
    transition: opacity 0.15s ease;
}

.crud-modal-footer.has-more {
    box-shadow: 0 -8px 14px -6px rgba(15, 23, 42, 0.35);
}

.crud-modal-footer.has-more::before {
    opacity: 1;
}

@media (min-width: 640px) {
    .crud-modal-title {
        font-size: 1.5rem;
    }
}

.wide {
    width: 100%;
    max-width: 1500px;
}

.narrow {
    width: 100%;
    max-width: 700px;
}

</style>
