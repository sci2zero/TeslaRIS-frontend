import { getErrorMessageForErrorKey } from "@/i18n";
import type { Document } from "@/models/PublicationModel";
import DocumentPublicationService from "@/services/DocumentPublicationService";
import type { Ref } from "vue";
import type { Router } from "vue-router";


export const commitArchiveStateChange = (
    archive: boolean,
    document: Document,
    snackbar: Ref<boolean>,
    snackbarMessage: Ref<string>,
    router: Router
) => {
    if (!archive) {
        DocumentPublicationService.unarchiveDocument(document.id as number)
        .then(() => {
            document.isArchived = false;
            router.go(0);
        });
    } else {
        DocumentPublicationService.archiveDocument(document.id as number)
        .then(() => {
            document.isArchived = true;
            router.go(0);
        })
        .catch((error) => {
            snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
            snackbar.value = true;
        });
    }
};
