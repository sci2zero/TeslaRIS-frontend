import type { DocumentFile } from "@/models/DocumentFileModel";
import type { Document } from "@/models/PublicationModel";
import DocumentFileService from "@/services/DocumentFileService";


export const addAttachment = (attachment: DocumentFile, isProof: boolean, document?: Document) => {
    DocumentFileService.addDocumentFileAttachment(attachment, document?.id as number, isProof).then((response => {
        if(isProof) {
            document?.proofs?.push(response.data);
        } else {
            document?.fileItems?.push(response.data);
        }
    }));
};

export const updateAttachment = (attachment: DocumentFile, isProof: boolean, document?: Document) => {
    DocumentFileService.updateDocumentFileAttachment(attachment).then((response) => {
        if(isProof) {
            document!.proofs = document?.proofs?.filter(proof => proof.id !== attachment.id);
            document?.proofs?.push(response.data);
        } else {
            document!.fileItems = document?.fileItems?.filter(fileItem => fileItem.id !== attachment.id);
            document?.fileItems?.push(response.data);
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
