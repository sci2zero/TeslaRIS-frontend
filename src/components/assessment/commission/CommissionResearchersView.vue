<template>
    <v-tabs
        v-model="currentTab"
        color="deep-purple-accent-4"
        align-tabs="start"
    >
        <v-tab v-for="area in researchAreas" :key="area" :value="area">
            {{ getResearchAreaTitle(area) }}
        </v-tab>
    </v-tabs>

    <v-tabs-window v-model="currentTab">
        <v-tabs-window-item v-for="area in researchAreas" :key="area" :value="area">
            <generic-crud-modal
                :form-component="CommissionResearcherForm"
                :form-props="{ commissionId: commissionId, presetResearchArea: area, institutionId: institutionId }"
                entity-name="AssessmentResearcher"
                :read-only="false"
                @create="fetchDisplayData"
            />
            
            <person-table-component
                :ref="(el) => (personTableRefs[area] = el)"
                :persons="(researchersByArea.get(area) as PersonIndex[])"
                :total-persons="(researcherCountByArea.get(area) as number)"
                is-commission-researchers-table
                @switch-page="(page, itemsPerPage, sortField, sortDir) => switchPage(page, itemsPerPage, sortField, sortDir, area)"
                @delete="removePersonsFromConsideration"
            ></person-table-component>
        </v-tabs-window-item>
    </v-tabs-window>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ref } from 'vue';
import { onMounted } from 'vue';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { AssessmentResearchArea } from '@/models/AssessmentModel';
import AssessmentResearchAreaService from '@/services/assessment/AssessmentResearchAreaService';
import { type PersonIndex } from '@/models/PersonModel';
import CommissionResearcherForm from './CommissionResearcherForm.vue';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import { useRouter } from 'vue-router';
import PersonTableComponent from '@/components/person/PersonTableComponent.vue';


export default defineComponent({
    name: "CommissionResearchersView",
    components: { GenericCrudModal, PersonTableComponent },
    props: {
        researchAreas: {
            type: Array<string>,
            required: true
        },
        commissionId: {
            type: Number,
            required: true
        },
        institutionId: {
            type: Number,
            required: true
        }
    },
    emits: ["create"],
    setup(props) {
        const currentTab = ref("");

        const router = useRouter();

        const researchAreas = ref<AssessmentResearchArea[]>([]);

        const researchersByArea = ref<Map<string, PersonIndex[]>>(new Map());
        const researcherCountByArea = ref<Map<string, number>>(new Map());

        const personTableRefs = ref<Record<string, any>>({});

        onMounted(() => {
            AssessmentResearchAreaService.readAssessmentResearchAreas().then(response => {
                researchAreas.value = response.data;
            });

            if (props.researchAreas.length > 0) {
                currentTab.value = props.researchAreas[0];
            }

            fetchDisplayData();
        });

        const fetchDisplayData = () => {
            researchersByArea.value.clear();
            props.researchAreas.forEach((researchArea: string) => {
                const tableRef = personTableRefs.value[researchArea];
                if (tableRef) {
                    tableRef.notifyUserAndRefreshTable(true);
                } else {
                    AssessmentResearchAreaService.readPersonAssessmentResearchAreaForCommission(props.commissionId, researchArea, `page=0&size=10`).then(response => {
                        researchersByArea.value.set(researchArea, response.data.content);
                        researcherCountByArea.value.set(researchArea, response.data.totalElements);
                    });
                }
            });
        };

        const getResearchAreaTitle = (code: string): string => {
            return returnCurrentLocaleContent(researchAreas.value.find(researchArea => researchArea.code === code)?.name) as string;
        };

        const removePersonsFromConsideration = async (personIds: number[]) => {
            await Promise.allSettled(
                personIds.map(personId => 
                    AssessmentResearchAreaService.removePersonAssessmentResearchAreaForCommission(personId, props.commissionId)
                )
            );

            fetchDisplayData();
        };

        const navigateToPerson = (personId: number) => {
            router.push({ name: "researcherLandingPage", params: {id: personId} });
        };

        const switchPage = (page: number, itemsPerPage: number, sortField: string, sortDir: string, area: string) => {
            AssessmentResearchAreaService.readPersonAssessmentResearchAreaForCommission(props.commissionId, area, `&page=${page}&size=${itemsPerPage}&sort=${sortField},${sortDir}`).then(response => {
                researchersByArea.value.set(area, response.data.content);
                researcherCountByArea.value.set(area, response.data.totalElements);
            });
        };

        return {
            currentTab, switchPage,
            getResearchAreaTitle,
            researchersByArea,
            removePersonsFromConsideration,
            fetchDisplayData,
            CommissionResearcherForm,
            navigateToPerson,
            researcherCountByArea,
            personTableRefs
        };
    }
});
</script>
