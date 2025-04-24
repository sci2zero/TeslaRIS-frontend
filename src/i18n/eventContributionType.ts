import { EventContributionType } from "@/models/EventModel";
import { getNameFromOrdinal } from "@/utils/EnumUtil";
import i18n from ".";

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
    { title: "Presedavajući", value: EventContributionType.CHAIR },
    { title: "Demonstrator", value: EventContributionType.DEMONSTRATOR },
];

export const getTitleFromValue = (value: EventContributionType, contributionTypeArray: {title: string, value: EventContributionType}[]) => {
    return (contributionTypeArray.find(item => getNameFromOrdinal(EventContributionType, item.value) === value.toString()) || {}).title;
};

export const getTitleFromValueAutoLocale = (value: EventContributionType) => {
    const locale = i18n.vueI18n.global.locale;

    let contributionTypeArray = contributionTypesEn;
    if (locale == "sr") {
        contributionTypeArray = contributionTypesSr;
    }

    if (typeof value === "number") {
        return (contributionTypeArray.find(item => item.value === value) || {}).title;
    } else if (typeof value === "string") {
        return (contributionTypeArray.find(item => getNameFromOrdinal(EventContributionType, item.value) === value) || {}).title;
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
