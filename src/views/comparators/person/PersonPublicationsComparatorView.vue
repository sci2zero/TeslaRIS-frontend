<template>
    <v-container id="journal-publications-comparator">
        <v-row class="d-flex flex-row justify-center align-start">
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ `${leftPerson?.personName.firstname} ${leftPerson?.personName.lastname}` }}
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
                    {{ `${rightPerson?.personName.firstname} ${rightPerson?.personName.lastname}` }}
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
import PersonService from '@/services/PersonService';
import MergeService from '@/services/MergeService';
import type { PersonResponse } from '@/models/PersonModel';
import { getErrorMessageForErrorKey } from '@/i18n';


export default defineComponent({
    name: "PersonPublicationsComparator",
    components: { PublicationTableComponent },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");
        const loading = ref(false);

        const currentRoute = useRoute();

        const leftPerson = ref<PersonResponse>();
        const rightPerson = ref<PersonResponse>();

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
            document.title = i18n.t("personPublicationsComparatorLabel");
            fetchPersons();
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
            DocumentPublicationService.findResearcherPublications(parseInt(currentRoute.params.leftId as string), `page=${leftPage.value}&size=${leftSize.value}&sort=${leftSort.value},${leftDirection.value}`).then((publicationResponse) => {
                leftPublications.value = publicationResponse.data.content;
                leftTotalPublications.value = publicationResponse.data.totalElements
            });
        };

        const fetchRightPublications = () => {
            DocumentPublicationService.findResearcherPublications(parseInt(currentRoute.params.rightId as string), `page=${rightPage.value}&size=${rightSize.value}&sort=${rightSort.value},${rightDirection.value}`).then((publicationResponse) => {
                rightPublications.value = publicationResponse.data.content;
                rightTotalPublications.value = publicationResponse.data.totalElements
            });
        };

        const fetchPublications = () => {
            fetchLeftPublications();
            fetchRightPublications();
        };

        const fetchPersons = () => {
            PersonService.readPerson(parseInt(currentRoute.params.leftId as string)).then((response) => {
                leftPerson.value = response.data;
            });

            PersonService.readPerson(parseInt(currentRoute.params.rightId as string)).then((response) => {
                rightPerson.value = response.data;
            });
        };

        const handleDrag = (event: any) => {
            if(event.added) {
                MergeService.switchPublicationToOtherPerson(rightPerson.value?.id as number, leftPerson.value?.id as number, event.added.element.databaseId)
                .then(() => {
                    fetchPublications();
                })
                .catch((error) => {
                    snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                    snackbar.value = true;
                    loading.value = false;
                });
            } else if (event.removed) {
                MergeService.switchPublicationToOtherPerson(leftPerson.value?.id as number, rightPerson.value?.id as number, event.removed.element.databaseId)
                .then(() => {
                    fetchPublications();
                }).catch((error) => {
                    snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                    snackbar.value = true;
                    loading.value = false;
                });
            }
        };

        const moveAll = (fromLeftToRight: boolean) => {
            loading.value = true;
            MergeService.switchAllPublicationsToOtherPerson(
                (fromLeftToRight ? leftPerson.value?.id : rightPerson.value?.id) as number, 
                (fromLeftToRight ? rightPerson.value?.id : leftPerson.value?.id) as number)
                .then(() => {
                    fetchPublications();
                    loading.value = false;
            });
        };

        return {
            snackbar, snackbarMessage,
            switchPageLeft, switchPageRight,
            leftPublications, leftTotalPublications,
            rightPublications, rightTotalPublications,
            leftPerson, rightPerson, handleDrag,
            moveAll, loading
        };
}})

</script>

<style scoped>

    .middle-arrow {
        margin-left: 25px;
        margin-top: 120px;
    }

</style>
