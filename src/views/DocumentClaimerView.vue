<template>
    <v-container>
        <h1>{{ $t("documentClaimMessage") }}</h1>
        <br />
        <br />
        <publication-table-component
            ref="tableRef" :publications="publications" :total-publications="totalPublications" in-claimer
            @switch-page="switchPage" @claim="claimPublication" @decline-claim="declinePublicationClaim"></publication-table-component>
        
        <toast v-model="snackbar" :message="message" />
    </v-container>
</template>

<script lang="ts">
import Toast from '@/components/core/Toast.vue';
import PublicationTableComponent from '@/components/publication/PublicationTableComponent.vue';
import type { DocumentPublicationIndex } from '@/models/PublicationModel';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import { defineComponent, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';


export default defineComponent({
    name: "DocumentClaimerView",
    components: {PublicationTableComponent, Toast},
    setup() {
        const publications = ref<DocumentPublicationIndex[]>([]);
        const totalPublications = ref(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const i18n = useI18n();

        const message = ref("");
        const snackbar = ref(false);

        onMounted(() => {
            document.title = i18n.t("scientificResultsListLabel");
        });

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            sort.value = sortField;
            direction.value = sortDir;
            fetchPotentialClaims();
        };

        const fetchPotentialClaims = () => {
            DocumentPublicationService.findPotentialClaims(`page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`).then((response) => {
                publications.value = response.data.content;
                totalPublications.value = response.data.totalElements;
            });
        };

        const claimPublication = (documentId: number) => {
            DocumentPublicationService.claimPublication(documentId).then(() => {
                message.value = i18n.t("claimSuccessMessage");
                snackbar.value = true;
                fetchPotentialClaims();
            });
        };

        const declinePublicationClaim = (documentId: number) => {
            DocumentPublicationService.declinePublicationClaim(documentId).then(() => {
                message.value = i18n.t("successfulltUpdatedNotification");
                snackbar.value = true;
                fetchPotentialClaims();
            });
        };

        return {
            publications, totalPublications,
            switchPage, claimPublication, message,
            snackbar, declinePublicationClaim
        };
    }
});
</script>