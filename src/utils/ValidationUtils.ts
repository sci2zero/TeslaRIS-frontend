import { useI18n } from 'vue-i18n';
import { computed } from 'vue';

export const useValidationUtils = () => {
    const i18n = useI18n();
    const requiredFieldMessage = computed(() => i18n.t("mandatoryFieldError"));
    const invalidDOIMessage = computed(() => i18n.t("invalidDOIError"));
    const invalidURIMessage = computed(() => i18n.t("invalidUriError"));
    
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

    const uriPattern = /^(?:(?:http|https):\/\/)(?:\S+(?::\S*)?@)?(?:(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[0-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))|localhost)(?::\d{2,5})?(?:(\/|\?|#)[^\s]*)?$/i;
    const uriValidationRules = [
        (value: string) => {
            if (!value || value.trim() === "") return true;
            if (uriPattern.test(value)) return true;
            return invalidURIMessage.value;
        }
    ];

    return { requiredFieldRules, requiredSelectionRules, doiValidationRules, uriValidationRules };
};