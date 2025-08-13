import i18n from ".";
import { License } from "@/models/DocumentFileModel";


export const licensesSr = [
    { title: "Autorstvo (CC BY)", value: License.BY },
    { title: "Autorstvo - deliti pod istim uslovima (CC BY-SA)", value: License.BY_SA },
    { title: "Autorstvo - nekomercijalno (CC BY-NC)", value: License.BY_NC },
    { title: "Autorstvo - nekomercijalno - deliti pod istim uslovima (CC BY-NC-SA)", value: License.BY_NC_SA },
    { title: "Autorstvo - bez prerade (CC BY-ND)", value: License.BY_ND },
    { title: "Autorstvo - nekomercijalno - bez prerade (CC BY-NC-ND)", value: License.BY_NC_ND },
    { title: "U javnom vlasništvu (CC Zero)", value: License.CC0 }
];

export const licensesSrCyr = [
    { title: "Ауторство (CC BY)", value: License.BY },
    { title: "Ауторство - делити под истим условима (CC BY-SA)", value: License.BY_SA },
    { title: "Ауторство - некомерцијално (CC BY-NC)", value: License.BY_NC },
    { title: "Ауторство - некомерцијално - делити под истим условима (CC BY-NC-SA)", value: License.BY_NC_SA },
    { title: "Ауторство - без прераде (CC BY-ND)", value: License.BY_ND },
    { title: "Ауторство - некомерцијално - без прераде (CC BY-NC-ND)", value: License.BY_NC_ND },
    { title: "У јавном власништву (CC Zero)", value: License.CC0 }
];

export const licensesEn = [
    { title: "Attribution (CC BY)", value: License.BY },
    { title: "Attribution - Share Alike (CC BY-SA)", value: License.BY_SA },
    { title: "Attribution - Non Commercial (CC BY-NC)", value: License.BY_NC },
    { title: "Attribution - Non Commercial - Share Alike (CC BY-NC-SA)", value: License.BY_NC_SA },
    { title: "Attribution - No Derivs (CC BY-ND)", value: License.BY_ND },
    { title: "Attribution - Non Commercial - No Derivs (CC BY-NC-ND)", value: License.BY_NC_ND },
    { title: "Public Domain (CC Zero)", value: License.CC0 }
];

export const getLicenseTitleFromValueAutoLocale = (value: License) => {
    const locale = i18n.vueI18n.global.locale;

    let licenseArray = licensesEn;
    if (locale == "sr") {
        licenseArray = licensesSr;
    } else if (locale == "sr-cyr") {
        licenseArray = licensesSrCyr;
    }

    return (licenseArray.find(item => item.value === value) || {}).title;
};

export const getLisenseTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return licensesSr;
        case "sr-cyr":
            return licensesSrCyr;
        case "en":
            return licensesEn;
    }
};
