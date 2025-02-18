import { ReportType } from "@/models/Common";
import i18n from ".";

export const reportTypeSr = [
    { title: "Tabela 6.3.", value: ReportType.TABLE_63 },
    { title: "Tabela 6.7.", value: ReportType.TABLE_67 },
    { title: "Tabela 6.7. sa zvanjima", value: ReportType.TABLE_67_POSITIONS },
];

export const reportTypeEn = [
    { title: "Table 6.3.", value: ReportType.TABLE_63 },
    { title: "Table 6.7.", value: ReportType.TABLE_67 },
    { title: "Table 6.7. with positions", value: ReportType.TABLE_67_POSITIONS },
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
