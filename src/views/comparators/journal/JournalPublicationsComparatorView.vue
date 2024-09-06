<template>
    <v-container id="journal-publications-comparator">
        <v-row class="d-flex flex-row justify-center align-start">
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ returnCurrentLocaleContent(leftJournal?.title) }}
                </h2>
                <br />
                <!-- Left Publication Table -->
                <publication-table-component
                    :publications="leftPublications" :total-publications="leftTotalPublications" in-comparator @switch-page="switchPageLeft"
                    @dragged="handleDrag"></publication-table-component>
            </v-col>

            <v-col cols="1">
                <v-btn class="mb-1 middle-arrow" icon @click="moveAll(true)">
                    <v-icon>mdi-arrow-right</v-icon>
                </v-btn>
                <v-btn class="mt-1 middle-arrow" icon @click="moveAll(false)">
                    <v-icon>mdi-arrow-left</v-icon>
                </v-btn>
            </v-col>
            
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ returnCurrentLocaleContent(rightJournal?.title) }}
                </h2>

                <br />
                <!-- Right Publication Table -->
                <publication-table-component :publications="rightPublications" :total-publications="rightTotalPublications" in-comparator @switch-page="switchPageRight"></publication-table-component>
            </v-col>
        </v-row>

        <v-row v-if="loading" class="d-flex flex-row justify-center submission-action">
            <v-progress-circular
                :size="70"
                :width="7"
                color="blue"
                indeterminate
            ></v-progress-circular>
        </v-row>

        <v-snackbar
            v-model="snackbar"
            :timeout="5000">
            {{ snackbarMessage }}
            <template #actions>
                <v-btn
                    color="blue"
                    variant="text"
                    @click="snackbar = false">
                    {{ $t("closeLabel") }}
                </v-btn>
            </template>
        </v-snackbar>
    </v-container>
</template>

<script lang="ts">
import { onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import PublicationTableComponent from '@/components/publication/PublicationTableComponent.vue';
import type { DocumentPublicationIndex } from '@/models/PublicationModel';
import DocumentPublicationService from "@/services/DocumentPublicationService";
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import JournalService from '@/services/JournalService';
import type { Journal } from '@/models/JournalModel';
import MergeService from '@/services/MergeService';


export default defineComponent({
    name: "JournalPublicationsComparator",
    components: { PublicationTableComponent },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");
        const loading = ref(false);

        const currentRoute = useRoute();

        const leftJournal = ref<Journal>();
        const rightJournal = ref<Journal>();

        const leftPublications = ref<DocumentPublicationIndex[]>([]);
        const leftTotalPublications = ref<number>(0);
        const leftPage = ref(0);
        const leftSize = ref(1);
        const leftSort = ref("");
        const leftDirection = ref("");

        const rightPublications = ref<DocumentPublicationIndex[]>([]);
        const rightTotalPublications = ref<number>(0);
        const rightPage = ref(0);
        const rightSize = ref(1);
        const rightSort = ref("");
        const rightDirection = ref("");

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("journalPublicationsComparatorLabel");
            fetchJournals();
            fetchPublications();
        });

        const switchPageLeft = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            leftPage.value = nextPage;
            leftSize.value = pageSize;
            leftSort.value = sortField;
            leftDirection.value = sortDir;
            fetchLeftPublications();
        };

        const switchPageRight = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            rightPage.value = nextPage;
            rightSize.value = pageSize;
            rightSort.value = sortField;
            rightDirection.value = sortDir;
            fetchRightPublications();
        };

        const fetchLeftPublications = () => {
            DocumentPublicationService.findPublicationsInJournal(parseInt(currentRoute.params.leftId as string), `page=${leftPage.value}&size=${leftSize.value}&sort=${leftSort.value},${leftDirection.value}`).then((publicationResponse) => {
                leftPublications.value = publicationResponse.data.content;
                leftTotalPublications.value = publicationResponse.data.totalElements
            });
        };

        const fetchRightPublications = () => {
            DocumentPublicationService.findPublicationsInJournal(parseInt(currentRoute.params.rightId as string), `page=${rightPage.value}&size=${rightSize.value}&sort=${rightSort.value},${rightDirection.value}`).then((publicationResponse) => {
                rightPublications.value = publicationResponse.data.content;
                rightTotalPublications.value = publicationResponse.data.totalElements
            });
        };

        const fetchPublications = () => {
            fetchLeftPublications();
            fetchRightPublications();
        };

        const fetchJournals = () => {
            JournalService.readJournal(parseInt(currentRoute.params.leftId as string)).then((response) => {
                leftJournal.value = response.data;
            });

            JournalService.readJournal(parseInt(currentRoute.params.rightId as string)).then((response) => {
                rightJournal.value = response.data;
            });
        };

        const handleDrag = (event: any) => {
            if(event.added) {
                MergeService.switchJournalPublicationToOtherJournal(leftJournal.value?.id as number, event.added.element.databaseId).then(() => {
                    fetchPublications();
                });
            } else if (event.removed) {
                MergeService.switchJournalPublicationToOtherJournal(rightJournal.value?.id as number, event.removed.element.databaseId).then(() => {
                    fetchPublications();
                });
            }
        };

        const moveAll = (fromLeftToRight: boolean) => {
            loading.value = true;
            MergeService.switchAllPublicationsToOtherJournal(
                (fromLeftToRight ? leftJournal.value?.id : rightJournal.value?.id) as number, 
                (fromLeftToRight ? rightJournal.value?.id : leftJournal.value?.id) as number)
                .then(() => {
                    fetchPublications();
                    loading.value = false;
            });
        };

        return {
            returnCurrentLocaleContent,
            snackbar, snackbarMessage,
            switchPageLeft, switchPageRight,
            leftPublications, leftTotalPublications,
            rightPublications, rightTotalPublications,
            leftJournal, rightJournal, handleDrag,
            moveAll, loading
        };
}})

</script>
