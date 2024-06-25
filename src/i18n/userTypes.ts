import { UserRole } from "@/models/UserModel";
import i18n from ".";

export const userTypesSr = [
    { title: "Administrator", value: UserRole.ADMIN },
    { title: "Istraživač", value: UserRole.RESEARCHER },
    { title: "Institucioni urednik", value: UserRole.INSTITUTIONAL_EDITOR },
];

export const userTypesEn = [
    { title: "Administrator", value: UserRole.ADMIN },
    { title: "Researcher", value: UserRole.RESEARCHER },
    { title: "Institutional editor", value: UserRole.INSTITUTIONAL_EDITOR },
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