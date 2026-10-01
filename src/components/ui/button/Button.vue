<template>
    <button
        v-bind="inheritedAttrs"
        :type="type"
        :disabled="isDisabled"
        :aria-busy="loading || undefined"
        :class="buttonClass"
    >
        <span
            v-if="loading"
            class="mdi mdi-loading animate-spin"
            aria-hidden="true"
        />
        <slot />
    </button>
</template>

<script setup lang="ts">
import { computed, useAttrs } from "vue";
import type { ButtonSize, ButtonVariant } from "./types";

interface Props {
    variant?: ButtonVariant;
    size?: ButtonSize;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    loading?: boolean;
    block?: boolean;
}

defineOptions({
    name: "UiButton",
    inheritAttrs: false,
});

const props = withDefaults(defineProps<Props>(), {
    variant: "primary",
    size: "md",
    type: "button",
    disabled: false,
    loading: false,
    block: false,
});

const attrs = useAttrs();

const inheritedAttrs = computed(() => {
    const { class: _class, ...rest } = attrs;
    return rest;
});

const isDisabled = computed(() => props.disabled || props.loading);

const baseClass =
    "inline-flex items-center justify-center gap-2 font-medium rounded-lg whitespace-nowrap " +
    "transition-all duration-200 select-none cursor-pointer " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 " +
    "disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:transform-none";

const variantClass: Record<ButtonVariant, string> = {
    primary:
        "bg-slate-800 text-white shadow-md hover:bg-slate-700 hover:shadow-lg hover:-translate-y-0.5",
    secondary:
        "bg-slate-100 text-slate-800 shadow-sm hover:bg-slate-200 hover:shadow-md hover:-translate-y-0.5",
    outline:
        "bg-white border border-slate-300 text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-400 hover:shadow-md",
    ghost:
        "bg-transparent text-slate-700 hover:bg-slate-100",
    destructive:
        "bg-red-600 text-white shadow-md hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5",
    link:
        "bg-transparent text-slate-800 underline-offset-4 hover:underline p-0 h-auto shadow-none",
};

const sizeClass: Record<ButtonSize, string> = {
    xs: "px-2.5 py-1 text-xs",
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
    icon: "size-10 p-0",
    "icon-sm": "size-8 p-0",
    "icon-lg": "size-12 p-0",
};

const extraClass = computed(() => attrs.class as string | undefined);

const buttonClass = computed(() => [
    baseClass,
    variantClass[props.variant],
    props.variant !== "link" ? sizeClass[props.size] : "",
    props.block ? "w-full" : "",
    extraClass.value,
]);
</script>
