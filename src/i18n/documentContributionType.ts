import { DocumentContributionType } from "@/models/PublicationModel";


export const contributionTypesEn = [
    { title: "Author", value: DocumentContributionType.AUTHOR },
    { title: "Editor", value: DocumentContributionType.EDITOR },
    { title: "Reviewer", value: DocumentContributionType.REVIEWER },
    { title: "Advisor", value: DocumentContributionType.ADVISOR },
];

export const contributionTypesSr = [
    { title: "Autor", value: DocumentContributionType.AUTHOR },
    { title: "Urednik", value: DocumentContributionType.EDITOR },
    { title: "Recenzent", value: DocumentContributionType.REVIEWER },
    { title: "Savetnik", value: DocumentContributionType.ADVISOR },
];

export const getTitleFromValueAutoLocale = (value: DocumentContributionType, locale: string) => {
    let resourceTypeArray = contributionTypesEn;
    if (locale == "sr") {
        resourceTypeArray = contributionTypesSr;
    }

    return (resourceTypeArray.find(item => item.value === value) || {}).title;
};

export const getTypesForGivenLocale = (locale: string) => {
    switch(locale) {
        case "sr":
            return contributionTypesSr;
        case "en":
            return contributionTypesEn;
    }
}
