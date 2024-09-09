import { ThesisType } from "@/models/PublicationModel";
import i18n from ".";

export const thesisTypeSr = [
    { title: "Diplomski rad", value: ThesisType.BACHELOR },
    { title: "Magistarski rad", value: ThesisType.MR },
    { title: "Master rad", value: ThesisType.MASTER },
    { title: "Doktorska disertacija", value: ThesisType.PHD }
];

export const thesisTypeEn = [
    { title: "Bachelor thesis", value: ThesisType.BACHELOR },
    { title: "Magister thesis", value: ThesisType.MR },
    { title: "Master thesis", value: ThesisType.MASTER },
    { title: "Doctoral dissertation", value: ThesisType.PHD }
];

export const getTitleFromValueAutoLocale = (value: ThesisType) => {
    const locale = i18n.vueI18n.global.locale;

    let resourceTypeArray = thesisTypeEn;
    if (locale == "sr") {
        resourceTypeArray = thesisTypeSr;
    }

    return (resourceTypeArray.find(item => item.value === value) || {}).title;
};

export const getThesisTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return thesisTypeSr;
        case "en":
            return thesisTypeEn;
    }
}
