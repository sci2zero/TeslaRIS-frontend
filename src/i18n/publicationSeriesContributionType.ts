import { PublicationSeriesContributionType } from "@/models/PublicationSeriesModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

export const contributionTypesEn = [
    { title: "Editor", value: PublicationSeriesContributionType.EDITOR },
    { title: "Associate editor", value: PublicationSeriesContributionType.ASSOCIATE_EDITOR },
    { title: "Invited editor", value: PublicationSeriesContributionType.INVITED_EDITOR },
    { title: "Reviewer", value: PublicationSeriesContributionType.REVIEWER },
    { title: "Ad hoc reviewer", value: PublicationSeriesContributionType.ADHOC_REVIEWER },
    { title: "Scientific board member", value: PublicationSeriesContributionType.SCIENTIFIC_BOARD_MEMBER }
];

export const contributionTypesSr = [
    { title: "Urednik", value: PublicationSeriesContributionType.EDITOR },
    { title: "Urednik-saradnik", value: PublicationSeriesContributionType.ASSOCIATE_EDITOR },
    { title: "Pozvani urednik", value: PublicationSeriesContributionType.INVITED_EDITOR },
    { title: "Recenzent", value: PublicationSeriesContributionType.REVIEWER },
    { title: "Ad hok recenzent", value: PublicationSeriesContributionType.ADHOC_REVIEWER },
    { title: "Član naučnog odbora", value: PublicationSeriesContributionType.SCIENTIFIC_BOARD_MEMBER },
];

export const getTitleFromValue = (value: PublicationSeriesContributionType, contributionTypeArray: {title: string, value: PublicationSeriesContributionType}[]) => {
    return (contributionTypeArray.find(item => item.value === value) || {}).title;
};

export const getTitleFromValueAutoLocale = (value: PublicationSeriesContributionType) => {
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
