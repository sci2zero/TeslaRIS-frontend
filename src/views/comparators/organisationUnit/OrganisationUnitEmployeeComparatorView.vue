<template>
    <v-container id="journal-publications-comparator">
        <v-row class="d-flex flex-row justify-center align-start">
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ returnCurrentLocaleContent(leftOU?.name) }}
                </h2>
                <br />
                <!-- Left Employee Table -->
                <person-table-component
                    :persons="leftEmployees" :total-persons="leftTotalEmployees" in-comparator @switch-page="switchPageLeft"
                    @dragged="handleDrag"></person-table-component>
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
                    {{ returnCurrentLocaleContent(rightOU?.name) }}
                </h2>

                <br />
                <!-- Right Employee Table -->
                <person-table-component :persons="rightEmployees" :total-persons="rightTotalEmployees" in-comparator @switch-page="switchPageRight"></person-table-component>
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
import PersonService from '@/services/PersonService';
import MergeService from '@/services/MergeService';
import type { PersonIndex } from '@/models/PersonModel';
import { getErrorMessageForErrorKey } from '@/i18n';
import type { OrganisationUnitResponse } from '@/models/OrganisationUnitModel';
import OrganisationUnitService from '@/services/OrganisationUnitService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import PersonTableComponent from '@/components/person/PersonTableComponent.vue';


export default defineComponent({
    name: "OrganisationUnitEmployeeComparator",
    components: { PersonTableComponent },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");
        const loading = ref(false);

        const currentRoute = useRoute();

        const leftOU = ref<OrganisationUnitResponse>();
        const rightOU = ref<OrganisationUnitResponse>();

        const leftEmployees = ref<PersonIndex[]>([]);
        const leftTotalEmployees = ref<number>(0);
        const leftPage = ref(0);
        const leftSize = ref(1);
        const leftSort = ref("");
        const leftDirection = ref("");

        const rightEmployees = ref<PersonIndex[]>([]);
        const rightTotalEmployees = ref<number>(0);
        const rightPage = ref(0);
        const rightSize = ref(1);
        const rightSort = ref("");
        const rightDirection = ref("");

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("compareEmployeesLabel");
            fetchOUs();
            fetchEmployees();
        });

        const switchPageLeft = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            leftPage.value = nextPage;
            leftSize.value = pageSize;
            leftSort.value = sortField;
            leftDirection.value = sortDir;
            fetchLeftEmployees();
        };

        const switchPageRight = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            rightPage.value = nextPage;
            rightSize.value = pageSize;
            rightSort.value = sortField;
            rightDirection.value = sortDir;
            fetchRightEmployees();
        };

        const fetchLeftEmployees = () => {
            PersonService.findEmployeesForOU(parseInt(currentRoute.params.leftId as string)).then((response) => {
                leftEmployees.value = response.data.content;
                leftTotalEmployees.value = response.data.totalElements;
            });
        };

        const fetchRightEmployees = () => {
            PersonService.findEmployeesForOU(parseInt(currentRoute.params.rightId as string)).then((response) => {
                rightEmployees.value = response.data.content;
                rightTotalEmployees.value = response.data.totalElements;
            });
        };

        const fetchEmployees = () => {
            fetchLeftEmployees();
            fetchRightEmployees();
        };

        const fetchOUs = () => {
            OrganisationUnitService.readOU(parseInt(currentRoute.params.leftId as string)).then((response) => {
                leftOU.value = response.data;
            });

            OrganisationUnitService.readOU(parseInt(currentRoute.params.rightId as string)).then((response) => {
                rightOU.value = response.data;
            });
        };

        const handleDrag = (event: any) => {
            if(event.added) {
                MergeService.switchEmployemntToOtherOU(rightOU.value?.id as number, leftOU.value?.id as number, event.added.element.databaseId)
                .then(() => {
                    fetchEmployees();
                })
                .catch((error) => {
                    snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                    snackbar.value = true;
                    loading.value = false;
                });
            } else if (event.removed) {
                MergeService.switchEmployemntToOtherOU(leftOU.value?.id as number, rightOU.value?.id as number, event.removed.element.databaseId)
                .then(() => {
                    fetchEmployees();
                }).catch((error) => {
                    snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                    snackbar.value = true;
                    loading.value = false;
                });
            }
        };

        const moveAll = (fromLeftToRight: boolean) => {
            loading.value = true;
            MergeService.switchAllEmploymentsToOtherOU(
                (fromLeftToRight ? leftOU.value?.id : rightOU.value?.id) as number, 
                (fromLeftToRight ? rightOU.value?.id : leftOU.value?.id) as number)
                .then(() => {
                    fetchEmployees();
                    loading.value = false;
            });
        };

        return {
            snackbar, snackbarMessage,
            switchPageLeft, switchPageRight,
            leftEmployees, leftTotalEmployees,
            rightEmployees, rightTotalEmployees,
            leftOU, rightOU, handleDrag,
            moveAll, loading,
            returnCurrentLocaleContent
        };
}})

</script>
