<template>
    <v-container>
        <v-btn color="primary" @click="isExpanded = !isExpanded">
            <v-icon>{{ isExpanded ? "mdi-chevron-up" : "mdi-filter" }}</v-icon>
            {{ $t("filtersLabel") }}
        </v-btn>
  
        <v-expand-transition>
            <v-card v-show="isExpanded" class="mt-3 pa-4">
                <component
                    :is="filterComponent"
                    ref="filtersRef"
                    v-bind="filterProps"
                    in-modal
                />
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <div>
                        <v-btn color="primary" @click="applyFilters">
                            {{ $t("applyFiltersLabel") }}
                        </v-btn>
                        <v-btn v-if="showResetButton" class="ml-2" @click="resetFilters">
                            {{ $t("resetFiltersLabel") }}
                        </v-btn>
                    </div>
                </v-card-actions>
            </v-card>
        </v-expand-transition>
    </v-container>
</template>

<script lang="ts">
import { defineComponent, type PropType, ref } from "vue";


export default defineComponent({
  name: "FilterBarComponent",
  props: {
    filterComponent: {
        type: Object as PropType<any>,
        required: true
    },
    filterProps: {
        type: Object as PropType<Record<string, any>>,
        default: () => ({})
    },
    showResetButton: {
        type: Boolean,
        default: false
    }
  },
  emits: ["applyFilters", "reset"],
  setup(props, { emit }) {
    const isExpanded = ref(false);
    const filtersRef = ref<InstanceType<typeof props.filterComponent>>();

    const emitToParent = (filters: any) => {
        emit("applyFilters", filters);
    };

    const getFilterValues = () => {
        if (filtersRef.value) {
            return filtersRef.value.getFilterValues();
        }
    };

    const applyFilters = () => {
        emitToParent(getFilterValues());
        isExpanded.value = false;
    };

    const resetFilters = () => {
        filtersRef.value.resetFilters();
        emit("reset");
    };

    return {
        isExpanded, emitToParent,
        filtersRef, getFilterValues,
        applyFilters, resetFilters
    };
  },
});
</script>
