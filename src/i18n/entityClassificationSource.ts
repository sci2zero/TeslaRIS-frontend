import i18n from ".";
import { EntityClassificationSource } from "@/models/AssessmentModel";

export const classificationSourceSr = [
    { title: "Matični naučni odbor", value: EntityClassificationSource.MNO }
];

export const classificationSourceEn = [
    { title: "National Scientific Committee", value: EntityClassificationSource.MNO }
];

export const getClassificationSourceTitleFromValueAutoLocale = (value: EntityClassificationSource) => {
    const locale = i18n.vueI18n.global.locale;

    let resourceTypeArray = classificationSourceEn;
    if (locale == "sr") {
        resourceTypeArray = classificationSourceSr;
    }

    return (resourceTypeArray.find(item => item.value === value) || {}).title;
};

export const getClassificationSourcesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return classificationSourceSr;
        case "en":
            return classificationSourceEn;
    }
}
