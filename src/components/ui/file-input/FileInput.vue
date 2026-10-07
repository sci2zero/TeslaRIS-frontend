<template>
    <div class="flex w-full min-w-0 flex-col gap-1.5">
        <label v-if="label" class="plain-field__label" :for="inputId">{{ label }}</label>
        <div
            class="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-4 py-5 text-center transition-colors"
            :class="dragging
                ? 'border-slate-500 bg-slate-100'
                : 'border-slate-300 bg-slate-50 hover:border-slate-400'"
            @dragenter.prevent="onDragEnter"
            @dragover.prevent
            @dragleave.prevent="onDragLeave"
            @drop.prevent="onDrop"
        >
            <input
                :id="inputId"
                ref="inputRef"
                type="file"
                class="sr-only"
                :accept="accept"
                :disabled="disabled"
                @change="onChange"
            />

            <img
                v-if="displayPreview"
                :src="displayPreview"
                alt=""
                class="rounded-lg"
                :class="previewWide ? 'max-h-36 w-full object-cover' : 'max-h-24 w-auto object-contain'"
            />
            <div
                v-else
                class="flex size-10 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm"
            >
                <v-icon icon="mdi-image-outline" size="20" />
            </div>

            <div v-if="modelValue" class="min-w-0 max-w-full">
                <p class="truncate text-sm font-medium text-slate-800">
                    {{ modelValue.name }}
                </p>
                <p class="text-xs text-slate-500">
                    {{ formattedSize }}
                </p>
            </div>
            <p v-else class="text-sm text-slate-500">
                {{ $t("dropFileHint") }}
            </p>

            <div class="flex flex-wrap items-center justify-center gap-2">
                <ui-button type="button" variant="outline" size="sm" :disabled="disabled" @click="openPicker">
                    {{ $t("chooseFileLabel") }}
                </ui-button>
                <ui-button
                    v-if="modelValue"
                    type="button"
                    variant="ghost"
                    size="sm"
                    @click="clearSelection"
                >
                    {{ $t("clearLabel") }}
                </ui-button>
                <ui-button
                    v-else-if="showRemove"
                    type="button"
                    variant="ghost"
                    size="sm"
                    @click="emit('remove')"
                >
                    {{ removeLabel }}
                </ui-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
let nextId = 0;
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { UiButton } from "@/components/ui/button";

interface Props {
    modelValue?: File | null;
    label?: string;
    accept?: string;
    previewUrl?: string;
    previewWide?: boolean;
    showRemove?: boolean;
    removeLabel?: string;
    disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: null,
    label: undefined,
    accept: undefined,
    previewUrl: "",
    previewWide: false,
    showRemove: false,
    removeLabel: "",
    disabled: false,
});

const emit = defineEmits<{
    "update:modelValue": [value: File | null];
    remove: [];
}>();

const inputId = `ui-file-input-${++nextId}`;
const inputRef = ref<HTMLInputElement | null>(null);
const dragging = ref(false);
const dragDepth = ref(0);
const objectUrl = ref<string | null>(null);

const displayPreview = computed(() => objectUrl.value || props.previewUrl || "");

const formattedSize = computed(() => formatSize(props.modelValue?.size ?? 0));

watch(() => props.modelValue, (file) => {
    if (objectUrl.value) {
        URL.revokeObjectURL(objectUrl.value);
        objectUrl.value = null;
    }
    if (file) {
        objectUrl.value = URL.createObjectURL(file);
    }
}, { immediate: true });

onBeforeUnmount(() => {
    if (objectUrl.value) {
        URL.revokeObjectURL(objectUrl.value);
    }
});

const openPicker = () => {
    inputRef.value?.click();
};

const clearSelection = () => {
    emit("update:modelValue", null);
};

const onChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    assignFile(file);
    input.value = "";
};

const onDragEnter = () => {
    dragDepth.value += 1;
    dragging.value = true;
};

const onDragLeave = () => {
    dragDepth.value -= 1;
    if (dragDepth.value <= 0) {
        dragDepth.value = 0;
        dragging.value = false;
    }
};

const onDrop = (event: DragEvent) => {
    dragDepth.value = 0;
    dragging.value = false;
    if (props.disabled) {
        return;
    }
    assignFile(event.dataTransfer?.files?.[0] ?? null);
};

const assignFile = (file: File | null) => {
    if (!file || (props.accept && !matchesAccept(file, props.accept))) {
        return;
    }
    emit("update:modelValue", file);
};

function matchesAccept(file: File, accept: string) {
    const tokens = accept.split(",").map((token) => token.trim().toLowerCase()).filter(Boolean);
    if (tokens.length === 0) {
        return true;
    }

    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();
    return tokens.some((token) => {
        if (token.startsWith(".")) {
            return name.endsWith(token);
        }
        if (token.endsWith("/*")) {
            return type.startsWith(token.slice(0, -1));
        }
        return type === token;
    });
}

function formatSize(bytes: number) {
    if (bytes < 1024) {
        return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
</script>
