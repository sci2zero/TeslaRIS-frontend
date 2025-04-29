import { type DocumentCSVExportRequest, type MultilingualContent } from "./Common";
import type { Contact, PersonName, PostalAddress } from "./PersonModel";
import { ThesisType } from "./PublicationModel"


export interface ThesisReportRequest {
    fromDate: string,
    toDate: string;
    topLevelInstitutionIds: number[];
    thesisType: ThesisType;
}

export interface ThesisReportCounts {
    institutionId: number;
    institutionName: MultilingualContent[];
    defendedCount: number;
    putOnPublicReviewCount: number;
    topicsAcceptedCount: number;
    publiclyAvailableCount: number;
}

export enum ThesisReportType {
    DEFENDED = "DEFENDED",
    ACCEPTED = "ACCEPTED",
    PUBLIC_REVIEW = "PUBLIC_REVIEW",
    PUBLICLY_AVAILABLE = "PUBLICLY_AVAILABLE"
}

export interface ThesisSearchRequest {
    tokens: string[];
    facultyIds: number[];
    authorIds: number[];
    advisorIds: number[];
    boardMemberIds: number[];
    boardPresidentIds: number[];
    thesisTypes: ThesisType[];
    showOnlyOpenAccess: boolean;
    dateFrom: string;
    dateTo: string;
}

export interface ThesisCSVExportRequest extends DocumentCSVExportRequest {
    thesisSearchRequest: ThesisSearchRequest
}

export interface Promotion {
    id?: number;
    promotionDate: string;
    promotionTime: string;
    placeOrVenue: string;
    description: MultilingualContent[];
    institutionId: number;
    finished?: boolean;
}

export enum AcademicTitle {
    BASIC_ACADEMIC_STUDIES = "BASIC_ACADEMIC_STUDIES",
    MASTER_ACADEMIC_STUDIES = "MASTER_ACADEMIC_STUDIES",
    INTEGRATED_ACADEMIC_STUDIES = "INTEGRATED_ACADEMIC_STUDIES",
    SPECIALIZED_ACADEMIC_STUDIES = "SPECIALIZED_ACADEMIC_STUDIES",
    MAGISTER_STUDIES = "MAGISTER_STUDIES"
}

export interface DissertationInformation {
    dissertationTitle: string;
    organisationUnitId: number;
    institutionName?: MultilingualContent[];
    mentor: string;
    commission: string;
    grade: string;
    acquiredTitle: string;
    defenceDate: string;
    diplomaNumber: string;
    diplomaIssueDate: string;
    diplomaSupplementsNumber: string;
    diplomaSupplementsIssueDate: string;
    institutionPlace: string;
}

export interface RegistryBookPersonalInformation {
    authorName: PersonName;
    localBirthDate: string;
    placeOfBrith: string;
    municipalityOfBrith: string;
    countryOfBirthId: number;
    fatherName: string;
    fatherSurname: string;
    motherName: string;
    motherSurname: string;
    guardianNameAndSurname: string;
}

export interface RegistryBookContactInformation {
    residenceCountryId: number;
    streetAndNumber: string;
    place: string;
    municipality: string;
    postalCode: string;
    contact: Contact;
}

export interface PreviousTitleInformation {
    institutionName: string;
    graduationDate: string;
    institutionPlace: string;
    schoolYear: string;
    academicTitle: AcademicTitle;
}

export interface RegistryBookEntry {
    id?: number;
    dissertationInformation: DissertationInformation;
    personalInformation: RegistryBookPersonalInformation;
    contactInformation: RegistryBookContactInformation;
    previousTitleInformation: PreviousTitleInformation;
    inPromotion?: boolean;
    promoted?: boolean;
    promotionSchoolYear?: string;
    registryBookNumber?: number;
    promotionOrdinalNumber?: number;
    thesisId?: number;
}

export interface PhdThesisPrePopulatedData {
    personName: PersonName;
    localBirthDate: string;
    placeOfBirth: string;
    postalAddress: PostalAddress;
    contact: Contact;
    institutionName: string;
    institutionId: number;
    place: string;
    title: string;
    mentor: string;
    commission: string;
    defenceDate: string;
}

export interface PromotedCounts {
    a: number;
    b: number;
}

export interface InstitutionPromotionCountsReport {
    institutionName: MultilingualContent[];
    counts: PromotedCounts;
}

export enum ThesisFileSection {
    PROOFS = "PROOFS",
    FILE_ITEMS = "FILE_ITEMS",
    PRELIMINARY_FILES = "PRELIMINARY_FILES",
    PRELIMINARY_SUPPLEMENTS = "PRELIMINARY_SUPPLEMENTS",
    COMMISSION_REPORTS = "COMMISSION_REPORTS"
}
