<template>
    <div v-if="recurrencePeriod && recurrencePeriod != RecurrenceType.ONCE">
        <p v-if="previewDates.length > 0">
            {{ $t("taskExecutionPeriodPreviewMessage") }}
        </p>
        <div v-for="date in previewDates" :key="date">
            <p>{{ date }}</p>
        </div>
    </div>
</template>

<script lang="ts">
import { RecurrenceType } from "@/models/LoadModel";
import { computeNextDates, computeNextYears } from "@/utils/DateUtil";
import { ref, defineComponent, onMounted, watch, type PropType } from "vue";


export default defineComponent({
    name: "RelativeDatePreview",
    props: {
        startYear: {
            type: Number,
            default: undefined,
        },
        endYear: {
            type: Number,
            default: undefined,
        },
        startDate: {
            type: String,
            default: undefined
        },
        endDate: {
            type: String,
            default: undefined
        },
        recurrencePeriod: {
            type: Object as PropType<RecurrenceType>,
            required: true
        }
    },
    setup(props) {
        const previewDates = ref<string[]>([]);

        onMounted(() => {
            generateDisplayValues();
        });

        watch(
            [
                () => props.startYear,
                () => props.endYear,
                () => props.startDate,
                () => props.endDate,
                () => props.recurrencePeriod
            ]    
        , () => {
            previewDates.value.splice(0);
            generateDisplayValues();
        });

        const generateDisplayValues = () => {
            if (props.startYear) {
                const startYears = computeNextYears(props.startYear, props.recurrencePeriod);

                startYears.forEach(year => {
                    previewDates.value.push(String(year));
                });

                if (props.endYear) {
                    const endYears = computeNextYears(props.endYear, props.recurrencePeriod);
                    endYears.forEach((year, index) => {
                        previewDates.value[index] = (`${previewDates.value[index]} - ${year}`);
                    });
                }
            } else if (props.startDate && props.endDate) {
                const startDates: Date[] = [];
                const endDates: Date[] = [];

                if (props.startDate) {
                    if (props.startDate.includes("%7C")) {
                        const dateParts = props.startDate.split("%7C");
                        startDates.push(...computeNextDates(parseInt(dateParts[2]), parseInt(dateParts[1]), parseInt(dateParts[0]), props.recurrencePeriod));
                    } else {
                        const date = new Date(props.startDate);
                        startDates.push(...computeNextDates(date.getDate(), date.getMonth() + 1, date.getFullYear(), props.recurrencePeriod));
                    }

                    startDates.forEach(date => {
                        previewDates.value.push(date.toLocaleDateString("sr-Latn-RS"));
                    });

                    if (props.endDate) {
                        if (props.endDate.includes("%7C")) {
                            const dateParts = props.endDate.split("%7C");
                            endDates.push(...computeNextDates(parseInt(dateParts[2]), parseInt(dateParts[1]), parseInt(dateParts[0]), props.recurrencePeriod));
                        } else {
                            const date = new Date(props.endDate);
                            endDates.push(...computeNextDates(date.getDate(), date.getMonth() + 1, date.getFullYear(), props.recurrencePeriod));
                        }
                        
                        endDates.forEach((date, index) => {
                            previewDates.value[index] = (`${previewDates.value[index]} - ${date.toLocaleDateString("sr-Latn-RS")}`);
                        });
                    }
                }
            }
        };

        return {
            previewDates,
            RecurrenceType
        };
    },
});
</script>
