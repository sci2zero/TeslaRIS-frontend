<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="12">
                <v-row>
                    <v-col>
                        <multilingual-text-input v-model="title" :initial-value="toMultilingualTextInput(presetPrize?.title, languageTags)" :label="$t('titleLabel') + '*'" :rules="requiredFieldRules"></multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input v-model="description" :initial-value="toMultilingualTextInput(presetPrize?.description, languageTags)" :label="$t('abstractLabel')" is-area></multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <date-picker
                            v-model="dateOfAcquisition"
                            :label="$t('dateOfAcquisitionLabel')"
                            color="primary"
                            persistent
                        ></date-picker>
                    </v-col>
                </v-row>
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
import { ref } from 'vue';
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import type { PrizeResponse } from '@/models/PersonModel';
import type { Prize } from '@/models/PersonModel';
import DatePicker from '@/components/core/DatePicker.vue';
import { useLanguageTags } from '@/composables/useLanguageTags';


export default defineComponent({
    name: "PrizeForm",
    components: { MultilingualTextInput, DatePicker },
    props: {
        edit: {
            type: Boolean,
            default: false
        },
        readOnly: {
            type: Boolean,
            default: false
        },
        presetPrize: {
            type: Object as PropType<PrizeResponse | undefined>,
            required: true
        }
    },
    emits: ["update", "create"],
    setup(props, { emit }) {
        const isFormValid = ref(false);
        const { languageTags } = useLanguageTags();

        const { requiredFieldRules } = useValidationUtils();

        const dateOfAcquisition = ref(props.presetPrize?.date);
        const title = ref([]);
        const description = ref([]);

        const savePrize = () => {
            const prize: Prize = {
                title: title.value,
                description: description.value,
                date: dateOfAcquisition.value as string
            };

            if(props.edit) {
                prize.id = props.presetPrize?.id;
                emit("update", prize);
            } else {
                emit("create", prize);
            }
            
        };

        return {
            isFormValid, toMultilingualTextInput, savePrize,
            languageTags, title, requiredFieldRules,
            dateOfAcquisition, description
        };
    }
});
</script>
