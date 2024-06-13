<template>
    <v-menu v-model="isMenuOpen" :close-on-content-click="false">
        <template #activator="{ props }">
            <v-text-field
                :label="label"
                :model-value="formattedDate"
                :rules="required ? requiredFieldRules : []"
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
import { useValidationUtils } from "@/utils/ValidationUtils";
import type { PropType } from "vue";
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
    required: {
      type: Boolean,
      default: false
    },
    modelValue: {
      type: Object as PropType<string | undefined>,
      required: true,
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const isMenuOpen = ref(false);
    const selectedDate = ref(props.modelValue ? new Date(props.modelValue) : undefined);

    const { requiredFieldRules } = useValidationUtils();

    const formattedDate = computed(() => {
      return selectedDate.value ? new Date(selectedDate.value).toLocaleDateString("en") : "";
    });

    watch(() => props.modelValue, (newDate) => {
      if(newDate) {
        selectedDate.value = new Date(newDate);
      }
    });

    watch(selectedDate, (newDate) => {
      emit("update:modelValue", newDate?.toISOString().split("T")[0]);
    });

    return {
      isMenuOpen,
      selectedDate,
      formattedDate,
      requiredFieldRules
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
