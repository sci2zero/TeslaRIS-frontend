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
                        <entity-classification-view
                            :entity-classifications="entityClassifications"
                            :entity-id="entityId"
                            can-edit
                            :containing-entity-type="entityType"
                            :applicable-types="[entityType]"
                            @create="createClassification"
                            @update="fetchClassifications"
                        />
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
import type { DocumentAssessmentClassification, EntityAssessmentClassification, EntityClassificationResponse, EventAssessmentClassification } from '@/models/AssessmentModel';
import { ApplicableEntityType } from '@/models/Common';
import EntityClassificationService from '@/services/assessment/EntityClassificationService';
import { defineComponent, onMounted, type PropType, ref } from 'vue';
import EntityClassificationView from './EntityClassificationView.vue';
import { useI18n } from 'vue-i18n';


export default defineComponent({
    name: "EntityClassificationModalContent",
    components: { EntityClassificationView },
    props: {
        entityId: {
            type: Number,
            required: true
        },
        entityType: {
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
        const dialog = ref(false);
        const entityClassifications = ref<EntityClassificationResponse[]>([]);

        const i18n = useI18n();

        onMounted(() => {
            fetchClassifications();
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
            dialog, title
        };
    }
});
</script>
