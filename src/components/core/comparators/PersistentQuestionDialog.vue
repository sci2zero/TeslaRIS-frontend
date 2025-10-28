<template>
    <div class="text-center pa-4">
        <v-dialog
            v-model="dialog"
            max-width="400"
            persistent
        >
            <v-card
                prepend-icon="mdi-alert"
                :text="message + (entityNames ? `\n\n• ${entityNames.join('\n• ')}` : '')"
                :title="title"
                class="multiline-text"
            >
                <template #actions>
                    <v-spacer></v-spacer>
  
                    <v-btn @click="cancelOperation">
                        {{ $t("cancelLabel") }}
                    </v-btn>
  
                    <v-btn @click="continueOperation">
                        {{ $t("continueLabel") }}
                    </v-btn>
                </template>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
    name: "PersistentQuestionDialog",
    props: {
        modelValue: {
            type: Boolean,
            default: false
        },
        message: {
            type: String,
            default: ""
        },
        title: {
            type: String,
            default: ""
        },
        entityNames: {
            type: Array<string>,
            default: []
        }
    },
    emits: ["continue", "update:modelValue"],
    setup(props, { emit }) {
        const dialog = ref(props.modelValue);

        watch(() => props.modelValue, (newValue) => {
            dialog.value = newValue;
        });

        watch(dialog, (newValue) => {
            emit('update:modelValue', newValue);
        });

        const cancelOperation = () => {
            dialog.value = false;
        };

        const toggle = () => {
            dialog.value = !dialog.value;
        };

        const continueOperation = () => {
            dialog.value = false;
            emit("continue");
        };

        return {
            dialog, toggle,
            cancelOperation,
            continueOperation
        };
    },
});
</script>

<style>

.multiline-text {
    white-space: pre-line;
}

</style>
