import { JournalPublicationType } from "@/models/PublicationModel";
import { getNameFromOrdinal } from "@/utils/EnumUtil";
import i18n from ".";

const journalPublicationTypeEn = [
    { title: "Review Article", value: JournalPublicationType.REVIEW_ARTICLE },
    { title: "Research Article", value: JournalPublicationType.RESEARCH_ARTICLE },
    { title: "Preface", value: JournalPublicationType.PREFACE },
    { title: "Comment", value: JournalPublicationType.COMMENT },
    { title: "Correction", value: JournalPublicationType.CORRECTION },
    { title: "Lexicographic Unit", value: JournalPublicationType.LEXICOGRAPHIC_UNIT },
    { title: "Polemics", value: JournalPublicationType.POLEMICS },
    { title: "Scientific Critic", value: JournalPublicationType.SCIENTIFIC_CRITIC },
];

const journalPublicationTypeSr = [
    { title: "Pregledni članak", value: JournalPublicationType.REVIEW_ARTICLE },
    { title: "Istraživački članak", value: JournalPublicationType.RESEARCH_ARTICLE },
    { title: "Predgovor", value: JournalPublicationType.PREFACE },
    { title: "Komentar", value: JournalPublicationType.COMMENT },
    { title: "Ispravka", value: JournalPublicationType.CORRECTION },
    { title: "Leksikografska jedinica", value: JournalPublicationType.LEXICOGRAPHIC_UNIT },
    { title: "Polemika", value: JournalPublicationType.POLEMICS },
    { title: "Naučna kritika", value: JournalPublicationType.SCIENTIFIC_CRITIC },
];

export const getTitleFromValue = (value: JournalPublicationType, resourceTypeArray: {title: string, value: JournalPublicationType}[]) => {
    return (resourceTypeArray.find(item => getNameFromOrdinal(JournalPublicationType, item.value) === value.toString()) || {}).title;
};

export const getTitleFromValueAutoLocale = (value: JournalPublicationType) => {
    const locale = i18n.vueI18n.global.locale;

    let resourceTypeArray = journalPublicationTypeEn;
    if (locale == "sr") {
        resourceTypeArray = journalPublicationTypeSr;
    }

    if (typeof value === "number") {
        return (resourceTypeArray.find(item => item.value === value) || {}).title;
    } else if (typeof value === "string") {
        return (resourceTypeArray.find(item => getNameFromOrdinal(JournalPublicationType, item.value) === value) || {}).title;
    }
};

export const getTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return journalPublicationTypeSr;
        case "en":
            return journalPublicationTypeEn;
    }
}
