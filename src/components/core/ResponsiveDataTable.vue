<template>
    <div>
        <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div class="flex flex-wrap items-center gap-2 min-w-0 w-full sm:w-auto sm:flex-1">
                <Teleport to="body" :disabled="!isPhone">
                    <div
                        v-if="hasSelectionMenu && selected.length > 0"
                        :class="isPhone ? 'responsive-table-actions-dock' : 'action-menu-container'"
                    >
                        <v-menu :location="isPhone ? 'top' : 'bottom'" offset-y>
                            <template #activator="{ props: menuProps }">
                                <v-btn
                                    v-bind="menuProps"
                                    color="white"
                                    variant="elevated"
                                    height="48"
                                    prepend-icon="mdi-dots-vertical"
                                    class="action-menu-trigger"
                                >
                                    {{ $t("actions") }} ({{ selected.length }})
                                </v-btn>
                            </template>
                            <v-list class="action-menu-list" density="compact">
                                <slot name="selection-menu"></slot>
                            </v-list>
                        </v-menu>
                    </div>
                </Teleport>
                <div v-if="$slots['top-left']" class="min-w-0 w-full basis-full sm:basis-auto sm:flex-1 sm:max-w-3xl">
                    <slot name="top-left"></slot>
                </div>
            </div>
            <div class="flex flex-wrap items-center gap-2">
                <slot name="actions"></slot>
            </div>
        </div>

        <div
            ref="tableWrapper"
            :class="[
                containerClass,
                showCompact ? 'responsive-data-table--compact' : 'overflow-x-auto',
                isPhone && selected.length > 0 ? 'pb-28' : ''
            ]"
        >
            <div v-if="showCompact">
                <div
                    v-if="hasFilterSlot || sortColumns.length > 0"
                    class="flex items-center justify-between gap-2 px-3 py-2 border-b border-gray-200"
                >
                    <v-menu v-if="hasFilterSlot" :close-on-content-click="false">
                        <template #activator="{ props: menuProps }">
                            <v-btn
                                v-bind="menuProps"
                                icon
                                variant="text"
                                size="small"
                                :title="hasActiveFilters ? $t('filterActiveLabel') : $t('filterLabel')"
                            >
                                <v-icon :color="hasActiveFilters ? 'primary' : undefined">
                                    mdi-filter
                                </v-icon>
                            </v-btn>
                        </template>
                        <div class="p-3 bg-white rounded-lg shadow-lg">
                            <slot name="filter" :column="filterColumn"></slot>
                        </div>
                    </v-menu>
                    <span v-else></span>
                    <v-menu v-if="sortColumns.length > 0">
                        <template #activator="{ props: menuProps }">
                            <v-btn
                                v-bind="menuProps"
                                variant="text"
                                size="small"
                                :prepend-icon="currentSortIcon"
                            >
                                {{ currentSortTitle || $t("sortByLabel") }}
                            </v-btn>
                        </template>
                        <v-list density="compact" class="action-menu-list min-w-48">
                            <v-list-item
                                v-for="column in sortColumns"
                                :key="resolveHeaderValue(column.key)"
                                :active="isColumnSorted(column)"
                                @click="toggleColumnSort(column)"
                            >
                                <v-list-item-title>{{ resolveHeaderValue(column.title) }}</v-list-item-title>
                                <template #append>
                                    <v-icon v-if="isColumnSorted(column)" size="18">
                                        {{ currentSort?.order === 'desc' ? 'mdi-arrow-down' : 'mdi-arrow-up' }}
                                    </v-icon>
                                </template>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </div>
                <div v-if="items.length === 0">
                    <slot name="empty">
                        <p class="text-center py-8 text-gray-600">
                            {{ $t("noDataInTableMessage") }}
                        </p>
                    </slot>
                </div>
                <VueDraggableNext
                    v-else
                    :list="items"
                    class="divide-y divide-gray-200"
                    :disabled="!inComparator"
                    :group="draggableGroup"
                    handle=".handle"
                    @change="$emit('dragged', $event)"
                >
                    <div
                        v-for="item in items"
                        :key="item[itemKey]"
                        class="handle"
                    >
                        <slot
                            name="compact-item"
                            :item="item"
                            :selected="selected"
                            :show-select="showSelect"
                        ></slot>
                    </div>
                </VueDraggableNext>
            </div>

            <v-data-table-server
                v-model="selected"
                :sort-by="sortBy"
                :items="items"
                :headers="headers"
                item-value="row"
                :items-length="itemsLength"
                :show-select="showSelect"
                return-object
                :items-per-page-text="$t('itemsPerPageLabel')"
                :items-per-page-options="itemsPerPageOptions"
                :page="page"
                :class="tableClass"
                @update:options="$emit('update:options', $event)"
            >
                <template
                    v-for="slotName in headerSlotNames"
                    :key="slotName"
                    #[slotName]="scope"
                >
                    <slot :name="slotName" v-bind="scope"></slot>
                </template>
                <template
                    v-if="filterHeaderKey && hasFilterSlot && !headerSlotNames.includes('header.' + filterHeaderKey)"
                    #[`header.${filterHeaderKey}`]="{ isSorted, column, toggleSort, getSortIcon }"
                >
                    <div class="group flex items-center gap-2" @click="toggleSort(column)">
                        <span>{{ column.title }}</span>
                        <v-menu v-if="!showCompact" :close-on-content-click="false">
                            <template #activator="{ props: menuProps }">
                                <v-icon
                                    v-bind="menuProps"
                                    :title="hasActiveFilters ? $t('filterActiveLabel') : $t('filterLabel')"
                                    :class="hasActiveFilters ? 'ml-1 text-primary cursor-pointer hover:text-primary-darken-1' : 'ml-1 text-gray-400 cursor-pointer hover:text-gray-600'"
                                    icon="mdi-filter"
                                    @click.stop
                                ></v-icon>
                            </template>
                            <div class="p-3 bg-white rounded-lg shadow-lg">
                                <slot name="filter" :column="column"></slot>
                            </div>
                        </v-menu>
                        <v-icon :class="[isSorted(column) ? 'opacity-100' : 'opacity-0 group-hover:opacity-50']" :icon="getSortIcon(column)"></v-icon>
                    </div>
                </template>
                <template #body="properties">
                    <VueDraggableNext
                        :list="(properties.items as unknown as any[])"
                        tag="tbody"
                        :disabled="!inComparator || showCompact"
                        :group="draggableGroup"
                        handle=".handle"
                        @change="$emit('dragged', $event)"
                    >
                        <tr v-if="properties.items?.length === 0">
                            <td colspan="12" class="text-center">
                                <slot name="empty">
                                    <p>{{ $t("noDataInTableMessage") }}</p>
                                </slot>
                            </td>
                        </tr>
                        <template v-for="item in properties.items" :key="item[itemKey]">
                            <slot
                                name="row"
                                :item="item"
                                :selected="selected"
                                :show-select="showSelect"
                            ></slot>
                        </template>
                    </VueDraggableNext>
                </template>
            </v-data-table-server>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, useSlots, watch } from "vue";
