<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row class="d-flex flex-row justify-center mb-5">
            <v-col cols="12">
                <date-picker
                    v-model="scheduleDate"
                    :label="$t('dateLabel') + '*'"
                    color="primary"
                    required
                    in-future
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <time-picker v-model="scheduledTime" :label="$t('timeLabel') + '*'" required></time-picker>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-select
                    v-model="selectedRecurrenceType"
                    :items="recurrenceTypes"
                    :label="$t('recurrenceTypeLabel') + '*'"
                    :rules="requiredSelectionRules"
                    return-object>
                </v-select>
            </v-col>
        </v-row>
    </v-form>
</template>

<script lang="ts">
import { getRecurrenceTypesForGivenLocale, getRecurrenceTypeTitleFromValueAutoLocale } from '@/i18n/recurrenceType';
import { RecurrenceType } from '@/models/LoadModel';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { computed, defineComponent, ref } from 'vue';
import DatePicker from '../core/DatePicker.vue';
import TimePicker from '../core/TimePicker.vue';


export default defineComponent({
    name: "ScheduleHarvestForm",
    components: { DatePicker, TimePicker },
    emits: ["create"],
    setup(_, { emit }) {
        const isFormValid = ref(false);

        const scheduleDate = ref();
        const scheduledTime = ref();

        const selectedRecurrenceType = ref<{title: string, value: RecurrenceType}>(
            {title: getRecurrenceTypeTitleFromValueAutoLocale(RecurrenceType.ONCE) as string, value: RecurrenceType.ONCE}
        );
        const recurrenceTypes = computed(() => getRecurrenceTypesForGivenLocale());

        const { requiredSelectionRules } = useValidationUtils();

        const submit = () => {
            emit("create", [`${scheduleDate.value.split("T")[0]}T${scheduledTime.value}`, selectedRecurrenceType.value.value])
        };

        return {
            isFormValid,
            scheduleDate, scheduledTime,
            selectedRecurrenceType,
            recurrenceTypes, submit,
            requiredSelectionRules
        };
    }
});

</script>
