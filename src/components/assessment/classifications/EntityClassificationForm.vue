<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <v-select
                    v-model="selectedAssessmentClassification"
                    :items="assessmentClassifications"
                    :label="$t(entityType === ApplicableEntityType.DOCUMENT ? 'assessmentLabel' : 'classificationLabel') + '*'"
                    :rules="requiredSelectionRules"
                    return-object>
                </v-select>
            </v-col>
        </v-row>
        <v-row v-if="entityType === ApplicableEntityType.MONOGRAPH || entityType === ApplicableEntityType.MONOGRAPH_PUBLICATION">
            <v-col>
                <v-checkbox
                    v-model="showAllForEntityType"
                    :label="$t('showAllCategoriesLabel')"
                ></v-checkbox>
            </v-col>
        </v-row>
        <v-row v-if="entityType !== 'EVENT' && entityType !== 'DOCUMENT'">
            <v-col>
                <v-text-field
                    v-model="classificationYear"
                    type="number"
                    :label="$t('classificationYearLabel') + '*'"
                    :placeholder="$t('classificationYearLabel') + '*'"
                    :rules="requiredNumericFieldRules">
                </v-text-field>
            </v-col>
        </v-row>
        <v-row v-if="!isCommission && !isViceDeanForScience">
            <v-col>
                <commission-autocomplete-search
                    v-model="selectedCommission"
                    :read-only="presetClassification !== undefined"
                    required
                />
            </v-col>
        </v-row>

        <v-row>
            <p class="required-fields-message">
                {{ $t("requiredFieldsMessage") }}
            </p>
        </v-row>
    </v-form>
</template>

<script lang="ts">
import { defineComponent, watch, type PropType } from 'vue';
import { ref } from 'vue';
import { ApplicableEntityType } from '@/models/Common';
import { onMounted } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { EntityClassificationResponse, EntityAssessmentClassification, EventAssessmentClassification, PublicationSeriesAssessmentClassification, DocumentAssessmentClassification } from '@/models/AssessmentModel';
import CommissionAutocompleteSearch from '../commission/CommissionAutocompleteSearch.vue';
import AssessmentClassificationService from '@/services/assessment/AssessmentClassificationService';
import { useUserRole } from '@/composables/useUserRole';


export default defineComponent({
    name: "EntityClassificationForm",
    components: { CommissionAutocompleteSearch },
    props: {
        presetClassification: {
            type: Object as PropType<EntityClassificationResponse | undefined>,
            default: undefined
        },
        entityId: {
            type: Object as PropType<number | undefined>,
            required: true
        },
        entityType: {
            type: Object as PropType<ApplicableEntityType>,
            required: true
        },
        applicableTypes: {
            type: Array<ApplicableEntityType>,
            required: true
        }
    },
    emits: ["create"],
    setup(props, { emit }) {
        const isFormValid = ref(false);
        const showAllForEntityType = ref(false);

        const { isCommission, isViceDeanForScience } = useUserRole();

        onMounted(() => {
            fetchDetails();
            populateFields();
        });

        watch(showAllForEntityType, () => {
            fetchDetails();
        });

        const fetchDetails = () => {
            const applicableTypes = [...props.applicableTypes];

            if (showAllForEntityType.value) {
                applicableTypes.push(props.entityType);
            }

            AssessmentClassificationService.fetchAllAssessmentClassificationsForApplicableType(applicableTypes).then((response) => {
                assessmentClassifications.value.splice(0);
                response.data.forEach((classification) => {
                    assessmentClassifications.value.push({title: returnCurrentLocaleContent(classification.title) as string, value: classification.id as number});
                });
            });
        };

        watch(() => props.presetClassification, () => {
            populateFields();
        });

        const populateFields= () => {
            if (props.presetClassification) {
                selectedCommission.value = {title: returnCurrentLocaleContent(props.presetClassification.commissionDescription) as string, value: props.presetClassification.commissionId};
                selectedAssessmentClassification.value = {title: returnCurrentLocaleContent(props.presetClassification.classificationTitle) as string, value: props.presetClassification.classificationId};
                classificationYear.value = props.presetClassification.year;
            }
        };

        const searchPlaceholder = {title: "", value: -1};
        const selectedCommission = ref<{ title: string, value: number }>(searchPlaceholder);

        const assessmentClassifications = ref<{ title: string, value: number }[]>([]);
        const selectedAssessmentClassification = ref<{ title: string, value: number }>(searchPlaceholder);

        const classificationYear = ref<number>((new Date()).getFullYear());

        const { requiredSelectionRules, requiredNumericFieldRules } = useValidationUtils();

        const submit = () => {
            const entityClassification: EntityAssessmentClassification = {
                commissionId: selectedCommission.value.value,
                assessmentClassificationId: selectedAssessmentClassification.value.value,
                classificationYear: classificationYear.value ? classificationYear.value : 1000
            };

            if (props.entityType === ApplicableEntityType.EVENT) {
                (entityClassification as EventAssessmentClassification).eventId = props.entityId as number;
            } else if (props.entityType === ApplicableEntityType.PUBLICATION_SERIES) {
                (entityClassification as PublicationSeriesAssessmentClassification).publicationSeriesId = props.entityId as number;
            } else if (props.entityType === ApplicableEntityType.DOCUMENT) {
                (entityClassification as DocumentAssessmentClassification).documentId = props.entityId as number;
            }

            emit("create", entityClassification);
        };

        return {
            isFormValid, submit,
            selectedCommission,
            requiredSelectionRules,
            assessmentClassifications,
            selectedAssessmentClassification,
            requiredNumericFieldRules,
            classificationYear, isCommission,
            isViceDeanForScience,
            ApplicableEntityType,
            showAllForEntityType
        };
    }
});
</script>
