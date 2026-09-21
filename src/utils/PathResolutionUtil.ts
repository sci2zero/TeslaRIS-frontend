import { EventType } from "@/models/EventModel";
import type { PublicationType } from "@/models/PublicationModel";


export const getMetadataComparisonPageName = (type: PublicationType | string): string => {
    switch (type) {
        case "JOURNAL_PUBLICATION":
            return "journalPublicationMetadataComparator";
        case "PROCEEDINGS_PUBLICATION":
            return "proceedingsPublicationMetadataComparator";
        case "INTELLECTUAL_PROPERTY":
            return "intellectualPropertyMetadataComparator";
        case "PROCEEDINGS":
            return "proceedingsMetadataComparator";
        case "INTANGIBLE_PRODUCT":
            return "intangibleProductMetadataComparator";
        case "MONOGRAPH":
            return "monographMetadataComparator";
        case "MONOGRAPH_PUBLICATION":
            return "monographPublicationMetadataComparator"
        case "THESIS":
            return "thesisMetadataComparator"
        case "MATERIAL_PRODUCT":
            return "materialProductMetadataComparator"
        case "GENETIC_MATERIAL":
            return "geneticMaterialMetadataComparator"
        case "PERFORMANCE_RELATED_OUTPUT":
            return "performanceRelatedOutputMetadataComparator"
    }
    return "";
};

export const getEventMetadataComparisonPageName = (type: EventType | string): string => {
    switch (type) {
        case EventType.CONFERENCE:
            return "conferenceMetadataComparator";
        case EventType.EXHIBITION:
            return "exhibitionMetadataComparator";
        case EventType.COURSE:
            return "courseMetadataComparator";
        case EventType.OTHER_EVENT:
            return "otherEVentMetadataComparator";
    }

    return "";
};

export const getPublicationComparisonPageName = (type: PublicationType | string): string => {
    switch (type) {
        case "PROCEEDINGS":
            return "proceedingsPublicationsComparator";
        case "MONOGRAPH":
            return "monographPublicationsComparator";
    }
    return "";
};

export const getEventPublicationComparisonPageName = (type: EventType | string): string => {
    switch (type) {
        case EventType.CONFERENCE:
            return "eventProceedingsComparator";
    }

    return "";
};

export const getDocumentLandingPageBasePath = (type: PublicationType | string): string => {
    switch (type) {
        case "JOURNAL_PUBLICATION":
            return "scientific-results/journal-publication/";
        case "PROCEEDINGS_PUBLICATION":
            return "scientific-results/proceedings-publication/";
        case "INTELLECTUAL_PROPERTY":
            return "scientific-results/intellectual-property/";
        case "PROCEEDINGS":
            return "proceedings/";
        case "INTANGIBLE_PRODUCT":
            return "scientific-results/intangible-product/";
        case "MONOGRAPH":
            return "scientific-results/monograph/";
        case "MONOGRAPH_PUBLICATION":
            return "scientific-results/monograph-publication/";
        case "THESIS":
            return "scientific-results/thesis/";
        case "MATERIAL_PRODUCT":
            return "scientific-results/material-product/";
        case "GENETIC_MATERIAL":
            return "scientific-results/genetic-material/";
        case "PERFORMANCE_RELATED_OUTPUT":
            return "scientific-results/performance-related-output/";
    }
    return "";
};

export const getEventLandingPageBasePath = (type: EventType | string): string => {
    switch (type) {
        case EventType.CONFERENCE:
            return "events/conference/";
        case EventType.EXHIBITION:
            return "events/exhibition/";
        case EventType.COURSE:
            return "events/course/";
        case EventType.OTHER_EVENT:
            return "events/other-event/";
    }

    return "";
};

export const getDocumentLandingPageName = (type: PublicationType | string): string => {
    switch (type) {
        case "JOURNAL_PUBLICATION":
            return "journalPublicationLandingPage";
        case "PROCEEDINGS_PUBLICATION":
            return "proceedingsPublicationLandingPage";
        case "INTELLECTUAL_PROPERTY":
            return "intellectualPropertyLandingPage";
        case "PROCEEDINGS":
            return "proceedingsLandingPage";
        case "INTANGIBLE_PRODUCT":
            return "intangibleProductLandingPage";
        case "MONOGRAPH":
            return "monographLandingPage";
        case "MONOGRAPH_PUBLICATION":
            return "monographPublicationLandingPage";
        case "THESIS":
            return "thesisLandingPage";
        case "MATERIAL_PRODUCT":
            return "materialProductLandingPage";
        case "GENETIC_MATERIAL":
            return "geneticMaterialLandingPage";
        case "PERFORMANCE_RELATED_OUTPUT":
            return "performanceRelatedOutputLandingPage";
    }
    return "";
};

export const getLandingPageBasePath = (entityType: string): string => {
    const documentBasePath = getDocumentLandingPageBasePath(entityType);

    if (documentBasePath) {
        return documentBasePath;
    }

    const eventBasePath = getEventLandingPageBasePath(entityType);

    if (eventBasePath) {
        return eventBasePath;
    }

    switch (entityType) {
        case "PERSON":
            return "persons/";
        case "ORGANISATION_UNIT":
            return "organisation-units/";
        case "JOURNAL":
            return "journals/";
        case "BOOK_SERIES":
            return "book-series/";
        case "PUBLISHER":
            return "publishers/";
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
        return "scientific-results/material-product/";
    } else if (["M91A", "M91", "M92", "M93", "M94"].includes(assessmentCode)) {
        return "scientific-results/intellectual-property/";
    } else if (["M95", "M96", "M97", "M98"].includes(assessmentCode)) {
        return "scientific-results/genetic-material/";
    }
    return "";
};
