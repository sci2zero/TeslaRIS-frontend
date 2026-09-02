<template>
    <h2 v-if="title" class="text-2xl font-bold mb-4">
        {{ title }}
    </h2>

    <div class="flex justify-between mb-2">
        <div class="flex items-center gap-2">
            <div v-if="showActionMenu" class="action-menu-container">
                <v-menu offset-y>
                    <template #activator="{ props: menuProps }">
                        <v-btn
                            v-bind="menuProps"
                            color="white"
                            variant="elevated"
                            height="48"
                            prepend-icon="mdi-dots-vertical"
                            class="action-menu-trigger"
                        >
                            {{ $t("actions") }} ({{ selectedCount }})
                        </v-btn>
                    </template>

                    <v-list class="action-menu-list" density="compact">
                        <slot name="action-items" />
                    </v-list>
                </v-menu>
            </div>
            <div v-if="$slots['top-left']" :class="[selectedCount > 0 ? 'w-[19.25rem]' : 'w-[28rem]']">
                <slot name="top-left" />
            </div>
        </div>
        <div class="flex items-center gap-2">
            <slot name="actions" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from "vue";

const props = withDefaults(defineProps<{
    title?: string;
    selectedCount?: number;
    canAct?: boolean;
}>(), {
    title: "",
    selectedCount: 0,
    canAct: true
});

const slots = useSlots();

const showActionMenu = computed(
    () => props.canAct && props.selectedCount > 0 && !!slots["action-items"]
);
</script>

<style scoped>
.action-menu-container {
    display: flex;
    justify-content: flex-start;
}

.action-menu-trigger {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);
}

.action-menu-list {
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    border: 1px solid rgba(0, 0, 0, 0.08);
}

:slotted(.action-menu-item) {
    border-radius: 6px;
    margin: 2px 4px;
    transition: all 0.2s ease;
}

:slotted(.action-menu-item):hover {
    background-color: rgba(25, 118, 210, 0.08);
}
</style>
