import { Sex } from "@/models/PersonModel";
import { getNameFromOrdinal } from "@/utils/EnumUtil";
import i18n from ".";

export const sexSr = [
    { title: "Muški", value: Sex.MALE },
    { title: "Ženski", value: Sex.FEMALE },
];

export const sexEn = [
    { title: "Male", value: Sex.MALE },
    { title: "Female", value: Sex.FEMALE },
];

export const getTitleFromValueAutoLocale = (value: Sex) => {
    const locale = i18n.vueI18n.global.locale;

    let sexArray = sexEn;
    if (locale == "sr") {
        sexArray = sexSr;
    }

    if (typeof value === "number") {
        return (sexArray.find(item => item.value === value) || {}).title;
    } else if (typeof value === "string") {
        return (sexArray.find(item => getNameFromOrdinal(Sex, item.value) === value) || {}).title;
    }
};

export const getSexForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return sexSr;
        case "en":
            return sexEn;
    }
};
