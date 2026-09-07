import { TrendMetric } from "@/models/RevisionModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

export const trendMetricSr = [
    { title: "Ukupna ocena", value: TrendMetric.OVERALL_SCORE },
    { title: "FAIR usklađenost", value: TrendMetric.FAIR_COMPLIANCE },
    { title: "Stopa kandidata za objavljivanje", value: TrendMetric.PUBLICATION_CANDIDATE_RATE },
    { title: "Potpunost", value: TrendMetric.COMPLETENESS },
    { title: "Ispravnost", value: TrendMetric.VALIDITY },
    { title: "Jedinstvenost", value: TrendMetric.UNIQUENESS },
    { title: "Doslednost", value: TrendMetric.CONSISTENCY },
    { title: "Ažurnost", value: TrendMetric.TIMELINESS },
    { title: "Tačnost", value: TrendMetric.ACCURACY },
    { title: "Usaglašenost", value: TrendMetric.CONFORMITY },
    { title: "Integritet", value: TrendMetric.INTEGRITY }
];

export const trendMetricEn = [
    { title: "Overall Score", value: TrendMetric.OVERALL_SCORE },
    { title: "FAIR Compliance", value: TrendMetric.FAIR_COMPLIANCE },
    { title: "Publication Candidate Rate", value: TrendMetric.PUBLICATION_CANDIDATE_RATE },
    { title: "Completeness", value: TrendMetric.COMPLETENESS },
    { title: "Validity", value: TrendMetric.VALIDITY },
    { title: "Uniqueness", value: TrendMetric.UNIQUENESS },
    { title: "Consistency", value: TrendMetric.CONSISTENCY },
    { title: "Timeliness", value: TrendMetric.TIMELINESS },
    { title: "Accuracy", value: TrendMetric.ACCURACY },
    { title: "Conformity", value: TrendMetric.CONFORMITY },
    { title: "Integrity", value: TrendMetric.INTEGRITY }
];

export const getTrendMetricTitleFromValueAutoLocale = (value: TrendMetric) => {
    const locale = i18n.vueI18n.global.locale;

    let trendMetricArray = trendMetricEn;
    if (locale == "sr") {
        trendMetricArray = trendMetricSr;
    } else if (locale == "sr-cyr") {
        trendMetricArray = transliterateContentToCyrillic(trendMetricSr);
    }

    return (trendMetricArray.find(item => item.value === value) || {}).title;
};

export const getTrendMetricsForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return trendMetricSr;
        case "sr-cyr":
            return transliterateContentToCyrillic(trendMetricSr);
        case "en":
            return trendMetricEn;
    }
};
