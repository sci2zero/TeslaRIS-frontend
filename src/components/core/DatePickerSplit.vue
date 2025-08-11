<template>
    <div class="date-picker-inline">
        <label v-if="label" class="date-picker-label">{{ label }}</label>

        <div class="date-picker-fields">
            <v-text-field
                ref="dayRef"
                v-model="day"
                class="two-digits"
                :label="$t('dayLabel')"
                type="number"
                hide-details
                density="compact"
                :rules="required ? requiredNumericFieldRules : []"
                @input="handleAutoTab('day')"
            />
            <v-text-field
                ref="monthRef"
                v-model="month"
                class="two-digits"
                :label="$t('monthLabel')"
                type="number"
                hide-details
                density="compact"
                :rules="required ? requiredNumericFieldRules : []"
                @input="handleAutoTab('month')"
            />
            <v-text-field
                ref="yearRef"
                v-model="year"
                class="four-digits"
                :label="$t('yearLabel')"
                type="number"
                hide-details
                density="compact"
                :rules="required ? requiredNumericFieldRules : []"
            />

            <v-menu
                v-model="isMenuOpen"
                :close-on-content-click="false"
                :persistent="persistent"
            >
                <template #activator="{ props }">
                    <v-btn
                        icon="mdi-calendar"
                        v-bind="props"
                        variant="text"
                        color="primary"
                    ></v-btn>
                </template>

                <v-date-picker
                    v-model="pickerDate"
                    hide-actions
                    title=""
                    :color="color"
                    @click.stop
                >
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
        </div>
    </div>
</template>

<script lang="ts">
import { useValidationUtils } from "@/utils/ValidationUtils";
import { ref, watch, defineComponent, onMounted } from "vue";


export default defineComponent({
    name: "DatePickerSplit",
    props: {
        label: {
            type: String,
            default: "",
        },
        color: {
            type: String,
            required: true,
        },
        persistent: {
            type: Boolean,
            default: false,
        },
        required: {
            type: Boolean,
            default: false
        },
        modelValue: {
            type: String,
            required: true,
        }
    },
    emits: ["update:modelValue"],
    setup(props, { emit }) {
        const isMenuOpen = ref(false);
        const pickerDate = ref<Date | undefined>(
            props.modelValue ? new Date(props.modelValue) : undefined
        );

        onMounted(() => {
            if (props.modelValue) {
                const initDate = new Date(props.modelValue);
                if (!isNaN(initDate.getTime())) {
                    day.value = String(initDate.getDate()).padStart(2, "0");
                    month.value = String(initDate.getMonth() + 1).padStart(2, "0");
                    year.value = String(initDate.getFullYear());
                }
            }
        });

        const { requiredNumericFieldRules } = useValidationUtils();

        const day = ref("");
        const month = ref("");
        const year = ref("");

        const dayRef = ref();
        const monthRef = ref();
        const yearRef = ref();

        const toIsoString = (date: Date) => {
            const pad = (num: number) => (num < 10 ? "0" : "") + num;
            return (
                date.getFullYear() +
                "-" +
                pad(date.getMonth() + 1) +
                "-" +
                pad(date.getDate()) +
                "T" +
                pad(date.getHours()) +
                ":" +
                pad(date.getMinutes()) +
                ":" +
                pad(date.getSeconds())
            );
        };

        watch(pickerDate, (newDate) => {
            if (newDate) {
                day.value = String(newDate.getDate()).padStart(2, "0");
                month.value = String(newDate.getMonth() + 1).padStart(2, "0");
                year.value = String(newDate.getFullYear());

                emit("update:modelValue", toIsoString(newDate));
            }
        });

        watch([day, month, year], ([d, m, y]) => {
            if (d && m && y && !isNaN(Number(y))) {
                const dd = Number(d);
                const mm = Number(m) - 1;
                const yyyy = Number(y);

                if (dd > 0 && mm > 0 && yyyy > 0) {
                    const constructed = new Date(yyyy, mm, dd);
                    if (!isNaN(constructed.getTime())) {
                        emit("update:modelValue", toIsoString(constructed));
                    } else {
                        const pad = (num: number) => (num < 10 && num >= 0 ? "0" : "") + num;
                        
                        emit(
                            "update:modelValue",
                            `${y}-${pad(Number(m))}-${pad(Number(d))}T00:00:00`
                        );
                    }
                } else {
                    emit(
                        "update:modelValue",
                        `${y}%7C${m}%7C${d}`
                    );
                }
            } else {
                emit("update:modelValue", "");
            }
        });

        const clearDate = () => {
            day.value = "";
            month.value = "";
            year.value = "";
            pickerDate.value = undefined;
            emit("update:modelValue", "");
        };

        const handleAutoTab = (field: "day" | "month") => {
            if (field === "day" && /^\d{2}$/.test(day.value) && Number(day.value) > 0) {
                monthRef.value?.focus();
            }
            if (field === "month" && /^\d{2}$/.test(month.value) && Number(month.value) > 0) {
                yearRef.value?.focus();
            }
        };

        return {
            isMenuOpen, pickerDate,
            day, month, year,
            clearDate, dayRef,
            monthRef, yearRef,
            handleAutoTab,
            requiredNumericFieldRules
        };
    },
});
</script>

<style scoped>

.date-picker-inline {
    display: flex;
    flex-direction: column;
}

.date-picker-label {
    font-size: 0.85rem;
    color: rgba(0, 0, 0, 0.6);
    margin-bottom: 2px;
}

.date-picker-fields {
    display: flex;
    align-items: center;
    gap: 4px;
}

.two-digits {
    width: 60px
}

.four-digits {
    width: 80px
}

</style>
