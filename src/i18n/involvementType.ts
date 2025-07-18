import { InvolvementType } from "@/models/InvolvementModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

const involvementTypeEn = [
    { title: "Studied At", value: InvolvementType.STUDIED_AT },
    { title: "Completed Course At", value: InvolvementType.COMPLETED_COURSE_AT },
    { title: "Postdoc At", value: InvolvementType.POSTDOC_AT },
    { title: "Member Of", value: InvolvementType.MEMBER_OF },
    { title: "Employed At", value: InvolvementType.EMPLOYED_AT },
    { title: "Hired By", value: InvolvementType.HIRED_BY },
    { title: "Candidate", value: InvolvementType.CANDIDATE }
];

const involvementTypeSr = [
    { title: "Studije", value: InvolvementType.STUDIED_AT },
    { title: "Kompletiran kurs", value: InvolvementType.COMPLETED_COURSE_AT },
    { title: "Post-doktorske studije", value: InvolvementType.POSTDOC_AT },
    { title: "Članstvo", value: InvolvementType.MEMBER_OF },
    { title: "Zaposlenje", value: InvolvementType.EMPLOYED_AT },
    { title: "Angažovanje", value: InvolvementType.HIRED_BY },
    { title: "Kandidat", value: InvolvementType.CANDIDATE },
];

export const getTitleFromValue = (value: InvolvementType, involvementTypeArray: {title: string, value: InvolvementType}[]) => {
    return (involvementTypeArray.find(item => item.value === value.toString()) || {}).title;
};

export const getInvolvementTypeTitleFromValueAutoLocale = (value: InvolvementType) => {
    const locale = i18n.vueI18n.global.locale;

    let involvementTypeArray = involvementTypeEn;
    if (locale == "sr") {
        involvementTypeArray = involvementTypeSr;
    } else if (locale == "sr-cyr") {
        involvementTypeArray = transliterateContentToCyrillic(involvementTypeSr);
    }

    return (involvementTypeArray.find(item => item.value === value) || {}).title;
};

export const getInvolvementTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return involvementTypeSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(involvementTypeSr);
        case "en":
            return involvementTypeEn;
    }
}

export const getSimilarInvolvementTypes = (type: InvolvementType) => {
    let involvementTypeArray;
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            involvementTypeArray = involvementTypeSr;
            break;
        case "en":
            involvementTypeArray = involvementTypeEn;
            break;
    }

    if(type == InvolvementType.MEMBER_OF) {
        return involvementTypeArray?.filter(involvementType => involvementType.value === InvolvementType.MEMBER_OF);
    } 
    else if(type == InvolvementType.HIRED_BY ||
            type == InvolvementType.EMPLOYED_AT ||
            type == InvolvementType.CANDIDATE) {
        return involvementTypeArray?.filter(involvementType => involvementType.value === InvolvementType.HIRED_BY || involvementType.value === InvolvementType.EMPLOYED_AT || involvementType.value === InvolvementType.CANDIDATE);
    } 
    else if(type == InvolvementType.STUDIED_AT ||
            type == InvolvementType.POSTDOC_AT ||
            type == InvolvementType.COMPLETED_COURSE_AT) {
        return involvementTypeArray?.filter(involvementType => involvementType.value === InvolvementType.STUDIED_AT || involvementType.value === InvolvementType.POSTDOC_AT || involvementType.value === InvolvementType.COMPLETED_COURSE_AT);
    }
}
