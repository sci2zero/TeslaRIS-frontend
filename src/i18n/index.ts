import { createI18n, type I18n } from 'vue-i18n';
import en from "./en";
import sr from "./sr"


export const defaultLocale = "sr"
export const supportedLocales = ["sr", "en"]

let _i18n: I18n;

function setup(options = { locale: defaultLocale }) {
  _i18n = createI18n({
    locale: options.locale,
    fallbackLocale: defaultLocale,
    allowComposition: true,
    messages: {
      en: en,
      sr: sr,
    },
  })
  setLocale(options.locale);
  return _i18n;
}

function setLocale(newLocale: string) {
  _i18n.global.locale = newLocale;
}

function translationExists(key: string) {
  const translated = _i18n.global.t(key);
  return translated !== key;
}

export function getErrorMessageForErrorKey(key: string): string {
  if (translationExists(key)) {
    return _i18n.global.t(key);
  }

  return _i18n.global.t("genericErrorMessage");
}

export default {
  get vueI18n() {
    return _i18n;
  },
  setup,
  setLocale,
};
