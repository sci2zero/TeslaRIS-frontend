const LANGUAGE_FLAG_COUNTRY: Record<string, string> = {
    SR: "rs",
    "SR-CYR": "rs",
    "SR-LAT": "rs",
    "SR-CYRL": "rs",
    "SR-LATN": "rs",
    EN: "gb",
    HR: "hr",
    DE: "de",
    FR: "fr",
    HU: "hu",
    SL: "si",
    MK: "mk",
    BG: "bg",
    RO: "ro",
    IT: "it",
    ES: "es",
    PT: "pt",
    RU: "ru",
    UK: "ua",
    PL: "pl",
    CS: "cz",
    SK: "sk",
    EL: "gr",
    NL: "nl",
    SV: "se",
    NO: "no",
    DA: "dk",
    FI: "fi",
    TR: "tr",
    ZH: "cn",
    JA: "jp",
    KO: "kr",
    AR: "sa",
    BS: "ba",
    ME: "me",
    SQ: "al",
    CNR: "me"
};

export const getLanguageCountryCode = (languageCode: string): string | null => {
    const normalized = languageCode.trim().toUpperCase();
    const exact = LANGUAGE_FLAG_COUNTRY[normalized];
    if (exact) {
        return exact;
    }

    const base = normalized.split("-")[0];
    return LANGUAGE_FLAG_COUNTRY[base] ?? null;
};

export const getLanguageFlagUrl = (languageCode: string): string | null => {
    const country = getLanguageCountryCode(languageCode);
    if (!country) {
        return null;
    }

    return `https://flagcdn.com/w40/${country}.png`;
};
