<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="6">
                <date-picker
                    v-model="promotionDate"
                    :label="$t('dateLabel') + '*'"
                    color="primary"
                    required
                    in-future
                ></date-picker>
            </v-col>
            <v-col cols="6">
                <time-picker v-model="promotionTime" :label="$t('timeLabel') + '*'" required></time-picker>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-text-field v-model="placeOrVenue" :label="$t('placeLabel') + '*'" :placeholder="$t('placeLabel') + '*'" :rules="requiredFieldRules"></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="descriptionRef"
                    v-model="description"
                    :rules="requiredFieldRules"
                    :label="$t('descriptionLabel') + '*'"
                    :initial-value="toMultilingualTextInput(presetPromotion?.description, languageTags)"
                    is-area>
                </multilingual-text-input>
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
import type { Promotion } from '@/models/ThesisLibraryModel';
import { useLanguageTags } from '@/composables/useLanguageTags';
import DatePicker from '../core/DatePicker.vue';
import TimePicker from '../core/TimePicker.vue';


export default defineComponent({
    name: "PromotionForm",
    components: { MultilingualTextInput, DatePicker, TimePicker },
    props: {
        presetPromotion: {
            type: Object as PropType<Promotion | undefined>,
            default: undefined
        }
    },
    emits: ["create"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const { languageTags } = useLanguageTags();

        const descriptionRef = ref<typeof MultilingualTextInput>();

        const promotionDate = ref(props.presetPromotion?.promotionDate);
        const promotionTime = ref(props.presetPromotion?.promotionTime);
        const description = ref<any>([]);
        const placeOrVenue = ref<string>(props.presetPromotion ? props.presetPromotion.placeOrVenue as string : "");

        const { requiredFieldRules } = useValidationUtils();

        const submit = () => {
            const promotion: Promotion = {
                promotionDate: promotionDate.value as string,
                promotionTime: promotionTime.value as string,
                placeOrVenue: placeOrVenue.value,
                description: description.value
            };

            emit("create", promotion);
        };

        return {
            isFormValid, promotionDate,
            description, descriptionRef,
            toMultilingualTextInput, submit,
            languageTags, requiredFieldRules,
            placeOrVenue, promotionTime,
        };
    }
});
</script>
