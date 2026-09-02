<template>
    <v-row>
        <v-col cols="7">
            <v-text-field
                v-model="amountInput"
                :label="resolvedAmountLabel"
                :placeholder="resolvedAmountLabel"
                type="number"
                :min="0"
                :rules="rules"
                @update:model-value="emitValue"
            />
        </v-col>
        <v-col cols="3">
            <v-select
                v-model="selectedCurrency"
                :items="currencies"
                :item-title="currencyLabel"
                item-value="currencyId"
                :label="$t('currencyLabel')"
                :rules="rules"
                @update:model-value="emitValue"
            />
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import type { Currency, MonetaryAmount } from "@/models/Common";
import CurrencyService from "@/services/CurrencyService";

interface Props {
    presetAmount?: MonetaryAmount;
    required?: boolean;
    // What the amount actually stands for varies by caller -- costs, requested amount, total.
    // Left empty it falls back to the generic "Amount".
    amountLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
    required: false,
    amountLabel: ""
});

const emit = defineEmits<{
    (e: "update:modelValue", value: MonetaryAmount | undefined): void;
}>();

const i18n = useI18n();

const resolvedAmountLabel = computed(() => props.amountLabel ? props.amountLabel : i18n.t("amountLabel"));

const currencies = ref<Currency[]>([]);
const amountInput = ref<number | null>(props.presetAmount?.amount ?? null);
const selectedCurrency = ref<number | null>(props.presetAmount?.currencyId ?? null);

const rules = props.required
    ? [(v: any) => !!v || i18n.t("requiredFieldMessage")]
    : [];

const currencyLabel = (currency: Currency) => {
    return `${currency.code} (${currency.symbol})`;
};

const emitValue = () => {
    if (amountInput.value !== null && selectedCurrency.value !== null) {
        emit("update:modelValue", {
            amount: amountInput.value,
            currencyId: selectedCurrency.value
        });
    } else {
        emit("update:modelValue", undefined);
    }
};

const clearInput = () => {
    amountInput.value = null;
    selectedCurrency.value = null;
};

const setValue = (value: MonetaryAmount | undefined) => {
    amountInput.value = value?.amount ?? null;
    selectedCurrency.value = value?.currencyId ?? null;
    emitValue();
};

onMounted(() => {
    CurrencyService.getAllCurrencies().then((response) => {
        currencies.value = response.data;
    });
});

defineExpose({ clearInput, setValue });
</script>