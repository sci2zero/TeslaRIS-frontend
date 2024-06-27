import { useI18n } from 'vue-i18n';
import { computed } from 'vue';

export const useValidationUtils = () => {
    const i18n = useI18n();
    const requiredFieldMessage = computed(() => i18n.t("mandatoryFieldError"));
    const invalidDOIMessage = computed(() => i18n.t("invalidDOIError"));
    
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

    const doiPattern = /^10.\d{4,9}\/[-._;()/:A-Z0-9]+$/i;
    const doiValidationRules = [
        (value: string) => {
            if (!value || value.trim() === "") return true;
            if (doiPattern.test(value)) return true;
            return invalidDOIMessage.value;
        }
    ];

    return { requiredFieldRules, requiredSelectionRules, doiValidationRules };
};