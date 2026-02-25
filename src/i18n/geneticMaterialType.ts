import { GeneticMaterialType } from "@/models/PublicationModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";


export const geneticMaterialTypeEn = [
    { title: "Genotype", value: GeneticMaterialType.GENOTYPE },
    { title: "Race", value: GeneticMaterialType.RACE },
    { title: "Variety", value: GeneticMaterialType.VARIETY },
    { title: "Strain", value: GeneticMaterialType.STRAIN },
    { title: "Other", value: GeneticMaterialType.OTHER }
];

export const geneticMaterialTypeSr = [
    { title: "Genotip", value: GeneticMaterialType.GENOTYPE },
    { title: "Rasa", value: GeneticMaterialType.RACE },
    { title: "Sorta", value: GeneticMaterialType.VARIETY },
    { title: "Soj", value: GeneticMaterialType.STRAIN },
    { title: "Ostalo", value: GeneticMaterialType.OTHER }
];

export const getGeneticMaterialTypeTitleFromValue = (
    value: GeneticMaterialType, geneticMaterialTypeArray: {title: string, value: GeneticMaterialType}[]
) => {
    return (geneticMaterialTypeArray.find(item => item.value === value.toString()) || {}).title;
};

export const getGeneticMaterialTypeTitleFromValueAutoLocale = (
    value: GeneticMaterialType | string
) => {
    const locale = i18n.vueI18n.global.locale;

    let geneticMaterialTypeArray = geneticMaterialTypeEn;
    if (locale == "sr") {
        geneticMaterialTypeArray = geneticMaterialTypeSr;
    } else if (locale == "sr-cyr") {
        geneticMaterialTypeArray = transliterateContentToCyrillic(geneticMaterialTypeSr);
    }

    return (geneticMaterialTypeArray.find(item => item.value === value) || {}).title;
};

export const getGeneticMaterialTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return geneticMaterialTypeSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(geneticMaterialTypeSr);
        case "en":
            return geneticMaterialTypeEn;
    }
};
