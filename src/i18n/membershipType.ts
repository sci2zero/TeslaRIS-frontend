import { MembershipType } from "@/models/InvolvementModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

export const membershipTypeSr = [
    { title: "Predsednik", value: MembershipType.PRESIDENT },
    { title: "Potpredsednik", value: MembershipType.VICE_PRESIDENT },
    { title: "Predsedavajući", value: MembershipType.CHAIR },
    { title: "Zamenik predsedavajućeg", value: MembershipType.VICE_CHAIR },
    { title: "Član upravnog odbora", value: MembershipType.BOARD_MEMBER },
    { title: "Redovni član", value: MembershipType.REGULAR_MEMBER },
    { title: "Pridruženi član", value: MembershipType.ASSOCIATE_MEMBER },
    { title: "Posmatrač", value: MembershipType.OBSERVER },
    { title: "Član komisije", value: MembershipType.COMMISSION_MEMBER },
    { title: "Drugo", value: MembershipType.OTHER }
];

export const membershipTypeEn = [
    { title: "President", value: MembershipType.PRESIDENT },
    { title: "Vice President", value: MembershipType.VICE_PRESIDENT },
    { title: "Chair", value: MembershipType.CHAIR },
    { title: "Vice Chair", value: MembershipType.VICE_CHAIR },
    { title: "Board Member", value: MembershipType.BOARD_MEMBER },
    { title: "Regular Member", value: MembershipType.REGULAR_MEMBER },
    { title: "Associate Member", value: MembershipType.ASSOCIATE_MEMBER },
    { title: "Observer", value: MembershipType.OBSERVER },
    { title: "Commission member", value: MembershipType.COMMISSION_MEMBER },
    { title: "Other", value: MembershipType.OTHER }
];

export const getMembershipTypeTitleFromValueAutoLocale = (value: MembershipType) => {
    const locale = i18n.vueI18n.global.locale;

    let membershipTypeArray = membershipTypeEn;
    if (locale == "sr") {
        membershipTypeArray = membershipTypeSr;
    } else if (locale == "sr-cyr") {
        membershipTypeArray = transliterateContentToCyrillic(membershipTypeSr);
    }

    return (membershipTypeArray.find(item => item.value === value) || {}).title;
};

export const getMembershipTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return membershipTypeSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(membershipTypeEn);
        case "en":
            return membershipTypeEn;
    }
};
