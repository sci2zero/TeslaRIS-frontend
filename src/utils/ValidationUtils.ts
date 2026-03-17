import { useI18n } from 'vue-i18n';
import { computed, type Ref } from 'vue';

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
    const invalidOpenAlexIdMessage = computed(() => i18n.t("openAlexIdFormatError"));
    const invalidWebOfScienceIdMessage = computed(() => i18n.t("webOfScienceIdFormatError"));
    const invalidWebOfScienceResearcherIdMessage = computed(() => i18n.t("webOfScienceResearcherIdFormatError"));
    const invalidRorMessage = computed(() => i18n.t("invalidRorMessage"));
    const invalidRinggoldMessage = computed(() => i18n.t("invalidRinggoldMessage"));
    const invalidFundrefMessage = computed(() => i18n.t("invalidFundrefMessage"));
    const invalidIsniMessage = computed(() => i18n.t("invalidIsniMessage"));
    const invalidAthensIdMessage = computed(() => i18n.t("invalidAthensIdMessage"));
    const invalidNcesIdMessage = computed(() => i18n.t("invalidNcesIdMessage"));
    const invalidFctIdMessage = computed(() => i18n.t("invalidFctIdMessage"));
    const invalidDgeecIdMessage = computed(() => i18n.t("invalidDgeecIdMessage"));
    const invalidNifIdMessage = computed(() => i18n.t("invalidNifIdMessage"));
    const invalidScopusIdMessage = computed(() => i18n.t("scopusIdFormatError"));
    const invalidConfIdMessage = computed(() => i18n.t("confIdFormatError"));
    const emailFormatMessage = computed(() => i18n.t("emailFormatError"));
    const requiredFutureDateMessage = computed(() => i18n.t("requiredFutureDateMessage"));
    const requiredFutureTimeMessage = computed(() => i18n.t("requiredFutureTimeMessage"));
    const atLeastOneRequiredMessage = computed(() => i18n.t("atLeastOneRequiredMessage"));
    const invalidUDCMessage = computed(() => i18n.t("udcFormatError"));
    const positiveOrZeroFieldMessage = computed(() => i18n.t("positiveOrZeroFieldMessage"));
    const invalidScholarIdMessage = computed(() => i18n.t("scholarIdFormatError"));
    const invalidAuthenticusIdMessage = computed(() => i18n.t("authenticusIdFormatError"));
    const invalidLattesIdMessage = computed(() => i18n.t("lattesIdFormatError"));

    
    const requiredFieldRules = [
        (value: string) => {
            if (!value || value.trim() === "") return requiredFieldMessage.value;
            return true;
        }
    ];

    const requiredNumericFieldRules = [
        (value: string) => {
            if (!value) return requiredFieldMessage.value;
            return true;
        }
    ];

    const requiredNumericGreaterThanZeroFieldRules = [
        (value: number) => {
            if (!value || value <= 0) return requiredFieldMessage.value;
            return true;
        }
    ];

    const optionalNumericZeroOrGreaterFieldRules = [
        (value: number) => {
            if (!value) return true;
            if (value <= 0) return positiveOrZeroFieldMessage.value;
            return true;
        }
    ];

    const requiredSelectionRules = [
        (value: { title: string, value: number }) => {
            if (!value || value.value === null || value.value === -1) return requiredFieldMessage.value;
            return true;
        }
    ];

    const requiredStringSelectionRules = [
        (value: { title: string, value: string }) => {
            if (!value || value.value === null || value.value === "") return requiredFieldMessage.value;
            return true;
        }
    ];

    const requiredMultiSelectionRules = [
        (values: { title: string, value: number | string }[]) => {
            if (!values || values.length === 0) {
                return requiredFieldMessage.value;
            }
            return true;
        }
    ];

    const doiPattern = /^10\.\d{4,9}\/[-,._;()/:a-zA-Z0-9]+$/i;
    const doiValidationRules = [
        (value: string) => {
            if (!value || value.trim() === "") return true;
            if (doiPattern.test(value)) return true;
            return invalidDOIMessage.value;
        }
    ];

    const scopusIdPattern = /^\d{6,12}$/i;
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

    const printIssnPattern = /^(\d{4}-\d{4}|\d{4}-\d{3}[\dX]?)$/i;
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

    const personOpenAlexIdPattern = /^A\d{4,10}$/i;
    const personOpenAlexIdValidationRules = [
        (value: string) => {
            if (!value || value.trim() === "") return true;
            if (personOpenAlexIdPattern.test(value)) return true;
            return invalidOpenAlexIdMessage.value;
        }
    ];

    const personWebOfScienceIdPattern = /^[A-Z]{1,3}-\d{4}-\d{4}$/i;
    const personWebOfScienceIdValidationRules = [
        (value: string) => {
            if (!value || value.trim() === "") return true;
            if (personWebOfScienceIdPattern.test(value)) return true;
            return invalidWebOfScienceResearcherIdMessage.value;
        }
    ];

    const documentWebOfScienceIdPattern = /^\d{15}$/i;
    const documentWebOfScienceIdValidationRules = [
        (value: string) => {
            if (!value || value.trim() === "") return true;
            if (documentWebOfScienceIdPattern.test(value)) return true;
            return invalidWebOfScienceIdMessage.value;
        }
    ];

    const institutionOpenAlexIdPattern = /^I\d{4,10}$/i;
    const institutionOpenAlexIdValidationRules = [
        (value: string) => {
            if (!value || value.trim() === "") return true;
            if (institutionOpenAlexIdPattern.test(value)) return true;
            return invalidOpenAlexIdMessage.value;
        }
    ];

    const sourceOpenAlexIdPattern = /^[SV]\d{4,10}$/i;
    const sourceOpenAlexIdValidationRules = [
        (value: string) => {
            if (!value || value.trim() === "") return true;
            if (sourceOpenAlexIdPattern.test(value)) return true;
            return invalidOpenAlexIdMessage.value;
        }
    ];

    const workOpenAlexIdPattern = /^W\d{4,10}$/i;
    const workOpenAlexIdValidationRules = [
        (value: string) => {
            if (!value || value.trim() === "") return true;
            if (workOpenAlexIdPattern.test(value)) return true;
            return invalidOpenAlexIdMessage.value;
        }
    ];

    const rorPattern = /^0[0-9a-hj-km-np-z]{8}$/i;
    const rorValidationRules = [
        (value: string) => {
            if (!value || value.trim() === "") return true;
            if (rorPattern.test(value)) return true;
            return invalidRorMessage.value;
        }
    ];

    const ringgoldPattern = /^[0-9]+$/i;
    const ringgoldValidationRules = [
        (value: string) => {
            if (!value || value.trim() === "") return true;
            if (ringgoldPattern.test(value)) return true;
            return invalidRinggoldMessage.value;
        }
    ];

    const fundrefPattern = /^[0-9]+$/i;
    const fundrefValidationRules = [
        (value: string) => {
            if (!value || value.trim() === "") return true;
            if (fundrefPattern.test(value)) return true;
            return invalidFundrefMessage.value;
        }
    ];

    const isniPattern = /^[0-9X]{16}$/i;
    const isniValidationRules = [
        (value: string) => {
            if (!value || value.trim() === "") return true;
            if (isniPattern.test(value)) return true;
            return invalidIsniMessage.value;
        }
    ];

    const athensIdPattern = /.*/i;
    const athensIdValidationRules = [
        (value: string) => {
            if (!value || value.trim() === "") return true;
            if (athensIdPattern.test(value)) return true;
            return invalidAthensIdMessage.value;
        }
    ];

    const ncesIdPattern = /^[0-9]+$/i;
    const ncesIdValidationRules = [
        (value: string) => {
            if (!value || value.trim() === "") return true;
            if (ncesIdPattern.test(value)) return true;
            return invalidNcesIdMessage.value;
        }
    ];

    const fctIdPattern = /^[0-9A-Za-z-]+$/i;
    const fctIdValidationRules = [
        (value: string) => {
            if (!value || value.trim() === "") return true;
            if (fctIdPattern.test(value)) return true;
            return invalidFctIdMessage.value;
        }
    ];

    const dgeecIdPattern = /^[0-9A-Za-z-]+$/i;
    const dgeecIdValidationRules = [
        (value: string) => {
            if (!value || value.trim() === "") return true;
            if (dgeecIdPattern.test(value)) return true;
            return invalidDgeecIdMessage.value;
        }
    ];

    const nifIdPattern = /^[0-9]+$/i;
    const nifIdValidationRules = [
        (value: string) => {
            if (!value || value.trim() === "") return true;
            if (nifIdPattern.test(value)) return true;
            return invalidNifIdMessage.value;
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

    const udcPattern = /^\d{1,3}([.:/]\d{1,5})*(\(\d{1,5}(\.\d{1,5})?\))?$/;
    const udcValidationRules = [
        (value: string) => {
            if (!value || value.trim() === "") return true;
            if (udcPattern.test(value)) return true;
            return invalidUDCMessage.value;
        }
    ];

    const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    const emailFieldRules = [
        (value: string) => {
            if (!value) return requiredFieldMessage.value;
            if (!emailPattern.test(value)) return emailFormatMessage.value;
            return true;
        }
    ];

    const scholarIdPattern = /^[a-zA-Z0-9_-]{12,}$/i;
    const scholarIdValidationRules = [
        (value: string) => {
            if (!value || value.trim() === "") return true;
            if (scholarIdPattern.test(value)) return true;
            return invalidScholarIdMessage.value;
        }
    ];

    const personAuthenticusIdPattern = /^A-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/i;
    const personAuthenticusIdValidationRules = [
        (value: string) => {
            if (!value || value.trim() === "") return true;
            if (personAuthenticusIdPattern.test(value)) return true;
            return invalidAuthenticusIdMessage.value;
        }
    ];

    const lattesIdPattern = /^\d{16}$/i;
    const lattesIdValidationRules = [
        (value: string) => {
            if (!value || value.trim() === "") return true;
            if (lattesIdPattern.test(value)) return true;
            return invalidLattesIdMessage.value;
        }
    ];

    const nonMandatoryEmailFieldRules = [
        (value: string) => {
            if (!value) return true;
            if (!emailPattern.test(value)) return emailFormatMessage.value;
            return true;
        }
    ];

    const dateTodayOrFutureRules = [
        (value: string) => {
            const dateTokens = value.split(".");
            if (dateTokens.length !== 4) return requiredFieldMessage.value;

            const inputDate = new Date(parseInt(dateTokens[2].trim()), parseInt(dateTokens[1].trim()) - 1, parseInt(dateTokens[0].trim()));
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (isNaN(inputDate.getTime())) return requiredFieldMessage.value;

            if (inputDate < today) return requiredFutureDateMessage.value;
            return true;
        }
    ];
    
    const timeTodayOrFutureRules = [
        (value: string) => {
            const now = new Date();
            const [hours, minutes] = value.split(":").map(Number);
    
            if (isNaN(hours) || isNaN(minutes)) return requiredFieldMessage.value;

            const inputTime = new Date();
            inputTime.setHours(hours, minutes, 0, 0);
    
            if (inputTime < now) return requiredFutureTimeMessage.value;
            return true;
        }
    ];

    const atLeastOneRequiredRule = <T extends Record<string, any>>(formRef: Ref<T>, fields: (keyof T)[]) => {
        return [
            (value: any) => {
                const isAnyFilled = fields.some((field) => {
                    const fieldValue = formRef.value[field]
                    return fieldValue !== null && fieldValue !== undefined && fieldValue !== "";
                });
        
                if (isAnyFilled || (value !== null && value !== undefined && value !== "")) {
                    return true;
                }
        
                return atLeastOneRequiredMessage.value;
            },
        ];
    };

    const atLeastOneTrueRule = <T extends Record<string, any>>(formRef: Ref<T>, fields: (keyof T)[]) => {
        return [
            (value: any) => {
                const isAnyTrue = fields.some((field) => {
                    const fieldValue = formRef.value[field]
                    return fieldValue !== null && fieldValue !== undefined && fieldValue !== "" && fieldValue === true;
                });
        
                if (isAnyTrue || (value !== null && value !== undefined && value !== "" && value === true)) {
                    return true;
                }
        
                return atLeastOneRequiredMessage.value;
            },
        ];
    };

    return { requiredFieldRules, requiredSelectionRules, doiValidationRules, 
        uriValidationRules, isbnValidationRules, eIssnValidationRules, 
        printIssnValidationRules, scopusAfidValidationRules, confIdValidationRules,
        apvntValidationRules, eCrisIdValidationRules, eNaukaIdValidationRules,
        orcidValidationRules, scopusAuthorIdValidationRules, scopusIdValidationRules,
        emailFieldRules, nonMandatoryEmailFieldRules, requiredNumericFieldRules,
        dateTodayOrFutureRules, timeTodayOrFutureRules, requiredMultiSelectionRules,
        requiredStringSelectionRules, requiredNumericGreaterThanZeroFieldRules,
        atLeastOneRequiredRule, atLeastOneTrueRule, personOpenAlexIdValidationRules,
        institutionOpenAlexIdValidationRules, sourceOpenAlexIdValidationRules,
        rorValidationRules, workOpenAlexIdValidationRules, udcValidationRules,
        personWebOfScienceIdValidationRules, documentWebOfScienceIdValidationRules,
        optionalNumericZeroOrGreaterFieldRules, scholarIdValidationRules,
        personAuthenticusIdValidationRules, lattesIdValidationRules,
        ringgoldValidationRules, fundrefValidationRules, isniValidationRules,
        athensIdValidationRules, ncesIdValidationRules, fctIdValidationRules,
        dgeecIdValidationRules, nifIdValidationRules
    };
};