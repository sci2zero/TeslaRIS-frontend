<template>
    <v-container id="assessment-rulebook">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        {{ returnCurrentLocaleContent(commission?.description) }}
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ $t("commissionLabel") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- Commission Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon size="x-large" class="large-assessment-rulebook-icon">
                    {{ icon }}
                </v-icon>
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="secondary">
                    <v-card-text class="edit-pen-container">
                        <generic-crud-modal
                            :form-component="CommissionForm"
                            :form-props="{ presetCommission: commission, isUpdate: true }"
                            is-section-update
                            entity-name="Commission"
                            :read-only="false"
                            @create="updateBasicInfo"
                        />

                        <!-- Basic Info -->
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>
                        <v-row>
                            <v-col cols="6">
                                <div v-if="commission?.assessmentDateFrom">
                                    {{ $t("startDateLabel") }}:
                                </div>
                                <div v-if="commission?.assessmentDateFrom" class="response">
                                    {{ localiseDate(commission.assessmentDateFrom) }}
                                </div>
                                <div v-if="commission?.assessmentDateTo">
                                    {{ $t("endDateLabel") }}:
                                </div>
                                <div v-if="commission?.assessmentDateTo" class="response">
                                    {{ localiseDate(commission.assessmentDateTo) }}
                                </div>
                                <div v-if="commission?.formalDescriptionOfRule">
                                    {{ $t("classificationRuleLabel") }}:
                                </div>
                                <div v-if="commission?.formalDescriptionOfRule" class="response">
                                    {{ commission.formalDescriptionOfRule }}
                                </div>
                            </v-col>
                            <v-col>
                                <div v-if="commission?.recognisedResearchAreas && commission.recognisedResearchAreas.length > 0">
                                    {{ $t("researchAreasLabel") }}:
                                </div>
                                <div v-for="researchArea in commission?.recognisedResearchAreas" :key="researchArea" class="response">
                                    {{ getResearchAreaTitle(researchArea) }}
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-tabs
            v-model="currentTab"
            color="deep-purple-accent-4"
            align-tabs="start"
        >
            <v-tab value="relations">
                {{ $t("commissionRelationsLabel") }}
            </v-tab>
            <v-tab v-if="commission?.recognisedResearchAreas && commission.recognisedResearchAreas.length > 0" value="researchersForAssessment">
                {{ $t("researchAreasLabel") }}
            </v-tab>
        </v-tabs>

        <v-tabs-window v-model="currentTab">
            <v-tabs-window-item value="relations">
                <commission-relations-view :commission-relations="commissionRelations" :can-edit="true" :source-commission-id="commission?.id" @update="fetchRelations"></commission-relations-view>
            </v-tabs-window-item>
            <v-tabs-window-item value="researchersForAssessment">
                <commission-researchers-view :commission-id="(commission?.id as number)" :research-areas="(commission?.recognisedResearchAreas as string[])"></commission-researchers-view>
            </v-tabs-window-item>
        </v-tabs-window>

        <toast v-model="snackbar" :message="snackbarMessage" />
    </v-container>
</template>

