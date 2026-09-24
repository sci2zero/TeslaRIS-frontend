import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

export const issueTargetSr = [
    { title: "Osoba", value: "Person" },
    { title: "Organizaciona jedinica", value: "OrganisationUnit" },
    { title: "Dokument", value: "Document" },
    { title: "Aktivnost", value: "Activity" },
    { title: "Projekat", value: "Project" },
    { title: "Finansiranje", value: "Funding" },
    { title: "Kontakt", value: "Contact" },
    { title: "Identifikator", value: "Identifier" },
    { title: "Oblast istraživanja", value: "ResearchArea" },
    { title: "Jezik", value: "Language" },
    { title: "Država", value: "Country" },
    { title: "Geolokacija", value: "GeoLocation" },
    { title: "Događaj", value: "Event" },
    { title: "Serijska publikacija", value: "PublicationSeries" },
    { title: "Izdavač", value: "Publisher" }
];

export const issueTargetEn = [
    { title: "Person", value: "Person" },
    { title: "Organisation unit", value: "OrganisationUnit" },
    { title: "Document", value: "Document" },
    { title: "Activity", value: "Activity" },
    { title: "Project", value: "Project" },
    { title: "Funding", value: "Funding" },
    { title: "Contact", value: "Contact" },
    { title: "Identifier", value: "Identifier" },
    { title: "Research area", value: "ResearchArea" },
    { title: "Language", value: "Language" },
    { title: "Country", value: "Country" },
    { title: "Geolocation", value: "GeoLocation" },
    { title: "Event", value: "Event" },
    { title: "Publication series", value: "PublicationSeries" },
    { title: "Publisher", value: "Publisher" }
];

const issueTargetsForLocale = () => {
    const locale = i18n.vueI18n.global.locale;

    if (locale == "sr") {
        return issueTargetSr;
    } else if (locale == "sr-cyr") {
        return transliterateContentToCyrillic(issueTargetSr);
    }

    return issueTargetEn;
};

export const getIssueTargetTitleFromValueAutoLocale = (value: string | undefined) => {
    if (!value) {
        return value;
    }

    return (issueTargetsForLocale().find(item => item.value === value) || {}).title ?? value;
};

export const getIssueTargetsForGivenLocale = (targets: readonly string[]) =>
    issueTargetsForLocale().filter(item => targets.includes(item.value));
