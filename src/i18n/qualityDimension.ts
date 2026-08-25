import { QualityDimension } from "@/models/RevisionModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

export const qualityDimensionSr = [
    { title: "Potpunost", value: QualityDimension.COMPLETENESS },
    { title: "Ispravnost", value: QualityDimension.VALIDITY },
    { title: "Jedinstvenost", value: QualityDimension.UNIQUENESS },
    { title: "Doslednost", value: QualityDimension.CONSISTENCY },
    { title: "Ažurnost", value: QualityDimension.TIMELINESS },
    { title: "Tačnost", value: QualityDimension.ACCURACY },
    { title: "Usaglašenost", value: QualityDimension.CONFORMITY },
    { title: "Integritet", value: QualityDimension.INTEGRITY }
];

export const qualityDimensionEn = [
    { title: "Completeness", value: QualityDimension.COMPLETENESS },
    { title: "Validity", value: QualityDimension.VALIDITY },
    { title: "Uniqueness", value: QualityDimension.UNIQUENESS },
    { title: "Consistency", value: QualityDimension.CONSISTENCY },
    { title: "Timeliness", value: QualityDimension.TIMELINESS },
    { title: "Accuracy", value: QualityDimension.ACCURACY },
    { title: "Conformity", value: QualityDimension.CONFORMITY },
    { title: "Integrity", value: QualityDimension.INTEGRITY }
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
