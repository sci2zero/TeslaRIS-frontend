<template>
    <div justify="start">
        <v-dialog v-model="dialog" persistent>
            <template #activator="scope">
                <v-btn
                    density="compact"
                    :disabled="disabled"
                    v-bind="scope.props"
                    v-on="scope.isActive">
                    {{ title() }}
                </v-btn>
            </template>
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ title() }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-tabs
                            v-model="currentTab"
                            color="deep-purple-accent-4"
                            align-tabs="start">
                            <v-tab value="assessments">
                                {{ $t("assessmentsLabel") }}
                            </v-tab>
                            <v-tab value="indicators">
                                {{ $t("indicatorListLabel") }}
                            </v-tab>
                        </v-tabs>

                        <v-tabs-window
                            v-model="currentTab">
                            <v-tabs-window-item value="assessments">
                                <entity-classification-view
                                    :entity-classifications="entityClassifications"
                                    :entity-id="entityId"
                                    can-edit
                                    :containing-entity-type="entityType"
                                    :applicable-types="[applicableType]"
                                    @create="createClassification"
                                    @update="fetchClassifications"
                                />
                            </v-tabs-window-item>
                            <v-tabs-window-item value="indicators">
                                <indicators-section 
                                    :indicators="entityIndicators" 
                                    :applicable-types="[applicableType === ApplicableEntityType.MONOGRAPH ? applicableType : entityType]" 
                                    :entity-id="entityId" 
                                    :entity-type="entityType"
                                    :can-edit="entityType !== ApplicableEntityType.PUBLICATION_SERIES"
                                    show-statistics 
                                    :has-attached-files="hasAttachedFiles"
                                    @create="createIndicator"
                                    @updated="fetchIndicators"
                                />
                            </v-tabs-window-item>
                        </v-tabs-window>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import type { DocumentAssessmentClassification, DocumentIndicator, EntityAssessmentClassification, EntityClassificationResponse, EntityIndicator, EntityIndicatorResponse, EventAssessmentClassification, EventIndicator, PublicationSeriesAssessmentClassification } from '@/models/AssessmentModel';
import { ApplicableEntityType } from '@/models/Common';
import EntityClassificationService from '@/services/assessment/EntityClassificationService';
import { defineComponent, type PropType, ref, watch } from 'vue';
import EntityClassificationView from './EntityClassificationView.vue';
import { useI18n } from 'vue-i18n';
import EntityIndicatorService from '@/services/assessment/EntityIndicatorService';
import IndicatorsSection from '../indicators/IndicatorsSection.vue';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import { useDocumentAssessmentActions } from '@/composables/useDocumentAssessmentActions';