import { VueDraggableNext } from "vue-draggable-next";
import { resolveHeaderValue, useResponsiveTable } from "@/composables/useResponsiveTable";

const props = withDefaults(defineProps<{
    items: any[];
    headers: any[];
    extraSortHeaders?: any[];
    itemsLength: number;
    modelValue?: any[];
    showSelect?: boolean;
    page?: number;
    itemsPerPage?: number;
    itemsPerPageOptions?: number[];
    sortBy?: { key: string; order: string }[];
    inComparator?: boolean;
    draggableGroup?: string;
    itemKey?: string;
    hasActiveFilters?: boolean;
    filterHeaderKey?: string;
    tableClass?: string;
    containerClass?: string;
}>(), {
    extraSortHeaders: () => [],
    modelValue: () => [],
    showSelect: false,
    page: 1,
    itemsPerPage: 10,
    itemsPerPageOptions: () => [5, 10, 25, 50],
    sortBy: () => [],
    inComparator: false,
    draggableGroup: "items",
    itemKey: "id",
    hasActiveFilters: false,
    filterHeaderKey: "",
    tableClass: "",
    containerClass: "bg-white rounded-xl shadow-sm border border-gray-100"
});

const emit = defineEmits<{
    "update:modelValue": [value: any[]];
    "update:options": [value: any];
    dragged: [value: any];
}>();

