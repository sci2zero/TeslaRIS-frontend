import type { MultilingualContent } from "@/models/Common";
import i18n from ".";


export const returnCurrentLocaleContent = (multilingualContentList: MultilingualContent[]): string | null => {
    let selectedContent: MultilingualContent | null = null;

    if (!multilingualContentList) {
        return null;
    }
    
    multilingualContentList.forEach((multilingualContent) => {
        if (multilingualContent.languageTag === i18n.vueI18n.global.locale.toString().toUpperCase()) {
            selectedContent = multilingualContent;
        }
    });

    if (selectedContent) {
        return (selectedContent as MultilingualContent).content;
    } else {

        if (multilingualContentList.length === 0) {
            return null;
        }

        const maxPriorityContent = multilingualContentList.reduce((prev, current) => {
            return (prev.priority > current.priority) ? prev : current;
        });
        
        return maxPriorityContent.content;
    }
};