export default defineComponent({
    name: "EntityClassificationModalContent",
    components: { EntityClassificationView, IndicatorsSection },
    props: {
        entityId: {
            type: Number,
            required: true
        },
        entityType: {
            type: Object as PropType<ApplicableEntityType>,
            required: true
        },
        applicableType: {
            type: Object as PropType<ApplicableEntityType>,
            required: true
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },
    emits: ["classified", "update"],
    setup(props, {emit}) {
        const currentTab = ref("assessments");

        const hasAttachedFiles = ref(false);

        const dialog = ref(false);
        const entityClassifications = ref<EntityClassificationResponse[]>([]);
        const entityIndicators = ref<EntityIndicatorResponse[]>([]);

        const i18n = useI18n();

        watch(dialog, () => {
            if (dialog.value) {
                fetchClassifications();
            }
        });

        const fetchClassifications = () => {
            switch (props.entityType) {
                case ApplicableEntityType.EVENT:
                    EntityClassificationService.fetchEventClassifications(props.entityId)
                    .then(response => {
                        entityClassifications.value = response.data;
                        emit("update", props.entityId);
                    });
                    break;
                case ApplicableEntityType.DOCUMENT:
                    EntityClassificationService.fetchDocumentClassifications(props.entityId)
                    .then(response => {
                        entityClassifications.value = response.data;
                        emit("update", props.entityId);
                    });
                    break;
                case ApplicableEntityType.PUBLICATION_SERIES:
                    EntityClassificationService.fetchPublicationSeriesClassifications(props.entityId)
                    .then(response => {
                        entityClassifications.value = response.data;
                        emit("update", props.entityId);
                    });
                    break;
            }
        };

        const fetchIndicators = () => {
            switch (props.entityType) {
                case ApplicableEntityType.EVENT:
                    EntityIndicatorService.fetchEventIndicators(props.entityId)
                    .then(response => {
                        entityIndicators.value = response.data;
                        emit("update", props.entityId);
                    });
                    break;
                case ApplicableEntityType.DOCUMENT:
                    EntityIndicatorService.fetchDocumentIndicators(props.entityId)
                    .then(response => {
                        entityIndicators.value = response.data;
                        emit("update", props.entityId);
                    });

                    DocumentPublicationService.readDocumentPublication(props.entityId).then(response => {
                        hasAttachedFiles.value = response.data.fileItems !== undefined && response.data.fileItems.length > 0;
                    });

                    break;
                case ApplicableEntityType.PUBLICATION_SERIES:
                    EntityIndicatorService.fetchPublicationSeriesIndicators(props.entityId)
                    .then(response => {
                        entityIndicators.value = response.data;
                        emit("update", props.entityId);
                    });
                    break;
            }
        };

        const createClassification = (entityClassification: EntityAssessmentClassification) => {
            switch (props.entityType) {
                case ApplicableEntityType.EVENT:
                    EntityClassificationService.createEventClassification(entityClassification as EventAssessmentClassification)
                    .then(() => {
                        fetchClassifications();
                        emit("classified", props.entityId);
                    });
                    break;
                case ApplicableEntityType.DOCUMENT:
                    EntityClassificationService.createDocumentClassification(entityClassification as DocumentAssessmentClassification)
                    .then(() => {
                        fetchClassifications();
                        emit("classified", props.entityId);
                    });
                    break;
                case ApplicableEntityType.PUBLICATION_SERIES:
                    EntityClassificationService.createPublicationSeriesClassification(entityClassification as PublicationSeriesAssessmentClassification)
                    .then(() => {
                        fetchClassifications();
                        emit("classified", props.entityId);
                    });
                    break;
            }
        };

        const { createDocumentIndicator } = useDocumentAssessmentActions();

        const createIndicator = (entityIndicator: {indicator: EntityIndicator, files: File[]}) => {
            switch (props.entityType) {
                case ApplicableEntityType.EVENT:
                    EntityIndicatorService.createEventIndicator(entityIndicator.indicator as EventIndicator).then((response) => {
                        EntityIndicatorService.uploadFilesAndFetchIndicators(entityIndicator.files, response.data.id).then(() => {
                            fetchIndicators();
                        });
                    });
                    break;
                case ApplicableEntityType.DOCUMENT:
                    createDocumentIndicator(entityIndicator as {indicator: DocumentIndicator, files: File[]}, () => fetchIndicators());
                    break;
                // case ApplicableEntityType.PUBLICATION_SERIES:
                //     EntityIndicatorService.createPublicationSeriesClassification(entityClassification as PublicationSeriesAssessmentClassification)
                //     .then(() => {
                //         fetchIndicators();
                //         emit("classified", props.entityId);
                //     });
                //     break;
            }
        };

        const title = () => {
            return (props.entityType === ApplicableEntityType.DOCUMENT) ? 
                i18n.t("assessmentsLabel") : i18n.t("classificationsLabel");
        };

        return {
            entityClassifications,
            ApplicableEntityType,
            fetchClassifications,
            createClassification,
            dialog, title, currentTab,
            fetchIndicators,
            entityIndicators,
            createIndicator,
            hasAttachedFiles
        };
    }
});
</script>
