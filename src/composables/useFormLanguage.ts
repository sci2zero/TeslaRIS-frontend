export interface FormLanguageOption {
    title: string;
    value: number;
    display?: string;
}

export const getLanguageDisplayName = (
    language: FormLanguageOption,
    availableLanguages: FormLanguageOption[] = []
): string => {
    return language.display
        || availableLanguages.find(item => item.value === language.value)?.display
        || language.title;
};
