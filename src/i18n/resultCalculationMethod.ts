import { ResultCalculationMethod } from "@/models/AssessmentModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

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

    let resultCalculationMethodArray = resultCalculationMethodsEn;
    if (locale == "sr") {
        resultCalculationMethodArray = resultCalculationMethodsSr;
    } else if (locale == "sr-cyr") {
        resultCalculationMethodArray = transliterateContentToCyrillic(resultCalculationMethodsSr);
    }

    return (resultCalculationMethodArray.find(item => item.value === value) || {}).title;
};

export const getResultCalculationMethodsForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return resultCalculationMethodsSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(resultCalculationMethodsSr);
        case "en":
            return resultCalculationMethodsEn;
    }
};
