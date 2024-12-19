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
                                <div v-if="commission?.superCommissionId">
                                    {{ $t("superCommissionLabel") }}:
                                </div>
                                <div v-if="commission?.superCommissionId" class="response" @click="navigateToTargetCommission(commission.superCommissionId)">
                                    <localized-link :to="'assessment/commissions/' + commission?.superCommissionId">
                                        {{ returnCurrentLocaleContent(commission?.superCommissionDescription) }}
                                    </localized-link>
                                </div>
                                <div v-if="commission?.formalDescriptionOfRule">
                                    {{ $t("formalDescriptionOfRuleLabel") }}:
                                </div>
                                <div v-if="commission?.formalDescriptionOfRule" class="response">
                                    {{ commission.formalDescriptionOfRule }}
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
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
import type { LanguageTagResponse, MultilingualContent } from '@/models/Common';
import { onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { watch } from 'vue';
import LanguageService from '@/services/LanguageService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import type { Commission, CommissionResponse } from '@/models/AssessmentModel';
import CommissionService from '@/services/assessment/CommissionService';
import { localiseDate } from '@/i18n/dateLocalisation';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import CommissionForm from '@/components/assessment/commission/CommissionForm.vue';


export default defineComponent({
    name: "CommissionLandingPage",
    components: { LocalizedLink, GenericCrudModal },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();

        const commission = ref<CommissionResponse>();
        const languageTagMap = ref<Map<number, LanguageTagResponse>>(new Map());

        const i18n = useI18n();

        const icon = ref("mdi-account-group-outline");

        const router = useRouter();

        onMounted(() => {
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
            commission.value!.superCommissionId = basicInfo.superCommissionId as number;

            performUpdate(true);
        };

        const performUpdate = (reload: boolean) => {
            const updateRequest: Commission = {
                description: commission.value?.description as MultilingualContent[],
                assessmentDateFrom: commission.value?.assessmentDateFrom as string,
                assessmentDateTo: commission.value?.assessmentDateTo as string,
                superCommissionId: commission.value?.superCommissionId as number,
                formalDescriptionOfRule: commission.value?.formalDescriptionOfRule as string,
                documentIdsForAssessment: [],
                personIdsForAssessment: [],
                organisationUnitIdsForAssessment: []
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
            router.push({ name: "commissionLandingPage", params: {id: commissionId} }).then(() => {
                router.go(0);
            });
        };

        return {
            commission, icon, returnCurrentLocaleContent,
            updateBasicInfo, localiseDate, snackbarMessage,
            updateDescription, snackbar, navigateToTargetCommission,
            CommissionForm
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
