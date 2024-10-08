import { useI18n } from 'vue-i18n';
import { computed } from 'vue';

export const useValidationUtils = () => {
    const i18n = useI18n();
    const requiredFieldMessage = computed(() => i18n.t("mandatoryFieldError"));
    const invalidDOIMessage = computed(() => i18n.t("invalidDOIError"));
    const invalidURIMessage = computed(() => i18n.t("invalidUriError"));
    const invalidISBNMessage = computed(() => i18n.t("eisbnFormatError"));
    const invalidEISSNMessage = computed(() => i18n.t("eissnFormatError"));
    const invalidPrintISSNMessage = computed(() => i18n.t("printIssnFormatError"));
    const invalidApvntMessage = computed(() => i18n.t("apvntFormatError"));
    const invalidECrisIdMessage = computed(() => i18n.t("eCrisIdFormatError"));
    const invalidENaukaIdMessage = computed(() => i18n.t("eNaukaIdFormatError"));
    const invalidOrcidIdMessage = computed(() => i18n.t("orcidIdFormatError"));
    const invalidScopusAuthorIdMessage = computed(() => i18n.t("scopusAuthorIdFormatError"));
    const invalidScopusAfidMessage = computed(() => i18n.t("scopusAfidFormatError"));
    const invalidScopusIdMessage = computed(() => i18n.t("scopusIdFormatError"));
    const invalidConfIdMessage = computed(() => i18n.t("confIdFormatError"));
    const emailFormatMessage = computed(() => i18n.t("emailFormatError"));

    
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

    const doiPattern = /^10\.\d{4,9}\/[-,._;()/:A-Z0-9]+$/i;
    const doiValidationRules = [
        (value: string) => {
            if (!value || value.trim() === "") return true;
            if (doiPattern.test(value)) return true;
            return invalidDOIMessage.value;
        }
    ];

    const scopusIdPattern = /^\d{6,11}$/i;
    const scopusIdValidationRules = [
        (value: string) => {
            if (!value || value.trim() === "") return true;
            if (scopusIdPattern.test(value)) return true;
            return invalidScopusIdMessage.value;
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

    const isbnPattern = /^(?:(?:\d[ |-]?){9}[\dX]|(?:\d[ |-]?){13})$/i;
    const isbnValidationRules = [
        (value: string) => {
            if (!value || value.trim() === "") return true;
            if (isbnPattern.test(value)) return true;
            return invalidISBNMessage.value;
        }
    ];

    const eIssnPattern = /^(\d{4}-\d{4}|\d{4}-\d{3}[\dX]?)$/i;
    const eIssnValidationRules = [
        (value: string) => {
            if (!value || value.trim() === "") return true;
            if (eIssnPattern.test(value)) return true;
            return invalidEISSNMessage.value;
        }
    ];

    const printIssnPattern = /^\d{4}-\d{4}([\dX])?$/i;
    const printIssnValidationRules = [
        (value: string) => {
            if (!value || value.trim() === "") return true;
            if (printIssnPattern.test(value)) return true;
            return invalidPrintISSNMessage.value;
        }
    ];

    const scopusAfidPattern = /^\d+$/i;
    const scopusAfidValidationRules = [
        (value: string) => {
            if (!value || value.trim() === "") return true;
            if (scopusAfidPattern.test(value)) return true;
            return invalidScopusAfidMessage.value;
        }
    ];

    const apvntPattern = /^\d+$/i;
    const apvntValidationRules = [
        (value: string) => {
            if (!value || value.trim() === "") return true;
            if (apvntPattern.test(value)) return true;
            return invalidApvntMessage.value;
        }
    ];

    const eCrisIdPattern = /^\d+$/i;
    const eCrisIdValidationRules = [
        (value: string) => {
            if (!value || value.trim() === "") return true;
            if (eCrisIdPattern.test(value)) return true;
            return invalidECrisIdMessage.value;
        }
    ];

    const eNaukaIdPattern = /^[A-Z]{2}\d+$/i;
    const eNaukaIdValidationRules = [
        (value: string) => {
            if (!value || value.trim() === "") return true;
            if (eNaukaIdPattern.test(value)) return true;
            return invalidENaukaIdMessage.value;
        }
    ];

    const orcidPattern = /^\d{4}-\d{4}-\d{4}-[\dX]{4}$/i;
    const orcidValidationRules = [
        (value: string) => {
            if (!value || value.trim() === "") return true;
            if (orcidPattern.test(value)) return true;
            return invalidOrcidIdMessage.value;
        }
    ];

    const scopusAuthorIdPattern = /^\d+$/i;
    const scopusAuthorIdValidationRules = [
        (value: string) => {
            if (!value || value.trim() === "") return true;
            if (scopusAuthorIdPattern.test(value)) return true;
            return invalidScopusAuthorIdMessage.value;
        }
    ];

    const confIdPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i;
    const confIdValidationRules = [
        (value: string) => {
            if (!value || value.trim() === "") return true;
            if (confIdPattern.test(value)) return true;
            return invalidConfIdMessage.value;
        }
    ];

    const emailFieldRules = [
        (value: string) => {
            if (!value) return requiredFieldMessage.value;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) return emailFormatMessage.value;
            return true;
        }
    ];

    return { requiredFieldRules, requiredSelectionRules, doiValidationRules, 
        uriValidationRules, isbnValidationRules, eIssnValidationRules, 
        printIssnValidationRules, scopusAfidValidationRules, confIdValidationRules,
        apvntValidationRules, eCrisIdValidationRules, eNaukaIdValidationRules,
        orcidValidationRules, scopusAuthorIdValidationRules, scopusIdValidationRules,
        emailFieldRules
    };
};