<template>
    <v-menu v-model="isMenuOpen" :close-on-content-click="false" :persistent="persistent">
        <template #activator="{ props }">
            <v-text-field
                ref="fieldRef"
                :label="label"
                :model-value="formattedDate"
                :rules="applyRules()"
                readonly
                v-bind="props"
                variant="solo"
                :hide-details="additionalRules.length == 0"
            ></v-text-field>
        </template>
        <v-date-picker
            v-model="selectedDate" hide-actions title="" :color="color"
            @click.stop>
            <template #header></template>
            <template #actions>
                <v-btn @click.stop="clearDate">
                    {{ $t("deleteLabel") }}
                </v-btn>
                <v-btn @click.stop="isMenuOpen = false">
                    {{ $t("saveLabel") }}
                </v-btn>
            </template>
        </v-date-picker>
    </v-menu>
</template>

<script lang="ts">
import { useValidationUtils } from "@/utils/ValidationUtils";
import type { PropType } from "vue";
import { ref, computed, watch, defineComponent } from "vue";
import { VTextField } from "vuetify/lib/components/index.mjs";

export default defineComponent({
  name: "DatePicker",
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
    inFuture: {
      type: Boolean,
      default: false
    },
    persistent: {
      type: Boolean,
      default: false
    },
    modelValue: {
      type: Object as PropType<string | undefined>,
      required: true,
    },
    additionalRules: {
      type: Array as PropType<Array<(value: string) => string | true>>,
      default: () => []
    }
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const isMenuOpen = ref(false);
    const selectedDate = ref(props.modelValue ? new Date(props.modelValue) : undefined);

    const { requiredFieldRules, dateTodayOrFutureRules } = useValidationUtils();

    const fieldRef = ref<typeof VTextField>();

    const toIsoString = (date: Date) => {
      const pad = function(num : number) {
              return (num < 10 ? '0' : '') + num;
        };

        return date.getFullYear() +
            '-' + pad(date.getMonth() + 1) +
            '-' + pad(date.getDate()) +
            'T' + pad(date.getHours()) +
            ':' + pad(date.getMinutes()) +
            ':' + pad(date.getSeconds());
    };


    const formattedDate = computed(() => {
      return selectedDate.value ? new Date(selectedDate.value).toLocaleDateString("sr") : "";
    });

    const clearDate = () => {
      selectedDate.value = undefined;
    };

    watch(() => props.modelValue, (newDate) => {
      if(newDate) {
        selectedDate.value = new Date(newDate);
      }
    });

    watch(selectedDate, (newDate) => {
      if (newDate) {
        emit("update:modelValue", toIsoString(newDate));
      } else {
        emit("update:modelValue", "");
      }
    });

    const applyRules = () => {
      const rules = [];
      
      if (props.required) {
        rules.push(requiredFieldRules[0]);
      }

      if (props.inFuture) {
        rules.push(dateTodayOrFutureRules[0]);
      }

      if (props.additionalRules.length > 0) {
        rules.push(...props.additionalRules);
      }

      return rules;
    };

    const validate = () => {
      fieldRef.value?.validate?.();
    };

    return {
      isMenuOpen,
      selectedDate,
      formattedDate,
      clearDate, applyRules,
      fieldRef, validate
    };
  },
});
</script>


<style scoped>
.v-overlay__content:has(> .v-date-picker) {
    min-width: auto!important;
}
.v-picker-title {
    padding: 0 !important;
}
</style>
