import { DegreeType } from "@/models/InvolvementModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

export const degreeTypeSr = [
    { title: "Osnovne studije", value: DegreeType.BACHELOR },
    { title: "Master", value: DegreeType.MASTER },
    { title: "Doktorat", value: DegreeType.PHD },
    { title: "Neformalno obrazovanje", value: DegreeType.INFORMAL_EDUCATION }
];

export const degreeTypeEn = [
    { title: "Bachelor", value: DegreeType.BACHELOR },
    { title: "Master", value: DegreeType.MASTER },
    { title: "PhD", value: DegreeType.PHD },
    { title: "Informal education", value: DegreeType.INFORMAL_EDUCATION }
];

export const getDegreeTypeTitleFromValueAutoLocale = (value: DegreeType) => {
    const locale = i18n.vueI18n.global.locale;

    let degreeTypeArray = degreeTypeEn;
    if (locale == "sr") {
        degreeTypeArray = degreeTypeSr;
    } else if (locale == "sr-cyr") {
        degreeTypeArray = transliterateContentToCyrillic(degreeTypeSr);
    }

    return (degreeTypeArray.find(item => item.value === value) || {}).title;
};

export const getDegreeTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return degreeTypeSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(degreeTypeEn);
        case "en":
            return degreeTypeEn;
    }
};
