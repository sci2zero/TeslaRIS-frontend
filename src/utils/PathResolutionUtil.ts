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

export const getLandingPageBasePath = (type: PublicationType): string => {
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
    }
    return "";
};
