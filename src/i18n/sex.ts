import { Sex } from "@/models/PersonModel";
import { getNameFromOrdinal } from "@/utils/EnumUtil";

export const sexSr = [
    { title: "Muški", value: Sex.MALE },
    { title: "Ženski", value: Sex.FEMALE },
];

export const sexEn = [
    { title: "Male", value: Sex.MALE },
    { title: "Female", value: Sex.FEMALE },
];

export const getTitleFromValueAutoLocale = (value: Sex, locale: string) => {
    let resourceTypeArray = sexEn;
    if (locale == "sr") {
        resourceTypeArray = sexSr;
    }

    if (typeof value === "number") {
        return (resourceTypeArray.find(item => item.value === value) || {}).title;
    } else if (typeof value === "string") {
        return (resourceTypeArray.find(item => getNameFromOrdinal(Sex, item.value) === value) || {}).title;
    }
};

export const getSexForGivenLocale = (locale: string) => {
    switch(locale) {
        case "sr":
            return sexSr;
        case "en":
            return sexEn;
    }
}
