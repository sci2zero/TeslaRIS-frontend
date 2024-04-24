import { DocumentContributionType } from "@/models/PublicationModel";
import i18n from ".";


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

export const getTitleFromValueAutoLocale = (value: DocumentContributionType) => {
    const locale = i18n.vueI18n.global.locale;
    
    let resourceTypeArray = contributionTypesEn;
    if (locale == "sr") {
        resourceTypeArray = contributionTypesSr;
    }

    return (resourceTypeArray.find(item => item.value === value) || {}).title;
};

export const getTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return contributionTypesSr;
        case "en":
            return contributionTypesEn;
    }
}
