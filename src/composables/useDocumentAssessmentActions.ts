import EntityClassificationService from "@/services/assessment/EntityClassificationService";
import EntityIndicatorService from "@/services/assessment/EntityIndicatorService";
import type { DocumentAssessmentClassification, DocumentIndicator } from "@/models/AssessmentModel";


export function useDocumentAssessmentActions() {
  const createDocumentClassification = async (
    classification: DocumentAssessmentClassification,
    onComplete: () => void
  ) => {
    await EntityClassificationService.createDocumentClassification(classification);
    onComplete();
  };

  const createDocumentIndicator = async (
    indicatorData: { indicator: DocumentIndicator; files: File[] },
    onComplete: () => void
  ) => {
    const response = await EntityIndicatorService.createDocumentIndicator(indicatorData.indicator);
    await EntityIndicatorService.uploadFilesAndFetchIndicators(indicatorData.files, response.data.id);
    onComplete();
  };

  return {
    createDocumentClassification,
    createDocumentIndicator
  };
}
