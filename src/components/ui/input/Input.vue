<template>
    <div class="plain-field ui-input" :class="wrapperClass">
        <label
            v-if="label"
            class="plain-field__label"
            :for="inputId"
        >{{ label }}</label>
        <component
            :is="controlIs"
            :id="inputId"
            ref="fieldRef"
            v-bind="fieldBindings"
            :model-value="modelValue"
            class="plain-field__control"
            variant="plain"
            density="compact"
            persistent-placeholder
            :hide-details="hideDetails"
            :placeholder="computedPlaceholder"
            :aria-label="computedAriaLabel"
            :rules="rules"
            :error="error"
            :error-messages="errorMessages"
            :max-errors="maxErrors"
            :disabled="disabled"
            :readonly="readonly"
            @update:model-value="onUpdate"
        >
            <template v-for="(_, slotName) in slots" :key="slotName" #[slotName]="slotProps">
                <slot :name="slotName" v-bind="slotProps ?? {}" />
            </template>
        </component>
    </div>
</template>

<script lang="ts">
export type UiInputControl = "text" | "textarea" | "select" | "autocomplete";
export type UiValidationRule = (value: any) => true | string;

let nextId = 0;
</script>

<script setup lang="ts">
import { computed, ref, useAttrs, useSlots } from "vue";
import { VAutocomplete, VSelect, VTextField, VTextarea } from "vuetify/components";

interface Props {
    modelValue?: any;
    label?: string;
    placeholder?: string;
    control?: UiInputControl;
    rules?: UiValidationRule[];
    error?: boolean;
    errorMessages?: string | readonly string[] | null;
    maxErrors?: string | number;
    hideDetails?: boolean | "auto";
    disabled?: boolean;
    readonly?: boolean;
}

defineOptions({
    name: "UiInput",
    inheritAttrs: false,
});

const props = withDefaults(defineProps<Props>(), {
    modelValue: undefined,
    label: undefined,
    placeholder: undefined,
    control: "text",
    rules: () => [],
    error: false,
    errorMessages: undefined,
    maxErrors: 1,
    hideDetails: "auto",
    disabled: false,
    readonly: false,
});

const emit = defineEmits<{
    "update:modelValue": [value: any];
}>();

const attrs = useAttrs();
const slots = useSlots();
const fieldRef = ref<{
    validate?: () => Promise<{ valid: boolean; errors: string[] }>;
    reset?: () => void;
    resetValidation?: () => void;
} | null>(null);

const inputId = `ui-input-${++nextId}`;

const controlIs = computed(() => {
    if (props.control === "textarea") {
        return VTextarea;
    }
    if (props.control === "select") {
        return VSelect;
    }
    if (props.control === "autocomplete") {
        return VAutocomplete;
    }
    return VTextField;
});

const wrapperClass = computed(() => attrs.class as string | undefined);

const forwardedAttrs = computed(() => {
    const { class: _class, "aria-label": _ariaLabel, "menu-props": _menuProps, ...rest } = attrs;
    return rest;
});

const isMenuControl = computed(
    () => props.control === "select" || props.control === "autocomplete"
);

const isMultiple = computed(() => attrs.multiple === true || attrs.multiple === "");

const menuBindings = computed(() => {
    if (!isMenuControl.value) {
        return {};
    }

    const incoming = attrs["menu-props"];
    const incomingProps = incoming && typeof incoming === "object" ? incoming : {};

    return {
        menuProps: {
            contentClass: "plain-field__menu",
            offset: 6,
            ...incomingProps,
        },
        ...(isMultiple.value ? { chips: true, closableChips: true } : {}),
    };
});

const fieldBindings = computed(() => ({
    ...forwardedAttrs.value,
    ...menuBindings.value,
}));

const computedPlaceholder = computed(() => props.placeholder ?? "");

const computedAriaLabel = computed(
    () => (attrs["aria-label"] as string | undefined) || props.label || props.placeholder
);

const onUpdate = (value: any) => {
    emit("update:modelValue", value);
};

defineExpose({
    validate: () => fieldRef.value?.validate?.(),
    reset: () => fieldRef.value?.reset?.(),
    resetValidation: () => fieldRef.value?.resetValidation?.(),
    focus: () => (fieldRef.value as { focus?: () => void } | null)?.focus?.(),
});
</script>
