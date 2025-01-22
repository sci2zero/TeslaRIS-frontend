<template>
    <v-snackbar
        v-model="snackbar"
        :timeout="5000">
        {{ message }}
        <template #actions>
            <v-btn
                color="blue"
                variant="text"
                @click="close">
                {{ $t("closeLabel") }}
            </v-btn>
        </template>
    </v-snackbar>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue';

export default defineComponent({
    name: "UriInput",
    props: {
        modelValue: {
            type: Boolean,
            required: true,
        },
        message: {
            type: String,
            required: true
        }
    },
    emits: ["update:modelValue"],
    setup(props, {emit}) {
        const snackbar = ref<boolean>(false);

        onMounted(() => {
            snackbar.value = props.modelValue;
        });

        watch(() => props.modelValue, () => {
            if (snackbar.value !== props.modelValue) {
                snackbar.value = props.modelValue;
            }
        });

        watch(snackbar, () => {
            if (snackbar.value !== props.modelValue) {
                emit("update:modelValue", snackbar.value);
            }
        });

        const close = () => {
            emit("update:modelValue", false);
        };

        return { 
            close,
            snackbar
        };
    },
});
</script>
