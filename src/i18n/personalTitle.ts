import { PersonalTitle } from "@/models/InvolvementModel";
import i18n from ".";


const employmentPositionsEn = [
    { title: "Doctor", value: PersonalTitle.DR },
    { title: "Academic", value: PersonalTitle.ACADEMIC },
    { title: "Doctor of art", value: PersonalTitle.DR_ART },
    { title: "Magister", value: PersonalTitle.MR },
    { title: "None", value: PersonalTitle.NONE }
];

const employmentPositionsSr = [
    { title: "Doktor", value: PersonalTitle.DR },
    { title: "Akademik", value: PersonalTitle.ACADEMIC },
    { title: "Doktor umetnosti", value: PersonalTitle.DR_ART },
    { title: "Magistar", value: PersonalTitle.MR },
    { title: "Nema", value: PersonalTitle.NONE }
];

export const getPersonalTitleFromValueAutoLocale = (value: PersonalTitle) => {
    const locale = i18n.vueI18n.global.locale;
    
    let resourceTypeArray = employmentPositionsEn;
    if (locale == "sr") {
        resourceTypeArray = employmentPositionsSr;
    }

    return (resourceTypeArray.find(item => item.value === value) || {}).title;
};

export const getPersonalTitlesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return employmentPositionsSr;
        case "en":
            return employmentPositionsEn;
    }
};
