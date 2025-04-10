<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <v-select
                    v-model="selectedPromotion"
                    :items="promotions"
                    :label="$t('promotionLabel') + '*'"
                    :rules="requiredSelectionRules"
                    return-object>
                </v-select>
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
import { defineComponent, onMounted } from 'vue';
import { ref } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import PromotionService from '@/services/thesisLibrary/PromotionService';
import { localiseDate } from '@/i18n/dateLocalisation';


export default defineComponent({
    name: "PromotionSelectorForm",
    emits: ["create"],
    setup(_, { emit }) {
        const isFormValid = ref(false);

        const promotions = ref<{title: string, value: number}[]>([]);
        const selectedPromotion = ref<{title: string, value: number}>({title: "", value: -1});

        const { requiredSelectionRules } = useValidationUtils();

        onMounted(() => {
            PromotionService.getNonFinishedPromotions("")
            .then(response => {
                promotions.value.splice(0);
                response.data.content.forEach(promotion => {
                    promotions.value.push(
                        {
                            title: localiseDate(promotion.promotionDate) as string,
                            value: promotion.id as number
                        }
                    );
                });
            });
        });

        const submit = () => {
            emit("create", selectedPromotion.value.value);
        };

        return {
            isFormValid, promotions,
            selectedPromotion,
            requiredSelectionRules,
            submit
        };
    }
});
</script>
