import { FundingCallContributionType } from "@/models/FundingCallModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

export const contributionTypesEn = [
    { title: "Organizer", value: FundingCallContributionType.ORGANIZER },
    { title: "Coordinator", value: FundingCallContributionType.COORDINATOR },
    { title: "Assessment board president", value: FundingCallContributionType.ASSESSMENT_BOARD_PRESIDENT },
    { title: "Assessment board vice president", value: FundingCallContributionType.ASSESSMENT_BOARD_VICEPRESIDENT },
    { title: "Assessment board member", value: FundingCallContributionType.ASSESSMENT_BOARD_MEMBER },
    { title: "Assessment evaluator", value: FundingCallContributionType.ASSESSMENT_EVALUATOR },
    { title: "Assessment specialist", value: FundingCallContributionType.ASSESSMENT_SPECIALIST },
    { title: "Assessment - other", value: FundingCallContributionType.ASSESSMENT_OTHER },
    { title: "Applicant", value: FundingCallContributionType.APPLICANT },
    { title: "Other contributors", value: FundingCallContributionType.OTHER_CONTRIBUTORS },
];

export const contributionTypesSr = [
    { title: "Organizator", value: FundingCallContributionType.ORGANIZER },
    { title: "Koordinator", value: FundingCallContributionType.COORDINATOR },
    { title: "Predsednik komisije za ocenu", value: FundingCallContributionType.ASSESSMENT_BOARD_PRESIDENT },
    { title: "Zamenik predsednika komisije za ocenu", value: FundingCallContributionType.ASSESSMENT_BOARD_VICEPRESIDENT },
    { title: "Član komisije za ocenu", value: FundingCallContributionType.ASSESSMENT_BOARD_MEMBER },
    { title: "Ocenjivač", value: FundingCallContributionType.ASSESSMENT_EVALUATOR },
    { title: "Stručnjak za ocenu", value: FundingCallContributionType.ASSESSMENT_SPECIALIST },
    { title: "Ocena - ostalo", value: FundingCallContributionType.ASSESSMENT_OTHER },
    { title: "Podnosilac prijave", value: FundingCallContributionType.APPLICANT },
    { title: "Ostali učesnici", value: FundingCallContributionType.OTHER_CONTRIBUTORS },
];

export const getTitleFromValue = (value: FundingCallContributionType, contributionTypeArray: {title: string, value: FundingCallContributionType}[]) => {
    return (contributionTypeArray.find(item => item.value === value) || {}).title;
};

export const getTitleFromValueAutoLocale = (value: FundingCallContributionType) => {
    const locale = i18n.vueI18n.global.locale;

    let contributionTypeArray = contributionTypesEn;
    if (locale == "sr") {
        contributionTypeArray = contributionTypesSr;
    } else if (locale == "sr-cyr") {
        contributionTypeArray = transliterateContentToCyrillic(contributionTypesSr);
    }

    return (contributionTypeArray.find(item => item.value === value) || {}).title;
};

export const getTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return contributionTypesSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(contributionTypesSr);
        case "en":
            return contributionTypesEn;
    }
}
