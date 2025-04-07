import { UserRole } from "@/models/UserModel";
import i18n from ".";

export const userTypesSr = [
    { title: "Administrator", value: UserRole.ADMIN },
    { title: "Istraživač", value: UserRole.RESEARCHER },
    { title: "Institucioni urednik", value: UserRole.INSTITUTIONAL_EDITOR },
    { title: "Komisija", value: UserRole.COMMISSION },
    { title: "Prodekan za nauku", value: UserRole.VICE_DEAN_FOR_SCIENCE },
    { title: "Institucioni bibliotekar", value: UserRole.INSTITUTIONAL_LIBRARIAN },
    { title: "Administrator biblioteke", value: UserRole.HEAD_OF_LIBRARY }
];

export const userTypesEn = [
    { title: "Administrator", value: UserRole.ADMIN },
    { title: "Researcher", value: UserRole.RESEARCHER },
    { title: "Institutional editor", value: UserRole.INSTITUTIONAL_EDITOR },
    { title: "Commission", value: UserRole.COMMISSION },
    { title: "Vice dean for science", value: UserRole.VICE_DEAN_FOR_SCIENCE },
    { title: "Institutional librarian", value: UserRole.INSTITUTIONAL_LIBRARIAN },
    { title: "Library administrator", value: UserRole.HEAD_OF_LIBRARY }
];

export const getTitleFromValueAutoLocale = (value: UserRole | string) => {
    const locale = i18n.vueI18n.global.locale;

    let resourceTypeArray = userTypesEn;
    if (locale == "sr") {
        resourceTypeArray = userTypesSr;
    }

    return (resourceTypeArray.find(item => item.value === value) || {}).title;
};

export const getUserTypeForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return userTypesSr;
        case "en":
            return userTypesEn;
    }
}