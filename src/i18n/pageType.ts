import { PageType } from "@/models/ThesisLibraryModel";
import i18n from ".";


const pageTypeEn = [
    { title: "Current", value: PageType.CURRENT },
    { title: "Archive", value: PageType.ARCHIVE },
    { title: "Not defended", value: PageType.NOT_DEFENDED },
    { title: "All", value: PageType.ALL }
];

const pageTypeSr = [
    { title: "Trenutne", value: PageType.CURRENT },
    { title: "Arhiva", value: PageType.ARCHIVE },
    { title: "Neodbranjene", value: PageType.NOT_DEFENDED },
    { title: "Sve", value: PageType.NOT_DEFENDED }
];

export const getPageTypeFromValueAutoLocale = (value: PageType) => {
    const locale = i18n.vueI18n.global.locale;
    
    let pageTypeArray = pageTypeEn;
    if (locale == "sr") {
        pageTypeArray = pageTypeEn;
    }

    return (pageTypeArray.find(item => item.value === value) || {}).title;
};

export const getPageTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return pageTypeSr;
        case "en":
            return pageTypeEn;
    }
};
