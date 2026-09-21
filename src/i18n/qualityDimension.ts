import { QualityDimension } from "@/models/RevisionModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

export const qualityDimensionSr = [
    { title: "Tačnost", value: QualityDimension.ACCURACY },
    { title: "Doslednost", value: QualityDimension.CONSISTENCY },
    { title: "Poreklo", value: QualityDimension.LINEAGE },
    { title: "Strukturna doslednost", value: QualityDimension.STRUCTURAL_CONSISTENCY },
    { title: "Kvalitativnost", value: QualityDimension.QUALITATIVE },
    { title: "Semantika", value: QualityDimension.SEMANTIC },
    { title: "Ažurnost", value: QualityDimension.CURRENCY }
];

export const qualityDimensionEn = [
    { title: "Accuracy", value: QualityDimension.ACCURACY },
    { title: "Consistency", value: QualityDimension.CONSISTENCY },
    { title: "Lineage", value: QualityDimension.LINEAGE },
    { title: "Structural Consistency", value: QualityDimension.STRUCTURAL_CONSISTENCY },
    { title: "Qualitative", value: QualityDimension.QUALITATIVE },
    { title: "Semantic", value: QualityDimension.SEMANTIC },
    { title: "Currency", value: QualityDimension.CURRENCY }
];

export const getQualityDimensionTitleFromValueAutoLocale = (value: QualityDimension) => {
    const locale = i18n.vueI18n.global.locale;

    let qualityDimensionArray = qualityDimensionEn;
    if (locale == "sr") {
        qualityDimensionArray = qualityDimensionSr;
    } else if (locale == "sr-cyr") {
        qualityDimensionArray = transliterateContentToCyrillic(qualityDimensionSr);
    }

    return (qualityDimensionArray.find(item => item.value === value) || {}).title;
};

export const getQualityDimensionsForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return qualityDimensionSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(qualityDimensionSr);
        case "en":
            return qualityDimensionEn;
    }
};
