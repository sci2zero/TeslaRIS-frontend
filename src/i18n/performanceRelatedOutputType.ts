import { PerformanceRelatedOutputType } from "@/models/PublicationModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";


const performanceRelatedOutputTypeEn = [
    { title: "Slides", value: PerformanceRelatedOutputType.SLIDES },
    { title: "Poster", value: PerformanceRelatedOutputType.POSTER },
    { title: "Catalogue", value: PerformanceRelatedOutputType.CATALOGUE },
    { title: "Artistic exhibition", value: PerformanceRelatedOutputType.ARTISTIC_EXHIBITION },
    { title: "Musical performance", value: PerformanceRelatedOutputType.MUSICAL_PERFORMANCE },
    { title: "Art performance", value: PerformanceRelatedOutputType.ART_PERFORMANCE },
    { title: "Theatric play", value: PerformanceRelatedOutputType.THEATRIC_PLAY },
    { title: "Curatorial museum exhibition", value: PerformanceRelatedOutputType.CURATORIAL_MUSEUM_EXHIBITION },
    { title: "Litigation", value: PerformanceRelatedOutputType.LITIGATION },
    { title: "Broadcast interview", value: PerformanceRelatedOutputType.BROADCAST_INTERVIEW },
    { title: "Text interview", value: PerformanceRelatedOutputType.TEXT_INTERVIEW },
    { title: "Non-research presentation", value: PerformanceRelatedOutputType.NON_RESEARCH_PRESENTATION }
];

const performanceRelatedOutputTypeSr = [
    { title: "Slajdovi", value: PerformanceRelatedOutputType.SLIDES },
    { title: "Poster", value: PerformanceRelatedOutputType.POSTER },
    { title: "Katalog", value: PerformanceRelatedOutputType.CATALOGUE },
    { title: "Umetnička izložba", value: PerformanceRelatedOutputType.ARTISTIC_EXHIBITION },
    { title: "Muzička izvedba", value: PerformanceRelatedOutputType.MUSICAL_PERFORMANCE },
    { title: "Umetnička izvedba", value: PerformanceRelatedOutputType.ART_PERFORMANCE },
    { title: "Pozorišna predstava", value: PerformanceRelatedOutputType.THEATRIC_PLAY },
    { title: "Kuratorska muzejska izložba", value: PerformanceRelatedOutputType.CURATORIAL_MUSEUM_EXHIBITION },
    { title: "Parnica/Spor", value: PerformanceRelatedOutputType.LITIGATION },
    { title: "Intervju na radiju/televiziji", value: PerformanceRelatedOutputType.BROADCAST_INTERVIEW },
    { title: "Tekstualni intervju", value: PerformanceRelatedOutputType.TEXT_INTERVIEW },
    { title: "Nenaučna prezentacija", value: PerformanceRelatedOutputType.NON_RESEARCH_PRESENTATION }
];

export const getTitleFromValue = (value: PerformanceRelatedOutputType, performanceRelatedOutputTypeArray: {title: string, value: PerformanceRelatedOutputType}[]) => {
    return (performanceRelatedOutputTypeArray.find(item => item.value === value.toString()) || {}).title;
};

export const getPerformanceRelatedOutputTypeTitleFromValueAutoLocale = (value: PerformanceRelatedOutputType | string) => {
    const locale = i18n.vueI18n.global.locale;

    let performanceRelatedOutputTypeArray = performanceRelatedOutputTypeEn;
    if (locale == "sr") {
        performanceRelatedOutputTypeArray = performanceRelatedOutputTypeSr;
    } else if (locale == "sr-cyr") {
        performanceRelatedOutputTypeArray = transliterateContentToCyrillic(performanceRelatedOutputTypeSr);
    }

    return (performanceRelatedOutputTypeArray.find(item => item.value === value) || {}).title;
};

export const getPerformanceRelatedOutputTypeValueFromTitleAutoLocale = (title: string) => {
    const locale = i18n.vueI18n.global.locale;

    let performanceRelatedOutputTypeArray = performanceRelatedOutputTypeEn;
    if (locale == "sr") {
        performanceRelatedOutputTypeArray = performanceRelatedOutputTypeSr;
    } else if (locale == "sr-cyr") {
        performanceRelatedOutputTypeArray = transliterateContentToCyrillic(performanceRelatedOutputTypeSr);
    }

    return (performanceRelatedOutputTypeArray.find(item => item.title === title) || {}).value;
};

export const getPerformanceRelatedOutputTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return performanceRelatedOutputTypeSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(performanceRelatedOutputTypeSr);
        case "en":
            return performanceRelatedOutputTypeEn;
    }
}
