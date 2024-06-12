<template>
    <v-menu v-model="isMenuOpen" :close-on-content-click="false">
        <template #activator="{ props }">
            <v-text-field
                :label="label"
                :model-value="formattedDate"
                readonly
                v-bind="props"
                variant="solo"
                hide-details
            ></v-text-field>
        </template>
        <v-date-picker v-model="selectedDate" hide-actions title="" :color="color">
            <template #header></template>
        </v-date-picker>
    </v-menu>
</template>

<script lang="ts">
import { ref, computed, watch, defineComponent } from "vue";

export default defineComponent({
  name: "DatePickerComponent",
  props: {
    label: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    modelValue: {
      type: Date,
      required: true,
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const isMenuOpen = ref(false);
    const selectedDate = ref(props.modelValue);

    const formattedDate = computed(() => {
      return selectedDate.value ? selectedDate.value.toLocaleDateString("en") : "";
    });

    watch(() => props.modelValue, (newDate) => {
      selectedDate.value = newDate;
    });

    watch(selectedDate, (newDate) => {
      emit("update:modelValue", newDate);
    });

    return {
      isMenuOpen,
      selectedDate,
      formattedDate,
    };
  },
});
</script>


<style>
.v-overlay__content:has(> .v-date-picker) {
    min-width: auto!important;
}
.v-picker-title {
    padding: 0 !important;
}
</style>`
