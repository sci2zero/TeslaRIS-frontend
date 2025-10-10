import { CollaborationType } from "@/models/Common";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";


export const collaborationTypeSr = [
    { title: "Koautorstvo", value: CollaborationType.COAUTHORSHIP },
    { title: "Mentorstvo", value: CollaborationType.MENTORSHIP },
    { title: "Komentrostvo", value: CollaborationType.CO_MENTORSHIP },
    { title: "Kouredništvo", value: CollaborationType.CO_EDITORSHIP },
    { title: "Kočlanstvo u komisiji", value: CollaborationType.CO_MEMBERSHIP_COMMISSION }
];

export const collaborationTypeEn = [
    { title: "Coautorship", value: CollaborationType.COAUTHORSHIP },
    { title: "Mentorship", value: CollaborationType.MENTORSHIP },
    { title: "Co-mentorship", value: CollaborationType.CO_MENTORSHIP },
    { title: "Co-editorship", value: CollaborationType.CO_EDITORSHIP },
    { title: "Co-membership (commission)", value: CollaborationType.CO_MEMBERSHIP_COMMISSION }
];

export const getCollaborationTypeTitleFromValueAutoLocale = (value: CollaborationType) => {
    const locale = i18n.vueI18n.global.locale;

    let collaborationTypeArray = collaborationTypeEn;
    if (locale == "sr") {
        collaborationTypeArray = collaborationTypeSr;
    } else if (locale == "sr-cyr") {
        collaborationTypeArray = transliterateContentToCyrillic(collaborationTypeSr);
    }

    return (collaborationTypeArray.find(item => item.value === value) || {}).title;
};

export const getCollaborationTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return collaborationTypeSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(collaborationTypeSr);
        case "en":
            return collaborationTypeEn;
    }

    return [];
};
