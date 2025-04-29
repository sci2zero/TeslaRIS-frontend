import { ThesisFileSection } from "@/models/ThesisLibraryModel";
import i18n from ".";

export const thesisFileSectionSr = [
    { title: "Dokazi", value: ThesisFileSection.PROOFS },
    { title: "Fajlovi", value: ThesisFileSection.FILE_ITEMS },
    { title: "Preliminarni fajlovi", value: ThesisFileSection.PRELIMINARY_FILES },
    { title: "Preliminarni suplementi", value: ThesisFileSection.PRELIMINARY_SUPPLEMENTS },
    { title: "Izveštaji komisije", value: ThesisFileSection.COMMISSION_REPORTS }
];

export const thesisFileSectionEn = [
    { title: "Proofs", value: ThesisFileSection.PROOFS },
    { title: "File items", value: ThesisFileSection.FILE_ITEMS },
    { title: "Preliminary files", value: ThesisFileSection.PRELIMINARY_FILES },
    { title: "Preliminary supplements", value: ThesisFileSection.PRELIMINARY_SUPPLEMENTS },
    { title: "Commission reports", value: ThesisFileSection.COMMISSION_REPORTS }
];

export const getThesisFileSectionFromValueAutoLocale = (value: ThesisFileSection) => {
    const locale = i18n.vueI18n.global.locale;

    let thesisFileSectionArray = thesisFileSectionEn;
    if (locale == "sr") {
        thesisFileSectionArray = thesisFileSectionSr;
    }

    return (thesisFileSectionArray.find(item => item.value === value) || {}).title;
};

export const getThesisFileSectionsForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return thesisFileSectionSr;
        case "en":
            return thesisFileSectionEn;
    }
}
