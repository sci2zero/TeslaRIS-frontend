<template>
    <v-menu v-model="isMenuOpen" :close-on-content-click="false" :persistent="persistent">
        <template #activator="{ props }">
            <v-btn
                color="primary"
                v-bind="props">
                {{ label ? label : $t("selectColorLabel") }}
            </v-btn>
        </template>
        <v-color-picker
            v-model="selectedColor"
            hide-inputs
            title=""
            mode="hex"
            @click.stop>
            <template #header></template>
            <template #actions>
                <v-btn @click.stop="isMenuOpen = false">
                    {{ $t("saveLabel") }}
                </v-btn>
            </template>
        </v-color-picker>
    </v-menu>
</template>

<script lang="ts">
import type { PropType } from "vue";
import { ref, watch, defineComponent } from "vue";

export default defineComponent({
  name: "DatePicker",
  props: {
    persistent: {
      type: Boolean,
      default: false
    },
    label: {
        type: String,
        default: ""
    },
    modelValue: {
      type: Object as PropType<string | undefined>,
      required: true,
    }
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const isMenuOpen = ref(false);
    const selectedColor = ref(props.modelValue);

    watch(() => props.modelValue, (newColor) => {
      if(newColor) {
        selectedColor.value = newColor;
      }
    });

    watch(selectedColor, (newColor) => {
      if (newColor) {
        emit("update:modelValue", newColor);
      } else {
        emit("update:modelValue", "");
      }
    });

    return {
      isMenuOpen,
      selectedColor
    };
  },
});
</script>
