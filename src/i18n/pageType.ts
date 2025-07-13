import { PageType } from "@/models/ThesisLibraryModel";
import i18n from ".";


const pageTypeEn = [
    { title: "Currently on public review", value: PageType.CURRENT },
    { title: "Public review archive", value: PageType.ARCHIVE },
    { title: "Not defended", value: PageType.NOT_DEFENDED },
    { title: "All", value: PageType.ALL }
];

const pageTypeSr = [
    { title: "Trenutno na javnom uvidu", value: PageType.CURRENT },
    { title: "Arhiva javnih uvida", value: PageType.ARCHIVE },
    { title: "Neodbranjeno", value: PageType.NOT_DEFENDED },
    { title: "Sve", value: PageType.ALL }
];

export const getPageTypeFromValueAutoLocale = (value: PageType) => {
    const locale = i18n.vueI18n.global.locale;
    
    let pageTypeArray = pageTypeEn;
    if (locale == "sr") {
        pageTypeArray = pageTypeSr;
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
