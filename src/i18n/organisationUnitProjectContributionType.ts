import { OrganisationUnitProjectContributionType } from "@/models/ProjectModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

export const organisationUnitProjectContributionTypeSr = [
    { title: "Koordinator", value: OrganisationUnitProjectContributionType.COORDINATOR },
    { title: "Partner", value: OrganisationUnitProjectContributionType.PARTNER },
    { title: "Član konzorcijuma", value: OrganisationUnitProjectContributionType.CONSORTIUM_MEMBER },
    { title: "Doprinos u naturi", value: OrganisationUnitProjectContributionType.INKIND_CONTRIBUTOR },
    { title: "Izvođač", value: OrganisationUnitProjectContributionType.CONTRACTOR },
    { title: "Korisnik", value: OrganisationUnitProjectContributionType.BENEFICIARY }
];

export const organisationUnitProjectContributionTypeEn = [
    { title: "Coordinator", value: OrganisationUnitProjectContributionType.COORDINATOR },
    { title: "Partner", value: OrganisationUnitProjectContributionType.PARTNER },
    { title: "Consortium member", value: OrganisationUnitProjectContributionType.CONSORTIUM_MEMBER },
    { title: "In-kind contributor", value: OrganisationUnitProjectContributionType.INKIND_CONTRIBUTOR },
    { title: "Contractor", value: OrganisationUnitProjectContributionType.CONTRACTOR },
    { title: "Beneficiary", value: OrganisationUnitProjectContributionType.BENEFICIARY }
];

export const getOrganisationUnitProjectContributionTypeTitleFromValueAutoLocale = (value: OrganisationUnitProjectContributionType) => {
    const locale = i18n.vueI18n.global.locale;

    let organisationUnitProjectContributionTypeArray = organisationUnitProjectContributionTypeEn;
    if (locale == "sr") {
        organisationUnitProjectContributionTypeArray = organisationUnitProjectContributionTypeSr;
    } else if (locale == "sr-cyr") {
        organisationUnitProjectContributionTypeArray = transliterateContentToCyrillic(organisationUnitProjectContributionTypeSr);
    }

    return (organisationUnitProjectContributionTypeArray.find(item => item.value === value) || {}).title;
};

export const getOrganisationUnitProjectContributionTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return organisationUnitProjectContributionTypeSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(organisationUnitProjectContributionTypeSr);
        case "en":
            return organisationUnitProjectContributionTypeEn;
    }
};
