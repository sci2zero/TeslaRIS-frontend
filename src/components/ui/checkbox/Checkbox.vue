<template>
    <v-checkbox
        v-bind="forwardedAttrs"
        :model-value="modelValue"
        :label="label"
        :disabled="disabled"
        :rules="rules"
        hide-details
        density="compact"
        color="#0f172a"
        :class="['ui-checkbox', extraClass]"
        @update:model-value="onUpdate"
    >
        <template v-for="(_, slotName) in slots" :key="slotName" #[slotName]="slotProps">
            <slot :name="slotName" v-bind="slotProps ?? {}" />
        </template>
    </v-checkbox>
</template>

<script lang="ts">
export type UiCheckboxRule = (value: any) => true | string;
</script>

<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue";

interface Props {
    modelValue?: boolean | null;
    label?: string;
    disabled?: boolean;
    rules?: UiCheckboxRule[];
}

defineOptions({
    name: "UiCheckbox",
    inheritAttrs: false,
});

const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    label: undefined,
    disabled: false,
    rules: () => [],
});

const emit = defineEmits<{
    "update:modelValue": [value: boolean | null];
}>();

const attrs = useAttrs();
const slots = useSlots();

const extraClass = computed(() => attrs.class);

const forwardedAttrs = computed(() => {
    const { class: _class, ...rest } = attrs;
    return rest;
});

const onUpdate = (value: boolean | null) => {
    emit("update:modelValue", value);
};
</script>

<style scoped>
.ui-checkbox {
    margin-inline: 0;
}

.ui-checkbox :deep(.v-selection-control) {
    min-height: 2.25rem;
}

.ui-checkbox :deep(.v-label) {
    font-size: 0.9rem;
    font-weight: 500;
    color: #334155;
    opacity: 1;
}

.ui-checkbox :deep(.v-selection-control__input > .v-icon) {
    opacity: 1;
}
</style>
