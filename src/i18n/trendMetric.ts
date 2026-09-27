import { TrendMetric } from "@/models/RevisionModel";
import i18n from ".";
import { transliterateContentToCyrillic } from "@/utils/StringUtil";

export const trendMetricSr = [
    { title: "Ukupna ocena", value: TrendMetric.OVERALL_SCORE },
    { title: "FAIR usklađenost", value: TrendMetric.FAIR_COMPLIANCE },
    { title: "Stopa kandidata za objavljivanje", value: TrendMetric.PUBLICATION_CANDIDATE_RATE },
    { title: "Tačnost", value: TrendMetric.ACCURACY },
    { title: "Doslednost", value: TrendMetric.CONSISTENCY },
    { title: "Poreklo", value: TrendMetric.LINEAGE },
    { title: "Strukturna doslednost", value: TrendMetric.STRUCTURAL_CONSISTENCY },
    { title: "Kvalitativnost", value: TrendMetric.QUALITATIVE },
    { title: "Semantika", value: TrendMetric.SEMANTIC },
    { title: "Ažurnost", value: TrendMetric.CURRENCY }
];

export const trendMetricEn = [
    { title: "Overall Score", value: TrendMetric.OVERALL_SCORE },
    { title: "FAIR Compliance", value: TrendMetric.FAIR_COMPLIANCE },
    { title: "Publication Candidate Rate", value: TrendMetric.PUBLICATION_CANDIDATE_RATE },
    { title: "Accuracy", value: TrendMetric.ACCURACY },
    { title: "Consistency", value: TrendMetric.CONSISTENCY },
    { title: "Lineage", value: TrendMetric.LINEAGE },
    { title: "Structural Consistency", value: TrendMetric.STRUCTURAL_CONSISTENCY },
    { title: "Qualitative", value: TrendMetric.QUALITATIVE },
    { title: "Semantic", value: TrendMetric.SEMANTIC },
    { title: "Currency", value: TrendMetric.CURRENCY }
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
