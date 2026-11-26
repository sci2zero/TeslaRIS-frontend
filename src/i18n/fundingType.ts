import { FundingType } from "@/models/FundingModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

export const fundingTypeSr = [
    { title: "Grant", value: FundingType.GRANT },
    { title: "Poziv", value: FundingType.CALL },
    { title: "Program finansiranja", value: FundingType.FUNDING_PROGRAM },
    { title: "Ugovor", value: FundingType.CONTRACT },
    { title: "Poklon", value: FundingType.GIFT },
    { title: "Tender", value: FundingType.TENDER },
    { title: "Interno finansiranje", value: FundingType.INTERNAL_FUNDING },
    { title: "Nagrada", value: FundingType.AWARD },
    { title: "Projekat", value: FundingType.PROJECT },
    { title: "Zaposlenje", value: FundingType.EMPLOYMENT },
    { title: "Institucionalno finansiranje", value: FundingType.INSTITUTIONAL_FUNDING },
    { title: "Dodela resursa", value: FundingType.RESOURCE_ALLOCATION },
    { title: "Ostalo", value: FundingType.OTHER }
];

export const fundingTypeEn = [
    { title: "Grant", value: FundingType.GRANT },
    { title: "Call", value: FundingType.CALL },
    { title: "Funding program", value: FundingType.FUNDING_PROGRAM },
    { title: "Contract", value: FundingType.CONTRACT },
    { title: "Gift", value: FundingType.GIFT },
    { title: "Tender", value: FundingType.TENDER },
    { title: "Internal funding", value: FundingType.INTERNAL_FUNDING },
    { title: "Award", value: FundingType.AWARD },
    { title: "Project", value: FundingType.PROJECT },
    { title: "Employment", value: FundingType.EMPLOYMENT },
    { title: "Institutional funding", value: FundingType.INSTITUTIONAL_FUNDING },
    { title: "Resource allocation", value: FundingType.RESOURCE_ALLOCATION },
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