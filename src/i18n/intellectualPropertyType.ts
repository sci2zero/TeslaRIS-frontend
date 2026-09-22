import { IntellectualPropertyType } from "@/models/PublicationModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";


export const intellectualPropertyTypeEn = [
    { title: "Patent", value: IntellectualPropertyType.PATENT },
    { title: "License", value: IntellectualPropertyType.LICENSE },
    { title: "Disclosure", value: IntellectualPropertyType.DISCLOSURE },
    { title: "Registered copyright", value: IntellectualPropertyType.REGISTERED_COPYRIGHT },
    { title: "Trademark", value: IntellectualPropertyType.TRADEMARK }
];

export const intellectualPropertyTypeSr = [
    { title: "Patent", value: IntellectualPropertyType.PATENT },
    { title: "Licenca", value: IntellectualPropertyType.LICENSE },
    { title: "Otkriće", value: IntellectualPropertyType.DISCLOSURE },
    { title: "Registrovano autorsko pravo", value: IntellectualPropertyType.REGISTERED_COPYRIGHT },
    { title: "Žig", value: IntellectualPropertyType.TRADEMARK }
];

export const getIntellectualPropertyTypeTitleFromValue = (
    value: IntellectualPropertyType, intellectualPropertyTypeArray: {title: string, value: IntellectualPropertyType}[]
) => {
    return (intellectualPropertyTypeArray.find(item => item.value === value.toString()) || {}).title;
};

export const getIntellectualPropertyTypeTitleFromValueAutoLocale = (
    value: IntellectualPropertyType | string
) => {
    const locale = i18n.vueI18n.global.locale;

    let intellectualPropertyTypeArray = intellectualPropertyTypeEn;
    if (locale == "sr") {
        intellectualPropertyTypeArray = intellectualPropertyTypeSr;
    } else if (locale == "sr-cyr") {
        intellectualPropertyTypeArray = transliterateContentToCyrillic(intellectualPropertyTypeSr);
    }

    return (intellectualPropertyTypeArray.find(item => item.value === value) || {}).title;
};

export const getIntellectualPropertyTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return intellectualPropertyTypeSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(intellectualPropertyTypeSr);
        case "en":
            return intellectualPropertyTypeEn;
    }
};
