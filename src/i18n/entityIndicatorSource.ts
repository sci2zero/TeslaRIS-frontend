import i18n from ".";
import { EntityIndicatorSource } from "@/models/AssessmentModel";

export const indicatorSourceSr = [
    { title: "Ručno unešeno", value: EntityIndicatorSource.MANUAL },
    { title: "Web Of Science", value: EntityIndicatorSource.WEB_OF_SCIENCE },
    { title: "Scimago", value: EntityIndicatorSource.SCIMAGO },
    { title: "ERIH PLUS", value: EntityIndicatorSource.ERIH_PLUS },
    { title: "MKS Slavisti", value: EntityIndicatorSource.MKS_SLAVISTS }
];

export const indicatorSourceEn = [
    { title: "Entered manually", value: EntityIndicatorSource.MANUAL },
    { title: "Web Of Science", value: EntityIndicatorSource.WEB_OF_SCIENCE },
    { title: "Scimago", value: EntityIndicatorSource.SCIMAGO },
    { title: "ERIH PLUS", value: EntityIndicatorSource.ERIH_PLUS },
    { title: "MKS Slavists", value: EntityIndicatorSource.MKS_SLAVISTS },
];

export const getIndicatorSourceTitleFromValueAutoLocale = (value: EntityIndicatorSource) => {
    const locale = i18n.vueI18n.global.locale;

    let entityIndicatorSourceArray = indicatorSourceEn;
    if (locale == "sr") {
        entityIndicatorSourceArray = indicatorSourceSr;
    }

    return (entityIndicatorSourceArray.find(item => item.value === value) || {}).title;
};

export const getIndicatorSourceForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return indicatorSourceSr;
        case "en":
            return indicatorSourceEn;
    }
}
