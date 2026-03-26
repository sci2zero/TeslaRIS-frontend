import { EducationStatus } from "@/models/InvolvementModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

export const educationStatusSr = [
    { title: "U toku", value: EducationStatus.ONGOING },
    { title: "Pohađao/la", value: EducationStatus.ATTENDED },
    { title: "Završeno", value: EducationStatus.CONCLUDED }
];

export const educationStatusEn = [
    { title: "Ongoing", value: EducationStatus.ONGOING },
    { title: "Attended", value: EducationStatus.ATTENDED },
    { title: "Concluded", value: EducationStatus.CONCLUDED }
];

export const getEducationStatusTitleFromValueAutoLocale = (value: EducationStatus) => {
    const locale = i18n.vueI18n.global.locale;

    let educationStatusArray = educationStatusEn;
    if (locale == "sr") {
        educationStatusArray = educationStatusSr;
    } else if (locale == "sr-cyr") {
        educationStatusArray = transliterateContentToCyrillic(educationStatusSr);
    }

    return (educationStatusArray.find(item => item.value === value) || {}).title;
};

export const getEducationStatusesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return educationStatusSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(educationStatusEn);
        case "en":
            return educationStatusEn;
    }
};
