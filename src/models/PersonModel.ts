import type { MultilingualContent } from "./Common";

export interface PersonIndex {
    id: string;
    name: string;
    nameSortable: string;
    employmentsSr: string;
    employmentsSrSortable: string;
    employmentsOther: string;
    employmentsOtherSortable: string;
    employmentInstitutionsId: number[];
    birthdate: string;
    birthdateSortable: string;
    databaseId: number;
    orcid: string;
}

interface PersonName {
    firstname: string;
    otherName: string;
    lastname: string;
    dateFrom: string;
    dateTo?: string;
}
  
interface PostalAddress {
    countryId: number;
    streetAndNumber: MultilingualContent[];
    city: MultilingualContent[];
}
  
interface Contact {
    contactEmail?: string;
    phoneNumber: string;
}

export interface PersonContribution {
    personId?: number;
    contributionDescription: MultilingualContent[];
    orderNumber: number;
    institutionIds: number[];
    displayAffiliationStatement: MultilingualContent[];
    personName: PersonName;
    postalAddress: PostalAddress;
    contact: Contact;
}
