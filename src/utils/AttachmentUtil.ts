import { type DocumentFile, ThesisAttachmentType } from "@/models/DocumentFileModel";
import type { Document, Thesis } from "@/models/PublicationModel";
import DocumentFileService from "@/services/DocumentFileService";
import { useUploadStore } from "@/stores/uploadStore";


export const addAttachment = (attachment: DocumentFile, isProof: boolean, document?: Document) => {
    const uploadStore = useUploadStore();
    if (uploadStore.isUploading) {
        return;
    }
    uploadStore.uploadProgressRef?.startUpload(attachment.file.name);

    DocumentFileService.addDocumentFileAttachment(attachment, document?.id as number, isProof).then((response => {
        if(isProof) {
            document?.proofs?.push(response.data);
        } else {
            document?.fileItems?.push(response.data);
        }

        uploadStore.uploadProgressRef?.updateProgress(100);
    }));
};

export const addThesisAttachment = (attachment: DocumentFile, attachmentType: ThesisAttachmentType, thesis?: Thesis) => {
    const uploadStore = useUploadStore();
    if (uploadStore.isUploading) {
        return;
    }
    uploadStore.uploadProgressRef?.startUpload(attachment.file.name);

    DocumentFileService.addThesisFileAttachment(attachment, thesis?.id as number, attachmentType).then((response => {
        switch(attachmentType) {
            case ThesisAttachmentType.FILE:
                thesis?.preliminaryFiles?.push(response.data);
                break;
            case ThesisAttachmentType.SUPPLEMENT:
                thesis?.preliminarySupplements?.push(response.data);
                break;
            case ThesisAttachmentType.COMMISSION_REPORT:
                thesis?.commissionReports?.push(response.data);
                break;
        }

        uploadStore.uploadProgressRef?.updateProgress(100);
    }));
};

export const updateAttachment = (attachment: DocumentFile, isProof: boolean, document?: Document) => {
    const uploadStore = useUploadStore();
    if (uploadStore.isUploading) {
        return;
    }

    if (attachment.file.size > 0) {
        uploadStore.uploadProgressRef?.startUpload(attachment.file.name);
    }

    DocumentFileService.updateDocumentFileAttachment(attachment, document?.id, isProof).then((response) => {
        if(isProof) {
            document!.proofs = document?.proofs?.filter(proof => proof.id !== attachment.id);
            document?.proofs?.push(response.data);
        } else {
            document!.fileItems = document?.fileItems?.filter(fileItem => fileItem.id !== attachment.id);
            document?.fileItems?.push(response.data);
        }

        if (attachment.file.size > 0) {
            uploadStore.uploadProgressRef?.updateProgress(100);
        }
    });
};

export const deleteAttachment = (attachmentId: number, isProof: boolean, document?: Document) => {
    DocumentFileService.deleteDocumentFileAttachment(document?.id as number, attachmentId).then(() => {
        if(isProof) {
            document!.proofs = document?.proofs?.filter(proof => proof.id !== attachmentId);
        } else {
            document!.fileItems = document?.fileItems?.filter(fileItem => fileItem.id !== attachmentId);
        }
    });
};

export const deleteThesisAttachment = (attachmentId: number, attachmentType: ThesisAttachmentType, thesis?: Thesis) => {
    DocumentFileService.deleteThesisFileAttachment(thesis?.id as number, attachmentId, attachmentType).then(() => {
        switch(attachmentType) {
            case ThesisAttachmentType.FILE:
                thesis!.preliminaryFiles = thesis?.preliminaryFiles?.filter(attachment => attachment.id !== attachmentId);
                break;
            case ThesisAttachmentType.SUPPLEMENT:
                thesis!.preliminarySupplements = thesis?.preliminarySupplements?.filter(attachment => attachment.id !== attachmentId);
                break;
            case ThesisAttachmentType.COMMISSION_REPORT:
                thesis!.commissionReports = thesis?.commissionReports?.filter(attachment => attachment.id !== attachmentId);
                break;
        }
    });
};

export const mergeDocumentAttachments = (document1: Document, document2: Document) => {
    document2.proofs?.forEach(proof => {
        document1.proofs?.push(proof);
    });
    document2.proofs = [];
    
    document2.fileItems?.forEach(proof => {
        document1.fileItems?.push(proof);
    });
    document2.fileItems = [];
};
