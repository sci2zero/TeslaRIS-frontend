import { type Document } from "@/models/PublicationModel";
import OrganisationUnitTrustConfigurationService from "@/services/OrganisationUnitTrustConfigurationService";


export function useTrustConfigurationActions() {
  const fetchValidationStatus = async (
    documentId: number,
    document: Document
  ) => {
    const validationStatus = await OrganisationUnitTrustConfigurationService.fetchDocumentValidationStatus(documentId);
    document.isMetadataValid = validationStatus.data.a;
    document.areFilesValid = validationStatus.data.b;
  };

  return {
    fetchValidationStatus
  };
}
