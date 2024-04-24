import { PublicationSeriesContributionType } from "@/models/PublicationSeriesModel";
import { getNameFromOrdinal } from "@/utils/EnumUtil";
import i18n from ".";

export const contributionTypesEn = [
    { title: "Editor", value: PublicationSeriesContributionType.EDITOR },
    { title: "Associate Editor", value: PublicationSeriesContributionType.ASSOCIATE_EDITOR },
    { title: "Reviewer", value: PublicationSeriesContributionType.REVIEWER },
    { title: "Scientific Board Member", value: PublicationSeriesContributionType.SCIENTIFIC_BOARD_MEMBER },
];

export const contributionTypesSr = [
    { title: "Urednik", value: PublicationSeriesContributionType.EDITOR },
    { title: "Urednik-saradnik", value: PublicationSeriesContributionType.ASSOCIATE_EDITOR },
    { title: "Recenzent", value: PublicationSeriesContributionType.REVIEWER },
    { title: "Član naučnog odbora", value: PublicationSeriesContributionType.SCIENTIFIC_BOARD_MEMBER },
];

export const getTitleFromValue = (value: PublicationSeriesContributionType, resourceTypeArray: {title: string, value: PublicationSeriesContributionType}[]) => {
    return (resourceTypeArray.find(item => getNameFromOrdinal(PublicationSeriesContributionType, item.value) === value.toString()) || {}).title;
};

export const getTitleFromValueAutoLocale = (value: PublicationSeriesContributionType) => {
    const locale = i18n.vueI18n.global.locale;
    
    let resourceTypeArray = contributionTypesEn;
    if (locale == "sr") {
        resourceTypeArray = contributionTypesSr;
    }

    if (typeof value === "number") {
        return (resourceTypeArray.find(item => item.value === value) || {}).title;
    } else if (typeof value === "string") {
        return (resourceTypeArray.find(item => getNameFromOrdinal(PublicationSeriesContributionType, item.value) === value) || {}).title;
    }
};

export const getTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return contributionTypesSr;
        case "en":
            return contributionTypesEn;
    }
}
