import { FundingType } from "@/models/FundingModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

export const fundingTypeSr = [
    { title: "Grant", value: FundingType.GRANT },
    { title: "Poziv", value: FundingType.CALL },
    { title: "Ostalo", value: FundingType.OTHER }
];

export const fundingTypeEn = [
    { title: "Grant", value: FundingType.GRANT },
    { title: "Call", value: FundingType.CALL },
    { title: "Other", value: FundingType.OTHER }
];

export const getFundingTypeTitleFromValueAutoLocale = (value: FundingType) => {
    const locale = i18n.vueI18n.global.locale;

    let fundingTypeArray = fundingTypeEn;
    if (locale == "sr") {
        fundingTypeArray = fundingTypeSr;
    } else if (locale == "sr-cyr") {
        fundingTypeArray = transliterateContentToCyrillic(fundingTypeSr);
    }

    return (fundingTypeArray.find(item => item.value === value) || {}).title;
};

export const getFundingTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return fundingTypeSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(fundingTypeSr);
        case "en":
            return fundingTypeEn;
    }
};