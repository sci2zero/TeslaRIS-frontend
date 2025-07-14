import { ThesisFileSection } from "@/models/ThesisLibraryModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

export const thesisFileSectionSr = [
    { title: "Dokazi", value: ThesisFileSection.PROOFS },
    { title: "Fajlovi", value: ThesisFileSection.FILE_ITEMS },
    { title: "Preliminarni dokumenti", value: ThesisFileSection.PRELIMINARY_FILES },
    { title: "Preliminarni suplementi", value: ThesisFileSection.PRELIMINARY_SUPPLEMENTS },
    { title: "Izveštaji komisije", value: ThesisFileSection.COMMISSION_REPORTS }
];

export const thesisFileSectionEn = [
    { title: "Proofs", value: ThesisFileSection.PROOFS },
    { title: "File items", value: ThesisFileSection.FILE_ITEMS },
    { title: "Preliminary documents", value: ThesisFileSection.PRELIMINARY_FILES },
    { title: "Preliminary supplements", value: ThesisFileSection.PRELIMINARY_SUPPLEMENTS },
    { title: "Commission reports", value: ThesisFileSection.COMMISSION_REPORTS }
];

export const getThesisFileSectionFromValueAutoLocale = (value: ThesisFileSection) => {
    const locale = i18n.vueI18n.global.locale;

    let thesisFileSectionArray = thesisFileSectionEn;
    if (locale == "sr") {
        thesisFileSectionArray = thesisFileSectionSr;
    } else if (locale == "sr-cyr") {
        thesisFileSectionArray = transliterateContentToCyrillic(thesisFileSectionSr);
    }

    return (thesisFileSectionArray.find(item => item.value === value) || {}).title;
};

export const getThesisFileSectionsForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return thesisFileSectionSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(thesisFileSectionSr);
        case "en":
            return thesisFileSectionEn;
    }
}