<script lang="ts">
import type { LanguageTagResponse, MultilingualContent } from '@/models/Common';
import { onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { watch } from 'vue';
import LanguageService from '@/services/LanguageService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import { type CommissionRelationResponse, type Commission, type CommissionResponse, type AssessmentResearchArea } from '@/models/AssessmentModel';
import CommissionService from '@/services/assessment/CommissionService';
import { localiseDate } from '@/i18n/dateLocalisation';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import CommissionForm from '@/components/assessment/commission/CommissionForm.vue';
import Toast from '@/components/core/Toast.vue';
import CommissionRelationService from '@/services/assessment/CommissionRelationService';
import CommissionRelationsView from '@/components/assessment/commission/CommissionRelationsView.vue';
import AssessmentResearchAreaService from '@/services/assessment/AssessmentResearchAreaService';
import CommissionResearchersView from '@/components/assessment/commission/CommissionResearchersView.vue';


export default defineComponent({
    name: "CommissionLandingPage",
    components: { GenericCrudModal, Toast, CommissionRelationsView, CommissionResearchersView },
    setup() {
        const currentTab = ref("relations");

        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();

        const commission = ref<CommissionResponse>();
        const commissionRelations = ref<CommissionRelationResponse[]>([]);

        const languageTagMap = ref<Map<number, LanguageTagResponse>>(new Map());

        const i18n = useI18n();

        const icon = ref("mdi-account-group-outline");

        const router = useRouter();
        const researchAreas = ref<AssessmentResearchArea[]>([]);

        onMounted(() => {
            AssessmentResearchAreaService.readAssessmentResearchAreas().then(response => {
                researchAreas.value = response.data;
            });

            fetchCommission();
        });

        watch(i18n.locale, () => {
            populateData();
        });

        const fetchCommission = () => {
            CommissionService.readCommission(parseInt(currentRoute.params.id as string)).then((response) => {
                commission.value = response.data;

                document.title = returnCurrentLocaleContent(commission.value.description) as string;
    
                populateData();
            });
        };

        const populateData = () => {
            LanguageService.getAllLanguageTags().then(response => {
                response.data.forEach(languageTag => {
                    languageTagMap.value.set(languageTag.id, languageTag);
                })
            });

            fetchRelations();
        };

        const fetchRelations = () => {
            CommissionRelationService.fetchAllCommissionRelations(commission.value?.id as number).then((response) => {
                commissionRelations.value.splice(0);
                commissionRelations.value = response.data;
            });
        };

        const updateDescription = (description: MultilingualContent[]) => {
            commission.value!.description = description;
            performUpdate(false);
        };

        const updateBasicInfo = (basicInfo: Commission) => {
            commission.value!.description = basicInfo.description;
            commission.value!.assessmentDateFrom = basicInfo.assessmentDateFrom;
            commission.value!.assessmentDateTo = basicInfo.assessmentDateTo;
            commission.value!.formalDescriptionOfRule = basicInfo.formalDescriptionOfRule;
            commission.value!.recognisedResearchAreas = basicInfo.recognisedResearchAreas;

            performUpdate(true);
        };

        const performUpdate = (reload: boolean) => {
            const updateRequest: Commission = {
                description: commission.value?.description as MultilingualContent[],
                assessmentDateFrom: commission.value?.assessmentDateFrom as string,
                assessmentDateTo: commission.value?.assessmentDateTo as string,
                formalDescriptionOfRule: commission.value?.formalDescriptionOfRule as string,
                recognisedResearchAreas: commission.value?.recognisedResearchAreas as string[]
            };

            CommissionService.updateCommission(commission.value?.id as number, updateRequest).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                if(reload) {
                    fetchCommission();
                }
            }).catch(() => {
                snackbarMessage.value = i18n.t("genericErrorMessage");
                snackbar.value = true;
                if(reload) {
                    fetchCommission();
                }
            });
        };

        const navigateToTargetCommission = (commissionId: number) => {
            router.push({ name: "commissionLandingPage", params: {id: commissionId} });
        };

        const getResearchAreaTitle = (code: string): string => {
            return returnCurrentLocaleContent(researchAreas.value.find(researchArea => researchArea.code === code)?.name) as string;
        };

        return {
            commission, icon, returnCurrentLocaleContent,
            updateBasicInfo, localiseDate, snackbarMessage,
            updateDescription, snackbar, navigateToTargetCommission,
            CommissionForm, commissionRelations, fetchRelations,
            currentTab, getResearchAreaTitle
        };
}})

</script>

<style scoped>
    #assessment-rulebook .large-assessment-rulebook-icon {
        font-size: 10em;
    }

    #assessment-rulebook .response {
        font-size: 1.2rem;
        margin-bottom: 10px;
        font-weight: bold;
    }

    .edit-pen-container {
        position:relative;
    }
</style>
