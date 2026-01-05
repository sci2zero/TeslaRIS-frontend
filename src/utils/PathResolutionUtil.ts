import type { PublicationType } from "@/models/PublicationModel";


export const getMetadataComparisonPageName = (type: PublicationType): string => {
    switch (type) {
        case "JOURNAL_PUBLICATION":
            return "journalPublicationMetadataComparator";
        case "PROCEEDINGS_PUBLICATION":
            return "proceedingsPublicationMetadataComparator";
        case "PATENT":
            return "patentMetadataComparator";
        case "PROCEEDINGS":
            return "proceedingsMetadataComparator";
        case "DATASET":
            return "datasetMetadataComparator";
        case "SOFTWARE":
            return "softwareMetadataComparator";
        case "MONOGRAPH":
            return "monographMetadataComparator";
        case "MONOGRAPH_PUBLICATION":
            return "monographPublicationMetadataComparator"
        case "THESIS":
            return "thesisMetadataComparator"
        case "MATERIAL_PRODUCT":
            return "materialProductMetadataComparator"
    }
    return "";
};


export const getPublicationComparisonPageName = (type: PublicationType): string => {
    switch (type) {
        case "PROCEEDINGS":
            return "proceedingsPublicationsComparator";
        case "MONOGRAPH":
            return "monographPublicationsComparator";
    }
    return "";
};

export const getDocumentLandingPageBasePath = (type: PublicationType): string => {
    switch (type) {
        case "JOURNAL_PUBLICATION":
            return "scientific-results/journal-publication/";
        case "PROCEEDINGS_PUBLICATION":
            return "scientific-results/proceedings-publication/";
        case "PATENT":
            return "scientific-results/patent/";
        case "PROCEEDINGS":
            return "proceedings/";
        case "DATASET":
            return "scientific-results/dataset/";
        case "SOFTWARE":
            return "scientific-results/software/";
        case "MONOGRAPH":
            return "scientific-results/monograph/";
        case "MONOGRAPH_PUBLICATION":
            return "scientific-results/monograph-publication/";
        case "THESIS":
            return "scientific-results/thesis/";
        case "MATERIAL_PRODUCT":
            return "scientific-results/material-product/";
    }
    return "";
};

export const getDocumentLandingPageName = (type: PublicationType | string): string => {
    switch (type) {
        case "JOURNAL_PUBLICATION":
            return "journalPublicationLandingPage";
        case "PROCEEDINGS_PUBLICATION":
            return "proceedingsPublicationLandingPage";
        case "PATENT":
            return "patentLandingPage";
        case "PROCEEDINGS":
            return "proceedingsLandingPage";
        case "DATASET":
            return "datasetLandingPage";
        case "SOFTWARE":
            return "softwareLandingPage";
        case "MONOGRAPH":
            return "monographLandingPage";
        case "MONOGRAPH_PUBLICATION":
            return "monographPublicationLandingPage";
        case "THESIS":
            return "thesisLandingPage";
        case "MATERIAL_PRODUCT":
            return "materialProductLandingPage";
    }
    return "";
};

export const getDocumentLandingPageBasePathBasedOnAssessment = (assessmentCode: string): string => {
    if (assessmentCode.startsWith("M1")) {
        return "scientific-results/monograph/";
    } else if (assessmentCode.startsWith("M2")) {
        return "scientific-results/journal-publication/";
    } else if (assessmentCode.startsWith("M3")) {
        return "scientific-results/proceedings-publication/";
    } else if (assessmentCode.startsWith("M4")) {
        return "scientific-results/monograph/";
    } else if (assessmentCode.startsWith("M5")) {
        return "scientific-results/journal-publication/";
    } else if (assessmentCode.startsWith("M6")) {
        return "scientific-results/proceedings-publication/";
    } else if (assessmentCode.startsWith("M7")) {
        return "scientific-results/thesis/";
    } else if (assessmentCode.startsWith("M8")) {
        return "scientific-results/software/";
    } else if (assessmentCode.startsWith("M9")) {
        return "scientific-results/patent/";
    }
    return "";
};
