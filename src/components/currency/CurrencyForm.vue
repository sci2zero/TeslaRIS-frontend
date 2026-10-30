<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="nameRef" v-model="name" :rules="requiredFieldRules" :label="$t('nameLabel') + '*'"
                    :initial-value="toMultilingualTextInput(presetCurrency?.currencyName, languageTags)" />
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-text-field v-model="code" :label="$t('currencyCodeLabel') + '*'" :placeholder="$t('currencyCodeLabel') + '*'" :rules="requiredFieldRules" />
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-text-field v-model="symbol" :label="$t('currencySymbolLabel') + '*'" :placeholder="$t('currencySymbolLabel') + '*'" :rules="requiredFieldRules" />
            </v-col>
        </v-row>

        <v-row>
            <p class="required-fields-message">
                {{ $t("requiredFieldsMessage") }}
            </p>
        </v-row>
    </v-form>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import { ref } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import type { Currency } from '@/models/Common';
import { useLanguageTags } from '@/composables/useLanguageTags';


export default defineComponent({
    name: "CurrencyForm",
    components: {MultilingualTextInput},
    props: {
        presetCurrency: {
            type: Object as PropType<Currency | undefined>,
            default: undefined
        }
    },
    emits: ["create"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const { languageTags } = useLanguageTags();

        const nameRef = ref<typeof MultilingualTextInput>();

        const name = ref<any>([]);
        const code = ref<string>(props.presetCurrency ? props.presetCurrency.code as string : "");
        const symbol = ref<string>(props.presetCurrency ? props.presetCurrency.symbol as string : "");

        const { requiredFieldRules } = useValidationUtils();

        const submit = () => {
            const currency: Currency = {
                code: code.value,
                symbol: symbol.value,
                currencyName: name.value
            };

            emit("create", currency);
        };

        return {
            isFormValid,
            name, nameRef,
            toMultilingualTextInput,
            languageTags, requiredFieldRules,
            code, symbol, submit
        };
    }
});
</script>
