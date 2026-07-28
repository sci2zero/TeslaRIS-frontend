<template>
    <div>
        <div class="date-picker-container">
            <v-text-field
                ref="fieldRef"
                v-model="yearString"
                :label="label"
                :rules="applyRules()"
                type="number"
                variant="solo"
                :hide-details="additionalRules.length == 0"
                class="flex-grow-1"
            />

            <v-select
                v-model="month"
                :items="months"
                item-title="title"
                item-value="value"
                :label="$t('monthLabel')"
                variant="solo"
                clearable
                class="flex-grow-1 mt-5"
            />

            <v-select
                v-model="day"
                :items="days"
                :label="$t('dayLabel')"
                variant="solo"
                clearable
                :disabled="!month"
                class="flex-grow-1  mt-5"
            />

            <v-menu
                v-model="isMenuOpen"
                :close-on-content-click="false"
            >
                <template #activator="{ props }">
                    <v-btn
                        icon="mdi-calendar"
                        v-bind="props"
                        variant="text"
                        color="primary"
                        class="mt-1"
                    ></v-btn>
                </template>

                <v-date-picker
                    v-model="pickerDate"
                    hide-actions
                    title=""
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
        </div>
    </div>
</template>

<script lang="ts">
import {computed, defineComponent, type PropType, ref, watch} from "vue";
import {VTextField} from "vuetify/lib/components/index.mjs";
import {useValidationUtils} from "@/utils/ValidationUtils";
import { type FlexibleDate } from "@/models/Common";
import { useI18n } from "vue-i18n";


export default defineComponent({
    name: "FlexibleDatePicker",
    props: {
        label: {
            type: String,
            required: true
        },
        required: {
            type: Boolean,
            default: false
        },
        additionalRules: {
            type: Array as PropType<Array<(value: any)=>string|true>>,
            default: () => []
        },
        modelValue: {
            type: Object as PropType<FlexibleDate | undefined>,
            required: true
        }
    },
    emits:["update:modelValue"],
    setup(props,{emit}){
        const i18n = useI18n();

        const { requiredFieldRules } = useValidationUtils();

        const fieldRef = ref<typeof VTextField>();
        const isMenuOpen = ref(false);

        const year = ref<number|undefined>(props.modelValue?.year);
        const month = ref<number|undefined>(props.modelValue?.month);
        const day = ref<number|undefined>(props.modelValue?.day);

        const yearString = computed({
            get:() => year.value?.toString() ?? "",
            set:(v:string) => {
                year.value=v?Number(v):undefined;
            }
        });

        const months = computed(() => [
            { title: i18n.t("januaryLabel"), value: 1 },
            { title: i18n.t("februaryLabel"), value: 2 },
            { title: i18n.t("marchLabel"), value: 3 },
            { title: i18n.t("aprilLabel"), value: 4 },
            { title: i18n.t("mayLabel"), value: 5 },
            { title: i18n.t("juneLabel"), value: 6 },
            { title: i18n.t("julyLabel"), value: 7 },
            { title: i18n.t("augustLabel"), value: 8 },
            { title: i18n.t("septemberLabel"), value: 9 },
            { title: i18n.t("octoberLabel"), value: 10 },
            { title: i18n.t("novemberLabel"), value: 11 },
            { title: i18n.t("decemberLabel"), value: 12 }
        ]);

        const days = computed(() => {
            if(!month.value) {
                return [];
            }

            let max=31;
            
            if([4,6,9,11].includes(month.value)) {
                max=30;
            } else if(month.value===2){
                const y = year.value ?? 2000;
                max=((y%4 === 0 && y%100 !== 0) || y%400 === 0) ? 29 : 28;
            }

            if(day.value && day.value > max) {
                return undefined;
            }
            
            return Array.from({length:max},(_,i)=>i+1);
        });

        const emitValue=()=>{
            if(!year.value){
                emit("update:modelValue", undefined);
                return;
            }
            emit("update:modelValue", {
                year:year.value,
                month:month.value,
                day:day.value
            });
        };
        
        const pickerDate = computed<Date | undefined>({
            get: () => {
                if (year.value && year.value >= 1000 && month.value && day.value) {
                    const date = new Date(year.value, month.value - 1, day.value);
                    return isNaN(date.getTime()) ? undefined : date;
                }
                return undefined;
            },
            set: (newDate) => {
                if (newDate && !isNaN(newDate.getTime())) {
                    year.value = newDate.getFullYear();
                    month.value = newDate.getMonth() + 1;
                    day.value = newDate.getDate();
                    isMenuOpen.value = false;
                }
            }
        });

        watch(month, (m) => {
            if (!m) {
                day.value = undefined;
            }
        });

        watch(()=>props.modelValue,v=>{
            year.value=v?.year;
            month.value=v?.month;
            day.value=v?.day;
        }, { deep:true });

        watch([year,month,day], emitValue);

        const applyRules = () => {
            const rules:any[] = [];
            
            if(props.required) {
                rules.push(requiredFieldRules[0]);
            }

            props.additionalRules.forEach(r => rules.push(r));
            return rules;
        };

        const validate = () => fieldRef.value?.validate?.();

        const clearDate = () => {
            year.value = undefined;
            month.value = undefined;
            day.value = undefined;
            isMenuOpen.value = false;
        };

        return{
            fieldRef, validate,
            yearString, month,
            day, days, months,
            applyRules, isMenuOpen,
            pickerDate, clearDate
        };
    }
});
</script>

<style scoped>
.date-picker-container {
    display: flex;
    align-items: center;
    gap: 8px;
}

.flex-grow-1 {
    flex-grow: 1;
}

:deep(.v-text-field),
:deep(.v-select) {
    min-width: 0;
}

.mt-1 {
    margin-top: 4px;
}
</style>
