import { FundingLocationType } from "@/models/FundingModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

export const fundingLocationTypeSr = [
    { title: "Nacionalno", value: FundingLocationType.NATIONAL },
    { title: "U inostranstvu", value: FundingLocationType.ABROAD },
    { title: "Mešovito", value: FundingLocationType.MIXED }
];

export const fundingLocationTypeEn = [
    { title: "National", value: FundingLocationType.NATIONAL },
    { title: "Abroad", value: FundingLocationType.ABROAD },
    { title: "Mixed", value: FundingLocationType.MIXED }
];

export const getFundingLocationTypeTitleFromValueAutoLocale = (value: FundingLocationType) => {
    const locale = i18n.vueI18n.global.locale;

    let fundingLocationTypeArray = fundingLocationTypeEn;
    if (locale == "sr") {
        fundingLocationTypeArray = fundingLocationTypeSr;
    } else if (locale == "sr-cyr") {
        fundingLocationTypeArray = transliterateContentToCyrillic(fundingLocationTypeSr);
    }

    return (fundingLocationTypeArray.find(item => item.value === value) || {}).title;
};

export const getFundingLocationTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return fundingLocationTypeSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(fundingLocationTypeSr);
        case "en":
            return fundingLocationTypeEn;
    }
};
