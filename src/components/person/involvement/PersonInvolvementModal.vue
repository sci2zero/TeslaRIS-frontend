<template>
    <v-row justify="start">
        <v-dialog
            v-model="dialog" :persistent="edited" max-width="800px" @click:outside="onClickOutside"
            @keydown.esc="onClickOutside">
            <template #activator="scope">
                <div v-if="!readOnly" class="edit-pen!">
                    <v-btn
                        v-if="!edit"
                        icon variant="outlined"
                        color="grey-lighten" v-bind="scope.props" class="bottom-spacer"
                        :disabled="readOnly" size="small">
                        <v-icon size="x-large" icon="mdi-plus" />
                    </v-btn>
                    <!-- <v-list-item
                        v-else v-bind="scope.props" :disabled="readOnly" class="inline-action">
                        <v-list-item-title>{{ $t("updateInvolvementLabel") }}</v-list-item-title>
                    </v-list-item> -->
                    <v-btn
                        v-else icon variant="outlined"
                        color="primary" v-bind="scope.props"
                        :disabled="readOnly" size="medium">
                        <v-icon size="large" icon="mdi-pen" />
                    </v-btn>
                </div>
            </template>
            <v-card
                ref="cardRef"
                class="bg-slate-100"
                @pointerdown.capture="onPointerDown"
                @keydown.capture="onKeyDown"
                @input.capture="onFieldEvent"
                @change.capture="onFieldEvent"
            >
                <v-card-title>
                    <span class="text-h5">{{ edit ? $t("updateInvolvementLabel") : $t("addInvolvementLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <person-involvement-form
                            ref="formRef" :edit="edit"
                            :preset-involvement="presetInvolvement"
                            :researcher-id="researcherId"
                            @create="emitCreateToParent"
                            @update="emitUpdateToParent"
                        />
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn
                        color="blue darken-1"
                        @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn
                        color="blue darken-1"
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
    </v-row>
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
