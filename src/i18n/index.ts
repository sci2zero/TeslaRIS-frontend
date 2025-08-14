import { type Composer, createI18n, type I18n } from 'vue-i18n';
import en from "./en";
import sr from "./sr";
import srCyrOverrides from "./sr-cyr";
import { toCyrillic } from './serbianTransliteration';


export const defaultLocale = "sr";
export const fallbackLocale = "en";
export const supportedLocales = ["sr", "sr-cyr", "en"];

let _i18n: I18n;

function transliterateMessages(obj: any): any {
    if (typeof obj === "string") {
        return toCyrillic(obj);
    }

    if (Array.isArray(obj)) {
        return obj.map(transliterateMessages);
    }

    if (typeof obj === 'object' && obj !== null) {
        const result: any = {};
        for (const key in obj) {
            if (!key.endsWith("Column")) {
                result[key] = transliterateMessages(obj[key]);
            }
        }
        return result;
    }

    return obj;
}

function setup(options = { locale: defaultLocale }) {
    _i18n = createI18n({
        locale: options.locale,
        fallbackLocale: defaultLocale,
        allowComposition: true,
        messages: {
            en: en,
            sr: sr,
            "sr-cyr": {
                ...transliterateMessages(sr),
                ...srCyrOverrides
            }
        },
    });

    setLocale(options.locale);
    return _i18n;
}

function setLocale(newLocale: string) {
    _i18n.global.locale = newLocale;
}

function translationExists(key: string) {
    const translated = (_i18n.global as Composer).t(key);
    return translated !== key;
}

export function getErrorMessageForErrorKey(key: string): string {
    if (translationExists(key)) {
        return (_i18n.global as Composer).t(key);
    }

    return (_i18n.global as Composer).t("genericErrorMessage");
}

export default {
    get vueI18n() {
        return _i18n;
    },
    setup,
    setLocale
};
