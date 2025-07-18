import { UserRole } from "@/models/UserModel";
import i18n from ".";

export const userTypesSr = [
    { title: "Administrator", value: UserRole.ADMIN },
    { title: "Istraživač", value: UserRole.RESEARCHER },
    { title: "Institucionalni urednik", value: UserRole.INSTITUTIONAL_EDITOR },
    { title: "Komisija", value: UserRole.COMMISSION },
    { title: "Prodekan za nauku", value: UserRole.VICE_DEAN_FOR_SCIENCE },
    { title: "Institucionalni bibliotekar", value: UserRole.INSTITUTIONAL_LIBRARIAN },
    { title: "Administrator biblioteke", value: UserRole.HEAD_OF_LIBRARY },
    { title: "Administrator matične knjige", value: UserRole.PROMOTION_REGISTRY_ADMINISTRATOR }
];

export const userTypesEn = [
    { title: "Administrator", value: UserRole.ADMIN },
    { title: "Researcher", value: UserRole.RESEARCHER },
    { title: "Institutional editor", value: UserRole.INSTITUTIONAL_EDITOR },
    { title: "Commission", value: UserRole.COMMISSION },
    { title: "Vice dean for science", value: UserRole.VICE_DEAN_FOR_SCIENCE },
    { title: "Institutional librarian", value: UserRole.INSTITUTIONAL_LIBRARIAN },
    { title: "Library administrator", value: UserRole.HEAD_OF_LIBRARY },
    { title: "Promotion registry admin", value: UserRole.PROMOTION_REGISTRY_ADMINISTRATOR }
];

export const getTitleFromValueAutoLocale = (value: UserRole | string) => {
    const locale = i18n.vueI18n.global.locale;

    let userTypeArray = userTypesEn;
    if (locale == "sr") {
        userTypeArray = userTypesSr;
    }

    return (userTypeArray.find(item => item.value === value) || {}).title;
};

export const getUserTypeForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return userTypesSr;
        case "en":
            return userTypesEn;
    }
}