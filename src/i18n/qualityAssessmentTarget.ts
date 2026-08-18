import { QualityAssessmentTarget } from "@/models/RevisionModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

export const qualityAssessmentTargetSr = [
    { title: "Publikacije", value: QualityAssessmentTarget.DOCUMENT },
    { title: "Osobe", value: QualityAssessmentTarget.PERSON },
    { title: "Organizacione jedinice", value: QualityAssessmentTarget.ORGANISATION_UNIT },
    { title: "Događaji", value: QualityAssessmentTarget.EVENT },
    { title: "Časopisi", value: QualityAssessmentTarget.JOURNAL },
    { title: "Serije knjiga", value: QualityAssessmentTarget.BOOK_SERIES },
    { title: "Izdavači", value: QualityAssessmentTarget.PUBLISHER }
];

export const qualityAssessmentTargetEn = [
    { title: "Publications", value: QualityAssessmentTarget.DOCUMENT },
    { title: "People", value: QualityAssessmentTarget.PERSON },
    { title: "Organisation units", value: QualityAssessmentTarget.ORGANISATION_UNIT },
    { title: "Events", value: QualityAssessmentTarget.EVENT },
    { title: "Journals", value: QualityAssessmentTarget.JOURNAL },
    { title: "Book series", value: QualityAssessmentTarget.BOOK_SERIES },
    { title: "Publishers", value: QualityAssessmentTarget.PUBLISHER }
];

export const getQualityAssessmentTargetTitleFromValueAutoLocale = (value: QualityAssessmentTarget) => {
    const locale = i18n.vueI18n.global.locale;

    let qualityAssessmentTargetArray = qualityAssessmentTargetEn;
    if (locale == "sr") {
        qualityAssessmentTargetArray = qualityAssessmentTargetSr;
    } else if (locale == "sr-cyr") {
        qualityAssessmentTargetArray = transliterateContentToCyrillic(qualityAssessmentTargetSr);
    }

    return (qualityAssessmentTargetArray.find(item => item.value === value) || {}).title;
};

export const getQualityAssessmentTargetsForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return qualityAssessmentTargetSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(qualityAssessmentTargetSr);
        case "en":
            return qualityAssessmentTargetEn;
    }
};
