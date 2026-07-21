import type { LanguageTagResponse, MultilingualContent } from "@/models/Common";
import i18n from ".";
import { transliterateValueToCyrillic } from "@/utils/StringUtil";

export const returnCurrentLocaleContent = (
    multilingualContentList: MultilingualContent[] | undefined
): string | null => {
    if (!multilingualContentList || multilingualContentList.length === 0) {
        return null;
    }

    const currentLocale = i18n.vueI18n.global.locale.toString().toUpperCase();

    // 1. Exact match (e.g. SR-CYR)
    const exactMatch = multilingualContentList.find(
        mc => mc.languageTag.toUpperCase() === currentLocale
    );
    if (exactMatch) {
        return exactMatch.content;
    }

    // 2. If current locale is a subtag then match against prefix
    //    e.g. UI=SR-CYR, content has SR-CYR-RS - still matches
    const prefixMatch = multilingualContentList.find(
        mc => mc.languageTag.toUpperCase().startsWith(currentLocale)
    );
    if (prefixMatch) {
        return prefixMatch.content;
    }

    // 3. If base language matches then strip script/region from UI locale
    //    e.g. UI=SR-CYR - try SR
    const baseLang = currentLocale.split("-")[0];
    const baseLangMatch = multilingualContentList.find(
        mc => mc.languageTag.toUpperCase().split("-")[0] === baseLang
    );
    if (baseLangMatch) {
        const isCyrillic = currentLocale.includes("CYR");
        return isCyrillic
            ? transliterateValueToCyrillic(baseLangMatch.content)
            : baseLangMatch.content;
    }

    // 4. Highest priority fallback
    return multilingualContentList.reduce((prev, current) =>
        prev.priority > current.priority ? prev : current
    ).content;
};

export const toMultilingualTextInput = (
    multilingualContentArray: MultilingualContent[] | undefined,
    supportedLanguages: LanguageTagResponse[]
): { language: {title: string, value: number}, text: string, supportedLanguages: {title: string, value: number}[], priority: number }[] => {
    const presetInput: { 
        language: {title: string, value: number},
        text: string,
        supportedLanguages: {title: string, value: number}[],
        priority: number }[] = [];

    if (!multilingualContentArray) {
        return presetInput;
    }

    const filteredLanguages = supportedLanguages.filter(language => !multilingualContentArray.some(mc => mc.languageTag === language.languageCode));

    const mappedFilteredLanguages = filteredLanguages.map(language => ({ title: language.languageCode, value: language.id }));

    multilingualContentArray.forEach(mc => {
        presetInput.push({
            language: {title: mc.languageTag, value: mc.languageTagId}, 
            text: mc.content, 
            supportedLanguages: [...mappedFilteredLanguages],
            priority: mc.priority
        });
    });

    return presetInput;
};

export const mergeMultilingualContentField = (
    content1: MultilingualContent[] | undefined,
    content2: MultilingualContent[] | undefined
) => {
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
                if (!content.content.includes("|") && 
                    !currentContent.content.split("|").map(content => content.trim()).includes(content.content)) {
                    currentContent.content += " | " + content.content;
                }

                merged = true;
            }
        });
        if (!merged) {
            content1.push(content);
        }
    });
};
