import { ThesisType } from "@/models/PublicationModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

export const thesisTypeSr = [
    { title: "Strukovni diplomski rad", value: ThesisType.BACHELOR },
    { title: "Magistarski rad", value: ThesisType.MR },
    { title: "Master rad", value: ThesisType.MASTER },
    { title: "Doktorska disertacija", value: ThesisType.PHD },
    { title: "Doktorski umetnički projekat", value: ThesisType.PHD_ART_PROJECT },
    { title: "Diplomski rad", value: ThesisType.BACHELOR_WITH_HONORS },
    { title: "Specijalistički rad", value: ThesisType.UNDERGRADUATE_THESIS }
];

export const thesisTypeEn = [
    { title: "Bachelor thesis", value: ThesisType.BACHELOR },
    { title: "Magister thesis", value: ThesisType.MR },
    { title: "Master thesis", value: ThesisType.MASTER },
    { title: "Doctoral dissertation", value: ThesisType.PHD },
    { title: "Doctoral art project", value: ThesisType.PHD_ART_PROJECT },
    { title: "Bachelor with honors thesis", value: ThesisType.BACHELOR_WITH_HONORS },
    { title: "Undergraduate thesis", value: ThesisType.UNDERGRADUATE_THESIS }
];

export const getThesisTitleFromValueAutoLocale = (value: ThesisType) => {
    const locale = i18n.vueI18n.global.locale;

    let thesisTypeArray = thesisTypeEn;
    if (locale == "sr") {
        thesisTypeArray = thesisTypeSr;
    } else if (locale == "sr-cyr") {
        thesisTypeArray = transliterateContentToCyrillic(thesisTypeSr);
    }

    return (thesisTypeArray.find(item => item.value === value) || {}).title;
};

export const getThesisTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return thesisTypeSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(thesisTypeSr);
        case "en":
            return thesisTypeEn;
    }
}
