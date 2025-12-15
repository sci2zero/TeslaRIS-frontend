<template>
    <v-row>
        <v-col cols="2">
            <date-picker
                v-model="startDate"
                :label="$t('startDateLabel') + '*'"
                color="primary"
                required
            />
        </v-col>
        <v-col cols="2">
            <date-picker
                v-model="endDate"
                :label="$t('endDateLabel') + '*'"
                color="primary"
                required
            />
        </v-col>
    </v-row>
    <v-row
        v-for="assessment in assessments"
        :key="assessment.commissionId"
        class="d-flex justify-center align-center">
        <v-col v-if="isLoading">
            <v-progress-circular
                color="primary"
                indeterminate
            ></v-progress-circular>
        </v-col>
        <v-col v-else>
            <h3 class="ml-4 mt-5">
                {{ $t("commissionLabel") }}: {{ returnCurrentLocaleContent(assessment.commissionDescription) }}
            </h3>
            <v-table v-if="Object.keys(assessment.publicationsPerCategory).length > 0">
                <thead>
                    <tr>
                        <th class="text-left">
                            {{ $t("markLabel") }}
                        </th>
                        <th class="text-left">
                            {{ loginStore.userLoggedIn ? $t("publicationsWithPointsLabel") : $t("publicationsLabel") }}
                        </th>
                        <th v-if="loginStore.userLoggedIn" class="text-left">
                            {{ $t("numberOfPublicationsLabel") }}
                        </th>
                        <th v-if="loginStore.userLoggedIn" class="text-left">
                            {{ $t("totalPointsLabel") }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="(publications, category) in assessment.publicationsPerCategory"
                        :key="category"
                    >
                        <td class="narrow">
                            {{ category }}
                        </td>
                        <td>
                            <ul>
                                <li v-for="(publication, index) in publications" :key="index">
                                    <localized-link :to="getDocumentLandingPageBasePathBasedOnAssessment(category) + publication.c">
                                        {{ publication.a }} 
                                        <b v-if="loginStore.userLoggedIn">→ {{ formatNumber(publication.b) }}</b>
                                    </localized-link>
                                </li>
                            </ul>
                        </td>
                        <td v-if="loginStore.userLoggedIn">
                            {{ publications.length }}
                        </td>
                        <td v-if="loginStore.userLoggedIn">
                            {{ formatNumber(calculatePointSum(assessment.commissionId, category)) }}
                        </td>
                    </tr>
                
                    <tr v-if="loginStore.userLoggedIn" class="totals-row">
                        <td class="narrow">
                            <strong>{{ $t("totalLabel") }}</strong>
                        </td>
                        <td></td>
                        <td><strong>{{ totalPublicationsCount }}</strong></td>
                        <td><strong>{{ formatNumber(totalPoints) }}</strong></td>
                    </tr>
                </tbody>
            </v-table>
            <p v-else class="ml-5">
                {{ $t("noAssessedPublicationsMessage") }}
            </p>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import type { ResearcherAssessmentResponse } from '@/models/AssessmentModel';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import { useLoginStore } from '@/stores/loginStore';
import DatePicker from '@/components/core/DatePicker.vue';
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import { getDocumentLandingPageBasePathBasedOnAssessment } from '@/utils/PathResolutionUtil';


export default defineComponent({
    name: "PersonAssessmentsView",
    components: { DatePicker, LocalizedLink },
    props: {
        assessments: {
            type: Array<ResearcherAssessmentResponse>,
            default: []
        },
        isLoading: {
            type: Boolean,
            required: true
        }
    },
    emits: ["fetch"],
    setup(props, {emit}) {
        const loginStore = useLoginStore();

        const startDate = ref<string>("1970-01-01");
        const endDate = ref<string>(((new Date()).toISOString()).split("T")[0]);

        const totalPublicationsCount = computed(() => {
            if (!props.assessments) {
                return 0;
            }
            
            return props.assessments.reduce((assessmentSum, assessment) => {
                const assessmentCount = Object.values(assessment.publicationsPerCategory || {})
                    .reduce((categorySum, publicationsArray) => {
                        return categorySum + publicationsArray.length;
                    }, 0);
                
                return assessmentSum + assessmentCount;
            }, 0);
        });

        const totalPoints = computed(() => {
            if (!props.assessments) {
                return 0;
            }
            
            return props.assessments.reduce((assessmentSum, assessment) => {
                const assessmentPoints = Object.values(assessment.publicationsPerCategory || {})
                    .reduce((categorySum, publicationsArray) => {
                        return categorySum + publicationsArray.reduce((pubSum, publication) => {
                            return pubSum + publication.b; 
                        }, 0);
                    }, 0);
                
                return assessmentSum + assessmentPoints;
            }, 0);
        });

        watch([startDate, endDate], () => {
            emit("fetch", startDate.value.split("T")[0], endDate.value.split("T")[0]);
        });

        const calculatePointSum = (commissionId: number, classificationGroupCode: string): number => {
            const publications = props.assessments
                .find(assessment => assessment.commissionId === commissionId);
            
            if (publications && publications.publicationsPerCategory) {
                return publications.publicationsPerCategory[classificationGroupCode]
                    .reduce(
                        (partialSum, publication) => partialSum + publication.b, 0
                    ) as number;
            }
            
            return 0;
        };

        const formatNumber = (num: number) => {
            const fixed = num.toFixed(2);
            return fixed.endsWith('.00') ? fixed.slice(0, -3) : fixed;
        };
        
        return {
            calculatePointSum, loginStore, formatNumber,
            returnCurrentLocaleContent, startDate, endDate,
            getDocumentLandingPageBasePathBasedOnAssessment,
            totalPublicationsCount, totalPoints
        };
    }
});
</script>

<style scoped>

.narrow {
    width: 200px;
}

</style>
