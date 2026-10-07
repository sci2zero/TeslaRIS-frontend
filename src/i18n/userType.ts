import type { Composer } from "vue-i18n";
import { UserRole } from "@/models/UserModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

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

/**
 * Labels that the same role carries when the user it belongs to has no institution. The role is
 * unchanged, only what it is called: a vice dean answers for one faculty, whereas the same account
 * without an institution covers the whole repository.
 */
const unboundRoleLabelKeys: Partial<Record<UserRole | string, string>> = {
    [UserRole.VICE_DEAN_FOR_SCIENCE]: "addResearchInformationManagerLabel"
};

export const getTitleFromValueAutoLocale = (value: UserRole | string,
                                            boundToInstitution: boolean = true) => {
    if (!boundToInstitution && unboundRoleLabelKeys[value]) {
        // Read through i18n rather than the arrays below, so the Cyrillic form comes from the
        // transliteration the message bundles already do.
        return (i18n.vueI18n.global as Composer).t(unboundRoleLabelKeys[value] as string);
    }

    const locale = i18n.vueI18n.global.locale;

    let userTypeArray = userTypesEn;
    if (locale == "sr") {
        userTypeArray = userTypesSr;
    } else if (locale == "sr-cyr") {
        userTypeArray = transliterateContentToCyrillic(userTypesSr);
    }

    return (userTypeArray.find(item => item.value === value) || {}).title;
};

export const getUserTypeForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return userTypesSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(userTypesSr);
        case "en":
            return userTypesEn;
    }
};
