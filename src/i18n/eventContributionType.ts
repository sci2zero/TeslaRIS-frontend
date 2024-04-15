import { EventContributionType } from "@/models/EventModel";
import { getNameFromOrdinal } from "@/utils/EnumUtil";

export const contributionTypesEn = [
    {title: "Organisation Board Chair", value: EventContributionType.ORGANIZATION_BOARD_CHAIR},
    {title: "Organisation Board Members", value: EventContributionType.ORGANIZATION_BOARD_MEMBER},
    {title: "Panelists", value: EventContributionType.PANELISTS},
    {title: "Audience", value: EventContributionType.AUDIENCE},
    {title: "Programme Board Member", value: EventContributionType.PROGRAMME_BOARD_MEMBER},
    {title: "Reviewer", value: EventContributionType.REVIEWER},
    {title: "Speaker", value: EventContributionType.SPEAKER},
    {title: "Chair", value: EventContributionType.CHAIR},
    {title: "Demonstrator", value: EventContributionType.DEMONSTRATOR},
]

export const contributionTypesSr = [
    { title: "Predsednik Organizacionog Odbora", value: EventContributionType.ORGANIZATION_BOARD_CHAIR },
    { title: "Član Organizacionog Odbora", value: EventContributionType.ORGANIZATION_BOARD_MEMBER },
    { title: "Panelist", value: EventContributionType.PANELISTS },
    { title: "Publika", value: EventContributionType.AUDIENCE },
    { title: "Član Programskog Odbora", value: EventContributionType.PROGRAMME_BOARD_MEMBER },
    { title: "Recenzent", value: EventContributionType.REVIEWER },
    { title: "Govornik", value: EventContributionType.SPEAKER },
    { title: "Član Odbora", value: EventContributionType.CHAIR },
    { title: "Demonstrator", value: EventContributionType.DEMONSTRATOR },
];

export const getTitleFromValue = (value: EventContributionType, resourceTypeArray: {title: string, value: EventContributionType}[]) => {
    return (resourceTypeArray.find(item => getNameFromOrdinal(EventContributionType, item.value) === value.toString()) || {}).title;
};

export const getTitleFromValueAutoLocale = (value: EventContributionType, locale: string) => {
    let resourceTypeArray = contributionTypesEn;
    if (locale == "sr") {
        resourceTypeArray = contributionTypesSr;
    }

    if (typeof value === "number") {
        return (resourceTypeArray.find(item => item.value === value) || {}).title;
    } else if (typeof value === "string") {
        return (resourceTypeArray.find(item => getNameFromOrdinal(EventContributionType, item.value) === value) || {}).title;
    }
};

export const getTypesForGivenLocale = (locale: string) => {
    switch(locale) {
        case "sr":
            return contributionTypesSr;
        case "en":
            return contributionTypesEn;
    }
}
