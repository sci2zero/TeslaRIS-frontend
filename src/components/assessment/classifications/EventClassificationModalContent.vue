<template>
    <div justify="start">
        <v-dialog v-model="dialog" persistent>
            <template #activator="scope">
                <v-btn
                    density="compact"
                    v-bind="scope.props"
                    v-on="scope.isActive">
                    {{ $t("classificationsLabel") }}
                </v-btn>
            </template>
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ $t("classificationsLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <entity-classification-view
                            :entity-classifications="eventClassifications"
                            :entity-id="eventId"
                            can-edit
                            :containing-entity-type="ApplicableEntityType.EVENT"
                            :applicable-types="[ApplicableEntityType.EVENT]"
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
import type { EntityClassificationResponse, EventAssessmentClassification } from '@/models/AssessmentModel';
import { ApplicableEntityType } from '@/models/Common';
import EntityClassificationService from '@/services/assessment/EntityClassificationService';
import { defineComponent, onMounted, ref } from 'vue';
import EntityClassificationView from './EntityClassificationView.vue';


export default defineComponent({
    name: "EventClassificationModalContent",
    components: { EntityClassificationView },
    props: {
        eventId: {
            type: Number,
            required: true
        }
    },
    emits: ["classified", "update"],
    setup(props, {emit}) {
        const dialog = ref(false);
        const eventClassifications = ref<EntityClassificationResponse[]>([]);

        onMounted(() => {
            fetchClassifications();
        });

        const fetchClassifications = () => {
            EntityClassificationService.fetchEventClassifications(props.eventId).then(response => {
                eventClassifications.value = response.data;
                emit("update", props.eventId);
            });
        };

        const createClassification = (eventClassification: EventAssessmentClassification) => {
            EntityClassificationService.createEventClassification(eventClassification).then(() => {
                fetchClassifications();
                emit("classified", props.eventId);
            });
        };

        return {
            eventClassifications,
            ApplicableEntityType,
            fetchClassifications,
            createClassification,
            dialog
        };
    }
});
</script>
