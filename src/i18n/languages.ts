import { supportedLocales } from "./index";

const langItems = [
    {
        title: "Srpski",
        value: "sr"
    },
    {
        title: "Српски",
        value: "sr-cyr"
    },
    {
        title: "English",
        value: "en"
    },
];

export const getLangItems = () => {
    return supportedLocales.flatMap((locale) => {
        const item = langItems.find((lang) => lang.value === locale);
        return item ? [item] : [];
    });
};
