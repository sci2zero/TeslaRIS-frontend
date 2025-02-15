import { ResultCalculationMethod } from "@/models/AssessmentModel";
import i18n from ".";

export const resultCalculationMethodsSr = [
    { title: "Uzima se najbolja vrednost", value: ResultCalculationMethod.BEST_VALUE },
    { title: "Uzima se najgora vrednost", value: ResultCalculationMethod.WORST_VALUE },
];

export const resultCalculationMethodsEn = [
    { title: "Best value is taken", value: ResultCalculationMethod.BEST_VALUE },
    { title: "Worst value is taken", value: ResultCalculationMethod.WORST_VALUE },
];

export const getResultCalculationMethodTitleFromValueAutoLocale = (value: ResultCalculationMethod) => {
    const locale = i18n.vueI18n.global.locale;

    let resourceTypeArray = resultCalculationMethodsEn;
    if (locale == "sr") {
        resourceTypeArray = resultCalculationMethodsSr;
    }

    return (resourceTypeArray.find(item => item.value === value) || {}).title;
};

export const getResultCalculationMethodsForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return resultCalculationMethodsSr;
        case "en":
            return resultCalculationMethodsEn;
    }
};
