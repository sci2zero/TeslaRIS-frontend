<template>
    <div class="text-center pa-4">
        <v-dialog
            v-model="dialog"
            max-width="400"
            persistent
        >
            <v-card
                prepend-icon="mdi-alert"
                :text="message + ((entityNames && entityNames.length > 0) ? `\n\n• ${entityNames.join('\n• ')}` : '')"
                :title="title"
                class="multiline-text"
            >
                <v-card-text v-if="showRadioOptions">
                    <div class="text-subtitle-1 mb-2">
                        {{ $t("selectOptionLabel") }}
                    </div>
                    <v-radio-group v-model="selectedOption" density="compact">
                        <v-radio
                            v-for="option in radioOptions"
                            :key="option.value"
                            :label="option.title"
                            :value="option.value"
                        ></v-radio>
                    </v-radio-group>
                </v-card-text>
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
import { defineComponent, onMounted, type PropType, ref, watch } from 'vue';

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
        },
        showRadioOptions: {
            type: Boolean,
            default: false
        },
        radioOptions: {
            type: Object as PropType<{title: string, value: number}[]>,
            default: () => [] as {title: string, value: number}[]
        }
    },
    emits: ["continue", "update:modelValue"],
    setup(props, { emit }) {
        const dialog = ref(props.modelValue);

        const selectedOption = ref();

        onMounted(() => {
            setInitialRadioOption();
        });

        watch(() => props.radioOptions, () => {
            setInitialRadioOption();
        });

        const setInitialRadioOption = () => {
            if (props.radioOptions) {
                selectedOption.value = props.radioOptions[0].value;
            }
        };

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

            if (selectedOption.value) {
                emit("continue", selectedOption.value);
            } else {
                emit("continue");
            }
        };

        return {
            dialog, toggle,
            cancelOperation,
            continueOperation,
            selectedOption
        };
    },
});
</script>

<style>

.multiline-text {
    white-space: pre-line;
}

</style>
