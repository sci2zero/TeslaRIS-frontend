import { MaterialProductType } from "@/models/PublicationModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";


export const materialProductTypeEn = [
    { title: "Prototype", value: MaterialProductType.PROTOTYPE },
    { title: "Industrial product", value: MaterialProductType.INDUSTRIAL_PRODUCT },
    { title: "Infrastructure object", value: MaterialProductType.INFRASTRUCTURE_OBJECT },
    { title: "Derivative works", value: MaterialProductType.DERIVATIVE_WORKS },
    { title: "Other", value: MaterialProductType.OTHER }
];

export const materialProductTypeSr = [
    { title: "Prototip", value: MaterialProductType.PROTOTYPE },
    { title: "Industrijski proizvod", value: MaterialProductType.INDUSTRIAL_PRODUCT },
    { title: "Infrastrukturni objekat", value: MaterialProductType.INFRASTRUCTURE_OBJECT },
    { title: "Izvedeno delo", value: MaterialProductType.DERIVATIVE_WORKS },
    { title: "Ostalo", value: MaterialProductType.OTHER }
];

export const getMaterialProductTypeTitleFromValue = (
    value: MaterialProductType, materialProductTypeArray: {title: string, value: MaterialProductType}[]
) => {
    return (materialProductTypeArray.find(item => item.value === value.toString()) || {}).title;
};

export const getMaterialProductTypeTitleFromValueAutoLocale = (
    value: MaterialProductType | string
) => {
    const locale = i18n.vueI18n.global.locale;

    let materialProductTypeArray = materialProductTypeEn;
    if (locale == "sr") {
        materialProductTypeArray = materialProductTypeSr;
    } else if (locale == "sr-cyr") {
        materialProductTypeArray = transliterateContentToCyrillic(materialProductTypeSr);
    }

    return (materialProductTypeArray.find(item => item.value === value) || {}).title;
};

export const getMaterialProductTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return materialProductTypeSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(materialProductTypeSr);
        case "en":
            return materialProductTypeEn;
    }
};
