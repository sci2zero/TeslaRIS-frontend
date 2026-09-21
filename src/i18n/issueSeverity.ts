import { IssueSeverity } from "@/models/RevisionModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

export const issueSeveritySr = [
    { title: "Greška", value: IssueSeverity.ERROR },
    { title: "Upozorenje", value: IssueSeverity.WARNING },
    { title: "Informacija", value: IssueSeverity.INFO }
];

export const issueSeverityEn = [
    { title: "Error", value: IssueSeverity.ERROR },
    { title: "Warning", value: IssueSeverity.WARNING },
    { title: "Info", value: IssueSeverity.INFO }
];

export const getIssueSeverityTitleFromValueAutoLocale = (value: IssueSeverity) => {
    const locale = i18n.vueI18n.global.locale;

    let issueSeverityArray = issueSeverityEn;
    if (locale == "sr") {
        issueSeverityArray = issueSeveritySr;
    } else if (locale == "sr-cyr") {
        issueSeverityArray = transliterateContentToCyrillic(issueSeveritySr);
    }

    return (issueSeverityArray.find(item => item.value === value) || {}).title;
};

export const getIssueSeveritiesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return issueSeveritySr;
        case "sr-cyr":
            return transliterateContentToCyrillic(issueSeveritySr);
        case "en":
            return issueSeverityEn;
    }
};
