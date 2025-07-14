import { AccessLevel } from "@/models/Common";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

export const accessLevelSr = [
    { title: "Otvoren", value: AccessLevel.OPEN },
    { title: "Zatvoren", value: AccessLevel.CLOSED },
    { title: "Samo admin", value: AccessLevel.ADMIN_ONLY },
];

export const accessLevelEn = [
    { title: "Open", value: AccessLevel.OPEN },
    { title: "Closed", value: AccessLevel.CLOSED },
    { title: "Only Admin", value: AccessLevel.ADMIN_ONLY },
];

export const getTitleFromValueAutoLocale = (value: AccessLevel) => {
    const locale = i18n.vueI18n.global.locale;

    let accessLevelArray = accessLevelEn;
    if (locale == "sr") {
        accessLevelArray = accessLevelSr;
    } else if (locale == "sr-cyr") {
        accessLevelArray = transliterateContentToCyrillic(accessLevelSr);
    }

    return (accessLevelArray.find(item => item.value === value) || {}).title;
};

export const getAccessLevelForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return accessLevelSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(accessLevelSr);
        case "en":
            return accessLevelEn;
    }
};
