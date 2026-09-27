import { PersonProjectContributionType } from "@/models/ProjectModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

export const personProjectContributionTypeSr = [
    { title: "Glavni istraživač", value: PersonProjectContributionType.PRINCIPLE_INVESTIGATOR },
    { title: "Član tima", value: PersonProjectContributionType.TEAM_MEMBER },
    { title: "Kontakt osoba", value: PersonProjectContributionType.CONTACT },
    { title: "Doprinos u naturi", value: PersonProjectContributionType.INKIND_CONTRIBUTOR },
    { title: "Izvođač", value: PersonProjectContributionType.CONTRACTOR },
    { title: "Učesnik", value: PersonProjectContributionType.PARTICIPATION }
];

export const personProjectContributionTypeEn = [
    { title: "Principle investigator", value: PersonProjectContributionType.PRINCIPLE_INVESTIGATOR },
    { title: "Team member", value: PersonProjectContributionType.TEAM_MEMBER },
    { title: "Contact", value: PersonProjectContributionType.CONTACT },
    { title: "In-kind contributor", value: PersonProjectContributionType.INKIND_CONTRIBUTOR },
    { title: "Contractor", value: PersonProjectContributionType.CONTRACTOR },
    { title: "Participation", value: PersonProjectContributionType.PARTICIPATION }
];

export const getPersonProjectContributionTypeTitleFromValueAutoLocale = (value: PersonProjectContributionType) => {
    const locale = i18n.vueI18n.global.locale;

    let personProjectContributionTypeArray = personProjectContributionTypeEn;
    if (locale == "sr") {
        personProjectContributionTypeArray = personProjectContributionTypeSr;
    } else if (locale == "sr-cyr") {
        personProjectContributionTypeArray = transliterateContentToCyrillic(personProjectContributionTypeSr);
    }

    return (personProjectContributionTypeArray.find(item => item.value === value) || {}).title;
};

export const getPersonProjectContributionTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return personProjectContributionTypeSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(personProjectContributionTypeSr);
        case "en":
            return personProjectContributionTypeEn;
    }
};
