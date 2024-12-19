import i18n from ".";
import { EntityIndicatorSource } from "@/models/AssessmentModel";

export const indicatorSourceSr = [
    { title: "Ručno unešeno", value: EntityIndicatorSource.MANUAL },
    { title: "Web Of Science", value: EntityIndicatorSource.WEB_OF_SCIENCE },
    { title: "Scimago", value: EntityIndicatorSource.SCIMAGO },
];

export const indicatorSourceEn = [
    { title: "Entered manually", value: EntityIndicatorSource.MANUAL },
    { title: "Web Of Science", value: EntityIndicatorSource.WEB_OF_SCIENCE },
    { title: "Scimago", value: EntityIndicatorSource.SCIMAGO },
];

export const getIndicatorSourceTitleFromValueAutoLocale = (value: EntityIndicatorSource) => {
    const locale = i18n.vueI18n.global.locale;

    let resourceTypeArray = indicatorSourceEn;
    if (locale == "sr") {
        resourceTypeArray = indicatorSourceSr;
    }

    return (resourceTypeArray.find(item => item.value === value) || {}).title;
};

export const getIndicatorSourceForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return indicatorSourceSr;
        case "en":
            return indicatorSourceEn;
    }
}
