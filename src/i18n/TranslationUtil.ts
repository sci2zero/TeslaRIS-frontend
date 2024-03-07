import type { MultilingualContent } from "@/models/Common";
import i18n from ".";


export const returnCurrentLocaleContent = (multilingualContentList: MultilingualContent[] | undefined): string | null => {
    let selectedContent: MultilingualContent | null = null;

    if (!multilingualContentList) {
        return null;
    }
    
    const currentLocale = i18n.vueI18n.global.locale.toString().toUpperCase();
    multilingualContentList.forEach((multilingualContent) => {
        if (multilingualContent.languageTag === currentLocale) {
            selectedContent = multilingualContent;
        }
    });

    if (selectedContent) {
        return (selectedContent as MultilingualContent).content;
    } else {

        if (multilingualContentList.length === 0) {
            return null;
        }

        const notWantedLocales = i18n.vueI18n.global.availableLocales.filter(locale => locale.toUpperCase() !== currentLocale);

        const filteredList = multilingualContentList.filter(multilingualContent => !notWantedLocales.includes(multilingualContent.languageTag.toLowerCase()));
        if (filteredList.length > 0) {
            multilingualContentList = filteredList;
        }

        const maxPriorityContent = multilingualContentList.reduce((prev, current) => {
            return (prev.priority > current.priority) ? prev : current;
        });
        
        return maxPriorityContent.content;
    }
};