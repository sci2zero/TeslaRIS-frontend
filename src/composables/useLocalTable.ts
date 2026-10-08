import { computed, ref, watch, type Ref } from "vue";

export interface LocalTableOptions {
    page: number;
    itemsPerPage: number;
    sortBy: { key: string; order: string }[];
}

// Share client-side sorting and pagination between project relation tables.
export function useLocalTable<T>(
    items: Readonly<Ref<T[]>>,
    locale: Ref<string>,
    sortValue: (item: T, key: string) => string | number | undefined,
    defaultOrder?: (a: T, b: T) => number
) {
    const tableOptions = ref<LocalTableOptions>({ page: 1, itemsPerPage: 10, sortBy: [] });
    const sortedItems = computed(() => {
        const rows = [...items.value];
        if (defaultOrder) rows.sort(defaultOrder);
        if (tableOptions.value.sortBy.length) {
            const collator = new Intl.Collator(locale.value === "sr-cyr" ? "sr-Cyrl" : locale.value);
            rows.sort((a, b) => {
                for (const sort of tableOptions.value.sortBy) {
                    const left = sortValue(a, sort.key);
                    const right = sortValue(b, sort.key);
                    // Missing dates and values stay at the end in either direction.
                    const emptyLeft = left === undefined || left === "";
                    const emptyRight = right === undefined || right === "";
                    if (emptyLeft && emptyRight) continue;
                    if (emptyLeft) return 1;
                    if (emptyRight) return -1;
                    const comparison = typeof left === "number" && typeof right === "number"
                        ? left - right : collator.compare(String(left), String(right));
                    if (comparison) return comparison * (sort.order === "desc" ? -1 : 1);
                }
                return 0;
            });
        }
        return rows;
    });
    const pagedItems = computed(() => {
        const { page, itemsPerPage } = tableOptions.value;
        if (itemsPerPage === -1) return sortedItems.value;
        const start = (page - 1) * itemsPerPage;
        return sortedItems.value.slice(start, start + itemsPerPage);
    });
    const updateTableOptions = (options: LocalTableOptions) => {
        const changed = options.itemsPerPage !== tableOptions.value.itemsPerPage
            || JSON.stringify(options.sortBy) !== JSON.stringify(tableOptions.value.sortBy);
        tableOptions.value = { ...options, page: changed ? 1 : options.page };
    };
    watch(items, () => { tableOptions.value.page = 1; });
    return { tableOptions, pagedItems, updateTableOptions };
}
