import { ReportType } from "@/models/AssessmentModel";
import i18n from ".";

export const reportTypeSr = [
    { title: "Tabela 6.3.", value: ReportType.TABLE_63 },
    { title: "Tabela 6.7.", value: ReportType.TABLE_67 },
    { title: "Tabela 6.7. sa zvanjima", value: ReportType.TABLE_67_POSITIONS },
    { title: "Tabela 6.4.", value: ReportType.TABLE_64 },
    { title: "Tabela za vrhovnu instituciju", value: ReportType.TABLE_TOP_LEVEL_INSTITUTION },
    { title: "Zbirna tabela za vrhovnu instituciju", value: ReportType.TABLE_TOP_LEVEL_INSTITUTION_SUMMARY },
    { title: "Tabela za vrhovnu instituciju sa obojenim angažovanjima", value: ReportType.TABLE_TOP_LEVEL_INSTITUTION_COLORED }
];

export const reportTypeEn = [
    { title: "Table 6.3.", value: ReportType.TABLE_63 },
    { title: "Table 6.7.", value: ReportType.TABLE_67 },
    { title: "Table 6.7. with positions", value: ReportType.TABLE_67_POSITIONS },
    { title: "Table 6.4.", value: ReportType.TABLE_64 },
    { title: "Top level institution table", value: ReportType.TABLE_TOP_LEVEL_INSTITUTION },
    { title: "Top level institution table with summary", value: ReportType.TABLE_TOP_LEVEL_INSTITUTION_SUMMARY },
    { title: "Top level institution table with colored involvements", value: ReportType.TABLE_TOP_LEVEL_INSTITUTION_COLORED }
];

export const getReportTypeTitleFromValueAutoLocale = (value: ReportType) => {
    const locale = i18n.vueI18n.global.locale;

    let reportTypeArray = reportTypeEn;
    if (locale == "sr") {
        reportTypeArray = reportTypeSr;
    }

    return (reportTypeArray.find(item => item.value === value) || {}).title;
};

export const getReportTypesForGivenLocale = () => {
    switch(i18n.vueI18n.global.locale) {
        case "sr":
            return reportTypeSr;
        case "en":
            return reportTypeEn;
    }
};
