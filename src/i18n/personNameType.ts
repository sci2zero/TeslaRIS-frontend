import { PersonNameType } from "@/models/PersonModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";


export const personNameTypeEn = [
    { title: "Presented", value: PersonNameType.PRESENTED_NAME },
    { title: "Display", value: PersonNameType.DISPLAY_NAME },
    { title: "Citation", value: PersonNameType.CITATION_NAME },
    { title: "Full", value: PersonNameType.FULL_NAME }
];

export const personNameTypeSr = [
    { title: "Izloženo", value: PersonNameType.PRESENTED_NAME },
    { title: "Za prikaz", value: PersonNameType.DISPLAY_NAME },
    { title: "Za referencu", value: PersonNameType.CITATION_NAME },
    { title: "Puno ime", value: PersonNameType.FULL_NAME }
];

export const getPersonNameTypeTitleFromValue = (
    value: PersonNameType, personNameTypeArray: {title: string, value: PersonNameType}[]
) => {
    return (personNameTypeArray.find(item => item.value === value.toString()) || {}).title;
};

export const getPersonNameTypeTitleFromValueAutoLocale = (
    value: PersonNameType | string
) => {
    const locale = i18n.vueI18n.global.locale;

    let personNameTypeArray = personNameTypeEn;
    if (locale == "sr") {
        personNameTypeArray = personNameTypeSr;
    } else if (locale == "sr-cyr") {
        personNameTypeArray = transliterateContentToCyrillic(personNameTypeSr);
    }

    return (personNameTypeArray.find(item => item.value === value) || {}).title;
};

export const getPersonNameTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return personNameTypeSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(personNameTypeSr);
        case "en":
            return personNameTypeEn;
    }
};
