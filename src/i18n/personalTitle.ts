import { PersonalTitle } from "@/models/InvolvementModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";


const personalTitlesEn = [
    { title: "Doctor", value: PersonalTitle.DR },
    { title: "Academic", value: PersonalTitle.ACADEMIC },
    { title: "Doctor of art", value: PersonalTitle.DR_ART },
    { title: "Magister", value: PersonalTitle.MR },
    { title: "None", value: PersonalTitle.NONE }
];

const personalTitlesSr = [
    { title: "Doktor", value: PersonalTitle.DR },
    { title: "Akademik", value: PersonalTitle.ACADEMIC },
    { title: "Doktor umetnosti", value: PersonalTitle.DR_ART },
    { title: "Magistar", value: PersonalTitle.MR },
    { title: "Nema", value: PersonalTitle.NONE }
];

export const getPersonalTitleFromValueAutoLocale = (value: PersonalTitle) => {
    const locale = i18n.vueI18n.global.locale;
    
    let personalTitleArray = personalTitlesEn;
    if (locale == "sr") {
        personalTitleArray = personalTitlesSr;
    } else if (locale == "sr-cyr") {
        personalTitleArray = transliterateContentToCyrillic(personalTitlesSr);
    }

    return (personalTitleArray.find(item => item.value === value) || {}).title;
};

export const getPersonalTitlesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return personalTitlesSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(personalTitlesSr);
        case "en":
            return personalTitlesEn;
    }
};
