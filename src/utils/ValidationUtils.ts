import { useI18n } from 'vue-i18n';
import { computed } from 'vue';

export const useValidationUtils = () => {
    const i18n = useI18n();
    const requiredFieldMessage = computed(() => i18n.t("mandatoryFieldError"));
    
    const requiredFieldRules = [
        (value: string) => {
            if (!value || value.trim() === "") return requiredFieldMessage.value;
            return true;
        }
    ];

    const requiredSelectionRules = [
        (value: { title: string, value: number }) => {
            if (!value || value.value === null || value.value === -1) return requiredFieldMessage.value;
            return true;
        }
    ];

    return { requiredFieldRules, requiredSelectionRules };
};