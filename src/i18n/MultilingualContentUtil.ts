import type { LanguageTagResponse, MultilingualContent } from "@/models/Common";
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

    if (!selectedContent) {
        multilingualContentList.forEach((multilingualContent) => {
            if (currentLocale.includes("-") && currentLocale.startsWith(multilingualContent.languageTag)) {
                selectedContent = multilingualContent;
            }
        });
    }

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

export const toMultilingualTextInput = (multilingualContentArray: MultilingualContent[] | undefined, supportedLanguages: LanguageTagResponse[]): { language: {title: string, value: number}, text: string, supportedLanguages: {title: string, value: number}[] }[] => {
    const presetInput: { language: {title: string, value: number}, text: string, supportedLanguages: {title: string, value: number}[] }[] = [];

    if (!multilingualContentArray) {
        return presetInput;
    }

    const filteredLanguages = supportedLanguages.filter(language => !multilingualContentArray.some(mc => mc.languageTag === language.languageCode));

    const mappedFilteredLanguages = filteredLanguages.map(language => ({ title: language.languageCode, value: language.id }));

    multilingualContentArray.forEach(mc => {
        presetInput.push({language: {title: mc.languageTag, value: mc.languageTagId}, text: mc.content, supportedLanguages: [...mappedFilteredLanguages]});
    });

    return presetInput;
};

export const mergeMultilingualContentField = (content1: MultilingualContent[] | undefined, content2: MultilingualContent[] | undefined) => {
    if (content1 === undefined) {
        content1 = [];
    }

    if (content2 === undefined) {
        content2 = [];
    }
    
    content2.forEach(content => {
        let merged = false;
        content1.forEach(currentContent => {
            if (currentContent.languageTag === content.languageTag) {
                currentContent.content += " | " + content.content;
                merged = true;
            }
        });
        if (!merged) {
            content1.push(content);
        }
    });
};
