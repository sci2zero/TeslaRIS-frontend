import { PageContentType } from "@/models/ThesisLibraryModel";
import i18n from ".";


const pageContentTypeEn = [
    { title: "Note", value: PageContentType.NOTE },
    { title: "Important note", value: PageContentType.IMPORTANT_NOTE },
    { title: "Text", value: PageContentType.TEXT }
];

const pageContentTypeSr = [
    { title: "Napomena", value: PageContentType.NOTE },
    { title: "Važna napomena", value: PageContentType.IMPORTANT_NOTE },
    { title: "Tekst", value: PageContentType.TEXT }
];

export const getPageContentTypeFromValueAutoLocale = (value: PageContentType) => {
    const locale = i18n.vueI18n.global.locale;
    
    let pageContentTypeArray = pageContentTypeEn;
    if (locale == "sr") {
        pageContentTypeArray = pageContentTypeSr;
    }

    return (pageContentTypeArray.find(item => item.value === value) || {}).title;
};

export const getPageContentTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return pageContentTypeSr;
        case "en":
            return pageContentTypeEn;
    }
};
