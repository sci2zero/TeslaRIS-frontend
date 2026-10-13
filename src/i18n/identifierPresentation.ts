import { ApplicableEntityType } from "@/models/Common";

export type IdentifierTone = "slate" | "emerald" | "amber" | "blue" | "indigo" | "violet";

export interface IdentifierPresentation {
    // A vendor name stays as it is; a label that has to be translated names a message key instead.
    label?: string;
    labelKey?: string;
    abbrev?: string;
    icon?: string;
    tone: IdentifierTone;
    // The IdentifierLink type, omitted for identifiers no portal resolves.
    linkType?: string;
}

const PERSON: Record<string, IdentifierPresentation> = {
    orcid: { label: "ORCID", abbrev: "iD", tone: "emerald", linkType: "orcid" },
    scopusAuthorId: { label: "Scopus Author ID", abbrev: "SC", tone: "amber",
        linkType: "scopus_author" },
    openAlexId: { label: "OpenAlex ID", abbrev: "OA", tone: "slate", linkType: "open_alex" },
    webOfScienceResearcherId: { label: "Researcher ID (Web of Science)", abbrev: "WoS",
        tone: "blue", linkType: "researcher_id" },
    eCrisId: { label: "eCRIS-ID", abbrev: "eCRIS", tone: "indigo", linkType: "ecris" },
    scholarId: { label: "Google Scholar ID", abbrev: "GS", tone: "violet", linkType: "scholar" },
    authenticusId: { label: "Authenticus ID", abbrev: "AU", tone: "indigo",
        linkType: "authenticus" },
    lattesId: { label: "Lattes ID", abbrev: "LT", tone: "emerald", linkType: "lattes" },
    apvnt: { label: "APVNT", abbrev: "APV", tone: "slate" },
    eNaukaId: { label: "enaukaID", abbrev: "eN", tone: "slate" },
    nationalScienceId: { labelKey: "nationalScienceIdLabel", icon: "mdi-identifier",
        tone: "violet", linkType: "national_person" }
};

const ORGANISATION_UNIT: Record<string, IdentifierPresentation> = {
    ror: { label: "ROR", abbrev: "ROR", tone: "emerald", linkType: "ror" },
    scopusAfid: { label: "Scopus AFID", abbrev: "SC", tone: "amber",
        linkType: "scopus_affiliation" },
    openAlexId: { label: "OpenAlex ID", abbrev: "OA", tone: "slate", linkType: "open_alex" },
    wikidata: { label: "Wikidata ID", abbrev: "WD", tone: "indigo", linkType: "wikidata" },
    ringgold: { label: "Ringgold ID", abbrev: "RG", tone: "slate" },
    fundref: { label: "FundRef", abbrev: "FR", tone: "slate" },
    isni: { label: "ISNI", abbrev: "ISNI", tone: "slate" },
    fctId: { label: "FCT ID", abbrev: "FCT", tone: "slate" },
    grid: { label: "GRID", abbrev: "GRID", tone: "slate" },
    taxNumber: { labelKey: "taxNumberLabel", icon: "mdi-numeric", tone: "slate" },
    nationalId: { labelKey: "nationalIdLabel", icon: "mdi-identifier", tone: "violet",
        linkType: "national_organisation_unit" }
};

const PROJECT: Record<string, IdentifierPresentation> = {
    doi: { label: "DOI", abbrev: "DOI", tone: "blue", linkType: "doi" },
    raid: { labelKey: "raidLabel", abbrev: "RAiD", tone: "indigo", linkType: "raid" },
    nationalId: { labelKey: "nationalIdLabel", icon: "mdi-identifier", tone: "violet",
        linkType: "national_project" }
};

const DOCUMENT: Record<string, IdentifierPresentation> = {
    doi: { label: "DOI", abbrev: "DOI", tone: "blue", linkType: "doi" },
    scopusId: { label: "Scopus ID", abbrev: "SC", tone: "amber", linkType: "scopus" },
    openAlexId: { label: "OpenAlex ID", abbrev: "OA", tone: "slate", linkType: "open_alex" },
    webOfScienceId: { label: "Web of Science ID", abbrev: "WoS", tone: "blue",
        linkType: "web_of_science" },
    handleId: { label: "Handle ID", abbrev: "HDL", tone: "slate" },
    arxivId: { label: "ArXiv ID", abbrev: "arXiv", tone: "indigo" },
    pubmedId: { label: "PubMed ID", abbrev: "PMID", tone: "emerald" },
    ssrnId: { label: "SSRN ID", abbrev: "SSRN", tone: "violet" },
    nationalId: { labelKey: "nationalIdLabel", icon: "mdi-identifier", tone: "violet",
        linkType: "national_document" }
};

const PRESENTATION: Partial<Record<ApplicableEntityType, Record<string, IdentifierPresentation>>> = {
    [ApplicableEntityType.PERSON]: PERSON,
    [ApplicableEntityType.ORGANISATION_UNIT]: ORGANISATION_UNIT,
    [ApplicableEntityType.PROJECT]: PROJECT,
    [ApplicableEntityType.DOCUMENT]: DOCUMENT
};

export const identifierPresentation = (entityType: ApplicableEntityType) =>
    PRESENTATION[entityType] ?? {};