const slots = useSlots();
const { isCompact, isPhone } = useResponsiveTable();
const tableWrapper = ref<HTMLElement | null>(null);

const selected = computed({
    get: () => props.modelValue,
    set: (value: any[]) => emit("update:modelValue", value)
});

const hasFilterSlot = computed(() => Boolean(slots.filter));
const hasSelectionMenu = computed(() => Boolean(slots["selection-menu"]));
const hasCompactItem = computed(() => Boolean(slots["compact-item"]));
const showCompact = computed(() => isCompact.value && hasCompactItem.value);

const headerSlotNames = computed(() => Object.keys(slots).filter((name) => name.startsWith("header.")));

const filterColumn = computed(() =>
    props.headers.find((header) => resolveHeaderValue(header?.key) === props.filterHeaderKey)
);

const sortColumns = computed(() => {
    const combined = [...props.headers, ...props.extraSortHeaders];
    const seen = new Set<string>();

    return combined.filter((header) => {
        if (header?.sortable === false) {
            return false;
        }

        const key = resolveHeaderValue(header?.key);
        if (!key || seen.has(key)) {
            return false;
        }

        seen.add(key);
        return true;
    });
});

const currentSort = computed(() => props.sortBy?.[0]);

const currentSortTitle = computed(() => {
    if (!currentSort.value) {
        return "";
    }

    const match = sortColumns.value.find((column) => resolveHeaderValue(column.key) === currentSort.value.key);
    return match ? resolveHeaderValue(match.title) : "";
});

const currentSortIcon = computed(() => {
    if (!currentSort.value) {
        return "mdi-sort";
    }

    return currentSort.value.order === "desc" ? "mdi-sort-descending" : "mdi-sort-ascending";
});

const isColumnSorted = (column: any) => resolveHeaderValue(column.key) === currentSort.value?.key;

const defaultOrderFor = (column: any) => {
    if (column.defaultOrder === "asc" || column.defaultOrder === "desc") {
        return column.defaultOrder;
    }

    return resolveHeaderValue(column.key) === "year" ? "desc" : "asc";
};

const toggleColumnSort = (column: any) => {
    const key = resolveHeaderValue(column.key);
    const current = currentSort.value;
    const order = current?.key === key
        ? (current.order === "desc" ? "asc" : "desc")
        : defaultOrderFor(column);

    emit("update:options", {
        page: props.page,
        itemsPerPage: props.itemsPerPage,
        sortBy: [{ key, order }]
    });
};

const hoistDraggableTbody = () => {
    nextTick(() => {
        const table = tableWrapper.value;
        const sortableTbody = table?.querySelector(".v-table__wrapper > table > tbody > tbody");
        const tbody = table?.querySelector(".v-table__wrapper > table > tbody");
        if (sortableTbody && tbody && sortableTbody !== tbody) {
            tbody.parentNode?.append(sortableTbody);
            tbody.remove();
        }
    });
};

watch(tableWrapper, hoistDraggableTbody);
watch(() => props.items, hoistDraggableTbody);
</script>

<style scoped>
.action-menu-trigger {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);
}

.action-menu-list {
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    border: 1px solid rgba(0, 0, 0, 0.08);
}

.responsive-data-table--compact :deep(.v-table__wrapper) {
    display: none;
}

.responsive-data-table--compact :deep(.v-data-table-footer) {
    border-top: 1px solid rgb(229 231 235);
}

.responsive-table-actions-dock {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 40;
    display: flex;
    justify-content: center;
    padding: 2.5rem 1rem calc(1rem + env(safe-area-inset-bottom, 0px));
    background: linear-gradient(
        to top,
        rgb(241 245 249) 0%,
        rgba(241, 245, 249, 0.96) 42%,
        rgba(241, 245, 249, 0.55) 72%,
        rgba(241, 245, 249, 0) 100%
    );
    pointer-events: none;
}

.responsive-table-actions-dock :deep(.v-btn),
.responsive-table-actions-dock :deep(.v-overlay__content) {
    pointer-events: auto;
}
</style>
