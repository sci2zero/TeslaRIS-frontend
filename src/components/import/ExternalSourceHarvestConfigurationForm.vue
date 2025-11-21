<template>
    <v-row class="d-flex flex-row justify-center">
        <v-col cols="12" sm="8">
            <v-select
                v-model="selectedSource"
                :items="sources"
                :label="$t(endpointType + 'SourceLabel') + '*'"
                :rules="requiredSelectionRules">
            </v-select>
        </v-col>
    </v-row>
    <v-row
        v-if="showIdentifierInputs"
        class="d-flex flex-row justify-center">
        <v-col cols="12" sm="4">
            <v-text-field
                v-model="authorIdentifier"
                :label="$t('contributorIdentifierLabel')"
                :placeholder="$t('contributorIdentifierLabel')">
            </v-text-field>
        </v-col>

        <v-col cols="12" sm="4">
            <v-text-field
                v-model="institutionIdentifier"
                :label="$t('institutionIdentifierLabel')"
                :placeholder="$t('institutionIdentifierLabel')">
            </v-text-field>
        </v-col>
    </v-row>
    <v-row class="d-flex flex-row justify-center">
        <v-col cols="12" sm="4">
            <date-picker-split
                v-model="startDateExternalService"
                :label="$t('startDateLabel')"
                color="primary"
                :required="isFocused"
            ></date-picker-split>
        </v-col>
        <v-col cols="12" sm="4">
            <date-picker-split
                v-model="endDateExternalService"
                :label="$t('endDateLabel')"
                color="primary"
                :required="isFocused"
            ></date-picker-split>
        </v-col>
    </v-row>
    <v-row class="d-flex flex-row justify-center">
        <v-col cols="auto">
            <generic-crud-modal
                :form-component="ScheduleHarvestForm"
                :form-props="{startDate: startDateExternalService, endDate: endDateExternalService}"
                entity-name="ScheduleHarvest"
                primary-color
                :disabled="!isFormValid"
                @create="scheduleHarvest"
            />
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import { useValidationUtils } from '@/utils/ValidationUtils';
import { onMounted, type PropType, ref } from 'vue';
import DatePickerSplit from '../core/DatePickerSplit.vue';
import GenericCrudModal from '../core/GenericCrudModal.vue';
import ScheduleHarvestForm from './ScheduleHarvestForm.vue';


const props = defineProps({
    sources: {
        type: Array<string>,
        required: true
    },
    isFormValid: {
        type: Boolean,
        required: true
    },
    showIdentifierInputs: {
        type: Boolean,
        default: false
    },
    endpointType: {
        type: Object as PropType<"skgif" | "oai">,
        required: true
    },
    isFocused: {
        type: Boolean,
        required: false
    }
});

const emit = defineEmits(["scheduleHarvest"]);

const startDateExternalService = ref();
const endDateExternalService = ref();

const authorIdentifier = ref("");
const institutionIdentifier = ref("");

const selectedSource = ref<string>("");

const { requiredSelectionRules } = useValidationUtils();

onMounted(() => {
    if (props.sources.length > 0) {
        selectedSource.value = props.sources[0];
    }
});

const scheduleHarvest = (scheduleParams: any) => {
    if (props.endpointType === "oai") {
        emit("scheduleHarvest",
            selectedSource.value,
            scheduleParams[0],
            scheduleParams[1],
            startDateExternalService.value,
            endDateExternalService.value
        );
    } else if (props.endpointType === "skgif") {
        emit("scheduleHarvest",
            selectedSource.value,
            scheduleParams[0],
            scheduleParams[1],
            startDateExternalService.value,
            endDateExternalService.value,
            authorIdentifier.value,
            institutionIdentifier.value
        );   
    }
};
</script>
