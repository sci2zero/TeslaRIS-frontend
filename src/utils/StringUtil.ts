import { toCyrillic } from "@/i18n/serbianTransliteration";


export const removeTrailingPipeRegex = (text: string): string => {
    return text.replace(/ \| $/, '');
};

export const displayTextOrPlaceholder = (text: string): string => {
    return (text && text.length > 0) ? text : "-";
};

export const transliterateContentToCyrillic = <T extends { title: string }>(data: T[]): T[] => {
    return data.map(entry => ({
        ...entry,
        title: toCyrillic(entry.title) ?? entry.title, // fallback if toCyrillic returns undefined
    }));
};

