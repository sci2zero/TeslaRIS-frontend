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
                class="ml-5"
                :form-component="CommissionResearcherForm"
                :form-props="{ commissionId: commissionId, presetResearchArea: area, institutionId: institutionId }"
                entity-name="AssessmentResearcher"
                :read-only="false"
                @create="fetchDisplayData"
            />
            <v-list
                :lines="false"
                density="comfortable"
                class="bigger-font"
            >
                <v-list-item
                    v-for="person in researchersByArea.get(area)" :key="person.id"
                    :value="person"
                    color="grey-lighten-5"
                    @click="navigateToPerson(person.id as number)"
                >
                    <v-list-item-title>
                        {{ person.personName.firstname }} {{ person.personName.lastname }}
                    </v-list-item-title>

                    <template #append>
                        <v-row>
                            <v-col cols="auto">
                                <v-icon @click.stop="removePersonFromConsideration(person.id as number)">
                                    mdi-delete
                                </v-icon>
                            </v-col>
                        </v-row>
                    </template>
                </v-list-item>
            </v-list>
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
import { type PersonResponse } from '@/models/PersonModel';
import CommissionResearcherForm from './CommissionResearcherForm.vue';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import { useRouter } from 'vue-router';


export default defineComponent({
    name: "CommissionResearchersView",
    components: { GenericCrudModal },
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

        const researchersByArea = ref<Map<string, PersonResponse[]>>(new Map());

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
                AssessmentResearchAreaService.readPersonAssessmentResearchAreaForCommission(props.commissionId, researchArea).then(response => {
                    researchersByArea.value.set(researchArea, response.data.content);
                });
            });
        };

        const getResearchAreaTitle = (code: string): string => {
            return returnCurrentLocaleContent(researchAreas.value.find(researchArea => researchArea.code === code)?.name) as string;
        };

        const removePersonFromConsideration = (personId: number) => {
            AssessmentResearchAreaService.removePersonAssessmentResearchAreaForCommission(personId, props.commissionId).then(() => {
                fetchDisplayData();
            });
        };

        const navigateToPerson = (personId: number) => {
            router.push({ name: "researcherLandingPage", params: {id: personId} });
        };

        return {
            currentTab,
            getResearchAreaTitle,
            researchersByArea,
            removePersonFromConsideration,
            fetchDisplayData,
            CommissionResearcherForm,
            navigateToPerson
        };
    }
});
</script>
