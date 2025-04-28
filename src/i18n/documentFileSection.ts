import { DocumentFileSection } from "@/models/DocumentFileModel";
import i18n from ".";

export const documentFileSectionSr = [
    { title: "Dokazi", value: DocumentFileSection.PROOFS },
    { title: "Fajlovi", value: DocumentFileSection.FILE_ITEMS }
];

export const documentFileSectionEn = [
    { title: "Proofs", value: DocumentFileSection.PROOFS },
    { title: "File items", value: DocumentFileSection.FILE_ITEMS }
];

export const getDocumentFileSectionFromValueAutoLocale = (value: DocumentFileSection) => {
    const locale = i18n.vueI18n.global.locale;

    let documentFileSectionArray = documentFileSectionEn;
    if (locale == "sr") {
        documentFileSectionArray = documentFileSectionSr;
    }

    return (documentFileSectionArray.find(item => item.value === value) || {}).title;
};

export const getDocumentFileSectionsForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return documentFileSectionSr;
        case "en":
            return documentFileSectionEn;
    }
};
