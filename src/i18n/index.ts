import { type Composer, createI18n, type I18n } from 'vue-i18n';
import { merge } from 'lodash';
import en from "./en";
import sr from "./sr";
import srCyrOverrides from "./sr-cyr";
import enOverride from "./en-override";
import srOverride from "./sr-override";
import srCyrOverride from "./sr-cyr-override";
import { toCyrillic } from './serbianTransliteration';


const bundledLocales = ["sr", "sr-cyr", "en"];

export let defaultLocale = "sr";
export const fallbackLocale = "en";
export let supportedLocales = [...bundledLocales];

export function configureLocales(options: { defaultLocale?: string; supportedLocales?: string[] }) {
    if (options.supportedLocales) {
        const next = options.supportedLocales.filter((locale) => bundledLocales.includes(locale));
        if (next.length === 0) {
            return;
        }
        supportedLocales = next;
    }

    if (options.defaultLocale && supportedLocales.includes(options.defaultLocale)) {
        defaultLocale = options.defaultLocale;
    }

    if (!supportedLocales.includes(defaultLocale)) {
        defaultLocale = supportedLocales[0];
    }

    if (_i18n) {
        setLocale(defaultLocale);
    }
}

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
            en: merge({}, en, enOverride),
            sr: merge({}, sr, srOverride),
            "sr-cyr": merge(
                {},
                transliterateMessages(merge({}, sr, srOverride)),
                srCyrOverrides,
                srCyrOverride
            )
        },
    });

    setLocale(options.locale);
    return _i18n;
}

function setLocale(newLocale: string) {
    _i18n.global.locale = newLocale;
}

// Merges extra messages (e.g. from a plugin) using the same rules as setup():
// sr-cyr is transliterated from sr, then explicit sr-cyr messages win.
function mergeMessages(messagesByLocale: Record<string, unknown>) {
    const { "sr-cyr": srCyrMessages, ...rest } = messagesByLocale;

    for (const [locale, messages] of Object.entries(rest)) {
        _i18n.global.mergeLocaleMessage(locale, messages as never);
    }

    if (rest.sr) {
        _i18n.global.mergeLocaleMessage("sr-cyr", transliterateMessages(rest.sr) as never);
    }

    if (srCyrMessages) {
        _i18n.global.mergeLocaleMessage("sr-cyr", srCyrMessages as never);
    }
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
    setLocale,
    mergeMessages
};
