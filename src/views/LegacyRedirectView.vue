<template>
    <v-sheet
        class="d-flex align-center flex-column mt-12"
        height="200"
    >
        <v-row v-if="!deleted" class="d-flex flex-row justify-center">
            <h2>{{ redirectionFinished ? $t("redirectionFinishedMessage") : $t("redirectingToResourceMessage") }}</h2>
        </v-row>
        <v-row v-else>
            <h2>{{ $t("resourceDeletedMessage") }}</h2>
        </v-row>
        <v-row
            v-if="!redirectionFinished"
            class="d-flex flex-row justify-center">
            <v-progress-circular
                :size="70"
                :width="7"
                color="blue"
                indeterminate
            ></v-progress-circular>
        </v-row>
        <v-row 
            v-if="!redirectionFinished"
            class="d-flex flex-row justify-center">
            <h3>{{ $t("doNotCloseMessage") }}</h3>
        </v-row>
    </v-sheet>
</template>

<script lang="ts">
import DocumentFileService from '@/services/DocumentFileService';
import LegacyRedirectService from '@/services/LegacyRedirectService';
import { defineComponent, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default defineComponent({
    name: "LegacyRedirectView",
    setup() {
        const route = useRoute();
        const router = useRouter();
        const redirectionFinished = ref(false);
        const deleted = ref(false);

        onMounted(() => {
            const { query, params } = route;
            const source = query.source as string;
            const language = query.language as string;

            if (route.path.includes("/record") && query.recordId) {
                const legacyId = parseInt(query.recordId as string);
                LegacyRedirectService.getEntityNavigationDetails(legacyId, source, language)
                .then(response => {
                    const landingPageName = deduceLandingPageRouteName(response.data.entityType);
                    router.push({name: landingPageName, params: {id: response.data.databaseId, locale: query.language as string}});
                    return;
                });
            } else if (route.path.includes("/DownloadFileServlet") && query.controlNumber) {
                const legacyId = query.fileName as string;
                LegacyRedirectService.getDocumentFileNavigationDetails(legacyId, source, language)
                .then(response => {
                    if (response.data.serverFilename === "DELETED") {
                        redirectionFinished.value = true;
                        deleted.value = true;
                    } else if (response.data.serverFilename !== "NOT_FOUND") {
                        DocumentFileService.downloadDocumentFile(response.data.serverFilename, params.fileName as string, "", true)
                        .then(() => redirectionFinished.value = true);
                    } else {
                        router.push({ name: "notFound" , params: {locale: query.language as string}});
                    }
                });
            }
        });

        const deduceLandingPageRouteName = (entityType: string) => {
            switch (entityType) {
                case "ORGANISATION_UNIT":
                    return "organisationUnitLandingPage";
                case "PERSON":
                    return "researcherLandingPage";
                case "CONFERENCE":
                    return "conferenceLandingPage";
                case "JOURNAL":
                    return "journalLandingPage";
                case "BOOK_SERIES":
                    return "bookSeriesLandingPage";
                case "JOURNAL_PUBLICATION":
                    return "journalPublicationLandingPage";
                case "PROCEEDINGS_PUBLICATION":
                    return "proceedingsPublicationLandingPage";
                case "MONOGRAPH_PUBLICATION":
                    return "monographPublicationLandingPage";
                case "PROCEEDINGS":
                    return "proceedingsLandingPage";
                case "MONOGRAPH":
                    return "monographLandingPage";
                case "THESIS":
                    return "thesisLandingPage";
                case "SOFTWARE":
                    return "softwareLandingPage";
                case "PATENT":
                    return "patentLandingPage";
                case "DATASET":
                    return "datasetLandingPage";
                case "MATERIAL_PRODUCT":
                    return "datasetLandingPage";
                case "GENETIC_MATERIAL":
                    return "datasetLandingPage";
                default:
                    return "notFound";
            }
        };

        return {
            redirectionFinished,
            deleted
        };
    },
});
</script>