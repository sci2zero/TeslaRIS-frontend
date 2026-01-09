import { getTitleFromValueAutoLocale as getJournalPublicationTypeTitle } from '@/i18n/journalPublicationType';
import { getTitleFromValueAutoLocale as getProceedingsPublicationTypeTitle } from '@/i18n/proceedingsPublicationType';
import { getMonographTypeTitleFromValueAutoLocale } from '@/i18n/monographType';
import { getTitleFromValueAutoLocale as getMonographPublicationTypeTitle } from '@/i18n/monographPublicationType';
import { getThesisTitleFromValueAutoLocale } from '@/i18n/thesisType';
import { getMaterialProductTypeTitleFromValueAutoLocale } from '@/i18n/materialProductType';
import { getGeneticMaterialTypeTitleFromValueAutoLocale } from '@/i18n/geneticMaterialType';
import { useI18n } from 'vue-i18n';


export function getNameFromOrdinal(enumObj: any, ordinal: number): string | undefined {
    for (const key in enumObj) {
        if (typeof enumObj[key] === 'number' && enumObj[key] === ordinal) {
            return key;
        }
    }
    return undefined;
}

export const getDocumentTypeDisplayValue = (documentType: string, publicationType: string) => {
    const i18n = useI18n();

    switch (documentType) {
        case "JOURNAL_PUBLICATION":
            return getJournalPublicationTypeTitle(publicationType);
        case "PROCEEDINGS_PUBLICATION":
            return getProceedingsPublicationTypeTitle(publicationType);
        case "PATENT":
            return i18n.t("patentLabel");
        case "PROCEEDINGS":
            return i18n.t("proceedingsLabel");
        case "DATASET":
            return i18n.t("datasetLabel");
        case "SOFTWARE":
            return i18n.t("softwareLabel");
        case "MONOGRAPH":
            return getMonographTypeTitleFromValueAutoLocale(publicationType);
        case "MONOGRAPH_PUBLICATION":
            return getMonographPublicationTypeTitle(publicationType);
        case "THESIS":
            return getThesisTitleFromValueAutoLocale(publicationType);
        case "MATERIAL_PRODUCT":
            return getMaterialProductTypeTitleFromValueAutoLocale(publicationType);
        case "GENETIC_MATERIAL":
            return getGeneticMaterialTypeTitleFromValueAutoLocale(publicationType);
    }
};
