<template>
    <v-menu v-model="isTimeMenuOpen" :close-on-content-click="false">
        <template #activator="{ props }">
            <v-text-field
                :label="label"
                :model-value="formattedTime"
                :rules="required ? requiredFieldRules : []"
                readonly
                v-bind="props"
                variant="solo"
                hide-details
            ></v-text-field>
        </template>
        <v-time-picker v-model="selectedTime" hide-actions format="24hr" :color="color">
            <template #header></template>
            <template #actions>
                <v-btn @click="clearTime">
                    {{ $t("deleteLabel") }}
                </v-btn>
                <v-btn @click="isTimeMenuOpen = false">
                    {{ $t("saveLabel") }}
                </v-btn>
            </template>
        </v-time-picker>
    </v-menu>
</template>

<script lang="ts">
import { useValidationUtils } from "@/utils/ValidationUtils";
import { defineComponent, ref, computed } from "vue";
import { VTimePicker } from 'vuetify/labs/VTimePicker'

export default defineComponent({
    name: "TimePicker",
    components: {VTimePicker},
    props: {
        label: {
            type: String,
            default: "Select Time",
        },
        color: {
            type: String,
            default: "primary",
        },
        required: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
        const isTimeMenuOpen = ref(false);
        const selectedTime = ref(null);

        const formattedTime = computed(() =>
            selectedTime.value ? selectedTime.value : ""
        );

        const { requiredFieldRules } = useValidationUtils();

        const clearTime = () => {
            selectedTime.value = null;
        };

        return {
            isTimeMenuOpen,
            selectedTime,
            formattedTime,
            requiredFieldRules,
            clearTime,
        };
    },
});
</script>
