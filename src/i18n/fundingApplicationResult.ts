import { FundingApplicationResult } from "@/models/FundingApplicationModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

export const fundingApplicationResultSr = [
    { title: "Odobreno", value: FundingApplicationResult.AWARDED },
    { title: "Odbijeno", value: FundingApplicationResult.REJECTED },
    { title: "Zatražene izmene", value: FundingApplicationResult.CHANGES_REQUESTED },
    { title: "Prihvaćeno za sledeći krug", value: FundingApplicationResult.ACCEPTED_FOR_NEXT_ROUND }
];

export const fundingApplicationResultEn = [
    { title: "Awarded", value: FundingApplicationResult.AWARDED },
    { title: "Rejected", value: FundingApplicationResult.REJECTED },
    { title: "Changes requested", value: FundingApplicationResult.CHANGES_REQUESTED },
    { title: "Accepted for next round", value: FundingApplicationResult.ACCEPTED_FOR_NEXT_ROUND }
];

export const getFundingApplicationResultTitleFromValueAutoLocale = (value: FundingApplicationResult) => {
    const locale = i18n.vueI18n.global.locale;

    let fundingApplicationResultArray = fundingApplicationResultEn;
    if (locale == "sr") {
        fundingApplicationResultArray = fundingApplicationResultSr;
    } else if (locale == "sr-cyr") {
        fundingApplicationResultArray = transliterateContentToCyrillic(fundingApplicationResultSr);
    }

    return (fundingApplicationResultArray.find(item => item.value === value) || {}).title;
};

export const getFundingApplicationResultColor = (result: FundingApplicationResult) => {
    switch (result) {
        case FundingApplicationResult.AWARDED:
            return "success";
        case FundingApplicationResult.REJECTED:
            return "error";
        case FundingApplicationResult.CHANGES_REQUESTED:
            return "warning";
        case FundingApplicationResult.ACCEPTED_FOR_NEXT_ROUND:
            return "info";
        default:
            return "primary";
    }
};

export const getFundingApplicationResultsForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return fundingApplicationResultSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(fundingApplicationResultSr);
        case "en":
            return fundingApplicationResultEn;
    }
};
