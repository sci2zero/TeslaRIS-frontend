<template>
    <v-row>
        <v-col :cols="allowManualClearing && selectedEvent.value !== -1 ? 10 : 11">
            <v-autocomplete
                v-model="selectedEvent"
                :label="(label ? $t(label) : $t('eventLabel')) + (required ? '*' : '')"
                :items="events"
                :custom-filter="((): boolean => true)"
                :no-data-text="$t('noDataMessage')"
                :rules="required ? requiredSelectionRules : []"
                return-object
                @update:search="searchEvents($event)"
                @update:model-value="sendContentToParent"
            />
        </v-col>
        <v-col cols="1">
            <v-btn v-show="allowManualClearing && selectedEvent.value !== -1" icon @click="clearInput()">
                <v-icon>mdi-delete</v-icon>
            </v-btn>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import lodash from "lodash";
import type { EventIndex } from "@/models/EventModel";
import EventService from "@/services/EventService";
import { useValidationUtils } from "@/utils/ValidationUtils";

const props = withDefaults(defineProps<{
    modelValue: { title: string, value: number } | undefined;
    required?: boolean;
    allowManualClearing?: boolean;
    label?: string;
}>(), {
    required: false,
    allowManualClearing: false,
    label: undefined
});

const emit = defineEmits(["update:modelValue"]);

const i18n = useI18n();
const { requiredSelectionRules } = useValidationUtils();

const searchPlaceholder = { title: "", value: -1 };

const events = ref<{ title: string, value: number }[]>([]);
const selectedEvent = ref<{ title: string, value: number }>(props.modelValue ?? searchPlaceholder);

onMounted(() => {
    if (props.modelValue) {
        selectedEvent.value = props.modelValue;
    }

    sendContentToParent();
});

const searchEvents = lodash.debounce((input: string) => {
    if (!input || input.length < 3) {
        return;
    }

    const params = "tokens=" + input.split(" ").join("&tokens=") + "&page=0&size=5";
  
    EventService.searchEvents(
        params, true, false, false, false, null, null, [], false
    ).then((response) => {
        events.value = response.data.content.map((event: EventIndex) => ({
            title: `${i18n.locale.value.startsWith("sr") ? event.nameSr : event.nameOther}${event.dateFromTo ? (" | " + event.dateFromTo) : ""}`,
            value: event.databaseId
        }));
    });
}, 300);

const sendContentToParent = () => {
    emit("update:modelValue", selectedEvent.value);
};

const clearInput = () => {
    selectedEvent.value = searchPlaceholder;
    sendContentToParent();
};

watch(() => props.modelValue, () => {
    selectedEvent.value = props.modelValue ?? searchPlaceholder;
});

defineExpose({ clearInput });
</script>
