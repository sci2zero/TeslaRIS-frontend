import { JournalPublicationType } from "@/models/PublicationModel";
import { getNameFromOrdinal } from "@/utils/EnumUtil";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

const journalPublicationTypeEn = [
    { title: "Research Article", value: JournalPublicationType.RESEARCH_ARTICLE },
    { title: "Review Article", value: JournalPublicationType.REVIEW_ARTICLE },
    { title: "Scientific Critic", value: JournalPublicationType.SCIENTIFIC_CRITIC },
    { title: "Polemics", value: JournalPublicationType.POLEMICS },
    { title: "Lexicographic Unit", value: JournalPublicationType.LEXICOGRAPHIC_UNIT },
    { title: "Comment", value: JournalPublicationType.COMMENT },
    { title: "Preface", value: JournalPublicationType.PREFACE },
    { title: "Correction", value: JournalPublicationType.CORRECTION },
    { title: "Editorial", value: JournalPublicationType.EDITORIAL },
    { title: "Postface", value: JournalPublicationType.POSTFACE },
    { title: "Book review", value: JournalPublicationType.BOOK_REVIEW },
    { title: "Translation", value: JournalPublicationType.TRANSLATION },
    { title: "Preprint", value: JournalPublicationType.PREPRINT },
    { title: "Short fiction", value: JournalPublicationType.SHORT_FICTION },
    { title: "Annotation", value: JournalPublicationType.ANNOTATION }
];

const journalPublicationTypeSr = [
    { title: "Istraživački članak", value: JournalPublicationType.RESEARCH_ARTICLE },
    { title: "Pregledni članak", value: JournalPublicationType.REVIEW_ARTICLE },
    { title: "Naučna kritika", value: JournalPublicationType.SCIENTIFIC_CRITIC },
    { title: "Polemika", value: JournalPublicationType.POLEMICS },
    { title: "Leksikografska jedinica", value: JournalPublicationType.LEXICOGRAPHIC_UNIT },
    { title: "Komentar", value: JournalPublicationType.COMMENT },
    { title: "Predgovor", value: JournalPublicationType.PREFACE },
    { title: "Ispravka", value: JournalPublicationType.CORRECTION },
    { title: "Urednički uvod", value: JournalPublicationType.EDITORIAL },
    { title: "Pogovor", value: JournalPublicationType.POSTFACE },
    { title: "Prikaz knjige", value: JournalPublicationType.BOOK_REVIEW },
    { title: "Prevod", value: JournalPublicationType.TRANSLATION },
    { title: "Preprint", value: JournalPublicationType.PREPRINT },
    { title: "Kratka proza", value: JournalPublicationType.SHORT_FICTION },
    { title: "Anotacija", value: JournalPublicationType.ANNOTATION }
];

export const getTitleFromValue = (value: JournalPublicationType, journalPublicationTypeArray: {title: string, value: JournalPublicationType}[]) => {
    return (journalPublicationTypeArray.find(item => getNameFromOrdinal(JournalPublicationType, item.value) === value.toString()) || {}).title;
};

export const getTitleFromValueAutoLocale = (value: JournalPublicationType | string) => {
    const locale = i18n.vueI18n.global.locale;

    let journalPublicationTypeArray = journalPublicationTypeEn;
    if (locale == "sr") {
        journalPublicationTypeArray = journalPublicationTypeSr;
    } else if (locale == "sr-cyr") {
        journalPublicationTypeArray = transliterateContentToCyrillic(journalPublicationTypeSr);
    }

    if (typeof value === "number") {
        return (journalPublicationTypeArray.find(item => item.value === value) || {}).title;
    } else if (typeof value === "string") {
        return (journalPublicationTypeArray.find(item => getNameFromOrdinal(JournalPublicationType, item.value) === value) || {}).title;
    }
};

export const getTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return journalPublicationTypeSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(journalPublicationTypeSr);
        case "en":
            return journalPublicationTypeEn;
    }
}
